let MemoryHelper = require( 'memory-helper' ),
    genish       = require( 'genish.js' )
    
let Gibberish = {
  blockCallbacks: [], // called every block
  dirtyUgens: [],
  callbackUgens: [],
  callbackNames: [],
  graphIsDirty: false,
  ugens: {},
  debug: false,

  output: null,

  memory : null, // 20 minutes by default?
  factory: null, 
  genish,
  scheduler: require( './scheduling/scheduler.js' ),

  memoed: {},

  init( memAmount ) {
    let numBytes = memAmount === undefined ? 20 * 60 * 44100 : memAmount

    this.memory = MemoryHelper.create( numBytes )
    this.utilities = require( './utilities.js' )( this )

    this.load()
    
    this.output = this.Bus2()

    this.utilities.createContext()
    this.utilities.createScriptProcessor()

    // XXX FOR DEVELOPMENT AND TESTING ONLY... REMOVE FOR PRODUCTION
    this.export( window )
  },

  load() {
    this.factory = require( './ugenTemplate.js' )( this )

    this.PolyTemplate = require( './instruments/polytemplate.js' )( this )
    this.oscillators  = require( './oscillators/oscillators.js' )( this )
    this.binops       = require( './misc/binops.js' )( this )
    this.Bus          = require( './misc/bus.js' )( this )
    this.Bus2         = require( './misc/bus2.js' )( this );
    this.instruments  = require( './instruments/instruments.js' )( this )
    this.fx           = require( './fx/effects.js' )( this )
    this.sequencer    = require( './scheduling/sequencer.js' )( this );
  },

  export( target ) {
    //this.genish.export( target )
    this.instruments.export( target )
    this.fx.export( target )
    this.oscillators.export( target )
    this.binops.export( target )
    target.Sequencer = this.sequencer
    target.Bus = this.Bus
    target.Bus2 = this.Bus2
  },

  print() {
    console.log( this.callback.toString() )
  },

  dirty( ugen ) {
    this.dirtyUgens.push( ugen )
    this.graphIsDirty = true
    if( this.memoed[ ugen.ugenName ] ) {
      delete this.memoed[ ugen.ugenName ]
    } 
  },

  clear() {
    this.output.inputs = [0]
    this.output.inputNames.length = 0
    this.dirty( this.output )
  },

  generateCallback() {
    let uid = 0,
        callbackBody, lastLine

    this.memoed = {}

    callbackBody = this.processGraph( this.output )
    lastLine = callbackBody[ callbackBody.length - 1]
    
    callbackBody.push( '\n\treturn ' + lastLine.split( '=' )[0].split( ' ' )[1] )

    if( this.debug ) console.log( 'callback:\n', callbackBody.join('\n') )
    this.callback = Function( ...this.callbackNames, callbackBody.join( '\n' ) )
    this.callback.out = []

    return this.callback 
  },

  processGraph( output ) {
    this.callbackUgens.length = 0
    this.callbackNames.length = 0

    this.callbackUgens.push( output.callback )

    let body = this.processUgen( output )
    this.callbackNames = this.callbackUgens.map( v => v.ugenName )

    this.dirtyUgens.length = 0
    this.graphIsDirty = false

    return body
  },

  processUgen( ugen, block ) {
    if( block === undefined ) block = []

    let dirtyIdx = Gibberish.dirtyUgens.indexOf( ugen )

    let memo = Gibberish.memoed[ ugen.ugenName ]

    if( memo !== undefined ) {
      return memo 
    } else if( ugen.block === undefined || dirtyIndex !== -1 ) {
  
      let line = `\tvar v_${ugen.id} = ` 
      
      if( !ugen.binop ) line += `${ugen.ugenName}( `

      // must get array so we can keep track of length for comma insertion
      let keys = ugen.binop || ugen.type === 'bus' ? Object.keys( ugen.inputs ) : Object.keys( ugen.inputNames )
      
      for( let i = 0; i < keys.length; i++ ) {
        let key = keys[ i ]
        // binop.inputs is actual values, not just property names
        let input = ugen.binop || ugen.type ==='bus'  ? ugen.inputs[ key ] : ugen[ ugen.inputNames[ key ] ]

        if( typeof input === 'number' ) {
          line += input
        }else{
          if( input === undefined ) { console.log( key ); continue; }
          Gibberish.processUgen( input, block )

          if( !input.binop ) Gibberish.callbackUgens.push( input.callback )

          line += `v_${input.id}`
        }

        if( i < keys.length - 1 ) {
          line += ugen.binop ? ' ' + ugen.op + ' ' : ', ' 
        }
      }

      line += ugen.binop ? '' : ' )'

      block.push( line )

      Gibberish.memoed[ ugen.ugenName ] = `v_${ugen.id}`

      if( dirtyIdx !== -1 ) {
        Gibberish.dirtyUgens.splice( dirtyIdx, 1 )
      }

    }else if( ugen.block ) {
      return ugen.block
    }

    return block
  },
    
}

module.exports = Gibberish

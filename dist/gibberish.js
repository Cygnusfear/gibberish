(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Gibberish = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let analyzer = Object.create( ugen )

Object.assign( analyzer, {
  __type__: 'analyzer',
})

module.exports = analyzer

},{"../ugen.js":55}],2:[function(require,module,exports){
let g = require( 'genish.js' ),
    analyzer = require( './analyzer.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let ssd = Object.create( analyzer )
  ssd.in  = Object.create( ugen )
  ssd.out = Object.create( ugen )

  ssd.id = Gibberish.factory.getUID()

  let props = Object.assign({}, inputProps )
  let isStereo = false//props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' )
    
  let historyL = g.history()

  if( isStereo ) {
    // right channel
    let historyR = g.history()

    Gibberish.factory( 
      ssd.out,
      [ historyL.out, historyR.out ], 
      'ssd_out', 
      props 
    )

    ssd.out.callback.ugenName = ssd.out.ugenName = 'ssd_out_' + ssd.id

    const idxL = ssd.out.graph.memory.value.idx, 
          idxR = idxL + 1,
          memory = Gibberish.genish.gen.memory.heap

    const callback = function( input ) {
      'use strict'
      memory[ idxL ] = input[0]
      memory[ idxR ] = input[1]
      return 0     
    }
    
    Gibberish.factory( ssd.in, [ input[0],input[1] ], 'ssd_in', props, callback )

    callback.ugenName = ssd.in.ugenName = 'ssd_in_' + ssd.id
    ssd.in.inputNames = [ 'input' ]
    ssd.in.inputs = [ props.input ]
    ssd.in.input = props.input
    ssd.type = 'analysis'

    ssd.in.listen = function( ugen ) {
      if( ugen !== undefined ) {
        ssd.in.input = ugen
        ssd.in.inputs = [ ugen ]
      }

      if( Gibberish.analyzers.indexOf( ssd.in ) === -1 ) {
        Gibberish.analyzers.push( ssd.in )
      }

      Gibberish.dirty( Gibberish.analyzers )
    }
  }else{
    Gibberish.factory( ssd.out, historyL.out, 'ssd_out', props )

    ssd.out.callback.ugenName = ssd.out.ugenName = 'ssd_out_' + ssd.id

    let idx = ssd.out.graph.memory.value.idx 
    let memory = Gibberish.genish.gen.memory.heap
    let phase = 0
    let callback = function( input ) {
      'use strict'
      memory[ idx ] = input
      return 0     
    }
    
    Gibberish.factory( ssd.in, input, 'ssd_in', props, callback )

    callback.ugenName = ssd.in.ugenName = 'ssd_in_' + ssd.id
    ssd.in.inputNames = [ 'input' ]
    ssd.in.inputs = [ props.input ]
    ssd.in.input = props.input
    ssd.type = 'analysis'

    ssd.in.listen = function( ugen ) {
      if( ugen !== undefined ) {
        ssd.in.input = ugen
        ssd.in.inputs = [ ugen ]
      }

      if( Gibberish.analyzers.indexOf( ssd.in ) === -1 ) {
        Gibberish.analyzers.push( ssd.in )
      }

      Gibberish.dirty( Gibberish.analyzers )
    }

  }
  
  return ssd
}

Delay.defaults = {
  input:0,
}

return Delay

}

},{"../ugen.js":55,"./analyzer.js":1,"genish.js":94}],3:[function(require,module,exports){
let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let AD = function( argumentProps ) {
    let ad = Object.create( ugen ),
        attack  = g.in( 'attack' ),
        decay   = g.in( 'decay' )

    let props = Object.assign( {}, AD.defaults, argumentProps )

    let graph = g.ad( attack, decay )

    Gibberish.factory( ad, graph, 'ad', props )

    ad.trigger = graph.trigger

    return ad
  }

  AD.defaults = { attack:44100, decay:44100 } 

  return AD

}

},{"../ugen.js":55,"genish.js":94}],4:[function(require,module,exports){
let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let ADSR = function( argumentProps ) {
    let adsr  = Object.create( ugen ),
        attack  = g.in( 'attack' ),
        decay   = g.in( 'decay' ),
        sustain = g.in( 'sustain' ),
        release = g.in( 'release' ),
        sustainLevel = g.in( 'sustainLevel' )

    let props = Object.assign( {}, ADSR.defaults, argumentProps )

    let graph = g.adsr( attack, decay, sustain, sustainLevel, release, { triggerRelease: props.triggerRelease } )

    Gibberish.factory( adsr, graph, 'adsr', props )

    adsr.trigger = graph.trigger
    adsr.advance = graph.release

    return adsr
  }

  ADSR.defaults = { attack:22050, decay:22050, sustain:44100, sustainLevel:.6, release: 44100, triggerRelease:false } 

  return ADSR
}

},{"../ugen.js":55,"genish.js":94}],5:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const Envelopes = {
    AD     : require( './ad.js' )( Gibberish ),
    ADSR   : require( './adsr.js' )( Gibberish ),
    Ramp   : require( './ramp.js' )( Gibberish ),

    export : target => {
      for( let key in Envelopes ) {
        if( key !== 'export' ) {
          target[ key ] = Envelopes[ key ]
        }
      }
    }
  } 

  return Envelopes
}

},{"./ad.js":3,"./adsr.js":4,"./ramp.js":6}],6:[function(require,module,exports){
const ugen = require( '../ugen.js' ),
      g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  const Ramp = function( argumentProps ) {
    const ramp   = Object.create( ugen ),
          length = g.in( 'length' ),
          from   = g.in( 'from' ),
          to     = g.in( 'to' )

    const props = Object.assign({}, Ramp.defaults, argumentProps )

    const reset = g.bang()

    const phase = g.accum( g.div( 1, length ), reset, { shouldWrap:props.shouldLoop, shouldClamp:true }),
          diff = g.sub( to, from ),
          graph = g.add( from, g.mul( phase, diff ) )

    Gibberish.factory( ramp, graph, 'ramp', props )

    ramp.trigger = reset.trigger

    return ramp
  }

  Ramp.defaults = { from:0, to:1, length:g.gen.samplerate, shouldLoop:false }

  return Ramp

}

},{"../ugen.js":55,"genish.js":94}],7:[function(require,module,exports){
/*
 * https://github.com/antimatter15/heapqueue.js/blob/master/heapqueue.js
 *
 * This implementation is very loosely based off js-priority-queue
 * by Adam Hooper from https://github.com/adamhooper/js-priority-queue
 *
 * The js-priority-queue implementation seemed a teensy bit bloated
 * with its require.js dependency and multiple storage strategies
 * when all but one were strongly discouraged. So here is a kind of
 * condensed version of the functionality with only the features that
 * I particularly needed.
 *
 * Using it is pretty simple, you just create an instance of HeapQueue
 * while optionally specifying a comparator as the argument:
 *
 * var heapq = new HeapQueue();
 *
 * var customq = new HeapQueue(function(a, b){
 *   // if b > a, return negative
 *   // means that it spits out the smallest item first
 *   return a - b;
 * });
 *
 * Note that in this case, the default comparator is identical to
 * the comparator which is used explicitly in the second queue.
 *
 * Once you've initialized the heapqueue, you can plop some new
 * elements into the queue with the push method (vaguely reminiscent
 * of typical javascript arays)
 *
 * heapq.push(42);
 * heapq.push("kitten");
 *
 * The push method returns the new number of elements of the queue.
 *
 * You can push anything you'd like onto the queue, so long as your
 * comparator function is capable of handling it. The default
 * comparator is really stupid so it won't be able to handle anything
 * other than an number by default.
 *
 * You can preview the smallest item by using peek.
 *
 * heapq.push(-9999);
 * heapq.peek(); // ==> -9999
 *
 * The useful complement to to the push method is the pop method,
 * which returns the smallest item and then removes it from the
 * queue.
 *
 * heapq.push(1);
 * heapq.push(2);
 * heapq.push(3);
 * heapq.pop(); // ==> 1
 * heapq.pop(); // ==> 2
 * heapq.pop(); // ==> 3
 */
let HeapQueue = function(cmp){
  this.cmp = (cmp || function(a, b){ return a - b; });
  this.length = 0;
  this.data = [];
}
HeapQueue.prototype.peek = function(){
  return this.data[0];
};
HeapQueue.prototype.push = function(value){
  this.data.push(value);

  var pos = this.data.length - 1,
  parent, x;

  while(pos > 0){
    parent = (pos - 1) >>> 1;
    if(this.cmp(this.data[pos], this.data[parent]) < 0){
      x = this.data[parent];
      this.data[parent] = this.data[pos];
      this.data[pos] = x;
      pos = parent;
    }else break;
  }
  return this.length++;
};
HeapQueue.prototype.pop = function(){
  var last_val = this.data.pop(),
  ret = this.data[0];
  if(this.data.length > 0){
    this.data[0] = last_val;
    var pos = 0,
    last = this.data.length - 1,
    left, right, minIndex, x;
    while(1){
      left = (pos << 1) + 1;
      right = left + 1;
      minIndex = pos;
      if(left <= last && this.cmp(this.data[left], this.data[minIndex]) < 0) minIndex = left;
      if(right <= last && this.cmp(this.data[right], this.data[minIndex]) < 0) minIndex = right;
      if(minIndex !== pos){
        x = this.data[minIndex];
        this.data[minIndex] = this.data[pos];
        this.data[pos] = x;
        pos = minIndex;
      }else break;
    }
  } else {
    ret = last_val;
  }
  this.length--;
  return ret;
};

module.exports = HeapQueue

},{}],8:[function(require,module,exports){
let g = require( 'genish.js' )
 
// constructor for schroeder allpass filters
let allPass = function( _input, length=500, feedback=.5 ) {
  let index  = g.counter( 1,0,length ),
      buffer = g.data( length ),
      bufferSample = g.peek( buffer, index, { interp:'none', mode:'samples' }),
      out = g.memo( g.add( g.mul( -1, _input), bufferSample ) )
                
  g.poke( buffer, g.add( _input, g.mul( bufferSample, feedback ) ), index )
 
  return out
}

module.exports = allPass

},{"genish.js":94}],9:[function(require,module,exports){
let g = require( 'genish.js' ),
    filter = require( './filter.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.biquad = ( input, cutoff, _Q, mode, isStereo ) => {
    let a0,a1,a2,c,b1,b2,
        in1a0,x1a1,x2a2,y1b1,y2b2,
        in1a0_1,x1a1_1,x2a2_1,y1b1_1,y2b2_1

    let returnValue
    
    const Q = g.memo( g.add( .5, g.mul( _Q, 22 ) ) )
    let x1 = g.history(), x2 = g.history(), y1 = g.history(), y2 = g.history()
    
    let w0 = g.memo( g.mul( 2 * Math.PI, g.div( cutoff,  g.gen.samplerate ) ) ),
        sinw0 = g.sin( w0 ),
        cosw0 = g.cos( w0 ),
        alpha = g.memo( g.div( sinw0, g.mul( 2, Q ) ) )

    let oneMinusCosW = g.sub( 1, cosw0 )

    switch( mode ) {
      case 1:
        a0 = g.memo( g.div( g.add( 1, cosw0) , 2) )
        a1 = g.mul( g.add( 1, cosw0 ), -1 )
        a2 = a0
        c  = g.add( 1, alpha )
        b1 = g.mul( -2 , cosw0 )
        b2 = g.sub( 1, alpha )
        break;
      case 2:
        a0 = g.mul( Q, alpha )
        a1 = 0
        a2 = g.mul( a0, -1 )
        c  = g.add( 1, alpha )
        b1 = g.mul( -2 , cosw0 )
        b2 = g.sub( 1, alpha )
        break;
      default: // LP
        a0 = g.memo( g.div( oneMinusCosW, 2) )
        a1 = oneMinusCosW
        a2 = a0
        c  = g.add( 1, alpha )
        b1 = g.mul( -2 , cosw0 )
        b2 = g.sub( 1, alpha )
    }

    a0 = g.div( a0, c ); a1 = g.div( a1, c ); a2 = g.div( a2, c )
    b1 = g.div( b1, c ); b2 = g.div( b2, c )

    in1a0 = g.mul( x1.in( isStereo ? input[0] : input ), a0 )
    x1a1  = g.mul( x2.in( x1.out ), a1 )
    x2a2  = g.mul( x2.out,          a2 )

    let sumLeft = g.add( in1a0, x1a1, x2a2 )

    y1b1 = g.mul( y2.in( y1.out ), b1 )
    y2b2 = g.mul( y2.out, b2 )

    let sumRight = g.add( y1b1, y2b2 )

    let diff = g.sub( sumLeft, sumRight )

    y1.in( diff )

    if( isStereo ) {
      let x1_1 = g.history(), x2_1 = g.history(), y1_1 = g.history(), y2_1 = g.history()

      in1a0_1 = g.mul( x1_1.in( input[1] ), a0 )
      x1a1_1  = g.mul( x2_1.in( x1_1.out ), a1 )
      x2a2_1  = g.mul( x2_1.out,            a2 )

      let sumLeft_1 = g.add( in1a0_1, x1a1_1, x2a2_1 )

      y1b1_1 = g.mul( y2_1.in( y1_1.out ), b1 )
      y2b2_1 = g.mul( y2_1.out, b2 )

      let sumRight_1 = g.add( y1b1_1, y2b2_1 )

      let diff_1 = g.sub( sumLeft_1, sumRight_1 )

      y1_1.in( diff_1 )
      
      returnValue = [ diff, diff_1 ]
    }else{
      returnValue = diff
    }

    return returnValue
  }

  let Biquad = inputProps => {
    let biquad = Object.create( filter )
    Object.assign( biquad, Biquad.defaults, inputProps ) 

    let isStereo = biquad.input.isStereo

    biquad.__createGraph = function() {
      biquad.graph = Gibberish.genish.biquad( g.in('input'), g.mul( g.in('cutoff'), g.gen.samplerate / 4 ),  g.in('Q'), biquad.mode, isStereo )
    }

    biquad.__createGraph()
    biquad.__requiresRecompilation = [ 'mode' ]

    Gibberish.factory(
      biquad,
      biquad.graph,
      'biquad', 
      biquad
    )

    return biquad
  }

  Biquad.defaults = {
    input:0,
    Q: .15,
    cutoff:.05,
    mode:0
  }

  return Biquad

}


},{"./filter.js":12,"genish.js":94}],10:[function(require,module,exports){
let g = require( 'genish.js' )

let combFilter = function( _input, combLength, damping=.5*.4, feedbackCoeff=.84 ) {
  let lastSample   = g.history(),
  	  readWriteIdx = g.counter( 1,0,combLength ),
      combBuffer   = g.data( combLength ),
	    out          = g.peek( combBuffer, readWriteIdx, { interp:'none', mode:'samples' }),
      storeInput   = g.memo( g.add( g.mul( out, g.sub( 1, damping)), g.mul( lastSample.out, damping ) ) )
      
  lastSample.in( storeInput )
 
  g.poke( combBuffer, g.add( _input, g.mul( storeInput, feedbackCoeff ) ), readWriteIdx )
 
  return out
}

module.exports = combFilter

},{"genish.js":94}],11:[function(require,module,exports){
const g = require( 'genish.js' ),
      filter = require( './filter.js' )

module.exports = function( Gibberish ) {
  Gibberish.genish.diodeZDF = ( input, _Q, freq, saturation, isStereo=false ) => {
    const iT = 1 / g.gen.samplerate,
          kz1 = g.history(0),
          kz2 = g.history(0),
          kz3 = g.history(0),
          kz4 = g.history(0)

    let   ka1 = 1.0,
          ka2 = 0.5,
          ka3 = 0.5,
          ka4 = 0.5,
          kindx = 0   

    const Q = g.memo( g.add( .5, g.mul( _Q, 11 ) ) )
    // kwd = 2 * $M_PI * acf[kindx]
    const kwd = g.memo( g.mul( Math.PI * 2, freq ) )

    // kwa = (2/iT) * tan(kwd * iT/2) 
    const kwa =g.memo( g.mul( 2/iT, g.tan( g.mul( kwd, iT/2 ) ) ) )

    // kG  = kwa * iT/2 
    const kg = g.memo( g.mul( kwa, iT/2 ) )
    
    const kG4 = g.memo( g.mul( .5, g.div( kg, g.add( 1, kg ) ) ) )
    const kG3 = g.memo( g.mul( .5, g.div( kg, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG4 ) ) ) ) )
    const kG2 = g.memo( g.mul( .5, g.div( kg, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG3 ) ) ) ) )
    const kG1 = g.memo( g.div( kg, g.sub( g.add( 1, kg ), g.mul( kg, kG2 ) ) ) )

    const kGAMMA = g.memo( g.mul( g.mul( kG4, kG3 ) , g.mul( kG2, kG1 ) ) )

    const kSG1 = g.memo( g.mul( g.mul( kG4, kG3 ), kG2 ) ) 

    const kSG2 = g.memo( g.mul( kG4, kG3) )  
    const kSG3 = kG4 
    let kSG4 = 1.0 
    // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
    const kalpha = g.memo( g.div( kg, g.add(1.0, kg) ) )

    const kbeta1 = g.memo( g.div( 1.0, g.sub( g.add( 1, kg ), g.mul( kg, kG2 ) ) ) )
    const kbeta2 = g.memo( g.div( 1.0, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG3 ) ) ) )
    const kbeta3 = g.memo( g.div( 1.0, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG4 ) ) ) )
    const kbeta4 = g.memo( g.div( 1.0, g.add( 1, kg ) ) ) 

    const kgamma1 = g.memo( g.add( 1, g.mul( kG1, kG2 ) ) )
    const kgamma2 = g.memo( g.add( 1, g.mul( kG2, kG3 ) ) )
    const kgamma3 = g.memo( g.add( 1, g.mul( kG3, kG4 ) ) )

    const kdelta1 = kg
    const kdelta2 = g.memo( g.mul( 0.5, kg ) )
    const kdelta3 = g.memo( g.mul( 0.5, kg ) )

    const kepsilon1 = kG2
    const kepsilon2 = kG3
    const kepsilon3 = kG4

    const klastcut = freq

    //;; feedback inputs 
    const kfb4 = g.memo( g.mul( kbeta4 , kz4.out ) ) 
    const kfb3 = g.memo( g.mul( kbeta3, g.add( kz3.out, g.mul( kfb4, kdelta3 ) ) ) )
    const kfb2 = g.memo( g.mul( kbeta2, g.add( kz2.out, g.mul( kfb3, kdelta2 ) ) ) )

    //;; feedback process

    const kfbo1 = g.memo( g.mul( kbeta1, g.add( kz1.out, g.mul( kfb2, kdelta1 ) ) ) ) 
    const kfbo2 = g.memo( g.mul( kbeta2, g.add( kz2.out, g.mul( kfb3, kdelta2 ) ) ) ) 
    const kfbo3 = g.memo( g.mul( kbeta3, g.add( kz3.out, g.mul( kfb4, kdelta3 ) ) ) ) 
    const kfbo4 = kfb4

    const kSIGMA = g.memo( 
      g.add( 
        g.add( 
          g.mul( kSG1, kfbo1 ), 
          g.mul( kSG2, kfbo2 )
        ), 
        g.add(
          g.mul( kSG3, kfbo3 ), 
          g.mul( kSG4, kfbo4 )
        ) 
      ) 
    )

    //const kSIGMA = 1
    //;; non-linear processing
    //if (knlp == 1) then
    //  kin = (1.0 / tanh(ksaturation)) * tanh(ksaturation * kin)
    //elseif (knlp == 2) then
    //  kin = tanh(ksaturation * kin) 
    //endif
    //
    //const kin = input 
    let kin = input//g.memo( g.mul( g.div( 1, g.tanh( saturation ) ), g.tanh( g.mul( saturation, input ) ) ) )
    kin = g.tanh( g.mul( saturation, kin ) )

    const kun = g.div( g.sub( kin, g.mul( Q, kSIGMA ) ), g.add( 1, g.mul( Q, kGAMMA ) ) )
    //const kun = g.div( 1, g.add( 1, g.mul( Q, kGAMMA ) ) )
        //(kin - kk * kSIGMA) / (1.0 + kk * kGAMMA)

    //;; 1st stage
    let kxin = g.memo( g.add( g.add( g.mul( kun, kgamma1 ), kfb2), g.mul( kepsilon1, kfbo1 ) ) )
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    let kv = g.memo( g.mul( g.sub( g.mul( ka1, kxin ), kz1.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    let klp = g.add( kv, kz1.out )
    //klp = kv + kz1
    kz1.in( g.add( klp, kv ) ) 
    //kz1 = klp + kv

        //;; 2nd stage
    //kxin = (klp * kgamma2 + kfb3 + kepsilon2 * kfbo2)
    //kv = (ka2 * kxin - kz2) * kalpha 
    //klp = kv + kz2
    //kz2 = klp + kv

    kxin = g.memo( g.add( g.add( g.mul( klp, kgamma2 ), kfb3), g.mul( kepsilon2, kfbo2 ) ) )
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo( g.mul( g.sub( g.mul( ka2, kxin ), kz2.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add( kv, kz2.out ) 
    //klp = kv + kz1
    kz2.in( g.add( klp, kv ) ) 
    //kz1 = klp + kv

    //;; 3rd stage
    //kxin = (klp * kgamma3 + kfb4 + kepsilon3 * kfbo3)
    //kv = (ka3 * kxin - kz3) * kalpha 
    //klp = kv + kz3
    //kz3 = klp + kv

    kxin = g.memo( g.add( g.add( g.mul( klp, kgamma3 ), kfb4), g.mul( kepsilon3, kfbo3 ) ) )
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo( g.mul( g.sub( g.mul( ka3, kxin ), kz3.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add( kv, kz3.out )
    //klp = kv + kz1
    kz3.in( g.add( klp, kv ) )
    //kz1 = klp + kv

    //;; 4th stage
    //kv = (ka4 * klp - kz4) * kalpha 
    //klp = kv + kz4
    //kz4 = klp + kv

    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo( g.mul( g.sub( g.mul( ka4, kxin ), kz4.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add( kv, kz4.out )
    //klp = kv + kz1
    kz4.in( g.add( klp, kv ) )

    //kz1 = klp + kv
    if( isStereo ) {
      //let polesR = g.data([ 0,0,0,0 ], 1, { meta:true }),
      //    rezzR = g.clamp( g.mul( polesR[3], rez ) ),
      //    outputR = g.sub( input[1], rezzR )         

      //polesR[0] = g.add( polesR[0], g.mul( g.add( g.mul(-1, polesR[0] ), outputR   ), cutoff ))
      //polesR[1] = g.add( polesR[1], g.mul( g.add( g.mul(-1, polesR[1] ), polesR[0] ), cutoff ))
      //polesR[2] = g.add( polesR[2], g.mul( g.add( g.mul(-1, polesR[2] ), polesR[1] ), cutoff ))
      //polesR[3] = g.add( polesR[3], g.mul( g.add( g.mul(-1, polesR[3] ), polesR[2] ), cutoff ))

      //let right = g.switch( isLowPass, polesR[3], g.sub( outputR, polesR[3] ) )

      //returnValue = [left, right]
    }else{
     // returnValue = klp
    }
    returnValue = klp
    
    return returnValue// klp//returnValue
 }

  const DiodeZDF = inputProps => {
    const zdf      = Object.create( filter )
    const props    = Object.assign( {}, DiodeZDF.defaults, inputProps )
    const isStereo = props.input.isStereo 

    Gibberish.factory(
      zdf, 
      Gibberish.genish.diodeZDF( g.in('input'), g.in('Q'), g.in('cutoff'), g.in('saturation'), isStereo ), 
      'diodeZDF',
      props
    )

    return zdf
  }

  DiodeZDF.defaults = {
    input:0,
    Q: 5,
    saturation: 1,
    cutoff: 440,
  }

  return DiodeZDF

}

},{"./filter.js":12,"genish.js":94}],12:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let filter = Object.create( ugen )

Object.assign( filter, {

})

module.exports = filter

},{"../ugen.js":55}],13:[function(require,module,exports){
let g = require( 'genish.js' ),
    filter = require( './filter.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.filter24 = ( input, _rez, _cutoff, isLowPass, isStereo=false ) => {
    let returnValue,
        polesL = g.data([ 0,0,0,0 ], 1, { meta:true }),
        peekProps = { interp:'none', mode:'simple' },
        rez = g.memo( g.mul( _rez, 5 ) ),
        cutoff = g.memo( g.div( _cutoff, 11025 ) ),
        rezzL = g.clamp( g.mul( polesL[3], rez ) ),
        outputL = g.sub( isStereo ? input[0] : input, rezzL ) 

    polesL[0] = g.add( polesL[0], g.mul( g.add( g.mul(-1, polesL[0] ), outputL   ), cutoff ))
    polesL[1] = g.add( polesL[1], g.mul( g.add( g.mul(-1, polesL[1] ), polesL[0] ), cutoff ))
    polesL[2] = g.add( polesL[2], g.mul( g.add( g.mul(-1, polesL[2] ), polesL[1] ), cutoff ))
    polesL[3] = g.add( polesL[3], g.mul( g.add( g.mul(-1, polesL[3] ), polesL[2] ), cutoff ))
    
    let left = g.switch( isLowPass, polesL[3], g.sub( outputL, polesL[3] ) )

    if( isStereo ) {
      let polesR = g.data([ 0,0,0,0 ], 1, { meta:true }),
          rezzR = g.clamp( g.mul( polesR[3], rez ) ),
          outputR = g.sub( input[1], rezzR )         

      polesR[0] = g.add( polesR[0], g.mul( g.add( g.mul(-1, polesR[0] ), outputR   ), cutoff ))
      polesR[1] = g.add( polesR[1], g.mul( g.add( g.mul(-1, polesR[1] ), polesR[0] ), cutoff ))
      polesR[2] = g.add( polesR[2], g.mul( g.add( g.mul(-1, polesR[2] ), polesR[1] ), cutoff ))
      polesR[3] = g.add( polesR[3], g.mul( g.add( g.mul(-1, polesR[3] ), polesR[2] ), cutoff ))

      let right = g.switch( isLowPass, polesR[3], g.sub( outputR, polesR[3] ) )

      returnValue = [left, right]
    }else{
      returnValue = left
    }

    return returnValue
  }

  let Filter24 = inputProps => {
    let filter24   = Object.create( filter )
    let props    = Object.assign( {}, Filter24.defaults, inputProps )
    let isStereo = props.input.isStereo 

    Gibberish.factory(
      filter24, 
      Gibberish.genish.filter24( g.in('input'), g.in('Q'), g.in('cutoff'), g.in('isLowPass'), isStereo ), 
      'filter24',
      props
    )

    return filter24
  }


  Filter24.defaults = {
    input:0,
    Q: .25,
    cutoff: 880,
    isLowPass:1
  }

  return Filter24

}


},{"./filter.js":12,"genish.js":94}],14:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const g = Gibberish.genish

  const filters = {
    Filter24Classic : require( './filter24.js'  )( Gibberish ),
    Filter24Moog    : require( './ladderFilterZeroDelay.js' )( Gibberish ),
    Filter24TB303   : require( './diodeFilterZDF.js' )( Gibberish ),
    Filter12Biquad  : require( './biquad.js'    )( Gibberish ),
    Filter12SVF     : require( './svf.js'       )( Gibberish ),
    
    // not for use by end-users
    genish: {
      Comb        : require( './combfilter.js' ),
      AllPass     : require( './allpass.js' )
    },

    factory( input, cutoff, resonance, saturation = null, _props, isStereo = false ) {
      let filteredOsc 

      //if( props.filterType === 1 ) {
      //  if( typeof props.cutoff !== 'object' && props.cutoff > 1 ) {
      //    props.cutoff = .25
      //  }
      //  if( typeof props.cutoff !== 'object' && props.filterMult > .5 ) {
      //    props.filterMult = .1
      //  }
      //}
      let props = Object.assign({}, filters.defaults, _props )

      switch( props.filterType ) {
        case 1:
          isLowPass = g.param( 'lowPass', 1 ),
          filteredOsc = g.filter24( input, g.in('Q'), cutoff, props.filterMode, isStereo )
          break;
        case 2:
          filteredOsc = g.zd24( input, g.in('Q'), cutoff )
          break;
        case 3:
          filteredOsc = g.diodeZDF( input, g.in('Q'), cutoff, g.in('saturation'), isStereo ) 
          break;
        case 4:
          filteredOsc = g.svf( input, cutoff, g.sub( 1, g.in('Q')), props.filterMode, isStereo ) 
          break; 
        case 5:
          filteredOsc = g.biquad( input, cutoff,  g.in('Q'), props.filterMode, isStereo ) 
          break; 
        default:
          // return unfiltered signal
          filteredOsc = input //g.filter24( oscWithGain, g.in('resonance'), cutoff, isLowPass )
          break;
      }

      return filteredOsc
    },

    defaults: { filterMode: 0, filterType:0 }
  }

  filters.export = target => {
    for( let key in filters ) {
      if( key !== 'export' && key !== 'genish' ) {
        target[ key ] = filters[ key ]
      }
    }
  }

return filters

}

},{"./allpass.js":8,"./biquad.js":9,"./combfilter.js":10,"./diodeFilterZDF.js":11,"./filter24.js":13,"./ladderFilterZeroDelay.js":15,"./svf.js":16}],15:[function(require,module,exports){
const g = require( 'genish.js' ),
      filter = require( './filter.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.zd24 = ( input, _Q, freq, isStereo=false ) => {
    const iT = 1 / g.gen.samplerate,
          z1 = g.history(0),
          z2 = g.history(0),
          z3 = g.history(0),
          z4 = g.history(0)
    
    const Q = g.memo( g.add( .5, g.mul( _Q, 23 ) ) )
    // kwd = 2 * $M_PI * acf[kindx]
    const kwd = g.memo( g.mul( Math.PI * 2, freq ) )

    // kwa = (2/iT) * tan(kwd * iT/2) 
    const kwa =g.memo( g.mul( 2/iT, g.tan( g.mul( kwd, iT/2 ) ) ) )

    // kG  = kwa * iT/2 
    const kg = g.memo( g.mul( kwa, iT/2 ) )

    // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
    const kk = g.memo( g.mul( 4, g.div( g.sub( Q, .5 ), 24.5 ) ) )

    // kg_plus_1 = (1.0 + kg)
    const kg_plus_1 = g.add( 1, kg )

    // kG = kg / kg_plus_1 
    const kG     = g.memo( g.div( kg, kg_plus_1 ) ),
          kG_2   = g.memo( g.mul( kG, kG ) ),
          kG_3   = g.mul( kG_2, kG ),
          kGAMMA = g.mul( kG_2, kG_2 )

    const kS1 = g.div( z1.out, kg_plus_1 ),
          kS2 = g.div( z2.out, kg_plus_1 ),
          kS3 = g.div( z3.out, kg_plus_1 ),
          kS4 = g.div( z4.out, kg_plus_1 )

    //kS = kG_3 * kS1  + kG_2 * kS2 + kG * kS3 + kS4 
    const kS = g.memo( 
      g.add(
        g.add( g.mul(kG_3, kS1), g.mul( kG_2, kS2) ),
        g.add( g.mul(kG, kS3), kS4 )
      )
    )

    //ku = (kin - kk *  kS) / (1 + kk * kGAMMA)
    const ku1 = g.sub( input, g.mul( kk, kS ) )
    const ku2 = g.memo( g.add( 1, g.mul( kk, kGAMMA ) ) )
    const ku  = g.memo( g.div( ku1, ku2 ) )

    let kv =  g.memo( g.mul( g.sub( ku, z1.out ), kG ) )
    let klp = g.memo( g.add( kv, z1.out ) )
    z1.in( g.add( klp, kv ) )

    kv  = g.memo( g.mul( g.sub( klp, z2.out ), kG ) )
    klp = g.memo( g.add( kv, z2.out ) )
    z2.in( g.add( klp, kv ) )

    kv  = g.memo( g.mul( g.sub( klp, z3.out ), kG ) )
    klp = g.memo( g.add( kv, z3.out ) )
    z3.in( g.add( klp, kv ) )

    kv  = g.memo( g.mul( g.sub( klp, z4.out ), kG ) )
    klp = g.memo( g.add( kv, z4.out ) )
    z4.in( g.add( klp, kv ) )


    if( isStereo ) {
      //let polesR = g.data([ 0,0,0,0 ], 1, { meta:true }),
      //    rezzR = g.clamp( g.mul( polesR[3], rez ) ),
      //    outputR = g.sub( input[1], rezzR )         

      //polesR[0] = g.add( polesR[0], g.mul( g.add( g.mul(-1, polesR[0] ), outputR   ), cutoff ))
      //polesR[1] = g.add( polesR[1], g.mul( g.add( g.mul(-1, polesR[1] ), polesR[0] ), cutoff ))
      //polesR[2] = g.add( polesR[2], g.mul( g.add( g.mul(-1, polesR[2] ), polesR[1] ), cutoff ))
      //polesR[3] = g.add( polesR[3], g.mul( g.add( g.mul(-1, polesR[3] ), polesR[2] ), cutoff ))

      //let right = g.switch( isLowPass, polesR[3], g.sub( outputR, polesR[3] ) )

      //returnValue = [left, right]
    }else{
      returnValue = klp
    }

    return returnValue
  }

  const Zd24 = inputProps => {
    const filter   = Object.create( filter )
    const props    = Object.assign( {}, Zd24.defaults, inputProps )
    const isStereo = props.input.isStereo 

    Gibberish.factory(
      filter, 
      Gibberish.genish.zd24( g.in('input'), g.in('Q'), g.in('cutoff'), isStereo ), 
      'zd24',
      props
    )

    return filter
  }


  Zd24.defaults = {
    input:0,
    Q: 5,
    cutoff: 440,
  }

  return Zd24

}


},{"./filter.js":12,"genish.js":94}],16:[function(require,module,exports){
const g = require( 'genish.js' ),
      filter = require( './filter.js' )

module.exports = function( Gibberish ) {
  Gibberish.genish.svf = ( input, cutoff, Q, mode, isStereo ) => {
    let d1 = g.data([0,0], 1, { meta:true }), d2 = g.data([0,0], 1, { meta:true }),
        peekProps = { mode:'simple', interp:'none' }

    let f1 = g.memo( g.mul( 2 * Math.PI, g.div( cutoff, g.gen.samplerate ) ) )
    let oneOverQ = g.memo( g.div( 1, Q ) )
    let l = g.memo( g.add( d2[0], g.mul( f1, d1[0] ) ) ),
        h = g.memo( g.sub( g.sub( isStereo ? input[0] : input, l ), g.mul( Q, d1[0] ) ) ),
        b = g.memo( g.add( g.mul( f1, h ), d1[0] ) ),
        n = g.memo( g.add( h, l ) )

    d1[0] = b
    d2[0] = l

    let out = g.selector( mode, l, h, b, n )

    let returnValue
    if( isStereo ) {
      let d12 = g.data([0,0], 1, { meta:true }), d22 = g.data([0,0], 1, { meta:true })
      let l2 = g.memo( g.add( d22[0], g.mul( f1, d12[0] ) ) ),
          h2 = g.memo( g.sub( g.sub( input[1], l2 ), g.mul( Q, d12[0] ) ) ),
          b2 = g.memo( g.add( g.mul( f1, h2 ), d12[0] ) ),
          n2 = g.memo( g.add( h2, l2 ) )

      d12[0] = b2
      d22[0] = l2

      let out2 = g.selector( mode, l2, h2, b2, n2 )

      returnValue = [ out, out2 ]
    }else{
      returnValue = out
    }

    return returnValue
  }

  let SVF = inputProps => {
    const svf = Object.create( filter )
    const props = Object.assign( {}, SVF.defaults, inputProps ) 

    const isStereo = props.input.isStereo
    
    // XXX NEEDS REFACTORING
    Gibberish.factory( 
      svf,
      Gibberish.genish.svf( g.in('input'), g.mul( g.in('cutoff'), g.gen.samplerate / 5 ), g.sub( 1, g.in('Q') ), g.in('mode'), isStereo ), 
      'svf', 
      props
    )

    return svf
  }


  SVF.defaults = {
    input:0,
    Q: .75,
    cutoff:.35,
    mode:0
  }

  return SVF

}


},{"./filter.js":12,"genish.js":94}],17:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let BitCrusher = inputProps => {
  let props = Object.assign( { bitCrusherLength: 44100 }, BitCrusher.defaults, inputProps ),
      bitCrusher = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      bitDepth = g.in( 'bitDepth' ),
      sampleRate = g.in( 'sampleRate' ),
      leftInput = isStereo ? input[ 0 ] : input,
      rightInput = isStereo ? input[ 1 ] : null
  
  let storeL = g.history(0)
  let sampleReduxCounter = g.counter( sampleRate, 0, 1 )

  let bitMult = g.pow( g.mul( bitDepth, 16 ), 2 )
  let crushedL = g.div( g.floor( g.mul( leftInput, bitMult ) ), bitMult )

  let outL = g.switch(
    sampleReduxCounter.wrap,
    crushedL,
    storeL.out
  )

  if( isStereo ) {
    let storeR = g.history(0)
    let crushedR = g.div( g.floor( g.mul( rightInput, bitMult ) ), bitMult )

    let outR = ternary( 
      sampleReduxCounter.wrap,
      crushedR,
      storeL.out
    )

    Gibberish.factory( 
      bitCrusher,
      [ outL, outR ], 
      'bitCrusher', 
      props 
    )
  }else{
    Gibberish.factory( bitCrusher, outL, 'bitCrusher', props )
  }
  
  return bitCrusher
}

BitCrusher.defaults = {
  input:0,
  bitDepth:.5,
  sampleRate: .5
}

return BitCrusher

}

},{"./effect.js":21,"genish.js":94}],18:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
  let proto = Object.create( effect )

  let Shuffler = inputProps => {
    let bufferShuffler = Object.create( proto ),
        bufferSize = 88200

    let props = Object.assign( {}, Shuffler.defaults, inputProps )

    let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : false
    let phase = g.accum( 1,0,{ shouldWrap: false })

    let input = g.in( 'input' ),
        leftInput = isStereo ? input[ 0 ] : input,
        rightInput = isStereo ? input[ 1 ] : null,
        rateOfShuffling = g.in( 'rate' ),
        chanceOfShuffling = g.in( 'chance' ),
        reverseChance = g.in( 'reverseChance' ),
        repitchChance = g.in( 'repitchChance' ),
        repitchMin = g.in( 'repitchMin' ),
        repitchMax = g.in( 'repitchMax' )

    let pitchMemory = g.history(1)

    let shouldShuffleCheck = g.eq( g.mod( phase, rateOfShuffling ), 0 )
    let isShuffling = g.memo( g.sah( g.lt( g.noise(), chanceOfShuffling ), shouldShuffleCheck, 0 ) ) 

    // if we are shuffling and on a repeat boundary...
    let shuffleChanged = g.memo( g.and( shouldShuffleCheck, isShuffling ) )
    let shouldReverse = g.lt( g.noise(), reverseChance ),
        reverseMod = g.switch( shouldReverse, -1, 1 )

    let pitch = g.ifelse( 
      g.and( shuffleChanged, g.lt( g.noise(), repitchChance ) ),
      g.memo( g.mul( g.add( repitchMin, g.mul( g.sub( repitchMax, repitchMin ), g.noise() ) ), reverseMod ) ),
      reverseMod
    )
    
    // only switch pitches on repeat boundaries
    pitchMemory.in( g.switch( shuffleChanged, pitch, pitchMemory.out ) )

    let fadeLength = g.memo( g.div( rateOfShuffling, 100 ) ),
        fadeIncr = g.memo( g.div( 1, fadeLength ) )

    let bufferL = g.data( bufferSize ), bufferR = isStereo ? g.data( bufferSize ) : null
    let readPhase = g.accum( pitchMemory.out, 0, { shouldWrap:false }) 
    let stutter = g.wrap( g.sub( g.mod( readPhase, bufferSize ), 22050 ), 0, bufferSize )

    let normalSample = g.peek( bufferL, g.accum( 1, 0, { max:88200 }), { mode:'simple' })

    let stutterSamplePhase = g.switch( isShuffling, stutter, g.mod( readPhase, bufferSize ) )
    let stutterSample = g.memo( g.peek( 
      bufferL, 
      stutterSamplePhase,
      { mode:'samples' }
    ) )
    
    let stutterShouldFadeIn = g.and( shuffleChanged, isShuffling )
    let stutterPhase = g.accum( 1, shuffleChanged, { shouldWrap: false })

    let fadeInAmount = g.memo( g.div( stutterPhase, fadeLength ) )
    let fadeOutAmount = g.div( g.sub( rateOfShuffling, stutterPhase ), g.sub( rateOfShuffling, fadeLength ) )
    
    let fadedStutter = g.ifelse(
      g.lt( stutterPhase, fadeLength ),
      g.memo( g.mul( g.switch( g.lt( fadeInAmount, 1 ), fadeInAmount, 1 ), stutterSample ) ),
      g.gt( stutterPhase, g.sub( rateOfShuffling, fadeLength ) ),
      g.memo( g.mul( g.gtp( fadeOutAmount, 0 ), stutterSample ) ),
      stutterSample
    )
    
    let outputL = g.mix( normalSample, fadedStutter, isShuffling ) 

    let pokeL = g.poke( bufferL, leftInput, g.mod( g.add( phase, 44100 ), 88200 ) )

    let panner = g.pan( outputL, outputL, g.in( 'pan' ) )
    
    Gibberish.factory( 
      bufferShuffler,
      [panner.left, panner.right],
      'shuffler', 
      props 
    ) 

    return bufferShuffler
  }
  
  Shuffler.defaults = {
    input:0,
    rate:22050,
    chance:.25,
    reverseChance:.5,
    repitchChance:.5,
    repitchMin:.5,
    repitchMax:2,
    pan:.5,
    mix:.5
  }

  return Shuffler 
}

},{"./effect.js":21,"genish.js":94}],19:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Chorus = inputProps => {
  const props = Object.assign({}, Chorus.defaults, inputProps )
  
  const chorus = Object.create( Gibberish.prototypes.ugen )

  const input = g.in('input'),
        freq1 = g.in('slowFrequency'),
        freq2 = g.in('fastFrequency'),
        amp1  = g.in('slowGain'),
        amp2  = g.in('fastGain')

  const isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : true 

  const leftInput = isStereo ? input[0] : input

  const win0   = g.env( 'inversewelch', 1024 ),
        win120 = g.env( 'inversewelch', 1024, 0, .333 ),
        win240 = g.env( 'inversewelch', 1024, 0, .666 )
  
  const slowPhasor = g.phasor( freq1, 0, { min:0 }),
  		  slowPeek1  = g.mul( g.peek( win0,   slowPhasor ), amp1 ),
        slowPeek2  = g.mul( g.peek( win120, slowPhasor ), amp1 ),
        slowPeek3  = g.mul( g.peek( win240, slowPhasor ), amp1 )
  
  const fastPhasor = g.phasor( freq2, 0, { min:0 }),
  	  	fastPeek1  = g.mul( g.peek( win0,   fastPhasor ), amp2 ),
        fastPeek2  = g.mul( g.peek( win120, fastPhasor ), amp2 ),
        fastPeek3  = g.mul( g.peek( win240, fastPhasor ), amp2 )

  const ms = Gibberish.ctx.sampleRate / 1000 
  const maxDelayTime = 100 * ms

  const time1 =  g.mul( g.add( slowPeek1, fastPeek1, 5 ), ms ),
        time2 =  g.mul( g.add( slowPeek2, fastPeek2, 5 ), ms ),
        time3 =  g.mul( g.add( slowPeek3, fastPeek3, 5 ), ms )

  const delay1L = g.delay( leftInput, time1, { size:maxDelayTime }),
        delay2L = g.delay( leftInput, time2, { size:maxDelayTime }),
        delay3L = g.delay( leftInput, time3, { size:maxDelayTime })

  
  const leftOutput = g.add( delay1L, delay2L, delay3L )
  if( isStereo ) {
    const rightInput = input[1]
    const delay1R = g.delay(rightInput, time1, { size:maxDelayTime }),
          delay2R = g.delay(rightInput, time2, { size:maxDelayTime }),
          delay3R = g.delay(rightInput, time3, { size:maxDelayTime })

    // flip a couple delay lines for stereo effect?
    const rightOutput = g.div( g.add( delay1R, delay2R, delay3R ), 3 )
    chorus.graph = [ leftOutput, rightOutput ]
  }else{
    chorus.graph = leftOutput
  }
  
  Gibberish.factory( chorus, chorus.graph, 'chorus', props )

  return chorus
}

Chorus.defaults = {
  input:0,
  slowFrequency: .18,
  slowGain:1,
  fastFrequency:6,
  fastGain:.2
}

return Chorus

}

},{"./effect.js":21,"genish.js":94}],20:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let props = Object.assign( { delayLength: 44100 }, Delay.defaults, inputProps ),
      delay = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayTime = g.in( 'delayTime' ),
      leftInput = isStereo ? input[ 0 ] : input,
      rightInput = isStereo ? input[ 1 ] : null
    
  let feedback = g.in( 'feedback' )

  // left channel
  let feedbackHistoryL = g.history()
  let echoL = g.delay( g.add( leftInput, g.mul( feedbackHistoryL.out, feedback ) ), delayTime, { size:props.delayLength })
  feedbackHistoryL.in( echoL )

  if( isStereo ) {
    // right channel
    let feedbackHistoryR = g.history()
    let echoR = g.delay( g.add( rightInput, g.mul( feedbackHistoryR.out, feedback ) ), delayTime, { size:props.delayLength })
    feedbackHistoryR.in( echoR )

    Gibberish.factory( 
      delay,
      [ echoL, echoR ], 
      'delay', 
      props 
    )
  }else{
    Gibberish.factory( delay, echoL, 'delay', props )
  }
  
  return delay
}

Delay.defaults = {
  input:0,
  feedback:.925,
  delayTime: 11025
}

return Delay

}

},{"./effect.js":21,"genish.js":94}],21:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let effect = Object.create( ugen )

Object.assign( effect, {

})

module.exports = effect

},{"../ugen.js":55}],22:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const effects = {
    Freeverb    : require( './freeverb.js'  )( Gibberish ),
    Flanger     : require( './flanger.js'   )( Gibberish ),
    Vibrato     : require( './vibrato.js'   )( Gibberish ),
    Delay       : require( './delay.js'     )( Gibberish ),
    BitCrusher  : require( './bitCrusher.js')( Gibberish ),
    RingMod     : require( './ringMod.js'   )( Gibberish ),
    Tremolo     : require( './tremolo.js'   )( Gibberish ),
    Chorus      : require( './chorus.js'    )( Gibberish ),
    Shuffler    : require( './bufferShuffler.js'  )( Gibberish )
  }

  effects.export = target => {
    for( let key in effects ) {
      if( key !== 'export' ) {
        target[ key ] = effects[ key ]
      }
    }
  }

return effects

}

},{"./bitCrusher.js":17,"./bufferShuffler.js":18,"./chorus.js":19,"./delay.js":20,"./flanger.js":23,"./freeverb.js":24,"./ringMod.js":25,"./tremolo.js":26,"./vibrato.js":27}],23:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Flanger = inputProps => {
  let props   = Object.assign( { delayLength:44100 }, Flanger.defaults, inputProps ),
      flanger = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayLength = props.delayLength,
      feedbackCoeff = g.in( 'feedback' ),
      modAmount = g.in( 'offset' ),
      frequency = g.in( 'frequency' ),
      delayBufferL = g.data( delayLength ),
      delayBufferR

  let writeIdx = g.accum( 1,0, { min:0, max:delayLength, interp:'none', mode:'samples' })
  
  let offset = g.mul( modAmount, 500 )

  let mod = props.mod === undefined ? g.cycle( frequency ) : props.mod
  
  let readIdx = g.wrap( 
    g.add( 
      g.sub( writeIdx, offset ), 
      mod//g.mul( mod, g.sub( offset, 1 ) ) 
    ), 
	  0, 
    delayLength
  )

  let leftInput = isStereo ? input[0] : input

  let delayedOutL = g.peek( delayBufferL, readIdx, { interp:'linear', mode:'samples' })
  
  g.poke( delayBufferL, g.add( leftInput, g.mul( delayedOutL, feedbackCoeff ) ), writeIdx )

  let left = g.add( leftInput, delayedOutL ),
      right

  if( isStereo === true ) {
    rightInput = input[1]
    delayBufferR = g.data( delayLength )
    
    let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

    g.poke( delayBufferR, g.add( rightInput, g.mul( delayedOutR, feedbackCoeff ) ), writeIdx )
    right = g.add( rightInput, delayedOutR )

    Gibberish.factory( 
      flanger,
      [ left, right ], 
      'flanger', 
      props 
    )

  }else{
    Gibberish.factory( flanger, left, 'flanger', props )
  }
  
  return flanger
}

Flanger.defaults = {
  input:0,
  feedback:.01,
  offset:.25,
  frequency:.5
}

return Flanger

}

},{"./effect.js":21,"genish.js":94}],24:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )

module.exports = function( Gibberish ) {
  
const allPass = Gibberish.filters.genish.AllPass
const combFilter = Gibberish.filters.genish.Comb

const tuning = {
  combCount:	  	8,
  combTuning: 		[ 1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617 ],                    
  allPassCount: 	4,
  allPassTuning:	[ 225, 556, 441, 341 ],
  allPassFeedback:0.5,
  fixedGain: 		  0.015,
  scaleDamping: 	0.4,
  scaleRoom: 		  0.28,
  offsetRoom: 	  0.7,
  stereoSpread:   23
}

const Freeverb = inputProps => {
  let props = Object.assign( {}, Freeverb.defaults, inputProps ),
      reverb = Object.create( effect ) 
   
  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let combsL = [], combsR = []

  let input = g.in( 'input' ),
      wet1 = g.in( 'wet1'), wet2 = g.in( 'wet2' ),  dry = g.in( 'dry' ), 
      roomSize = g.in( 'roomSize' ), damping = g.in( 'damping' )
  
  let summedInput = isStereo === true ? g.add( input[0], input[1] ) : input,
      attenuatedInput = g.memo( g.mul( summedInput, tuning.fixedGain ) )
  
  // create comb filters in parallel...
  for( let i = 0; i < 8; i++ ) { 
    combsL.push( 
      combFilter( attenuatedInput, tuning.combTuning[i], g.mul(damping,.4), g.mul( tuning.scaleRoom + tuning.offsetRoom, roomSize ) ) 
    )
    combsR.push( 
      combFilter( attenuatedInput, tuning.combTuning[i] + tuning.stereoSpread, g.mul(damping,.4), g.mul( tuning.scaleRoom + tuning.offsetRoom, roomSize ) ) 
    )
  }
  
  // ... and sum them with attenuated input
  let outL = g.add( attenuatedInput, ...combsL )
  let outR = g.add( attenuatedInput, ...combsR )
  
  // run through allpass filters in series
  for( let i = 0; i < 4; i++ ) { 
    outL = allPass( outL, tuning.allPassTuning[ i ] + tuning.stereoSpread )
    outR = allPass( outR, tuning.allPassTuning[ i ] + tuning.stereoSpread )
  }
  
  let outputL = g.add( g.mul( outL, wet1 ), g.mul( outR, wet2 ), g.mul( isStereo === true ? input[0] : input, dry ) ),
      outputR = g.add( g.mul( outR, wet1 ), g.mul( outL, wet2 ), g.mul( isStereo === true ? input[1] : input, dry ) )

  Gibberish.factory( reverb, [ outputL, outputR ], 'freeverb', props )

  return reverb
}


Freeverb.defaults = {
  input:0,
  wet1: 1,
  wet2: 0,
  dry: .5,
  roomSize: .84,
  damping:  .5
}

return Freeverb 

}


},{"./effect.js":21,"genish.js":94}],25:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let RingMod = inputProps => {
  let props   = Object.assign( {}, RingMod.defaults, inputProps ),
      ringMod = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      frequency = g.in( 'frequency' ),
      gain = g.in( 'gain' ),
      mix = g.in( 'mix' )
  
  let leftInput = isStereo ? input[0] : input,
      sine = g.mul( g.cycle( frequency ), gain )
 
  let left = g.add( g.mul( leftInput, g.sub( 1, mix )), g.mul( g.mul( leftInput, sine ), mix ) ), 
      right

  if( isStereo === true ) {
    let rightInput = input[1]
    right = g.add( g.mul( rightInput, g.sub( 1, mix )), g.mul( g.mul( rightInput, sine ), mix ) ) 
    
    Gibberish.factory( 
      ringMod,
      [ left, right ], 
      'ringMod', 
      props 
    )
  }else{
    Gibberish.factory( ringMod, left, 'ringMod', props )
  }
  
  return ringMod
}

RingMod.defaults = {
  input:0,
  frequency:220,
  gain: 1, 
  mix:1
}

return RingMod

}

},{"./effect.js":21,"genish.js":94}],26:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
const Tremolo = inputProps => {
  const props   = Object.assign( {}, Tremolo.defaults, inputProps ),
        tremolo = Object.create( effect )

  const isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  const input = g.in( 'input' ),
        frequency = g.in( 'frequency' ),
        amount = g.in( 'amount' )
  
  const leftInput = isStereo ? input[0] : input

  let osc
  if( props.shape === 'square' ) {
    osc = g.gt( g.phasor( frequency ), 0 )
  }else if( props.shape === 'saw' ) {
    osc = g.gtp( g.phasor( frequency ), 0 )
  }else{
    osc = g.cycle( frequency )
  }

  const mod = g.mul( osc, amount )
 
  let left = g.sub( leftInput, g.mul( leftInput, mod ) ), 
      right

  if( isStereo === true ) {
    let rightInput = input[1]
    right = g.mul( rightInput, mod )

    Gibberish.factory( 
      tremolo,
      [ left, right ], 
      'tremolo', 
      props 
    )
  }else{
    Gibberish.factory( tremolo, left, 'tremolo', props )
  }
  
  return tremolo
}

Tremolo.defaults = {
  input:0,
  frequency:2,
  amount: 1, 
  shape:'sine'
}

return Tremolo

}

},{"./effect.js":21,"genish.js":94}],27:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Vibrato = inputProps => {
  let props   = Object.assign( {}, Vibrato.defaults, inputProps ),
      vibrato = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayLength = 44100,
      feedbackCoeff = .01,//g.in( 'feedback' ),
      modAmount = g.in( 'amount' ),
      frequency = g.in( 'frequency' ),
      delayBufferL = g.data( delayLength ),
      delayBufferR

  let writeIdx = g.accum( 1,0, { min:0, max:delayLength, interp:'none', mode:'samples' })
  
  let offset = g.mul( modAmount, 500 )
  
  let readIdx = g.wrap( 
    g.add( 
      g.sub( writeIdx, offset ), 
      g.mul( g.cycle( frequency ), g.sub( offset, 1 ) ) 
    ), 
	  0, 
    delayLength
  )

  let leftInput = isStereo ? input[0] : input

  let delayedOutL = g.peek( delayBufferL, readIdx, { interp:'linear', mode:'samples' })
  
  g.poke( delayBufferL, g.add( leftInput, g.mul( delayedOutL, feedbackCoeff ) ), writeIdx )

  let left = delayedOutL,
      right

  if( isStereo === true ) {
    rightInput = input[1]
    delayBufferR = g.data( delayLength )
    
    let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

    g.poke( delayBufferR, g.add( rightInput, mul( delayedOutR, feedbackCoeff ) ), writeIdx )
    right = delayedOutR

    Gibberish.factory( 
      vibrato,
      [ left, right ], 
      'vibrato', 
      props 
    )
  }else{
    Gibberish.factory( vibrato, left, 'vibrato', props )
  }
  
  return vibrato
}

Vibrato.defaults = {
  input:0,
  //feedback:.01,
  amount:.5,
  frequency:4
}

return Vibrato

}

},{"./effect.js":21,"genish.js":94}],28:[function(require,module,exports){
let MemoryHelper = require( 'memory-helper' ),
    genish       = require( 'genish.js' )
    
let Gibberish = {
  blockCallbacks: [], // called every block
  dirtyUgens: [],
  callbackUgens: [],
  callbackNames: [],
  analyzers: [],
  graphIsDirty: false,
  ugens: {},
  debug: false,

  output: null,

  memory : null, // 20 minutes by default?
  factory: null, 
  genish,
  scheduler: require( './scheduling/scheduler.js' ),

  memoed: {},

  prototypes: {
    ugen: require('./ugen.js'),
    instrument: require( './instruments/instrument.js' ),
    effect: require( './fx/effect.js' ),
  },

  mixins: {
    polyinstrument: require( './instruments/polyMixin.js' )
  },

  init( memAmount ) {
    let numBytes = memAmount === undefined ? 20 * 60 * 44100 : memAmount

    this.memory = MemoryHelper.create( numBytes )

    this.load()
    
    this.output = this.Bus2()

    this.utilities.createContext()
    this.utilities.createScriptProcessor()

    this.analyzers.dirty = false

    // XXX FOR DEVELOPMENT AND TESTING ONLY... REMOVE FOR PRODUCTION
    this.export( window )
  },

  load() {
    this.factory = require( './ugenTemplate.js' )( this )

    this.PolyTemplate = require( './instruments/polytemplate.js' )( this )
    this.oscillators  = require( './oscillators/oscillators.js' )( this )
    this.filters      = require( './filters/filters.js' )( this )
    this.binops       = require( './misc/binops.js' )( this )
    this.monops       = require( './misc/monops.js' )( this )
    this.Bus          = require( './misc/bus.js' )( this )
    this.Bus2         = require( './misc/bus2.js' )( this );
    this.instruments  = require( './instruments/instruments.js' )( this )
    this.fx           = require( './fx/effects.js' )( this )
    this.Sequencer    = require( './scheduling/sequencer.js' )( this );
    this.Sequencer2   = require( './scheduling/seq2.js' )( this );
    this.envelopes    = require( './envelopes/envelopes.js' )( this );
    this.ssd          = require( './analysis/singlesampledelay.js' )( this );
  },

  export( target, shouldExportGenish=false ) {
    if( target === undefined ) throw Error('You must define a target object for Gibberish to export variables to.')

    if( shouldExportGenish ) this.genish.export( target )

    this.instruments.export( target )
    this.fx.export( target )
    this.filters.export( target )
    this.oscillators.export( target )
    this.binops.export( target )
    this.monops.export( target )
    this.envelopes.export( target )
    target.Sequencer = this.Sequencer
    target.Sequencer2 = this.Sequencer2
    target.Bus = this.Bus
    target.Bus2 = this.Bus2
    target.Scheduler = this.scheduler
    target.SSD = this.ssd
  },

  print() {
    console.log( this.callback.toString() )
  },

  dirty( ugen ) {
    if( ugen === this.analyzers ) {
      this.graphIsDirty = true
      this.analyzers.dirty = true
    } else {
      this.dirtyUgens.push( ugen )
      this.graphIsDirty = true
      if( this.memoed[ ugen.ugenName ] ) {
        delete this.memoed[ ugen.ugenName ]
      }
    } 
  },

  clear() {
    this.output.inputs = [0]
    this.output.inputNames.length = 0
    this.analyzers.length = 0
    this.scheduler.clear()
    this.dirty( this.output )
  },

  generateCallback() {
    let uid = 0,
        callbackBody, lastLine, analysis=''

    this.memoed = {}

    callbackBody = this.processGraph( this.output )
    lastLine = callbackBody[ callbackBody.length - 1]
    callbackBody.unshift( "\t'use strict';" )

    this.analyzers.forEach( v=> {
      const analysisBlock = Gibberish.processUgen( v )
      const analysisLine = analysisBlock.pop()

      analysisBlock.forEach( v=> {
        callbackBody.splice( callbackBody.length - 1, 0, v )
      })

      callbackBody.push( analysisLine )
    })

    this.analyzers.forEach( v => {
      if( this.callbackUgens.indexOf( v.callback ) === -1 )
        this.callbackUgens.push( v.callback )
    })
    this.callbackNames = this.callbackUgens.map( v => v.ugenName )

    callbackBody.push( '\n\treturn ' + lastLine.split( '=' )[0].split( ' ' )[1] )

    if( this.debug ) console.log( 'callback:\n', callbackBody.join('\n') )
    this.callbackNames.push( 'memory' )
    this.callbackUgens.push( this.memory.heap )
    this.callback = Function( ...this.callbackNames, callbackBody.join( '\n' ) )
    this.callback.out = []

    if( this.oncallback ) this.oncallback( this.callback )

    return this.callback 
  },

  processGraph( output ) {
    this.callbackUgens.length = 0
    this.callbackNames.length = 0

    this.callbackUgens.push( output.callback )

    let body = this.processUgen( output )
    

    this.dirtyUgens.length = 0
    this.graphIsDirty = false

    return body
  },

  processUgen( ugen, block ) {
    if( block === undefined ) block = []

    let dirtyIdx = Gibberish.dirtyUgens.indexOf( ugen )

    //console.log( 'ugenName:', ugen.ugenName )
    let memo = Gibberish.memoed[ ugen.ugenName ]

    if( memo !== undefined ) {
      return memo
    } else if (ugen === true || ugen === false) {
      throw "Why is ugen a boolean? [true] or [false]";
    } else if( ugen.block === undefined || dirtyIndex !== -1 ) {
  
      let line = `\tvar v_${ugen.id} = ` 
      
      if( !ugen.binop ) line += `${ugen.ugenName}( `

      // must get array so we can keep track of length for comma insertion
      let keys,err
      
      //try {
      keys = ugen.binop || ugen.type === 'bus' || ugen.type === 'analysis' ? Object.keys( ugen.inputs ) : Object.keys( ugen.inputNames )

      //}catch( e ){

      //  console.log( e )
      //  err = true
      //}
      
      //if( err === true ) return

      for( let i = 0; i < keys.length; i++ ) {
        let key = keys[ i ]
        // binop.inputs is actual values, not just property names
        let input 
        if( ugen.binop || ugen.type ==='bus' ) {
          input = ugen.inputs[ key ]
        }else{
          //if( key === 'memory' ) continue;
  
          input = ugen[ ugen.inputNames[ key ] ]
        }

        if( input !== undefined ) { 
          if( typeof input === 'number' ) {
              line += input
          } else if( typeof input === 'boolean' ) {
              line += ""+input
          }else{
            //console.log( 'key:', key, 'input:', ugen.inputs, ugen.inputs[ key ] ) 

            Gibberish.processUgen( input, block )

            //if( input.callback === undefined ) continue

            if( !input.binop ) {
              // check is needed so that graphs with ssds that refer to themselves
              // don't add the ssd in more than once
              if( Gibberish.callbackUgens.indexOf( input.callback ) === -1 ) {
                Gibberish.callbackUgens.push( input.callback )
              }
            }

            line += `v_${input.id}`
          }

          if( i < keys.length - 1 ) {
            line += ugen.binop ? ' ' + ugen.op + ' ' : ', ' 
          }
        }
      }
      
      //if( ugen.type === 'bus' ) line += ', ' 
      if( !ugen.binop && ugen.type !== 'bus' && ugen.type !== 'seq' ) line += 'memory'
      line += ugen.binop ? '' : ' )'

      block.push( line )
      
      //console.log( 'memo:', ugen.ugenName )
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

Gibberish.utilities = require( './utilities.js' )( Gibberish )


module.exports = Gibberish

},{"./analysis/singlesampledelay.js":2,"./envelopes/envelopes.js":5,"./filters/filters.js":14,"./fx/effect.js":21,"./fx/effects.js":22,"./instruments/instrument.js":33,"./instruments/instruments.js":34,"./instruments/polyMixin.js":38,"./instruments/polytemplate.js":39,"./misc/binops.js":43,"./misc/bus.js":44,"./misc/bus2.js":45,"./misc/monops.js":46,"./oscillators/oscillators.js":49,"./scheduling/scheduler.js":52,"./scheduling/seq2.js":53,"./scheduling/sequencer.js":54,"./ugen.js":55,"./ugenTemplate.js":56,"./utilities.js":57,"genish.js":94,"memory-helper":131}],29:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Conga = argumentProps => {
    let conga = Object.create( instrument ),
        frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Conga.defaults, argumentProps )

    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        _decay =  g.sub( .101, g.div( decay, 10 ) ), // create range of .001 - .099
        bpf = g.svf( impulse, frequency, _decay, 2, false ),
        out = g.mul( bpf, gain )
    
    Gibberish.factory( conga, out, 'conga', props  )
    
    conga.env = trigger

    return conga
  }
  
  Conga.defaults = {
    gain: .25,
    frequency:190,
    decay: .85
  }

  return Conga

}

},{"./instrument.js":33,"genish.js":94}],30:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Cowbell = argumentProps => {
    const cowbell = Object.create( instrument ),
          decay   = g.in( 'decay' ),
          gain    = g.in( 'gain' )

    const props = Object.assign( {}, Cowbell.defaults, argumentProps )

    const bpfCutoff = g.param( 'bpfc', 1000 ),
          s1 = Gibberish.oscillators.factory( 'square', 560 ),
          s2 = Gibberish.oscillators.factory( 'square', 845 ),
          eg = g.decay( g.mul( decay, g.gen.samplerate * 2 ) ), 
          bpf = g.svf( g.add( s1,s2 ), bpfCutoff, 3, 2, false ),
          envBpf = g.mul( bpf, eg ),
          out = g.mul( envBpf, gain )

    Gibberish.factory( cowbell, out, 'cowbell', props  )
    
    cowbell.env = eg 

    cowbell.isStereo = false

    return cowbell
  }
  
  Cowbell.defaults = {
    gain: 1,
    decay:.5
  }

  return Cowbell

}

},{"./instrument.js":33,"genish.js":94}],31:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let FM = inputProps => {
    let syn = Object.create( instrument )

    let env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        glide = g.in( 'glide' ),
        slidingFreq = g.slide( frequency, glide, glide ),
        cmRatio = g.in( 'cmRatio' ),
        index = g.in( 'index' )

    let props = Object.assign( syn, FM.defaults, inputProps )

    syn.__createGraph = function() {
      let modOsc = Gibberish.oscillators.factory( syn.modulatorWaveform, g.mul( slidingFreq, cmRatio ), syn.antialias )
      let modOscWithIndex = g.mul( modOsc, g.mul( slidingFreq, index ) )
      let modOscWithEnv   = g.mul( modOscWithIndex, env )

      let carrierOsc = Gibberish.oscillators.factory( syn.carrierWaveform, g.add( slidingFreq, modOscWithEnv ), syn.antialias )
      let carrierOscWithEnv = g.mul( carrierOsc, env )
      
      let cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) )
      const filteredOsc = Gibberish.filters.factory( carrierOscWithEnv, cutoff, g.in('Q'), g.in('saturation'), syn )

      let synthWithGain = g.mul( filteredOsc, g.in( 'gain' ) ),
          panner

      if( props.panVoices === true ) { 
        panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
        syn.graph = [panner.left, panner.right ]
      }else{
        syn.graph = synthWithGain
      }
    }
    
    syn.__requiresRecompilation = [ 'carrierWaveform', 'modulatorWaveform', 'antialias', 'filterType', 'filterMode' ]
    syn.__createGraph()

    Gibberish.factory( syn, syn.graph , 'fm', syn )

    syn.env = env

    return syn
  }

  FM.defaults = {
    carrierWaveform:'sine',
    modulatorWaveform:'sine',
    attack: 44100,
    decay: 44100,
    gain: 1,
    cmRatio:2,
    index:5,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:false,
    panVoices:false,
    glide:1,
    saturation:1,
    filterMult:440,
    Q:.25,
    cutoff:3520,
    filterType:0,
    filterMode:0,
    isLowPass:1
  }

  let PolyFM = Gibberish.PolyTemplate( FM, ['glide','frequency','attack','decay','pulsewidth','pan','gain','cmRatio','index', 'saturation', 'filterMult', 'Q', 'cutoff', 'antialias', 'filterType', 'carrierWaveform', 'modulatorWaveform','filterMode' ] ) 

  return [ FM, PolyFM ]

}

},{"./instrument.js":33,"genish.js":94}],32:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Hat = argumentProps => {
    let hat = Object.create( instrument ),
        tune  = g.in( 'tune' ),
        scaledTune = g.memo( g.add( .4, tune ) ),
        decay  = g.in( 'decay' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Hat.defaults, argumentProps )

    let baseFreq = g.mul( 325, scaledTune ), // range of 162.5 - 487.5
        bpfCutoff = g.mul( g.param( 'bpfc', 7000 ), scaledTune ),
        hpfCutoff = g.mul( g.param( 'hpfc', 11000 ), scaledTune ),  
        s1 = Gibberish.oscillators.factory( 'square', baseFreq, false ),
        s2 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,1.4471 ) ),
        s3 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,1.6170 ) ),
        s4 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,1.9265 ) ),
        s5 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,2.5028 ) ),
        s6 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,2.6637 ) ),
        sum = g.add( s1,s2,s3,s4,s5,s6 ),
        eg = g.decay( g.mul( decay, g.gen.samplerate * 2 ) ), 
        bpf = g.svf( sum, bpfCutoff, .5, 2, false ),
        envBpf = g.mul( bpf, eg ),
        hpf = g.filter24( envBpf, 0, hpfCutoff, 0 ),
        out = g.mul( hpf, gain )

    Gibberish.factory( hat, out, 'hat', props  )
    
    hat.env = eg 

    hat.isStereo = false
    return hat
  }
  
  Hat.defaults = {
    gain:  1,
    tune: .6,
    decay:.1,
  }

  return Hat

}

},{"./instrument.js":33,"genish.js":94}],33:[function(require,module,exports){
let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

let instrument = Object.create( ugen )

Object.assign( instrument, {
  note( freq ) {
    this.frequency = freq
    this.env.trigger()
  },

  trigger( _gain = 1 ) {
    this.gain = _gain
    this.env.trigger()
  },

})

module.exports = instrument

},{"../ugen.js":55,"genish.js":94}],34:[function(require,module,exports){
module.exports = function( Gibberish ) {

const instruments = {
  Kick        : require( './kick.js' )( Gibberish ),
  Conga       : require( './conga.js' )( Gibberish ),
  Clave       : require( './conga.js' )( Gibberish ), // clave is same as conga with different defaults, see below
  Hat         : require( './hat.js' )( Gibberish ),
  Snare       : require( './snare.js' )( Gibberish ),
  Cowbell     : require( './cowbell.js' )( Gibberish )
}

instruments.Clave.defaults.frequency = 2500
instruments.Clave.defaults.decay = .5;

[ instruments.Synth, instruments.PolySynth ]     = require( './synth.js' )( Gibberish );
[ instruments.Monosynth, instruments.PolyMono ]  = require( './monosynth.js' )( Gibberish );
[ instruments.FM, instruments.PolyFM ]           = require( './fm.js' )( Gibberish );
[ instruments.Sampler, instruments.PolySampler ] = require( './sampler.js' )( Gibberish );
[ instruments.Karplus, instruments.PolyKarplus ] = require( './karplusstrong.js' )( Gibberish );

instruments.export = target => {
  for( let key in instruments ) {
    if( key !== 'export' ) {
      target[ key ] = instruments[ key ]
    }
  }
}

return instruments

}

},{"./conga.js":29,"./cowbell.js":30,"./fm.js":31,"./hat.js":32,"./karplusstrong.js":35,"./kick.js":36,"./monosynth.js":37,"./sampler.js":40,"./snare.js":41,"./synth.js":42}],35:[function(require,module,exports){
const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const KPS = inputProps => {

    const props = Object.assign( {}, KPS.defaults, inputProps )
    const syn = Object.create( instrument ),
          trigger = g.bang(),
          phase = g.accum( 1, trigger, { max:Infinity } ),
          env = g.gtp( g.sub( 1, g.div( phase, 200 ) ), 0 ),
          impulse = g.mul( g.noise(), env ),
          feedback = g.history(),
          frequency = g.in('frequency'),
          glide = g.in( 'glide' ),
          slidingFrequency = g.slide( frequency, glide, glide ),
          delay = g.delay( g.add( impulse, feedback.out ), g.div( Gibberish.ctx.sampleRate, slidingFrequency ), { size:2048 }),
          decayed = g.mul( delay, g.t60( g.mul( g.in('decay'), slidingFrequency ) ) ),
          damped =  g.mix( decayed, feedback.out, g.in('damping') ),
          withGain = g.mul( damped, g.in('gain') )

    feedback.in( damped )

    const properties = Object.assign( {}, KPS.defaults, props )

    if( properties.panVoices ) {  
      const panner = g.pan( withGain, withGain, g.in( 'pan' ) )
      Gibberish.factory( syn, [panner.left, panner.right], 'karplus', props  )
    }else{
      Gibberish.factory( syn, withGain, 'karplus', props )
    }

    Object.assign( syn, {
      properties : props,

      env : trigger,
      phase,

      getPhase() {
        return Gibberish.memory.heap[ phase.memory.value.idx ]
      },
    })
    return syn
  }
  
  KPS.defaults = {
    decay: .97,
    damping:.2,
    gain: 1,
    frequency:220,
    pan: .5,
    glide:1,
    panVoices:false
  }

  let envCheckFactory = ( syn,synth ) => {
    let envCheck = ()=> {
      let phase = syn.getPhase(),
          endTime = synth.decay * Gibberish.ctx.sampleRate

      if( phase > endTime ) {
        synth.disconnectUgen( syn )
        syn.isConnected = false
        Gibberish.memory.heap[ syn.phase.memory.value.idx ] = 0 // trigger doesn't seem to reset for some reason
      }else{
        Gibberish.blockCallbacks.push( envCheck )
      }
    }
    return envCheck
  }

  let PolyKPS = Gibberish.PolyTemplate( KPS, ['frequency','decay','damping','pan','gain', 'glide'], envCheckFactory ) 

  return [ KPS, PolyKPS ]

}

},{"./instrument.js":33,"genish.js":94}],36:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Kick = inputProps => {
    // establish prototype chain
    let kick = Object.create( instrument )

    // define inputs
    let frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        tone  = g.in( 'tone' ),
        gain  = g.in( 'gain' )
    
    // create initial property set
    let props = Object.assign( {}, Kick.defaults, inputProps )

    // create DSP graph
    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        scaledDecay = g.sub( 1.005, decay ), // -> range { .005, 1.005 }
        scaledTone = g.add( 50, g.mul( tone, 4000 ) ), // -> range { 50, 4050 }
        bpf = g.svf( impulse, frequency, scaledDecay, 2, false ),
        lpf = g.svf( bpf, scaledTone, .5, 0, false ),
        graph = g.mul( lpf, gain )
    
    Gibberish.factory( kick, graph, 'kick', props  )

    kick.env = trigger

    return kick
  }
  
  Kick.defaults = {
    gain: 1,
    frequency:85,
    tone: .25,
    decay:.9
  }

  return Kick

}

},{"./instrument.js":33,"genish.js":94}],37:[function(require,module,exports){
const g = require( 'genish.js' ),
      instrument = require( './instrument.js' ),
      feedbackOsc = require( '../oscillators/fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  const Synth = argumentProps => {
    const syn = Object.create( instrument ),
          oscs = [], 
          env = g.ad( g.in( 'attack' ), g.in( 'decay' ), { shape:'linear' }),
          frequency = g.in( 'frequency' ),
          glide = g.in( 'glide' ),
          slidingFreq = g.memo( g.slide( frequency, glide, glide ) )

    let props = Object.assign( syn, Synth.defaults, argumentProps )

    syn.__createGraph = function() {
      for( let i = 0; i < 3; i++ ) {
        let osc, freq

        switch( i ) {
          case 1:
            freq = g.add( slidingFreq, g.mul( slidingFreq, g.in('detune2') ) )
            break;
          case 2:
            freq = g.add( slidingFreq, g.mul( slidingFreq, g.in('detune3') ) )
            break;
          default:
            freq = slidingFreq//frequency
        }

        osc = Gibberish.oscillators.factory( syn.waveform, freq, syn.antialias )
        
        oscs[ i ] = osc
      }

      let oscSum = g.add( ...oscs ),
          oscWithGain = g.mul( g.mul( oscSum, env ), g.in( 'gain' ) ),
          //cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) ),
          filteredOsc, panner

      const baseCutoffFreq = g.mul( g.in('cutoff'), frequency )
      let cutoff = g.mul( g.mul( baseCutoffFreq, g.pow( 2, g.in('filterMult') )), env )
      filteredOsc = Gibberish.filters.factory( oscWithGain, cutoff, g.in('Q'), g.in('saturation'), syn )
        
      if( props.panVoices ) {  
        panner = g.pan( filteredOsc,filteredOsc, g.in( 'pan' ) )
        syn.graph = [ panner.left, panner.right ]
      }else{
        syn.graph = filteredOsc
      }
    }

    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterType', 'filterMode' ]
    syn.__createGraph()

    Gibberish.factory( syn, syn.graph, 'mono', props )

    syn.env = env

    return syn
  }
  
  Synth.defaults = {
    waveform: 'saw',
    attack: 44100,
    decay: 44100,
    gain: .25,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    detune2:.005,
    detune3:-.005,
    cutoff: 1,
    resonance:.25,
    Q: .5,
    panVoices:false,
    glide: 1,
    antialias:false,
    filterType: 2,
    filterMode: 0, // 0 = LP, 1 = HP, 2 = BP, 3 = Notch
    saturation:.5,
    filterMult: 4,
    isLowPass:true
  }

  let PolyMono = Gibberish.PolyTemplate( Synth, 
    ['frequency','attack','decay','cutoff','Q',
     'detune2','detune3','pulsewidth','pan','gain', 'glide', 'saturation', 'filterMult',  'antialias', 'filterType', 'waveform', 'filterMode']
  ) 

  return [ Synth, PolyMono ]
}

},{"../oscillators/fmfeedbackosc.js":48,"./instrument.js":33,"genish.js":94}],38:[function(require,module,exports){
module.exports = {
  note( freq ) {
    let voice = this.__getVoice__()
    Object.assign( voice, this.properties )
    voice.note( freq )
    this.__runVoice__( voice, this )
    this.triggerNote = freq
  },

  // XXX this is not particularly satisfying...
  // must check for both notes and chords
  trigger( gain ) {
    if( this.triggerChord !== null ) {
      this.triggerChord.forEach( v => {
        let voice = this.__getVoice__()
        Object.assign( voice, this.properties )
        voice.note( v )
        voice.gain = gain
        this.__runVoice__( voice, this )
      })
    }else if( this.triggerNote !== null ) {
      let voice = this.__getVoice__()
      Object.assign( voice, this.properties )
      voice.note( this.triggerNote )
      voice.gain = gain
      this.__runVoice__( voice, this )
    }else{
      let voice = this.__getVoice__()
      Object.assign( voice, this.properties )
      voice.trigger( gain )
      this.__runVoice__( voice, this )
    }
  },

  __runVoice__( voice, _poly ) {
    if( !voice.isConnected ) {
      voice.connect( _poly, 1 )
      voice.isConnected = true
    }

    let envCheck
    if( _poly.envCheck === undefined ) {
      envCheck = function() {
        if( voice.env.isComplete() ) {
          _poly.disconnectUgen.call( _poly, voice )
          voice.isConnected = false
        }else{
          Gibberish.blockCallbacks.push( envCheck )
        }
      }
    }else{
      envCheck = poly.envCheck( voice, poly )
    }

    Gibberish.blockCallbacks.push( envCheck )
  },

  __getVoice__() {
    return this.voices[ this.voiceCount++ % this.voices.length ]
  },

  chord( frequencies ) {
    frequencies.forEach( v => this.note( v ) )
    this.triggerChord = frequencies
  },

  free() {
    for( let child of this.voices ) child.free()
  }
}

},{}],39:[function(require,module,exports){
/*
 * This files creates a factory generating polysynth constructors.
 */

const g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  const TemplateFactory = ( ugen, propertyList, _envCheck ) => {
    /* 
     * polysynths are basically busses that connect child synth voices.
     * We create separate prototypes for mono vs stereo instances.
     */

    const monoProto   = Object.create( Gibberish.Bus() ),
          stereoProto = Object.create( Gibberish.Bus2())

    // since there are two prototypes we can't assign directly to one of them...
    Object.assign( monoProto,   Gibberish.mixins.polyinstrument )
    Object.assign( stereoProto, Gibberish.mixins.polyinstrument )

    const Template = props => {
      const properties = Object.assign( {}, { isStereo:true }, props )

      const synth = properties.isStereo ? Object.create( stereoProto ) : Object.create( monoProto )

      Object.assign( synth, {
        voices: [],
        maxVoices: properties.maxVoices !== undefined ? properties.maxVoices : 16,
        voiceCount: 0,
        envCheck: _envCheck,
        id: Gibberish.factory.getUID(),
        dirty: true,
        type: 'bus',
        ugenName: 'poly' + ugen.name + '_' + synth.id,
        inputs: [],
        inputNames: [],
        properties
      })

      properties.panVoices = properties.isStereo
      synth.callback.ugenName = synth.ugenName

      for( let i = 0; i < synth.maxVoices; i++ ) {
        synth.voices[i] = ugen( properties )
        synth.voices[i].callback.ugenName = synth.voices[i].ugenName
        synth.voices[i].isConnected = false
      }

      let _propertyList 
      if( properties.isStereo === false ) {
        _propertyList = propertyList.slice( 0 )
        const idx =  _propertyList.indexOf( 'pan' )
        if( idx  > -1 ) _propertyList.splice( idx, 1 )
      }

      TemplateFactory.setupProperties( synth, ugen, properties.isStereo ? propertyList : _propertyList )

      return synth
    }

    return Template
  }

  TemplateFactory.setupProperties = function( synth, ugen, props ) {
    for( let property of props ) {
      Object.defineProperty( synth, property, {
        get() {
          return synth.properties[ property ] || ugen.defaults[ property ]
        },
        set( v ) {
          synth.properties[ property ] = v
          for( let child of synth.inputs ) {
            child[ property ] = v
          }
        }
      })
    }
  }

  return TemplateFactory

}

},{"genish.js":94}],40:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {
  let proto = Object.create( instrument )

  Object.assign( proto, {
    note( rate ) {
      this.rate = rate
      if( rate > 0 ) {
        this.trigger()
      }else{
        this.__phase__.value = this.data.buffer.length - 1 
      }
    }
  })

  let Sampler = inputProps => {
    let syn = Object.create( proto )

    let props = Object.assign( { onload:null }, Sampler.defaults, inputProps )

    syn.isStereo = props.isStereo !== undefined ? props.isStereo : false

    let start = g.in( 'start' ), end = g.in( 'end' ), 
        rate = g.in( 'rate' ), shouldLoop = g.in( 'loops' )
    /* create dummy ugen until data for sampler is loaded...
     * this will be overridden by a call to Gibberish.factory on load */
    syn.callback = function() { return 0 }
    syn.id = Gibberish.factory.getUID()
    syn.ugenName = syn.callback.ugenName = 'sampler_' + syn.id
    syn.inputNames = []
    /* end dummy ugen */

    syn.__bang__ = g.bang()
    syn.trigger = syn.__bang__.trigger

    if( props.filename ) {
      syn.data = g.data( props.filename )

      syn.data.onload = () => {
        syn.__phase__ = g.counter( rate, start, end, syn.__bang__, shouldLoop, { shouldWrap:false })

        Gibberish.factory( 
          syn,
          g.mul( 
          g.ifelse( 
            g.and( g.gte( syn.__phase__, start ), g.lt( syn.__phase__, end ) ),
            g.peek( 
              syn.data, 
              syn.__phase__,
              { mode:'samples' }
            ),
            0
          ), g.in('gain') ),
          'sampler', 
          props 
        ) 

        if( syn.end === -999999999 ) syn.end = syn.data.buffer.length - 1

        if( syn.onload !== null ) { syn.onload() }

        Gibberish.dirty( syn )
      }
    }

    return syn
  }
  
  Sampler.defaults = {
    gain: 1,
    pan: .5,
    rate: 1,
    panVoices:false,
    loops: 0,
    start:0,
    end:-999999999
  }

  let PolySampler = Gibberish.PolyTemplate( Sampler, ['rate','pan','gain','start','end','loops'] ) 

  return [ Sampler, PolySampler ]
}

},{"./instrument.js":33,"genish.js":94}],41:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )
  
module.exports = function( Gibberish ) {

  let Snare = argumentProps => {
    let snare = Object.create( instrument ),
        decay = g.in( 'decay' ),
        scaledDecay = g.mul( decay, g.gen.samplerate * 2 ),
        snappy= g.in( 'snappy' ),
        tune  = g.in( 'tune' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Snare.defaults, argumentProps )

    let eg = g.decay( scaledDecay, { initValue:0 } ), 
        check = g.memo( g.gt( eg, .0005 ) ),
        rnd = g.mul( g.noise(), eg ),
        hpf = g.svf( rnd, g.add( 1000, g.mul( g.add( 1, tune), 1000 ) ), .5, 1, false ),
        snap = g.gtp( g.mul( hpf, snappy ), 0 ), // rectify
        bpf1 = g.svf( eg, g.mul( 180, g.add( tune, 1 ) ), .05, 2, false ),
        bpf2 = g.svf( eg, g.mul( 330, g.add( tune, 1 ) ), .05, 2, false ),
        out  = g.memo( g.add( snap, bpf1, g.mul( bpf2, .8 ) ) ), //XXX why is memo needed?
        scaledOut = g.mul( out, gain )
    
    // XXX TODO : make this work with ifelse. the problem is that poke ugens put their
    // code at the bottom of the callback function, instead of at the end of the
    // associated if/else block.
    let ife = g.switch( check, scaledOut, 0 )
    //let ife = g.ifelse( g.gt( eg, .005 ), cycle(440), 0 )
    
    Gibberish.factory( snare, ife, 'snare', props  )
    
    snare.env = eg 

    return snare
  }
  
  Snare.defaults = {
    gain: 1,
    frequency:1000,
    tune:0,
    snappy: 1,
    decay:.1
  }

  return Snare

}

},{"./instrument.js":33,"genish.js":94}],42:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Synth = inputProps => {
    let syn = Object.create( instrument )

    let env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        loudness  = g.in( 'loudness' ), 
        glide = g.in( 'glide' ),
        slidingFreq = g.slide( frequency, glide, glide )

    let props = Object.assign( syn, Synth.defaults, inputProps )

    syn.__createGraph = function() {
      let osc = Gibberish.oscillators.factory( syn.waveform, slidingFreq, syn.antialias )

      let oscWithEnv = g.mul( g.mul( osc, env, loudness ) ),
          panner
  
      const baseCutoffFreq = g.mul( g.in('cutoff'), frequency )
      let cutoff = g.mul( g.mul( baseCutoffFreq, g.pow( 2, g.in('filterMult') )), env )
      const filteredOsc = Gibberish.filters.factory( oscWithEnv, cutoff, g.in('Q'), g.in('saturation'), props )

      let synthWithGain = g.mul( filteredOsc, g.in( 'gain' ) )
  
      if( syn.panVoices === true ) { 
        panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
        syn.graph = [panner.left, panner.right]
      }else{
        syn.graph = synthWithGain
      }
    }
    
    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterType','filterMode' ]
    syn.__createGraph()

    Gibberish.factory( syn, syn.graph, 'synth', props  )

    syn.env = env

    return syn
  }
  
  Synth.defaults = {
    waveform:'saw',
    attack: 44100,
    decay: 44100,
    gain: 1,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:false,
    panVoices:false,
    loudness:1,
    glide:1,
    saturation:1,
    filterMult:2,
    Q:.25,
    cutoff:.5,
    filterType:0,
    filterMode:0,
    isLowPass:1
  }

  // do not include velocity, which shoudl always be per voice
  let PolySynth = Gibberish.PolyTemplate( Synth, ['frequency','attack','decay','pulsewidth','pan','gain','glide', 'saturation', 'filterMult', 'Q', 'cutoff', 'resonance', 'antialias', 'filterType', 'waveform', 'filterMode'] ) 

  return [ Synth, PolySynth ]

}

},{"./instrument.js":33,"genish.js":94}],43:[function(require,module,exports){
module.exports = function( Gibberish ) {

  let Binops = {
    export( obj ) {
      for( let key in Binops ) {
        if( key !== 'export' ) {
          obj[ key ] = Binops[ key ]
        }
      }
    },
    
    Add( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'+', inputs:args, ugenName:'add' + id, id }
    },

    Sub( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'-', inputs:args, ugenName:'sub' + id, id }
    },

    Mul( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'*', inputs:args, ugenName:'mul' + id, id }
    },

    Div( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'/', inputs:args, ugenName:'div' + id, id }
    },

    Mod( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'%', inputs:args, ugenName:'mod' + id, id }
    },   
  }

  return Binops
}

},{}],44:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  let Bus = { 
    factory: null,//Gibberish.factory( g.add( 0 ) , 'bus', [ 0, 1 ]  ),

    create() {
      let bus = Object.create( ugen )
      
      bus.callback = function() {
        let output = 0
       // output[ 0 ] = output[ 1 ] = 0

        for( let i = 0, length = arguments.length; i < length; i++ ) {
          output += arguments[ i ]
          //output[ 0 ] += input
          //output[ 1 ] += input
        }

        return output
      }

      bus.id = Gibberish.factory.getUID()
      bus.dirty = true
      bus.type = 'bus'
      bus.ugenName = 'bus_' + bus.id
      bus.inputs = []
      bus.inputNames = []

      bus.chain = ( target, level = 1 ) => {
        this.connect( target, level )
        return target
      }

      bus.disconnectUgen = ( ugen ) => {
        let removeIdx = -1
        for( let i = 0; i < this.inputs.length; i++ ) {
          let input = this.inputs[ i ]

          if( isNaN( input ) && ugen === input ) {
            removeIdx = i
            break;
          }
        }
        
        if( removeIdx !== -1 ) {
          this.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( this )
        }
      }
      
      return bus
    }
  }

  return Bus.create

}


},{"../ugen.js":55,"genish.js":94}],45:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  let Bus2 = { 
    create() {
      let output = new Float32Array( 2 )

      let bus = Object.create( ugen )

      Object.assign( bus, {
        callback() {
          output[ 0 ] = output[ 1 ] = 0

          for( let i = 0, length = arguments.length; i < length; i++ ) {
            let input = arguments[ i ],
                isArray = input instanceof Float32Array

            output[ 0 ] += isArray ? input[ 0 ] : input
            output[ 1 ] += isArray ? input[ 1 ] : input
          }

          return output
        },
        id : Gibberish.factory.getUID(),
        dirty : true,
        type : 'bus',
        inputs : [],
        inputNames : [],
      })

      bus.ugenName = bus.callback.ugenName = 'bus2_' + bus.id

      bus.disconnectUgen = function( ugen ) {
        let removeIdx = this.inputs.indexOf( ugen )
        
        if( removeIdx !== -1 ) {
          this.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( this )
        }
      }
      
      return bus
    }
  }

  return Bus2.create

}


},{"../ugen.js":55,"genish.js":94}],46:[function(require,module,exports){
const  g    = require( 'genish.js'  ),
       ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  const Monops = {
    export( obj ) {
      for( let key in Monops ) {
        if( key !== 'export' ) {
          obj[ key ] = Monops[ key ]
        }
      }
    },
    
    Abs( input ) {
      const abs = Object.create( ugen )
      const graph = g.abs( g.in('input') )
      
      Gibberish.factory( abs, graph, 'abs', Object.assign({}, Monops.defaults, { input }) )

      return abs
    },

    Pow( input, exponent ) {
      const pow = Object.create( ugen )
      const graph = g.pow( g.in('input'), g.in('exponent') )
      
      Gibberish.factory( pow, graph, 'abs', Object.assign({}, Monops.defaults, { input, exponent }) )

      return pow
    },

    Merge( input ) {
      const merger = Object.create( ugen )
      const cb = function( _input ) {
        return _input[0] + _input[1]
      }

      Gibberish.factory( merger, g.in( 'input' ), 'merge', { input }, cb )
      merger.type = 'analysis'
      merger.inputNames = [ 'input' ]
      merger.inputs = [ input ]
      merger.input = input
      
      return merger
    },
  }

  Monops.defaults = { input:0 }

  return Monops
}

},{"../ugen.js":55,"genish.js":94}],47:[function(require,module,exports){
const genish = require('genish.js'),
      ssd = genish.history,
      noise = genish.noise;

module.exports = function () {
  const last = ssd(0);

  const white = genish.sub(genish.mul(noise(), 2), 1);

  let out = genish.add(last.out, genish.div(genish.mul(.02, white), 1.02));

  last.in(out);

  out = genish.mul(out, 3.5);

  return out;
};

/*
for (var i = 0; i < bufferSize; i++) {
    var white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // (roughly) compensate for gain
}
*/
},{"genish.js":94}],48:[function(require,module,exports){
let g = require( 'genish.js' )

let feedbackOsc = function( frequency, filter, pulsewidth=.5, argumentProps ) {
  if( argumentProps === undefined ) argumentProps = { type: 0 }

  let lastSample = g.history(),
      // determine phase increment and memoize result
      w = g.memo( g.div( frequency, g.gen.samplerate ) ),
      // create scaling factor
      n = g.sub( -.5, w ),
      scaling = g.mul( g.mul( 13, filter ), g.pow( n, 5 ) ),
      // calculate dc offset and normalization factors
      DC = g.sub( .376, g.mul( w, .752 ) ),
      norm = g.sub( 1, g.mul( 2, w ) ),
      // determine phase
      osc1Phase = g.accum( w, 0, { min:-1 }),
      osc1, out

  // create current sample... from the paper:
  // osc = (osc + sin(2*pi*(phase + osc*scaling)))*0.5f;
  osc1 = g.memo( 
    g.mul(
      g.add(
        lastSample.out,
        g.sin(
          g.mul(
            Math.PI * 2,
            g.memo( g.add( osc1Phase, g.mul( lastSample.out, scaling ) ) )
          )
        )
      ),
      .5
    )
  )

  // store sample to use as modulation
  lastSample.in( osc1 )

  // if pwm / square waveform instead of sawtooth...
  if( argumentProps.type === 1 ) { 
    const lastSample2 = g.history() // for osc 2
    const lastSampleMaster = g.history() // for sum of osc1,osc2

    const osc2 = g.mul(
      g.add(
        lastSample2.out,
        g.sin(
          g.mul(
            Math.PI * 2,
            g.memo( g.add( osc1Phase, g.mul( lastSample2.out, scaling ), pulsewidth ) )
          )
        )
      ),
      .5
    )

    lastSample2.in( osc2 )
    out = g.memo( g.sub( lastSample.out, lastSample2.out ) )
    out = g.memo( g.add( g.mul( 2.5, out ), g.mul( -1.5, lastSampleMaster.out ) ) )
    
    lastSampleMaster.in( g.sub( osc1, osc2 ) )

  }else{
     // offset and normalize
    osc1 = g.add( g.mul( 2.5, osc1 ), g.mul( -1.5, lastSample.out ) )
    osc1 = g.add( osc1, DC )
 
    out = osc1
  }

  return g.mul( out, norm )
}

module.exports = feedbackOsc

},{"genish.js":94}],49:[function(require,module,exports){
const g = require( 'genish.js' ),
      ugen = require( '../ugen.js' ),
      feedbackOsc = require( './fmfeedbackosc.js' )

//  __makeOscillator__( type, frequency, antialias ) {
    
module.exports = function( Gibberish ) {
  let Oscillators = {
    export( obj ) {
      for( let key in Oscillators ) {
        if( key !== 'export' ) {
          obj[ key ] = Oscillators[ key ]
        }
      }
    },

    genish: {
      Brown: require( './brownnoise.js' ),
      Pink:  require( './pinknoise.js'  )
    },

    Wavetable: require( './wavetable.js' )( Gibberish ),
    
    Square( inputProps ) {
      const sqr   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'square', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      Gibberish.factory( sqr, graph, 'sqr', props )

      return sqr
    },

    PWM( inputProps ) {
      const pwm   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false, pulsewidth:.25 }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'pwm', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      Gibberish.factory( pwm, graph, 'pwm', props )

      return pwm
    },

    Sine( inputProps ) {
      const sine  = Object.create( ugen )
      const props = Object.assign({}, Oscillators.defaults, inputProps )
      const graph = g.mul( g.cycle( g.in('frequency') ), g.in('gain') )

      Gibberish.factory( sine, graph, 'sine', props )
      
      return sine
    },

    Noise( inputProps ) {
      const noise = Object.create( ugen )
      const props = Object.assign( {}, { gain: 1, color:'white' }, inputProps )
      let graph 

      switch( props.color ) {
        case 'brown':
          graph = g.mul( Oscillators.genish.Brown(), g.in('gain') )
          break;
        case 'pink':
          graph = g.mul( Oscillators.genish.Pink(), g.in('gain') )
          break;
        default:
          graph = g.mul( g.noise(), g.in('gain') )
          break;
      }

      Gibberish.factory( noise, graph, 'noise', props )

      return noise
    },

    Saw( inputProps ) {
      const saw   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'saw', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      Gibberish.factory( saw, graph, 'saw', props )

      return saw
    },

    ReverseSaw( inputProps ) {
      const saw   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = g.sub( 1, Oscillators.factory( 'saw', g.in( 'frequency' ), props.antialias ) )
      const graph = g.mul( osc, g.in( 'gain' ) )

      Gibberish.factory( saw, graph, 'rsaw', props )
      
      return saw
    },

    factory( type, frequency, antialias=false ) {
      let osc

      switch( type ) {
        case 'saw':
          if( antialias === false ) {
            osc = g.phasor( frequency )
          }else{
            osc = feedbackOsc( frequency, 1 )
          }
          break;
        case 'square':
          if( antialias === true ) {
            osc = feedbackOsc( frequency, 1, .5, { type:1 })
          }else{
            osc = g.wavetable( frequency, { buffer:Oscillators.Square.buffer, name:'square' } )
          }
          break;
        case 'sine':
          osc = g.cycle( frequency )
          break;
        case 'pwm':
          let pulsewidth = g.in('pulsewidth')
          if( antialias === true ) {
            osc = feedbackOsc( frequency, 1, pulsewidth, { type:1 })
          }else{
            let phase = g.phasor( frequency, 0, { min:0 } )
            osc = g.lt( phase, pulsewidth )
          }
          break;
      }

      return osc
    }
  }

  Oscillators.Square.buffer = new Float32Array( 1024 )

  for( let i = 1023; i >= 0; i-- ) { 
    Oscillators.Square.buffer [ i ] = i / 1024 > .5 ? 1 : -1
  }

  Oscillators.defaults = {
    frequency: 440,
    gain: 1
  }

  return Oscillators

}

},{"../ugen.js":55,"./brownnoise.js":47,"./fmfeedbackosc.js":48,"./pinknoise.js":50,"./wavetable.js":51,"genish.js":94}],50:[function(require,module,exports){
const genish = require('genish.js'),
      ssd = genish.history,
      noise = genish.noise;

module.exports = function () {
  const b0 = ssd(0),
        b1 = ssd(0),
        b2 = ssd(0),
        b3 = ssd(0),
        b4 = ssd(0),
        b5 = ssd(0),
        b6 = ssd(0);
  const white = genish.sub(genish.mul(noise(), 2), 1);

  b0.in(genish.add(genish.mul(.99886, b0.out), genish.mul(white, .0555179)));
  b1.in(genish.add(genish.mul(.99332, b1.out), genish.mul(white, .0750579)));
  b2.in(genish.add(genish.mul(.96900, b2.out), genish.mul(white, .1538520)));
  b3.in(genish.add(genish.mul(.88650, b3.out), genish.mul(white, .3104856)));
  b4.in(genish.add(genish.mul(.55000, b4.out), genish.mul(white, .5329522)));
  b5.in(genish.sub(genish.mul(-.7616, b5.out), genish.mul(white, .0168980)));

  out = genish.mul(genish.add(genish.add(genish.add(genish.add(genish.add(genish.add(genish.add(b0.out, b0.out), b0.out), b0.out), b0.out), b0.out), b0.out), genish.mul(white, .5362)), .11);

  b6.in(genish.mul(white, .115926));

  return out;
};
},{"genish.js":94}],51:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  const Wavetable = function( inputProps ) {
    const wavetable = Object.create( ugen )
    const props  = Object.assign({}, Gibberish.oscillators.defaults, inputProps )
    const osc = g.wavetable( g.in('frequency'), props )
    const graph = g.mul( 
      osc, 
      g.in( 'gain' )
    )

    Gibberish.factory( wavetable, graph, 'wavetable', props )

    return wavetable
  }

  g.wavetable = function( frequency, props ) {
    let dataProps = { immutable:true }

    // use global references if applicable
    if( props.name !== undefined ) dataProps.global = props.name

    const buffer = g.data( props.buffer, 1, dataProps )

    return g.peek( buffer, g.phasor( frequency, 0, { min:0 } ) )
  }

  return Wavetable
}

},{"../ugen.js":55,"genish.js":94}],52:[function(require,module,exports){
const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )

let Scheduler = {
  phase: 0,

  queue: new Queue( ( a, b ) => {
    if( a.time === b.time ) { //a.time.eq( b.time ) ) {
      return b.priority - a.priority
    }else{
      return a.time - b.time //a.time.minus( b.time )
    }
  }),

  clear() {
    this.queue.data.length = 0
    this.queue.length = 0
  },

  add( time, func, priority = 0 ) {
    time += this.phase

    this.queue.push({ time, func, priority })
  },

  tick() {
    if( this.queue.length ) {
      let next = this.queue.peek()

      while( this.phase >= next.time ) {
        next.func()
        this.queue.pop()
        next = this.queue.peek()
      }

    }

    this.phase++
  },
}

module.exports = Scheduler

},{"../external/priorityqueue.js":7,"big.js":58}],53:[function(require,module,exports){
const g = require( 'genish.js' ),
      ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
  const __proto__ = Object.create( ugen )

  Object.assign( __proto__, {
    start() {
      this.connect()
      return this
    },
    stop() {
      this.disconnect()
      return this
    }
  })

  const Seq2 = { 
    create( inputProps ) {
      const seq = Object.create( __proto__ ),
            props = Object.assign({}, Seq2.defaults, inputProps )

      seq.phase = 0
      seq.inputNames = [ 'rate' ]
      seq.inputs = [ 1 ]
      seq.nextTime = 0
      seq.valuesPhase = 0
      seq.timingsPhase = 0
      seq.id = Gibberish.factory.getUID()
      seq.dirty = true
      seq.type = 'seq'

      if( props.target === undefined ) {
        seq.anonFunction = true
      }else{ 
        seq.anonFunction = false
        seq.callFunction = typeof props.target[ props.key ] === 'function'
      }

      Object.assign( seq, props )

      seq.callback = function( rate ) {
        if( seq.phase >= seq.nextTime ) {
          let value = seq.values[ seq.valuesPhase++ % seq.values.length ]

          if( seq.anonFunction || typeof value === 'function' ) value = value()
          
          if( seq.anonFunction === false ) {
            if( seq.callFunction === false ) {
              seq.target[ seq.key ] = value
            }else{
              seq.target[ seq.key ]( value ) 
            }
          }

          seq.phase -= seq.nextTime

          let timing = seq.timings[ seq.timingsPhase++ % seq.timings.length ]
          if( typeof timing === 'function' ) timing = timing()

          seq.nextTime = timing
        }

        seq.phase += rate

        return 0
      }

      seq.ugenName = seq.callback.ugenName = 'seq_' + seq.id
      
      let value = seq.rate
      Object.defineProperty( seq, 'rate', {
        get() { return value },
        set( v ) {
          if( value !== v ) {
            Gibberish.dirty( seq )
            value = v
          }
        }
      })

      return seq
    }
  }

  Seq2.defaults = { rate: 1 }

  return Seq2.create

}


},{"../ugen.js":55,"genish.js":94}],54:[function(require,module,exports){
const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )

module.exports = function( Gibberish ) {

let Sequencer = props => {
  let seq = {
    __isRunning:false,
    key: props.key, 
    target:  props.target,
    values:  props.values,
    timings: props.timings,
    __valuesPhase:  0,
    __timingsPhase: 0,
    priority: props.priority === undefined ? 0 : props.priority,

    tick() {
      let value  = seq.values[  seq.__valuesPhase++  % seq.values.length  ],
          timing = seq.timings[ seq.__timingsPhase++ % seq.timings.length ]

      if( typeof timing === 'function' ) timing = timing()

      if( typeof value === 'function' && seq.target === undefined ) {
        value()
      }else if( typeof seq.target[ seq.key ] === 'function' ) {
        if( typeof value === 'function' ) value = value()
        seq.target[ seq.key ]( value )
      }else{
        if( typeof value === 'function' ) value = value()
        seq.target[ seq.key ] = value
      }
      
      if( seq.__isRunning === true ) {
        Gibberish.scheduler.add( timing, seq.tick, seq.priority )
      }
    },

    start( delay = 0 ) {
      seq.__isRunning = true
      Gibberish.scheduler.add( delay, seq.tick, seq.priority )
      return seq
    },

    stop() {
      seq.__isRunning = false
      return seq
    }
  }

  return seq 
}

Sequencer.make = function( values, timings, target, key ) {
  return Sequencer({ values, timings, target, key })
}

return Sequencer

}

},{"../external/priorityqueue.js":7,"big.js":58}],55:[function(require,module,exports){
let ugen = {
  free() {
    Gibberish.genish.gen.free( this.graph )
  },

  print() {
    console.log( this.callback.toString() )
  },

  connect( target, level=1 ) {
    if( this.connected === undefined ) this.connected = []

    let input = level === 1 ? this : Gibberish.binops.Mul( this, level )

    if( target === undefined || target === null ) target = Gibberish.output 

    if( target.inputs )
      target.inputs.push( input )
    else
      target.input = input

    Gibberish.dirty( target )

    this.connected.push([ target, input ])
    
    return this
  },

  disconnect( target ) {
    if( target === undefined ){
      for( let connection of this.connected ) {
        connection[0].disconnectUgen( connection[1] )
      }
      this.connected.length = 0
    }else{
      const connection = this.connected.find( v => v[0] === target )
      target.disconnectUgen( connection[1] )
      const targetIdx = this.connected.indexOf( connection )
      this.connected.splice( targetIdx, 1 )
    }
  },

  chain( target, level=1 ) {
    this.connect( target,level )

    return target
  },

  __redoGraph() {
    this.__createGraph()
    this.callback = Gibberish.genish.gen.createCallback( this.graph, Gibberish.memory, false, true )
    this.inputNames = Gibberish.genish.gen.parameters.slice(0)
    this.callback.ugenName = this.ugenName
  },
}

module.exports = ugen

},{}],56:[function(require,module,exports){
module.exports = function( Gibberish ) {
  let uid = 0

  let factory = function( ugen, graph, name, values, cb ) {
    ugen.callback = cb === undefined ? Gibberish.genish.gen.createCallback( graph, Gibberish.memory, false, true ) : cb

    Object.assign( ugen, {
      type: 'ugen',
      id: factory.getUID(), 
      ugenName: name + '_',
      graph: graph,
      inputNames: Gibberish.genish.gen.parameters.slice(0),
      isStereo: Array.isArray( graph ),
      dirty: true
    })
    
    ugen.ugenName += ugen.id
    ugen.callback.ugenName = ugen.ugenName // XXX hacky

    for( let param of ugen.inputNames ) {
      if( param === 'memory' ) continue

      let value = values[ param ]

      // TODO: do we need to check for a setter?
      let desc = Object.getOwnPropertyDescriptor( ugen, param ),
          setter

      if( desc !== undefined ) {
        setter = desc.set
      }

      Object.defineProperty( ugen, param, {
        get() { return value },
        set( v ) {
          if( value !== v ) {
            Gibberish.dirty( ugen )
            if( setter !== undefined ) setter( v )
            value = v
          }
        }
      })
    }

    if( ugen.__requiresRecompilation !== undefined ) {
      ugen.__requiresRecompilation.forEach( prop => {
        let value = ugen[ prop ]
        Object.defineProperty( ugen, prop, {
          get() { return value },
          set( v ) {
            if( value !== v ) {
              value = v
              this.__redoGraph()
            }
          }
        })
      })      
    }
    return ugen
  }

  factory.getUID = () => uid++

  return factory
}

},{}],57:[function(require,module,exports){
let genish = require( 'genish.js' )

module.exports = function( Gibberish ) {

let utilities = {
  createContext() {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext
    Gibberish.ctx = new AC()
    genish.gen.samplerate = Gibberish.ctx.sampleRate
    genish.utilities.ctx = Gibberish.ctx

    let start = () => {
      if( typeof AC !== 'undefined' ) {
        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )

          if( 'ontouchstart' in document.documentElement ){ // required to start audio under iOS 6
            let mySource = utilities.ctx.createBufferSource()
            mySource.connect( utilities.ctx.destination )
            mySource.noteOn( 0 )
          }
         }
      }
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }

    return Gibberish.ctx
  },

  createScriptProcessor() {
    Gibberish.node = Gibberish.ctx.createScriptProcessor( 1024, 0, 2 ),
    Gibberish.clearFunction = function() { return 0 },
    Gibberish.callback = Gibberish.clearFunction

    Gibberish.node.onaudioprocess = function( audioProcessingEvent ) {
      let gibberish = Gibberish,
          callback  = gibberish.callback,
          outputBuffer = audioProcessingEvent.outputBuffer,
          scheduler = Gibberish.scheduler,
          //objs = gibberish.callbackUgens.slice( 0 ),
          length

      let left = outputBuffer.getChannelData( 0 ),
          right= outputBuffer.getChannelData( 1 )

      let callbacklength = Gibberish.blockCallbacks.length
      
      if( callbacklength !== 0 ) {
        for( let i=0; i< callbacklength; i++ ) {
          Gibberish.blockCallbacks[ i ]()
        }

        // can't just set length to 0 as callbacks might be added during for loop, so splice pre-existing functions
        Gibberish.blockCallbacks.splice( 0, callbacklength )
      }

      for (let sample = 0, length = left.length; sample < length; sample++) {
        scheduler.tick()

        if( gibberish.graphIsDirty ) { 
          callback = gibberish.generateCallback()
        }
        
        // XXX cant use destructuring, babel makes it something inefficient...
        let out = callback.apply( null, gibberish.callbackUgens )

        left[ sample  ] = out[0]
        right[ sample ] = out[1]
      }
    }

    Gibberish.node.connect( Gibberish.ctx.destination )

    return Gibberish.node
  }, 
}

return utilities
}

},{"genish.js":94}],58:[function(require,module,exports){
/* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
;(function (global) {
    'use strict';

/*
  big.js v3.1.3
  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
  https://github.com/MikeMcl/big.js/
  Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>
  MIT Expat Licence
*/

/***************************** EDITABLE DEFAULTS ******************************/

    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places of the results of operations
     * involving division: div and sqrt, and pow with negative exponents.
     */
    var DP = 20,                           // 0 to MAX_DP

        /*
         * The rounding mode used when rounding to the above decimal places.
         *
         * 0 Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
         * 1 To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
         * 2 To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
         * 3 Away from zero.                                  (ROUND_UP)
         */
        RM = 1,                            // 0, 1, 2 or 3

        // The maximum value of DP and Big.DP.
        MAX_DP = 1E6,                      // 0 to 1000000

        // The maximum magnitude of the exponent argument to the pow method.
        MAX_POWER = 1E6,                   // 1 to 1000000

        /*
         * The exponent value at and beneath which toString returns exponential
         * notation.
         * JavaScript's Number type: -7
         * -1000000 is the minimum recommended exponent value of a Big.
         */
        E_NEG = -7,                   // 0 to -1000000

        /*
         * The exponent value at and above which toString returns exponential
         * notation.
         * JavaScript's Number type: 21
         * 1000000 is the maximum recommended exponent value of a Big.
         * (This limit is not enforced or checked.)
         */
        E_POS = 21,                   // 0 to 1000000

/******************************************************************************/

        // The shared prototype object.
        P = {},
        isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        Big;


    /*
     * Create and return a Big constructor.
     *
     */
    function bigFactory() {

        /*
         * The Big constructor and exported function.
         * Create and return a new instance of a Big number object.
         *
         * n {number|string|Big} A numeric value.
         */
        function Big(n) {
            var x = this;

            // Enable constructor usage without new.
            if (!(x instanceof Big)) {
                return n === void 0 ? bigFactory() : new Big(n);
            }

            // Duplicate.
            if (n instanceof Big) {
                x.s = n.s;
                x.e = n.e;
                x.c = n.c.slice();
            } else {
                parse(x, n);
            }

            /*
             * Retain a reference to this Big constructor, and shadow
             * Big.prototype.constructor which points to Object.
             */
            x.constructor = Big;
        }

        Big.prototype = P;
        Big.DP = DP;
        Big.RM = RM;
        Big.E_NEG = E_NEG;
        Big.E_POS = E_POS;

        return Big;
    }


    // Private functions


    /*
     * Return a string representing the value of Big x in normal or exponential
     * notation to dp fixed decimal places or significant digits.
     *
     * x {Big} The Big to format.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
     */
    function format(x, dp, toE) {
        var Big = x.constructor,

            // The index (normal notation) of the digit that may be rounded up.
            i = dp - (x = new Big(x)).e,
            c = x.c;

        // Round?
        if (c.length > ++dp) {
            rnd(x, i, Big.RM);
        }

        if (!c[0]) {
            ++i;
        } else if (toE) {
            i = dp;

        // toFixed
        } else {
            c = x.c;

            // Recalculate i as x.e may have changed if value rounded up.
            i = x.e + i + 1;
        }

        // Append zeros?
        for (; c.length < i; c.push(0)) {
        }
        i = x.e;

        /*
         * toPrecision returns exponential notation if the number of
         * significant digits specified is less than the number of digits
         * necessary to represent the integer part of the value in normal
         * notation.
         */
        return toE === 1 || toE && (dp <= i || i <= Big.E_NEG) ?

          // Exponential notation.
          (x.s < 0 && c[0] ? '-' : '') +
            (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) +
              (i < 0 ? 'e' : 'e+') + i

          // Normal notation.
          : x.toString();
    }


    /*
     * Parse the number or string value passed to a Big constructor.
     *
     * x {Big} A Big number instance.
     * n {number|string} A numeric value.
     */
    function parse(x, n) {
        var e, i, nL;

        // Minus zero?
        if (n === 0 && 1 / n < 0) {
            n = '-0';

        // Ensure n is string and check validity.
        } else if (!isValid.test(n += '')) {
            throwErr(NaN);
        }

        // Determine sign.
        x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

        // Decimal point?
        if ((e = n.indexOf('.')) > -1) {
            n = n.replace('.', '');
        }

        // Exponential form?
        if ((i = n.search(/e/i)) > 0) {

            // Determine exponent.
            if (e < 0) {
                e = i;
            }
            e += +n.slice(i + 1);
            n = n.substring(0, i);

        } else if (e < 0) {

            // Integer.
            e = n.length;
        }

        // Determine leading zeros.
        for (i = 0; n.charAt(i) == '0'; i++) {
        }

        if (i == (nL = n.length)) {

            // Zero.
            x.c = [ x.e = 0 ];
        } else {

            // Determine trailing zeros.
            for (; n.charAt(--nL) == '0';) {
            }

            x.e = e - i - 1;
            x.c = [];

            // Convert string to array of digits without leading/trailing zeros.
            for (e = 0; i <= nL; x.c[e++] = +n.charAt(i++)) {
            }
        }

        return x;
    }


    /*
     * Round Big x to a maximum of dp decimal places using rounding mode rm.
     * Called by div, sqrt and round.
     *
     * x {Big} The Big to round.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
     * [more] {boolean} Whether the result of division was truncated.
     */
    function rnd(x, dp, rm, more) {
        var u,
            xc = x.c,
            i = x.e + dp + 1;

        if (rm === 1) {

            // xc[i] is the digit after the digit that may be rounded up.
            more = xc[i] >= 5;
        } else if (rm === 2) {
            more = xc[i] > 5 || xc[i] == 5 &&
              (more || i < 0 || xc[i + 1] !== u || xc[i - 1] & 1);
        } else if (rm === 3) {
            more = more || xc[i] !== u || i < 0;
        } else {
            more = false;

            if (rm !== 0) {
                throwErr('!Big.RM!');
            }
        }

        if (i < 1 || !xc[0]) {

            if (more) {

                // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                x.e = -dp;
                x.c = [1];
            } else {

                // Zero.
                x.c = [x.e = 0];
            }
        } else {

            // Remove any digits after the required decimal places.
            xc.length = i--;

            // Round up?
            if (more) {

                // Rounding up may mean the previous digit has to be rounded up.
                for (; ++xc[i] > 9;) {
                    xc[i] = 0;

                    if (!i--) {
                        ++x.e;
                        xc.unshift(1);
                    }
                }
            }

            // Remove trailing zeros.
            for (i = xc.length; !xc[--i]; xc.pop()) {
            }
        }

        return x;
    }


    /*
     * Throw a BigError.
     *
     * message {string} The error message.
     */
    function throwErr(message) {
        var err = new Error(message);
        err.name = 'BigError';

        throw err;
    }


    // Prototype/instance methods


    /*
     * Return a new Big whose value is the absolute value of this Big.
     */
    P.abs = function () {
        var x = new this.constructor(this);
        x.s = 1;

        return x;
    };


    /*
     * Return
     * 1 if the value of this Big is greater than the value of Big y,
     * -1 if the value of this Big is less than the value of Big y, or
     * 0 if they have the same value.
    */
    P.cmp = function (y) {
        var xNeg,
            x = this,
            xc = x.c,
            yc = (y = new x.constructor(y)).c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {
            return !xc[0] ? !yc[0] ? 0 : -j : i;
        }

        // Signs differ?
        if (i != j) {
            return i;
        }
        xNeg = i < 0;

        // Compare exponents.
        if (k != l) {
            return k > l ^ xNeg ? 1 : -1;
        }

        i = -1;
        j = (k = xc.length) < (l = yc.length) ? k : l;

        // Compare digit by digit.
        for (; ++i < j;) {

            if (xc[i] != yc[i]) {
                return xc[i] > yc[i] ^ xNeg ? 1 : -1;
            }
        }

        // Compare lengths.
        return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
    };


    /*
     * Return a new Big whose value is the value of this Big divided by the
     * value of Big y, rounded, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     */
    P.div = function (y) {
        var x = this,
            Big = x.constructor,
            // dividend
            dvd = x.c,
            //divisor
            dvs = (y = new Big(y)).c,
            s = x.s == y.s ? 1 : -1,
            dp = Big.DP;

        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!Big.DP!');
        }

        // Either 0?
        if (!dvd[0] || !dvs[0]) {

            // If both are 0, throw NaN
            if (dvd[0] == dvs[0]) {
                throwErr(NaN);
            }

            // If dvs is 0, throw +-Infinity.
            if (!dvs[0]) {
                throwErr(s / 0);
            }

            // dvd is 0, return +-0.
            return new Big(s * 0);
        }

        var dvsL, dvsT, next, cmp, remI, u,
            dvsZ = dvs.slice(),
            dvdI = dvsL = dvs.length,
            dvdL = dvd.length,
            // remainder
            rem = dvd.slice(0, dvsL),
            remL = rem.length,
            // quotient
            q = y,
            qc = q.c = [],
            qi = 0,
            digits = dp + (q.e = x.e - y.e) + 1;

        q.s = s;
        s = digits < 0 ? 0 : digits;

        // Create version of divisor with leading zero.
        dvsZ.unshift(0);

        // Add zeros to make remainder as long as divisor.
        for (; remL++ < dvsL; rem.push(0)) {
        }

        do {

            // 'next' is how many times the divisor goes into current remainder.
            for (next = 0; next < 10; next++) {

                // Compare divisor and remainder.
                if (dvsL != (remL = rem.length)) {
                    cmp = dvsL > remL ? 1 : -1;
                } else {

                    for (remI = -1, cmp = 0; ++remI < dvsL;) {

                        if (dvs[remI] != rem[remI]) {
                            cmp = dvs[remI] > rem[remI] ? 1 : -1;
                            break;
                        }
                    }
                }

                // If divisor < remainder, subtract divisor from remainder.
                if (cmp < 0) {

                    // Remainder can't be more than 1 digit longer than divisor.
                    // Equalise lengths using divisor with extra leading zero?
                    for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {

                        if (rem[--remL] < dvsT[remL]) {
                            remI = remL;

                            for (; remI && !rem[--remI]; rem[remI] = 9) {
                            }
                            --rem[remI];
                            rem[remL] += 10;
                        }
                        rem[remL] -= dvsT[remL];
                    }
                    for (; !rem[0]; rem.shift()) {
                    }
                } else {
                    break;
                }
            }

            // Add the 'next' digit to the result array.
            qc[qi++] = cmp ? next : ++next;

            // Update the remainder.
            if (rem[0] && cmp) {
                rem[remL] = dvd[dvdI] || 0;
            } else {
                rem = [ dvd[dvdI] ];
            }

        } while ((dvdI++ < dvdL || rem[0] !== u) && s--);

        // Leading zero? Do not remove if result is simply zero (qi == 1).
        if (!qc[0] && qi != 1) {

            // There can't be more than one zero.
            qc.shift();
            q.e--;
        }

        // Round?
        if (qi > digits) {
            rnd(q, dp, Big.RM, rem[0] !== u);
        }

        return q;
    };


    /*
     * Return true if the value of this Big is equal to the value of Big y,
     * otherwise returns false.
     */
    P.eq = function (y) {
        return !this.cmp(y);
    };


    /*
     * Return true if the value of this Big is greater than the value of Big y,
     * otherwise returns false.
     */
    P.gt = function (y) {
        return this.cmp(y) > 0;
    };


    /*
     * Return true if the value of this Big is greater than or equal to the
     * value of Big y, otherwise returns false.
     */
    P.gte = function (y) {
        return this.cmp(y) > -1;
    };


    /*
     * Return true if the value of this Big is less than the value of Big y,
     * otherwise returns false.
     */
    P.lt = function (y) {
        return this.cmp(y) < 0;
    };


    /*
     * Return true if the value of this Big is less than or equal to the value
     * of Big y, otherwise returns false.
     */
    P.lte = function (y) {
         return this.cmp(y) < 1;
    };


    /*
     * Return a new Big whose value is the value of this Big minus the value
     * of Big y.
     */
    P.sub = P.minus = function (y) {
        var i, j, t, xLTy,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.plus(y);
        }

        var xc = x.c.slice(),
            xe = x.e,
            yc = y.c,
            ye = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
        }

        // Determine which is the bigger number.
        // Prepend zeros to equalise exponents.
        if (a = xe - ye) {

            if (xLTy = a < 0) {
                a = -a;
                t = xc;
            } else {
                ye = xe;
                t = yc;
            }

            t.reverse();
            for (b = a; b--; t.push(0)) {
            }
            t.reverse();
        } else {

            // Exponents equal. Check digit by digit.
            j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

            for (a = b = 0; b < j; b++) {

                if (xc[b] != yc[b]) {
                    xLTy = xc[b] < yc[b];
                    break;
                }
            }
        }

        // x < y? Point xc to the array of the bigger number.
        if (xLTy) {
            t = xc;
            xc = yc;
            yc = t;
            y.s = -y.s;
        }

        /*
         * Append zeros to xc if shorter. No need to add zeros to yc if shorter
         * as subtraction only needs to start at yc.length.
         */
        if (( b = (j = yc.length) - (i = xc.length) ) > 0) {

            for (; b--; xc[i++] = 0) {
            }
        }

        // Subtract yc from xc.
        for (b = i; j > a;){

            if (xc[--j] < yc[j]) {

                for (i = j; i && !xc[--i]; xc[i] = 9) {
                }
                --xc[i];
                xc[j] += 10;
            }
            xc[j] -= yc[j];
        }

        // Remove trailing zeros.
        for (; xc[--b] === 0; xc.pop()) {
        }

        // Remove leading zeros and adjust exponent accordingly.
        for (; xc[0] === 0;) {
            xc.shift();
            --ye;
        }

        if (!xc[0]) {

            // n - n = +0
            y.s = 1;

            // Result must be zero.
            xc = [ye = 0];
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a new Big whose value is the value of this Big modulo the
     * value of Big y.
     */
    P.mod = function (y) {
        var yGTx,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        if (!y.c[0]) {
            throwErr(NaN);
        }

        x.s = y.s = 1;
        yGTx = y.cmp(x) == 1;
        x.s = a;
        y.s = b;

        if (yGTx) {
            return new Big(x);
        }

        a = Big.DP;
        b = Big.RM;
        Big.DP = Big.RM = 0;
        x = x.div(y);
        Big.DP = a;
        Big.RM = b;

        return this.minus( x.times(y) );
    };


    /*
     * Return a new Big whose value is the value of this Big plus the value
     * of Big y.
     */
    P.add = P.plus = function (y) {
        var t,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.minus(y);
        }

        var xe = x.e,
            xc = x.c,
            ye = y.e,
            yc = y.c;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? y : new Big(xc[0] ? x : a * 0);
        }
        xc = xc.slice();

        // Prepend zeros to equalise exponents.
        // Note: Faster to use reverse then do unshifts.
        if (a = xe - ye) {

            if (a > 0) {
                ye = xe;
                t = yc;
            } else {
                a = -a;
                t = xc;
            }

            t.reverse();
            for (; a--; t.push(0)) {
            }
            t.reverse();
        }

        // Point xc to the longer array.
        if (xc.length - yc.length < 0) {
            t = yc;
            yc = xc;
            xc = t;
        }
        a = yc.length;

        /*
         * Only start adding at yc.length - 1 as the further digits of xc can be
         * left as they are.
         */
        for (b = 0; a;) {
            b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
            xc[a] %= 10;
        }

        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

        if (b) {
            xc.unshift(b);
            ++ye;
        }

         // Remove trailing zeros.
        for (a = xc.length; xc[--a] === 0; xc.pop()) {
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a Big whose value is the value of this Big raised to the power n.
     * If n is negative, round, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     *
     * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
     */
    P.pow = function (n) {
        var x = this,
            one = new x.constructor(1),
            y = one,
            isNeg = n < 0;

        if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
            throwErr('!pow!');
        }

        n = isNeg ? -n : n;

        for (;;) {

            if (n & 1) {
                y = y.times(x);
            }
            n >>= 1;

            if (!n) {
                break;
            }
            x = x.times(x);
        }

        return isNeg ? one.div(y) : y;
    };


    /*
     * Return a new Big whose value is the value of this Big rounded to a
     * maximum of dp decimal places using rounding mode rm.
     * If dp is not specified, round to 0 decimal places.
     * If rm is not specified, use Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     * [rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
     */
    P.round = function (dp, rm) {
        var x = this,
            Big = x.constructor;

        if (dp == null) {
            dp = 0;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!round!');
        }
        rnd(x = new Big(x), dp, rm == null ? Big.RM : rm);

        return x;
    };


    /*
     * Return a new Big whose value is the square root of the value of this Big,
     * rounded, if necessary, to a maximum of Big.DP decimal places using
     * rounding mode Big.RM.
     */
    P.sqrt = function () {
        var estimate, r, approx,
            x = this,
            Big = x.constructor,
            xc = x.c,
            i = x.s,
            e = x.e,
            half = new Big('0.5');

        // Zero?
        if (!xc[0]) {
            return new Big(x);
        }

        // If negative, throw NaN.
        if (i < 0) {
            throwErr(NaN);
        }

        // Estimate.
        i = Math.sqrt(x.toString());

        // Math.sqrt underflow/overflow?
        // Pass x to Math.sqrt as integer, then adjust the result exponent.
        if (i === 0 || i === 1 / 0) {
            estimate = xc.join('');

            if (!(estimate.length + e & 1)) {
                estimate += '0';
            }

            r = new Big( Math.sqrt(estimate).toString() );
            r.e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
        } else {
            r = new Big(i.toString());
        }

        i = r.e + (Big.DP += 4);

        // Newton-Raphson iteration.
        do {
            approx = r;
            r = half.times( approx.plus( x.div(approx) ) );
        } while ( approx.c.slice(0, i).join('') !==
                       r.c.slice(0, i).join('') );

        rnd(r, Big.DP -= 4, Big.RM);

        return r;
    };


    /*
     * Return a new Big whose value is the value of this Big times the value of
     * Big y.
     */
    P.mul = P.times = function (y) {
        var c,
            x = this,
            Big = x.constructor,
            xc = x.c,
            yc = (y = new Big(y)).c,
            a = xc.length,
            b = yc.length,
            i = x.e,
            j = y.e;

        // Determine sign of result.
        y.s = x.s == y.s ? 1 : -1;

        // Return signed 0 if either 0.
        if (!xc[0] || !yc[0]) {
            return new Big(y.s * 0);
        }

        // Initialise exponent of result as x.e + y.e.
        y.e = i + j;

        // If array xc has fewer digits than yc, swap xc and yc, and lengths.
        if (a < b) {
            c = xc;
            xc = yc;
            yc = c;
            j = a;
            a = b;
            b = j;
        }

        // Initialise coefficient array of result with zeros.
        for (c = new Array(j = a + b); j--; c[j] = 0) {
        }

        // Multiply.

        // i is initially xc.length.
        for (i = b; i--;) {
            b = 0;

            // a is yc.length.
            for (j = a + i; j > i;) {

                // Current sum of products at this digit position, plus carry.
                b = c[j] + yc[i] * xc[j - i - 1] + b;
                c[j--] = b % 10;

                // carry
                b = b / 10 | 0;
            }
            c[j] = (c[j] + b) % 10;
        }

        // Increment result exponent if there is a final carry.
        if (b) {
            ++y.e;
        }

        // Remove any leading zero.
        if (!c[0]) {
            c.shift();
        }

        // Remove trailing zeros.
        for (i = c.length; !c[--i]; c.pop()) {
        }
        y.c = c;

        return y;
    };


    /*
     * Return a string representing the value of this Big.
     * Return exponential notation if this Big has a positive exponent equal to
     * or greater than Big.E_POS, or a negative exponent equal to or less than
     * Big.E_NEG.
     */
    P.toString = P.valueOf = P.toJSON = function () {
        var x = this,
            Big = x.constructor,
            e = x.e,
            str = x.c.join(''),
            strL = str.length;

        // Exponential notation?
        if (e <= Big.E_NEG || e >= Big.E_POS) {
            str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') +
              (e < 0 ? 'e' : 'e+') + e;

        // Negative exponent?
        } else if (e < 0) {

            // Prepend zeros.
            for (; ++e; str = '0' + str) {
            }
            str = '0.' + str;

        // Positive exponent?
        } else if (e > 0) {

            if (++e > strL) {

                // Append zeros.
                for (e -= strL; e-- ; str += '0') {
                }
            } else if (e < strL) {
                str = str.slice(0, e) + '.' + str.slice(e);
            }

        // Exponent zero.
        } else if (strL > 1) {
            str = str.charAt(0) + '.' + str.slice(1);
        }

        // Avoid '-0'
        return x.s < 0 && x.c[0] ? '-' + str : str;
    };


    /*
     ***************************************************************************
     * If toExponential, toFixed, toPrecision and format are not required they
     * can safely be commented-out or deleted. No redundant code will be left.
     * format is used only by toExponential, toFixed and toPrecision.
     ***************************************************************************
     */


    /*
     * Return a string representing the value of this Big in exponential
     * notation to dp fixed decimal places and rounded, if necessary, using
     * Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toExponential = function (dp) {

        if (dp == null) {
            dp = this.c.length - 1;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!toExp!');
        }

        return format(this, dp, 1);
    };


    /*
     * Return a string representing the value of this Big in normal notation
     * to dp fixed decimal places and rounded, if necessary, using Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toFixed = function (dp) {
        var str,
            x = this,
            Big = x.constructor,
            neg = Big.E_NEG,
            pos = Big.E_POS;

        // Prevent the possibility of exponential notation.
        Big.E_NEG = -(Big.E_POS = 1 / 0);

        if (dp == null) {
            str = x.toString();
        } else if (dp === ~~dp && dp >= 0 && dp <= MAX_DP) {
            str = format(x, x.e + dp);

            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
            if (x.s < 0 && x.c[0] && str.indexOf('-') < 0) {
        //E.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
                str = '-' + str;
            }
        }
        Big.E_NEG = neg;
        Big.E_POS = pos;

        if (!str) {
            throwErr('!toFix!');
        }

        return str;
    };


    /*
     * Return a string representing the value of this Big rounded to sd
     * significant digits using Big.RM. Use exponential notation if sd is less
     * than the number of digits necessary to represent the integer part of the
     * value in normal notation.
     *
     * sd {number} Integer, 1 to MAX_DP inclusive.
     */
    P.toPrecision = function (sd) {

        if (sd == null) {
            return this.toString();
        } else if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
            throwErr('!toPre!');
        }

        return format(this, sd - 1, 2);
    };


    // Export


    Big = bigFactory();

    //AMD.
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Big;
        });

    // Node and other CommonJS-like environments that support module.exports.
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Big;

    //Browser.
    } else {
        global.Big = Big;
    }
})(this);

},{}],59:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'abs',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.abs));

      out = 'gen.abs( ' + inputs[0] + ' )';
    } else {
      out = Math.abs(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var abs = Object.create(proto);

  abs.inputs = [x];

  return abs;
};
},{"./gen.js":87}],60:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'accum',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = void 0;

    _gen.requestMemory(this.memory);

    _gen.memory.heap[this.memory.value.idx] = this.initialValue;

    functionBody = this.callback(genName, inputs[0], inputs[1], 'memory[' + this.memory.value.idx + ']');

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _reset, valueRef) {
    var diff = this.max - this.min,
        out = '',
        wrap = '';

    /* three different methods of wrapping, third is most expensive:
     *
     * 1: range {0,1}: y = x - (x | 0)
     * 2: log2(this.max) == integer: y = x & (this.max - 1)
     * 3: all others: if( x >= this.max ) y = this.max -x
     *
     */

    // must check for reset before storing value for output
    if (!(typeof this.inputs[1] === 'number' && this.inputs[1] < 1)) {
      out += '  if( ' + _reset + ' >=1 ) ' + valueRef + ' = ' + this.initialValue + '\n\n';
    }

    out += '  var ' + this.name + '_value = ' + valueRef + ';\n';

    if (this.shouldWrap === false && this.shouldClamp === true) {
      out += '  if( ' + valueRef + ' < ' + this.max + ' ) ' + valueRef + ' += ' + _incr + '\n';
    } else {
      out += '  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating  
    }

    if (this.max !== Infinity && this.shouldWrap) wrap += '  if( ' + valueRef + ' >= ' + this.max + ' ) ' + valueRef + ' -= ' + diff + '\n';
    if (this.min !== -Infinity && this.shouldWrap) wrap += '  if( ' + valueRef + ' < ' + this.min + ' ) ' + valueRef + ' += ' + diff + '\n\n';

    //if( this.min === 0 && this.max === 1 ) { 
    //  wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
    //} else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
    //  wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
    //} else if( this.max !== Infinity ){
    //  wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
    //}

    out = out + wrap;

    return out;
  }
};

module.exports = function (incr) {
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var properties = arguments[2];

  var ugen = Object.create(proto),
      defaults = { min: 0, max: 1, shouldWrap: true, shouldClamp: false };

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.initialValue === undefined) defaults.initialValue = defaults.min;

  Object.assign(ugen, {
    min: defaults.min,
    max: defaults.max,
    initial: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, reset],
    memory: {
      value: { length: 1, idx: null }
    }
  }, defaults);

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      return _gen.memory.heap[this.memory.value.idx];
    },
    set: function set(v) {
      _gen.memory.heap[this.memory.value.idx] = v;
    }
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],61:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'acos',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'acos': Math.acos });

      out = 'gen.acos( ' + inputs[0] + ' )';
    } else {
      out = Math.acos(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var acos = Object.create(proto);

  acos.inputs = [x];
  acos.id = _gen.getUID();
  acos.name = acos.basename + '{acos.id}';

  return acos;
};
},{"./gen.js":87}],62:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    div = require('./div.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ifelse = require('./ifelseif.js'),
    lt = require('./lt.js'),
    bang = require('./bang.js'),
    env = require('./env.js'),
    add = require('./add.js'),
    poke = require('./poke.js'),
    neq = require('./neq.js'),
    and = require('./and.js'),
    gte = require('./gte.js'),
    memo = require('./memo.js');

module.exports = function () {
  var attackTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;
  var decayTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 44100;
  var _props = arguments[2];

  var _bang = bang(),
      phase = accum(1, _bang, { max: Infinity, shouldWrap: false, initialValue: -Infinity }),
      props = Object.assign({}, { shape: 'exponential', alpha: 5 }, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0;

  //console.log( 'attack time:', attackTime, 'decay time:', decayTime )
  var completeFlag = data([0]

  // slightly more efficient to use existing phase accumulator for linear envelopes
  );if (props.shape === 'linear') {
    out = ifelse(and(gte(phase, 0), lt(phase, attackTime)), memo(div(phase, attackTime)), and(gte(phase, 0), lt(phase, add(attackTime, decayTime))), sub(1, div(sub(phase, attackTime), decayTime)), neq(phase, -Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);
  } else {
    bufferData = env(1024, { type: props.shape, alpha: props.alpha });
    out = ifelse(and(gte(phase, 0), lt(phase, attackTime)), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }), and(gte(phase, 0), lt(phase, add(attackTime, decayTime))), peek(bufferData, sub(1, div(sub(phase, attackTime), decayTime)), { boundmode: 'clamp' }), neq(phase, -Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);
  }

  out.isComplete = function () {
    return gen.memory.heap[completeFlag.memory.values.idx];
  };

  out.trigger = function () {
    gen.memory.heap[completeFlag.memory.values.idx] = 0;
    _bang.trigger();
  };

  return out;
};
},{"./accum.js":60,"./add.js":63,"./and.js":65,"./bang.js":69,"./data.js":76,"./div.js":81,"./env.js":82,"./gen.js":87,"./gte.js":89,"./ifelseif.js":92,"./lt.js":95,"./memo.js":99,"./mul.js":105,"./neq.js":106,"./peek.js":111,"./poke.js":113,"./sub.js":122}],63:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var add = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          sum = 0,
          numCount = 0,
          adderAtEnd = false,
          alreadyFullSummed = true;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            adderAtEnd = true;
            out += ' + ';
          }
          alreadyFullSummed = false;
        } else {
          sum += parseFloat(v);
          numCount++;
        }
      });

      if (alreadyFullSummed) out = '';

      if (numCount > 0) {
        out += adderAtEnd || alreadyFullSummed ? sum : ' + ' + sum;
      }

      if (!alreadyFullSummed) out += ')';

      return out;
    }
  };

  return add;
};
},{"./gen.js":87}],64:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    div = require('./div.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ifelse = require('./ifelseif.js'),
    lt = require('./lt.js'),
    bang = require('./bang.js'),
    env = require('./env.js'),
    param = require('./param.js'),
    add = require('./add.js'),
    gtp = require('./gtp.js'),
    not = require('./not.js');

module.exports = function () {
  var attackTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44;
  var decayTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 22050;
  var sustainTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 44100;
  var sustainLevel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : .6;
  var releaseTime = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 44100;
  var _props = arguments[5];

  var envTrigger = bang(),
      phase = accum(1, envTrigger, { max: Infinity, shouldWrap: false }),
      shouldSustain = param(1),
      defaults = {
    shape: 'exponential',
    alpha: 5,
    triggerRelease: false
  },
      props = Object.assign({}, defaults, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0,
      sustainCondition = void 0,
      releaseAccum = void 0,
      releaseCondition = void 0;

  // slightly more efficient to use existing phase accumulator for linear envelopes
  //if( props.shape === 'linear' ) {
  //  out = ifelse( 
  //    lt( phase, props.attackTime ), memo( div( phase, props.attackTime ) ),
  //    lt( phase, props.attackTime + props.decayTime ), sub( 1, mul( div( sub( phase, props.attackTime ), props.decayTime ), 1-props.sustainLevel ) ),
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime ), 
  //      props.sustainLevel,
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime + props.releaseTime ), 
  //      sub( props.sustainLevel, mul( div( sub( phase, props.attackTime + props.decayTime + props.sustainTime ), props.releaseTime ), props.sustainLevel) ),
  //    0
  //  )
  //} else {     
  bufferData = env({ length: 1024, alpha: props.alpha, shift: 0, type: props.shape });

  console.log(bufferData);

  sustainCondition = props.triggerRelease ? shouldSustain : lt(phase, add(attackTime, decayTime, sustainTime));

  releaseAccum = props.triggerRelease ? gtp(sub(sustainLevel, accum(div(sustainLevel, releaseTime), 0, { shouldWrap: false })), 0) : sub(sustainLevel, mul(div(sub(phase, add(attackTime, decayTime, sustainTime)), releaseTime), sustainLevel)), releaseCondition = props.triggerRelease ? not(shouldSustain) : lt(phase, add(attackTime, decayTime, sustainTime, releaseTime));

  out = ifelse(
  // attack 
  lt(phase, attackTime), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }),

  // decay
  lt(phase, add(attackTime, decayTime)), peek(bufferData, sub(1, mul(div(sub(phase, attackTime), decayTime), sub(1, sustainLevel))), { boundmode: 'clamp' }),

  // sustain
  sustainCondition, peek(bufferData, sustainLevel),

  // release
  releaseCondition, //lt( phase,  attackTime +  decayTime +  sustainTime +  releaseTime ),
  peek(bufferData, releaseAccum,
  //sub(  sustainLevel, mul( div( sub( phase,  attackTime +  decayTime +  sustainTime),  releaseTime ),  sustainLevel ) ), 
  { boundmode: 'clamp' }), 0
  //}

  );out.trigger = function () {
    shouldSustain.value = 1;
    envTrigger.trigger();
  };

  out.release = function () {
    shouldSustain.value = 0;
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    gen.memory.heap[releaseAccum.inputs[0].inputs[1].memory.value.idx] = 0;
  };

  return out;
};
},{"./accum.js":60,"./add.js":63,"./bang.js":69,"./data.js":76,"./div.js":81,"./env.js":82,"./gen.js":87,"./gtp.js":90,"./ifelseif.js":92,"./lt.js":95,"./mul.js":105,"./not.js":108,"./param.js":110,"./peek.js":111,"./sub.js":122}],65:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'and',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = '  var ' + this.name + ' = (' + inputs[0] + ' !== 0 && ' + inputs[1] + ' !== 0) | 0\n\n';

    _gen.memo[this.name] = '' + this.name;

    return ['' + this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],66:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'asin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'asin': Math.asin });

      out = 'gen.asin( ' + inputs[0] + ' )';
    } else {
      out = Math.asin(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var asin = Object.create(proto);

  asin.inputs = [x];
  asin.id = _gen.getUID();
  asin.name = asin.basename + '{asin.id}';

  return asin;
};
},{"./gen.js":87}],67:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'atan',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'atan': Math.atan });

      out = 'gen.atan( ' + inputs[0] + ' )';
    } else {
      out = Math.atan(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var atan = Object.create(proto);

  atan.inputs = [x];
  atan.id = _gen.getUID();
  atan.name = atan.basename + '{atan.id}';

  return atan;
};
},{"./gen.js":87}],68:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js');

module.exports = function () {
    var decayTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;

    var ssd = history(1),
        t60 = Math.exp(-6.907755278921 / decayTime);

    ssd.in(mul(ssd.out, t60));

    ssd.out.trigger = function () {
        ssd.value = 1;
    };

    return sub(1, ssd.out);
};
},{"./gen.js":87,"./history.js":91,"./mul.js":105,"./sub.js":122}],69:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  gen: function gen() {
    _gen.requestMemory(this.memory);

    var out = '  var ' + this.name + ' = memory[' + this.memory.value.idx + ']\n  if( ' + this.name + ' === 1 ) memory[' + this.memory.value.idx + '] = 0      \n      \n';
    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (_props) {
  var ugen = Object.create(proto),
      props = Object.assign({}, { min: 0, max: 1 }, _props);

  ugen.name = 'bang' + _gen.getUID();

  ugen.min = props.min;
  ugen.max = props.max;

  ugen.trigger = function () {
    _gen.memory.heap[ugen.memory.value.idx] = ugen.max;
  };

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};
},{"./gen.js":87}],70:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'bool',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = inputs[0] + ' === 0 ? 0 : 1';

    //gen.memo[ this.name ] = `gen.data.${this.name}`

    //return [ `gen.data.${this.name}`, ' ' +out ]
    return out;
  }
};

module.exports = function (in1) {
  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],71:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'ceil',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.ceil));

      out = 'gen.ceil( ' + inputs[0] + ' )';
    } else {
      out = Math.ceil(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var ceil = Object.create(proto);

  ceil.inputs = [x];

  return ceil;
};
},{"./gen.js":87}],72:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    floor = require('./floor.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'clip',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        out = void 0;

    out = ' var ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' > ' + inputs[2] + ' ) ' + this.name + ' = ' + inputs[2] + '\n  else if( ' + this.name + ' < ' + inputs[1] + ' ) ' + this.name + ' = ' + inputs[1] + '\n';
    out = ' ' + out;

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1) {
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1, min, max]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./floor.js":84,"./gen.js":87,"./memo.js":99,"./sub.js":122}],73:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'cos',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'cos': Math.cos });

      out = 'gen.cos( ' + inputs[0] + ' )';
    } else {
      out = Math.cos(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var cos = Object.create(proto);

  cos.inputs = [x];
  cos.id = _gen.getUID();
  cos.name = cos.basename + '{cos.id}';

  return cos;
};
},{"./gen.js":87}],74:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'counter',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = void 0;

    if (this.memory.value.idx === null) _gen.requestMemory(this.memory);
    functionBody = this.callback(genName, inputs[0], inputs[1], inputs[2], inputs[3], inputs[4], 'memory[' + this.memory.value.idx + ']', 'memory[' + this.memory.wrap.idx + ']');

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    if (_gen.memo[this.wrap.name] === undefined) this.wrap.gen();

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _min, _max, _reset, loops, valueRef, wrapRef) {
    var diff = this.max - this.min,
        out = '',
        wrap = '';
    // must check for reset before storing value for output
    if (!(typeof this.inputs[3] === 'number' && this.inputs[3] < 1)) {
      out += '  if( ' + _reset + ' >= 1 ) ' + valueRef + ' = ' + _min + '\n';
    }

    out += '  var ' + this.name + '_value = ' + valueRef + ';\n  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating  

    if (typeof this.max === 'number' && this.max !== Infinity && typeof this.min !== 'number') {
      wrap = '  if( ' + valueRef + ' >= ' + this.max + ' &&  ' + loops + ' > 0) {\n    ' + valueRef + ' -= ' + diff + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else if (this.max !== Infinity && this.min !== Infinity) {
      wrap = '  if( ' + valueRef + ' >= ' + _max + ' &&  ' + loops + ' > 0) {\n    ' + valueRef + ' -= ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else if( ' + valueRef + ' < ' + _min + ' &&  ' + loops + ' > 0) {\n    ' + valueRef + ' += ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else {
      out += '\n';
    }

    out = out + wrap;

    return out;
  }
};

module.exports = function () {
  var incr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var reset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var loops = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var properties = arguments[5];

  var ugen = Object.create(proto),
      defaults = { initialValue: 0, shouldWrap: true };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    min: min,
    max: max,
    value: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, min, max, reset, loops],
    memory: {
      value: { length: 1, idx: null },
      wrap: { length: 1, idx: null }
    },
    wrap: {
      gen: function gen() {
        if (ugen.memory.wrap.idx === null) {
          _gen.requestMemory(ugen.memory);
        }
        _gen.getInputs(this);
        _gen.memo[this.name] = 'memory[ ' + ugen.memory.wrap.idx + ' ]';
        return 'memory[ ' + ugen.memory.wrap.idx + ' ]';
      }
    }
  }, defaults);

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  ugen.wrap.inputs = [ugen];
  ugen.name = '' + ugen.basename + ugen.uid;
  ugen.wrap.name = ugen.name + '_wrap';
  return ugen;
};
},{"./gen.js":87}],75:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./phasor.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js'),
    phasor = require('./phasor.js');

var proto = {
  basename: 'cycle',

  initTable: function initTable() {
    var buffer = new Float32Array(1024);

    for (var i = 0, l = buffer.length; i < l; i++) {
      buffer[i] = Math.sin(i / l * (Math.PI * 2));
    }

    gen.globals.cycle = data(buffer, 1, { immutable: true });
  }
};

module.exports = function () {
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var _props = arguments[2];

  if (typeof gen.globals.cycle === 'undefined') proto.initTable();
  var props = Object.assign({}, { min: 0 }, _props);

  var ugen = peek(gen.globals.cycle, phasor(frequency, reset, props));
  ugen.name = 'cycle' + gen.getUID();

  return ugen;
};
},{"./data.js":76,"./gen.js":87,"./mul.js":105,"./peek.js":111,"./phasor.js":112}],76:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    utilities = require('./utilities.js'),
    peek = require('./peek.js'),
    poke = require('./poke.js');

var proto = {
  basename: 'data',
  globals: {},

  gen: function gen() {
    var idx = void 0;
    if (_gen.memo[this.name] === undefined) {
      var ugen = this;
      _gen.requestMemory(this.memory, this.immutable);
      idx = this.memory.values.idx;
      try {
        _gen.memory.heap.set(this.buffer, idx);
      } catch (e) {
        console.log(e);
        throw Error('error with request. asking for ' + this.buffer.length + '. current index: ' + _gen.memoryIndex + ' of ' + _gen.memory.heap.length);
      }
      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      _gen.memo[this.name] = idx;
    } else {
      idx = _gen.memo[this.name];
    }
    return idx;
  }
};

module.exports = function (x) {
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var properties = arguments[2];

  var ugen = void 0,
      buffer = void 0,
      shouldLoad = false;

  if (properties !== undefined && properties.global !== undefined) {
    if (_gen.globals[properties.global]) {
      return _gen.globals[properties.global];
    }
  }

  if (typeof x === 'number') {
    if (y !== 1) {
      buffer = [];
      for (var i = 0; i < y; i++) {
        buffer[i] = new Float32Array(x);
      }
    } else {
      buffer = new Float32Array(x);
    }
  } else if (Array.isArray(x)) {
    //! (x instanceof Float32Array ) ) {
    var size = x.length;
    buffer = new Float32Array(size);
    for (var _i = 0; _i < x.length; _i++) {
      buffer[_i] = x[_i];
    }
  } else if (typeof x === 'string') {
    buffer = { length: y > 1 ? y : _gen.samplerate * 60 // XXX what???
    };shouldLoad = true;
  } else if (x instanceof Float32Array) {
    buffer = x;
  }

  ugen = {
    buffer: buffer,
    name: proto.basename + _gen.getUID(),
    dim: buffer.length, // XXX how do we dynamically allocate this?
    channels: 1,
    gen: proto.gen,
    onload: null,
    then: function then(fnc) {
      ugen.onload = fnc;
      return ugen;
    },

    immutable: properties !== undefined && properties.immutable === true ? true : false,
    load: function load(filename) {
      var promise = utilities.loadSample(filename, ugen);
      promise.then(function (_buffer) {
        ugen.memory.values.length = ugen.dim = _buffer.length;
        ugen.onload();
      });
    }
  };

  ugen.memory = {
    values: { length: ugen.dim, idx: null }
  };

  _gen.name = 'data' + _gen.getUID();

  if (shouldLoad) ugen.load(x);

  if (properties !== undefined) {
    if (properties.global !== undefined) {
      _gen.globals[properties.global] = ugen;
    }
    if (properties.meta === true) {
      var _loop = function _loop(length, _i2) {
        Object.defineProperty(ugen, _i2, {
          get: function get() {
            return peek(ugen, _i2, { mode: 'simple', interp: 'none' });
          },
          set: function set(v) {
            return poke(ugen, v, _i2);
          }
        });
      };

      for (var _i2 = 0, length = ugen.buffer.length; _i2 < length; _i2++) {
        _loop(length, _i2);
      }
    }
  }

  return ugen;
};
},{"./gen.js":87,"./peek.js":111,"./poke.js":113,"./utilities.js":128}],77:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js');

module.exports = function (in1) {
    var x1 = history(),
        y1 = history(),
        filter = void 0;

    //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
    filter = memo(add(sub(in1, x1.out), mul(y1.out, .9997)));
    x1.in(in1);
    y1.in(filter);

    return filter;
};
},{"./add.js":63,"./gen.js":87,"./history.js":91,"./memo.js":99,"./mul.js":105,"./sub.js":122}],78:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    t60 = require('./t60.js');

module.exports = function () {
    var decayTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;
    var props = arguments[1];

    var properties = Object.assign({}, { initValue: 1 }, props),
        ssd = history(properties.initValue);

    ssd.in(mul(ssd.out, t60(decayTime)));

    ssd.out.trigger = function () {
        ssd.value = 1;
    };

    return ssd.out;
};
},{"./gen.js":87,"./history.js":91,"./mul.js":105,"./t60.js":124}],79:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    data = require('./data.js'),
    poke = require('./poke.js'),
    peek = require('./peek.js'),
    sub = require('./sub.js'),
    wrap = require('./wrap.js'),
    accum = require('./accum.js');

var proto = {
  basename: 'delay',

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    _gen.memo[this.name] = inputs[0];

    return inputs[0];
  }
};

module.exports = function (in1) {
  for (var _len = arguments.length, tapsAndProperties = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    tapsAndProperties[_key - 2] = arguments[_key];
  }

  var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 256;

  var ugen = Object.create(proto),
      defaults = { size: 512, feedback: 0, interp: 'linear' },
      writeIdx = void 0,
      readIdx = void 0,
      delaydata = void 0,
      properties = void 0,
      tapTimes = [time],
      taps = void 0;

  if (Array.isArray(tapsAndProperties)) {
    properties = tapsAndProperties[tapsAndProperties.length - 1];
    if (tapsAndProperties.length > 1) {
      for (var i = 0; i < tapsAndProperties.length - 1; i++) {
        tapTimes.push(tapsAndProperties[i]);
      }
    }
  } else {
    properties = tapsAndProperties;
  }

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.size < time) defaults.size = time;

  delaydata = data(defaults.size);

  ugen.inputs = [];

  writeIdx = accum(1, 0, { max: defaults.size });

  for (var _i = 0; _i < tapTimes.length; _i++) {
    ugen.inputs[_i] = peek(delaydata, wrap(sub(writeIdx, tapTimes[_i]), 0, defaults.size), { mode: 'samples', interp: defaults.interp });
  }

  ugen.outputs = ugen.inputs; // ugn, Ugh, UGH! but i guess it works.

  poke(delaydata, in1, writeIdx);

  ugen.name = '' + ugen.basename + _gen.getUID();

  return ugen;
};
},{"./accum.js":60,"./data.js":76,"./gen.js":87,"./peek.js":111,"./poke.js":113,"./sub.js":122,"./wrap.js":130}],80:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js');

module.exports = function (in1) {
  var n1 = history();

  n1.in(in1);

  var ugen = sub(in1, n1.out);
  ugen.name = 'delta' + gen.getUID();

  return ugen;
};
},{"./gen.js":87,"./history.js":91,"./sub.js":122}],81:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var div = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          divAtEnd = false;

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber / v;
          out += lastNumber;
        } else {
          out += lastNumber + ' / ' + v;
        }

        if (!isFinalIdx) out += ' / ';
      });

      out += ')';

      return out;
    }
  };

  return div;
};
},{"./gen.js":87}],82:[function(require,module,exports){
'use strict';

var gen = require('./gen'),
    windows = require('./windows'),
    data = require('./data'),
    peek = require('./peek'),
    phasor = require('./phasor'),
    defaults = {
  type: 'triangular', length: 1024, alpha: .15, shift: 0
};

module.exports = function (props) {
  var properties = Object.assign({}, defaults, props);
  var buffer = new Float32Array(properties.length);

  var name = properties.type + '_' + properties.length + '_' + properties.shift;
  if (typeof gen.globals.windows[name] === 'undefined') {

    for (var i = 0; i < properties.length; i++) {
      buffer[i] = windows[properties.type](properties.length, i, properties.alpha, properties.shift);
    }

    gen.globals.windows[name] = data(buffer);
  }

  var ugen = gen.globals.windows[name];
  ugen.name = 'env' + gen.getUID();

  return ugen;
};
},{"./data":76,"./gen":87,"./peek":111,"./phasor":112,"./windows":129}],83:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'eq',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = this.inputs[0] === this.inputs[1] ? 1 : '  var ' + this.name + ' = (' + inputs[0] + ' === ' + inputs[1] + ') | 0\n\n';

    _gen.memo[this.name] = '' + this.name;

    return ['' + this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],84:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'floor',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      //gen.closures.add({ [ this.name ]: Math.floor })

      out = '( ' + inputs[0] + ' | 0 )';
    } else {
      out = inputs[0] | 0;
    }

    return out;
  }
};

module.exports = function (x) {
  var floor = Object.create(proto);

  floor.inputs = [x];

  return floor;
};
},{"./gen.js":87}],85:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'fold',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        out = void 0;

    out = this.createCallback(inputs[0], this.min, this.max);

    _gen.memo[this.name] = this.name + '_value';

    return [this.name + '_value', out];
  },
  createCallback: function createCallback(v, lo, hi) {
    var out = ' var ' + this.name + '_value = ' + v + ',\n      ' + this.name + '_range = ' + hi + ' - ' + lo + ',\n      ' + this.name + '_numWraps = 0\n\n  if(' + this.name + '_value >= ' + hi + '){\n    ' + this.name + '_value -= ' + this.name + '_range\n    if(' + this.name + '_value >= ' + hi + '){\n      ' + this.name + '_numWraps = ((' + this.name + '_value - ' + lo + ') / ' + this.name + '_range) | 0\n      ' + this.name + '_value -= ' + this.name + '_range * ' + this.name + '_numWraps\n    }\n    ' + this.name + '_numWraps++\n  } else if(' + this.name + '_value < ' + lo + '){\n    ' + this.name + '_value += ' + this.name + '_range\n    if(' + this.name + '_value < ' + lo + '){\n      ' + this.name + '_numWraps = ((' + this.name + '_value - ' + lo + ') / ' + this.name + '_range- 1) | 0\n      ' + this.name + '_value -= ' + this.name + '_range * ' + this.name + '_numWraps\n    }\n    ' + this.name + '_numWraps--\n  }\n  if(' + this.name + '_numWraps & 1) ' + this.name + '_value = ' + hi + ' + ' + lo + ' - ' + this.name + '_value\n';
    return ' ' + out;
  }
};

module.exports = function (in1) {
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],86:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _gen = require('./gen.js');

var proto = {
  basename: 'gate',
  controlString: null, // insert into output codegen for determining indexing
  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.requestMemory(this.memory);

    var lastInputMemoryIdx = 'memory[ ' + this.memory.lastInput.idx + ' ]',
        outputMemoryStartIdx = this.memory.lastInput.idx + 1,
        inputSignal = inputs[0],
        controlSignal = inputs[1];

    /* 
     * we check to see if the current control inputs equals our last input
     * if so, we store the signal input in the memory associated with the currently
     * selected index. If not, we put 0 in the memory associated with the last selected index,
     * change the selected index, and then store the signal in put in the memery assoicated
     * with the newly selected index
     */

    out = ' if( ' + controlSignal + ' !== ' + lastInputMemoryIdx + ' ) {\n    memory[ ' + lastInputMemoryIdx + ' + ' + outputMemoryStartIdx + '  ] = 0 \n    ' + lastInputMemoryIdx + ' = ' + controlSignal + '\n  }\n  memory[ ' + outputMemoryStartIdx + ' + ' + controlSignal + ' ] = ' + inputSignal + '\n\n';
    this.controlString = inputs[1];
    this.initialized = true;

    _gen.memo[this.name] = this.name;

    this.outputs.forEach(function (v) {
      return v.gen();
    });

    return [null, ' ' + out];
  },
  childgen: function childgen() {
    if (this.parent.initialized === false) {
      _gen.getInputs(this // parent gate is only input of a gate output, should only be gen'd once.
      );
    }

    if (_gen.memo[this.name] === undefined) {
      _gen.requestMemory(this.memory);

      _gen.memo[this.name] = 'memory[ ' + this.memory.value.idx + ' ]';
    }

    return 'memory[ ' + this.memory.value.idx + ' ]';
  }
};

module.exports = function (control, in1, properties) {
  var ugen = Object.create(proto),
      defaults = { count: 2 };

  if ((typeof properties === 'undefined' ? 'undefined' : _typeof(properties)) !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    outputs: [],
    uid: _gen.getUID(),
    inputs: [in1, control],
    memory: {
      lastInput: { length: 1, idx: null }
    },
    initialized: false
  }, defaults);

  ugen.name = '' + ugen.basename + _gen.getUID();

  for (var i = 0; i < ugen.count; i++) {
    ugen.outputs.push({
      index: i,
      gen: proto.childgen,
      parent: ugen,
      inputs: [ugen],
      memory: {
        value: { length: 1, idx: null }
      },
      initialized: false,
      name: ugen.name + '_out' + _gen.getUID()
    });
  }

  return ugen;
};
},{"./gen.js":87}],87:[function(require,module,exports){
'use strict';

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var MemoryHelper = require('memory-helper');

var gen = {

  accum: 0,
  getUID: function getUID() {
    return this.accum++;
  },

  debug: false,
  samplerate: 44100, // change on audiocontext creation
  shouldLocalize: false,
  globals: {
    windows: {}
  },

  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),
  params: new Set(),

  parameters: [],
  endBlock: new Set(),
  histories: new Map(),

  memo: {},

  data: {},

  /* export
   *
   * place gen functions into another object for easier reference
   */

  export: function _export(obj) {},
  addToEndBlock: function addToEndBlock(v) {
    this.endBlock.add('  ' + v);
  },
  requestMemory: function requestMemory(memorySpec) {
    var immutable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    for (var key in memorySpec) {
      var request = memorySpec[key];

      request.idx = gen.memory.alloc(request.length, immutable);
    }
  },


  /* createCallback
   *
   * param ugen - Head of graph to be codegen'd
   *
   * Generate callback function for a particular ugen graph.
   * The gen.closures property stores functions that need to be
   * passed as arguments to the final function; these are prefixed
   * before any defined params the graph exposes. For example, given:
   *
   * gen.createCallback( abs( param() ) )
   *
   * ... the generated function will have a signature of ( abs, p0 ).
   */

  createCallback: function createCallback(ugen, mem) {
    var debug = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var shouldInlineMemory = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var isStereo = Array.isArray(ugen) && ugen.length > 1,
        callback = void 0,
        channel1 = void 0,
        channel2 = void 0;

    if (typeof mem === 'number' || mem === undefined) {
      mem = MemoryHelper.create(mem);
    }

    //console.log( 'cb memory:', mem )
    this.memory = mem;
    this.memo = {};
    this.endBlock.clear();
    this.closures.clear();
    this.params.clear
    //this.globals = { windows:{} }

    ();this.parameters.length = 0;

    this.functionBody = "  'use strict'\n";
    if (shouldInlineMemory === false) this.functionBody += "  var memory = gen.memory\n\n";

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    for (var i = 0; i < 1 + isStereo; i++) {
      if (typeof ugen[i] === 'number') continue;

      var channel = isStereo ? ugen[i].gen() : ugen.gen(),
          body = '';

      // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
      // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
      // just return that number (graphOutput[0]).
      body += Array.isArray(channel) ? channel[1] + '\n' + channel[0] : channel;

      // split body to inject return keyword on last line
      body = body.split('\n'

      //if( debug ) console.log( 'functionBody length', body )

      // next line is to accommodate memo as graph head
      );if (body[body.length - 1].trim().indexOf('let') > -1) {
        body.push('\n');
      }

      // get index of last line
      var lastidx = body.length - 1;

      // insert return keyword
      body[lastidx] = '  gen.out[' + i + ']  = ' + body[lastidx] + '\n';

      this.functionBody += body.join('\n');
    }

    this.histories.forEach(function (value) {
      if (value !== null) value.gen();
    });

    var returnStatement = isStereo ? '  return gen.out' : '  return gen.out[0]';

    this.functionBody = this.functionBody.split('\n');

    if (this.endBlock.size) {
      this.functionBody = this.functionBody.concat(Array.from(this.endBlock));
      this.functionBody.push(returnStatement);
    } else {
      this.functionBody.push(returnStatement);
    }
    // reassemble function body
    this.functionBody = this.functionBody.join('\n'

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    //
    );if (shouldInlineMemory === true) {
      this.parameters.push('memory');
    }
    var buildString = 'return function gen( ' + this.parameters.join(',') + ' ){ \n' + this.functionBody + '\n}';

    if (this.debug || debug) console.log(buildString);

    callback = new Function(buildString)

    // assign properties to named function
    ();var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.closures.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var dict = _step.value;

        var name = Object.keys(dict)[0],
            value = dict[name];

        callback[name] = value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      var _loop = function _loop() {
        var dict = _step2.value;

        var name = Object.keys(dict)[0],
            ugen = dict[name];

        Object.defineProperty(callback, name, {
          configurable: true,
          get: function get() {
            return ugen.value;
          },
          set: function set(v) {
            ugen.value = v;
          }
        }
        //callback[ name ] = value
        );
      };

      for (var _iterator2 = this.params.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    callback.data = this.data;
    callback.out = new Float32Array(2);
    callback.parameters = this.parameters.slice(0

    //if( MemoryHelper.isPrototypeOf( this.memory ) ) 
    );callback.memory = this.memory.heap;

    this.histories.clear();

    return callback;
  },


  /* getInputs
   *
   * Given an argument ugen, extract its inputs. If they are numbers, return the numebrs. If
   * they are ugens, call .gen() on the ugen, memoize the result and return the result. If the
   * ugen has previously been memoized return the memoized value.
   *
   */
  getInputs: function getInputs(ugen) {
    return ugen.inputs.map(gen.getInput);
  },
  getInput: function getInput(input) {
    var isObject = (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object',
        processedInput = void 0;

    if (isObject) {
      // if input is a ugen... 
      if (gen.memo[input.name]) {
        // if it has been memoized...
        processedInput = gen.memo[input.name];
      } else if (Array.isArray(input)) {
        gen.getInput(input[0]);
        gen.getInput(input[1]);
      } else {
        // if not memoized generate code  
        if (typeof input.gen !== 'function') {
          console.log('no gen found:', input, input.gen);
        }
        var code = input.gen
        //if( code.indexOf( 'Object' ) > -1 ) console.log( 'bad input:', input, code )

        ();if (Array.isArray(code)) {
          if (!gen.shouldLocalize) {
            gen.functionBody += code[1];
          } else {
            gen.codeName = code[0];
            gen.localizedCode.push(code[1]);
          }
          //console.log( 'after GEN' , this.functionBody )
          processedInput = code[0];
        } else {
          processedInput = code;
        }
      }
    } else {
      // it input is a number
      processedInput = input;
    }

    return processedInput;
  },
  startLocalize: function startLocalize() {
    this.localizedCode = [];
    this.shouldLocalize = true;
  },
  endLocalize: function endLocalize() {
    this.shouldLocalize = false;

    return [this.codeName, this.localizedCode.slice(0)];
  },
  free: function free(graph) {
    if (Array.isArray(graph)) {
      // stereo ugen
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = graph[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var channel = _step3.value;

          this.free(channel);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    } else {
      if ((typeof graph === 'undefined' ? 'undefined' : _typeof(graph)) === 'object') {
        if (graph.memory !== undefined) {
          for (var memoryKey in graph.memory) {
            this.memory.free(graph.memory[memoryKey].idx);
          }
        }
        if (Array.isArray(graph.inputs)) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = graph.inputs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var ugen = _step4.value;

              this.free(ugen);
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }
      }
    }
  }
};

module.exports = gen;
},{"memory-helper":131}],88:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '(( ' + inputs[0] + ' > ' + inputs[1] + ') | 0 )';
    } else {
      out += inputs[0] > inputs[1] ? 1 : 0;
    }
    out += '\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x, y) {
  var gt = Object.create(proto);

  gt.inputs = [x, y];
  gt.name = 'gt' + _gen.getUID();

  return gt;
};
},{"./gen.js":87}],89:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gte',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' >= ' + inputs[1] + ' | 0 )';
    } else {
      out += inputs[0] >= inputs[1] ? 1 : 0;
    }
    out += '\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x, y) {
  var gt = Object.create(proto);

  gt.inputs = [x, y];
  gt.name = 'gte' + _gen.getUID();

  return gt;
};
},{"./gen.js":87}],90:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gtp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '(' + inputs[0] + ' * ( ( ' + inputs[0] + ' > ' + inputs[1] + ' ) | 0 ) )';
    } else {
      out = inputs[0] * (inputs[0] > inputs[1] | 0);
    }

    return out;
  }
};

module.exports = function (x, y) {
  var gtp = Object.create(proto);

  gtp.inputs = [x, y];

  return gtp;
};
},{"./gen.js":87}],91:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  var in1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  var ugen = {
    inputs: [in1],
    memory: { value: { length: 1, idx: null } },
    recorder: null,

    in: function _in(v) {
      if (_gen.histories.has(v)) {
        var memoHistory = _gen.histories.get(v);
        ugen.name = memoHistory.name;
        return memoHistory;
      }

      var obj = {
        gen: function gen() {
          var inputs = _gen.getInputs(ugen);

          if (ugen.memory.value.idx === null) {
            _gen.requestMemory(ugen.memory);
            _gen.memory.heap[ugen.memory.value.idx] = in1;
          }

          var idx = ugen.memory.value.idx;

          _gen.addToEndBlock('memory[ ' + idx + ' ] = ' + inputs[0]

          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          );_gen.histories.set(v, obj);

          return inputs[0];
        },

        name: ugen.name + '_in' + _gen.getUID(),
        memory: ugen.memory
      };

      this.inputs[0] = v;

      ugen.recorder = obj;

      return obj;
    },


    out: {
      gen: function gen() {
        if (ugen.memory.value.idx === null) {
          if (_gen.histories.get(ugen.inputs[0]) === undefined) {
            _gen.histories.set(ugen.inputs[0], ugen.recorder);
          }
          _gen.requestMemory(ugen.memory);
          _gen.memory.heap[ugen.memory.value.idx] = parseFloat(in1);
        }
        var idx = ugen.memory.value.idx;

        return 'memory[ ' + idx + ' ] ';
      }
    },

    uid: _gen.getUID()
  };

  ugen.out.memory = ugen.memory;

  ugen.name = 'history' + ugen.uid;
  ugen.out.name = ugen.name + '_out';
  ugen.in._name = ugen.name = '_in';

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  return ugen;
};
},{"./gen.js":87}],92:[function(require,module,exports){
/*

 a = conditional( condition, trueBlock, falseBlock )
 b = conditional([
   condition1, block1,
   condition2, block2,
   condition3, block3,
   defaultBlock
 ])

*/
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'ifelse',

  gen: function gen() {
    var conditionals = this.inputs[0],
        defaultValue = _gen.getInput(conditionals[conditionals.length - 1]),
        out = '  var ' + this.name + '_out = ' + defaultValue + '\n';

    //console.log( 'defaultValue:', defaultValue )

    for (var i = 0; i < conditionals.length - 2; i += 2) {
      var isEndBlock = i === conditionals.length - 3,
          cond = _gen.getInput(conditionals[i]),
          preblock = conditionals[i + 1],
          block = void 0,
          blockName = void 0,
          output = void 0;

      //console.log( 'pb', preblock )

      if (typeof preblock === 'number') {
        block = preblock;
        blockName = null;
      } else {
        if (_gen.memo[preblock.name] === undefined) {
          // used to place all code dependencies in appropriate blocks
          _gen.startLocalize();

          _gen.getInput(preblock);

          block = _gen.endLocalize();
          blockName = block[0];
          block = block[1].join('');
          block = '  ' + block.replace(/\n/gi, '\n  ');
        } else {
          block = '';
          blockName = _gen.memo[preblock.name];
        }
      }

      output = blockName === null ? '  ' + this.name + '_out = ' + block : block + '  ' + this.name + '_out = ' + blockName;

      if (i === 0) out += ' ';
      out += ' if( ' + cond + ' === 1 ) {\n' + output + '\n  }';

      if (!isEndBlock) {
        out += ' else';
      } else {
        out += '\n';
      }
      /*         
       else`
            }else if( isEndBlock ) {
              out += `{\n  ${output}\n  }\n`
            }else {
      
              //if( i + 2 === conditionals.length || i === conditionals.length - 1 ) {
              //  out += `{\n  ${output}\n  }\n`
              //}else{
                out += 
      ` if( ${cond} === 1 ) {
      ${output}
        } else `
              //}
            }*/
    }

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', out];
  }
};

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var ugen = Object.create(proto),
      conditions = Array.isArray(args[0]) ? args[0] : args;

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [conditions]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],93:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'in',

  gen: function gen() {
    _gen.parameters.push(this.name);

    _gen.memo[this.name] = this.name;

    return this.name;
  }
};

module.exports = function (name) {
  var input = Object.create(proto);

  input.id = _gen.getUID();
  input.name = name !== undefined ? name : '' + input.basename + input.id;
  input[0] = {
    gen: function gen() {
      if (!_gen.parameters.includes(input.name)) _gen.parameters.push(input.name);
      return input.name + '[0]';
    }
  };
  input[1] = {
    gen: function gen() {
      if (!_gen.parameters.includes(input.name)) _gen.parameters.push(input.name);
      return input.name + '[1]';
    }
  };

  return input;
};
},{"./gen.js":87}],94:[function(require,module,exports){
'use strict';

var library = {
  export: function _export(destination) {
    if (destination === window) {
      destination.ssd = library.history; // history is window object property, so use ssd as alias
      destination.input = library.in; // in is a keyword in javascript
      destination.ternary = library.switch; // switch is a keyword in javascript

      delete library.history;
      delete library.in;
      delete library.switch;
    }

    Object.assign(destination, library);

    Object.defineProperty(library, 'samplerate', {
      get: function get() {
        return library.gen.samplerate;
      },
      set: function set(v) {}
    });

    library.in = destination.input;
    library.history = destination.ssd;
    library.switch = destination.ternary;

    destination.clip = library.clamp;
  },


  gen: require('./gen.js'),

  abs: require('./abs.js'),
  round: require('./round.js'),
  param: require('./param.js'),
  add: require('./add.js'),
  sub: require('./sub.js'),
  mul: require('./mul.js'),
  div: require('./div.js'),
  accum: require('./accum.js'),
  counter: require('./counter.js'),
  sin: require('./sin.js'),
  cos: require('./cos.js'),
  tan: require('./tan.js'),
  tanh: require('./tanh.js'),
  asin: require('./asin.js'),
  acos: require('./acos.js'),
  atan: require('./atan.js'),
  phasor: require('./phasor.js'),
  data: require('./data.js'),
  peek: require('./peek.js'),
  cycle: require('./cycle.js'),
  history: require('./history.js'),
  delta: require('./delta.js'),
  floor: require('./floor.js'),
  ceil: require('./ceil.js'),
  min: require('./min.js'),
  max: require('./max.js'),
  sign: require('./sign.js'),
  dcblock: require('./dcblock.js'),
  memo: require('./memo.js'),
  rate: require('./rate.js'),
  wrap: require('./wrap.js'),
  mix: require('./mix.js'),
  clamp: require('./clamp.js'),
  poke: require('./poke.js'),
  delay: require('./delay.js'),
  fold: require('./fold.js'),
  mod: require('./mod.js'),
  sah: require('./sah.js'),
  noise: require('./noise.js'),
  not: require('./not.js'),
  gt: require('./gt.js'),
  gte: require('./gte.js'),
  lt: require('./lt.js'),
  lte: require('./lte.js'),
  bool: require('./bool.js'),
  gate: require('./gate.js'),
  train: require('./train.js'),
  slide: require('./slide.js'),
  in: require('./in.js'),
  t60: require('./t60.js'),
  mtof: require('./mtof.js'),
  ltp: require('./ltp.js'), // TODO: test
  gtp: require('./gtp.js'), // TODO: test
  switch: require('./switch.js'),
  mstosamps: require('./mstosamps.js'), // TODO: needs test,
  selector: require('./selector.js'),
  utilities: require('./utilities.js'),
  pow: require('./pow.js'),
  attack: require('./attack.js'),
  decay: require('./decay.js'),
  windows: require('./windows.js'),
  env: require('./env.js'),
  ad: require('./ad.js'),
  adsr: require('./adsr.js'),
  ifelse: require('./ifelseif.js'),
  bang: require('./bang.js'),
  and: require('./and.js'),
  pan: require('./pan.js'),
  eq: require('./eq.js'),
  neq: require('./neq.js')
};

library.gen.lib = library;

module.exports = library;
},{"./abs.js":59,"./accum.js":60,"./acos.js":61,"./ad.js":62,"./add.js":63,"./adsr.js":64,"./and.js":65,"./asin.js":66,"./atan.js":67,"./attack.js":68,"./bang.js":69,"./bool.js":70,"./ceil.js":71,"./clamp.js":72,"./cos.js":73,"./counter.js":74,"./cycle.js":75,"./data.js":76,"./dcblock.js":77,"./decay.js":78,"./delay.js":79,"./delta.js":80,"./div.js":81,"./env.js":82,"./eq.js":83,"./floor.js":84,"./fold.js":85,"./gate.js":86,"./gen.js":87,"./gt.js":88,"./gte.js":89,"./gtp.js":90,"./history.js":91,"./ifelseif.js":92,"./in.js":93,"./lt.js":95,"./lte.js":96,"./ltp.js":97,"./max.js":98,"./memo.js":99,"./min.js":100,"./mix.js":101,"./mod.js":102,"./mstosamps.js":103,"./mtof.js":104,"./mul.js":105,"./neq.js":106,"./noise.js":107,"./not.js":108,"./pan.js":109,"./param.js":110,"./peek.js":111,"./phasor.js":112,"./poke.js":113,"./pow.js":114,"./rate.js":115,"./round.js":116,"./sah.js":117,"./selector.js":118,"./sign.js":119,"./sin.js":120,"./slide.js":121,"./sub.js":122,"./switch.js":123,"./t60.js":124,"./tan.js":125,"./tanh.js":126,"./train.js":127,"./utilities.js":128,"./windows.js":129,"./wrap.js":130}],95:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '(( ' + inputs[0] + ' < ' + inputs[1] + ') | 0  )';
    } else {
      out += inputs[0] < inputs[1] ? 1 : 0;
    }
    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];

    return out;
  }
};

module.exports = function (x, y) {
  var lt = Object.create(proto);

  lt.inputs = [x, y];
  lt.name = 'lt' + _gen.getUID();

  return lt;
};
},{"./gen.js":87}],96:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lte',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' <= ' + inputs[1] + ' | 0  )';
    } else {
      out += inputs[0] <= inputs[1] ? 1 : 0;
    }
    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];

    return out;
  }
};

module.exports = function (x, y) {
  var lt = Object.create(proto);

  lt.inputs = [x, y];
  lt.name = 'lte' + _gen.getUID();

  return lt;
};
},{"./gen.js":87}],97:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'ltp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '(' + inputs[0] + ' * (( ' + inputs[0] + ' < ' + inputs[1] + ' ) | 0 ) )';
    } else {
      out = inputs[0] * (inputs[0] < inputs[1] | 0);
    }

    return out;
  }
};

module.exports = function (x, y) {
  var ltp = Object.create(proto);

  ltp.inputs = [x, y];

  return ltp;
};
},{"./gen.js":87}],98:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'max',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.max));

      out = 'gen.max( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      out = Math.max(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var max = Object.create(proto);

  max.inputs = [x, y];

  return max;
};
},{"./gen.js":87}],99:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'memo',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ' + inputs[0] + '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1, memoName) {
  var memo = Object.create(proto);

  memo.inputs = [in1];
  memo.id = _gen.getUID();
  memo.name = memoName !== undefined ? memoName + '_' + _gen.getUID() : '' + memo.basename + memo.id;

  return memo;
};
},{"./gen.js":87}],100:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'min',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.min));

      out = 'gen.min( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      out = Math.min(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var min = Object.create(proto);

  min.inputs = [x, y];

  return min;
};
},{"./gen.js":87}],101:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

module.exports = function (in1, in2) {
    var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : .5;

    var ugen = memo(add(mul(in1, sub(1, t)), mul(in2, t)));
    ugen.name = 'mix' + gen.getUID();

    return ugen;
};
},{"./add.js":63,"./gen.js":87,"./memo.js":99,"./mul.js":105,"./sub.js":122}],102:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var mod = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          modAtEnd = false;

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber % v;
          out += lastNumber;
        } else {
          out += lastNumber + ' % ' + v;
        }

        if (!isFinalIdx) out += ' % ';
      });

      out += ')';

      return out;
    }
  };

  return mod;
};
},{"./gen.js":87}],103:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'mstosamps',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this),
        returnValue = void 0;

    if (isNaN(inputs[0])) {
      out = '  var ' + this.name + ' = ' + _gen.samplerate + ' / 1000 * ' + inputs[0] + ' \n\n';

      _gen.memo[this.name] = out;

      returnValue = [this.name, out];
    } else {
      out = _gen.samplerate / 1000 * this.inputs[0];

      returnValue = out;
    }

    return returnValue;
  }
};

module.exports = function (x) {
  var mstosamps = Object.create(proto);

  mstosamps.inputs = [x];
  mstosamps.name = proto.basename + _gen.getUID();

  return mstosamps;
};
},{"./gen.js":87}],104:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'mtof',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.exp));

      out = '( ' + this.tuning + ' * gen.exp( .057762265 * (' + inputs[0] + ' - 69) ) )';
    } else {
      out = this.tuning * Math.exp(.057762265 * (inputs[0] - 69));
    }

    return out;
  }
};

module.exports = function (x, props) {
  var ugen = Object.create(proto),
      defaults = { tuning: 440 };

  if (props !== undefined) Object.assign(props.defaults);

  Object.assign(ugen, defaults);
  ugen.inputs = [x];

  return ugen;
};
},{"./gen.js":87}],105:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var mul = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          sum = 1,
          numCount = 0,
          mulAtEnd = false,
          alreadyFullSummed = true;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            mulAtEnd = true;
            out += ' * ';
          }
          alreadyFullSummed = false;
        } else {
          if (i === 0) {
            sum = v;
          } else {
            sum *= parseFloat(v);
          }
          numCount++;
        }
      });

      if (alreadyFullSummed) out = '';

      if (numCount > 0) {
        out += mulAtEnd || alreadyFullSummed ? sum : ' * ' + sum;
      }

      if (!alreadyFullSummed) out += ')';

      return out;
    }
  };

  return mul;
};
},{"./gen.js":87}],106:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'neq',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = /*this.inputs[0] !== this.inputs[1] ? 1 :*/'  var ' + this.name + ' = (' + inputs[0] + ' !== ' + inputs[1] + ') | 0\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],107:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'noise',

  gen: function gen() {
    var out = void 0;

    _gen.closures.add({ 'noise': Math.random });

    out = '  var ' + this.name + ' = gen.noise()\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x) {
  var noise = Object.create(proto);
  noise.name = proto.name + _gen.getUID();

  return noise;
};
},{"./gen.js":87}],108:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'not',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0])) {
      out = '( ' + inputs[0] + ' === 0 ? 1 : 0 )';
    } else {
      out = !inputs[0] === 0 ? 1 : 0;
    }

    return out;
  }
};

module.exports = function (x) {
  var not = Object.create(proto);

  not.inputs = [x];

  return not;
};
},{"./gen.js":87}],109:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js');

var proto = {
  basename: 'pan',
  initTable: function initTable() {
    var bufferL = new Float32Array(1024),
        bufferR = new Float32Array(1024);

    var sqrtTwoOverTwo = Math.sqrt(2) / 2;

    for (var i = 0; i < 1024; i++) {
      var pan = -1 + i / 1024 * 2;
      bufferL[i] = sqrtTwoOverTwo * (Math.cos(pan) - Math.sin(pan));
      bufferR[i] = sqrtTwoOverTwo * (Math.cos(pan) + Math.sin(pan));
    }

    gen.globals.panL = data(bufferL, 1, { immutable: true });
    gen.globals.panR = data(bufferR, 1, { immutable: true });
  }
};

module.exports = function (leftInput, rightInput) {
  var pan = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : .5;
  var properties = arguments[3];

  if (gen.globals.panL === undefined) proto.initTable();

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: gen.getUID(),
    inputs: [leftInput, rightInput],
    left: mul(leftInput, peek(gen.globals.panL, pan, { boundmode: 'clamp' })),
    right: mul(rightInput, peek(gen.globals.panR, pan, { boundmode: 'clamp' }))
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./data.js":76,"./gen.js":87,"./mul.js":105,"./peek.js":111}],110:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'param',

  gen: function gen() {
    _gen.requestMemory(this.memory);

    _gen.params.add(_defineProperty({}, this.name, this));

    this.value = this.initialValue;

    _gen.memo[this.name] = 'memory[' + this.memory.value.idx + ']';

    return _gen.memo[this.name];
  }
};

module.exports = function () {
  var propName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  var ugen = Object.create(proto);

  if (typeof propName !== 'string') {
    ugen.name = ugen.basename + _gen.getUID();
    ugen.initialValue = propName;
  } else {
    ugen.name = propName;
    ugen.initialValue = value;
  }

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};
},{"./gen.js":87}],111:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'peek',

  gen: function gen() {
    var genName = 'gen.' + this.name,
        inputs = _gen.getInputs(this),
        out = void 0,
        functionBody = void 0,
        next = void 0,
        lengthIsLog2 = void 0,
        idx = void 0;

    idx = inputs[1];
    lengthIsLog2 = (Math.log2(this.data.buffer.length) | 0) === Math.log2(this.data.buffer.length);

    if (this.mode !== 'simple') {

      functionBody = '  var ' + this.name + '_dataIdx  = ' + idx + ', \n      ' + this.name + '_phase = ' + (this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + (this.data.buffer.length - 1)) + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n';

      if (this.boundmode === 'wrap') {
        next = lengthIsLog2 ? '( ' + this.name + '_index + 1 ) & (' + this.data.buffer.length + ' - 1)' : this.name + '_index + 1 >= ' + this.data.buffer.length + ' ? ' + this.name + '_index + 1 - ' + this.data.buffer.length + ' : ' + this.name + '_index + 1';
      } else if (this.boundmode === 'clamp') {
        next = this.name + '_index + 1 >= ' + (this.data.buffer.length - 1) + ' ? ' + (this.data.buffer.length - 1) + ' : ' + this.name + '_index + 1';
      } else {
        next = this.name + '_index + 1';
      }

      if (this.interp === 'linear') {
        functionBody += '      ' + this.name + '_frac  = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base  = memory[ ' + this.name + '_dataIdx +  ' + this.name + '_index ],\n      ' + this.name + '_next  = ' + next + ',';

        if (this.boundmode === 'ignore') {
          functionBody += '\n      ' + this.name + '_out   = ' + this.name + '_index >= ' + (this.data.buffer.length - 1) + ' || ' + this.name + '_index < 0 ? 0 : ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
        } else {
          functionBody += '\n      ' + this.name + '_out   = ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
        }
      } else {
        functionBody += '      ' + this.name + '_out = memory[ ' + this.name + '_dataIdx + ' + this.name + '_index ]\n\n';
      }
    } else {
      // mode is simple
      functionBody = 'memory[ ' + idx + ' + ' + inputs[0] + ' ]';

      return functionBody;
    }

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', functionBody];
  }
};

module.exports = function (data, index, properties) {
  var ugen = Object.create(proto),
      defaults = { channels: 1, mode: 'phase', interp: 'linear', boundmode: 'wrap' };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    data: data,
    dataName: data.name,
    uid: _gen.getUID(),
    inputs: [index, data]
  }, defaults);

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],112:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js'),
    proto = { basename: 'phasor' };

module.exports = function () {
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var props = arguments[2];

  if (props === undefined) props = { min: -1 };

  var range = (props.max || 1) - props.min;

  var ugen = typeof frequency === 'number' ? accum(frequency * range / gen.samplerate, reset, props) : accum(mul(frequency, 1 / gen.samplerate / (1 / range)), reset, props);

  ugen.name = proto.basename + gen.getUID();

  return ugen;
};
},{"./accum.js":60,"./gen.js":87,"./mul.js":105}],113:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    mul = require('./mul.js'),
    wrap = require('./wrap.js');

var proto = {
  basename: 'poke',

  gen: function gen() {
    var dataName = 'memory',
        inputs = _gen.getInputs(this),
        idx = void 0,
        out = void 0,
        wrapped = void 0;

    idx = this.data.gen

    //gen.requestMemory( this.memory )
    //wrapped = wrap( this.inputs[1], 0, this.dataLength ).gen()
    //idx = wrapped[0]
    //gen.functionBody += wrapped[1]
    ();var outputStr = this.inputs[1] === 0 ? '  ' + dataName + '[ ' + idx + ' ] = ' + inputs[0] + '\n' : '  ' + dataName + '[ ' + idx + ' + ' + inputs[1] + ' ] = ' + inputs[0] + '\n';

    if (this.inline === undefined) {
      _gen.functionBody += outputStr;
    } else {
      return [this.inline, outputStr];
    }
  }
};
module.exports = function (data, value, index, properties) {
  var ugen = Object.create(proto),
      defaults = { channels: 1 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    data: data,
    dataName: data.name,
    dataLength: data.buffer.length,
    uid: _gen.getUID(),
    inputs: [value, index]
  }, defaults);

  ugen.name = ugen.basename + ugen.uid;

  _gen.histories.set(ugen.name, ugen);

  return ugen;
};
},{"./gen.js":87,"./mul.js":105,"./wrap.js":130}],114:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'pow',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add({ 'pow': Math.pow });

      out = 'gen.pow( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      if (typeof inputs[0] === 'string' && inputs[0][0] === '(') {
        inputs[0] = inputs[0].slice(1, -1);
      }
      if (typeof inputs[1] === 'string' && inputs[1][0] === '(') {
        inputs[1] = inputs[1].slice(1, -1);
      }

      out = Math.pow(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var pow = Object.create(proto);

  pow.inputs = [x, y];
  pow.id = _gen.getUID();
  pow.name = pow.basename + '{pow.id}';

  return pow;
};
},{"./gen.js":87}],115:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js'),
    delta = require('./delta.js'),
    wrap = require('./wrap.js');

var proto = {
  basename: 'rate',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        phase = history(),
        inMinus1 = history(),
        genName = 'gen.' + this.name,
        filter = void 0,
        sum = void 0,
        out = void 0;

    _gen.closures.add(_defineProperty({}, this.name, this));

    out = ' var ' + this.name + '_diff = ' + inputs[0] + ' - ' + genName + '.lastSample\n  if( ' + this.name + '_diff < -.5 ) ' + this.name + '_diff += 1\n  ' + genName + '.phase += ' + this.name + '_diff * ' + inputs[1] + '\n  if( ' + genName + '.phase > 1 ) ' + genName + '.phase -= 1\n  ' + genName + '.lastSample = ' + inputs[0] + '\n';
    out = ' ' + out;

    return [genName + '.phase', out];
  }
};

module.exports = function (in1, rate) {
  var ugen = Object.create(proto);

  Object.assign(ugen, {
    phase: 0,
    lastSample: 0,
    uid: _gen.getUID(),
    inputs: [in1, rate]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./add.js":63,"./delta.js":80,"./gen.js":87,"./history.js":91,"./memo.js":99,"./mul.js":105,"./sub.js":122,"./wrap.js":130}],116:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'round',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.round));

      out = 'gen.round( ' + inputs[0] + ' )';
    } else {
      out = Math.round(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var round = Object.create(proto);

  round.inputs = [x];

  return round;
};
},{"./gen.js":87}],117:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sah',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.data[this.name] = 0;
    _gen.data[this.name + '_control'] = 0;

    out = ' var ' + this.name + ' = gen.data.' + this.name + '_control,\n      ' + this.name + '_trigger = ' + inputs[1] + ' > ' + inputs[2] + ' ? 1 : 0\n\n  if( ' + this.name + '_trigger !== ' + this.name + '  ) {\n    if( ' + this.name + '_trigger === 1 ) \n      gen.data.' + this.name + ' = ' + inputs[0] + '\n    gen.data.' + this.name + '_control = ' + this.name + '_trigger\n  }\n';

    _gen.memo[this.name] = 'gen.data.' + this.name;

    return ['gen.data.' + this.name, ' ' + out];
  }
};

module.exports = function (in1, control) {
  var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var properties = arguments[3];

  var ugen = Object.create(proto),
      defaults = { init: 0 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    lastSample: 0,
    uid: _gen.getUID(),
    inputs: [in1, control, threshold]
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],118:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'selector',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0,
        returnValue = 0;

    switch (inputs.length) {
      case 2:
        returnValue = inputs[1];
        break;
      case 3:
        out = '  var ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2] + '\n\n';
        returnValue = [this.name + '_out', out];
        break;
      default:
        out = ' var ' + this.name + '_out = 0\n  switch( ' + inputs[0] + ' + 1 ) {\n';

        for (var i = 1; i < inputs.length; i++) {
          out += '    case ' + i + ': ' + this.name + '_out = ' + inputs[i] + '; break;\n';
        }

        out += '  }\n\n';

        returnValue = [this.name + '_out', ' ' + out];
    }

    _gen.memo[this.name] = this.name + '_out';

    return returnValue;
  }
};

module.exports = function () {
  for (var _len = arguments.length, inputs = Array(_len), _key = 0; _key < _len; _key++) {
    inputs[_key] = arguments[_key];
  }

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: inputs
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],119:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'sign',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.sign));

      out = 'gen.sign( ' + inputs[0] + ' )';
    } else {
      out = Math.sign(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var sign = Object.create(proto);

  sign.inputs = [x];

  return sign;
};
},{"./gen.js":87}],120:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'sin': Math.sin });

      out = 'gen.sin( ' + inputs[0] + ' )';
    } else {
      out = Math.sin(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var sin = Object.create(proto);

  sin.inputs = [x];
  sin.id = _gen.getUID();
  sin.name = sin.basename + '{sin.id}';

  return sin;
};
},{"./gen.js":87}],121:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js'),
    gt = require('./gt.js'),
    div = require('./div.js'),
    _switch = require('./switch.js');

module.exports = function (in1) {
    var slideUp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var slideDown = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    var y1 = history(0),
        filter = void 0,
        slideAmount = void 0;

    //y (n) = y (n-1) + ((x (n) - y (n-1))/slide) 
    slideAmount = _switch(gt(in1, y1.out), slideUp, slideDown);

    filter = memo(add(y1.out, div(sub(in1, y1.out), slideAmount)));

    y1.in(filter);

    return filter;
};
},{"./add.js":63,"./div.js":81,"./gen.js":87,"./gt.js":88,"./history.js":91,"./memo.js":99,"./mul.js":105,"./sub.js":122,"./switch.js":123}],122:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var sub = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = 0,
          diff = 0,
          needsParens = false,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          subAtEnd = false,
          hasUgens = false,
          returnValue = 0;

      this.inputs.forEach(function (value) {
        if (isNaN(value)) hasUgens = true;
      });

      if (hasUgens) {
        // store in variable for future reference
        out = '  var ' + this.name + ' = (';
      } else {
        out = '(';
      }

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber - v;
          out += lastNumber;
          return;
        } else {
          needsParens = true;
          out += lastNumber + ' - ' + v;
        }

        if (!isFinalIdx) out += ' - ';
      });

      if (needsParens) {
        out += ')';
      } else {
        out = out.slice(1 // remove opening paren
        );
      }

      if (hasUgens) out += '\n';

      returnValue = hasUgens ? [this.name, out] : out;

      if (hasUgens) _gen.memo[this.name] = this.name;

      return returnValue;
    }
  };

  sub.name = 'sub' + sub.id;

  return sub;
};
},{"./gen.js":87}],123:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'switch',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    if (inputs[1] === inputs[2]) return inputs[1]; // if both potential outputs are the same just return one of them

    out = '  var ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2] + '\n';

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', out];
  }
};

module.exports = function (control) {
  var in1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var in2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [control, in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],124:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 't60',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this),
        returnValue = void 0;

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, 'exp', Math.exp));

      out = '  var ' + this.name + ' = gen.exp( -6.907755278921 / ' + inputs[0] + ' )\n\n';

      _gen.memo[this.name] = out;

      returnValue = [this.name, out];
    } else {
      out = Math.exp(-6.907755278921 / inputs[0]);

      returnValue = out;
    }

    return returnValue;
  }
};

module.exports = function (x) {
  var t60 = Object.create(proto);

  t60.inputs = [x];
  t60.name = proto.basename + _gen.getUID();

  return t60;
};
},{"./gen.js":87}],125:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'tan',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'tan': Math.tan });

      out = 'gen.tan( ' + inputs[0] + ' )';
    } else {
      out = Math.tan(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var tan = Object.create(proto);

  tan.inputs = [x];
  tan.id = _gen.getUID();
  tan.name = tan.basename + '{tan.id}';

  return tan;
};
},{"./gen.js":87}],126:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'tanh',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'tanh': Math.tanh });

      out = 'gen.tanh( ' + inputs[0] + ' )';
    } else {
      out = Math.tanh(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var tanh = Object.create(proto);

  tanh.inputs = [x];
  tanh.id = _gen.getUID();
  tanh.name = tanh.basename + '{tanh.id}';

  return tanh;
};
},{"./gen.js":87}],127:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    lt = require('./lt.js'),
    phasor = require('./phasor.js');

module.exports = function () {
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 440;
  var pulsewidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : .5;

  var graph = lt(accum(div(frequency, 44100)), .5);

  graph.name = 'train' + gen.getUID();

  return graph;
};
},{"./gen.js":87,"./lt.js":95,"./phasor.js":112}],128:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    data = require('./data.js');

var isStereo = false;

var utilities = {
  ctx: null,

  clear: function clear() {
    this.callback = function () {
      return 0;
    };
    this.clear.callbacks.forEach(function (v) {
      return v();
    });
    this.clear.callbacks.length = 0;
  },
  createContext: function createContext() {
    var AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext;
    this.ctx = new AC();
    gen.samplerate = this.ctx.sampleRate;

    var start = function start() {
      if (typeof AC !== 'undefined') {
        if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
          window.removeEventListener('touchstart', start);

          if ('ontouchstart' in document.documentElement) {
            // required to start audio under iOS 6
            var mySource = utilities.ctx.createBufferSource();
            mySource.connect(utilities.ctx.destination);
            mySource.noteOn(0);
          }
        }
      }
    };

    if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
      window.addEventListener('touchstart', start);
    }

    return this;
  },
  createScriptProcessor: function createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor(1024, 0, 2), this.clearFunction = function () {
      return 0;
    }, this.callback = this.clearFunction;

    this.node.onaudioprocess = function (audioProcessingEvent) {
      var outputBuffer = audioProcessingEvent.outputBuffer;

      var left = outputBuffer.getChannelData(0),
          right = outputBuffer.getChannelData(1);

      for (var sample = 0; sample < left.length; sample++) {
        if (!isStereo) {
          left[sample] = right[sample] = utilities.callback();
        } else {
          var out = utilities.callback();
          left[sample] = out[0];
          right[sample] = out[1];
        }
      }
    };

    this.node.connect(this.ctx.destination

    //this.node.connect( this.analyzer )

    );return this;
  },
  playGraph: function playGraph(graph, debug) {
    var mem = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 44100 * 10;

    utilities.clear();
    if (debug === undefined) debug = false;

    isStereo = Array.isArray(graph);

    utilities.callback = gen.createCallback(graph, mem, debug);

    if (utilities.console) utilities.console.setValue(utilities.callback.toString());

    return utilities.callback;
  },
  loadSample: function loadSample(soundFilePath, data) {
    var req = new XMLHttpRequest();
    req.open('GET', soundFilePath, true);
    req.responseType = 'arraybuffer';

    var promise = new Promise(function (resolve, reject) {
      req.onload = function () {
        var audioData = req.response;

        utilities.ctx.decodeAudioData(audioData, function (buffer) {
          data.buffer = buffer.getChannelData(0);
          resolve(data.buffer);
        });
      };
    });

    req.send();

    return promise;
  }
};

utilities.clear.callbacks = [];

module.exports = utilities;
},{"./data.js":76,"./gen.js":87}],129:[function(require,module,exports){
'use strict';

/*
 * many windows here adapted from https://github.com/corbanbrook/dsp.js/blob/master/dsp.js
 * starting at line 1427
 * taken 8/15/16
*/

var windows = module.exports = {
  bartlett: function bartlett(length, index) {
    return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2));
  },
  bartlettHann: function bartlettHann(length, index) {
    return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos(2 * Math.PI * index / (length - 1));
  },
  blackman: function blackman(length, index, alpha) {
    var a0 = (1 - alpha) / 2,
        a1 = 0.5,
        a2 = alpha / 2;

    return a0 - a1 * Math.cos(2 * Math.PI * index / (length - 1)) + a2 * Math.cos(4 * Math.PI * index / (length - 1));
  },
  cosine: function cosine(length, index) {
    return Math.cos(Math.PI * index / (length - 1) - Math.PI / 2);
  },
  gauss: function gauss(length, index, alpha) {
    return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2));
  },
  hamming: function hamming(length, index) {
    return 0.54 - 0.46 * Math.cos(Math.PI * 2 * index / (length - 1));
  },
  hann: function hann(length, index) {
    return 0.5 * (1 - Math.cos(Math.PI * 2 * index / (length - 1)));
  },
  lanczos: function lanczos(length, index) {
    var x = 2 * index / (length - 1) - 1;
    return Math.sin(Math.PI * x) / (Math.PI * x);
  },
  rectangular: function rectangular(length, index) {
    return 1;
  },
  triangular: function triangular(length, index) {
    return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2));
  },


  // parabola
  welch: function welch(length, _index, ignore, shift) {
    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    var index = shift === 0 ? _index : (_index + Math.floor(shift * length)) % length;
    var n_1_over2 = (length - 1) / 2;

    return 1 - Math.pow((index - n_1_over2) / n_1_over2, 2);
  },
  inversewelch: function inversewelch(length, _index, ignore) {
    var shift = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    var index = shift === 0 ? _index : (_index + Math.floor(shift * length)) % length;
    var n_1_over2 = (length - 1) / 2;

    return Math.pow((index - n_1_over2) / n_1_over2, 2);
  },
  parabola: function parabola(length, index) {
    if (index <= length / 2) {
      return windows.inversewelch(length / 2, index) - 1;
    } else {
      return 1 - windows.inversewelch(length / 2, index - length / 2);
    }
  },
  exponential: function exponential(length, index, alpha) {
    return Math.pow(index / length, alpha);
  },
  linear: function linear(length, index) {
    return index / length;
  }
};
},{}],130:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    floor = require('./floor.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'wrap',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        signal = inputs[0],
        min = inputs[1],
        max = inputs[2],
        out = void 0,
        diff = void 0;

    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
    //const long numWraps = long((v-lo)/range) - (v < lo);
    //return v - range * double(numWraps);   

    if (this.min === 0) {
      diff = max;
    } else if (isNaN(max) || isNaN(min)) {
      diff = max + ' - ' + min;
    } else {
      diff = max - min;
    }

    out = ' var ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' < ' + this.min + ' ) ' + this.name + ' += ' + diff + '\n  else if( ' + this.name + ' > ' + this.max + ' ) ' + this.name + ' -= ' + diff + '\n\n';

    return [this.name, ' ' + out];
  }
};

module.exports = function (in1) {
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1, min, max]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./floor.js":84,"./gen.js":87,"./memo.js":99,"./sub.js":122}],131:[function(require,module,exports){
'use strict';

var MemoryHelper = {
  create: function create() {
    var size = arguments.length <= 0 || arguments[0] === undefined ? 4096 : arguments[0];
    var memtype = arguments.length <= 1 || arguments[1] === undefined ? Float32Array : arguments[1];

    var helper = Object.create(this);

    Object.assign(helper, {
      heap: new memtype(size),
      list: {},
      freeList: {}
    });

    return helper;
  },
  alloc: function alloc(amount) {
    var idx = -1;

    if (amount > this.heap.length) {
      throw Error('Allocation request is larger than heap size of ' + this.heap.length);
    }

    for (var key in this.freeList) {
      var candidateSize = this.freeList[key];

      if (candidateSize >= amount) {
        idx = key;

        this.list[idx] = amount;

        if (candidateSize !== amount) {
          var newIndex = idx + amount,
              newFreeSize = void 0;

          for (var _key in this.list) {
            if (_key > newIndex) {
              newFreeSize = _key - newIndex;
              this.freeList[newIndex] = newFreeSize;
            }
          }
        }
        
        break;
      }
    }
    
    if( idx !== -1 ) delete this.freeList[ idx ]

    if (idx === -1) {
      var keys = Object.keys(this.list),
          lastIndex = void 0;

      if (keys.length) {
        // if not first allocation...
        lastIndex = parseInt(keys[keys.length - 1]);

        idx = lastIndex + this.list[lastIndex];
      } else {
        idx = 0;
      }

      this.list[idx] = amount;
    }

    if (idx + amount >= this.heap.length) {
      throw Error('No available blocks remain sufficient for allocation request.');
    }
    return idx;
  },
  free: function free(index) {
    if (typeof this.list[index] !== 'number') {
      throw Error('Calling free() on non-existing block.');
    }

    this.list[index] = 0;

    var size = 0;
    for (var key in this.list) {
      if (key > index) {
        size = key - index;
        break;
      }
    }

    this.freeList[index] = size;
  }
};

module.exports = MemoryHelper;

},{}]},{},[28])(28)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hbmFseXNpcy9hbmFseXplci5qcyIsImpzL2FuYWx5c2lzL3NpbmdsZXNhbXBsZWRlbGF5LmpzIiwianMvZW52ZWxvcGVzL2FkLmpzIiwianMvZW52ZWxvcGVzL2Fkc3IuanMiLCJqcy9lbnZlbG9wZXMvZW52ZWxvcGVzLmpzIiwianMvZW52ZWxvcGVzL3JhbXAuanMiLCJqcy9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzIiwianMvZmlsdGVycy9hbGxwYXNzLmpzIiwianMvZmlsdGVycy9iaXF1YWQuanMiLCJqcy9maWx0ZXJzL2NvbWJmaWx0ZXIuanMiLCJqcy9maWx0ZXJzL2Rpb2RlRmlsdGVyWkRGLmpzIiwianMvZmlsdGVycy9maWx0ZXIuanMiLCJqcy9maWx0ZXJzL2ZpbHRlcjI0LmpzIiwianMvZmlsdGVycy9maWx0ZXJzLmpzIiwianMvZmlsdGVycy9sYWRkZXJGaWx0ZXJaZXJvRGVsYXkuanMiLCJqcy9maWx0ZXJzL3N2Zi5qcyIsImpzL2Z4L2JpdENydXNoZXIuanMiLCJqcy9meC9idWZmZXJTaHVmZmxlci5qcyIsImpzL2Z4L2Nob3J1cy5qcyIsImpzL2Z4L2RlbGF5LmpzIiwianMvZngvZWZmZWN0LmpzIiwianMvZngvZWZmZWN0cy5qcyIsImpzL2Z4L2ZsYW5nZXIuanMiLCJqcy9meC9mcmVldmVyYi5qcyIsImpzL2Z4L3JpbmdNb2QuanMiLCJqcy9meC90cmVtb2xvLmpzIiwianMvZngvdmlicmF0by5qcyIsImpzL2luZGV4LmpzIiwianMvaW5zdHJ1bWVudHMvY29uZ2EuanMiLCJqcy9pbnN0cnVtZW50cy9jb3diZWxsLmpzIiwianMvaW5zdHJ1bWVudHMvZm0uanMiLCJqcy9pbnN0cnVtZW50cy9oYXQuanMiLCJqcy9pbnN0cnVtZW50cy9pbnN0cnVtZW50LmpzIiwianMvaW5zdHJ1bWVudHMvaW5zdHJ1bWVudHMuanMiLCJqcy9pbnN0cnVtZW50cy9rYXJwbHVzc3Ryb25nLmpzIiwianMvaW5zdHJ1bWVudHMva2ljay5qcyIsImpzL2luc3RydW1lbnRzL21vbm9zeW50aC5qcyIsImpzL2luc3RydW1lbnRzL3BvbHlNaXhpbi5qcyIsImpzL2luc3RydW1lbnRzL3BvbHl0ZW1wbGF0ZS5qcyIsImpzL2luc3RydW1lbnRzL3NhbXBsZXIuanMiLCJqcy9pbnN0cnVtZW50cy9zbmFyZS5qcyIsImpzL2luc3RydW1lbnRzL3N5bnRoLmpzIiwianMvbWlzYy9iaW5vcHMuanMiLCJqcy9taXNjL2J1cy5qcyIsImpzL21pc2MvYnVzMi5qcyIsImpzL21pc2MvbW9ub3BzLmpzIiwianMvb3NjaWxsYXRvcnMvYnJvd25ub2lzZS5qcyIsImpzL29zY2lsbGF0b3JzL2ZtZmVlZGJhY2tvc2MuanMiLCJqcy9vc2NpbGxhdG9ycy9vc2NpbGxhdG9ycy5qcyIsImpzL29zY2lsbGF0b3JzL3Bpbmtub2lzZS5qcyIsImpzL29zY2lsbGF0b3JzL3dhdmV0YWJsZS5qcyIsImpzL3NjaGVkdWxpbmcvc2NoZWR1bGVyLmpzIiwianMvc2NoZWR1bGluZy9zZXEyLmpzIiwianMvc2NoZWR1bGluZy9zZXF1ZW5jZXIuanMiLCJqcy91Z2VuLmpzIiwianMvdWdlblRlbXBsYXRlLmpzIiwianMvdXRpbGl0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2JpZy5qcy9iaWcuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYWJzLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2FjY3VtLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2Fjb3MuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYWQuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYWRkLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2Fkc3IuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYW5kLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2FzaW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYXRhbi5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9hdHRhY2suanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYmFuZy5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9ib29sLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2NlaWwuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvY2xhbXAuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvY29zLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2NvdW50ZXIuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvY3ljbGUuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvZGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9kY2Jsb2NrLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2RlY2F5LmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2RlbGF5LmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2RlbHRhLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2Rpdi5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9lbnYuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvZXEuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvZmxvb3IuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvZm9sZC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9nYXRlLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2dlbi5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9ndC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9ndGUuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvZ3RwLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2hpc3RvcnkuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvaWZlbHNlaWYuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvaW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbHQuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbHRlLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2x0cC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9tYXguanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbWVtby5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9taW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbWl4LmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L21vZC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9tc3Rvc2FtcHMuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbXRvZi5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9tdWwuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbmVxLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L25vaXNlLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L25vdC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9wYW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvcGFyYW0uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvcGVlay5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9waGFzb3IuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvcG9rZS5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9wb3cuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvcmF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9yb3VuZC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9zYWguanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3Qvc2VsZWN0b3IuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3Qvc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9zaW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3Qvc2xpZGUuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3Qvc3ViLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L3N3aXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC90NjAuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvdGFuLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L3RhbmguanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvdHJhaW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvdXRpbGl0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L3dpbmRvd3MuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3Qvd3JhcC5qcyIsIm5vZGVfbW9kdWxlcy9tZW1vcnktaGVscGVyL2luZGV4LnRyYW5zcGlsZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5sZXQgYW5hbHl6ZXIgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuT2JqZWN0LmFzc2lnbiggYW5hbHl6ZXIsIHtcbiAgX190eXBlX186ICdhbmFseXplcicsXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFuYWx5emVyXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgYW5hbHl6ZXIgPSByZXF1aXJlKCAnLi9hbmFseXplci5qcycgKSxcbiAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IERlbGF5ID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBzc2QgPSBPYmplY3QuY3JlYXRlKCBhbmFseXplciApXG4gIHNzZC5pbiAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgc3NkLm91dCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gIHNzZC5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG5cbiAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgaW5wdXRQcm9wcyApXG4gIGxldCBpc1N0ZXJlbyA9IGZhbHNlLy9wcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApXG4gICAgXG4gIGxldCBoaXN0b3J5TCA9IGcuaGlzdG9yeSgpXG5cbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIC8vIHJpZ2h0IGNoYW5uZWxcbiAgICBsZXQgaGlzdG9yeVIgPSBnLmhpc3RvcnkoKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgc3NkLm91dCxcbiAgICAgIFsgaGlzdG9yeUwub3V0LCBoaXN0b3J5Ui5vdXQgXSwgXG4gICAgICAnc3NkX291dCcsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuXG4gICAgc3NkLm91dC5jYWxsYmFjay51Z2VuTmFtZSA9IHNzZC5vdXQudWdlbk5hbWUgPSAnc3NkX291dF8nICsgc3NkLmlkXG5cbiAgICBjb25zdCBpZHhMID0gc3NkLm91dC5ncmFwaC5tZW1vcnkudmFsdWUuaWR4LCBcbiAgICAgICAgICBpZHhSID0gaWR4TCArIDEsXG4gICAgICAgICAgbWVtb3J5ID0gR2liYmVyaXNoLmdlbmlzaC5nZW4ubWVtb3J5LmhlYXBcblxuICAgIGNvbnN0IGNhbGxiYWNrID0gZnVuY3Rpb24oIGlucHV0ICkge1xuICAgICAgJ3VzZSBzdHJpY3QnXG4gICAgICBtZW1vcnlbIGlkeEwgXSA9IGlucHV0WzBdXG4gICAgICBtZW1vcnlbIGlkeFIgXSA9IGlucHV0WzFdXG4gICAgICByZXR1cm4gMCAgICAgXG4gICAgfVxuICAgIFxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzc2QuaW4sIFsgaW5wdXRbMF0saW5wdXRbMV0gXSwgJ3NzZF9pbicsIHByb3BzLCBjYWxsYmFjayApXG5cbiAgICBjYWxsYmFjay51Z2VuTmFtZSA9IHNzZC5pbi51Z2VuTmFtZSA9ICdzc2RfaW5fJyArIHNzZC5pZFxuICAgIHNzZC5pbi5pbnB1dE5hbWVzID0gWyAnaW5wdXQnIF1cbiAgICBzc2QuaW4uaW5wdXRzID0gWyBwcm9wcy5pbnB1dCBdXG4gICAgc3NkLmluLmlucHV0ID0gcHJvcHMuaW5wdXRcbiAgICBzc2QudHlwZSA9ICdhbmFseXNpcydcblxuICAgIHNzZC5pbi5saXN0ZW4gPSBmdW5jdGlvbiggdWdlbiApIHtcbiAgICAgIGlmKCB1Z2VuICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHNzZC5pbi5pbnB1dCA9IHVnZW5cbiAgICAgICAgc3NkLmluLmlucHV0cyA9IFsgdWdlbiBdXG4gICAgICB9XG5cbiAgICAgIGlmKCBHaWJiZXJpc2guYW5hbHl6ZXJzLmluZGV4T2YoIHNzZC5pbiApID09PSAtMSApIHtcbiAgICAgICAgR2liYmVyaXNoLmFuYWx5emVycy5wdXNoKCBzc2QuaW4gKVxuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guZGlydHkoIEdpYmJlcmlzaC5hbmFseXplcnMgKVxuICAgIH1cbiAgfWVsc2V7XG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHNzZC5vdXQsIGhpc3RvcnlMLm91dCwgJ3NzZF9vdXQnLCBwcm9wcyApXG5cbiAgICBzc2Qub3V0LmNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLm91dC51Z2VuTmFtZSA9ICdzc2Rfb3V0XycgKyBzc2QuaWRcblxuICAgIGxldCBpZHggPSBzc2Qub3V0LmdyYXBoLm1lbW9yeS52YWx1ZS5pZHggXG4gICAgbGV0IG1lbW9yeSA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLm1lbW9yeS5oZWFwXG4gICAgbGV0IHBoYXNlID0gMFxuICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uKCBpbnB1dCApIHtcbiAgICAgICd1c2Ugc3RyaWN0J1xuICAgICAgbWVtb3J5WyBpZHggXSA9IGlucHV0XG4gICAgICByZXR1cm4gMCAgICAgXG4gICAgfVxuICAgIFxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzc2QuaW4sIGlucHV0LCAnc3NkX2luJywgcHJvcHMsIGNhbGxiYWNrIClcblxuICAgIGNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLmluLnVnZW5OYW1lID0gJ3NzZF9pbl8nICsgc3NkLmlkXG4gICAgc3NkLmluLmlucHV0TmFtZXMgPSBbICdpbnB1dCcgXVxuICAgIHNzZC5pbi5pbnB1dHMgPSBbIHByb3BzLmlucHV0IF1cbiAgICBzc2QuaW4uaW5wdXQgPSBwcm9wcy5pbnB1dFxuICAgIHNzZC50eXBlID0gJ2FuYWx5c2lzJ1xuXG4gICAgc3NkLmluLmxpc3RlbiA9IGZ1bmN0aW9uKCB1Z2VuICkge1xuICAgICAgaWYoIHVnZW4gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc3NkLmluLmlucHV0ID0gdWdlblxuICAgICAgICBzc2QuaW4uaW5wdXRzID0gWyB1Z2VuIF1cbiAgICAgIH1cblxuICAgICAgaWYoIEdpYmJlcmlzaC5hbmFseXplcnMuaW5kZXhPZiggc3NkLmluICkgPT09IC0xICkge1xuICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goIHNzZC5pbiApXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5kaXJ0eSggR2liYmVyaXNoLmFuYWx5emVycyApXG4gICAgfVxuXG4gIH1cbiAgXG4gIHJldHVybiBzc2Rcbn1cblxuRGVsYXkuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG59XG5cbnJldHVybiBEZWxheVxuXG59XG4iLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgIGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQUQgPSBmdW5jdGlvbiggYXJndW1lbnRQcm9wcyApIHtcbiAgICBsZXQgYWQgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICksXG4gICAgICAgIGF0dGFjayAgPSBnLmluKCAnYXR0YWNrJyApLFxuICAgICAgICBkZWNheSAgID0gZy5pbiggJ2RlY2F5JyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQUQuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IGdyYXBoID0gZy5hZCggYXR0YWNrLCBkZWNheSApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggYWQsIGdyYXBoLCAnYWQnLCBwcm9wcyApXG5cbiAgICBhZC50cmlnZ2VyID0gZ3JhcGgudHJpZ2dlclxuXG4gICAgcmV0dXJuIGFkXG4gIH1cblxuICBBRC5kZWZhdWx0cyA9IHsgYXR0YWNrOjQ0MTAwLCBkZWNheTo0NDEwMCB9IFxuXG4gIHJldHVybiBBRFxuXG59XG4iLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgIGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQURTUiA9IGZ1bmN0aW9uKCBhcmd1bWVudFByb3BzICkge1xuICAgIGxldCBhZHNyICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSxcbiAgICAgICAgYXR0YWNrICA9IGcuaW4oICdhdHRhY2snICksXG4gICAgICAgIGRlY2F5ICAgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIHN1c3RhaW4gPSBnLmluKCAnc3VzdGFpbicgKSxcbiAgICAgICAgcmVsZWFzZSA9IGcuaW4oICdyZWxlYXNlJyApLFxuICAgICAgICBzdXN0YWluTGV2ZWwgPSBnLmluKCAnc3VzdGFpbkxldmVsJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQURTUi5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBsZXQgZ3JhcGggPSBnLmFkc3IoIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHN1c3RhaW5MZXZlbCwgcmVsZWFzZSwgeyB0cmlnZ2VyUmVsZWFzZTogcHJvcHMudHJpZ2dlclJlbGVhc2UgfSApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggYWRzciwgZ3JhcGgsICdhZHNyJywgcHJvcHMgKVxuXG4gICAgYWRzci50cmlnZ2VyID0gZ3JhcGgudHJpZ2dlclxuICAgIGFkc3IuYWR2YW5jZSA9IGdyYXBoLnJlbGVhc2VcblxuICAgIHJldHVybiBhZHNyXG4gIH1cblxuICBBRFNSLmRlZmF1bHRzID0geyBhdHRhY2s6MjIwNTAsIGRlY2F5OjIyMDUwLCBzdXN0YWluOjQ0MTAwLCBzdXN0YWluTGV2ZWw6LjYsIHJlbGVhc2U6IDQ0MTAwLCB0cmlnZ2VyUmVsZWFzZTpmYWxzZSB9IFxuXG4gIHJldHVybiBBRFNSXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgRW52ZWxvcGVzID0ge1xuICAgIEFEICAgICA6IHJlcXVpcmUoICcuL2FkLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBBRFNSICAgOiByZXF1aXJlKCAnLi9hZHNyLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBSYW1wICAgOiByZXF1aXJlKCAnLi9yYW1wLmpzJyApKCBHaWJiZXJpc2ggKSxcblxuICAgIGV4cG9ydCA6IHRhcmdldCA9PiB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gRW52ZWxvcGVzICkge1xuICAgICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgICAgICB0YXJnZXRbIGtleSBdID0gRW52ZWxvcGVzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IFxuXG4gIHJldHVybiBFbnZlbG9wZXNcbn1cbiIsImNvbnN0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKSxcbiAgICAgIGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBSYW1wID0gZnVuY3Rpb24oIGFyZ3VtZW50UHJvcHMgKSB7XG4gICAgY29uc3QgcmFtcCAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApLFxuICAgICAgICAgIGxlbmd0aCA9IGcuaW4oICdsZW5ndGgnICksXG4gICAgICAgICAgZnJvbSAgID0gZy5pbiggJ2Zyb20nICksXG4gICAgICAgICAgdG8gICAgID0gZy5pbiggJ3RvJyApXG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIFJhbXAuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgY29uc3QgcmVzZXQgPSBnLmJhbmcoKVxuXG4gICAgY29uc3QgcGhhc2UgPSBnLmFjY3VtKCBnLmRpdiggMSwgbGVuZ3RoICksIHJlc2V0LCB7IHNob3VsZFdyYXA6cHJvcHMuc2hvdWxkTG9vcCwgc2hvdWxkQ2xhbXA6dHJ1ZSB9KSxcbiAgICAgICAgICBkaWZmID0gZy5zdWIoIHRvLCBmcm9tICksXG4gICAgICAgICAgZ3JhcGggPSBnLmFkZCggZnJvbSwgZy5tdWwoIHBoYXNlLCBkaWZmICkgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHJhbXAsIGdyYXBoLCAncmFtcCcsIHByb3BzIClcblxuICAgIHJhbXAudHJpZ2dlciA9IHJlc2V0LnRyaWdnZXJcblxuICAgIHJldHVybiByYW1wXG4gIH1cblxuICBSYW1wLmRlZmF1bHRzID0geyBmcm9tOjAsIHRvOjEsIGxlbmd0aDpnLmdlbi5zYW1wbGVyYXRlLCBzaG91bGRMb29wOmZhbHNlIH1cblxuICByZXR1cm4gUmFtcFxuXG59XG4iLCIvKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2FudGltYXR0ZXIxNS9oZWFwcXVldWUuanMvYmxvYi9tYXN0ZXIvaGVhcHF1ZXVlLmpzXG4gKlxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiBpcyB2ZXJ5IGxvb3NlbHkgYmFzZWQgb2ZmIGpzLXByaW9yaXR5LXF1ZXVlXG4gKiBieSBBZGFtIEhvb3BlciBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hZGFtaG9vcGVyL2pzLXByaW9yaXR5LXF1ZXVlXG4gKlxuICogVGhlIGpzLXByaW9yaXR5LXF1ZXVlIGltcGxlbWVudGF0aW9uIHNlZW1lZCBhIHRlZW5zeSBiaXQgYmxvYXRlZFxuICogd2l0aCBpdHMgcmVxdWlyZS5qcyBkZXBlbmRlbmN5IGFuZCBtdWx0aXBsZSBzdG9yYWdlIHN0cmF0ZWdpZXNcbiAqIHdoZW4gYWxsIGJ1dCBvbmUgd2VyZSBzdHJvbmdseSBkaXNjb3VyYWdlZC4gU28gaGVyZSBpcyBhIGtpbmQgb2ZcbiAqIGNvbmRlbnNlZCB2ZXJzaW9uIG9mIHRoZSBmdW5jdGlvbmFsaXR5IHdpdGggb25seSB0aGUgZmVhdHVyZXMgdGhhdFxuICogSSBwYXJ0aWN1bGFybHkgbmVlZGVkLlxuICpcbiAqIFVzaW5nIGl0IGlzIHByZXR0eSBzaW1wbGUsIHlvdSBqdXN0IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBIZWFwUXVldWVcbiAqIHdoaWxlIG9wdGlvbmFsbHkgc3BlY2lmeWluZyBhIGNvbXBhcmF0b3IgYXMgdGhlIGFyZ3VtZW50OlxuICpcbiAqIHZhciBoZWFwcSA9IG5ldyBIZWFwUXVldWUoKTtcbiAqXG4gKiB2YXIgY3VzdG9tcSA9IG5ldyBIZWFwUXVldWUoZnVuY3Rpb24oYSwgYil7XG4gKiAgIC8vIGlmIGIgPiBhLCByZXR1cm4gbmVnYXRpdmVcbiAqICAgLy8gbWVhbnMgdGhhdCBpdCBzcGl0cyBvdXQgdGhlIHNtYWxsZXN0IGl0ZW0gZmlyc3RcbiAqICAgcmV0dXJuIGEgLSBiO1xuICogfSk7XG4gKlxuICogTm90ZSB0aGF0IGluIHRoaXMgY2FzZSwgdGhlIGRlZmF1bHQgY29tcGFyYXRvciBpcyBpZGVudGljYWwgdG9cbiAqIHRoZSBjb21wYXJhdG9yIHdoaWNoIGlzIHVzZWQgZXhwbGljaXRseSBpbiB0aGUgc2Vjb25kIHF1ZXVlLlxuICpcbiAqIE9uY2UgeW91J3ZlIGluaXRpYWxpemVkIHRoZSBoZWFwcXVldWUsIHlvdSBjYW4gcGxvcCBzb21lIG5ld1xuICogZWxlbWVudHMgaW50byB0aGUgcXVldWUgd2l0aCB0aGUgcHVzaCBtZXRob2QgKHZhZ3VlbHkgcmVtaW5pc2NlbnRcbiAqIG9mIHR5cGljYWwgamF2YXNjcmlwdCBhcmF5cylcbiAqXG4gKiBoZWFwcS5wdXNoKDQyKTtcbiAqIGhlYXBxLnB1c2goXCJraXR0ZW5cIik7XG4gKlxuICogVGhlIHB1c2ggbWV0aG9kIHJldHVybnMgdGhlIG5ldyBudW1iZXIgb2YgZWxlbWVudHMgb2YgdGhlIHF1ZXVlLlxuICpcbiAqIFlvdSBjYW4gcHVzaCBhbnl0aGluZyB5b3UnZCBsaWtlIG9udG8gdGhlIHF1ZXVlLCBzbyBsb25nIGFzIHlvdXJcbiAqIGNvbXBhcmF0b3IgZnVuY3Rpb24gaXMgY2FwYWJsZSBvZiBoYW5kbGluZyBpdC4gVGhlIGRlZmF1bHRcbiAqIGNvbXBhcmF0b3IgaXMgcmVhbGx5IHN0dXBpZCBzbyBpdCB3b24ndCBiZSBhYmxlIHRvIGhhbmRsZSBhbnl0aGluZ1xuICogb3RoZXIgdGhhbiBhbiBudW1iZXIgYnkgZGVmYXVsdC5cbiAqXG4gKiBZb3UgY2FuIHByZXZpZXcgdGhlIHNtYWxsZXN0IGl0ZW0gYnkgdXNpbmcgcGVlay5cbiAqXG4gKiBoZWFwcS5wdXNoKC05OTk5KTtcbiAqIGhlYXBxLnBlZWsoKTsgLy8gPT0+IC05OTk5XG4gKlxuICogVGhlIHVzZWZ1bCBjb21wbGVtZW50IHRvIHRvIHRoZSBwdXNoIG1ldGhvZCBpcyB0aGUgcG9wIG1ldGhvZCxcbiAqIHdoaWNoIHJldHVybnMgdGhlIHNtYWxsZXN0IGl0ZW0gYW5kIHRoZW4gcmVtb3ZlcyBpdCBmcm9tIHRoZVxuICogcXVldWUuXG4gKlxuICogaGVhcHEucHVzaCgxKTtcbiAqIGhlYXBxLnB1c2goMik7XG4gKiBoZWFwcS5wdXNoKDMpO1xuICogaGVhcHEucG9wKCk7IC8vID09PiAxXG4gKiBoZWFwcS5wb3AoKTsgLy8gPT0+IDJcbiAqIGhlYXBxLnBvcCgpOyAvLyA9PT4gM1xuICovXG5sZXQgSGVhcFF1ZXVlID0gZnVuY3Rpb24oY21wKXtcbiAgdGhpcy5jbXAgPSAoY21wIHx8IGZ1bmN0aW9uKGEsIGIpeyByZXR1cm4gYSAtIGI7IH0pO1xuICB0aGlzLmxlbmd0aCA9IDA7XG4gIHRoaXMuZGF0YSA9IFtdO1xufVxuSGVhcFF1ZXVlLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZGF0YVswXTtcbn07XG5IZWFwUXVldWUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbih2YWx1ZSl7XG4gIHRoaXMuZGF0YS5wdXNoKHZhbHVlKTtcblxuICB2YXIgcG9zID0gdGhpcy5kYXRhLmxlbmd0aCAtIDEsXG4gIHBhcmVudCwgeDtcblxuICB3aGlsZShwb3MgPiAwKXtcbiAgICBwYXJlbnQgPSAocG9zIC0gMSkgPj4+IDE7XG4gICAgaWYodGhpcy5jbXAodGhpcy5kYXRhW3Bvc10sIHRoaXMuZGF0YVtwYXJlbnRdKSA8IDApe1xuICAgICAgeCA9IHRoaXMuZGF0YVtwYXJlbnRdO1xuICAgICAgdGhpcy5kYXRhW3BhcmVudF0gPSB0aGlzLmRhdGFbcG9zXTtcbiAgICAgIHRoaXMuZGF0YVtwb3NdID0geDtcbiAgICAgIHBvcyA9IHBhcmVudDtcbiAgICB9ZWxzZSBicmVhaztcbiAgfVxuICByZXR1cm4gdGhpcy5sZW5ndGgrKztcbn07XG5IZWFwUXVldWUucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBsYXN0X3ZhbCA9IHRoaXMuZGF0YS5wb3AoKSxcbiAgcmV0ID0gdGhpcy5kYXRhWzBdO1xuICBpZih0aGlzLmRhdGEubGVuZ3RoID4gMCl7XG4gICAgdGhpcy5kYXRhWzBdID0gbGFzdF92YWw7XG4gICAgdmFyIHBvcyA9IDAsXG4gICAgbGFzdCA9IHRoaXMuZGF0YS5sZW5ndGggLSAxLFxuICAgIGxlZnQsIHJpZ2h0LCBtaW5JbmRleCwgeDtcbiAgICB3aGlsZSgxKXtcbiAgICAgIGxlZnQgPSAocG9zIDw8IDEpICsgMTtcbiAgICAgIHJpZ2h0ID0gbGVmdCArIDE7XG4gICAgICBtaW5JbmRleCA9IHBvcztcbiAgICAgIGlmKGxlZnQgPD0gbGFzdCAmJiB0aGlzLmNtcCh0aGlzLmRhdGFbbGVmdF0sIHRoaXMuZGF0YVttaW5JbmRleF0pIDwgMCkgbWluSW5kZXggPSBsZWZ0O1xuICAgICAgaWYocmlnaHQgPD0gbGFzdCAmJiB0aGlzLmNtcCh0aGlzLmRhdGFbcmlnaHRdLCB0aGlzLmRhdGFbbWluSW5kZXhdKSA8IDApIG1pbkluZGV4ID0gcmlnaHQ7XG4gICAgICBpZihtaW5JbmRleCAhPT0gcG9zKXtcbiAgICAgICAgeCA9IHRoaXMuZGF0YVttaW5JbmRleF07XG4gICAgICAgIHRoaXMuZGF0YVttaW5JbmRleF0gPSB0aGlzLmRhdGFbcG9zXTtcbiAgICAgICAgdGhpcy5kYXRhW3Bvc10gPSB4O1xuICAgICAgICBwb3MgPSBtaW5JbmRleDtcbiAgICAgIH1lbHNlIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXQgPSBsYXN0X3ZhbDtcbiAgfVxuICB0aGlzLmxlbmd0aC0tO1xuICByZXR1cm4gcmV0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFwUXVldWVcbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuIFxuLy8gY29uc3RydWN0b3IgZm9yIHNjaHJvZWRlciBhbGxwYXNzIGZpbHRlcnNcbmxldCBhbGxQYXNzID0gZnVuY3Rpb24oIF9pbnB1dCwgbGVuZ3RoPTUwMCwgZmVlZGJhY2s9LjUgKSB7XG4gIGxldCBpbmRleCAgPSBnLmNvdW50ZXIoIDEsMCxsZW5ndGggKSxcbiAgICAgIGJ1ZmZlciA9IGcuZGF0YSggbGVuZ3RoICksXG4gICAgICBidWZmZXJTYW1wbGUgPSBnLnBlZWsoIGJ1ZmZlciwgaW5kZXgsIHsgaW50ZXJwOidub25lJywgbW9kZTonc2FtcGxlcycgfSksXG4gICAgICBvdXQgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggLTEsIF9pbnB1dCksIGJ1ZmZlclNhbXBsZSApIClcbiAgICAgICAgICAgICAgICBcbiAgZy5wb2tlKCBidWZmZXIsIGcuYWRkKCBfaW5wdXQsIGcubXVsKCBidWZmZXJTYW1wbGUsIGZlZWRiYWNrICkgKSwgaW5kZXggKVxuIFxuICByZXR1cm4gb3V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWxsUGFzc1xuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgR2liYmVyaXNoLmdlbmlzaC5iaXF1YWQgPSAoIGlucHV0LCBjdXRvZmYsIF9RLCBtb2RlLCBpc1N0ZXJlbyApID0+IHtcbiAgICBsZXQgYTAsYTEsYTIsYyxiMSxiMixcbiAgICAgICAgaW4xYTAseDFhMSx4MmEyLHkxYjEseTJiMixcbiAgICAgICAgaW4xYTBfMSx4MWExXzEseDJhMl8xLHkxYjFfMSx5MmIyXzFcblxuICAgIGxldCByZXR1cm5WYWx1ZVxuICAgIFxuICAgIGNvbnN0IFEgPSBnLm1lbW8oIGcuYWRkKCAuNSwgZy5tdWwoIF9RLCAyMiApICkgKVxuICAgIGxldCB4MSA9IGcuaGlzdG9yeSgpLCB4MiA9IGcuaGlzdG9yeSgpLCB5MSA9IGcuaGlzdG9yeSgpLCB5MiA9IGcuaGlzdG9yeSgpXG4gICAgXG4gICAgbGV0IHcwID0gZy5tZW1vKCBnLm11bCggMiAqIE1hdGguUEksIGcuZGl2KCBjdXRvZmYsICBnLmdlbi5zYW1wbGVyYXRlICkgKSApLFxuICAgICAgICBzaW53MCA9IGcuc2luKCB3MCApLFxuICAgICAgICBjb3N3MCA9IGcuY29zKCB3MCApLFxuICAgICAgICBhbHBoYSA9IGcubWVtbyggZy5kaXYoIHNpbncwLCBnLm11bCggMiwgUSApICkgKVxuXG4gICAgbGV0IG9uZU1pbnVzQ29zVyA9IGcuc3ViKCAxLCBjb3N3MCApXG5cbiAgICBzd2l0Y2goIG1vZGUgKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGEwID0gZy5tZW1vKCBnLmRpdiggZy5hZGQoIDEsIGNvc3cwKSAsIDIpIClcbiAgICAgICAgYTEgPSBnLm11bCggZy5hZGQoIDEsIGNvc3cwICksIC0xIClcbiAgICAgICAgYTIgPSBhMFxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBhMCA9IGcubXVsKCBRLCBhbHBoYSApXG4gICAgICAgIGExID0gMFxuICAgICAgICBhMiA9IGcubXVsKCBhMCwgLTEgKVxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogLy8gTFBcbiAgICAgICAgYTAgPSBnLm1lbW8oIGcuZGl2KCBvbmVNaW51c0Nvc1csIDIpIClcbiAgICAgICAgYTEgPSBvbmVNaW51c0Nvc1dcbiAgICAgICAgYTIgPSBhMFxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgfVxuXG4gICAgYTAgPSBnLmRpdiggYTAsIGMgKTsgYTEgPSBnLmRpdiggYTEsIGMgKTsgYTIgPSBnLmRpdiggYTIsIGMgKVxuICAgIGIxID0gZy5kaXYoIGIxLCBjICk7IGIyID0gZy5kaXYoIGIyLCBjIClcblxuICAgIGluMWEwID0gZy5tdWwoIHgxLmluKCBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQgKSwgYTAgKVxuICAgIHgxYTEgID0gZy5tdWwoIHgyLmluKCB4MS5vdXQgKSwgYTEgKVxuICAgIHgyYTIgID0gZy5tdWwoIHgyLm91dCwgICAgICAgICAgYTIgKVxuXG4gICAgbGV0IHN1bUxlZnQgPSBnLmFkZCggaW4xYTAsIHgxYTEsIHgyYTIgKVxuXG4gICAgeTFiMSA9IGcubXVsKCB5Mi5pbiggeTEub3V0ICksIGIxIClcbiAgICB5MmIyID0gZy5tdWwoIHkyLm91dCwgYjIgKVxuXG4gICAgbGV0IHN1bVJpZ2h0ID0gZy5hZGQoIHkxYjEsIHkyYjIgKVxuXG4gICAgbGV0IGRpZmYgPSBnLnN1Yiggc3VtTGVmdCwgc3VtUmlnaHQgKVxuXG4gICAgeTEuaW4oIGRpZmYgKVxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IHgxXzEgPSBnLmhpc3RvcnkoKSwgeDJfMSA9IGcuaGlzdG9yeSgpLCB5MV8xID0gZy5oaXN0b3J5KCksIHkyXzEgPSBnLmhpc3RvcnkoKVxuXG4gICAgICBpbjFhMF8xID0gZy5tdWwoIHgxXzEuaW4oIGlucHV0WzFdICksIGEwIClcbiAgICAgIHgxYTFfMSAgPSBnLm11bCggeDJfMS5pbiggeDFfMS5vdXQgKSwgYTEgKVxuICAgICAgeDJhMl8xICA9IGcubXVsKCB4Ml8xLm91dCwgICAgICAgICAgICBhMiApXG5cbiAgICAgIGxldCBzdW1MZWZ0XzEgPSBnLmFkZCggaW4xYTBfMSwgeDFhMV8xLCB4MmEyXzEgKVxuXG4gICAgICB5MWIxXzEgPSBnLm11bCggeTJfMS5pbiggeTFfMS5vdXQgKSwgYjEgKVxuICAgICAgeTJiMl8xID0gZy5tdWwoIHkyXzEub3V0LCBiMiApXG5cbiAgICAgIGxldCBzdW1SaWdodF8xID0gZy5hZGQoIHkxYjFfMSwgeTJiMl8xIClcblxuICAgICAgbGV0IGRpZmZfMSA9IGcuc3ViKCBzdW1MZWZ0XzEsIHN1bVJpZ2h0XzEgKVxuXG4gICAgICB5MV8xLmluKCBkaWZmXzEgKVxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgZGlmZiwgZGlmZl8xIF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0gZGlmZlxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IEJpcXVhZCA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBiaXF1YWQgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIE9iamVjdC5hc3NpZ24oIGJpcXVhZCwgQmlxdWFkLmRlZmF1bHRzLCBpbnB1dFByb3BzICkgXG5cbiAgICBsZXQgaXNTdGVyZW8gPSBiaXF1YWQuaW5wdXQuaXNTdGVyZW9cblxuICAgIGJpcXVhZC5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBiaXF1YWQuZ3JhcGggPSBHaWJiZXJpc2guZ2VuaXNoLmJpcXVhZCggZy5pbignaW5wdXQnKSwgZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBnLmdlbi5zYW1wbGVyYXRlIC8gNCApLCAgZy5pbignUScpLCBiaXF1YWQubW9kZSwgaXNTdGVyZW8gKVxuICAgIH1cblxuICAgIGJpcXVhZC5fX2NyZWF0ZUdyYXBoKClcbiAgICBiaXF1YWQuX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICdtb2RlJyBdXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGJpcXVhZCxcbiAgICAgIGJpcXVhZC5ncmFwaCxcbiAgICAgICdiaXF1YWQnLCBcbiAgICAgIGJpcXVhZFxuICAgIClcblxuICAgIHJldHVybiBiaXF1YWRcbiAgfVxuXG4gIEJpcXVhZC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IC4xNSxcbiAgICBjdXRvZmY6LjA1LFxuICAgIG1vZGU6MFxuICB9XG5cbiAgcmV0dXJuIEJpcXVhZFxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5sZXQgY29tYkZpbHRlciA9IGZ1bmN0aW9uKCBfaW5wdXQsIGNvbWJMZW5ndGgsIGRhbXBpbmc9LjUqLjQsIGZlZWRiYWNrQ29lZmY9Ljg0ICkge1xuICBsZXQgbGFzdFNhbXBsZSAgID0gZy5oaXN0b3J5KCksXG4gIFx0ICByZWFkV3JpdGVJZHggPSBnLmNvdW50ZXIoIDEsMCxjb21iTGVuZ3RoICksXG4gICAgICBjb21iQnVmZmVyICAgPSBnLmRhdGEoIGNvbWJMZW5ndGggKSxcblx0ICAgIG91dCAgICAgICAgICA9IGcucGVlayggY29tYkJ1ZmZlciwgcmVhZFdyaXRlSWR4LCB7IGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pLFxuICAgICAgc3RvcmVJbnB1dCAgID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIG91dCwgZy5zdWIoIDEsIGRhbXBpbmcpKSwgZy5tdWwoIGxhc3RTYW1wbGUub3V0LCBkYW1waW5nICkgKSApXG4gICAgICBcbiAgbGFzdFNhbXBsZS5pbiggc3RvcmVJbnB1dCApXG4gXG4gIGcucG9rZSggY29tYkJ1ZmZlciwgZy5hZGQoIF9pbnB1dCwgZy5tdWwoIHN0b3JlSW5wdXQsIGZlZWRiYWNrQ29lZmYgKSApLCByZWFkV3JpdGVJZHggKVxuIFxuICByZXR1cm4gb3V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYkZpbHRlclxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBHaWJiZXJpc2guZ2VuaXNoLmRpb2RlWkRGID0gKCBpbnB1dCwgX1EsIGZyZXEsIHNhdHVyYXRpb24sIGlzU3RlcmVvPWZhbHNlICkgPT4ge1xuICAgIGNvbnN0IGlUID0gMSAvIGcuZ2VuLnNhbXBsZXJhdGUsXG4gICAgICAgICAga3oxID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIGt6MiA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICBrejMgPSBnLmhpc3RvcnkoMCksXG4gICAgICAgICAga3o0ID0gZy5oaXN0b3J5KDApXG5cbiAgICBsZXQgICBrYTEgPSAxLjAsXG4gICAgICAgICAga2EyID0gMC41LFxuICAgICAgICAgIGthMyA9IDAuNSxcbiAgICAgICAgICBrYTQgPSAwLjUsXG4gICAgICAgICAga2luZHggPSAwICAgXG5cbiAgICBjb25zdCBRID0gZy5tZW1vKCBnLmFkZCggLjUsIGcubXVsKCBfUSwgMTEgKSApIClcbiAgICAvLyBrd2QgPSAyICogJE1fUEkgKiBhY2Zba2luZHhdXG4gICAgY29uc3Qga3dkID0gZy5tZW1vKCBnLm11bCggTWF0aC5QSSAqIDIsIGZyZXEgKSApXG5cbiAgICAvLyBrd2EgPSAoMi9pVCkgKiB0YW4oa3dkICogaVQvMikgXG4gICAgY29uc3Qga3dhID1nLm1lbW8oIGcubXVsKCAyL2lULCBnLnRhbiggZy5tdWwoIGt3ZCwgaVQvMiApICkgKSApXG5cbiAgICAvLyBrRyAgPSBrd2EgKiBpVC8yIFxuICAgIGNvbnN0IGtnID0gZy5tZW1vKCBnLm11bCgga3dhLCBpVC8yICkgKVxuICAgIFxuICAgIGNvbnN0IGtHNCA9IGcubWVtbyggZy5tdWwoIC41LCBnLmRpdigga2csIGcuYWRkKCAxLCBrZyApICkgKSApXG4gICAgY29uc3Qga0czID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCggZy5tdWwoIC41LCBrZyApLCBrRzQgKSApICkgKSApXG4gICAgY29uc3Qga0cyID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCggZy5tdWwoIC41LCBrZyApLCBrRzMgKSApICkgKSApXG4gICAgY29uc3Qga0cxID0gZy5tZW1vKCBnLmRpdigga2csIGcuc3ViKCBnLmFkZCggMSwga2cgKSwgZy5tdWwoIGtnLCBrRzIgKSApICkgKVxuXG4gICAgY29uc3Qga0dBTU1BID0gZy5tZW1vKCBnLm11bCggZy5tdWwoIGtHNCwga0czICkgLCBnLm11bCgga0cyLCBrRzEgKSApIClcblxuICAgIGNvbnN0IGtTRzEgPSBnLm1lbW8oIGcubXVsKCBnLm11bCgga0c0LCBrRzMgKSwga0cyICkgKSBcblxuICAgIGNvbnN0IGtTRzIgPSBnLm1lbW8oIGcubXVsKCBrRzQsIGtHMykgKSAgXG4gICAgY29uc3Qga1NHMyA9IGtHNCBcbiAgICBsZXQga1NHNCA9IDEuMCBcbiAgICAvLyBrayA9IDQuMCooa1EgLSAwLjUpLygyNS4wIC0gMC41KVxuICAgIGNvbnN0IGthbHBoYSA9IGcubWVtbyggZy5kaXYoIGtnLCBnLmFkZCgxLjAsIGtnKSApIClcblxuICAgIGNvbnN0IGtiZXRhMSA9IGcubWVtbyggZy5kaXYoIDEuMCwgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCgga2csIGtHMiApICkgKSApXG4gICAgY29uc3Qga2JldGEyID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHMyApICkgKSApXG4gICAgY29uc3Qga2JldGEzID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHNCApICkgKSApXG4gICAgY29uc3Qga2JldGE0ID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLmFkZCggMSwga2cgKSApICkgXG5cbiAgICBjb25zdCBrZ2FtbWExID0gZy5tZW1vKCBnLmFkZCggMSwgZy5tdWwoIGtHMSwga0cyICkgKSApXG4gICAgY29uc3Qga2dhbW1hMiA9IGcubWVtbyggZy5hZGQoIDEsIGcubXVsKCBrRzIsIGtHMyApICkgKVxuICAgIGNvbnN0IGtnYW1tYTMgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga0czLCBrRzQgKSApIClcblxuICAgIGNvbnN0IGtkZWx0YTEgPSBrZ1xuICAgIGNvbnN0IGtkZWx0YTIgPSBnLm1lbW8oIGcubXVsKCAwLjUsIGtnICkgKVxuICAgIGNvbnN0IGtkZWx0YTMgPSBnLm1lbW8oIGcubXVsKCAwLjUsIGtnICkgKVxuXG4gICAgY29uc3Qga2Vwc2lsb24xID0ga0cyXG4gICAgY29uc3Qga2Vwc2lsb24yID0ga0czXG4gICAgY29uc3Qga2Vwc2lsb24zID0ga0c0XG5cbiAgICBjb25zdCBrbGFzdGN1dCA9IGZyZXFcblxuICAgIC8vOzsgZmVlZGJhY2sgaW5wdXRzIFxuICAgIGNvbnN0IGtmYjQgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTQgLCBrejQub3V0ICkgKSBcbiAgICBjb25zdCBrZmIzID0gZy5tZW1vKCBnLm11bCgga2JldGEzLCBnLmFkZCgga3ozLm91dCwgZy5tdWwoIGtmYjQsIGtkZWx0YTMgKSApICkgKVxuICAgIGNvbnN0IGtmYjIgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTIsIGcuYWRkKCBrejIub3V0LCBnLm11bCgga2ZiMywga2RlbHRhMiApICkgKSApXG5cbiAgICAvLzs7IGZlZWRiYWNrIHByb2Nlc3NcblxuICAgIGNvbnN0IGtmYm8xID0gZy5tZW1vKCBnLm11bCgga2JldGExLCBnLmFkZCgga3oxLm91dCwgZy5tdWwoIGtmYjIsIGtkZWx0YTEgKSApICkgKSBcbiAgICBjb25zdCBrZmJvMiA9IGcubWVtbyggZy5tdWwoIGtiZXRhMiwgZy5hZGQoIGt6Mi5vdXQsIGcubXVsKCBrZmIzLCBrZGVsdGEyICkgKSApICkgXG4gICAgY29uc3Qga2ZibzMgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTMsIGcuYWRkKCBrejMub3V0LCBnLm11bCgga2ZiNCwga2RlbHRhMyApICkgKSApIFxuICAgIGNvbnN0IGtmYm80ID0ga2ZiNFxuXG4gICAgY29uc3Qga1NJR01BID0gZy5tZW1vKCBcbiAgICAgIGcuYWRkKCBcbiAgICAgICAgZy5hZGQoIFxuICAgICAgICAgIGcubXVsKCBrU0cxLCBrZmJvMSApLCBcbiAgICAgICAgICBnLm11bCgga1NHMiwga2ZibzIgKVxuICAgICAgICApLCBcbiAgICAgICAgZy5hZGQoXG4gICAgICAgICAgZy5tdWwoIGtTRzMsIGtmYm8zICksIFxuICAgICAgICAgIGcubXVsKCBrU0c0LCBrZmJvNCApXG4gICAgICAgICkgXG4gICAgICApIFxuICAgIClcblxuICAgIC8vY29uc3Qga1NJR01BID0gMVxuICAgIC8vOzsgbm9uLWxpbmVhciBwcm9jZXNzaW5nXG4gICAgLy9pZiAoa25scCA9PSAxKSB0aGVuXG4gICAgLy8gIGtpbiA9ICgxLjAgLyB0YW5oKGtzYXR1cmF0aW9uKSkgKiB0YW5oKGtzYXR1cmF0aW9uICoga2luKVxuICAgIC8vZWxzZWlmIChrbmxwID09IDIpIHRoZW5cbiAgICAvLyAga2luID0gdGFuaChrc2F0dXJhdGlvbiAqIGtpbikgXG4gICAgLy9lbmRpZlxuICAgIC8vXG4gICAgLy9jb25zdCBraW4gPSBpbnB1dCBcbiAgICBsZXQga2luID0gaW5wdXQvL2cubWVtbyggZy5tdWwoIGcuZGl2KCAxLCBnLnRhbmgoIHNhdHVyYXRpb24gKSApLCBnLnRhbmgoIGcubXVsKCBzYXR1cmF0aW9uLCBpbnB1dCApICkgKSApXG4gICAga2luID0gZy50YW5oKCBnLm11bCggc2F0dXJhdGlvbiwga2luICkgKVxuXG4gICAgY29uc3Qga3VuID0gZy5kaXYoIGcuc3ViKCBraW4sIGcubXVsKCBRLCBrU0lHTUEgKSApLCBnLmFkZCggMSwgZy5tdWwoIFEsIGtHQU1NQSApICkgKVxuICAgIC8vY29uc3Qga3VuID0gZy5kaXYoIDEsIGcuYWRkKCAxLCBnLm11bCggUSwga0dBTU1BICkgKSApXG4gICAgICAgIC8vKGtpbiAtIGtrICoga1NJR01BKSAvICgxLjAgKyBrayAqIGtHQU1NQSlcblxuICAgIC8vOzsgMXN0IHN0YWdlXG4gICAgbGV0IGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGt1biwga2dhbW1hMSApLCBrZmIyKSwgZy5tdWwoIGtlcHNpbG9uMSwga2ZibzEgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBsZXQga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthMSwga3hpbiApLCBrejEub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGxldCBrbHAgPSBnLmFkZCgga3YsIGt6MS5vdXQgKVxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejEuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKSBcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAgICAgLy87OyAybmQgc3RhZ2VcbiAgICAvL2t4aW4gPSAoa2xwICoga2dhbW1hMiArIGtmYjMgKyBrZXBzaWxvbjIgKiBrZmJvMilcbiAgICAvL2t2ID0gKGthMiAqIGt4aW4gLSBrejIpICoga2FscGhhIFxuICAgIC8va2xwID0ga3YgKyBrejJcbiAgICAvL2t6MiA9IGtscCArIGt2XG5cbiAgICBreGluID0gZy5tZW1vKCBnLmFkZCggZy5hZGQoIGcubXVsKCBrbHAsIGtnYW1tYTIgKSwga2ZiMyksIGcubXVsKCBrZXBzaWxvbjIsIGtmYm8yICkgKSApXG4gICAgLy8gKGt1biAqIGtnYW1tYTEgKyBrZmIyICsga2Vwc2lsb24xICoga2ZibzEpXG4gICAga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthMiwga3hpbiApLCBrejIub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGtscCA9IGcuYWRkKCBrdiwga3oyLm91dCApIFxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejIuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKSBcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAvLzs7IDNyZCBzdGFnZVxuICAgIC8va3hpbiA9IChrbHAgKiBrZ2FtbWEzICsga2ZiNCArIGtlcHNpbG9uMyAqIGtmYm8zKVxuICAgIC8va3YgPSAoa2EzICoga3hpbiAtIGt6MykgKiBrYWxwaGEgXG4gICAgLy9rbHAgPSBrdiArIGt6M1xuICAgIC8va3ozID0ga2xwICsga3ZcblxuICAgIGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGtscCwga2dhbW1hMyApLCBrZmI0KSwgZy5tdWwoIGtlcHNpbG9uMywga2ZibzMgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2EzLCBreGluICksIGt6My5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAga2xwID0gZy5hZGQoIGt2LCBrejMub3V0IClcbiAgICAvL2tscCA9IGt2ICsga3oxXG4gICAga3ozLmluKCBnLmFkZCgga2xwLCBrdiApIClcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAvLzs7IDR0aCBzdGFnZVxuICAgIC8va3YgPSAoa2E0ICoga2xwIC0ga3o0KSAqIGthbHBoYSBcbiAgICAvL2tscCA9IGt2ICsga3o0XG4gICAgLy9rejQgPSBrbHAgKyBrdlxuXG4gICAgLy8gKGt1biAqIGtnYW1tYTEgKyBrZmIyICsga2Vwc2lsb24xICoga2ZibzEpXG4gICAga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthNCwga3hpbiApLCBrejQub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGtscCA9IGcuYWRkKCBrdiwga3o0Lm91dCApXG4gICAgLy9rbHAgPSBrdiArIGt6MVxuICAgIGt6NC5pbiggZy5hZGQoIGtscCwga3YgKSApXG5cbiAgICAvL2t6MSA9IGtscCArIGt2XG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgLy9sZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgIC8vICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgIC8vICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgLy9wb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICAvL2xldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgLy9yZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgLy8gcmV0dXJuVmFsdWUgPSBrbHBcbiAgICB9XG4gICAgcmV0dXJuVmFsdWUgPSBrbHBcbiAgICBcbiAgICByZXR1cm4gcmV0dXJuVmFsdWUvLyBrbHAvL3JldHVyblZhbHVlXG4gfVxuXG4gIGNvbnN0IERpb2RlWkRGID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3QgemRmICAgICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIERpb2RlWkRGLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBjb25zdCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvIFxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoXG4gICAgICB6ZGYsIFxuICAgICAgR2liYmVyaXNoLmdlbmlzaC5kaW9kZVpERiggZy5pbignaW5wdXQnKSwgZy5pbignUScpLCBnLmluKCdjdXRvZmYnKSwgZy5pbignc2F0dXJhdGlvbicpLCBpc1N0ZXJlbyApLCBcbiAgICAgICdkaW9kZVpERicsXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiB6ZGZcbiAgfVxuXG4gIERpb2RlWkRGLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogNSxcbiAgICBzYXR1cmF0aW9uOiAxLFxuICAgIGN1dG9mZjogNDQwLFxuICB9XG5cbiAgcmV0dXJuIERpb2RlWkRGXG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubGV0IGZpbHRlciA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBmaWx0ZXIsIHtcblxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBmaWx0ZXJcbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIEdpYmJlcmlzaC5nZW5pc2guZmlsdGVyMjQgPSAoIGlucHV0LCBfcmV6LCBfY3V0b2ZmLCBpc0xvd1Bhc3MsIGlzU3RlcmVvPWZhbHNlICkgPT4ge1xuICAgIGxldCByZXR1cm5WYWx1ZSxcbiAgICAgICAgcG9sZXNMID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgICAgcGVla1Byb3BzID0geyBpbnRlcnA6J25vbmUnLCBtb2RlOidzaW1wbGUnIH0sXG4gICAgICAgIHJleiA9IGcubWVtbyggZy5tdWwoIF9yZXosIDUgKSApLFxuICAgICAgICBjdXRvZmYgPSBnLm1lbW8oIGcuZGl2KCBfY3V0b2ZmLCAxMTAyNSApICksXG4gICAgICAgIHJlenpMID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzTFszXSwgcmV6ICkgKSxcbiAgICAgICAgb3V0cHV0TCA9IGcuc3ViKCBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQsIHJlenpMICkgXG5cbiAgICBwb2xlc0xbMF0gPSBnLmFkZCggcG9sZXNMWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc0xbMF0gKSwgb3V0cHV0TCAgICksIGN1dG9mZiApKVxuICAgIHBvbGVzTFsxXSA9IGcuYWRkKCBwb2xlc0xbMV0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzTFsxXSApLCBwb2xlc0xbMF0gKSwgY3V0b2ZmICkpXG4gICAgcG9sZXNMWzJdID0gZy5hZGQoIHBvbGVzTFsyXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNMWzJdICksIHBvbGVzTFsxXSApLCBjdXRvZmYgKSlcbiAgICBwb2xlc0xbM10gPSBnLmFkZCggcG9sZXNMWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc0xbM10gKSwgcG9sZXNMWzJdICksIGN1dG9mZiApKVxuICAgIFxuICAgIGxldCBsZWZ0ID0gZy5zd2l0Y2goIGlzTG93UGFzcywgcG9sZXNMWzNdLCBnLnN1Yiggb3V0cHV0TCwgcG9sZXNMWzNdICkgKVxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IHBvbGVzUiA9IGcuZGF0YShbIDAsMCwwLDAgXSwgMSwgeyBtZXRhOnRydWUgfSksXG4gICAgICAgICAgcmV6elIgPSBnLmNsYW1wKCBnLm11bCggcG9sZXNSWzNdLCByZXogKSApLFxuICAgICAgICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgcG9sZXNSWzBdID0gZy5hZGQoIHBvbGVzUlswXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzBdICksIG91dHB1dFIgICApLCBjdXRvZmYgKSlcbiAgICAgIHBvbGVzUlsxXSA9IGcuYWRkKCBwb2xlc1JbMV0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlsxXSApLCBwb2xlc1JbMF0gKSwgY3V0b2ZmICkpXG4gICAgICBwb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgcG9sZXNSWzNdID0gZy5hZGQoIHBvbGVzUlszXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzNdICksIHBvbGVzUlsyXSApLCBjdXRvZmYgKSlcblxuICAgICAgbGV0IHJpZ2h0ID0gZy5zd2l0Y2goIGlzTG93UGFzcywgcG9sZXNSWzNdLCBnLnN1Yiggb3V0cHV0UiwgcG9sZXNSWzNdICkgKVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0gbGVmdFxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IEZpbHRlcjI0ID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgbGV0IGZpbHRlcjI0ICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGxldCBwcm9wcyAgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBGaWx0ZXIyNC5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGZpbHRlcjI0LCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guZmlsdGVyMjQoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ1EnKSwgZy5pbignY3V0b2ZmJyksIGcuaW4oJ2lzTG93UGFzcycpLCBpc1N0ZXJlbyApLCBcbiAgICAgICdmaWx0ZXIyNCcsXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBmaWx0ZXIyNFxuICB9XG5cblxuICBGaWx0ZXIyNC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IC4yNSxcbiAgICBjdXRvZmY6IDg4MCxcbiAgICBpc0xvd1Bhc3M6MVxuICB9XG5cbiAgcmV0dXJuIEZpbHRlcjI0XG5cbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IGcgPSBHaWJiZXJpc2guZ2VuaXNoXG5cbiAgY29uc3QgZmlsdGVycyA9IHtcbiAgICBGaWx0ZXIyNENsYXNzaWMgOiByZXF1aXJlKCAnLi9maWx0ZXIyNC5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIEZpbHRlcjI0TW9vZyAgICA6IHJlcXVpcmUoICcuL2xhZGRlckZpbHRlclplcm9EZWxheS5qcycgKSggR2liYmVyaXNoICksXG4gICAgRmlsdGVyMjRUQjMwMyAgIDogcmVxdWlyZSggJy4vZGlvZGVGaWx0ZXJaREYuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIEZpbHRlcjEyQmlxdWFkICA6IHJlcXVpcmUoICcuL2JpcXVhZC5qcycgICAgKSggR2liYmVyaXNoICksXG4gICAgRmlsdGVyMTJTVkYgICAgIDogcmVxdWlyZSggJy4vc3ZmLmpzJyAgICAgICApKCBHaWJiZXJpc2ggKSxcbiAgICBcbiAgICAvLyBub3QgZm9yIHVzZSBieSBlbmQtdXNlcnNcbiAgICBnZW5pc2g6IHtcbiAgICAgIENvbWIgICAgICAgIDogcmVxdWlyZSggJy4vY29tYmZpbHRlci5qcycgKSxcbiAgICAgIEFsbFBhc3MgICAgIDogcmVxdWlyZSggJy4vYWxscGFzcy5qcycgKVxuICAgIH0sXG5cbiAgICBmYWN0b3J5KCBpbnB1dCwgY3V0b2ZmLCByZXNvbmFuY2UsIHNhdHVyYXRpb24gPSBudWxsLCBfcHJvcHMsIGlzU3RlcmVvID0gZmFsc2UgKSB7XG4gICAgICBsZXQgZmlsdGVyZWRPc2MgXG5cbiAgICAgIC8vaWYoIHByb3BzLmZpbHRlclR5cGUgPT09IDEgKSB7XG4gICAgICAvLyAgaWYoIHR5cGVvZiBwcm9wcy5jdXRvZmYgIT09ICdvYmplY3QnICYmIHByb3BzLmN1dG9mZiA+IDEgKSB7XG4gICAgICAvLyAgICBwcm9wcy5jdXRvZmYgPSAuMjVcbiAgICAgIC8vICB9XG4gICAgICAvLyAgaWYoIHR5cGVvZiBwcm9wcy5jdXRvZmYgIT09ICdvYmplY3QnICYmIHByb3BzLmZpbHRlck11bHQgPiAuNSApIHtcbiAgICAgIC8vICAgIHByb3BzLmZpbHRlck11bHQgPSAuMVxuICAgICAgLy8gIH1cbiAgICAgIC8vfVxuICAgICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgZmlsdGVycy5kZWZhdWx0cywgX3Byb3BzIClcblxuICAgICAgc3dpdGNoKCBwcm9wcy5maWx0ZXJUeXBlICkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaXNMb3dQYXNzID0gZy5wYXJhbSggJ2xvd1Bhc3MnLCAxICksXG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLmZpbHRlcjI0KCBpbnB1dCwgZy5pbignUScpLCBjdXRvZmYsIHByb3BzLmZpbHRlck1vZGUsIGlzU3RlcmVvIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy56ZDI0KCBpbnB1dCwgZy5pbignUScpLCBjdXRvZmYgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLmRpb2RlWkRGKCBpbnB1dCwgZy5pbignUScpLCBjdXRvZmYsIGcuaW4oJ3NhdHVyYXRpb24nKSwgaXNTdGVyZW8gKSBcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy5zdmYoIGlucHV0LCBjdXRvZmYsIGcuc3ViKCAxLCBnLmluKCdRJykpLCBwcm9wcy5maWx0ZXJNb2RlLCBpc1N0ZXJlbyApIFxuICAgICAgICAgIGJyZWFrOyBcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy5iaXF1YWQoIGlucHV0LCBjdXRvZmYsICBnLmluKCdRJyksIHByb3BzLmZpbHRlck1vZGUsIGlzU3RlcmVvICkgXG4gICAgICAgICAgYnJlYWs7IFxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIHJldHVybiB1bmZpbHRlcmVkIHNpZ25hbFxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gaW5wdXQgLy9nLmZpbHRlcjI0KCBvc2NXaXRoR2FpbiwgZy5pbigncmVzb25hbmNlJyksIGN1dG9mZiwgaXNMb3dQYXNzIClcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZpbHRlcmVkT3NjXG4gICAgfSxcblxuICAgIGRlZmF1bHRzOiB7IGZpbHRlck1vZGU6IDAsIGZpbHRlclR5cGU6MCB9XG4gIH1cblxuICBmaWx0ZXJzLmV4cG9ydCA9IHRhcmdldCA9PiB7XG4gICAgZm9yKCBsZXQga2V5IGluIGZpbHRlcnMgKSB7XG4gICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyAmJiBrZXkgIT09ICdnZW5pc2gnICkge1xuICAgICAgICB0YXJnZXRbIGtleSBdID0gZmlsdGVyc1sga2V5IF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxucmV0dXJuIGZpbHRlcnNcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIEdpYmJlcmlzaC5nZW5pc2guemQyNCA9ICggaW5wdXQsIF9RLCBmcmVxLCBpc1N0ZXJlbz1mYWxzZSApID0+IHtcbiAgICBjb25zdCBpVCA9IDEgLyBnLmdlbi5zYW1wbGVyYXRlLFxuICAgICAgICAgIHoxID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHoyID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHozID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHo0ID0gZy5oaXN0b3J5KDApXG4gICAgXG4gICAgY29uc3QgUSA9IGcubWVtbyggZy5hZGQoIC41LCBnLm11bCggX1EsIDIzICkgKSApXG4gICAgLy8ga3dkID0gMiAqICRNX1BJICogYWNmW2tpbmR4XVxuICAgIGNvbnN0IGt3ZCA9IGcubWVtbyggZy5tdWwoIE1hdGguUEkgKiAyLCBmcmVxICkgKVxuXG4gICAgLy8ga3dhID0gKDIvaVQpICogdGFuKGt3ZCAqIGlULzIpIFxuICAgIGNvbnN0IGt3YSA9Zy5tZW1vKCBnLm11bCggMi9pVCwgZy50YW4oIGcubXVsKCBrd2QsIGlULzIgKSApICkgKVxuXG4gICAgLy8ga0cgID0ga3dhICogaVQvMiBcbiAgICBjb25zdCBrZyA9IGcubWVtbyggZy5tdWwoIGt3YSwgaVQvMiApIClcblxuICAgIC8vIGtrID0gNC4wKihrUSAtIDAuNSkvKDI1LjAgLSAwLjUpXG4gICAgY29uc3Qga2sgPSBnLm1lbW8oIGcubXVsKCA0LCBnLmRpdiggZy5zdWIoIFEsIC41ICksIDI0LjUgKSApIClcblxuICAgIC8vIGtnX3BsdXNfMSA9ICgxLjAgKyBrZylcbiAgICBjb25zdCBrZ19wbHVzXzEgPSBnLmFkZCggMSwga2cgKVxuXG4gICAgLy8ga0cgPSBrZyAvIGtnX3BsdXNfMSBcbiAgICBjb25zdCBrRyAgICAgPSBnLm1lbW8oIGcuZGl2KCBrZywga2dfcGx1c18xICkgKSxcbiAgICAgICAgICBrR18yICAgPSBnLm1lbW8oIGcubXVsKCBrRywga0cgKSApLFxuICAgICAgICAgIGtHXzMgICA9IGcubXVsKCBrR18yLCBrRyApLFxuICAgICAgICAgIGtHQU1NQSA9IGcubXVsKCBrR18yLCBrR18yIClcblxuICAgIGNvbnN0IGtTMSA9IGcuZGl2KCB6MS5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTMiA9IGcuZGl2KCB6Mi5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTMyA9IGcuZGl2KCB6My5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTNCA9IGcuZGl2KCB6NC5vdXQsIGtnX3BsdXNfMSApXG5cbiAgICAvL2tTID0ga0dfMyAqIGtTMSAgKyBrR18yICoga1MyICsga0cgKiBrUzMgKyBrUzQgXG4gICAgY29uc3Qga1MgPSBnLm1lbW8oIFxuICAgICAgZy5hZGQoXG4gICAgICAgIGcuYWRkKCBnLm11bChrR18zLCBrUzEpLCBnLm11bCgga0dfMiwga1MyKSApLFxuICAgICAgICBnLmFkZCggZy5tdWwoa0csIGtTMyksIGtTNCApXG4gICAgICApXG4gICAgKVxuXG4gICAgLy9rdSA9IChraW4gLSBrayAqICBrUykgLyAoMSArIGtrICoga0dBTU1BKVxuICAgIGNvbnN0IGt1MSA9IGcuc3ViKCBpbnB1dCwgZy5tdWwoIGtrLCBrUyApIClcbiAgICBjb25zdCBrdTIgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga2ssIGtHQU1NQSApICkgKVxuICAgIGNvbnN0IGt1ICA9IGcubWVtbyggZy5kaXYoIGt1MSwga3UyICkgKVxuXG4gICAgbGV0IGt2ID0gIGcubWVtbyggZy5tdWwoIGcuc3ViKCBrdSwgejEub3V0ICksIGtHICkgKVxuICAgIGxldCBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejEub3V0ICkgKVxuICAgIHoxLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHoyLm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejIub3V0ICkgKVxuICAgIHoyLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHozLm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejMub3V0ICkgKVxuICAgIHozLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHo0Lm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejQub3V0ICkgKVxuICAgIHo0LmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgLy9sZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgIC8vICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgIC8vICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgLy9wb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICAvL2xldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgLy9yZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0ga2xwXG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBjb25zdCBaZDI0ID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3QgZmlsdGVyICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIFpkMjQuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGZpbHRlciwgXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLnpkMjQoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ1EnKSwgZy5pbignY3V0b2ZmJyksIGlzU3RlcmVvICksIFxuICAgICAgJ3pkMjQnLFxuICAgICAgcHJvcHNcbiAgICApXG5cbiAgICByZXR1cm4gZmlsdGVyXG4gIH1cblxuXG4gIFpkMjQuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiA1LFxuICAgIGN1dG9mZjogNDQwLFxuICB9XG5cbiAgcmV0dXJuIFpkMjRcblxufVxuXG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIEdpYmJlcmlzaC5nZW5pc2guc3ZmID0gKCBpbnB1dCwgY3V0b2ZmLCBRLCBtb2RlLCBpc1N0ZXJlbyApID0+IHtcbiAgICBsZXQgZDEgPSBnLmRhdGEoWzAsMF0sIDEsIHsgbWV0YTp0cnVlIH0pLCBkMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksXG4gICAgICAgIHBlZWtQcm9wcyA9IHsgbW9kZTonc2ltcGxlJywgaW50ZXJwOidub25lJyB9XG5cbiAgICBsZXQgZjEgPSBnLm1lbW8oIGcubXVsKCAyICogTWF0aC5QSSwgZy5kaXYoIGN1dG9mZiwgZy5nZW4uc2FtcGxlcmF0ZSApICkgKVxuICAgIGxldCBvbmVPdmVyUSA9IGcubWVtbyggZy5kaXYoIDEsIFEgKSApXG4gICAgbGV0IGwgPSBnLm1lbW8oIGcuYWRkKCBkMlswXSwgZy5tdWwoIGYxLCBkMVswXSApICkgKSxcbiAgICAgICAgaCA9IGcubWVtbyggZy5zdWIoIGcuc3ViKCBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQsIGwgKSwgZy5tdWwoIFEsIGQxWzBdICkgKSApLFxuICAgICAgICBiID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIGYxLCBoICksIGQxWzBdICkgKSxcbiAgICAgICAgbiA9IGcubWVtbyggZy5hZGQoIGgsIGwgKSApXG5cbiAgICBkMVswXSA9IGJcbiAgICBkMlswXSA9IGxcblxuICAgIGxldCBvdXQgPSBnLnNlbGVjdG9yKCBtb2RlLCBsLCBoLCBiLCBuIClcblxuICAgIGxldCByZXR1cm5WYWx1ZVxuICAgIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAgIGxldCBkMTIgPSBnLmRhdGEoWzAsMF0sIDEsIHsgbWV0YTp0cnVlIH0pLCBkMjIgPSBnLmRhdGEoWzAsMF0sIDEsIHsgbWV0YTp0cnVlIH0pXG4gICAgICBsZXQgbDIgPSBnLm1lbW8oIGcuYWRkKCBkMjJbMF0sIGcubXVsKCBmMSwgZDEyWzBdICkgKSApLFxuICAgICAgICAgIGgyID0gZy5tZW1vKCBnLnN1YiggZy5zdWIoIGlucHV0WzFdLCBsMiApLCBnLm11bCggUSwgZDEyWzBdICkgKSApLFxuICAgICAgICAgIGIyID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIGYxLCBoMiApLCBkMTJbMF0gKSApLFxuICAgICAgICAgIG4yID0gZy5tZW1vKCBnLmFkZCggaDIsIGwyICkgKVxuXG4gICAgICBkMTJbMF0gPSBiMlxuICAgICAgZDIyWzBdID0gbDJcblxuICAgICAgbGV0IG91dDIgPSBnLnNlbGVjdG9yKCBtb2RlLCBsMiwgaDIsIGIyLCBuMiApXG5cbiAgICAgIHJldHVyblZhbHVlID0gWyBvdXQsIG91dDIgXVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG4gIGxldCBTVkYgPSBpbnB1dFByb3BzID0+IHtcbiAgICBjb25zdCBzdmYgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFNWRi5kZWZhdWx0cywgaW5wdXRQcm9wcyApIFxuXG4gICAgY29uc3QgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlb1xuICAgIFxuICAgIC8vIFhYWCBORUVEUyBSRUZBQ1RPUklOR1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIHN2ZixcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guc3ZmKCBnLmluKCdpbnB1dCcpLCBnLm11bCggZy5pbignY3V0b2ZmJyksIGcuZ2VuLnNhbXBsZXJhdGUgLyA1ICksIGcuc3ViKCAxLCBnLmluKCdRJykgKSwgZy5pbignbW9kZScpLCBpc1N0ZXJlbyApLCBcbiAgICAgICdzdmYnLCBcbiAgICAgIHByb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIHN2ZlxuICB9XG5cblxuICBTVkYuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiAuNzUsXG4gICAgY3V0b2ZmOi4zNSxcbiAgICBtb2RlOjBcbiAgfVxuXG4gIHJldHVybiBTVkZcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBCaXRDcnVzaGVyID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHsgYml0Q3J1c2hlckxlbmd0aDogNDQxMDAgfSwgQml0Q3J1c2hlci5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgYml0Q3J1c2hlciA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGJpdERlcHRoID0gZy5pbiggJ2JpdERlcHRoJyApLFxuICAgICAgc2FtcGxlUmF0ZSA9IGcuaW4oICdzYW1wbGVSYXRlJyApLFxuICAgICAgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMCBdIDogaW5wdXQsXG4gICAgICByaWdodElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMSBdIDogbnVsbFxuICBcbiAgbGV0IHN0b3JlTCA9IGcuaGlzdG9yeSgwKVxuICBsZXQgc2FtcGxlUmVkdXhDb3VudGVyID0gZy5jb3VudGVyKCBzYW1wbGVSYXRlLCAwLCAxIClcblxuICBsZXQgYml0TXVsdCA9IGcucG93KCBnLm11bCggYml0RGVwdGgsIDE2ICksIDIgKVxuICBsZXQgY3J1c2hlZEwgPSBnLmRpdiggZy5mbG9vciggZy5tdWwoIGxlZnRJbnB1dCwgYml0TXVsdCApICksIGJpdE11bHQgKVxuXG4gIGxldCBvdXRMID0gZy5zd2l0Y2goXG4gICAgc2FtcGxlUmVkdXhDb3VudGVyLndyYXAsXG4gICAgY3J1c2hlZEwsXG4gICAgc3RvcmVMLm91dFxuICApXG5cbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIGxldCBzdG9yZVIgPSBnLmhpc3RvcnkoMClcbiAgICBsZXQgY3J1c2hlZFIgPSBnLmRpdiggZy5mbG9vciggZy5tdWwoIHJpZ2h0SW5wdXQsIGJpdE11bHQgKSApLCBiaXRNdWx0IClcblxuICAgIGxldCBvdXRSID0gdGVybmFyeSggXG4gICAgICBzYW1wbGVSZWR1eENvdW50ZXIud3JhcCxcbiAgICAgIGNydXNoZWRSLFxuICAgICAgc3RvcmVMLm91dFxuICAgIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIGJpdENydXNoZXIsXG4gICAgICBbIG91dEwsIG91dFIgXSwgXG4gICAgICAnYml0Q3J1c2hlcicsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggYml0Q3J1c2hlciwgb3V0TCwgJ2JpdENydXNoZXInLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBiaXRDcnVzaGVyXG59XG5cbkJpdENydXNoZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGJpdERlcHRoOi41LFxuICBzYW1wbGVSYXRlOiAuNVxufVxuXG5yZXR1cm4gQml0Q3J1c2hlclxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgbGV0IHByb3RvID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBsZXQgU2h1ZmZsZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgYnVmZmVyU2h1ZmZsZXIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgICBidWZmZXJTaXplID0gODgyMDBcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTaHVmZmxlci5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiBmYWxzZVxuICAgIGxldCBwaGFzZSA9IGcuYWNjdW0oIDEsMCx7IHNob3VsZFdyYXA6IGZhbHNlIH0pXG5cbiAgICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICAgIGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbIDAgXSA6IGlucHV0LFxuICAgICAgICByaWdodElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMSBdIDogbnVsbCxcbiAgICAgICAgcmF0ZU9mU2h1ZmZsaW5nID0gZy5pbiggJ3JhdGUnICksXG4gICAgICAgIGNoYW5jZU9mU2h1ZmZsaW5nID0gZy5pbiggJ2NoYW5jZScgKSxcbiAgICAgICAgcmV2ZXJzZUNoYW5jZSA9IGcuaW4oICdyZXZlcnNlQ2hhbmNlJyApLFxuICAgICAgICByZXBpdGNoQ2hhbmNlID0gZy5pbiggJ3JlcGl0Y2hDaGFuY2UnICksXG4gICAgICAgIHJlcGl0Y2hNaW4gPSBnLmluKCAncmVwaXRjaE1pbicgKSxcbiAgICAgICAgcmVwaXRjaE1heCA9IGcuaW4oICdyZXBpdGNoTWF4JyApXG5cbiAgICBsZXQgcGl0Y2hNZW1vcnkgPSBnLmhpc3RvcnkoMSlcblxuICAgIGxldCBzaG91bGRTaHVmZmxlQ2hlY2sgPSBnLmVxKCBnLm1vZCggcGhhc2UsIHJhdGVPZlNodWZmbGluZyApLCAwIClcbiAgICBsZXQgaXNTaHVmZmxpbmcgPSBnLm1lbW8oIGcuc2FoKCBnLmx0KCBnLm5vaXNlKCksIGNoYW5jZU9mU2h1ZmZsaW5nICksIHNob3VsZFNodWZmbGVDaGVjaywgMCApICkgXG5cbiAgICAvLyBpZiB3ZSBhcmUgc2h1ZmZsaW5nIGFuZCBvbiBhIHJlcGVhdCBib3VuZGFyeS4uLlxuICAgIGxldCBzaHVmZmxlQ2hhbmdlZCA9IGcubWVtbyggZy5hbmQoIHNob3VsZFNodWZmbGVDaGVjaywgaXNTaHVmZmxpbmcgKSApXG4gICAgbGV0IHNob3VsZFJldmVyc2UgPSBnLmx0KCBnLm5vaXNlKCksIHJldmVyc2VDaGFuY2UgKSxcbiAgICAgICAgcmV2ZXJzZU1vZCA9IGcuc3dpdGNoKCBzaG91bGRSZXZlcnNlLCAtMSwgMSApXG5cbiAgICBsZXQgcGl0Y2ggPSBnLmlmZWxzZSggXG4gICAgICBnLmFuZCggc2h1ZmZsZUNoYW5nZWQsIGcubHQoIGcubm9pc2UoKSwgcmVwaXRjaENoYW5jZSApICksXG4gICAgICBnLm1lbW8oIGcubXVsKCBnLmFkZCggcmVwaXRjaE1pbiwgZy5tdWwoIGcuc3ViKCByZXBpdGNoTWF4LCByZXBpdGNoTWluICksIGcubm9pc2UoKSApICksIHJldmVyc2VNb2QgKSApLFxuICAgICAgcmV2ZXJzZU1vZFxuICAgIClcbiAgICBcbiAgICAvLyBvbmx5IHN3aXRjaCBwaXRjaGVzIG9uIHJlcGVhdCBib3VuZGFyaWVzXG4gICAgcGl0Y2hNZW1vcnkuaW4oIGcuc3dpdGNoKCBzaHVmZmxlQ2hhbmdlZCwgcGl0Y2gsIHBpdGNoTWVtb3J5Lm91dCApIClcblxuICAgIGxldCBmYWRlTGVuZ3RoID0gZy5tZW1vKCBnLmRpdiggcmF0ZU9mU2h1ZmZsaW5nLCAxMDAgKSApLFxuICAgICAgICBmYWRlSW5jciA9IGcubWVtbyggZy5kaXYoIDEsIGZhZGVMZW5ndGggKSApXG5cbiAgICBsZXQgYnVmZmVyTCA9IGcuZGF0YSggYnVmZmVyU2l6ZSApLCBidWZmZXJSID0gaXNTdGVyZW8gPyBnLmRhdGEoIGJ1ZmZlclNpemUgKSA6IG51bGxcbiAgICBsZXQgcmVhZFBoYXNlID0gZy5hY2N1bSggcGl0Y2hNZW1vcnkub3V0LCAwLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSkgXG4gICAgbGV0IHN0dXR0ZXIgPSBnLndyYXAoIGcuc3ViKCBnLm1vZCggcmVhZFBoYXNlLCBidWZmZXJTaXplICksIDIyMDUwICksIDAsIGJ1ZmZlclNpemUgKVxuXG4gICAgbGV0IG5vcm1hbFNhbXBsZSA9IGcucGVlayggYnVmZmVyTCwgZy5hY2N1bSggMSwgMCwgeyBtYXg6ODgyMDAgfSksIHsgbW9kZTonc2ltcGxlJyB9KVxuXG4gICAgbGV0IHN0dXR0ZXJTYW1wbGVQaGFzZSA9IGcuc3dpdGNoKCBpc1NodWZmbGluZywgc3R1dHRlciwgZy5tb2QoIHJlYWRQaGFzZSwgYnVmZmVyU2l6ZSApIClcbiAgICBsZXQgc3R1dHRlclNhbXBsZSA9IGcubWVtbyggZy5wZWVrKCBcbiAgICAgIGJ1ZmZlckwsIFxuICAgICAgc3R1dHRlclNhbXBsZVBoYXNlLFxuICAgICAgeyBtb2RlOidzYW1wbGVzJyB9XG4gICAgKSApXG4gICAgXG4gICAgbGV0IHN0dXR0ZXJTaG91bGRGYWRlSW4gPSBnLmFuZCggc2h1ZmZsZUNoYW5nZWQsIGlzU2h1ZmZsaW5nIClcbiAgICBsZXQgc3R1dHRlclBoYXNlID0gZy5hY2N1bSggMSwgc2h1ZmZsZUNoYW5nZWQsIHsgc2hvdWxkV3JhcDogZmFsc2UgfSlcblxuICAgIGxldCBmYWRlSW5BbW91bnQgPSBnLm1lbW8oIGcuZGl2KCBzdHV0dGVyUGhhc2UsIGZhZGVMZW5ndGggKSApXG4gICAgbGV0IGZhZGVPdXRBbW91bnQgPSBnLmRpdiggZy5zdWIoIHJhdGVPZlNodWZmbGluZywgc3R1dHRlclBoYXNlICksIGcuc3ViKCByYXRlT2ZTaHVmZmxpbmcsIGZhZGVMZW5ndGggKSApXG4gICAgXG4gICAgbGV0IGZhZGVkU3R1dHRlciA9IGcuaWZlbHNlKFxuICAgICAgZy5sdCggc3R1dHRlclBoYXNlLCBmYWRlTGVuZ3RoICksXG4gICAgICBnLm1lbW8oIGcubXVsKCBnLnN3aXRjaCggZy5sdCggZmFkZUluQW1vdW50LCAxICksIGZhZGVJbkFtb3VudCwgMSApLCBzdHV0dGVyU2FtcGxlICkgKSxcbiAgICAgIGcuZ3QoIHN0dXR0ZXJQaGFzZSwgZy5zdWIoIHJhdGVPZlNodWZmbGluZywgZmFkZUxlbmd0aCApICksXG4gICAgICBnLm1lbW8oIGcubXVsKCBnLmd0cCggZmFkZU91dEFtb3VudCwgMCApLCBzdHV0dGVyU2FtcGxlICkgKSxcbiAgICAgIHN0dXR0ZXJTYW1wbGVcbiAgICApXG4gICAgXG4gICAgbGV0IG91dHB1dEwgPSBnLm1peCggbm9ybWFsU2FtcGxlLCBmYWRlZFN0dXR0ZXIsIGlzU2h1ZmZsaW5nICkgXG5cbiAgICBsZXQgcG9rZUwgPSBnLnBva2UoIGJ1ZmZlckwsIGxlZnRJbnB1dCwgZy5tb2QoIGcuYWRkKCBwaGFzZSwgNDQxMDAgKSwgODgyMDAgKSApXG5cbiAgICBsZXQgcGFubmVyID0gZy5wYW4oIG91dHB1dEwsIG91dHB1dEwsIGcuaW4oICdwYW4nICkgKVxuICAgIFxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIGJ1ZmZlclNodWZmbGVyLFxuICAgICAgW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLFxuICAgICAgJ3NodWZmbGVyJywgXG4gICAgICBwcm9wcyBcbiAgICApIFxuXG4gICAgcmV0dXJuIGJ1ZmZlclNodWZmbGVyXG4gIH1cbiAgXG4gIFNodWZmbGVyLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgcmF0ZToyMjA1MCxcbiAgICBjaGFuY2U6LjI1LFxuICAgIHJldmVyc2VDaGFuY2U6LjUsXG4gICAgcmVwaXRjaENoYW5jZTouNSxcbiAgICByZXBpdGNoTWluOi41LFxuICAgIHJlcGl0Y2hNYXg6MixcbiAgICBwYW46LjUsXG4gICAgbWl4Oi41XG4gIH1cblxuICByZXR1cm4gU2h1ZmZsZXIgXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBDaG9ydXMgPSBpbnB1dFByb3BzID0+IHtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBDaG9ydXMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICBcbiAgY29uc3QgY2hvcnVzID0gT2JqZWN0LmNyZWF0ZSggR2liYmVyaXNoLnByb3RvdHlwZXMudWdlbiApXG5cbiAgY29uc3QgaW5wdXQgPSBnLmluKCdpbnB1dCcpLFxuICAgICAgICBmcmVxMSA9IGcuaW4oJ3Nsb3dGcmVxdWVuY3knKSxcbiAgICAgICAgZnJlcTIgPSBnLmluKCdmYXN0RnJlcXVlbmN5JyksXG4gICAgICAgIGFtcDEgID0gZy5pbignc2xvd0dhaW4nKSxcbiAgICAgICAgYW1wMiAgPSBnLmluKCdmYXN0R2FpbicpXG5cbiAgY29uc3QgaXNTdGVyZW8gPSB0eXBlb2YgcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09ICd1bmRlZmluZWQnID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuXG4gIGNvbnN0IGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dFxuXG4gIGNvbnN0IHdpbjAgICA9IGcuZW52KCAnaW52ZXJzZXdlbGNoJywgMTAyNCApLFxuICAgICAgICB3aW4xMjAgPSBnLmVudiggJ2ludmVyc2V3ZWxjaCcsIDEwMjQsIDAsIC4zMzMgKSxcbiAgICAgICAgd2luMjQwID0gZy5lbnYoICdpbnZlcnNld2VsY2gnLCAxMDI0LCAwLCAuNjY2IClcbiAgXG4gIGNvbnN0IHNsb3dQaGFzb3IgPSBnLnBoYXNvciggZnJlcTEsIDAsIHsgbWluOjAgfSksXG4gIFx0XHQgIHNsb3dQZWVrMSAgPSBnLm11bCggZy5wZWVrKCB3aW4wLCAgIHNsb3dQaGFzb3IgKSwgYW1wMSApLFxuICAgICAgICBzbG93UGVlazIgID0gZy5tdWwoIGcucGVlayggd2luMTIwLCBzbG93UGhhc29yICksIGFtcDEgKSxcbiAgICAgICAgc2xvd1BlZWszICA9IGcubXVsKCBnLnBlZWsoIHdpbjI0MCwgc2xvd1BoYXNvciApLCBhbXAxIClcbiAgXG4gIGNvbnN0IGZhc3RQaGFzb3IgPSBnLnBoYXNvciggZnJlcTIsIDAsIHsgbWluOjAgfSksXG4gIFx0ICBcdGZhc3RQZWVrMSAgPSBnLm11bCggZy5wZWVrKCB3aW4wLCAgIGZhc3RQaGFzb3IgKSwgYW1wMiApLFxuICAgICAgICBmYXN0UGVlazIgID0gZy5tdWwoIGcucGVlayggd2luMTIwLCBmYXN0UGhhc29yICksIGFtcDIgKSxcbiAgICAgICAgZmFzdFBlZWszICA9IGcubXVsKCBnLnBlZWsoIHdpbjI0MCwgZmFzdFBoYXNvciApLCBhbXAyIClcblxuICBjb25zdCBtcyA9IEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZSAvIDEwMDAgXG4gIGNvbnN0IG1heERlbGF5VGltZSA9IDEwMCAqIG1zXG5cbiAgY29uc3QgdGltZTEgPSAgZy5tdWwoIGcuYWRkKCBzbG93UGVlazEsIGZhc3RQZWVrMSwgNSApLCBtcyApLFxuICAgICAgICB0aW1lMiA9ICBnLm11bCggZy5hZGQoIHNsb3dQZWVrMiwgZmFzdFBlZWsyLCA1ICksIG1zICksXG4gICAgICAgIHRpbWUzID0gIGcubXVsKCBnLmFkZCggc2xvd1BlZWszLCBmYXN0UGVlazMsIDUgKSwgbXMgKVxuXG4gIGNvbnN0IGRlbGF5MUwgPSBnLmRlbGF5KCBsZWZ0SW5wdXQsIHRpbWUxLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pLFxuICAgICAgICBkZWxheTJMID0gZy5kZWxheSggbGVmdElucHV0LCB0aW1lMiwgeyBzaXplOm1heERlbGF5VGltZSB9KSxcbiAgICAgICAgZGVsYXkzTCA9IGcuZGVsYXkoIGxlZnRJbnB1dCwgdGltZTMsIHsgc2l6ZTptYXhEZWxheVRpbWUgfSlcblxuICBcbiAgY29uc3QgbGVmdE91dHB1dCA9IGcuYWRkKCBkZWxheTFMLCBkZWxheTJMLCBkZWxheTNMIClcbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIGNvbnN0IHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIGNvbnN0IGRlbGF5MVIgPSBnLmRlbGF5KHJpZ2h0SW5wdXQsIHRpbWUxLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pLFxuICAgICAgICAgIGRlbGF5MlIgPSBnLmRlbGF5KHJpZ2h0SW5wdXQsIHRpbWUyLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pLFxuICAgICAgICAgIGRlbGF5M1IgPSBnLmRlbGF5KHJpZ2h0SW5wdXQsIHRpbWUzLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pXG5cbiAgICAvLyBmbGlwIGEgY291cGxlIGRlbGF5IGxpbmVzIGZvciBzdGVyZW8gZWZmZWN0P1xuICAgIGNvbnN0IHJpZ2h0T3V0cHV0ID0gZy5kaXYoIGcuYWRkKCBkZWxheTFSLCBkZWxheTJSLCBkZWxheTNSICksIDMgKVxuICAgIGNob3J1cy5ncmFwaCA9IFsgbGVmdE91dHB1dCwgcmlnaHRPdXRwdXQgXVxuICB9ZWxzZXtcbiAgICBjaG9ydXMuZ3JhcGggPSBsZWZ0T3V0cHV0XG4gIH1cbiAgXG4gIEdpYmJlcmlzaC5mYWN0b3J5KCBjaG9ydXMsIGNob3J1cy5ncmFwaCwgJ2Nob3J1cycsIHByb3BzIClcblxuICByZXR1cm4gY2hvcnVzXG59XG5cbkNob3J1cy5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgc2xvd0ZyZXF1ZW5jeTogLjE4LFxuICBzbG93R2FpbjoxLFxuICBmYXN0RnJlcXVlbmN5OjYsXG4gIGZhc3RHYWluOi4yXG59XG5cbnJldHVybiBDaG9ydXNcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgRGVsYXkgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBkZWxheUxlbmd0aDogNDQxMDAgfSwgRGVsYXkuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIGRlbGF5ID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgZGVsYXlUaW1lID0gZy5pbiggJ2RlbGF5VGltZScgKSxcbiAgICAgIGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbIDAgXSA6IGlucHV0LFxuICAgICAgcmlnaHRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbIDEgXSA6IG51bGxcbiAgICBcbiAgbGV0IGZlZWRiYWNrID0gZy5pbiggJ2ZlZWRiYWNrJyApXG5cbiAgLy8gbGVmdCBjaGFubmVsXG4gIGxldCBmZWVkYmFja0hpc3RvcnlMID0gZy5oaXN0b3J5KClcbiAgbGV0IGVjaG9MID0gZy5kZWxheSggZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGZlZWRiYWNrSGlzdG9yeUwub3V0LCBmZWVkYmFjayApICksIGRlbGF5VGltZSwgeyBzaXplOnByb3BzLmRlbGF5TGVuZ3RoIH0pXG4gIGZlZWRiYWNrSGlzdG9yeUwuaW4oIGVjaG9MIClcblxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgLy8gcmlnaHQgY2hhbm5lbFxuICAgIGxldCBmZWVkYmFja0hpc3RvcnlSID0gZy5oaXN0b3J5KClcbiAgICBsZXQgZWNob1IgPSBnLmRlbGF5KCBnLmFkZCggcmlnaHRJbnB1dCwgZy5tdWwoIGZlZWRiYWNrSGlzdG9yeVIub3V0LCBmZWVkYmFjayApICksIGRlbGF5VGltZSwgeyBzaXplOnByb3BzLmRlbGF5TGVuZ3RoIH0pXG4gICAgZmVlZGJhY2tIaXN0b3J5Ui5pbiggZWNob1IgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgZGVsYXksXG4gICAgICBbIGVjaG9MLCBlY2hvUiBdLCBcbiAgICAgICdkZWxheScsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggZGVsYXksIGVjaG9MLCAnZGVsYXknLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBkZWxheVxufVxuXG5EZWxheS5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZmVlZGJhY2s6LjkyNSxcbiAgZGVsYXlUaW1lOiAxMTAyNVxufVxuXG5yZXR1cm4gRGVsYXlcblxufVxuIiwibGV0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5sZXQgZWZmZWN0ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbk9iamVjdC5hc3NpZ24oIGVmZmVjdCwge1xuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVmZmVjdFxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IGVmZmVjdHMgPSB7XG4gICAgRnJlZXZlcmIgICAgOiByZXF1aXJlKCAnLi9mcmVldmVyYi5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIEZsYW5nZXIgICAgIDogcmVxdWlyZSggJy4vZmxhbmdlci5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBWaWJyYXRvICAgICA6IHJlcXVpcmUoICcuL3ZpYnJhdG8uanMnICAgKSggR2liYmVyaXNoICksXG4gICAgRGVsYXkgICAgICAgOiByZXF1aXJlKCAnLi9kZWxheS5qcycgICAgICkoIEdpYmJlcmlzaCApLFxuICAgIEJpdENydXNoZXIgIDogcmVxdWlyZSggJy4vYml0Q3J1c2hlci5qcycpKCBHaWJiZXJpc2ggKSxcbiAgICBSaW5nTW9kICAgICA6IHJlcXVpcmUoICcuL3JpbmdNb2QuanMnICAgKSggR2liYmVyaXNoICksXG4gICAgVHJlbW9sbyAgICAgOiByZXF1aXJlKCAnLi90cmVtb2xvLmpzJyAgICkoIEdpYmJlcmlzaCApLFxuICAgIENob3J1cyAgICAgIDogcmVxdWlyZSggJy4vY2hvcnVzLmpzJyAgICApKCBHaWJiZXJpc2ggKSxcbiAgICBTaHVmZmxlciAgICA6IHJlcXVpcmUoICcuL2J1ZmZlclNodWZmbGVyLmpzJyAgKSggR2liYmVyaXNoIClcbiAgfVxuXG4gIGVmZmVjdHMuZXhwb3J0ID0gdGFyZ2V0ID0+IHtcbiAgICBmb3IoIGxldCBrZXkgaW4gZWZmZWN0cyApIHtcbiAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICB0YXJnZXRbIGtleSBdID0gZWZmZWN0c1sga2V5IF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxucmV0dXJuIGVmZmVjdHNcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgRmxhbmdlciA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgICA9IE9iamVjdC5hc3NpZ24oIHsgZGVsYXlMZW5ndGg6NDQxMDAgfSwgRmxhbmdlci5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgZmxhbmdlciA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGRlbGF5TGVuZ3RoID0gcHJvcHMuZGVsYXlMZW5ndGgsXG4gICAgICBmZWVkYmFja0NvZWZmID0gZy5pbiggJ2ZlZWRiYWNrJyApLFxuICAgICAgbW9kQW1vdW50ID0gZy5pbiggJ29mZnNldCcgKSxcbiAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICBkZWxheUJ1ZmZlckwgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoICksXG4gICAgICBkZWxheUJ1ZmZlclJcblxuICBsZXQgd3JpdGVJZHggPSBnLmFjY3VtKCAxLDAsIHsgbWluOjAsIG1heDpkZWxheUxlbmd0aCwgaW50ZXJwOidub25lJywgbW9kZTonc2FtcGxlcycgfSlcbiAgXG4gIGxldCBvZmZzZXQgPSBnLm11bCggbW9kQW1vdW50LCA1MDAgKVxuXG4gIGxldCBtb2QgPSBwcm9wcy5tb2QgPT09IHVuZGVmaW5lZCA/IGcuY3ljbGUoIGZyZXF1ZW5jeSApIDogcHJvcHMubW9kXG4gIFxuICBsZXQgcmVhZElkeCA9IGcud3JhcCggXG4gICAgZy5hZGQoIFxuICAgICAgZy5zdWIoIHdyaXRlSWR4LCBvZmZzZXQgKSwgXG4gICAgICBtb2QvL2cubXVsKCBtb2QsIGcuc3ViKCBvZmZzZXQsIDEgKSApIFxuICAgICksIFxuXHQgIDAsIFxuICAgIGRlbGF5TGVuZ3RoXG4gIClcblxuICBsZXQgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0XG5cbiAgbGV0IGRlbGF5ZWRPdXRMID0gZy5wZWVrKCBkZWxheUJ1ZmZlckwsIHJlYWRJZHgsIHsgaW50ZXJwOidsaW5lYXInLCBtb2RlOidzYW1wbGVzJyB9KVxuICBcbiAgZy5wb2tlKCBkZWxheUJ1ZmZlckwsIGcuYWRkKCBsZWZ0SW5wdXQsIGcubXVsKCBkZWxheWVkT3V0TCwgZmVlZGJhY2tDb2VmZiApICksIHdyaXRlSWR4IClcblxuICBsZXQgbGVmdCA9IGcuYWRkKCBsZWZ0SW5wdXQsIGRlbGF5ZWRPdXRMICksXG4gICAgICByaWdodFxuXG4gIGlmKCBpc1N0ZXJlbyA9PT0gdHJ1ZSApIHtcbiAgICByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICBkZWxheUJ1ZmZlclIgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoIClcbiAgICBcbiAgICBsZXQgZGVsYXllZE91dFIgPSBnLnBlZWsoIGRlbGF5QnVmZmVyUiwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG5cbiAgICBnLnBva2UoIGRlbGF5QnVmZmVyUiwgZy5hZGQoIHJpZ2h0SW5wdXQsIGcubXVsKCBkZWxheWVkT3V0UiwgZmVlZGJhY2tDb2VmZiApICksIHdyaXRlSWR4IClcbiAgICByaWdodCA9IGcuYWRkKCByaWdodElucHV0LCBkZWxheWVkT3V0UiApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBmbGFuZ2VyLFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgICdmbGFuZ2VyJywgXG4gICAgICBwcm9wcyBcbiAgICApXG5cbiAgfWVsc2V7XG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGZsYW5nZXIsIGxlZnQsICdmbGFuZ2VyJywgcHJvcHMgKVxuICB9XG4gIFxuICByZXR1cm4gZmxhbmdlclxufVxuXG5GbGFuZ2VyLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBmZWVkYmFjazouMDEsXG4gIG9mZnNldDouMjUsXG4gIGZyZXF1ZW5jeTouNVxufVxuXG5yZXR1cm4gRmxhbmdlclxuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIFxuY29uc3QgYWxsUGFzcyA9IEdpYmJlcmlzaC5maWx0ZXJzLmdlbmlzaC5BbGxQYXNzXG5jb25zdCBjb21iRmlsdGVyID0gR2liYmVyaXNoLmZpbHRlcnMuZ2VuaXNoLkNvbWJcblxuY29uc3QgdHVuaW5nID0ge1xuICBjb21iQ291bnQ6XHQgIFx0OCxcbiAgY29tYlR1bmluZzogXHRcdFsgMTExNiwgMTE4OCwgMTI3NywgMTM1NiwgMTQyMiwgMTQ5MSwgMTU1NywgMTYxNyBdLCAgICAgICAgICAgICAgICAgICAgXG4gIGFsbFBhc3NDb3VudDogXHQ0LFxuICBhbGxQYXNzVHVuaW5nOlx0WyAyMjUsIDU1NiwgNDQxLCAzNDEgXSxcbiAgYWxsUGFzc0ZlZWRiYWNrOjAuNSxcbiAgZml4ZWRHYWluOiBcdFx0ICAwLjAxNSxcbiAgc2NhbGVEYW1waW5nOiBcdDAuNCxcbiAgc2NhbGVSb29tOiBcdFx0ICAwLjI4LFxuICBvZmZzZXRSb29tOiBcdCAgMC43LFxuICBzdGVyZW9TcHJlYWQ6ICAgMjNcbn1cblxuY29uc3QgRnJlZXZlcmIgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIEZyZWV2ZXJiLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICByZXZlcmIgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKSBcbiAgIFxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGNvbWJzTCA9IFtdLCBjb21ic1IgPSBbXVxuXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIHdldDEgPSBnLmluKCAnd2V0MScpLCB3ZXQyID0gZy5pbiggJ3dldDInICksICBkcnkgPSBnLmluKCAnZHJ5JyApLCBcbiAgICAgIHJvb21TaXplID0gZy5pbiggJ3Jvb21TaXplJyApLCBkYW1waW5nID0gZy5pbiggJ2RhbXBpbmcnIClcbiAgXG4gIGxldCBzdW1tZWRJbnB1dCA9IGlzU3RlcmVvID09PSB0cnVlID8gZy5hZGQoIGlucHV0WzBdLCBpbnB1dFsxXSApIDogaW5wdXQsXG4gICAgICBhdHRlbnVhdGVkSW5wdXQgPSBnLm1lbW8oIGcubXVsKCBzdW1tZWRJbnB1dCwgdHVuaW5nLmZpeGVkR2FpbiApIClcbiAgXG4gIC8vIGNyZWF0ZSBjb21iIGZpbHRlcnMgaW4gcGFyYWxsZWwuLi5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCA4OyBpKysgKSB7IFxuICAgIGNvbWJzTC5wdXNoKCBcbiAgICAgIGNvbWJGaWx0ZXIoIGF0dGVudWF0ZWRJbnB1dCwgdHVuaW5nLmNvbWJUdW5pbmdbaV0sIGcubXVsKGRhbXBpbmcsLjQpLCBnLm11bCggdHVuaW5nLnNjYWxlUm9vbSArIHR1bmluZy5vZmZzZXRSb29tLCByb29tU2l6ZSApICkgXG4gICAgKVxuICAgIGNvbWJzUi5wdXNoKCBcbiAgICAgIGNvbWJGaWx0ZXIoIGF0dGVudWF0ZWRJbnB1dCwgdHVuaW5nLmNvbWJUdW5pbmdbaV0gKyB0dW5pbmcuc3RlcmVvU3ByZWFkLCBnLm11bChkYW1waW5nLC40KSwgZy5tdWwoIHR1bmluZy5zY2FsZVJvb20gKyB0dW5pbmcub2Zmc2V0Um9vbSwgcm9vbVNpemUgKSApIFxuICAgIClcbiAgfVxuICBcbiAgLy8gLi4uIGFuZCBzdW0gdGhlbSB3aXRoIGF0dGVudWF0ZWQgaW5wdXRcbiAgbGV0IG91dEwgPSBnLmFkZCggYXR0ZW51YXRlZElucHV0LCAuLi5jb21ic0wgKVxuICBsZXQgb3V0UiA9IGcuYWRkKCBhdHRlbnVhdGVkSW5wdXQsIC4uLmNvbWJzUiApXG4gIFxuICAvLyBydW4gdGhyb3VnaCBhbGxwYXNzIGZpbHRlcnMgaW4gc2VyaWVzXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgNDsgaSsrICkgeyBcbiAgICBvdXRMID0gYWxsUGFzcyggb3V0TCwgdHVuaW5nLmFsbFBhc3NUdW5pbmdbIGkgXSArIHR1bmluZy5zdGVyZW9TcHJlYWQgKVxuICAgIG91dFIgPSBhbGxQYXNzKCBvdXRSLCB0dW5pbmcuYWxsUGFzc1R1bmluZ1sgaSBdICsgdHVuaW5nLnN0ZXJlb1NwcmVhZCApXG4gIH1cbiAgXG4gIGxldCBvdXRwdXRMID0gZy5hZGQoIGcubXVsKCBvdXRMLCB3ZXQxICksIGcubXVsKCBvdXRSLCB3ZXQyICksIGcubXVsKCBpc1N0ZXJlbyA9PT0gdHJ1ZSA/IGlucHV0WzBdIDogaW5wdXQsIGRyeSApICksXG4gICAgICBvdXRwdXRSID0gZy5hZGQoIGcubXVsKCBvdXRSLCB3ZXQxICksIGcubXVsKCBvdXRMLCB3ZXQyICksIGcubXVsKCBpc1N0ZXJlbyA9PT0gdHJ1ZSA/IGlucHV0WzFdIDogaW5wdXQsIGRyeSApIClcblxuICBHaWJiZXJpc2guZmFjdG9yeSggcmV2ZXJiLCBbIG91dHB1dEwsIG91dHB1dFIgXSwgJ2ZyZWV2ZXJiJywgcHJvcHMgKVxuXG4gIHJldHVybiByZXZlcmJcbn1cblxuXG5GcmVldmVyYi5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgd2V0MTogMSxcbiAgd2V0MjogMCxcbiAgZHJ5OiAuNSxcbiAgcm9vbVNpemU6IC44NCxcbiAgZGFtcGluZzogIC41XG59XG5cbnJldHVybiBGcmVldmVyYiBcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBSaW5nTW9kID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyAgID0gT2JqZWN0LmFzc2lnbigge30sIFJpbmdNb2QuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIHJpbmdNb2QgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgZ2FpbiA9IGcuaW4oICdnYWluJyApLFxuICAgICAgbWl4ID0gZy5pbiggJ21peCcgKVxuICBcbiAgbGV0IGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCxcbiAgICAgIHNpbmUgPSBnLm11bCggZy5jeWNsZSggZnJlcXVlbmN5ICksIGdhaW4gKVxuIFxuICBsZXQgbGVmdCA9IGcuYWRkKCBnLm11bCggbGVmdElucHV0LCBnLnN1YiggMSwgbWl4ICkpLCBnLm11bCggZy5tdWwoIGxlZnRJbnB1dCwgc2luZSApLCBtaXggKSApLCBcbiAgICAgIHJpZ2h0XG5cbiAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgIGxldCByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICByaWdodCA9IGcuYWRkKCBnLm11bCggcmlnaHRJbnB1dCwgZy5zdWIoIDEsIG1peCApKSwgZy5tdWwoIGcubXVsKCByaWdodElucHV0LCBzaW5lICksIG1peCApICkgXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgcmluZ01vZCxcbiAgICAgIFsgbGVmdCwgcmlnaHQgXSwgXG4gICAgICAncmluZ01vZCcsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggcmluZ01vZCwgbGVmdCwgJ3JpbmdNb2QnLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiByaW5nTW9kXG59XG5cblJpbmdNb2QuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGZyZXF1ZW5jeToyMjAsXG4gIGdhaW46IDEsIFxuICBtaXg6MVxufVxuXG5yZXR1cm4gUmluZ01vZFxuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5jb25zdCBUcmVtb2xvID0gaW5wdXRQcm9wcyA9PiB7XG4gIGNvbnN0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7fSwgVHJlbW9sby5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgICB0cmVtb2xvID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBjb25zdCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBjb25zdCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgYW1vdW50ID0gZy5pbiggJ2Ftb3VudCcgKVxuICBcbiAgY29uc3QgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0XG5cbiAgbGV0IG9zY1xuICBpZiggcHJvcHMuc2hhcGUgPT09ICdzcXVhcmUnICkge1xuICAgIG9zYyA9IGcuZ3QoIGcucGhhc29yKCBmcmVxdWVuY3kgKSwgMCApXG4gIH1lbHNlIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ3NhdycgKSB7XG4gICAgb3NjID0gZy5ndHAoIGcucGhhc29yKCBmcmVxdWVuY3kgKSwgMCApXG4gIH1lbHNle1xuICAgIG9zYyA9IGcuY3ljbGUoIGZyZXF1ZW5jeSApXG4gIH1cblxuICBjb25zdCBtb2QgPSBnLm11bCggb3NjLCBhbW91bnQgKVxuIFxuICBsZXQgbGVmdCA9IGcuc3ViKCBsZWZ0SW5wdXQsIGcubXVsKCBsZWZ0SW5wdXQsIG1vZCApICksIFxuICAgICAgcmlnaHRcblxuICBpZiggaXNTdGVyZW8gPT09IHRydWUgKSB7XG4gICAgbGV0IHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIHJpZ2h0ID0gZy5tdWwoIHJpZ2h0SW5wdXQsIG1vZCApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICB0cmVtb2xvLFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgICd0cmVtb2xvJywgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCB0cmVtb2xvLCBsZWZ0LCAndHJlbW9sbycsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIHRyZW1vbG9cbn1cblxuVHJlbW9sby5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZnJlcXVlbmN5OjIsXG4gIGFtb3VudDogMSwgXG4gIHNoYXBlOidzaW5lJ1xufVxuXG5yZXR1cm4gVHJlbW9sb1xuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBWaWJyYXRvID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyAgID0gT2JqZWN0LmFzc2lnbigge30sIFZpYnJhdG8uZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIHZpYnJhdG8gPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheUxlbmd0aCA9IDQ0MTAwLFxuICAgICAgZmVlZGJhY2tDb2VmZiA9IC4wMSwvL2cuaW4oICdmZWVkYmFjaycgKSxcbiAgICAgIG1vZEFtb3VudCA9IGcuaW4oICdhbW91bnQnICksXG4gICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgZGVsYXlCdWZmZXJMID0gZy5kYXRhKCBkZWxheUxlbmd0aCApLFxuICAgICAgZGVsYXlCdWZmZXJSXG5cbiAgbGV0IHdyaXRlSWR4ID0gZy5hY2N1bSggMSwwLCB7IG1pbjowLCBtYXg6ZGVsYXlMZW5ndGgsIGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBsZXQgb2Zmc2V0ID0gZy5tdWwoIG1vZEFtb3VudCwgNTAwIClcbiAgXG4gIGxldCByZWFkSWR4ID0gZy53cmFwKCBcbiAgICBnLmFkZCggXG4gICAgICBnLnN1Yiggd3JpdGVJZHgsIG9mZnNldCApLCBcbiAgICAgIGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZy5zdWIoIG9mZnNldCwgMSApICkgXG4gICAgKSwgXG5cdCAgMCwgXG4gICAgZGVsYXlMZW5ndGhcbiAgKVxuXG4gIGxldCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBsZXQgZGVsYXllZE91dEwgPSBnLnBlZWsoIGRlbGF5QnVmZmVyTCwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBnLnBva2UoIGRlbGF5QnVmZmVyTCwgZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRMLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuXG4gIGxldCBsZWZ0ID0gZGVsYXllZE91dEwsXG4gICAgICByaWdodFxuXG4gIGlmKCBpc1N0ZXJlbyA9PT0gdHJ1ZSApIHtcbiAgICByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICBkZWxheUJ1ZmZlclIgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoIClcbiAgICBcbiAgICBsZXQgZGVsYXllZE91dFIgPSBnLnBlZWsoIGRlbGF5QnVmZmVyUiwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG5cbiAgICBnLnBva2UoIGRlbGF5QnVmZmVyUiwgZy5hZGQoIHJpZ2h0SW5wdXQsIG11bCggZGVsYXllZE91dFIsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG4gICAgcmlnaHQgPSBkZWxheWVkT3V0UlxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgdmlicmF0byxcbiAgICAgIFsgbGVmdCwgcmlnaHQgXSwgXG4gICAgICAndmlicmF0bycsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggdmlicmF0bywgbGVmdCwgJ3ZpYnJhdG8nLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiB2aWJyYXRvXG59XG5cblZpYnJhdG8uZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIC8vZmVlZGJhY2s6LjAxLFxuICBhbW91bnQ6LjUsXG4gIGZyZXF1ZW5jeTo0XG59XG5cbnJldHVybiBWaWJyYXRvXG5cbn1cbiIsImxldCBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCAnbWVtb3J5LWhlbHBlcicgKSxcbiAgICBnZW5pc2ggICAgICAgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG4gICAgXG5sZXQgR2liYmVyaXNoID0ge1xuICBibG9ja0NhbGxiYWNrczogW10sIC8vIGNhbGxlZCBldmVyeSBibG9ja1xuICBkaXJ0eVVnZW5zOiBbXSxcbiAgY2FsbGJhY2tVZ2VuczogW10sXG4gIGNhbGxiYWNrTmFtZXM6IFtdLFxuICBhbmFseXplcnM6IFtdLFxuICBncmFwaElzRGlydHk6IGZhbHNlLFxuICB1Z2Vuczoge30sXG4gIGRlYnVnOiBmYWxzZSxcblxuICBvdXRwdXQ6IG51bGwsXG5cbiAgbWVtb3J5IDogbnVsbCwgLy8gMjAgbWludXRlcyBieSBkZWZhdWx0P1xuICBmYWN0b3J5OiBudWxsLCBcbiAgZ2VuaXNoLFxuICBzY2hlZHVsZXI6IHJlcXVpcmUoICcuL3NjaGVkdWxpbmcvc2NoZWR1bGVyLmpzJyApLFxuXG4gIG1lbW9lZDoge30sXG5cbiAgcHJvdG90eXBlczoge1xuICAgIHVnZW46IHJlcXVpcmUoJy4vdWdlbi5qcycpLFxuICAgIGluc3RydW1lbnQ6IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL2luc3RydW1lbnQuanMnICksXG4gICAgZWZmZWN0OiByZXF1aXJlKCAnLi9meC9lZmZlY3QuanMnICksXG4gIH0sXG5cbiAgbWl4aW5zOiB7XG4gICAgcG9seWluc3RydW1lbnQ6IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL3BvbHlNaXhpbi5qcycgKVxuICB9LFxuXG4gIGluaXQoIG1lbUFtb3VudCApIHtcbiAgICBsZXQgbnVtQnl0ZXMgPSBtZW1BbW91bnQgPT09IHVuZGVmaW5lZCA/IDIwICogNjAgKiA0NDEwMCA6IG1lbUFtb3VudFxuXG4gICAgdGhpcy5tZW1vcnkgPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBudW1CeXRlcyApXG5cbiAgICB0aGlzLmxvYWQoKVxuICAgIFxuICAgIHRoaXMub3V0cHV0ID0gdGhpcy5CdXMyKClcblxuICAgIHRoaXMudXRpbGl0aWVzLmNyZWF0ZUNvbnRleHQoKVxuICAgIHRoaXMudXRpbGl0aWVzLmNyZWF0ZVNjcmlwdFByb2Nlc3NvcigpXG5cbiAgICB0aGlzLmFuYWx5emVycy5kaXJ0eSA9IGZhbHNlXG5cbiAgICAvLyBYWFggRk9SIERFVkVMT1BNRU5UIEFORCBURVNUSU5HIE9OTFkuLi4gUkVNT1ZFIEZPUiBQUk9EVUNUSU9OXG4gICAgdGhpcy5leHBvcnQoIHdpbmRvdyApXG4gIH0sXG5cbiAgbG9hZCgpIHtcbiAgICB0aGlzLmZhY3RvcnkgPSByZXF1aXJlKCAnLi91Z2VuVGVtcGxhdGUuanMnICkoIHRoaXMgKVxuXG4gICAgdGhpcy5Qb2x5VGVtcGxhdGUgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50cy9wb2x5dGVtcGxhdGUuanMnICkoIHRoaXMgKVxuICAgIHRoaXMub3NjaWxsYXRvcnMgID0gcmVxdWlyZSggJy4vb3NjaWxsYXRvcnMvb3NjaWxsYXRvcnMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuZmlsdGVycyAgICAgID0gcmVxdWlyZSggJy4vZmlsdGVycy9maWx0ZXJzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLmJpbm9wcyAgICAgICA9IHJlcXVpcmUoICcuL21pc2MvYmlub3BzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLm1vbm9wcyAgICAgICA9IHJlcXVpcmUoICcuL21pc2MvbW9ub3BzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLkJ1cyAgICAgICAgICA9IHJlcXVpcmUoICcuL21pc2MvYnVzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLkJ1czIgICAgICAgICA9IHJlcXVpcmUoICcuL21pc2MvYnVzMi5qcycgKSggdGhpcyApO1xuICAgIHRoaXMuaW5zdHJ1bWVudHMgID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvaW5zdHJ1bWVudHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuZnggICAgICAgICAgID0gcmVxdWlyZSggJy4vZngvZWZmZWN0cy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5TZXF1ZW5jZXIgICAgPSByZXF1aXJlKCAnLi9zY2hlZHVsaW5nL3NlcXVlbmNlci5qcycgKSggdGhpcyApO1xuICAgIHRoaXMuU2VxdWVuY2VyMiAgID0gcmVxdWlyZSggJy4vc2NoZWR1bGluZy9zZXEyLmpzJyApKCB0aGlzICk7XG4gICAgdGhpcy5lbnZlbG9wZXMgICAgPSByZXF1aXJlKCAnLi9lbnZlbG9wZXMvZW52ZWxvcGVzLmpzJyApKCB0aGlzICk7XG4gICAgdGhpcy5zc2QgICAgICAgICAgPSByZXF1aXJlKCAnLi9hbmFseXNpcy9zaW5nbGVzYW1wbGVkZWxheS5qcycgKSggdGhpcyApO1xuICB9LFxuXG4gIGV4cG9ydCggdGFyZ2V0LCBzaG91bGRFeHBvcnRHZW5pc2g9ZmFsc2UgKSB7XG4gICAgaWYoIHRhcmdldCA9PT0gdW5kZWZpbmVkICkgdGhyb3cgRXJyb3IoJ1lvdSBtdXN0IGRlZmluZSBhIHRhcmdldCBvYmplY3QgZm9yIEdpYmJlcmlzaCB0byBleHBvcnQgdmFyaWFibGVzIHRvLicpXG5cbiAgICBpZiggc2hvdWxkRXhwb3J0R2VuaXNoICkgdGhpcy5nZW5pc2guZXhwb3J0KCB0YXJnZXQgKVxuXG4gICAgdGhpcy5pbnN0cnVtZW50cy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5meC5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5maWx0ZXJzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLm9zY2lsbGF0b3JzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmJpbm9wcy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5tb25vcHMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMuZW52ZWxvcGVzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0YXJnZXQuU2VxdWVuY2VyID0gdGhpcy5TZXF1ZW5jZXJcbiAgICB0YXJnZXQuU2VxdWVuY2VyMiA9IHRoaXMuU2VxdWVuY2VyMlxuICAgIHRhcmdldC5CdXMgPSB0aGlzLkJ1c1xuICAgIHRhcmdldC5CdXMyID0gdGhpcy5CdXMyXG4gICAgdGFyZ2V0LlNjaGVkdWxlciA9IHRoaXMuc2NoZWR1bGVyXG4gICAgdGFyZ2V0LlNTRCA9IHRoaXMuc3NkXG4gIH0sXG5cbiAgcHJpbnQoKSB7XG4gICAgY29uc29sZS5sb2coIHRoaXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG4gIH0sXG5cbiAgZGlydHkoIHVnZW4gKSB7XG4gICAgaWYoIHVnZW4gPT09IHRoaXMuYW5hbHl6ZXJzICkge1xuICAgICAgdGhpcy5ncmFwaElzRGlydHkgPSB0cnVlXG4gICAgICB0aGlzLmFuYWx5emVycy5kaXJ0eSA9IHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaXJ0eVVnZW5zLnB1c2goIHVnZW4gKVxuICAgICAgdGhpcy5ncmFwaElzRGlydHkgPSB0cnVlXG4gICAgICBpZiggdGhpcy5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXSApIHtcbiAgICAgICAgZGVsZXRlIHRoaXMubWVtb2VkWyB1Z2VuLnVnZW5OYW1lIF1cbiAgICAgIH1cbiAgICB9IFxuICB9LFxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMub3V0cHV0LmlucHV0cyA9IFswXVxuICAgIHRoaXMub3V0cHV0LmlucHV0TmFtZXMubGVuZ3RoID0gMFxuICAgIHRoaXMuYW5hbHl6ZXJzLmxlbmd0aCA9IDBcbiAgICB0aGlzLnNjaGVkdWxlci5jbGVhcigpXG4gICAgdGhpcy5kaXJ0eSggdGhpcy5vdXRwdXQgKVxuICB9LFxuXG4gIGdlbmVyYXRlQ2FsbGJhY2soKSB7XG4gICAgbGV0IHVpZCA9IDAsXG4gICAgICAgIGNhbGxiYWNrQm9keSwgbGFzdExpbmUsIGFuYWx5c2lzPScnXG5cbiAgICB0aGlzLm1lbW9lZCA9IHt9XG5cbiAgICBjYWxsYmFja0JvZHkgPSB0aGlzLnByb2Nlc3NHcmFwaCggdGhpcy5vdXRwdXQgKVxuICAgIGxhc3RMaW5lID0gY2FsbGJhY2tCb2R5WyBjYWxsYmFja0JvZHkubGVuZ3RoIC0gMV1cbiAgICBjYWxsYmFja0JvZHkudW5zaGlmdCggXCJcXHQndXNlIHN0cmljdCc7XCIgKVxuXG4gICAgdGhpcy5hbmFseXplcnMuZm9yRWFjaCggdj0+IHtcbiAgICAgIGNvbnN0IGFuYWx5c2lzQmxvY2sgPSBHaWJiZXJpc2gucHJvY2Vzc1VnZW4oIHYgKVxuICAgICAgY29uc3QgYW5hbHlzaXNMaW5lID0gYW5hbHlzaXNCbG9jay5wb3AoKVxuXG4gICAgICBhbmFseXNpc0Jsb2NrLmZvckVhY2goIHY9PiB7XG4gICAgICAgIGNhbGxiYWNrQm9keS5zcGxpY2UoIGNhbGxiYWNrQm9keS5sZW5ndGggLSAxLCAwLCB2IClcbiAgICAgIH0pXG5cbiAgICAgIGNhbGxiYWNrQm9keS5wdXNoKCBhbmFseXNpc0xpbmUgKVxuICAgIH0pXG5cbiAgICB0aGlzLmFuYWx5emVycy5mb3JFYWNoKCB2ID0+IHtcbiAgICAgIGlmKCB0aGlzLmNhbGxiYWNrVWdlbnMuaW5kZXhPZiggdi5jYWxsYmFjayApID09PSAtMSApXG4gICAgICAgIHRoaXMuY2FsbGJhY2tVZ2Vucy5wdXNoKCB2LmNhbGxiYWNrIClcbiAgICB9KVxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcyA9IHRoaXMuY2FsbGJhY2tVZ2Vucy5tYXAoIHYgPT4gdi51Z2VuTmFtZSApXG5cbiAgICBjYWxsYmFja0JvZHkucHVzaCggJ1xcblxcdHJldHVybiAnICsgbGFzdExpbmUuc3BsaXQoICc9JyApWzBdLnNwbGl0KCAnICcgKVsxXSApXG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCAnY2FsbGJhY2s6XFxuJywgY2FsbGJhY2tCb2R5LmpvaW4oJ1xcbicpIClcbiAgICB0aGlzLmNhbGxiYWNrTmFtZXMucHVzaCggJ21lbW9yeScgKVxuICAgIHRoaXMuY2FsbGJhY2tVZ2Vucy5wdXNoKCB0aGlzLm1lbW9yeS5oZWFwIClcbiAgICB0aGlzLmNhbGxiYWNrID0gRnVuY3Rpb24oIC4uLnRoaXMuY2FsbGJhY2tOYW1lcywgY2FsbGJhY2tCb2R5LmpvaW4oICdcXG4nICkgKVxuICAgIHRoaXMuY2FsbGJhY2sub3V0ID0gW11cblxuICAgIGlmKCB0aGlzLm9uY2FsbGJhY2sgKSB0aGlzLm9uY2FsbGJhY2soIHRoaXMuY2FsbGJhY2sgKVxuXG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sgXG4gIH0sXG5cbiAgcHJvY2Vzc0dyYXBoKCBvdXRwdXQgKSB7XG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLmxlbmd0aCA9IDBcbiAgICB0aGlzLmNhbGxiYWNrTmFtZXMubGVuZ3RoID0gMFxuXG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLnB1c2goIG91dHB1dC5jYWxsYmFjayApXG5cbiAgICBsZXQgYm9keSA9IHRoaXMucHJvY2Vzc1VnZW4oIG91dHB1dCApXG4gICAgXG5cbiAgICB0aGlzLmRpcnR5VWdlbnMubGVuZ3RoID0gMFxuICAgIHRoaXMuZ3JhcGhJc0RpcnR5ID0gZmFsc2VcblxuICAgIHJldHVybiBib2R5XG4gIH0sXG5cbiAgcHJvY2Vzc1VnZW4oIHVnZW4sIGJsb2NrICkge1xuICAgIGlmKCBibG9jayA9PT0gdW5kZWZpbmVkICkgYmxvY2sgPSBbXVxuXG4gICAgbGV0IGRpcnR5SWR4ID0gR2liYmVyaXNoLmRpcnR5VWdlbnMuaW5kZXhPZiggdWdlbiApXG5cbiAgICAvL2NvbnNvbGUubG9nKCAndWdlbk5hbWU6JywgdWdlbi51Z2VuTmFtZSApXG4gICAgbGV0IG1lbW8gPSBHaWJiZXJpc2gubWVtb2VkWyB1Z2VuLnVnZW5OYW1lIF1cblxuICAgIGlmKCBtZW1vICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0gZWxzZSBpZiAodWdlbiA9PT0gdHJ1ZSB8fCB1Z2VuID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgXCJXaHkgaXMgdWdlbiBhIGJvb2xlYW4/IFt0cnVlXSBvciBbZmFsc2VdXCI7XG4gICAgfSBlbHNlIGlmKCB1Z2VuLmJsb2NrID09PSB1bmRlZmluZWQgfHwgZGlydHlJbmRleCAhPT0gLTEgKSB7XG4gIFxuICAgICAgbGV0IGxpbmUgPSBgXFx0dmFyIHZfJHt1Z2VuLmlkfSA9IGAgXG4gICAgICBcbiAgICAgIGlmKCAhdWdlbi5iaW5vcCApIGxpbmUgKz0gYCR7dWdlbi51Z2VuTmFtZX0oIGBcblxuICAgICAgLy8gbXVzdCBnZXQgYXJyYXkgc28gd2UgY2FuIGtlZXAgdHJhY2sgb2YgbGVuZ3RoIGZvciBjb21tYSBpbnNlcnRpb25cbiAgICAgIGxldCBrZXlzLGVyclxuICAgICAgXG4gICAgICAvL3RyeSB7XG4gICAgICBrZXlzID0gdWdlbi5iaW5vcCB8fCB1Z2VuLnR5cGUgPT09ICdidXMnIHx8IHVnZW4udHlwZSA9PT0gJ2FuYWx5c2lzJyA/IE9iamVjdC5rZXlzKCB1Z2VuLmlucHV0cyApIDogT2JqZWN0LmtleXMoIHVnZW4uaW5wdXROYW1lcyApXG5cbiAgICAgIC8vfWNhdGNoKCBlICl7XG5cbiAgICAgIC8vICBjb25zb2xlLmxvZyggZSApXG4gICAgICAvLyAgZXJyID0gdHJ1ZVxuICAgICAgLy99XG4gICAgICBcbiAgICAgIC8vaWYoIGVyciA9PT0gdHJ1ZSApIHJldHVyblxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGxldCBrZXkgPSBrZXlzWyBpIF1cbiAgICAgICAgLy8gYmlub3AuaW5wdXRzIGlzIGFjdHVhbCB2YWx1ZXMsIG5vdCBqdXN0IHByb3BlcnR5IG5hbWVzXG4gICAgICAgIGxldCBpbnB1dCBcbiAgICAgICAgaWYoIHVnZW4uYmlub3AgfHwgdWdlbi50eXBlID09PSdidXMnICkge1xuICAgICAgICAgIGlucHV0ID0gdWdlbi5pbnB1dHNbIGtleSBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIC8vaWYoIGtleSA9PT0gJ21lbW9yeScgKSBjb250aW51ZTtcbiAgXG4gICAgICAgICAgaW5wdXQgPSB1Z2VuWyB1Z2VuLmlucHV0TmFtZXNbIGtleSBdIF1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCBpbnB1dCAhPT0gdW5kZWZpbmVkICkgeyBcbiAgICAgICAgICBpZiggdHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgICAgbGluZSArPSBpbnB1dFxuICAgICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIGlucHV0ID09PSAnYm9vbGVhbicgKSB7XG4gICAgICAgICAgICAgIGxpbmUgKz0gXCJcIitpbnB1dFxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ2tleTonLCBrZXksICdpbnB1dDonLCB1Z2VuLmlucHV0cywgdWdlbi5pbnB1dHNbIGtleSBdICkgXG5cbiAgICAgICAgICAgIEdpYmJlcmlzaC5wcm9jZXNzVWdlbiggaW5wdXQsIGJsb2NrIClcblxuICAgICAgICAgICAgLy9pZiggaW5wdXQuY2FsbGJhY2sgPT09IHVuZGVmaW5lZCApIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlmKCAhaW5wdXQuYmlub3AgKSB7XG4gICAgICAgICAgICAgIC8vIGNoZWNrIGlzIG5lZWRlZCBzbyB0aGF0IGdyYXBocyB3aXRoIHNzZHMgdGhhdCByZWZlciB0byB0aGVtc2VsdmVzXG4gICAgICAgICAgICAgIC8vIGRvbid0IGFkZCB0aGUgc3NkIGluIG1vcmUgdGhhbiBvbmNlXG4gICAgICAgICAgICAgIGlmKCBHaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5pbmRleE9mKCBpbnB1dC5jYWxsYmFjayApID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICBHaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5wdXNoKCBpbnB1dC5jYWxsYmFjayApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGluZSArPSBgdl8ke2lucHV0LmlkfWBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiggaSA8IGtleXMubGVuZ3RoIC0gMSApIHtcbiAgICAgICAgICAgIGxpbmUgKz0gdWdlbi5iaW5vcCA/ICcgJyArIHVnZW4ub3AgKyAnICcgOiAnLCAnIFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvL2lmKCB1Z2VuLnR5cGUgPT09ICdidXMnICkgbGluZSArPSAnLCAnIFxuICAgICAgaWYoICF1Z2VuLmJpbm9wICYmIHVnZW4udHlwZSAhPT0gJ2J1cycgJiYgdWdlbi50eXBlICE9PSAnc2VxJyApIGxpbmUgKz0gJ21lbW9yeSdcbiAgICAgIGxpbmUgKz0gdWdlbi5iaW5vcCA/ICcnIDogJyApJ1xuXG4gICAgICBibG9jay5wdXNoKCBsaW5lIClcbiAgICAgIFxuICAgICAgLy9jb25zb2xlLmxvZyggJ21lbW86JywgdWdlbi51Z2VuTmFtZSApXG4gICAgICBHaWJiZXJpc2gubWVtb2VkWyB1Z2VuLnVnZW5OYW1lIF0gPSBgdl8ke3VnZW4uaWR9YFxuXG4gICAgICBpZiggZGlydHlJZHggIT09IC0xICkge1xuICAgICAgICBHaWJiZXJpc2guZGlydHlVZ2Vucy5zcGxpY2UoIGRpcnR5SWR4LCAxIClcbiAgICAgIH1cblxuICAgIH1lbHNlIGlmKCB1Z2VuLmJsb2NrICkge1xuICAgICAgcmV0dXJuIHVnZW4uYmxvY2tcbiAgICB9XG5cbiAgICByZXR1cm4gYmxvY2tcbiAgfSxcbiAgICBcbn1cblxuR2liYmVyaXNoLnV0aWxpdGllcyA9IHJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSggR2liYmVyaXNoIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEdpYmJlcmlzaFxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQ29uZ2EgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgY29uZ2EgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQ29uZ2EuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IHRyaWdnZXIgPSBnLmJhbmcoKSxcbiAgICAgICAgaW1wdWxzZSA9IGcubXVsKCB0cmlnZ2VyLCA2MCApLFxuICAgICAgICBfZGVjYXkgPSAgZy5zdWIoIC4xMDEsIGcuZGl2KCBkZWNheSwgMTAgKSApLCAvLyBjcmVhdGUgcmFuZ2Ugb2YgLjAwMSAtIC4wOTlcbiAgICAgICAgYnBmID0gZy5zdmYoIGltcHVsc2UsIGZyZXF1ZW5jeSwgX2RlY2F5LCAyLCBmYWxzZSApLFxuICAgICAgICBvdXQgPSBnLm11bCggYnBmLCBnYWluIClcbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggY29uZ2EsIG91dCwgJ2NvbmdhJywgcHJvcHMgIClcbiAgICBcbiAgICBjb25nYS5lbnYgPSB0cmlnZ2VyXG5cbiAgICByZXR1cm4gY29uZ2FcbiAgfVxuICBcbiAgQ29uZ2EuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogLjI1LFxuICAgIGZyZXF1ZW5jeToxOTAsXG4gICAgZGVjYXk6IC44NVxuICB9XG5cbiAgcmV0dXJuIENvbmdhXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgQ293YmVsbCA9IGFyZ3VtZW50UHJvcHMgPT4ge1xuICAgIGNvbnN0IGNvd2JlbGwgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgICAgZGVjYXkgICA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgICBnYWluICAgID0gZy5pbiggJ2dhaW4nIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIENvd2JlbGwuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgY29uc3QgYnBmQ3V0b2ZmID0gZy5wYXJhbSggJ2JwZmMnLCAxMDAwICksXG4gICAgICAgICAgczEgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIDU2MCApLFxuICAgICAgICAgIHMyID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCA4NDUgKSxcbiAgICAgICAgICBlZyA9IGcuZGVjYXkoIGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSApLCBcbiAgICAgICAgICBicGYgPSBnLnN2ZiggZy5hZGQoIHMxLHMyICksIGJwZkN1dG9mZiwgMywgMiwgZmFsc2UgKSxcbiAgICAgICAgICBlbnZCcGYgPSBnLm11bCggYnBmLCBlZyApLFxuICAgICAgICAgIG91dCA9IGcubXVsKCBlbnZCcGYsIGdhaW4gKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGNvd2JlbGwsIG91dCwgJ2Nvd2JlbGwnLCBwcm9wcyAgKVxuICAgIFxuICAgIGNvd2JlbGwuZW52ID0gZWcgXG5cbiAgICBjb3diZWxsLmlzU3RlcmVvID0gZmFsc2VcblxuICAgIHJldHVybiBjb3diZWxsXG4gIH1cbiAgXG4gIENvd2JlbGwuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBkZWNheTouNVxuICB9XG5cbiAgcmV0dXJuIENvd2JlbGxcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgRk0gPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgc3luID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgICBsZXQgZW52ID0gZy5hZCggZy5pbignYXR0YWNrJyksIGcuaW4oJ2RlY2F5JyksIHsgc2hhcGU6J2xpbmVhcicgfSksXG4gICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICBzbGlkaW5nRnJlcSA9IGcuc2xpZGUoIGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlICksXG4gICAgICAgIGNtUmF0aW8gPSBnLmluKCAnY21SYXRpbycgKSxcbiAgICAgICAgaW5kZXggPSBnLmluKCAnaW5kZXgnIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHN5biwgRk0uZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuXG4gICAgc3luLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBtb2RPc2MgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggc3luLm1vZHVsYXRvcldhdmVmb3JtLCBnLm11bCggc2xpZGluZ0ZyZXEsIGNtUmF0aW8gKSwgc3luLmFudGlhbGlhcyApXG4gICAgICBsZXQgbW9kT3NjV2l0aEluZGV4ID0gZy5tdWwoIG1vZE9zYywgZy5tdWwoIHNsaWRpbmdGcmVxLCBpbmRleCApIClcbiAgICAgIGxldCBtb2RPc2NXaXRoRW52ICAgPSBnLm11bCggbW9kT3NjV2l0aEluZGV4LCBlbnYgKVxuXG4gICAgICBsZXQgY2Fycmllck9zYyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCBzeW4uY2FycmllcldhdmVmb3JtLCBnLmFkZCggc2xpZGluZ0ZyZXEsIG1vZE9zY1dpdGhFbnYgKSwgc3luLmFudGlhbGlhcyApXG4gICAgICBsZXQgY2Fycmllck9zY1dpdGhFbnYgPSBnLm11bCggY2Fycmllck9zYywgZW52IClcbiAgICAgIFxuICAgICAgbGV0IGN1dG9mZiA9IGcuYWRkKCBnLmluKCdjdXRvZmYnKSwgZy5tdWwoIGcuaW4oJ2ZpbHRlck11bHQnKSwgZW52ICkgKVxuICAgICAgY29uc3QgZmlsdGVyZWRPc2MgPSBHaWJiZXJpc2guZmlsdGVycy5mYWN0b3J5KCBjYXJyaWVyT3NjV2l0aEVudiwgY3V0b2ZmLCBnLmluKCdRJyksIGcuaW4oJ3NhdHVyYXRpb24nKSwgc3luIClcblxuICAgICAgbGV0IHN5bnRoV2l0aEdhaW4gPSBnLm11bCggZmlsdGVyZWRPc2MsIGcuaW4oICdnYWluJyApICksXG4gICAgICAgICAgcGFubmVyXG5cbiAgICAgIGlmKCBwcm9wcy5wYW5Wb2ljZXMgPT09IHRydWUgKSB7IFxuICAgICAgICBwYW5uZXIgPSBnLnBhbiggc3ludGhXaXRoR2Fpbiwgc3ludGhXaXRoR2FpbiwgZy5pbiggJ3BhbicgKSApIFxuICAgICAgICBzeW4uZ3JhcGggPSBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodCBdXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3luLmdyYXBoID0gc3ludGhXaXRoR2FpblxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzeW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICdjYXJyaWVyV2F2ZWZvcm0nLCAnbW9kdWxhdG9yV2F2ZWZvcm0nLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnZmlsdGVyTW9kZScgXVxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoKClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzeW4sIHN5bi5ncmFwaCAsICdmbScsIHN5biApXG5cbiAgICBzeW4uZW52ID0gZW52XG5cbiAgICByZXR1cm4gc3luXG4gIH1cblxuICBGTS5kZWZhdWx0cyA9IHtcbiAgICBjYXJyaWVyV2F2ZWZvcm06J3NpbmUnLFxuICAgIG1vZHVsYXRvcldhdmVmb3JtOidzaW5lJyxcbiAgICBhdHRhY2s6IDQ0MTAwLFxuICAgIGRlY2F5OiA0NDEwMCxcbiAgICBnYWluOiAxLFxuICAgIGNtUmF0aW86MixcbiAgICBpbmRleDo1LFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBhbnRpYWxpYXM6ZmFsc2UsXG4gICAgcGFuVm9pY2VzOmZhbHNlLFxuICAgIGdsaWRlOjEsXG4gICAgc2F0dXJhdGlvbjoxLFxuICAgIGZpbHRlck11bHQ6NDQwLFxuICAgIFE6LjI1LFxuICAgIGN1dG9mZjozNTIwLFxuICAgIGZpbHRlclR5cGU6MCxcbiAgICBmaWx0ZXJNb2RlOjAsXG4gICAgaXNMb3dQYXNzOjFcbiAgfVxuXG4gIGxldCBQb2x5Rk0gPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBGTSwgWydnbGlkZScsJ2ZyZXF1ZW5jeScsJ2F0dGFjaycsJ2RlY2F5JywncHVsc2V3aWR0aCcsJ3BhbicsJ2dhaW4nLCdjbVJhdGlvJywnaW5kZXgnLCAnc2F0dXJhdGlvbicsICdmaWx0ZXJNdWx0JywgJ1EnLCAnY3V0b2ZmJywgJ2FudGlhbGlhcycsICdmaWx0ZXJUeXBlJywgJ2NhcnJpZXJXYXZlZm9ybScsICdtb2R1bGF0b3JXYXZlZm9ybScsJ2ZpbHRlck1vZGUnIF0gKSBcblxuICByZXR1cm4gWyBGTSwgUG9seUZNIF1cblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgSGF0ID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IGhhdCA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgdHVuZSAgPSBnLmluKCAndHVuZScgKSxcbiAgICAgICAgc2NhbGVkVHVuZSA9IGcubWVtbyggZy5hZGQoIC40LCB0dW5lICkgKSxcbiAgICAgICAgZGVjYXkgID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgSGF0LmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCBiYXNlRnJlcSA9IGcubXVsKCAzMjUsIHNjYWxlZFR1bmUgKSwgLy8gcmFuZ2Ugb2YgMTYyLjUgLSA0ODcuNVxuICAgICAgICBicGZDdXRvZmYgPSBnLm11bCggZy5wYXJhbSggJ2JwZmMnLCA3MDAwICksIHNjYWxlZFR1bmUgKSxcbiAgICAgICAgaHBmQ3V0b2ZmID0gZy5tdWwoIGcucGFyYW0oICdocGZjJywgMTEwMDAgKSwgc2NhbGVkVHVuZSApLCAgXG4gICAgICAgIHMxID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBiYXNlRnJlcSwgZmFsc2UgKSxcbiAgICAgICAgczIgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwxLjQ0NzEgKSApLFxuICAgICAgICBzMyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDEuNjE3MCApICksXG4gICAgICAgIHM0ID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBnLm11bCggYmFzZUZyZXEsMS45MjY1ICkgKSxcbiAgICAgICAgczUgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwyLjUwMjggKSApLFxuICAgICAgICBzNiA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDIuNjYzNyApICksXG4gICAgICAgIHN1bSA9IGcuYWRkKCBzMSxzMixzMyxzNCxzNSxzNiApLFxuICAgICAgICBlZyA9IGcuZGVjYXkoIGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSApLCBcbiAgICAgICAgYnBmID0gZy5zdmYoIHN1bSwgYnBmQ3V0b2ZmLCAuNSwgMiwgZmFsc2UgKSxcbiAgICAgICAgZW52QnBmID0gZy5tdWwoIGJwZiwgZWcgKSxcbiAgICAgICAgaHBmID0gZy5maWx0ZXIyNCggZW52QnBmLCAwLCBocGZDdXRvZmYsIDAgKSxcbiAgICAgICAgb3V0ID0gZy5tdWwoIGhwZiwgZ2FpbiApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggaGF0LCBvdXQsICdoYXQnLCBwcm9wcyAgKVxuICAgIFxuICAgIGhhdC5lbnYgPSBlZyBcblxuICAgIGhhdC5pc1N0ZXJlbyA9IGZhbHNlXG4gICAgcmV0dXJuIGhhdFxuICB9XG4gIFxuICBIYXQuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogIDEsXG4gICAgdHVuZTogLjYsXG4gICAgZGVjYXk6LjEsXG4gIH1cblxuICByZXR1cm4gSGF0XG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubGV0IGluc3RydW1lbnQgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuT2JqZWN0LmFzc2lnbiggaW5zdHJ1bWVudCwge1xuICBub3RlKCBmcmVxICkge1xuICAgIHRoaXMuZnJlcXVlbmN5ID0gZnJlcVxuICAgIHRoaXMuZW52LnRyaWdnZXIoKVxuICB9LFxuXG4gIHRyaWdnZXIoIF9nYWluID0gMSApIHtcbiAgICB0aGlzLmdhaW4gPSBfZ2FpblxuICAgIHRoaXMuZW52LnRyaWdnZXIoKVxuICB9LFxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc3RydW1lbnRcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuY29uc3QgaW5zdHJ1bWVudHMgPSB7XG4gIEtpY2sgICAgICAgIDogcmVxdWlyZSggJy4va2ljay5qcycgKSggR2liYmVyaXNoICksXG4gIENvbmdhICAgICAgIDogcmVxdWlyZSggJy4vY29uZ2EuanMnICkoIEdpYmJlcmlzaCApLFxuICBDbGF2ZSAgICAgICA6IHJlcXVpcmUoICcuL2NvbmdhLmpzJyApKCBHaWJiZXJpc2ggKSwgLy8gY2xhdmUgaXMgc2FtZSBhcyBjb25nYSB3aXRoIGRpZmZlcmVudCBkZWZhdWx0cywgc2VlIGJlbG93XG4gIEhhdCAgICAgICAgIDogcmVxdWlyZSggJy4vaGF0LmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgU25hcmUgICAgICAgOiByZXF1aXJlKCAnLi9zbmFyZS5qcycgKSggR2liYmVyaXNoICksXG4gIENvd2JlbGwgICAgIDogcmVxdWlyZSggJy4vY293YmVsbC5qcycgKSggR2liYmVyaXNoIClcbn1cblxuaW5zdHJ1bWVudHMuQ2xhdmUuZGVmYXVsdHMuZnJlcXVlbmN5ID0gMjUwMFxuaW5zdHJ1bWVudHMuQ2xhdmUuZGVmYXVsdHMuZGVjYXkgPSAuNTtcblxuWyBpbnN0cnVtZW50cy5TeW50aCwgaW5zdHJ1bWVudHMuUG9seVN5bnRoIF0gICAgID0gcmVxdWlyZSggJy4vc3ludGguanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5Nb25vc3ludGgsIGluc3RydW1lbnRzLlBvbHlNb25vIF0gID0gcmVxdWlyZSggJy4vbW9ub3N5bnRoLmpzJyApKCBHaWJiZXJpc2ggKTtcblsgaW5zdHJ1bWVudHMuRk0sIGluc3RydW1lbnRzLlBvbHlGTSBdICAgICAgICAgICA9IHJlcXVpcmUoICcuL2ZtLmpzJyApKCBHaWJiZXJpc2ggKTtcblsgaW5zdHJ1bWVudHMuU2FtcGxlciwgaW5zdHJ1bWVudHMuUG9seVNhbXBsZXIgXSA9IHJlcXVpcmUoICcuL3NhbXBsZXIuanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5LYXJwbHVzLCBpbnN0cnVtZW50cy5Qb2x5S2FycGx1cyBdID0gcmVxdWlyZSggJy4va2FycGx1c3N0cm9uZy5qcycgKSggR2liYmVyaXNoICk7XG5cbmluc3RydW1lbnRzLmV4cG9ydCA9IHRhcmdldCA9PiB7XG4gIGZvciggbGV0IGtleSBpbiBpbnN0cnVtZW50cyApIHtcbiAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgIHRhcmdldFsga2V5IF0gPSBpbnN0cnVtZW50c1sga2V5IF1cbiAgICB9XG4gIH1cbn1cblxucmV0dXJuIGluc3RydW1lbnRzXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEtQUyA9IGlucHV0UHJvcHMgPT4ge1xuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgS1BTLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBjb25zdCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgICAgdHJpZ2dlciA9IGcuYmFuZygpLFxuICAgICAgICAgIHBoYXNlID0gZy5hY2N1bSggMSwgdHJpZ2dlciwgeyBtYXg6SW5maW5pdHkgfSApLFxuICAgICAgICAgIGVudiA9IGcuZ3RwKCBnLnN1YiggMSwgZy5kaXYoIHBoYXNlLCAyMDAgKSApLCAwICksXG4gICAgICAgICAgaW1wdWxzZSA9IGcubXVsKCBnLm5vaXNlKCksIGVudiApLFxuICAgICAgICAgIGZlZWRiYWNrID0gZy5oaXN0b3J5KCksXG4gICAgICAgICAgZnJlcXVlbmN5ID0gZy5pbignZnJlcXVlbmN5JyksXG4gICAgICAgICAgZ2xpZGUgPSBnLmluKCAnZ2xpZGUnICksXG4gICAgICAgICAgc2xpZGluZ0ZyZXF1ZW5jeSA9IGcuc2xpZGUoIGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlICksXG4gICAgICAgICAgZGVsYXkgPSBnLmRlbGF5KCBnLmFkZCggaW1wdWxzZSwgZmVlZGJhY2sub3V0ICksIGcuZGl2KCBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGUsIHNsaWRpbmdGcmVxdWVuY3kgKSwgeyBzaXplOjIwNDggfSksXG4gICAgICAgICAgZGVjYXllZCA9IGcubXVsKCBkZWxheSwgZy50NjAoIGcubXVsKCBnLmluKCdkZWNheScpLCBzbGlkaW5nRnJlcXVlbmN5ICkgKSApLFxuICAgICAgICAgIGRhbXBlZCA9ICBnLm1peCggZGVjYXllZCwgZmVlZGJhY2sub3V0LCBnLmluKCdkYW1waW5nJykgKSxcbiAgICAgICAgICB3aXRoR2FpbiA9IGcubXVsKCBkYW1wZWQsIGcuaW4oJ2dhaW4nKSApXG5cbiAgICBmZWVkYmFjay5pbiggZGFtcGVkIClcblxuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgS1BTLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBpZiggcHJvcGVydGllcy5wYW5Wb2ljZXMgKSB7ICBcbiAgICAgIGNvbnN0IHBhbm5lciA9IGcucGFuKCB3aXRoR2Fpbiwgd2l0aEdhaW4sIGcuaW4oICdwYW4nICkgKVxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCAna2FycGx1cycsIHByb3BzICApXG4gICAgfWVsc2V7XG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCB3aXRoR2FpbiwgJ2thcnBsdXMnLCBwcm9wcyApXG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbiggc3luLCB7XG4gICAgICBwcm9wZXJ0aWVzIDogcHJvcHMsXG5cbiAgICAgIGVudiA6IHRyaWdnZXIsXG4gICAgICBwaGFzZSxcblxuICAgICAgZ2V0UGhhc2UoKSB7XG4gICAgICAgIHJldHVybiBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHBoYXNlLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfSxcbiAgICB9KVxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcbiAgS1BTLmRlZmF1bHRzID0ge1xuICAgIGRlY2F5OiAuOTcsXG4gICAgZGFtcGluZzouMixcbiAgICBnYWluOiAxLFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBnbGlkZToxLFxuICAgIHBhblZvaWNlczpmYWxzZVxuICB9XG5cbiAgbGV0IGVudkNoZWNrRmFjdG9yeSA9ICggc3luLHN5bnRoICkgPT4ge1xuICAgIGxldCBlbnZDaGVjayA9ICgpPT4ge1xuICAgICAgbGV0IHBoYXNlID0gc3luLmdldFBoYXNlKCksXG4gICAgICAgICAgZW5kVGltZSA9IHN5bnRoLmRlY2F5ICogR2liYmVyaXNoLmN0eC5zYW1wbGVSYXRlXG5cbiAgICAgIGlmKCBwaGFzZSA+IGVuZFRpbWUgKSB7XG4gICAgICAgIHN5bnRoLmRpc2Nvbm5lY3RVZ2VuKCBzeW4gKVxuICAgICAgICBzeW4uaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgICBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHN5bi5waGFzZS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwIC8vIHRyaWdnZXIgZG9lc24ndCBzZWVtIHRvIHJlc2V0IGZvciBzb21lIHJlYXNvblxuICAgICAgfWVsc2V7XG4gICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbnZDaGVja1xuICB9XG5cbiAgbGV0IFBvbHlLUFMgPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBLUFMsIFsnZnJlcXVlbmN5JywnZGVjYXknLCdkYW1waW5nJywncGFuJywnZ2FpbicsICdnbGlkZSddLCBlbnZDaGVja0ZhY3RvcnkgKSBcblxuICByZXR1cm4gWyBLUFMsIFBvbHlLUFMgXVxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBLaWNrID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgLy8gZXN0YWJsaXNoIHByb3RvdHlwZSBjaGFpblxuICAgIGxldCBraWNrID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgICAvLyBkZWZpbmUgaW5wdXRzXG4gICAgbGV0IGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICB0b25lICA9IGcuaW4oICd0b25lJyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG4gICAgXG4gICAgLy8gY3JlYXRlIGluaXRpYWwgcHJvcGVydHkgc2V0XG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIEtpY2suZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuXG4gICAgLy8gY3JlYXRlIERTUCBncmFwaFxuICAgIGxldCB0cmlnZ2VyID0gZy5iYW5nKCksXG4gICAgICAgIGltcHVsc2UgPSBnLm11bCggdHJpZ2dlciwgNjAgKSxcbiAgICAgICAgc2NhbGVkRGVjYXkgPSBnLnN1YiggMS4wMDUsIGRlY2F5ICksIC8vIC0+IHJhbmdlIHsgLjAwNSwgMS4wMDUgfVxuICAgICAgICBzY2FsZWRUb25lID0gZy5hZGQoIDUwLCBnLm11bCggdG9uZSwgNDAwMCApICksIC8vIC0+IHJhbmdlIHsgNTAsIDQwNTAgfVxuICAgICAgICBicGYgPSBnLnN2ZiggaW1wdWxzZSwgZnJlcXVlbmN5LCBzY2FsZWREZWNheSwgMiwgZmFsc2UgKSxcbiAgICAgICAgbHBmID0gZy5zdmYoIGJwZiwgc2NhbGVkVG9uZSwgLjUsIDAsIGZhbHNlICksXG4gICAgICAgIGdyYXBoID0gZy5tdWwoIGxwZiwgZ2FpbiApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGtpY2ssIGdyYXBoLCAna2ljaycsIHByb3BzICApXG5cbiAgICBraWNrLmVudiA9IHRyaWdnZXJcblxuICAgIHJldHVybiBraWNrXG4gIH1cbiAgXG4gIEtpY2suZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6ODUsXG4gICAgdG9uZTogLjI1LFxuICAgIGRlY2F5Oi45XG4gIH1cblxuICByZXR1cm4gS2lja1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApLFxuICAgICAgZmVlZGJhY2tPc2MgPSByZXF1aXJlKCAnLi4vb3NjaWxsYXRvcnMvZm1mZWVkYmFja29zYy5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgU3ludGggPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBjb25zdCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgICAgb3NjcyA9IFtdLCBcbiAgICAgICAgICBlbnYgPSBnLmFkKCBnLmluKCAnYXR0YWNrJyApLCBnLmluKCAnZGVjYXknICksIHsgc2hhcGU6J2xpbmVhcicgfSksXG4gICAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgICBnbGlkZSA9IGcuaW4oICdnbGlkZScgKSxcbiAgICAgICAgICBzbGlkaW5nRnJlcSA9IGcubWVtbyggZy5zbGlkZSggZnJlcXVlbmN5LCBnbGlkZSwgZ2xpZGUgKSApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCBzeW4sIFN5bnRoLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IDM7IGkrKyApIHtcbiAgICAgICAgbGV0IG9zYywgZnJlcVxuXG4gICAgICAgIHN3aXRjaCggaSApIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBmcmVxID0gZy5hZGQoIHNsaWRpbmdGcmVxLCBnLm11bCggc2xpZGluZ0ZyZXEsIGcuaW4oJ2RldHVuZTInKSApIClcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGZyZXEgPSBnLmFkZCggc2xpZGluZ0ZyZXEsIGcubXVsKCBzbGlkaW5nRnJlcSwgZy5pbignZGV0dW5lMycpICkgKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGZyZXEgPSBzbGlkaW5nRnJlcS8vZnJlcXVlbmN5XG4gICAgICAgIH1cblxuICAgICAgICBvc2MgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggc3luLndhdmVmb3JtLCBmcmVxLCBzeW4uYW50aWFsaWFzIClcbiAgICAgICAgXG4gICAgICAgIG9zY3NbIGkgXSA9IG9zY1xuICAgICAgfVxuXG4gICAgICBsZXQgb3NjU3VtID0gZy5hZGQoIC4uLm9zY3MgKSxcbiAgICAgICAgICBvc2NXaXRoR2FpbiA9IGcubXVsKCBnLm11bCggb3NjU3VtLCBlbnYgKSwgZy5pbiggJ2dhaW4nICkgKSxcbiAgICAgICAgICAvL2N1dG9mZiA9IGcuYWRkKCBnLmluKCdjdXRvZmYnKSwgZy5tdWwoIGcuaW4oJ2ZpbHRlck11bHQnKSwgZW52ICkgKSxcbiAgICAgICAgICBmaWx0ZXJlZE9zYywgcGFubmVyXG5cbiAgICAgIGNvbnN0IGJhc2VDdXRvZmZGcmVxID0gZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBmcmVxdWVuY3kgKVxuICAgICAgbGV0IGN1dG9mZiA9IGcubXVsKCBnLm11bCggYmFzZUN1dG9mZkZyZXEsIGcucG93KCAyLCBnLmluKCdmaWx0ZXJNdWx0JykgKSksIGVudiApXG4gICAgICBmaWx0ZXJlZE9zYyA9IEdpYmJlcmlzaC5maWx0ZXJzLmZhY3RvcnkoIG9zY1dpdGhHYWluLCBjdXRvZmYsIGcuaW4oJ1EnKSwgZy5pbignc2F0dXJhdGlvbicpLCBzeW4gKVxuICAgICAgICBcbiAgICAgIGlmKCBwcm9wcy5wYW5Wb2ljZXMgKSB7ICBcbiAgICAgICAgcGFubmVyID0gZy5wYW4oIGZpbHRlcmVkT3NjLGZpbHRlcmVkT3NjLCBnLmluKCAncGFuJyApIClcbiAgICAgICAgc3luLmdyYXBoID0gWyBwYW5uZXIubGVmdCwgcGFubmVyLnJpZ2h0IF1cbiAgICAgIH1lbHNle1xuICAgICAgICBzeW4uZ3JhcGggPSBmaWx0ZXJlZE9zY1xuICAgICAgfVxuICAgIH1cblxuICAgIHN5bi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ3dhdmVmb3JtJywgJ2FudGlhbGlhcycsICdmaWx0ZXJUeXBlJywgJ2ZpbHRlck1vZGUnIF1cbiAgICBzeW4uX19jcmVhdGVHcmFwaCgpXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCBzeW4uZ3JhcGgsICdtb25vJywgcHJvcHMgKVxuXG4gICAgc3luLmVudiA9IGVudlxuXG4gICAgcmV0dXJuIHN5blxuICB9XG4gIFxuICBTeW50aC5kZWZhdWx0cyA9IHtcbiAgICB3YXZlZm9ybTogJ3NhdycsXG4gICAgYXR0YWNrOiA0NDEwMCxcbiAgICBkZWNheTogNDQxMDAsXG4gICAgZ2FpbjogLjI1LFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBkZXR1bmUyOi4wMDUsXG4gICAgZGV0dW5lMzotLjAwNSxcbiAgICBjdXRvZmY6IDEsXG4gICAgcmVzb25hbmNlOi4yNSxcbiAgICBROiAuNSxcbiAgICBwYW5Wb2ljZXM6ZmFsc2UsXG4gICAgZ2xpZGU6IDEsXG4gICAgYW50aWFsaWFzOmZhbHNlLFxuICAgIGZpbHRlclR5cGU6IDIsXG4gICAgZmlsdGVyTW9kZTogMCwgLy8gMCA9IExQLCAxID0gSFAsIDIgPSBCUCwgMyA9IE5vdGNoXG4gICAgc2F0dXJhdGlvbjouNSxcbiAgICBmaWx0ZXJNdWx0OiA0LFxuICAgIGlzTG93UGFzczp0cnVlXG4gIH1cblxuICBsZXQgUG9seU1vbm8gPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBTeW50aCwgXG4gICAgWydmcmVxdWVuY3knLCdhdHRhY2snLCdkZWNheScsJ2N1dG9mZicsJ1EnLFxuICAgICAnZGV0dW5lMicsJ2RldHVuZTMnLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbicsICdnbGlkZScsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnLCAgJ2FudGlhbGlhcycsICdmaWx0ZXJUeXBlJywgJ3dhdmVmb3JtJywgJ2ZpbHRlck1vZGUnXVxuICApIFxuXG4gIHJldHVybiBbIFN5bnRoLCBQb2x5TW9ubyBdXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbm90ZSggZnJlcSApIHtcbiAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgT2JqZWN0LmFzc2lnbiggdm9pY2UsIHRoaXMucHJvcGVydGllcyApXG4gICAgdm9pY2Uubm90ZSggZnJlcSApXG4gICAgdGhpcy5fX3J1blZvaWNlX18oIHZvaWNlLCB0aGlzIClcbiAgICB0aGlzLnRyaWdnZXJOb3RlID0gZnJlcVxuICB9LFxuXG4gIC8vIFhYWCB0aGlzIGlzIG5vdCBwYXJ0aWN1bGFybHkgc2F0aXNmeWluZy4uLlxuICAvLyBtdXN0IGNoZWNrIGZvciBib3RoIG5vdGVzIGFuZCBjaG9yZHNcbiAgdHJpZ2dlciggZ2FpbiApIHtcbiAgICBpZiggdGhpcy50cmlnZ2VyQ2hvcmQgIT09IG51bGwgKSB7XG4gICAgICB0aGlzLnRyaWdnZXJDaG9yZC5mb3JFYWNoKCB2ID0+IHtcbiAgICAgICAgbGV0IHZvaWNlID0gdGhpcy5fX2dldFZvaWNlX18oKVxuICAgICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgdGhpcy5wcm9wZXJ0aWVzIClcbiAgICAgICAgdm9pY2Uubm90ZSggdiApXG4gICAgICAgIHZvaWNlLmdhaW4gPSBnYWluXG4gICAgICAgIHRoaXMuX19ydW5Wb2ljZV9fKCB2b2ljZSwgdGhpcyApXG4gICAgICB9KVxuICAgIH1lbHNlIGlmKCB0aGlzLnRyaWdnZXJOb3RlICE9PSBudWxsICkge1xuICAgICAgbGV0IHZvaWNlID0gdGhpcy5fX2dldFZvaWNlX18oKVxuICAgICAgT2JqZWN0LmFzc2lnbiggdm9pY2UsIHRoaXMucHJvcGVydGllcyApXG4gICAgICB2b2ljZS5ub3RlKCB0aGlzLnRyaWdnZXJOb3RlIClcbiAgICAgIHZvaWNlLmdhaW4gPSBnYWluXG4gICAgICB0aGlzLl9fcnVuVm9pY2VfXyggdm9pY2UsIHRoaXMgKVxuICAgIH1lbHNle1xuICAgICAgbGV0IHZvaWNlID0gdGhpcy5fX2dldFZvaWNlX18oKVxuICAgICAgT2JqZWN0LmFzc2lnbiggdm9pY2UsIHRoaXMucHJvcGVydGllcyApXG4gICAgICB2b2ljZS50cmlnZ2VyKCBnYWluIClcbiAgICAgIHRoaXMuX19ydW5Wb2ljZV9fKCB2b2ljZSwgdGhpcyApXG4gICAgfVxuICB9LFxuXG4gIF9fcnVuVm9pY2VfXyggdm9pY2UsIF9wb2x5ICkge1xuICAgIGlmKCAhdm9pY2UuaXNDb25uZWN0ZWQgKSB7XG4gICAgICB2b2ljZS5jb25uZWN0KCBfcG9seSwgMSApXG4gICAgICB2b2ljZS5pc0Nvbm5lY3RlZCA9IHRydWVcbiAgICB9XG5cbiAgICBsZXQgZW52Q2hlY2tcbiAgICBpZiggX3BvbHkuZW52Q2hlY2sgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGVudkNoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKCB2b2ljZS5lbnYuaXNDb21wbGV0ZSgpICkge1xuICAgICAgICAgIF9wb2x5LmRpc2Nvbm5lY3RVZ2VuLmNhbGwoIF9wb2x5LCB2b2ljZSApXG4gICAgICAgICAgdm9pY2UuaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MucHVzaCggZW52Q2hlY2sgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBlbnZDaGVjayA9IHBvbHkuZW52Q2hlY2soIHZvaWNlLCBwb2x5IClcbiAgICB9XG5cbiAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MucHVzaCggZW52Q2hlY2sgKVxuICB9LFxuXG4gIF9fZ2V0Vm9pY2VfXygpIHtcbiAgICByZXR1cm4gdGhpcy52b2ljZXNbIHRoaXMudm9pY2VDb3VudCsrICUgdGhpcy52b2ljZXMubGVuZ3RoIF1cbiAgfSxcblxuICBjaG9yZCggZnJlcXVlbmNpZXMgKSB7XG4gICAgZnJlcXVlbmNpZXMuZm9yRWFjaCggdiA9PiB0aGlzLm5vdGUoIHYgKSApXG4gICAgdGhpcy50cmlnZ2VyQ2hvcmQgPSBmcmVxdWVuY2llc1xuICB9LFxuXG4gIGZyZWUoKSB7XG4gICAgZm9yKCBsZXQgY2hpbGQgb2YgdGhpcy52b2ljZXMgKSBjaGlsZC5mcmVlKClcbiAgfVxufVxuIiwiLypcbiAqIFRoaXMgZmlsZXMgY3JlYXRlcyBhIGZhY3RvcnkgZ2VuZXJhdGluZyBwb2x5c3ludGggY29uc3RydWN0b3JzLlxuICovXG5cbmNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBUZW1wbGF0ZUZhY3RvcnkgPSAoIHVnZW4sIHByb3BlcnR5TGlzdCwgX2VudkNoZWNrICkgPT4ge1xuICAgIC8qIFxuICAgICAqIHBvbHlzeW50aHMgYXJlIGJhc2ljYWxseSBidXNzZXMgdGhhdCBjb25uZWN0IGNoaWxkIHN5bnRoIHZvaWNlcy5cbiAgICAgKiBXZSBjcmVhdGUgc2VwYXJhdGUgcHJvdG90eXBlcyBmb3IgbW9ubyB2cyBzdGVyZW8gaW5zdGFuY2VzLlxuICAgICAqL1xuXG4gICAgY29uc3QgbW9ub1Byb3RvICAgPSBPYmplY3QuY3JlYXRlKCBHaWJiZXJpc2guQnVzKCkgKSxcbiAgICAgICAgICBzdGVyZW9Qcm90byA9IE9iamVjdC5jcmVhdGUoIEdpYmJlcmlzaC5CdXMyKCkpXG5cbiAgICAvLyBzaW5jZSB0aGVyZSBhcmUgdHdvIHByb3RvdHlwZXMgd2UgY2FuJ3QgYXNzaWduIGRpcmVjdGx5IHRvIG9uZSBvZiB0aGVtLi4uXG4gICAgT2JqZWN0LmFzc2lnbiggbW9ub1Byb3RvLCAgIEdpYmJlcmlzaC5taXhpbnMucG9seWluc3RydW1lbnQgKVxuICAgIE9iamVjdC5hc3NpZ24oIHN0ZXJlb1Byb3RvLCBHaWJiZXJpc2gubWl4aW5zLnBvbHlpbnN0cnVtZW50IClcblxuICAgIGNvbnN0IFRlbXBsYXRlID0gcHJvcHMgPT4ge1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oIHt9LCB7IGlzU3RlcmVvOnRydWUgfSwgcHJvcHMgKVxuXG4gICAgICBjb25zdCBzeW50aCA9IHByb3BlcnRpZXMuaXNTdGVyZW8gPyBPYmplY3QuY3JlYXRlKCBzdGVyZW9Qcm90byApIDogT2JqZWN0LmNyZWF0ZSggbW9ub1Byb3RvIClcblxuICAgICAgT2JqZWN0LmFzc2lnbiggc3ludGgsIHtcbiAgICAgICAgdm9pY2VzOiBbXSxcbiAgICAgICAgbWF4Vm9pY2VzOiBwcm9wZXJ0aWVzLm1heFZvaWNlcyAhPT0gdW5kZWZpbmVkID8gcHJvcGVydGllcy5tYXhWb2ljZXMgOiAxNixcbiAgICAgICAgdm9pY2VDb3VudDogMCxcbiAgICAgICAgZW52Q2hlY2s6IF9lbnZDaGVjayxcbiAgICAgICAgaWQ6IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpLFxuICAgICAgICBkaXJ0eTogdHJ1ZSxcbiAgICAgICAgdHlwZTogJ2J1cycsXG4gICAgICAgIHVnZW5OYW1lOiAncG9seScgKyB1Z2VuLm5hbWUgKyAnXycgKyBzeW50aC5pZCxcbiAgICAgICAgaW5wdXRzOiBbXSxcbiAgICAgICAgaW5wdXROYW1lczogW10sXG4gICAgICAgIHByb3BlcnRpZXNcbiAgICAgIH0pXG5cbiAgICAgIHByb3BlcnRpZXMucGFuVm9pY2VzID0gcHJvcGVydGllcy5pc1N0ZXJlb1xuICAgICAgc3ludGguY2FsbGJhY2sudWdlbk5hbWUgPSBzeW50aC51Z2VuTmFtZVxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHN5bnRoLm1heFZvaWNlczsgaSsrICkge1xuICAgICAgICBzeW50aC52b2ljZXNbaV0gPSB1Z2VuKCBwcm9wZXJ0aWVzIClcbiAgICAgICAgc3ludGgudm9pY2VzW2ldLmNhbGxiYWNrLnVnZW5OYW1lID0gc3ludGgudm9pY2VzW2ldLnVnZW5OYW1lXG4gICAgICAgIHN5bnRoLnZvaWNlc1tpXS5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGxldCBfcHJvcGVydHlMaXN0IFxuICAgICAgaWYoIHByb3BlcnRpZXMuaXNTdGVyZW8gPT09IGZhbHNlICkge1xuICAgICAgICBfcHJvcGVydHlMaXN0ID0gcHJvcGVydHlMaXN0LnNsaWNlKCAwIClcbiAgICAgICAgY29uc3QgaWR4ID0gIF9wcm9wZXJ0eUxpc3QuaW5kZXhPZiggJ3BhbicgKVxuICAgICAgICBpZiggaWR4ICA+IC0xICkgX3Byb3BlcnR5TGlzdC5zcGxpY2UoIGlkeCwgMSApXG4gICAgICB9XG5cbiAgICAgIFRlbXBsYXRlRmFjdG9yeS5zZXR1cFByb3BlcnRpZXMoIHN5bnRoLCB1Z2VuLCBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gcHJvcGVydHlMaXN0IDogX3Byb3BlcnR5TGlzdCApXG5cbiAgICAgIHJldHVybiBzeW50aFxuICAgIH1cblxuICAgIHJldHVybiBUZW1wbGF0ZVxuICB9XG5cbiAgVGVtcGxhdGVGYWN0b3J5LnNldHVwUHJvcGVydGllcyA9IGZ1bmN0aW9uKCBzeW50aCwgdWdlbiwgcHJvcHMgKSB7XG4gICAgZm9yKCBsZXQgcHJvcGVydHkgb2YgcHJvcHMgKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHN5bnRoLCBwcm9wZXJ0eSwge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHN5bnRoLnByb3BlcnRpZXNbIHByb3BlcnR5IF0gfHwgdWdlbi5kZWZhdWx0c1sgcHJvcGVydHkgXVxuICAgICAgICB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgc3ludGgucHJvcGVydGllc1sgcHJvcGVydHkgXSA9IHZcbiAgICAgICAgICBmb3IoIGxldCBjaGlsZCBvZiBzeW50aC5pbnB1dHMgKSB7XG4gICAgICAgICAgICBjaGlsZFsgcHJvcGVydHkgXSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFRlbXBsYXRlRmFjdG9yeVxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgcHJvdG8gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50IClcblxuICBPYmplY3QuYXNzaWduKCBwcm90bywge1xuICAgIG5vdGUoIHJhdGUgKSB7XG4gICAgICB0aGlzLnJhdGUgPSByYXRlXG4gICAgICBpZiggcmF0ZSA+IDAgKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlcigpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fX3BoYXNlX18udmFsdWUgPSB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEgXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIGxldCBTYW1wbGVyID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgbGV0IHN5biA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHsgb25sb2FkOm51bGwgfSwgU2FtcGxlci5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICBzeW4uaXNTdGVyZW8gPSBwcm9wcy5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaXNTdGVyZW8gOiBmYWxzZVxuXG4gICAgbGV0IHN0YXJ0ID0gZy5pbiggJ3N0YXJ0JyApLCBlbmQgPSBnLmluKCAnZW5kJyApLCBcbiAgICAgICAgcmF0ZSA9IGcuaW4oICdyYXRlJyApLCBzaG91bGRMb29wID0gZy5pbiggJ2xvb3BzJyApXG4gICAgLyogY3JlYXRlIGR1bW15IHVnZW4gdW50aWwgZGF0YSBmb3Igc2FtcGxlciBpcyBsb2FkZWQuLi5cbiAgICAgKiB0aGlzIHdpbGwgYmUgb3ZlcnJpZGRlbiBieSBhIGNhbGwgdG8gR2liYmVyaXNoLmZhY3Rvcnkgb24gbG9hZCAqL1xuICAgIHN5bi5jYWxsYmFjayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9XG4gICAgc3luLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICBzeW4udWdlbk5hbWUgPSBzeW4uY2FsbGJhY2sudWdlbk5hbWUgPSAnc2FtcGxlcl8nICsgc3luLmlkXG4gICAgc3luLmlucHV0TmFtZXMgPSBbXVxuICAgIC8qIGVuZCBkdW1teSB1Z2VuICovXG5cbiAgICBzeW4uX19iYW5nX18gPSBnLmJhbmcoKVxuICAgIHN5bi50cmlnZ2VyID0gc3luLl9fYmFuZ19fLnRyaWdnZXJcblxuICAgIGlmKCBwcm9wcy5maWxlbmFtZSApIHtcbiAgICAgIHN5bi5kYXRhID0gZy5kYXRhKCBwcm9wcy5maWxlbmFtZSApXG5cbiAgICAgIHN5bi5kYXRhLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgc3luLl9fcGhhc2VfXyA9IGcuY291bnRlciggcmF0ZSwgc3RhcnQsIGVuZCwgc3luLl9fYmFuZ19fLCBzaG91bGRMb29wLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSlcblxuICAgICAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICAgICAgc3luLFxuICAgICAgICAgIGcubXVsKCBcbiAgICAgICAgICBnLmlmZWxzZSggXG4gICAgICAgICAgICBnLmFuZCggZy5ndGUoIHN5bi5fX3BoYXNlX18sIHN0YXJ0ICksIGcubHQoIHN5bi5fX3BoYXNlX18sIGVuZCApICksXG4gICAgICAgICAgICBnLnBlZWsoIFxuICAgICAgICAgICAgICBzeW4uZGF0YSwgXG4gICAgICAgICAgICAgIHN5bi5fX3BoYXNlX18sXG4gICAgICAgICAgICAgIHsgbW9kZTonc2FtcGxlcycgfVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgICApLCBnLmluKCdnYWluJykgKSxcbiAgICAgICAgICAnc2FtcGxlcicsIFxuICAgICAgICAgIHByb3BzIFxuICAgICAgICApIFxuXG4gICAgICAgIGlmKCBzeW4uZW5kID09PSAtOTk5OTk5OTk5ICkgc3luLmVuZCA9IHN5bi5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoIHN5bi5vbmxvYWQgIT09IG51bGwgKSB7IHN5bi5vbmxvYWQoKSB9XG5cbiAgICAgICAgR2liYmVyaXNoLmRpcnR5KCBzeW4gKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcbiAgU2FtcGxlci5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAxLFxuICAgIHBhbjogLjUsXG4gICAgcmF0ZTogMSxcbiAgICBwYW5Wb2ljZXM6ZmFsc2UsXG4gICAgbG9vcHM6IDAsXG4gICAgc3RhcnQ6MCxcbiAgICBlbmQ6LTk5OTk5OTk5OVxuICB9XG5cbiAgbGV0IFBvbHlTYW1wbGVyID0gR2liYmVyaXNoLlBvbHlUZW1wbGF0ZSggU2FtcGxlciwgWydyYXRlJywncGFuJywnZ2FpbicsJ3N0YXJ0JywnZW5kJywnbG9vcHMnXSApIFxuXG4gIHJldHVybiBbIFNhbXBsZXIsIFBvbHlTYW1wbGVyIF1cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuICBcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgU25hcmUgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgc25hcmUgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBzY2FsZWREZWNheSA9IGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSxcbiAgICAgICAgc25hcHB5PSBnLmluKCAnc25hcHB5JyApLFxuICAgICAgICB0dW5lICA9IGcuaW4oICd0dW5lJyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU25hcmUuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IGVnID0gZy5kZWNheSggc2NhbGVkRGVjYXksIHsgaW5pdFZhbHVlOjAgfSApLCBcbiAgICAgICAgY2hlY2sgPSBnLm1lbW8oIGcuZ3QoIGVnLCAuMDAwNSApICksXG4gICAgICAgIHJuZCA9IGcubXVsKCBnLm5vaXNlKCksIGVnICksXG4gICAgICAgIGhwZiA9IGcuc3ZmKCBybmQsIGcuYWRkKCAxMDAwLCBnLm11bCggZy5hZGQoIDEsIHR1bmUpLCAxMDAwICkgKSwgLjUsIDEsIGZhbHNlICksXG4gICAgICAgIHNuYXAgPSBnLmd0cCggZy5tdWwoIGhwZiwgc25hcHB5ICksIDAgKSwgLy8gcmVjdGlmeVxuICAgICAgICBicGYxID0gZy5zdmYoIGVnLCBnLm11bCggMTgwLCBnLmFkZCggdHVuZSwgMSApICksIC4wNSwgMiwgZmFsc2UgKSxcbiAgICAgICAgYnBmMiA9IGcuc3ZmKCBlZywgZy5tdWwoIDMzMCwgZy5hZGQoIHR1bmUsIDEgKSApLCAuMDUsIDIsIGZhbHNlICksXG4gICAgICAgIG91dCAgPSBnLm1lbW8oIGcuYWRkKCBzbmFwLCBicGYxLCBnLm11bCggYnBmMiwgLjggKSApICksIC8vWFhYIHdoeSBpcyBtZW1vIG5lZWRlZD9cbiAgICAgICAgc2NhbGVkT3V0ID0gZy5tdWwoIG91dCwgZ2FpbiApXG4gICAgXG4gICAgLy8gWFhYIFRPRE8gOiBtYWtlIHRoaXMgd29yayB3aXRoIGlmZWxzZS4gdGhlIHByb2JsZW0gaXMgdGhhdCBwb2tlIHVnZW5zIHB1dCB0aGVpclxuICAgIC8vIGNvZGUgYXQgdGhlIGJvdHRvbSBvZiB0aGUgY2FsbGJhY2sgZnVuY3Rpb24sIGluc3RlYWQgb2YgYXQgdGhlIGVuZCBvZiB0aGVcbiAgICAvLyBhc3NvY2lhdGVkIGlmL2Vsc2UgYmxvY2suXG4gICAgbGV0IGlmZSA9IGcuc3dpdGNoKCBjaGVjaywgc2NhbGVkT3V0LCAwIClcbiAgICAvL2xldCBpZmUgPSBnLmlmZWxzZSggZy5ndCggZWcsIC4wMDUgKSwgY3ljbGUoNDQwKSwgMCApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHNuYXJlLCBpZmUsICdzbmFyZScsIHByb3BzICApXG4gICAgXG4gICAgc25hcmUuZW52ID0gZWcgXG5cbiAgICByZXR1cm4gc25hcmVcbiAgfVxuICBcbiAgU25hcmUuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6MTAwMCxcbiAgICB0dW5lOjAsXG4gICAgc25hcHB5OiAxLFxuICAgIGRlY2F5Oi4xXG4gIH1cblxuICByZXR1cm4gU25hcmVcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgU3ludGggPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgc3luID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgICBsZXQgZW52ID0gZy5hZCggZy5pbignYXR0YWNrJyksIGcuaW4oJ2RlY2F5JyksIHsgc2hhcGU6J2xpbmVhcicgfSksXG4gICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGxvdWRuZXNzICA9IGcuaW4oICdsb3VkbmVzcycgKSwgXG4gICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICBzbGlkaW5nRnJlcSA9IGcuc2xpZGUoIGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHN5biwgU3ludGguZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuXG4gICAgc3luLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBvc2MgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggc3luLndhdmVmb3JtLCBzbGlkaW5nRnJlcSwgc3luLmFudGlhbGlhcyApXG5cbiAgICAgIGxldCBvc2NXaXRoRW52ID0gZy5tdWwoIGcubXVsKCBvc2MsIGVudiwgbG91ZG5lc3MgKSApLFxuICAgICAgICAgIHBhbm5lclxuICBcbiAgICAgIGNvbnN0IGJhc2VDdXRvZmZGcmVxID0gZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBmcmVxdWVuY3kgKVxuICAgICAgbGV0IGN1dG9mZiA9IGcubXVsKCBnLm11bCggYmFzZUN1dG9mZkZyZXEsIGcucG93KCAyLCBnLmluKCdmaWx0ZXJNdWx0JykgKSksIGVudiApXG4gICAgICBjb25zdCBmaWx0ZXJlZE9zYyA9IEdpYmJlcmlzaC5maWx0ZXJzLmZhY3RvcnkoIG9zY1dpdGhFbnYsIGN1dG9mZiwgZy5pbignUScpLCBnLmluKCdzYXR1cmF0aW9uJyksIHByb3BzIClcblxuICAgICAgbGV0IHN5bnRoV2l0aEdhaW4gPSBnLm11bCggZmlsdGVyZWRPc2MsIGcuaW4oICdnYWluJyApIClcbiAgXG4gICAgICBpZiggc3luLnBhblZvaWNlcyA9PT0gdHJ1ZSApIHsgXG4gICAgICAgIHBhbm5lciA9IGcucGFuKCBzeW50aFdpdGhHYWluLCBzeW50aFdpdGhHYWluLCBnLmluKCAncGFuJyApICkgXG4gICAgICAgIHN5bi5ncmFwaCA9IFtwYW5uZXIubGVmdCwgcGFubmVyLnJpZ2h0XVxuICAgICAgfWVsc2V7XG4gICAgICAgIHN5bi5ncmFwaCA9IHN5bnRoV2l0aEdhaW5cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgc3luLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uID0gWyAnd2F2ZWZvcm0nLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCdmaWx0ZXJNb2RlJyBdXG4gICAgc3luLl9fY3JlYXRlR3JhcGgoKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgc3luLmdyYXBoLCAnc3ludGgnLCBwcm9wcyAgKVxuXG4gICAgc3luLmVudiA9IGVudlxuXG4gICAgcmV0dXJuIHN5blxuICB9XG4gIFxuICBTeW50aC5kZWZhdWx0cyA9IHtcbiAgICB3YXZlZm9ybTonc2F3JyxcbiAgICBhdHRhY2s6IDQ0MTAwLFxuICAgIGRlY2F5OiA0NDEwMCxcbiAgICBnYWluOiAxLFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBhbnRpYWxpYXM6ZmFsc2UsXG4gICAgcGFuVm9pY2VzOmZhbHNlLFxuICAgIGxvdWRuZXNzOjEsXG4gICAgZ2xpZGU6MSxcbiAgICBzYXR1cmF0aW9uOjEsXG4gICAgZmlsdGVyTXVsdDoyLFxuICAgIFE6LjI1LFxuICAgIGN1dG9mZjouNSxcbiAgICBmaWx0ZXJUeXBlOjAsXG4gICAgZmlsdGVyTW9kZTowLFxuICAgIGlzTG93UGFzczoxXG4gIH1cblxuICAvLyBkbyBub3QgaW5jbHVkZSB2ZWxvY2l0eSwgd2hpY2ggc2hvdWRsIGFsd2F5cyBiZSBwZXIgdm9pY2VcbiAgbGV0IFBvbHlTeW50aCA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIFN5bnRoLCBbJ2ZyZXF1ZW5jeScsJ2F0dGFjaycsJ2RlY2F5JywncHVsc2V3aWR0aCcsJ3BhbicsJ2dhaW4nLCdnbGlkZScsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnLCAnUScsICdjdXRvZmYnLCAncmVzb25hbmNlJywgJ2FudGlhbGlhcycsICdmaWx0ZXJUeXBlJywgJ3dhdmVmb3JtJywgJ2ZpbHRlck1vZGUnXSApIFxuXG4gIHJldHVybiBbIFN5bnRoLCBQb2x5U3ludGggXVxuXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IEJpbm9wcyA9IHtcbiAgICBleHBvcnQoIG9iaiApIHtcbiAgICAgIGZvciggbGV0IGtleSBpbiBCaW5vcHMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIG9ialsga2V5IF0gPSBCaW5vcHNbIGtleSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIEFkZCggLi4uYXJncyApIHtcbiAgICAgIGxldCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICByZXR1cm4geyBiaW5vcDp0cnVlLCBvcDonKycsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonYWRkJyArIGlkLCBpZCB9XG4gICAgfSxcblxuICAgIFN1YiggLi4uYXJncyApIHtcbiAgICAgIGxldCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICByZXR1cm4geyBiaW5vcDp0cnVlLCBvcDonLScsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonc3ViJyArIGlkLCBpZCB9XG4gICAgfSxcblxuICAgIE11bCggLi4uYXJncyApIHtcbiAgICAgIGxldCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICByZXR1cm4geyBiaW5vcDp0cnVlLCBvcDonKicsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonbXVsJyArIGlkLCBpZCB9XG4gICAgfSxcblxuICAgIERpdiggLi4uYXJncyApIHtcbiAgICAgIGxldCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICByZXR1cm4geyBiaW5vcDp0cnVlLCBvcDonLycsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonZGl2JyArIGlkLCBpZCB9XG4gICAgfSxcblxuICAgIE1vZCggLi4uYXJncyApIHtcbiAgICAgIGxldCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICByZXR1cm4geyBiaW5vcDp0cnVlLCBvcDonJScsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonbW9kJyArIGlkLCBpZCB9XG4gICAgfSwgICBcbiAgfVxuXG4gIHJldHVybiBCaW5vcHNcbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBCdXMgPSB7IFxuICAgIGZhY3Rvcnk6IG51bGwsLy9HaWJiZXJpc2guZmFjdG9yeSggZy5hZGQoIDAgKSAsICdidXMnLCBbIDAsIDEgXSAgKSxcblxuICAgIGNyZWF0ZSgpIHtcbiAgICAgIGxldCBidXMgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIFxuICAgICAgYnVzLmNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBvdXRwdXQgPSAwXG4gICAgICAgLy8gb3V0cHV0WyAwIF0gPSBvdXRwdXRbIDEgXSA9IDBcblxuICAgICAgICBmb3IoIGxldCBpID0gMCwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIG91dHB1dCArPSBhcmd1bWVudHNbIGkgXVxuICAgICAgICAgIC8vb3V0cHV0WyAwIF0gKz0gaW5wdXRcbiAgICAgICAgICAvL291dHB1dFsgMSBdICs9IGlucHV0XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0cHV0XG4gICAgICB9XG5cbiAgICAgIGJ1cy5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICBidXMuZGlydHkgPSB0cnVlXG4gICAgICBidXMudHlwZSA9ICdidXMnXG4gICAgICBidXMudWdlbk5hbWUgPSAnYnVzXycgKyBidXMuaWRcbiAgICAgIGJ1cy5pbnB1dHMgPSBbXVxuICAgICAgYnVzLmlucHV0TmFtZXMgPSBbXVxuXG4gICAgICBidXMuY2hhaW4gPSAoIHRhcmdldCwgbGV2ZWwgPSAxICkgPT4ge1xuICAgICAgICB0aGlzLmNvbm5lY3QoIHRhcmdldCwgbGV2ZWwgKVxuICAgICAgICByZXR1cm4gdGFyZ2V0XG4gICAgICB9XG5cbiAgICAgIGJ1cy5kaXNjb25uZWN0VWdlbiA9ICggdWdlbiApID0+IHtcbiAgICAgICAgbGV0IHJlbW92ZUlkeCA9IC0xXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5pbnB1dHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgbGV0IGlucHV0ID0gdGhpcy5pbnB1dHNbIGkgXVxuXG4gICAgICAgICAgaWYoIGlzTmFOKCBpbnB1dCApICYmIHVnZW4gPT09IGlucHV0ICkge1xuICAgICAgICAgICAgcmVtb3ZlSWR4ID0gaVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggcmVtb3ZlSWR4ICE9PSAtMSApIHtcbiAgICAgICAgICB0aGlzLmlucHV0cy5zcGxpY2UoIHJlbW92ZUlkeCwgMSApXG4gICAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB0aGlzIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gYnVzXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIEJ1cy5jcmVhdGVcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQnVzMiA9IHsgXG4gICAgY3JlYXRlKCkge1xuICAgICAgbGV0IG91dHB1dCA9IG5ldyBGbG9hdDMyQXJyYXkoIDIgKVxuXG4gICAgICBsZXQgYnVzID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgICAgIE9iamVjdC5hc3NpZ24oIGJ1cywge1xuICAgICAgICBjYWxsYmFjaygpIHtcbiAgICAgICAgICBvdXRwdXRbIDAgXSA9IG91dHB1dFsgMSBdID0gMFxuXG4gICAgICAgICAgZm9yKCBsZXQgaSA9IDAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGxldCBpbnB1dCA9IGFyZ3VtZW50c1sgaSBdLFxuICAgICAgICAgICAgICAgIGlzQXJyYXkgPSBpbnB1dCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheVxuXG4gICAgICAgICAgICBvdXRwdXRbIDAgXSArPSBpc0FycmF5ID8gaW5wdXRbIDAgXSA6IGlucHV0XG4gICAgICAgICAgICBvdXRwdXRbIDEgXSArPSBpc0FycmF5ID8gaW5wdXRbIDEgXSA6IGlucHV0XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG91dHB1dFxuICAgICAgICB9LFxuICAgICAgICBpZCA6IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpLFxuICAgICAgICBkaXJ0eSA6IHRydWUsXG4gICAgICAgIHR5cGUgOiAnYnVzJyxcbiAgICAgICAgaW5wdXRzIDogW10sXG4gICAgICAgIGlucHV0TmFtZXMgOiBbXSxcbiAgICAgIH0pXG5cbiAgICAgIGJ1cy51Z2VuTmFtZSA9IGJ1cy5jYWxsYmFjay51Z2VuTmFtZSA9ICdidXMyXycgKyBidXMuaWRcblxuICAgICAgYnVzLmRpc2Nvbm5lY3RVZ2VuID0gZnVuY3Rpb24oIHVnZW4gKSB7XG4gICAgICAgIGxldCByZW1vdmVJZHggPSB0aGlzLmlucHV0cy5pbmRleE9mKCB1Z2VuIClcbiAgICAgICAgXG4gICAgICAgIGlmKCByZW1vdmVJZHggIT09IC0xICkge1xuICAgICAgICAgIHRoaXMuaW5wdXRzLnNwbGljZSggcmVtb3ZlSWR4LCAxIClcbiAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiBidXNcbiAgICB9XG4gIH1cblxuICByZXR1cm4gQnVzMi5jcmVhdGVcblxufVxuXG4iLCJjb25zdCAgZyAgICA9IHJlcXVpcmUoICdnZW5pc2guanMnICApLFxuICAgICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgTW9ub3BzID0ge1xuICAgIGV4cG9ydCggb2JqICkge1xuICAgICAgZm9yKCBsZXQga2V5IGluIE1vbm9wcyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgICAgb2JqWyBrZXkgXSA9IE1vbm9wc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgQWJzKCBpbnB1dCApIHtcbiAgICAgIGNvbnN0IGFicyA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLmFicyggZy5pbignaW5wdXQnKSApXG4gICAgICBcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBhYnMsIGdyYXBoLCAnYWJzJywgT2JqZWN0LmFzc2lnbih7fSwgTW9ub3BzLmRlZmF1bHRzLCB7IGlucHV0IH0pIClcblxuICAgICAgcmV0dXJuIGFic1xuICAgIH0sXG5cbiAgICBQb3coIGlucHV0LCBleHBvbmVudCApIHtcbiAgICAgIGNvbnN0IHBvdyA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLnBvdyggZy5pbignaW5wdXQnKSwgZy5pbignZXhwb25lbnQnKSApXG4gICAgICBcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBwb3csIGdyYXBoLCAnYWJzJywgT2JqZWN0LmFzc2lnbih7fSwgTW9ub3BzLmRlZmF1bHRzLCB7IGlucHV0LCBleHBvbmVudCB9KSApXG5cbiAgICAgIHJldHVybiBwb3dcbiAgICB9LFxuXG4gICAgTWVyZ2UoIGlucHV0ICkge1xuICAgICAgY29uc3QgbWVyZ2VyID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBjYiA9IGZ1bmN0aW9uKCBfaW5wdXQgKSB7XG4gICAgICAgIHJldHVybiBfaW5wdXRbMF0gKyBfaW5wdXRbMV1cbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIG1lcmdlciwgZy5pbiggJ2lucHV0JyApLCAnbWVyZ2UnLCB7IGlucHV0IH0sIGNiIClcbiAgICAgIG1lcmdlci50eXBlID0gJ2FuYWx5c2lzJ1xuICAgICAgbWVyZ2VyLmlucHV0TmFtZXMgPSBbICdpbnB1dCcgXVxuICAgICAgbWVyZ2VyLmlucHV0cyA9IFsgaW5wdXQgXVxuICAgICAgbWVyZ2VyLmlucHV0ID0gaW5wdXRcbiAgICAgIFxuICAgICAgcmV0dXJuIG1lcmdlclxuICAgIH0sXG4gIH1cblxuICBNb25vcHMuZGVmYXVsdHMgPSB7IGlucHV0OjAgfVxuXG4gIHJldHVybiBNb25vcHNcbn1cbiIsImNvbnN0IGdlbmlzaCA9IHJlcXVpcmUoJ2dlbmlzaC5qcycpLFxuICAgICAgc3NkID0gZ2VuaXNoLmhpc3RvcnksXG4gICAgICBub2lzZSA9IGdlbmlzaC5ub2lzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGxhc3QgPSBzc2QoMCk7XG5cbiAgY29uc3Qgd2hpdGUgPSBnZW5pc2guc3ViKGdlbmlzaC5tdWwobm9pc2UoKSwgMiksIDEpO1xuXG4gIGxldCBvdXQgPSBnZW5pc2guYWRkKGxhc3Qub3V0LCBnZW5pc2guZGl2KGdlbmlzaC5tdWwoLjAyLCB3aGl0ZSksIDEuMDIpKTtcblxuICBsYXN0LmluKG91dCk7XG5cbiAgb3V0ID0gZ2VuaXNoLm11bChvdXQsIDMuNSk7XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qXG5mb3IgKHZhciBpID0gMDsgaSA8IGJ1ZmZlclNpemU7IGkrKykge1xuICAgIHZhciB3aGl0ZSA9IE1hdGgucmFuZG9tKCkgKiAyIC0gMTtcbiAgICBvdXRwdXRbaV0gPSAobGFzdE91dCArICgwLjAyICogd2hpdGUpKSAvIDEuMDI7XG4gICAgbGFzdE91dCA9IG91dHB1dFtpXTtcbiAgICBvdXRwdXRbaV0gKj0gMy41OyAvLyAocm91Z2hseSkgY29tcGVuc2F0ZSBmb3IgZ2FpblxufVxuKi8iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubGV0IGZlZWRiYWNrT3NjID0gZnVuY3Rpb24oIGZyZXF1ZW5jeSwgZmlsdGVyLCBwdWxzZXdpZHRoPS41LCBhcmd1bWVudFByb3BzICkge1xuICBpZiggYXJndW1lbnRQcm9wcyA9PT0gdW5kZWZpbmVkICkgYXJndW1lbnRQcm9wcyA9IHsgdHlwZTogMCB9XG5cbiAgbGV0IGxhc3RTYW1wbGUgPSBnLmhpc3RvcnkoKSxcbiAgICAgIC8vIGRldGVybWluZSBwaGFzZSBpbmNyZW1lbnQgYW5kIG1lbW9pemUgcmVzdWx0XG4gICAgICB3ID0gZy5tZW1vKCBnLmRpdiggZnJlcXVlbmN5LCBnLmdlbi5zYW1wbGVyYXRlICkgKSxcbiAgICAgIC8vIGNyZWF0ZSBzY2FsaW5nIGZhY3RvclxuICAgICAgbiA9IGcuc3ViKCAtLjUsIHcgKSxcbiAgICAgIHNjYWxpbmcgPSBnLm11bCggZy5tdWwoIDEzLCBmaWx0ZXIgKSwgZy5wb3coIG4sIDUgKSApLFxuICAgICAgLy8gY2FsY3VsYXRlIGRjIG9mZnNldCBhbmQgbm9ybWFsaXphdGlvbiBmYWN0b3JzXG4gICAgICBEQyA9IGcuc3ViKCAuMzc2LCBnLm11bCggdywgLjc1MiApICksXG4gICAgICBub3JtID0gZy5zdWIoIDEsIGcubXVsKCAyLCB3ICkgKSxcbiAgICAgIC8vIGRldGVybWluZSBwaGFzZVxuICAgICAgb3NjMVBoYXNlID0gZy5hY2N1bSggdywgMCwgeyBtaW46LTEgfSksXG4gICAgICBvc2MxLCBvdXRcblxuICAvLyBjcmVhdGUgY3VycmVudCBzYW1wbGUuLi4gZnJvbSB0aGUgcGFwZXI6XG4gIC8vIG9zYyA9IChvc2MgKyBzaW4oMipwaSoocGhhc2UgKyBvc2Mqc2NhbGluZykpKSowLjVmO1xuICBvc2MxID0gZy5tZW1vKCBcbiAgICBnLm11bChcbiAgICAgIGcuYWRkKFxuICAgICAgICBsYXN0U2FtcGxlLm91dCxcbiAgICAgICAgZy5zaW4oXG4gICAgICAgICAgZy5tdWwoXG4gICAgICAgICAgICBNYXRoLlBJICogMixcbiAgICAgICAgICAgIGcubWVtbyggZy5hZGQoIG9zYzFQaGFzZSwgZy5tdWwoIGxhc3RTYW1wbGUub3V0LCBzY2FsaW5nICkgKSApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgLjVcbiAgICApXG4gIClcblxuICAvLyBzdG9yZSBzYW1wbGUgdG8gdXNlIGFzIG1vZHVsYXRpb25cbiAgbGFzdFNhbXBsZS5pbiggb3NjMSApXG5cbiAgLy8gaWYgcHdtIC8gc3F1YXJlIHdhdmVmb3JtIGluc3RlYWQgb2Ygc2F3dG9vdGguLi5cbiAgaWYoIGFyZ3VtZW50UHJvcHMudHlwZSA9PT0gMSApIHsgXG4gICAgY29uc3QgbGFzdFNhbXBsZTIgPSBnLmhpc3RvcnkoKSAvLyBmb3Igb3NjIDJcbiAgICBjb25zdCBsYXN0U2FtcGxlTWFzdGVyID0gZy5oaXN0b3J5KCkgLy8gZm9yIHN1bSBvZiBvc2MxLG9zYzJcblxuICAgIGNvbnN0IG9zYzIgPSBnLm11bChcbiAgICAgIGcuYWRkKFxuICAgICAgICBsYXN0U2FtcGxlMi5vdXQsXG4gICAgICAgIGcuc2luKFxuICAgICAgICAgIGcubXVsKFxuICAgICAgICAgICAgTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICBnLm1lbW8oIGcuYWRkKCBvc2MxUGhhc2UsIGcubXVsKCBsYXN0U2FtcGxlMi5vdXQsIHNjYWxpbmcgKSwgcHVsc2V3aWR0aCApIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICksXG4gICAgICAuNVxuICAgIClcblxuICAgIGxhc3RTYW1wbGUyLmluKCBvc2MyIClcbiAgICBvdXQgPSBnLm1lbW8oIGcuc3ViKCBsYXN0U2FtcGxlLm91dCwgbGFzdFNhbXBsZTIub3V0ICkgKVxuICAgIG91dCA9IGcubWVtbyggZy5hZGQoIGcubXVsKCAyLjUsIG91dCApLCBnLm11bCggLTEuNSwgbGFzdFNhbXBsZU1hc3Rlci5vdXQgKSApIClcbiAgICBcbiAgICBsYXN0U2FtcGxlTWFzdGVyLmluKCBnLnN1Yiggb3NjMSwgb3NjMiApIClcblxuICB9ZWxzZXtcbiAgICAgLy8gb2Zmc2V0IGFuZCBub3JtYWxpemVcbiAgICBvc2MxID0gZy5hZGQoIGcubXVsKCAyLjUsIG9zYzEgKSwgZy5tdWwoIC0xLjUsIGxhc3RTYW1wbGUub3V0ICkgKVxuICAgIG9zYzEgPSBnLmFkZCggb3NjMSwgREMgKVxuIFxuICAgIG91dCA9IG9zYzFcbiAgfVxuXG4gIHJldHVybiBnLm11bCggb3V0LCBub3JtIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmZWVkYmFja09zY1xuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgICBmZWVkYmFja09zYyA9IHJlcXVpcmUoICcuL2ZtZmVlZGJhY2tvc2MuanMnIClcblxuLy8gIF9fbWFrZU9zY2lsbGF0b3JfXyggdHlwZSwgZnJlcXVlbmN5LCBhbnRpYWxpYXMgKSB7XG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGxldCBPc2NpbGxhdG9ycyA9IHtcbiAgICBleHBvcnQoIG9iaiApIHtcbiAgICAgIGZvciggbGV0IGtleSBpbiBPc2NpbGxhdG9ycyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgICAgb2JqWyBrZXkgXSA9IE9zY2lsbGF0b3JzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdlbmlzaDoge1xuICAgICAgQnJvd246IHJlcXVpcmUoICcuL2Jyb3dubm9pc2UuanMnICksXG4gICAgICBQaW5rOiAgcmVxdWlyZSggJy4vcGlua25vaXNlLmpzJyAgKVxuICAgIH0sXG5cbiAgICBXYXZldGFibGU6IHJlcXVpcmUoICcuL3dhdmV0YWJsZS5qcycgKSggR2liYmVyaXNoICksXG4gICAgXG4gICAgU3F1YXJlKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgc3FyICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBPc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbignZ2FpbicgKSApXG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzcXIsIGdyYXBoLCAnc3FyJywgcHJvcHMgKVxuXG4gICAgICByZXR1cm4gc3FyXG4gICAgfSxcblxuICAgIFBXTSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHB3bSAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApIFxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgYW50aWFsaWFzOmZhbHNlLCBwdWxzZXdpZHRoOi4yNSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IE9zY2lsbGF0b3JzLmZhY3RvcnkoICdwd20nLCBnLmluKCAnZnJlcXVlbmN5JyApLCBwcm9wcy5hbnRpYWxpYXMgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggb3NjLCBnLmluKCdnYWluJyApIClcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHB3bSwgZ3JhcGgsICdwd20nLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBwd21cbiAgICB9LFxuXG4gICAgU2luZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNpbmUgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIGcuY3ljbGUoIGcuaW4oJ2ZyZXF1ZW5jeScpICksIGcuaW4oJ2dhaW4nKSApXG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzaW5lLCBncmFwaCwgJ3NpbmUnLCBwcm9wcyApXG4gICAgICBcbiAgICAgIHJldHVybiBzaW5lXG4gICAgfSxcblxuICAgIE5vaXNlKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIHsgZ2FpbjogMSwgY29sb3I6J3doaXRlJyB9LCBpbnB1dFByb3BzIClcbiAgICAgIGxldCBncmFwaCBcblxuICAgICAgc3dpdGNoKCBwcm9wcy5jb2xvciApIHtcbiAgICAgICAgY2FzZSAnYnJvd24nOlxuICAgICAgICAgIGdyYXBoID0gZy5tdWwoIE9zY2lsbGF0b3JzLmdlbmlzaC5Ccm93bigpLCBnLmluKCdnYWluJykgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwaW5rJzpcbiAgICAgICAgICBncmFwaCA9IGcubXVsKCBPc2NpbGxhdG9ycy5nZW5pc2guUGluaygpLCBnLmluKCdnYWluJykgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGdyYXBoID0gZy5tdWwoIGcubm9pc2UoKSwgZy5pbignZ2FpbicpIClcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIG5vaXNlLCBncmFwaCwgJ25vaXNlJywgcHJvcHMgKVxuXG4gICAgICByZXR1cm4gbm9pc2VcbiAgICB9LFxuXG4gICAgU2F3KCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgc2F3ICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBPc2NpbGxhdG9ycy5mYWN0b3J5KCAnc2F3JywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbignZ2FpbicgKSApXG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzYXcsIGdyYXBoLCAnc2F3JywgcHJvcHMgKVxuXG4gICAgICByZXR1cm4gc2F3XG4gICAgfSxcblxuICAgIFJldmVyc2VTYXcoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzYXcgICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSBcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7IGFudGlhbGlhczpmYWxzZSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IGcuc3ViKCAxLCBPc2NpbGxhdG9ycy5mYWN0b3J5KCAnc2F3JywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzICkgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggb3NjLCBnLmluKCAnZ2FpbicgKSApXG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzYXcsIGdyYXBoLCAncnNhdycsIHByb3BzIClcbiAgICAgIFxuICAgICAgcmV0dXJuIHNhd1xuICAgIH0sXG5cbiAgICBmYWN0b3J5KCB0eXBlLCBmcmVxdWVuY3ksIGFudGlhbGlhcz1mYWxzZSApIHtcbiAgICAgIGxldCBvc2NcblxuICAgICAgc3dpdGNoKCB0eXBlICkge1xuICAgICAgICBjYXNlICdzYXcnOlxuICAgICAgICAgIGlmKCBhbnRpYWxpYXMgPT09IGZhbHNlICkge1xuICAgICAgICAgICAgb3NjID0gZy5waGFzb3IoIGZyZXF1ZW5jeSApXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcXVlbmN5LCAxIClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgICAgaWYoIGFudGlhbGlhcyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgIG9zYyA9IGZlZWRiYWNrT3NjKCBmcmVxdWVuY3ksIDEsIC41LCB7IHR5cGU6MSB9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgb3NjID0gZy53YXZldGFibGUoIGZyZXF1ZW5jeSwgeyBidWZmZXI6T3NjaWxsYXRvcnMuU3F1YXJlLmJ1ZmZlciwgbmFtZTonc3F1YXJlJyB9IClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NpbmUnOlxuICAgICAgICAgIG9zYyA9IGcuY3ljbGUoIGZyZXF1ZW5jeSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3B3bSc6XG4gICAgICAgICAgbGV0IHB1bHNld2lkdGggPSBnLmluKCdwdWxzZXdpZHRoJylcbiAgICAgICAgICBpZiggYW50aWFsaWFzID09PSB0cnVlICkge1xuICAgICAgICAgICAgb3NjID0gZmVlZGJhY2tPc2MoIGZyZXF1ZW5jeSwgMSwgcHVsc2V3aWR0aCwgeyB0eXBlOjEgfSlcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGxldCBwaGFzZSA9IGcucGhhc29yKCBmcmVxdWVuY3ksIDAsIHsgbWluOjAgfSApXG4gICAgICAgICAgICBvc2MgPSBnLmx0KCBwaGFzZSwgcHVsc2V3aWR0aCApXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3NjXG4gICAgfVxuICB9XG5cbiAgT3NjaWxsYXRvcnMuU3F1YXJlLmJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gIGZvciggbGV0IGkgPSAxMDIzOyBpID49IDA7IGktLSApIHsgXG4gICAgT3NjaWxsYXRvcnMuU3F1YXJlLmJ1ZmZlciBbIGkgXSA9IGkgLyAxMDI0ID4gLjUgPyAxIDogLTFcbiAgfVxuXG4gIE9zY2lsbGF0b3JzLmRlZmF1bHRzID0ge1xuICAgIGZyZXF1ZW5jeTogNDQwLFxuICAgIGdhaW46IDFcbiAgfVxuXG4gIHJldHVybiBPc2NpbGxhdG9yc1xuXG59XG4iLCJjb25zdCBnZW5pc2ggPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIHNzZCA9IGdlbmlzaC5oaXN0b3J5LFxuICAgICAgbm9pc2UgPSBnZW5pc2gubm9pc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBiMCA9IHNzZCgwKSxcbiAgICAgICAgYjEgPSBzc2QoMCksXG4gICAgICAgIGIyID0gc3NkKDApLFxuICAgICAgICBiMyA9IHNzZCgwKSxcbiAgICAgICAgYjQgPSBzc2QoMCksXG4gICAgICAgIGI1ID0gc3NkKDApLFxuICAgICAgICBiNiA9IHNzZCgwKTtcbiAgY29uc3Qgd2hpdGUgPSBnZW5pc2guc3ViKGdlbmlzaC5tdWwobm9pc2UoKSwgMiksIDEpO1xuXG4gIGIwLmluKGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguOTk4ODYsIGIwLm91dCksIGdlbmlzaC5tdWwod2hpdGUsIC4wNTU1MTc5KSkpO1xuICBiMS5pbihnZW5pc2guYWRkKGdlbmlzaC5tdWwoLjk5MzMyLCBiMS5vdXQpLCBnZW5pc2gubXVsKHdoaXRlLCAuMDc1MDU3OSkpKTtcbiAgYjIuaW4oZ2VuaXNoLmFkZChnZW5pc2gubXVsKC45NjkwMCwgYjIub3V0KSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjE1Mzg1MjApKSk7XG4gIGIzLmluKGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguODg2NTAsIGIzLm91dCksIGdlbmlzaC5tdWwod2hpdGUsIC4zMTA0ODU2KSkpO1xuICBiNC5pbihnZW5pc2guYWRkKGdlbmlzaC5tdWwoLjU1MDAwLCBiNC5vdXQpLCBnZW5pc2gubXVsKHdoaXRlLCAuNTMyOTUyMikpKTtcbiAgYjUuaW4oZ2VuaXNoLnN1YihnZW5pc2gubXVsKC0uNzYxNiwgYjUub3V0KSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjAxNjg5ODApKSk7XG5cbiAgb3V0ID0gZ2VuaXNoLm11bChnZW5pc2guYWRkKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGIwLm91dCwgYjAub3V0KSwgYjAub3V0KSwgYjAub3V0KSwgYjAub3V0KSwgYjAub3V0KSwgYjAub3V0KSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjUzNjIpKSwgLjExKTtcblxuICBiNi5pbihnZW5pc2gubXVsKHdoaXRlLCAuMTE1OTI2KSk7XG5cbiAgcmV0dXJuIG91dDtcbn07IiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgV2F2ZXRhYmxlID0gZnVuY3Rpb24oIGlucHV0UHJvcHMgKSB7XG4gICAgY29uc3Qgd2F2ZXRhYmxlID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgY29uc3QgcHJvcHMgID0gT2JqZWN0LmFzc2lnbih7fSwgR2liYmVyaXNoLm9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBjb25zdCBvc2MgPSBnLndhdmV0YWJsZSggZy5pbignZnJlcXVlbmN5JyksIHByb3BzIClcbiAgICBjb25zdCBncmFwaCA9IGcubXVsKCBcbiAgICAgIG9zYywgXG4gICAgICBnLmluKCAnZ2FpbicgKVxuICAgIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCB3YXZldGFibGUsIGdyYXBoLCAnd2F2ZXRhYmxlJywgcHJvcHMgKVxuXG4gICAgcmV0dXJuIHdhdmV0YWJsZVxuICB9XG5cbiAgZy53YXZldGFibGUgPSBmdW5jdGlvbiggZnJlcXVlbmN5LCBwcm9wcyApIHtcbiAgICBsZXQgZGF0YVByb3BzID0geyBpbW11dGFibGU6dHJ1ZSB9XG5cbiAgICAvLyB1c2UgZ2xvYmFsIHJlZmVyZW5jZXMgaWYgYXBwbGljYWJsZVxuICAgIGlmKCBwcm9wcy5uYW1lICE9PSB1bmRlZmluZWQgKSBkYXRhUHJvcHMuZ2xvYmFsID0gcHJvcHMubmFtZVxuXG4gICAgY29uc3QgYnVmZmVyID0gZy5kYXRhKCBwcm9wcy5idWZmZXIsIDEsIGRhdGFQcm9wcyApXG5cbiAgICByZXR1cm4gZy5wZWVrKCBidWZmZXIsIGcucGhhc29yKCBmcmVxdWVuY3ksIDAsIHsgbWluOjAgfSApIClcbiAgfVxuXG4gIHJldHVybiBXYXZldGFibGVcbn1cbiIsImNvbnN0IFF1ZXVlID0gcmVxdWlyZSggJy4uL2V4dGVybmFsL3ByaW9yaXR5cXVldWUuanMnIClcbmNvbnN0IEJpZyAgID0gcmVxdWlyZSggJ2JpZy5qcycgKVxuXG5sZXQgU2NoZWR1bGVyID0ge1xuICBwaGFzZTogMCxcblxuICBxdWV1ZTogbmV3IFF1ZXVlKCAoIGEsIGIgKSA9PiB7XG4gICAgaWYoIGEudGltZSA9PT0gYi50aW1lICkgeyAvL2EudGltZS5lcSggYi50aW1lICkgKSB7XG4gICAgICByZXR1cm4gYi5wcmlvcml0eSAtIGEucHJpb3JpdHlcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBhLnRpbWUgLSBiLnRpbWUgLy9hLnRpbWUubWludXMoIGIudGltZSApXG4gICAgfVxuICB9KSxcblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnF1ZXVlLmRhdGEubGVuZ3RoID0gMFxuICAgIHRoaXMucXVldWUubGVuZ3RoID0gMFxuICB9LFxuXG4gIGFkZCggdGltZSwgZnVuYywgcHJpb3JpdHkgPSAwICkge1xuICAgIHRpbWUgKz0gdGhpcy5waGFzZVxuXG4gICAgdGhpcy5xdWV1ZS5wdXNoKHsgdGltZSwgZnVuYywgcHJpb3JpdHkgfSlcbiAgfSxcblxuICB0aWNrKCkge1xuICAgIGlmKCB0aGlzLnF1ZXVlLmxlbmd0aCApIHtcbiAgICAgIGxldCBuZXh0ID0gdGhpcy5xdWV1ZS5wZWVrKClcblxuICAgICAgd2hpbGUoIHRoaXMucGhhc2UgPj0gbmV4dC50aW1lICkge1xuICAgICAgICBuZXh0LmZ1bmMoKVxuICAgICAgICB0aGlzLnF1ZXVlLnBvcCgpXG4gICAgICAgIG5leHQgPSB0aGlzLnF1ZXVlLnBlZWsoKVxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgdGhpcy5waGFzZSsrXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2NoZWR1bGVyXG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGNvbnN0IF9fcHJvdG9fXyA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gIE9iamVjdC5hc3NpZ24oIF9fcHJvdG9fXywge1xuICAgIHN0YXJ0KCkge1xuICAgICAgdGhpcy5jb25uZWN0KClcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcbiAgICBzdG9wKCkge1xuICAgICAgdGhpcy5kaXNjb25uZWN0KClcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9KVxuXG4gIGNvbnN0IFNlcTIgPSB7IFxuICAgIGNyZWF0ZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNlcSA9IE9iamVjdC5jcmVhdGUoIF9fcHJvdG9fXyApLFxuICAgICAgICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBTZXEyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgICAgc2VxLnBoYXNlID0gMFxuICAgICAgc2VxLmlucHV0TmFtZXMgPSBbICdyYXRlJyBdXG4gICAgICBzZXEuaW5wdXRzID0gWyAxIF1cbiAgICAgIHNlcS5uZXh0VGltZSA9IDBcbiAgICAgIHNlcS52YWx1ZXNQaGFzZSA9IDBcbiAgICAgIHNlcS50aW1pbmdzUGhhc2UgPSAwXG4gICAgICBzZXEuaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgc2VxLmRpcnR5ID0gdHJ1ZVxuICAgICAgc2VxLnR5cGUgPSAnc2VxJ1xuXG4gICAgICBpZiggcHJvcHMudGFyZ2V0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHNlcS5hbm9uRnVuY3Rpb24gPSB0cnVlXG4gICAgICB9ZWxzZXsgXG4gICAgICAgIHNlcS5hbm9uRnVuY3Rpb24gPSBmYWxzZVxuICAgICAgICBzZXEuY2FsbEZ1bmN0aW9uID0gdHlwZW9mIHByb3BzLnRhcmdldFsgcHJvcHMua2V5IF0gPT09ICdmdW5jdGlvbidcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmFzc2lnbiggc2VxLCBwcm9wcyApXG5cbiAgICAgIHNlcS5jYWxsYmFjayA9IGZ1bmN0aW9uKCByYXRlICkge1xuICAgICAgICBpZiggc2VxLnBoYXNlID49IHNlcS5uZXh0VGltZSApIHtcbiAgICAgICAgICBsZXQgdmFsdWUgPSBzZXEudmFsdWVzWyBzZXEudmFsdWVzUGhhc2UrKyAlIHNlcS52YWx1ZXMubGVuZ3RoIF1cblxuICAgICAgICAgIGlmKCBzZXEuYW5vbkZ1bmN0aW9uIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyApIHZhbHVlID0gdmFsdWUoKVxuICAgICAgICAgIFxuICAgICAgICAgIGlmKCBzZXEuYW5vbkZ1bmN0aW9uID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgIGlmKCBzZXEuY2FsbEZ1bmN0aW9uID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdID0gdmFsdWVcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBzZXEudGFyZ2V0WyBzZXEua2V5IF0oIHZhbHVlICkgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VxLnBoYXNlIC09IHNlcS5uZXh0VGltZVxuXG4gICAgICAgICAgbGV0IHRpbWluZyA9IHNlcS50aW1pbmdzWyBzZXEudGltaW5nc1BoYXNlKysgJSBzZXEudGltaW5ncy5sZW5ndGggXVxuICAgICAgICAgIGlmKCB0eXBlb2YgdGltaW5nID09PSAnZnVuY3Rpb24nICkgdGltaW5nID0gdGltaW5nKClcblxuICAgICAgICAgIHNlcS5uZXh0VGltZSA9IHRpbWluZ1xuICAgICAgICB9XG5cbiAgICAgICAgc2VxLnBoYXNlICs9IHJhdGVcblxuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuXG4gICAgICBzZXEudWdlbk5hbWUgPSBzZXEuY2FsbGJhY2sudWdlbk5hbWUgPSAnc2VxXycgKyBzZXEuaWRcbiAgICAgIFxuICAgICAgbGV0IHZhbHVlID0gc2VxLnJhdGVcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggc2VxLCAncmF0ZScsIHtcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gdmFsdWUgfSxcbiAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgIGlmKCB2YWx1ZSAhPT0gdiApIHtcbiAgICAgICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggc2VxIClcbiAgICAgICAgICAgIHZhbHVlID0gdlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHNlcVxuICAgIH1cbiAgfVxuXG4gIFNlcTIuZGVmYXVsdHMgPSB7IHJhdGU6IDEgfVxuXG4gIHJldHVybiBTZXEyLmNyZWF0ZVxuXG59XG5cbiIsImNvbnN0IFF1ZXVlID0gcmVxdWlyZSggJy4uL2V4dGVybmFsL3ByaW9yaXR5cXVldWUuanMnIClcbmNvbnN0IEJpZyAgID0gcmVxdWlyZSggJ2JpZy5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbmxldCBTZXF1ZW5jZXIgPSBwcm9wcyA9PiB7XG4gIGxldCBzZXEgPSB7XG4gICAgX19pc1J1bm5pbmc6ZmFsc2UsXG4gICAga2V5OiBwcm9wcy5rZXksIFxuICAgIHRhcmdldDogIHByb3BzLnRhcmdldCxcbiAgICB2YWx1ZXM6ICBwcm9wcy52YWx1ZXMsXG4gICAgdGltaW5nczogcHJvcHMudGltaW5ncyxcbiAgICBfX3ZhbHVlc1BoYXNlOiAgMCxcbiAgICBfX3RpbWluZ3NQaGFzZTogMCxcbiAgICBwcmlvcml0eTogcHJvcHMucHJpb3JpdHkgPT09IHVuZGVmaW5lZCA/IDAgOiBwcm9wcy5wcmlvcml0eSxcblxuICAgIHRpY2soKSB7XG4gICAgICBsZXQgdmFsdWUgID0gc2VxLnZhbHVlc1sgIHNlcS5fX3ZhbHVlc1BoYXNlKysgICUgc2VxLnZhbHVlcy5sZW5ndGggIF0sXG4gICAgICAgICAgdGltaW5nID0gc2VxLnRpbWluZ3NbIHNlcS5fX3RpbWluZ3NQaGFzZSsrICUgc2VxLnRpbWluZ3MubGVuZ3RoIF1cblxuICAgICAgaWYoIHR5cGVvZiB0aW1pbmcgPT09ICdmdW5jdGlvbicgKSB0aW1pbmcgPSB0aW1pbmcoKVxuXG4gICAgICBpZiggdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIHNlcS50YXJnZXQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdmFsdWUoKVxuICAgICAgfWVsc2UgaWYoIHR5cGVvZiBzZXEudGFyZ2V0WyBzZXEua2V5IF0gPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgIGlmKCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgKSB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdKCB2YWx1ZSApXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyApIHZhbHVlID0gdmFsdWUoKVxuICAgICAgICBzZXEudGFyZ2V0WyBzZXEua2V5IF0gPSB2YWx1ZVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiggc2VxLl9faXNSdW5uaW5nID09PSB0cnVlICkge1xuICAgICAgICBHaWJiZXJpc2guc2NoZWR1bGVyLmFkZCggdGltaW5nLCBzZXEudGljaywgc2VxLnByaW9yaXR5IClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhcnQoIGRlbGF5ID0gMCApIHtcbiAgICAgIHNlcS5fX2lzUnVubmluZyA9IHRydWVcbiAgICAgIEdpYmJlcmlzaC5zY2hlZHVsZXIuYWRkKCBkZWxheSwgc2VxLnRpY2ssIHNlcS5wcmlvcml0eSApXG4gICAgICByZXR1cm4gc2VxXG4gICAgfSxcblxuICAgIHN0b3AoKSB7XG4gICAgICBzZXEuX19pc1J1bm5pbmcgPSBmYWxzZVxuICAgICAgcmV0dXJuIHNlcVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzZXEgXG59XG5cblNlcXVlbmNlci5tYWtlID0gZnVuY3Rpb24oIHZhbHVlcywgdGltaW5ncywgdGFyZ2V0LCBrZXkgKSB7XG4gIHJldHVybiBTZXF1ZW5jZXIoeyB2YWx1ZXMsIHRpbWluZ3MsIHRhcmdldCwga2V5IH0pXG59XG5cbnJldHVybiBTZXF1ZW5jZXJcblxufVxuIiwibGV0IHVnZW4gPSB7XG4gIGZyZWUoKSB7XG4gICAgR2liYmVyaXNoLmdlbmlzaC5nZW4uZnJlZSggdGhpcy5ncmFwaCApXG4gIH0sXG5cbiAgcHJpbnQoKSB7XG4gICAgY29uc29sZS5sb2coIHRoaXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG4gIH0sXG5cbiAgY29ubmVjdCggdGFyZ2V0LCBsZXZlbD0xICkge1xuICAgIGlmKCB0aGlzLmNvbm5lY3RlZCA9PT0gdW5kZWZpbmVkICkgdGhpcy5jb25uZWN0ZWQgPSBbXVxuXG4gICAgbGV0IGlucHV0ID0gbGV2ZWwgPT09IDEgPyB0aGlzIDogR2liYmVyaXNoLmJpbm9wcy5NdWwoIHRoaXMsIGxldmVsIClcblxuICAgIGlmKCB0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwgKSB0YXJnZXQgPSBHaWJiZXJpc2gub3V0cHV0IFxuXG4gICAgaWYoIHRhcmdldC5pbnB1dHMgKVxuICAgICAgdGFyZ2V0LmlucHV0cy5wdXNoKCBpbnB1dCApXG4gICAgZWxzZVxuICAgICAgdGFyZ2V0LmlucHV0ID0gaW5wdXRcblxuICAgIEdpYmJlcmlzaC5kaXJ0eSggdGFyZ2V0IClcblxuICAgIHRoaXMuY29ubmVjdGVkLnB1c2goWyB0YXJnZXQsIGlucHV0IF0pXG4gICAgXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICBkaXNjb25uZWN0KCB0YXJnZXQgKSB7XG4gICAgaWYoIHRhcmdldCA9PT0gdW5kZWZpbmVkICl7XG4gICAgICBmb3IoIGxldCBjb25uZWN0aW9uIG9mIHRoaXMuY29ubmVjdGVkICkge1xuICAgICAgICBjb25uZWN0aW9uWzBdLmRpc2Nvbm5lY3RVZ2VuKCBjb25uZWN0aW9uWzFdIClcbiAgICAgIH1cbiAgICAgIHRoaXMuY29ubmVjdGVkLmxlbmd0aCA9IDBcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSB0aGlzLmNvbm5lY3RlZC5maW5kKCB2ID0+IHZbMF0gPT09IHRhcmdldCApXG4gICAgICB0YXJnZXQuZGlzY29ubmVjdFVnZW4oIGNvbm5lY3Rpb25bMV0gKVxuICAgICAgY29uc3QgdGFyZ2V0SWR4ID0gdGhpcy5jb25uZWN0ZWQuaW5kZXhPZiggY29ubmVjdGlvbiApXG4gICAgICB0aGlzLmNvbm5lY3RlZC5zcGxpY2UoIHRhcmdldElkeCwgMSApXG4gICAgfVxuICB9LFxuXG4gIGNoYWluKCB0YXJnZXQsIGxldmVsPTEgKSB7XG4gICAgdGhpcy5jb25uZWN0KCB0YXJnZXQsbGV2ZWwgKVxuXG4gICAgcmV0dXJuIHRhcmdldFxuICB9LFxuXG4gIF9fcmVkb0dyYXBoKCkge1xuICAgIHRoaXMuX19jcmVhdGVHcmFwaCgpXG4gICAgdGhpcy5jYWxsYmFjayA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmNyZWF0ZUNhbGxiYWNrKCB0aGlzLmdyYXBoLCBHaWJiZXJpc2gubWVtb3J5LCBmYWxzZSwgdHJ1ZSApXG4gICAgdGhpcy5pbnB1dE5hbWVzID0gR2liYmVyaXNoLmdlbmlzaC5nZW4ucGFyYW1ldGVycy5zbGljZSgwKVxuICAgIHRoaXMuY2FsbGJhY2sudWdlbk5hbWUgPSB0aGlzLnVnZW5OYW1lXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gdWdlblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgdWlkID0gMFxuXG4gIGxldCBmYWN0b3J5ID0gZnVuY3Rpb24oIHVnZW4sIGdyYXBoLCBuYW1lLCB2YWx1ZXMsIGNiICkge1xuICAgIHVnZW4uY2FsbGJhY2sgPSBjYiA9PT0gdW5kZWZpbmVkID8gR2liYmVyaXNoLmdlbmlzaC5nZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBHaWJiZXJpc2gubWVtb3J5LCBmYWxzZSwgdHJ1ZSApIDogY2JcblxuICAgIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICAgIHR5cGU6ICd1Z2VuJyxcbiAgICAgIGlkOiBmYWN0b3J5LmdldFVJRCgpLCBcbiAgICAgIHVnZW5OYW1lOiBuYW1lICsgJ18nLFxuICAgICAgZ3JhcGg6IGdyYXBoLFxuICAgICAgaW5wdXROYW1lczogR2liYmVyaXNoLmdlbmlzaC5nZW4ucGFyYW1ldGVycy5zbGljZSgwKSxcbiAgICAgIGlzU3RlcmVvOiBBcnJheS5pc0FycmF5KCBncmFwaCApLFxuICAgICAgZGlydHk6IHRydWVcbiAgICB9KVxuICAgIFxuICAgIHVnZW4udWdlbk5hbWUgKz0gdWdlbi5pZFxuICAgIHVnZW4uY2FsbGJhY2sudWdlbk5hbWUgPSB1Z2VuLnVnZW5OYW1lIC8vIFhYWCBoYWNreVxuXG4gICAgZm9yKCBsZXQgcGFyYW0gb2YgdWdlbi5pbnB1dE5hbWVzICkge1xuICAgICAgaWYoIHBhcmFtID09PSAnbWVtb3J5JyApIGNvbnRpbnVlXG5cbiAgICAgIGxldCB2YWx1ZSA9IHZhbHVlc1sgcGFyYW0gXVxuXG4gICAgICAvLyBUT0RPOiBkbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciBhIHNldHRlcj9cbiAgICAgIGxldCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciggdWdlbiwgcGFyYW0gKSxcbiAgICAgICAgICBzZXR0ZXJcblxuICAgICAgaWYoIGRlc2MgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc2V0dGVyID0gZGVzYy5zZXRcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBwYXJhbSwge1xuICAgICAgICBnZXQoKSB7IHJldHVybiB2YWx1ZSB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgaWYoIHZhbHVlICE9PSB2ICkge1xuICAgICAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB1Z2VuIClcbiAgICAgICAgICAgIGlmKCBzZXR0ZXIgIT09IHVuZGVmaW5lZCApIHNldHRlciggdiApXG4gICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYoIHVnZW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHVnZW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24uZm9yRWFjaCggcHJvcCA9PiB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHVnZW5bIHByb3AgXVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sIHByb3AsIHtcbiAgICAgICAgICBnZXQoKSB7IHJldHVybiB2YWx1ZSB9LFxuICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgIGlmKCB2YWx1ZSAhPT0gdiApIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSB2XG4gICAgICAgICAgICAgIHRoaXMuX19yZWRvR3JhcGgoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0pICAgICAgXG4gICAgfVxuICAgIHJldHVybiB1Z2VuXG4gIH1cblxuICBmYWN0b3J5LmdldFVJRCA9ICgpID0+IHVpZCsrXG5cbiAgcmV0dXJuIGZhY3Rvcnlcbn1cbiIsImxldCBnZW5pc2ggPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxubGV0IHV0aWxpdGllcyA9IHtcbiAgY3JlYXRlQ29udGV4dCgpIHtcbiAgICBsZXQgQUMgPSB0eXBlb2YgQXVkaW9Db250ZXh0ID09PSAndW5kZWZpbmVkJyA/IHdlYmtpdEF1ZGlvQ29udGV4dCA6IEF1ZGlvQ29udGV4dFxuICAgIEdpYmJlcmlzaC5jdHggPSBuZXcgQUMoKVxuICAgIGdlbmlzaC5nZW4uc2FtcGxlcmF0ZSA9IEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZVxuICAgIGdlbmlzaC51dGlsaXRpZXMuY3R4ID0gR2liYmVyaXNoLmN0eFxuXG4gICAgbGV0IHN0YXJ0ID0gKCkgPT4ge1xuICAgICAgaWYoIHR5cGVvZiBBQyAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHN0YXJ0IClcblxuICAgICAgICAgIGlmKCAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKXsgLy8gcmVxdWlyZWQgdG8gc3RhcnQgYXVkaW8gdW5kZXIgaU9TIDZcbiAgICAgICAgICAgIGxldCBteVNvdXJjZSA9IHV0aWxpdGllcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgICAgICAgIG15U291cmNlLmNvbm5lY3QoIHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24gKVxuICAgICAgICAgICAgbXlTb3VyY2Uubm90ZU9uKCAwIClcbiAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfVxuXG4gICAgcmV0dXJuIEdpYmJlcmlzaC5jdHhcbiAgfSxcblxuICBjcmVhdGVTY3JpcHRQcm9jZXNzb3IoKSB7XG4gICAgR2liYmVyaXNoLm5vZGUgPSBHaWJiZXJpc2guY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciggMTAyNCwgMCwgMiApLFxuICAgIEdpYmJlcmlzaC5jbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH0sXG4gICAgR2liYmVyaXNoLmNhbGxiYWNrID0gR2liYmVyaXNoLmNsZWFyRnVuY3Rpb25cblxuICAgIEdpYmJlcmlzaC5ub2RlLm9uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24oIGF1ZGlvUHJvY2Vzc2luZ0V2ZW50ICkge1xuICAgICAgbGV0IGdpYmJlcmlzaCA9IEdpYmJlcmlzaCxcbiAgICAgICAgICBjYWxsYmFjayAgPSBnaWJiZXJpc2guY2FsbGJhY2ssXG4gICAgICAgICAgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyLFxuICAgICAgICAgIHNjaGVkdWxlciA9IEdpYmJlcmlzaC5zY2hlZHVsZXIsXG4gICAgICAgICAgLy9vYmpzID0gZ2liYmVyaXNoLmNhbGxiYWNrVWdlbnMuc2xpY2UoIDAgKSxcbiAgICAgICAgICBsZW5ndGhcblxuICAgICAgbGV0IGxlZnQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDAgKSxcbiAgICAgICAgICByaWdodD0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAxIClcblxuICAgICAgbGV0IGNhbGxiYWNrbGVuZ3RoID0gR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLmxlbmd0aFxuICAgICAgXG4gICAgICBpZiggY2FsbGJhY2tsZW5ndGggIT09IDAgKSB7XG4gICAgICAgIGZvciggbGV0IGk9MDsgaTwgY2FsbGJhY2tsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3NbIGkgXSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYW4ndCBqdXN0IHNldCBsZW5ndGggdG8gMCBhcyBjYWxsYmFja3MgbWlnaHQgYmUgYWRkZWQgZHVyaW5nIGZvciBsb29wLCBzbyBzcGxpY2UgcHJlLWV4aXN0aW5nIGZ1bmN0aW9uc1xuICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3Muc3BsaWNlKCAwLCBjYWxsYmFja2xlbmd0aCApXG4gICAgICB9XG5cbiAgICAgIGZvciAobGV0IHNhbXBsZSA9IDAsIGxlbmd0aCA9IGxlZnQubGVuZ3RoOyBzYW1wbGUgPCBsZW5ndGg7IHNhbXBsZSsrKSB7XG4gICAgICAgIHNjaGVkdWxlci50aWNrKClcblxuICAgICAgICBpZiggZ2liYmVyaXNoLmdyYXBoSXNEaXJ0eSApIHsgXG4gICAgICAgICAgY2FsbGJhY2sgPSBnaWJiZXJpc2guZ2VuZXJhdGVDYWxsYmFjaygpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFhYWCBjYW50IHVzZSBkZXN0cnVjdHVyaW5nLCBiYWJlbCBtYWtlcyBpdCBzb21ldGhpbmcgaW5lZmZpY2llbnQuLi5cbiAgICAgICAgbGV0IG91dCA9IGNhbGxiYWNrLmFwcGx5KCBudWxsLCBnaWJiZXJpc2guY2FsbGJhY2tVZ2VucyApXG5cbiAgICAgICAgbGVmdFsgc2FtcGxlICBdID0gb3V0WzBdXG4gICAgICAgIHJpZ2h0WyBzYW1wbGUgXSA9IG91dFsxXVxuICAgICAgfVxuICAgIH1cblxuICAgIEdpYmJlcmlzaC5ub2RlLmNvbm5lY3QoIEdpYmJlcmlzaC5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgcmV0dXJuIEdpYmJlcmlzaC5ub2RlXG4gIH0sIFxufVxuXG5yZXR1cm4gdXRpbGl0aWVzXG59XG4iLCIvKiBiaWcuanMgdjMuMS4zIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9MSUNFTkNFICovXHJcbjsoZnVuY3Rpb24gKGdsb2JhbCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuICBiaWcuanMgdjMuMS4zXHJcbiAgQSBzbWFsbCwgZmFzdCwgZWFzeS10by11c2UgbGlicmFyeSBmb3IgYXJiaXRyYXJ5LXByZWNpc2lvbiBkZWNpbWFsIGFyaXRobWV0aWMuXHJcbiAgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL1xyXG4gIENvcHlyaWdodCAoYykgMjAxNCBNaWNoYWVsIE1jbGF1Z2hsaW4gPE04Y2g4OGxAZ21haWwuY29tPlxyXG4gIE1JVCBFeHBhdCBMaWNlbmNlXHJcbiovXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogRURJVEFCTEUgREVGQVVMVFMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlcyBiZWxvdyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgc3RhdGVkIHJhbmdlcy5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIG9mIHRoZSByZXN1bHRzIG9mIG9wZXJhdGlvbnNcclxuICAgICAqIGludm9sdmluZyBkaXZpc2lvbjogZGl2IGFuZCBzcXJ0LCBhbmQgcG93IHdpdGggbmVnYXRpdmUgZXhwb25lbnRzLlxyXG4gICAgICovXHJcbiAgICB2YXIgRFAgPSAyMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWF9EUFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSByb3VuZGluZyBtb2RlIHVzZWQgd2hlbiByb3VuZGluZyB0byB0aGUgYWJvdmUgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAwIFRvd2FyZHMgemVybyAoaS5lLiB0cnVuY2F0ZSwgbm8gcm91bmRpbmcpLiAgICAgICAoUk9VTkRfRE9XTilcclxuICAgICAgICAgKiAxIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgcm91bmQgdXAuICAoUk9VTkRfSEFMRl9VUClcclxuICAgICAgICAgKiAyIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG8gZXZlbi4gICAoUk9VTkRfSEFMRl9FVkVOKVxyXG4gICAgICAgICAqIDMgQXdheSBmcm9tIHplcm8uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChST1VORF9VUClcclxuICAgICAgICAgKi9cclxuICAgICAgICBSTSA9IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAsIDEsIDIgb3IgM1xyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSB2YWx1ZSBvZiBEUCBhbmQgQmlnLkRQLlxyXG4gICAgICAgIE1BWF9EUCA9IDFFNiwgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIG1hZ25pdHVkZSBvZiB0aGUgZXhwb25lbnQgYXJndW1lbnQgdG8gdGhlIHBvdyBtZXRob2QuXHJcbiAgICAgICAgTUFYX1BPV0VSID0gMUU2LCAgICAgICAgICAgICAgICAgICAvLyAxIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGJlbmVhdGggd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogLTdcclxuICAgICAgICAgKiAtMTAwMDAwMCBpcyB0aGUgbWluaW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBFX05FRyA9IC03LCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIC0xMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBhYm92ZSB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAyMVxyXG4gICAgICAgICAqIDEwMDAwMDAgaXMgdGhlIG1heGltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICogKFRoaXMgbGltaXQgaXMgbm90IGVuZm9yY2VkIG9yIGNoZWNrZWQuKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfUE9TID0gMjEsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAgICAgLy8gVGhlIHNoYXJlZCBwcm90b3R5cGUgb2JqZWN0LlxyXG4gICAgICAgIFAgPSB7fSxcclxuICAgICAgICBpc1ZhbGlkID0gL14tPyhcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShlWystXT9cXGQrKT8kL2ksXHJcbiAgICAgICAgQmlnO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBiaWdGYWN0b3J5KCkge1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBCaWcgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgbmV3IGluc3RhbmNlIG9mIGEgQmlnIG51bWJlciBvYmplY3QuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfEJpZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIEJpZyhuKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIC8vIEVuYWJsZSBjb25zdHJ1Y3RvciB1c2FnZSB3aXRob3V0IG5ldy5cclxuICAgICAgICAgICAgaWYgKCEoeCBpbnN0YW5jZW9mIEJpZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuID09PSB2b2lkIDAgPyBiaWdGYWN0b3J5KCkgOiBuZXcgQmlnKG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEdXBsaWNhdGUuXHJcbiAgICAgICAgICAgIGlmIChuIGluc3RhbmNlb2YgQmlnKSB7XHJcbiAgICAgICAgICAgICAgICB4LnMgPSBuLnM7XHJcbiAgICAgICAgICAgICAgICB4LmUgPSBuLmU7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBuLmMuc2xpY2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBhcnNlKHgsIG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBSZXRhaW4gYSByZWZlcmVuY2UgdG8gdGhpcyBCaWcgY29uc3RydWN0b3IsIGFuZCBzaGFkb3dcclxuICAgICAgICAgICAgICogQmlnLnByb3RvdHlwZS5jb25zdHJ1Y3RvciB3aGljaCBwb2ludHMgdG8gT2JqZWN0LlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgeC5jb25zdHJ1Y3RvciA9IEJpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJpZy5wcm90b3R5cGUgPSBQO1xyXG4gICAgICAgIEJpZy5EUCA9IERQO1xyXG4gICAgICAgIEJpZy5STSA9IFJNO1xyXG4gICAgICAgIEJpZy5FX05FRyA9IEVfTkVHO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IEVfUE9TO1xyXG5cclxuICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcml2YXRlIGZ1bmN0aW9uc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgQmlnIHggaW4gbm9ybWFsIG9yIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBvciBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIGZvcm1hdC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHRvRSB7bnVtYmVyfSAxICh0b0V4cG9uZW50aWFsKSwgMiAodG9QcmVjaXNpb24pIG9yIHVuZGVmaW5lZCAodG9GaXhlZCkuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGZvcm1hdCh4LCBkcCwgdG9FKSB7XHJcbiAgICAgICAgdmFyIEJpZyA9IHguY29uc3RydWN0b3IsXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgaW5kZXggKG5vcm1hbCBub3RhdGlvbikgb2YgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSBkcCAtICh4ID0gbmV3IEJpZyh4KSkuZSxcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKGMubGVuZ3RoID4gKytkcCkge1xyXG4gICAgICAgICAgICBybmQoeCwgaSwgQmlnLlJNKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICArK2k7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0b0UpIHtcclxuICAgICAgICAgICAgaSA9IGRwO1xyXG5cclxuICAgICAgICAvLyB0b0ZpeGVkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgICAgIC8vIFJlY2FsY3VsYXRlIGkgYXMgeC5lIG1heSBoYXZlIGNoYW5nZWQgaWYgdmFsdWUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IHguZSArIGkgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIHplcm9zP1xyXG4gICAgICAgIGZvciAoOyBjLmxlbmd0aCA8IGk7IGMucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICBpID0geC5lO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIHRvUHJlY2lzaW9uIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhlIG51bWJlciBvZlxyXG4gICAgICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzXHJcbiAgICAgICAgICogbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZSB2YWx1ZSBpbiBub3JtYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZXR1cm4gdG9FID09PSAxIHx8IHRvRSAmJiAoZHAgPD0gaSB8fCBpIDw9IEJpZy5FX05FRykgP1xyXG5cclxuICAgICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgKHgucyA8IDAgJiYgY1swXSA/ICctJyA6ICcnKSArXHJcbiAgICAgICAgICAgIChjLmxlbmd0aCA+IDEgPyBjWzBdICsgJy4nICsgYy5qb2luKCcnKS5zbGljZSgxKSA6IGNbMF0pICtcclxuICAgICAgICAgICAgICAoaSA8IDAgPyAnZScgOiAnZSsnKSArIGlcclxuXHJcbiAgICAgICAgICAvLyBOb3JtYWwgbm90YXRpb24uXHJcbiAgICAgICAgICA6IHgudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFBhcnNlIHRoZSBudW1iZXIgb3Igc3RyaW5nIHZhbHVlIHBhc3NlZCB0byBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IEEgQmlnIG51bWJlciBpbnN0YW5jZS5cclxuICAgICAqIG4ge251bWJlcnxzdHJpbmd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcGFyc2UoeCwgbikge1xyXG4gICAgICAgIHZhciBlLCBpLCBuTDtcclxuXHJcbiAgICAgICAgLy8gTWludXMgemVybz9cclxuICAgICAgICBpZiAobiA9PT0gMCAmJiAxIC8gbiA8IDApIHtcclxuICAgICAgICAgICAgbiA9ICctMCc7XHJcblxyXG4gICAgICAgIC8vIEVuc3VyZSBuIGlzIHN0cmluZyBhbmQgY2hlY2sgdmFsaWRpdHkuXHJcbiAgICAgICAgfSBlbHNlIGlmICghaXNWYWxpZC50ZXN0KG4gKz0gJycpKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbi5cclxuICAgICAgICB4LnMgPSBuLmNoYXJBdCgwKSA9PSAnLScgPyAobiA9IG4uc2xpY2UoMSksIC0xKSA6IDE7XHJcblxyXG4gICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgaWYgKChlID0gbi5pbmRleE9mKCcuJykpID4gLTEpIHtcclxuICAgICAgICAgICAgbiA9IG4ucmVwbGFjZSgnLicsICcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIGZvcm0/XHJcbiAgICAgICAgaWYgKChpID0gbi5zZWFyY2goL2UvaSkpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxyXG4gICAgICAgICAgICBpZiAoZSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGUgPSBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUgKz0gK24uc2xpY2UoaSArIDEpO1xyXG4gICAgICAgICAgICBuID0gbi5zdWJzdHJpbmcoMCwgaSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEludGVnZXIuXHJcbiAgICAgICAgICAgIGUgPSBuLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IG4uY2hhckF0KGkpID09ICcwJzsgaSsrKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA9PSAobkwgPSBuLmxlbmd0aCkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgIHguYyA9IFsgeC5lID0gMCBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyBuLmNoYXJBdCgtLW5MKSA9PSAnMCc7KSB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHguZSA9IGUgLSBpIC0gMTtcclxuICAgICAgICAgICAgeC5jID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBhcnJheSBvZiBkaWdpdHMgd2l0aG91dCBsZWFkaW5nL3RyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKGUgPSAwOyBpIDw9IG5MOyB4LmNbZSsrXSA9ICtuLmNoYXJBdChpKyspKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUm91bmQgQmlnIHggdG8gYSBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBDYWxsZWQgYnkgZGl2LCBzcXJ0IGFuZCByb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gcm91bmQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiBybSB7bnVtYmVyfSAwLCAxLCAyIG9yIDMgKERPV04sIEhBTEZfVVAsIEhBTEZfRVZFTiwgVVApXHJcbiAgICAgKiBbbW9yZV0ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHJlc3VsdCBvZiBkaXZpc2lvbiB3YXMgdHJ1bmNhdGVkLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBybmQoeCwgZHAsIHJtLCBtb3JlKSB7XHJcbiAgICAgICAgdmFyIHUsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5lICsgZHAgKyAxO1xyXG5cclxuICAgICAgICBpZiAocm0gPT09IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHhjW2ldIGlzIHRoZSBkaWdpdCBhZnRlciB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID49IDU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChybSA9PT0gMikge1xyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPiA1IHx8IHhjW2ldID09IDUgJiZcclxuICAgICAgICAgICAgICAobW9yZSB8fCBpIDwgMCB8fCB4Y1tpICsgMV0gIT09IHUgfHwgeGNbaSAtIDFdICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChybSA9PT0gMykge1xyXG4gICAgICAgICAgICBtb3JlID0gbW9yZSB8fCB4Y1tpXSAhPT0gdSB8fCBpIDwgMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtb3JlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAocm0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKCchQmlnLlJNIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA8IDEgfHwgIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobW9yZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIDEsIDAuMSwgMC4wMSwgMC4wMDEsIDAuMDAwMSBldGMuXHJcbiAgICAgICAgICAgICAgICB4LmUgPSAtZHA7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgYW55IGRpZ2l0cyBhZnRlciB0aGUgcmVxdWlyZWQgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICAgIHhjLmxlbmd0aCA9IGktLTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJvdW5kIHVwP1xyXG4gICAgICAgICAgICBpZiAobW9yZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJvdW5kaW5nIHVwIG1heSBtZWFuIHRoZSBwcmV2aW91cyBkaWdpdCBoYXMgdG8gYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgICAgIGZvciAoOyArK3hjW2ldID4gOTspIHtcclxuICAgICAgICAgICAgICAgICAgICB4Y1tpXSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsreC5lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4Yy51bnNoaWZ0KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKGkgPSB4Yy5sZW5ndGg7ICF4Y1stLWldOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRocm93IGEgQmlnRXJyb3IuXHJcbiAgICAgKlxyXG4gICAgICogbWVzc2FnZSB7c3RyaW5nfSBUaGUgZXJyb3IgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdGhyb3dFcnIobWVzc2FnZSkge1xyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgICAgICAgZXJyLm5hbWUgPSAnQmlnRXJyb3InO1xyXG5cclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByb3RvdHlwZS9pbnN0YW5jZSBtZXRob2RzXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGlzIEJpZy5cclxuICAgICAqL1xyXG4gICAgUC5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKTtcclxuICAgICAgICB4LnMgPSAxO1xyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5cclxuICAgICAqIDEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiAtMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSwgb3JcclxuICAgICAqIDAgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHZhbHVlLlxyXG4gICAgKi9cclxuICAgIFAuY21wID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeE5lZyxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9ICh5ID0gbmV3IHguY29uc3RydWN0b3IoeSkpLmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGogPSB5LnMsXHJcbiAgICAgICAgICAgIGsgPSB4LmUsXHJcbiAgICAgICAgICAgIGwgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAheGNbMF0gPyAheWNbMF0gPyAwIDogLWogOiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChpICE9IGopIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhOZWcgPSBpIDwgMDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKGsgIT0gbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IC0xO1xyXG4gICAgICAgIGogPSAoayA9IHhjLmxlbmd0aCkgPCAobCA9IHljLmxlbmd0aCkgPyBrIDogbDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICBmb3IgKDsgKytpIDwgajspIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4Y1tpXSAhPSB5Y1tpXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHhjW2ldID4geWNbaV0gXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGxlbmd0aHMuXHJcbiAgICAgICAgcmV0dXJuIGsgPT0gbCA/IDAgOiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgZGl2aWRlZCBieSB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICovXHJcbiAgICBQLmRpdiA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICAvLyBkaXZpZGVuZFxyXG4gICAgICAgICAgICBkdmQgPSB4LmMsXHJcbiAgICAgICAgICAgIC8vZGl2aXNvclxyXG4gICAgICAgICAgICBkdnMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIHMgPSB4LnMgPT0geS5zID8gMSA6IC0xLFxyXG4gICAgICAgICAgICBkcCA9IEJpZy5EUDtcclxuXHJcbiAgICAgICAgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIUJpZy5EUCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciAwP1xyXG4gICAgICAgIGlmICghZHZkWzBdIHx8ICFkdnNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGJvdGggYXJlIDAsIHRocm93IE5hTlxyXG4gICAgICAgICAgICBpZiAoZHZkWzBdID09IGR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgZHZzIGlzIDAsIHRocm93ICstSW5maW5pdHkuXHJcbiAgICAgICAgICAgIGlmICghZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihzIC8gMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGR2ZCBpcyAwLCByZXR1cm4gKy0wLlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyhzICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZHZzTCwgZHZzVCwgbmV4dCwgY21wLCByZW1JLCB1LFxyXG4gICAgICAgICAgICBkdnNaID0gZHZzLnNsaWNlKCksXHJcbiAgICAgICAgICAgIGR2ZEkgPSBkdnNMID0gZHZzLmxlbmd0aCxcclxuICAgICAgICAgICAgZHZkTCA9IGR2ZC5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHJlbWFpbmRlclxyXG4gICAgICAgICAgICByZW0gPSBkdmQuc2xpY2UoMCwgZHZzTCksXHJcbiAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyBxdW90aWVudFxyXG4gICAgICAgICAgICBxID0geSxcclxuICAgICAgICAgICAgcWMgPSBxLmMgPSBbXSxcclxuICAgICAgICAgICAgcWkgPSAwLFxyXG4gICAgICAgICAgICBkaWdpdHMgPSBkcCArIChxLmUgPSB4LmUgLSB5LmUpICsgMTtcclxuXHJcbiAgICAgICAgcS5zID0gcztcclxuICAgICAgICBzID0gZGlnaXRzIDwgMCA/IDAgOiBkaWdpdHM7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB2ZXJzaW9uIG9mIGRpdmlzb3Igd2l0aCBsZWFkaW5nIHplcm8uXHJcbiAgICAgICAgZHZzWi51bnNoaWZ0KDApO1xyXG5cclxuICAgICAgICAvLyBBZGQgemVyb3MgdG8gbWFrZSByZW1haW5kZXIgYXMgbG9uZyBhcyBkaXZpc29yLlxyXG4gICAgICAgIGZvciAoOyByZW1MKysgPCBkdnNMOyByZW0ucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZG8ge1xyXG5cclxuICAgICAgICAgICAgLy8gJ25leHQnIGlzIGhvdyBtYW55IHRpbWVzIHRoZSBkaXZpc29yIGdvZXMgaW50byBjdXJyZW50IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgZm9yIChuZXh0ID0gMDsgbmV4dCA8IDEwOyBuZXh0KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb21wYXJlIGRpdmlzb3IgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChkdnNMICE9IChyZW1MID0gcmVtLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNMID4gcmVtTCA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAocmVtSSA9IC0xLCBjbXAgPSAwOyArK3JlbUkgPCBkdnNMOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGR2c1tyZW1JXSAhPSByZW1bcmVtSV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c1tyZW1JXSA+IHJlbVtyZW1JXSA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCByZW1haW5kZXIsIHN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoY21wIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1haW5kZXIgY2FuJ3QgYmUgbW9yZSB0aGFuIDEgZGlnaXQgbG9uZ2VyIHRoYW4gZGl2aXNvci5cclxuICAgICAgICAgICAgICAgICAgICAvLyBFcXVhbGlzZSBsZW5ndGhzIHVzaW5nIGRpdmlzb3Igd2l0aCBleHRyYSBsZWFkaW5nIHplcm8/XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChkdnNUID0gcmVtTCA9PSBkdnNMID8gZHZzIDogZHZzWjsgcmVtTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1bLS1yZW1MXSA8IGR2c1RbcmVtTF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbUkgPSByZW1MO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoOyByZW1JICYmICFyZW1bLS1yZW1JXTsgcmVtW3JlbUldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLS1yZW1bcmVtSV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gKz0gMTA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdIC09IGR2c1RbcmVtTF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoOyAhcmVtWzBdOyByZW0uc2hpZnQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgJ25leHQnIGRpZ2l0IHRvIHRoZSByZXN1bHQgYXJyYXkuXHJcbiAgICAgICAgICAgIHFjW3FpKytdID0gY21wID8gbmV4dCA6ICsrbmV4dDtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBpZiAocmVtWzBdICYmIGNtcCkge1xyXG4gICAgICAgICAgICAgICAgcmVtW3JlbUxdID0gZHZkW2R2ZEldIHx8IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZW0gPSBbIGR2ZFtkdmRJXSBdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gd2hpbGUgKChkdmRJKysgPCBkdmRMIHx8IHJlbVswXSAhPT0gdSkgJiYgcy0tKTtcclxuXHJcbiAgICAgICAgLy8gTGVhZGluZyB6ZXJvPyBEbyBub3QgcmVtb3ZlIGlmIHJlc3VsdCBpcyBzaW1wbHkgemVybyAocWkgPT0gMSkuXHJcbiAgICAgICAgaWYgKCFxY1swXSAmJiBxaSAhPSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGVyZSBjYW4ndCBiZSBtb3JlIHRoYW4gb25lIHplcm8uXHJcbiAgICAgICAgICAgIHFjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIHEuZS0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKHFpID4gZGlnaXRzKSB7XHJcbiAgICAgICAgICAgIHJuZChxLCBkcCwgQmlnLlJNLCByZW1bMF0gIT09IHUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmVxID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuY21wKHkpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHQgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1pbnVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuc3ViID0gUC5taW51cyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGksIGosIHQsIHhMVHksXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgcmV0dXJuIHgucGx1cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4YyA9IHguYy5zbGljZSgpLFxyXG4gICAgICAgICAgICB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeWMgPSB5LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8gKHkucyA9IC1iLCB5KSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggaXMgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeExUeSA9IGEgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yIChiID0gYTsgYi0tOyB0LnB1c2goMCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRXhwb25lbnRzIGVxdWFsLiBDaGVjayBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICAgICAgaiA9ICgoeExUeSA9IHhjLmxlbmd0aCA8IHljLmxlbmd0aCkgPyB4YyA6IHljKS5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGEgPSBiID0gMDsgYiA8IGo7IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh4Y1tiXSAhPSB5Y1tiXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHhMVHkgPSB4Y1tiXSA8IHljW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB4IDwgeT8gUG9pbnQgeGMgdG8gdGhlIGFycmF5IG9mIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIGlmICh4TFR5KSB7XHJcbiAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB0O1xyXG4gICAgICAgICAgICB5LnMgPSAteS5zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBBcHBlbmQgemVyb3MgdG8geGMgaWYgc2hvcnRlci4gTm8gbmVlZCB0byBhZGQgemVyb3MgdG8geWMgaWYgc2hvcnRlclxyXG4gICAgICAgICAqIGFzIHN1YnRyYWN0aW9uIG9ubHkgbmVlZHMgdG8gc3RhcnQgYXQgeWMubGVuZ3RoLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlmICgoIGIgPSAoaiA9IHljLmxlbmd0aCkgLSAoaSA9IHhjLmxlbmd0aCkgKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoOyBiLS07IHhjW2krK10gPSAwKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN1YnRyYWN0IHljIGZyb20geGMuXHJcbiAgICAgICAgZm9yIChiID0gaTsgaiA+IGE7KXtcclxuXHJcbiAgICAgICAgICAgIGlmICh4Y1stLWpdIDwgeWNbal0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSBqOyBpICYmICF4Y1stLWldOyB4Y1tpXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC0teGNbaV07XHJcbiAgICAgICAgICAgICAgICB4Y1tqXSArPSAxMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4Y1tqXSAtPSB5Y1tqXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKDsgeGNbLS1iXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgZm9yICg7IHhjWzBdID09PSAwOykge1xyXG4gICAgICAgICAgICB4Yy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAtLXllO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gbiAtIG4gPSArMFxyXG4gICAgICAgICAgICB5LnMgPSAxO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzdWx0IG11c3QgYmUgemVyby5cclxuICAgICAgICAgICAgeGMgPSBbeWUgPSAwXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtb2R1bG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5tb2QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB5R1R4LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgaWYgKCF5LmNbMF0pIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHgucyA9IHkucyA9IDE7XHJcbiAgICAgICAgeUdUeCA9IHkuY21wKHgpID09IDE7XHJcbiAgICAgICAgeC5zID0gYTtcclxuICAgICAgICB5LnMgPSBiO1xyXG5cclxuICAgICAgICBpZiAoeUdUeCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGEgPSBCaWcuRFA7XHJcbiAgICAgICAgYiA9IEJpZy5STTtcclxuICAgICAgICBCaWcuRFAgPSBCaWcuUk0gPSAwO1xyXG4gICAgICAgIHggPSB4LmRpdih5KTtcclxuICAgICAgICBCaWcuRFAgPSBhO1xyXG4gICAgICAgIEJpZy5STSA9IGI7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbnVzKCB4LnRpbWVzKHkpICk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcGx1cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLmFkZCA9IFAucGx1cyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHQsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgcmV0dXJuIHgubWludXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZSxcclxuICAgICAgICAgICAgeWMgPSB5LmM7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyB5IDogbmV3IEJpZyh4Y1swXSA/IHggOiBhICogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhjID0geGMuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgLy8gTm90ZTogRmFzdGVyIHRvIHVzZSByZXZlcnNlIHRoZW4gZG8gdW5zaGlmdHMuXHJcbiAgICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoYSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKDsgYS0tOyB0LnB1c2goMCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFBvaW50IHhjIHRvIHRoZSBsb25nZXIgYXJyYXkuXHJcbiAgICAgICAgaWYgKHhjLmxlbmd0aCAtIHljLmxlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGEgPSB5Yy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogT25seSBzdGFydCBhZGRpbmcgYXQgeWMubGVuZ3RoIC0gMSBhcyB0aGUgZnVydGhlciBkaWdpdHMgb2YgeGMgY2FuIGJlXHJcbiAgICAgICAgICogbGVmdCBhcyB0aGV5IGFyZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmb3IgKGIgPSAwOyBhOykge1xyXG4gICAgICAgICAgICBiID0gKHhjWy0tYV0gPSB4Y1thXSArIHljW2FdICsgYikgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIHhjW2FdICU9IDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm8gbmVlZCB0byBjaGVjayBmb3IgemVybywgYXMgK3ggKyAreSAhPSAwICYmIC14ICsgLXkgIT0gMFxyXG5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICB4Yy51bnNoaWZ0KGIpO1xyXG4gICAgICAgICAgICArK3llO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGEgPSB4Yy5sZW5ndGg7IHhjWy0tYV0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByYWlzZWQgdG8gdGhlIHBvd2VyIG4uXHJcbiAgICAgKiBJZiBuIGlzIG5lZ2F0aXZlLCByb3VuZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBuIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfUE9XRVIgdG8gTUFYX1BPV0VSIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC5wb3cgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgb25lID0gbmV3IHguY29uc3RydWN0b3IoMSksXHJcbiAgICAgICAgICAgIHkgPSBvbmUsXHJcbiAgICAgICAgICAgIGlzTmVnID0gbiA8IDA7XHJcblxyXG4gICAgICAgIGlmIChuICE9PSB+fm4gfHwgbiA8IC1NQVhfUE9XRVIgfHwgbiA+IE1BWF9QT1dFUikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXBvdyEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG4gPSBpc05lZyA/IC1uIDogbjtcclxuXHJcbiAgICAgICAgZm9yICg7Oykge1xyXG5cclxuICAgICAgICAgICAgaWYgKG4gJiAxKSB7XHJcbiAgICAgICAgICAgICAgICB5ID0geS50aW1lcyh4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuID4+PSAxO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4ID0geC50aW1lcyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpc05lZyA/IG9uZS5kaXYoeSkgOiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gYVxyXG4gICAgICogbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogSWYgZHAgaXMgbm90IHNwZWNpZmllZCwgcm91bmQgdG8gMCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAqIElmIHJtIGlzIG5vdCBzcGVjaWZpZWQsIHVzZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIDAsIDEsIDIgb3IgMyAoUk9VTkRfRE9XTiwgUk9VTkRfSEFMRl9VUCwgUk9VTkRfSEFMRl9FVkVOLCBST1VORF9VUClcclxuICAgICAqL1xyXG4gICAgUC5yb3VuZCA9IGZ1bmN0aW9uIChkcCwgcm0pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXJvdW5kIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBybmQoeCA9IG5ldyBCaWcoeCksIGRwLCBybSA9PSBudWxsID8gQmlnLlJNIDogcm0pO1xyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcsXHJcbiAgICAgKiByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbCBwbGFjZXMgdXNpbmdcclxuICAgICAqIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICovXHJcbiAgICBQLnNxcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVzdGltYXRlLCByLCBhcHByb3gsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgZSA9IHguZSxcclxuICAgICAgICAgICAgaGFsZiA9IG5ldyBCaWcoJzAuNScpO1xyXG5cclxuICAgICAgICAvLyBaZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBuZWdhdGl2ZSwgdGhyb3cgTmFOLlxyXG4gICAgICAgIGlmIChpIDwgMCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXN0aW1hdGUuXHJcbiAgICAgICAgaSA9IE1hdGguc3FydCh4LnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBNYXRoLnNxcnQgdW5kZXJmbG93L292ZXJmbG93P1xyXG4gICAgICAgIC8vIFBhc3MgeCB0byBNYXRoLnNxcnQgYXMgaW50ZWdlciwgdGhlbiBhZGp1c3QgdGhlIHJlc3VsdCBleHBvbmVudC5cclxuICAgICAgICBpZiAoaSA9PT0gMCB8fCBpID09PSAxIC8gMCkge1xyXG4gICAgICAgICAgICBlc3RpbWF0ZSA9IHhjLmpvaW4oJycpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEoZXN0aW1hdGUubGVuZ3RoICsgZSAmIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBlc3RpbWF0ZSArPSAnMCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHIgPSBuZXcgQmlnKCBNYXRoLnNxcnQoZXN0aW1hdGUpLnRvU3RyaW5nKCkgKTtcclxuICAgICAgICAgICAgci5lID0gKChlICsgMSkgLyAyIHwgMCkgLSAoZSA8IDAgfHwgZSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIgPSBuZXcgQmlnKGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gci5lICsgKEJpZy5EUCArPSA0KTtcclxuXHJcbiAgICAgICAgLy8gTmV3dG9uLVJhcGhzb24gaXRlcmF0aW9uLlxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgYXBwcm94ID0gcjtcclxuICAgICAgICAgICAgciA9IGhhbGYudGltZXMoIGFwcHJveC5wbHVzKCB4LmRpdihhcHByb3gpICkgKTtcclxuICAgICAgICB9IHdoaWxlICggYXBwcm94LmMuc2xpY2UoMCwgaSkuam9pbignJykgIT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgci5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICk7XHJcblxyXG4gICAgICAgIHJuZChyLCBCaWcuRFAgLT0gNCwgQmlnLlJNKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgdGltZXMgdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5tdWwgPSBQLnRpbWVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgYyxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgYSA9IHhjLmxlbmd0aCxcclxuICAgICAgICAgICAgYiA9IHljLmxlbmd0aCxcclxuICAgICAgICAgICAgaSA9IHguZSxcclxuICAgICAgICAgICAgaiA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24gb2YgcmVzdWx0LlxyXG4gICAgICAgIHkucyA9IHgucyA9PSB5LnMgPyAxIDogLTE7XHJcblxyXG4gICAgICAgIC8vIFJldHVybiBzaWduZWQgMCBpZiBlaXRoZXIgMC5cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh5LnMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgZXhwb25lbnQgb2YgcmVzdWx0IGFzIHguZSArIHkuZS5cclxuICAgICAgICB5LmUgPSBpICsgajtcclxuXHJcbiAgICAgICAgLy8gSWYgYXJyYXkgeGMgaGFzIGZld2VyIGRpZ2l0cyB0aGFuIHljLCBzd2FwIHhjIGFuZCB5YywgYW5kIGxlbmd0aHMuXHJcbiAgICAgICAgaWYgKGEgPCBiKSB7XHJcbiAgICAgICAgICAgIGMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB5YztcclxuICAgICAgICAgICAgeWMgPSBjO1xyXG4gICAgICAgICAgICBqID0gYTtcclxuICAgICAgICAgICAgYSA9IGI7XHJcbiAgICAgICAgICAgIGIgPSBqO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBjb2VmZmljaWVudCBhcnJheSBvZiByZXN1bHQgd2l0aCB6ZXJvcy5cclxuICAgICAgICBmb3IgKGMgPSBuZXcgQXJyYXkoaiA9IGEgKyBiKTsgai0tOyBjW2pdID0gMCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTXVsdGlwbHkuXHJcblxyXG4gICAgICAgIC8vIGkgaXMgaW5pdGlhbGx5IHhjLmxlbmd0aC5cclxuICAgICAgICBmb3IgKGkgPSBiOyBpLS07KSB7XHJcbiAgICAgICAgICAgIGIgPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gYSBpcyB5Yy5sZW5ndGguXHJcbiAgICAgICAgICAgIGZvciAoaiA9IGEgKyBpOyBqID4gaTspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDdXJyZW50IHN1bSBvZiBwcm9kdWN0cyBhdCB0aGlzIGRpZ2l0IHBvc2l0aW9uLCBwbHVzIGNhcnJ5LlxyXG4gICAgICAgICAgICAgICAgYiA9IGNbal0gKyB5Y1tpXSAqIHhjW2ogLSBpIC0gMV0gKyBiO1xyXG4gICAgICAgICAgICAgICAgY1tqLS1dID0gYiAlIDEwO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNhcnJ5XHJcbiAgICAgICAgICAgICAgICBiID0gYiAvIDEwIHwgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjW2pdID0gKGNbal0gKyBiKSAlIDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5jcmVtZW50IHJlc3VsdCBleHBvbmVudCBpZiB0aGVyZSBpcyBhIGZpbmFsIGNhcnJ5LlxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgICsreS5lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBsZWFkaW5nIHplcm8uXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgIGMuc2hpZnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSBjLmxlbmd0aDsgIWNbLS1pXTsgYy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICB5LmMgPSBjO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZy5cclxuICAgICAqIFJldHVybiBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGlzIEJpZyBoYXMgYSBwb3NpdGl2ZSBleHBvbmVudCBlcXVhbCB0b1xyXG4gICAgICogb3IgZ3JlYXRlciB0aGFuIEJpZy5FX1BPUywgb3IgYSBuZWdhdGl2ZSBleHBvbmVudCBlcXVhbCB0byBvciBsZXNzIHRoYW5cclxuICAgICAqIEJpZy5FX05FRy5cclxuICAgICAqL1xyXG4gICAgUC50b1N0cmluZyA9IFAudmFsdWVPZiA9IFAudG9KU09OID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgZSA9IHguZSxcclxuICAgICAgICAgICAgc3RyID0geC5jLmpvaW4oJycpLFxyXG4gICAgICAgICAgICBzdHJMID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24/XHJcbiAgICAgICAgaWYgKGUgPD0gQmlnLkVfTkVHIHx8IGUgPj0gQmlnLkVfUE9TKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAoc3RyTCA+IDEgPyAnLicgKyBzdHIuc2xpY2UoMSkgOiAnJykgK1xyXG4gICAgICAgICAgICAgIChlIDwgMCA/ICdlJyA6ICdlKycpICsgZTtcclxuXHJcbiAgICAgICAgLy8gTmVnYXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7ICsrZTsgc3RyID0gJzAnICsgc3RyKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RyID0gJzAuJyArIHN0cjtcclxuXHJcbiAgICAgICAgLy8gUG9zaXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgfSBlbHNlIGlmIChlID4gMCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCsrZSA+IHN0ckwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGUgLT0gc3RyTDsgZS0tIDsgc3RyICs9ICcwJykge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUgPCBzdHJMKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIuc2xpY2UoMCwgZSkgKyAnLicgKyBzdHIuc2xpY2UoZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnQgemVyby5cclxuICAgICAgICB9IGVsc2UgaWYgKHN0ckwgPiAxKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBdm9pZCAnLTAnXHJcbiAgICAgICAgcmV0dXJuIHgucyA8IDAgJiYgeC5jWzBdID8gJy0nICsgc3RyIDogc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqIElmIHRvRXhwb25lbnRpYWwsIHRvRml4ZWQsIHRvUHJlY2lzaW9uIGFuZCBmb3JtYXQgYXJlIG5vdCByZXF1aXJlZCB0aGV5XHJcbiAgICAgKiBjYW4gc2FmZWx5IGJlIGNvbW1lbnRlZC1vdXQgb3IgZGVsZXRlZC4gTm8gcmVkdW5kYW50IGNvZGUgd2lsbCBiZSBsZWZ0LlxyXG4gICAgICogZm9ybWF0IGlzIHVzZWQgb25seSBieSB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkIGFuZCB0b1ByZWNpc2lvbi5cclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIGFuZCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHVzaW5nXHJcbiAgICAgKiBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9FeHBvbmVudGlhbCA9IGZ1bmN0aW9uIChkcCkge1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IHRoaXMuYy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9FeHAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIGRwLCAxKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBub3JtYWwgbm90YXRpb25cclxuICAgICAqIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIGFuZCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHVzaW5nIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0ZpeGVkID0gZnVuY3Rpb24gKGRwKSB7XHJcbiAgICAgICAgdmFyIHN0cixcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIG5lZyA9IEJpZy5FX05FRyxcclxuICAgICAgICAgICAgcG9zID0gQmlnLkVfUE9TO1xyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBwb3NzaWJpbGl0eSBvZiBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICBCaWcuRV9ORUcgPSAtKEJpZy5FX1BPUyA9IDEgLyAwKTtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgc3RyID0geC50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgPT09IH5+ZHAgJiYgZHAgPj0gMCAmJiBkcCA8PSBNQVhfRFApIHtcclxuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHgsIHguZSArIGRwKTtcclxuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgpIGlzICcwJywgYnV0ICgtMC4xKS50b0ZpeGVkKCkgaXMgJy0wJy5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKDEpIGlzICcwLjAnLCBidXQgKC0wLjAxKS50b0ZpeGVkKDEpIGlzICctMC4wJy5cclxuICAgICAgICAgICAgaWYgKHgucyA8IDAgJiYgeC5jWzBdICYmIHN0ci5pbmRleE9mKCctJykgPCAwKSB7XHJcbiAgICAgICAgLy9FLmcuIC0wLjUgaWYgcm91bmRlZCB0byAtMCB3aWxsIGNhdXNlIHRvU3RyaW5nIHRvIG9taXQgdGhlIG1pbnVzIHNpZ24uXHJcbiAgICAgICAgICAgICAgICBzdHIgPSAnLScgKyBzdHI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgQmlnLkVfTkVHID0gbmVnO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IHBvcztcclxuXHJcbiAgICAgICAgaWYgKCFzdHIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0ZpeCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBzZFxyXG4gICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIEJpZy5STS4gVXNlIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHNkIGlzIGxlc3NcclxuICAgICAqIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHMgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZVxyXG4gICAgICogdmFsdWUgaW4gbm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIHNkIHtudW1iZXJ9IEludGVnZXIsIDEgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b1ByZWNpc2lvbiA9IGZ1bmN0aW9uIChzZCkge1xyXG5cclxuICAgICAgICBpZiAoc2QgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2QgIT09IH5+c2QgfHwgc2QgPCAxIHx8IHNkID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9QcmUhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIHNkIC0gMSwgMik7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyBFeHBvcnRcclxuXHJcblxyXG4gICAgQmlnID0gYmlnRmFjdG9yeSgpO1xyXG5cclxuICAgIC8vQU1ELlxyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCaWc7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgLy8gTm9kZSBhbmQgb3RoZXIgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLlxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gQmlnO1xyXG5cclxuICAgIC8vQnJvd3Nlci5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZ2xvYmFsLkJpZyA9IEJpZztcclxuICAgIH1cclxufSkodGhpcyk7XHJcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdhYnMnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLmFicykpO1xuXG4gICAgICBvdXQgPSAnZ2VuLmFicyggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWJzKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgYWJzID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgYWJzLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gYWJzO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2FjY3VtJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keSA9IHZvaWQgMDtcblxuICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF0gPSB0aGlzLmluaXRpYWxWYWx1ZTtcblxuICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sICdtZW1vcnlbJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICddJyk7XG5cbiAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgdGhpcykpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keV07XG4gIH0sXG4gIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhfbmFtZSwgX2luY3IsIF9yZXNldCwgdmFsdWVSZWYpIHtcbiAgICB2YXIgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJyc7XG5cbiAgICAvKiB0aHJlZSBkaWZmZXJlbnQgbWV0aG9kcyBvZiB3cmFwcGluZywgdGhpcmQgaXMgbW9zdCBleHBlbnNpdmU6XG4gICAgICpcbiAgICAgKiAxOiByYW5nZSB7MCwxfTogeSA9IHggLSAoeCB8IDApXG4gICAgICogMjogbG9nMih0aGlzLm1heCkgPT0gaW50ZWdlcjogeSA9IHggJiAodGhpcy5tYXggLSAxKVxuICAgICAqIDM6IGFsbCBvdGhlcnM6IGlmKCB4ID49IHRoaXMubWF4ICkgeSA9IHRoaXMubWF4IC14XG4gICAgICpcbiAgICAgKi9cblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiAoISh0eXBlb2YgdGhpcy5pbnB1dHNbMV0gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzFdIDwgMSkpIHtcbiAgICAgIG91dCArPSAnICBpZiggJyArIF9yZXNldCArICcgPj0xICkgJyArIHZhbHVlUmVmICsgJyA9ICcgKyB0aGlzLmluaXRpYWxWYWx1ZSArICdcXG5cXG4nO1xuICAgIH1cblxuICAgIG91dCArPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdmFsdWVSZWYgKyAnO1xcbic7XG5cbiAgICBpZiAodGhpcy5zaG91bGRXcmFwID09PSBmYWxzZSAmJiB0aGlzLnNob3VsZENsYW1wID09PSB0cnVlKSB7XG4gICAgICBvdXQgKz0gJyAgaWYoICcgKyB2YWx1ZVJlZiArICcgPCAnICsgdGhpcy5tYXggKyAnICkgJyArIHZhbHVlUmVmICsgJyArPSAnICsgX2luY3IgKyAnXFxuJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9ICcgICcgKyB2YWx1ZVJlZiArICcgKz0gJyArIF9pbmNyICsgJ1xcbic7IC8vIHN0b3JlIG91dHB1dCB2YWx1ZSBiZWZvcmUgYWNjdW11bGF0aW5nICBcbiAgICB9XG5cbiAgICBpZiAodGhpcy5tYXggIT09IEluZmluaXR5ICYmIHRoaXMuc2hvdWxkV3JhcCkgd3JhcCArPSAnICBpZiggJyArIHZhbHVlUmVmICsgJyA+PSAnICsgdGhpcy5tYXggKyAnICkgJyArIHZhbHVlUmVmICsgJyAtPSAnICsgZGlmZiArICdcXG4nO1xuICAgIGlmICh0aGlzLm1pbiAhPT0gLUluZmluaXR5ICYmIHRoaXMuc2hvdWxkV3JhcCkgd3JhcCArPSAnICBpZiggJyArIHZhbHVlUmVmICsgJyA8ICcgKyB0aGlzLm1pbiArICcgKSAnICsgdmFsdWVSZWYgKyAnICs9ICcgKyBkaWZmICsgJ1xcblxcbic7XG5cbiAgICAvL2lmKCB0aGlzLm1pbiA9PT0gMCAmJiB0aGlzLm1heCA9PT0gMSApIHsgXG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAtICgke3ZhbHVlUmVmfSB8IDApXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1pbiA9PT0gMCAmJiAoIE1hdGgubG9nMiggdGhpcy5tYXggKSB8IDAgKSA9PT0gTWF0aC5sb2cyKCB0aGlzLm1heCApICkge1xuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gJiAoJHt0aGlzLm1heH0gLSAxKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICl7XG4gICAgLy8gIHdyYXAgPSBgICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gKSAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XFxuXFxuYFxuICAgIC8vfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcDtcblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluY3IpIHtcbiAgdmFyIHJlc2V0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuICB2YXIgcHJvcGVydGllcyA9IGFyZ3VtZW50c1syXTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IG1pbjogMCwgbWF4OiAxLCBzaG91bGRXcmFwOiB0cnVlLCBzaG91bGRDbGFtcDogZmFsc2UgfTtcblxuICBpZiAocHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBwcm9wZXJ0aWVzKTtcblxuICBpZiAoZGVmYXVsdHMuaW5pdGlhbFZhbHVlID09PSB1bmRlZmluZWQpIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSA9IGRlZmF1bHRzLm1pbjtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBtaW46IGRlZmF1bHRzLm1pbixcbiAgICBtYXg6IGRlZmF1bHRzLm1heCxcbiAgICBpbml0aWFsOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luY3IsIHJlc2V0XSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIHZhbHVlOiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgICB9XG4gIH0sIGRlZmF1bHRzKTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XSA9IHY7XG4gICAgfVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdhY29zJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdhY29zJzogTWF0aC5hY29zIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLmFjb3MoICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFjb3MocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBhY29zID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgYWNvcy5pbnB1dHMgPSBbeF07XG4gIGFjb3MuaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBhY29zLm5hbWUgPSBhY29zLmJhc2VuYW1lICsgJ3thY29zLmlkfSc7XG5cbiAgcmV0dXJuIGFjb3M7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIGRpdiA9IHJlcXVpcmUoJy4vZGl2LmpzJyksXG4gICAgZGF0YSA9IHJlcXVpcmUoJy4vZGF0YS5qcycpLFxuICAgIHBlZWsgPSByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgICBpZmVsc2UgPSByZXF1aXJlKCcuL2lmZWxzZWlmLmpzJyksXG4gICAgbHQgPSByZXF1aXJlKCcuL2x0LmpzJyksXG4gICAgYmFuZyA9IHJlcXVpcmUoJy4vYmFuZy5qcycpLFxuICAgIGVudiA9IHJlcXVpcmUoJy4vZW52LmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBwb2tlID0gcmVxdWlyZSgnLi9wb2tlLmpzJyksXG4gICAgbmVxID0gcmVxdWlyZSgnLi9uZXEuanMnKSxcbiAgICBhbmQgPSByZXF1aXJlKCcuL2FuZC5qcycpLFxuICAgIGd0ZSA9IHJlcXVpcmUoJy4vZ3RlLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGF0dGFja1RpbWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDQ0MTAwO1xuICB2YXIgZGVjYXlUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiA0NDEwMDtcbiAgdmFyIF9wcm9wcyA9IGFyZ3VtZW50c1syXTtcblxuICB2YXIgX2JhbmcgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKDEsIF9iYW5nLCB7IG1heDogSW5maW5pdHksIHNob3VsZFdyYXA6IGZhbHNlLCBpbml0aWFsVmFsdWU6IC1JbmZpbml0eSB9KSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBzaGFwZTogJ2V4cG9uZW50aWFsJywgYWxwaGE6IDUgfSwgX3Byb3BzKSxcbiAgICAgIGJ1ZmZlckRhdGEgPSB2b2lkIDAsXG4gICAgICBkZWNheURhdGEgPSB2b2lkIDAsXG4gICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICBidWZmZXIgPSB2b2lkIDA7XG5cbiAgLy9jb25zb2xlLmxvZyggJ2F0dGFjayB0aW1lOicsIGF0dGFja1RpbWUsICdkZWNheSB0aW1lOicsIGRlY2F5VGltZSApXG4gIHZhciBjb21wbGV0ZUZsYWcgPSBkYXRhKFswXVxuXG4gIC8vIHNsaWdodGx5IG1vcmUgZWZmaWNpZW50IHRvIHVzZSBleGlzdGluZyBwaGFzZSBhY2N1bXVsYXRvciBmb3IgbGluZWFyIGVudmVsb3Blc1xuICApO2lmIChwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicpIHtcbiAgICBvdXQgPSBpZmVsc2UoYW5kKGd0ZShwaGFzZSwgMCksIGx0KHBoYXNlLCBhdHRhY2tUaW1lKSksIG1lbW8oZGl2KHBoYXNlLCBhdHRhY2tUaW1lKSksIGFuZChndGUocGhhc2UsIDApLCBsdChwaGFzZSwgYWRkKGF0dGFja1RpbWUsIGRlY2F5VGltZSkpKSwgc3ViKDEsIGRpdihzdWIocGhhc2UsIGF0dGFja1RpbWUpLCBkZWNheVRpbWUpKSwgbmVxKHBoYXNlLCAtSW5maW5pdHkpLCBwb2tlKGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6IDAgfSksIDApO1xuICB9IGVsc2Uge1xuICAgIGJ1ZmZlckRhdGEgPSBlbnYoMTAyNCwgeyB0eXBlOiBwcm9wcy5zaGFwZSwgYWxwaGE6IHByb3BzLmFscGhhIH0pO1xuICAgIG91dCA9IGlmZWxzZShhbmQoZ3RlKHBoYXNlLCAwKSwgbHQocGhhc2UsIGF0dGFja1RpbWUpKSwgcGVlayhidWZmZXJEYXRhLCBkaXYocGhhc2UsIGF0dGFja1RpbWUpLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSwgYW5kKGd0ZShwaGFzZSwgMCksIGx0KHBoYXNlLCBhZGQoYXR0YWNrVGltZSwgZGVjYXlUaW1lKSkpLCBwZWVrKGJ1ZmZlckRhdGEsIHN1YigxLCBkaXYoc3ViKHBoYXNlLCBhdHRhY2tUaW1lKSwgZGVjYXlUaW1lKSksIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pLCBuZXEocGhhc2UsIC1JbmZpbml0eSksIHBva2UoY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTogMCB9KSwgMCk7XG4gIH1cblxuICBvdXQuaXNDb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwW2NvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeF07XG4gIH07XG5cbiAgb3V0LnRyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZ2VuLm1lbW9yeS5oZWFwW2NvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeF0gPSAwO1xuICAgIF9iYW5nLnRyaWdnZXIoKTtcbiAgfTtcblxuICByZXR1cm4gb3V0O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciBhZGQgPSB7XG4gICAgaWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgICAgb3V0ID0gJygnLFxuICAgICAgICAgIHN1bSA9IDAsXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGFkZGVyQXRFbmQgPSBmYWxzZSxcbiAgICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWU7XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgIGlmIChpc05hTih2KSkge1xuICAgICAgICAgIG91dCArPSB2O1xuICAgICAgICAgIGlmIChpIDwgaW5wdXRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlO1xuICAgICAgICAgICAgb3V0ICs9ICcgKyAnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KHYpO1xuICAgICAgICAgIG51bUNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoYWxyZWFkeUZ1bGxTdW1tZWQpIG91dCA9ICcnO1xuXG4gICAgICBpZiAobnVtQ291bnQgPiAwKSB7XG4gICAgICAgIG91dCArPSBhZGRlckF0RW5kIHx8IGFscmVhZHlGdWxsU3VtbWVkID8gc3VtIDogJyArICcgKyBzdW07XG4gICAgICB9XG5cbiAgICAgIGlmICghYWxyZWFkeUZ1bGxTdW1tZWQpIG91dCArPSAnKSc7XG5cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBhZGQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIGRpdiA9IHJlcXVpcmUoJy4vZGl2LmpzJyksXG4gICAgZGF0YSA9IHJlcXVpcmUoJy4vZGF0YS5qcycpLFxuICAgIHBlZWsgPSByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgICBpZmVsc2UgPSByZXF1aXJlKCcuL2lmZWxzZWlmLmpzJyksXG4gICAgbHQgPSByZXF1aXJlKCcuL2x0LmpzJyksXG4gICAgYmFuZyA9IHJlcXVpcmUoJy4vYmFuZy5qcycpLFxuICAgIGVudiA9IHJlcXVpcmUoJy4vZW52LmpzJyksXG4gICAgcGFyYW0gPSByZXF1aXJlKCcuL3BhcmFtLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBndHAgPSByZXF1aXJlKCcuL2d0cC5qcycpLFxuICAgIG5vdCA9IHJlcXVpcmUoJy4vbm90LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXR0YWNrVGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogNDQ7XG4gIHZhciBkZWNheVRpbWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDIyMDUwO1xuICB2YXIgc3VzdGFpblRpbWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IDQ0MTAwO1xuICB2YXIgc3VzdGFpbkxldmVsID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAuNjtcbiAgdmFyIHJlbGVhc2VUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiA0NDEwMDtcbiAgdmFyIF9wcm9wcyA9IGFyZ3VtZW50c1s1XTtcblxuICB2YXIgZW52VHJpZ2dlciA9IGJhbmcoKSxcbiAgICAgIHBoYXNlID0gYWNjdW0oMSwgZW52VHJpZ2dlciwgeyBtYXg6IEluZmluaXR5LCBzaG91bGRXcmFwOiBmYWxzZSB9KSxcbiAgICAgIHNob3VsZFN1c3RhaW4gPSBwYXJhbSgxKSxcbiAgICAgIGRlZmF1bHRzID0ge1xuICAgIHNoYXBlOiAnZXhwb25lbnRpYWwnLFxuICAgIGFscGhhOiA1LFxuICAgIHRyaWdnZXJSZWxlYXNlOiBmYWxzZVxuICB9LFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgX3Byb3BzKSxcbiAgICAgIGJ1ZmZlckRhdGEgPSB2b2lkIDAsXG4gICAgICBkZWNheURhdGEgPSB2b2lkIDAsXG4gICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICBidWZmZXIgPSB2b2lkIDAsXG4gICAgICBzdXN0YWluQ29uZGl0aW9uID0gdm9pZCAwLFxuICAgICAgcmVsZWFzZUFjY3VtID0gdm9pZCAwLFxuICAgICAgcmVsZWFzZUNvbmRpdGlvbiA9IHZvaWQgMDtcblxuICAvLyBzbGlnaHRseSBtb3JlIGVmZmljaWVudCB0byB1c2UgZXhpc3RpbmcgcGhhc2UgYWNjdW11bGF0b3IgZm9yIGxpbmVhciBlbnZlbG9wZXNcbiAgLy9pZiggcHJvcHMuc2hhcGUgPT09ICdsaW5lYXInICkge1xuICAvLyAgb3V0ID0gaWZlbHNlKCBcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICksIG1lbW8oIGRpdiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKSApLFxuICAvLyAgICBsdCggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKSwgc3ViKCAxLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSApLCBwcm9wcy5kZWNheVRpbWUgKSwgMS1wcm9wcy5zdXN0YWluTGV2ZWwgKSApLFxuICAvLyAgICBsdCggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKyBwcm9wcy5zdXN0YWluVGltZSApLCBcbiAgLy8gICAgICBwcm9wcy5zdXN0YWluTGV2ZWwsXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSArIHByb3BzLmRlY2F5VGltZSArIHByb3BzLnN1c3RhaW5UaW1lICsgcHJvcHMucmVsZWFzZVRpbWUgKSwgXG4gIC8vICAgICAgc3ViKCBwcm9wcy5zdXN0YWluTGV2ZWwsIG11bCggZGl2KCBzdWIoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICsgcHJvcHMuc3VzdGFpblRpbWUgKSwgcHJvcHMucmVsZWFzZVRpbWUgKSwgcHJvcHMuc3VzdGFpbkxldmVsKSApLFxuICAvLyAgICAwXG4gIC8vICApXG4gIC8vfSBlbHNlIHsgICAgIFxuICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOiAxMDI0LCBhbHBoYTogcHJvcHMuYWxwaGEsIHNoaWZ0OiAwLCB0eXBlOiBwcm9wcy5zaGFwZSB9KTtcblxuICBjb25zb2xlLmxvZyhidWZmZXJEYXRhKTtcblxuICBzdXN0YWluQ29uZGl0aW9uID0gcHJvcHMudHJpZ2dlclJlbGVhc2UgPyBzaG91bGRTdXN0YWluIDogbHQocGhhc2UsIGFkZChhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lKSk7XG5cbiAgcmVsZWFzZUFjY3VtID0gcHJvcHMudHJpZ2dlclJlbGVhc2UgPyBndHAoc3ViKHN1c3RhaW5MZXZlbCwgYWNjdW0oZGl2KHN1c3RhaW5MZXZlbCwgcmVsZWFzZVRpbWUpLCAwLCB7IHNob3VsZFdyYXA6IGZhbHNlIH0pKSwgMCkgOiBzdWIoc3VzdGFpbkxldmVsLCBtdWwoZGl2KHN1YihwaGFzZSwgYWRkKGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUpKSwgcmVsZWFzZVRpbWUpLCBzdXN0YWluTGV2ZWwpKSwgcmVsZWFzZUNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlID8gbm90KHNob3VsZFN1c3RhaW4pIDogbHQocGhhc2UsIGFkZChhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lLCByZWxlYXNlVGltZSkpO1xuXG4gIG91dCA9IGlmZWxzZShcbiAgLy8gYXR0YWNrIFxuICBsdChwaGFzZSwgYXR0YWNrVGltZSksIHBlZWsoYnVmZmVyRGF0YSwgZGl2KHBoYXNlLCBhdHRhY2tUaW1lKSwgeyBib3VuZG1vZGU6ICdjbGFtcCcgfSksXG5cbiAgLy8gZGVjYXlcbiAgbHQocGhhc2UsIGFkZChhdHRhY2tUaW1lLCBkZWNheVRpbWUpKSwgcGVlayhidWZmZXJEYXRhLCBzdWIoMSwgbXVsKGRpdihzdWIocGhhc2UsIGF0dGFja1RpbWUpLCBkZWNheVRpbWUpLCBzdWIoMSwgc3VzdGFpbkxldmVsKSkpLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSxcblxuICAvLyBzdXN0YWluXG4gIHN1c3RhaW5Db25kaXRpb24sIHBlZWsoYnVmZmVyRGF0YSwgc3VzdGFpbkxldmVsKSxcblxuICAvLyByZWxlYXNlXG4gIHJlbGVhc2VDb25kaXRpb24sIC8vbHQoIHBoYXNlLCAgYXR0YWNrVGltZSArICBkZWNheVRpbWUgKyAgc3VzdGFpblRpbWUgKyAgcmVsZWFzZVRpbWUgKSxcbiAgcGVlayhidWZmZXJEYXRhLCByZWxlYXNlQWNjdW0sXG4gIC8vc3ViKCAgc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lKSwgIHJlbGVhc2VUaW1lICksICBzdXN0YWluTGV2ZWwgKSApLCBcbiAgeyBib3VuZG1vZGU6ICdjbGFtcCcgfSksIDBcbiAgLy99XG5cbiAgKTtvdXQudHJpZ2dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMTtcbiAgICBlbnZUcmlnZ2VyLnRyaWdnZXIoKTtcbiAgfTtcblxuICBvdXQucmVsZWFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMDtcbiAgICAvLyBYWFggcHJldHR5IG5hc3R5Li4uIGdyYWJzIGFjY3VtIGluc2lkZSBvZiBndHAgYW5kIHJlc2V0cyB2YWx1ZSBtYW51YWxseVxuICAgIC8vIHVuZm9ydHVuYXRlbHkgZW52VHJpZ2dlciB3b24ndCB3b3JrIGFzIGl0J3MgYmFjayB0byAwIGJ5IHRoZSB0aW1lIHRoZSByZWxlYXNlIGJsb2NrIGlzIHRyaWdnZXJlZC4uLlxuICAgIGdlbi5tZW1vcnkuaGVhcFtyZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4XSA9IDA7XG4gIH07XG5cbiAgcmV0dXJuIG91dDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdhbmQnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gKCcgKyBpbnB1dHNbMF0gKyAnICE9PSAwICYmICcgKyBpbnB1dHNbMV0gKyAnICE9PSAwKSB8IDBcXG5cXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSAnJyArIHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbJycgKyB0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSwgaW4yKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIGluMl1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnYXNpbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAnYXNpbic6IE1hdGguYXNpbiB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5hc2luKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hc2luKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgYXNpbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGFzaW4uaW5wdXRzID0gW3hdO1xuICBhc2luLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgYXNpbi5uYW1lID0gYXNpbi5iYXNlbmFtZSArICd7YXNpbi5pZH0nO1xuXG4gIHJldHVybiBhc2luO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2F0YW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ2F0YW4nOiBNYXRoLmF0YW4gfSk7XG5cbiAgICAgIG91dCA9ICdnZW4uYXRhbiggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXRhbihwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGF0YW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBhdGFuLmlucHV0cyA9IFt4XTtcbiAgYXRhbi5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIGF0YW4ubmFtZSA9IGF0YW4uYmFzZW5hbWUgKyAne2F0YW4uaWR9JztcblxuICByZXR1cm4gYXRhbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGVjYXlUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiA0NDEwMDtcblxuICAgIHZhciBzc2QgPSBoaXN0b3J5KDEpLFxuICAgICAgICB0NjAgPSBNYXRoLmV4cCgtNi45MDc3NTUyNzg5MjEgLyBkZWNheVRpbWUpO1xuXG4gICAgc3NkLmluKG11bChzc2Qub3V0LCB0NjApKTtcblxuICAgIHNzZC5vdXQudHJpZ2dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3NkLnZhbHVlID0gMTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHN1YigxLCBzc2Qub3V0KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHRoaXMubWVtb3J5KTtcblxuICAgIHZhciBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSBtZW1vcnlbJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICddXFxuICBpZiggJyArIHRoaXMubmFtZSArICcgPT09IDEgKSBtZW1vcnlbJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICddID0gMCAgICAgIFxcbiAgICAgIFxcbic7XG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoX3Byb3BzKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOiAwLCBtYXg6IDEgfSwgX3Byb3BzKTtcblxuICB1Z2VuLm5hbWUgPSAnYmFuZycgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHVnZW4ubWluID0gcHJvcHMubWluO1xuICB1Z2VuLm1heCA9IHByb3BzLm1heDtcblxuICB1Z2VuLnRyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgX2dlbi5tZW1vcnkuaGVhcFt1Z2VuLm1lbW9yeS52YWx1ZS5pZHhdID0gdWdlbi5tYXg7XG4gIH07XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOiAxLCBpZHg6IG51bGwgfVxuICB9O1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2Jvb2wnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgb3V0ID0gaW5wdXRzWzBdICsgJyA9PT0gMCA/IDAgOiAxJztcblxuICAgIC8vZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIC8vcmV0dXJuIFsgYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWAsICcgJyArb3V0IF1cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2NlaWwnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLmNlaWwpKTtcblxuICAgICAgb3V0ID0gJ2dlbi5jZWlsKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jZWlsKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgY2VpbCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGNlaWwuaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiBjZWlsO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vciA9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2NsaXAnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBjb2RlID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzBdICsgJ1xcbiAgaWYoICcgKyB0aGlzLm5hbWUgKyAnID4gJyArIGlucHV0c1syXSArICcgKSAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMl0gKyAnXFxuICBlbHNlIGlmKCAnICsgdGhpcy5uYW1lICsgJyA8ICcgKyBpbnB1dHNbMV0gKyAnICkgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzFdICsgJ1xcbic7XG4gICAgb3V0ID0gJyAnICsgb3V0O1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gIHZhciBtaW4gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IC0xO1xuICB2YXIgbWF4ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAxO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbWluOiBtaW4sXG4gICAgbWF4OiBtYXgsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgbWluLCBtYXhdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2NvcycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAnY29zJzogTWF0aC5jb3MgfSk7XG5cbiAgICAgIG91dCA9ICdnZW4uY29zKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jb3MocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBjb3MgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBjb3MuaW5wdXRzID0gW3hdO1xuICBjb3MuaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBjb3MubmFtZSA9IGNvcy5iYXNlbmFtZSArICd7Y29zLmlkfSc7XG5cbiAgcmV0dXJuIGNvcztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdjb3VudGVyJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keSA9IHZvaWQgMDtcblxuICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwpIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG4gICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayhnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgaW5wdXRzWzJdLCBpbnB1dHNbM10sIGlucHV0c1s0XSwgJ21lbW9yeVsnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJ10nLCAnbWVtb3J5WycgKyB0aGlzLm1lbW9yeS53cmFwLmlkeCArICddJyk7XG5cbiAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgdGhpcykpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJztcblxuICAgIGlmIChfZ2VuLm1lbW9bdGhpcy53cmFwLm5hbWVdID09PSB1bmRlZmluZWQpIHRoaXMud3JhcC5nZW4oKTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keV07XG4gIH0sXG4gIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhfbmFtZSwgX2luY3IsIF9taW4sIF9tYXgsIF9yZXNldCwgbG9vcHMsIHZhbHVlUmVmLCB3cmFwUmVmKSB7XG4gICAgdmFyIGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnO1xuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiAoISh0eXBlb2YgdGhpcy5pbnB1dHNbM10gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzNdIDwgMSkpIHtcbiAgICAgIG91dCArPSAnICBpZiggJyArIF9yZXNldCArICcgPj0gMSApICcgKyB2YWx1ZVJlZiArICcgPSAnICsgX21pbiArICdcXG4nO1xuICAgIH1cblxuICAgIG91dCArPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdmFsdWVSZWYgKyAnO1xcbiAgJyArIHZhbHVlUmVmICsgJyArPSAnICsgX2luY3IgKyAnXFxuJzsgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIHdyYXAgPSAnICBpZiggJyArIHZhbHVlUmVmICsgJyA+PSAnICsgdGhpcy5tYXggKyAnICYmICAnICsgbG9vcHMgKyAnID4gMCkge1xcbiAgICAnICsgdmFsdWVSZWYgKyAnIC09ICcgKyBkaWZmICsgJ1xcbiAgICAnICsgd3JhcFJlZiArICcgPSAxXFxuICB9ZWxzZXtcXG4gICAgJyArIHdyYXBSZWYgKyAnID0gMFxcbiAgfVxcbic7XG4gICAgfSBlbHNlIGlmICh0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdGhpcy5taW4gIT09IEluZmluaXR5KSB7XG4gICAgICB3cmFwID0gJyAgaWYoICcgKyB2YWx1ZVJlZiArICcgPj0gJyArIF9tYXggKyAnICYmICAnICsgbG9vcHMgKyAnID4gMCkge1xcbiAgICAnICsgdmFsdWVSZWYgKyAnIC09ICcgKyBfbWF4ICsgJyAtICcgKyBfbWluICsgJ1xcbiAgICAnICsgd3JhcFJlZiArICcgPSAxXFxuICB9ZWxzZSBpZiggJyArIHZhbHVlUmVmICsgJyA8ICcgKyBfbWluICsgJyAmJiAgJyArIGxvb3BzICsgJyA+IDApIHtcXG4gICAgJyArIHZhbHVlUmVmICsgJyArPSAnICsgX21heCArICcgLSAnICsgX21pbiArICdcXG4gICAgJyArIHdyYXBSZWYgKyAnID0gMVxcbiAgfWVsc2V7XFxuICAgICcgKyB3cmFwUmVmICsgJyA9IDBcXG4gIH1cXG4nO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gJ1xcbic7XG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcDtcblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaW5jciA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMTtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogSW5maW5pdHk7XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMDtcbiAgdmFyIGxvb3BzID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiAxO1xuICB2YXIgcHJvcGVydGllcyA9IGFyZ3VtZW50c1s1XTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXRpYWxWYWx1ZTogMCwgc2hvdWxkV3JhcDogdHJ1ZSB9O1xuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHZhbHVlOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luY3IsIG1pbiwgbWF4LCByZXNldCwgbG9vcHNdLFxuICAgIG1lbW9yeToge1xuICAgICAgdmFsdWU6IHsgbGVuZ3RoOiAxLCBpZHg6IG51bGwgfSxcbiAgICAgIHdyYXA6IHsgbGVuZ3RoOiAxLCBpZHg6IG51bGwgfVxuICAgIH0sXG4gICAgd3JhcDoge1xuICAgICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICAgIGlmICh1Z2VuLm1lbW9yeS53cmFwLmlkeCA9PT0gbnVsbCkge1xuICAgICAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh1Z2VuLm1lbW9yeSk7XG4gICAgICAgIH1cbiAgICAgICAgX2dlbi5nZXRJbnB1dHModGhpcyk7XG4gICAgICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJ21lbW9yeVsgJyArIHVnZW4ubWVtb3J5LndyYXAuaWR4ICsgJyBdJztcbiAgICAgICAgcmV0dXJuICdtZW1vcnlbICcgKyB1Z2VuLm1lbW9yeS53cmFwLmlkeCArICcgXSc7XG4gICAgICB9XG4gICAgfVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdID0gdjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHVnZW4ud3JhcC5pbnB1dHMgPSBbdWdlbl07XG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuICB1Z2VuLndyYXAubmFtZSA9IHVnZW4ubmFtZSArICdfd3JhcCc7XG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFjY3VtID0gcmVxdWlyZSgnLi9waGFzb3IuanMnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgcGhhc29yID0gcmVxdWlyZSgnLi9waGFzb3IuanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2N5Y2xlJyxcblxuICBpbml0VGFibGU6IGZ1bmN0aW9uIGluaXRUYWJsZSgpIHtcbiAgICB2YXIgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSgxMDI0KTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgYnVmZmVyW2ldID0gTWF0aC5zaW4oaSAvIGwgKiAoTWF0aC5QSSAqIDIpKTtcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5jeWNsZSA9IGRhdGEoYnVmZmVyLCAxLCB7IGltbXV0YWJsZTogdHJ1ZSB9KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmcmVxdWVuY3kgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDE7XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIF9wcm9wcyA9IGFyZ3VtZW50c1syXTtcblxuICBpZiAodHlwZW9mIGdlbi5nbG9iYWxzLmN5Y2xlID09PSAndW5kZWZpbmVkJykgcHJvdG8uaW5pdFRhYmxlKCk7XG4gIHZhciBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOiAwIH0sIF9wcm9wcyk7XG5cbiAgdmFyIHVnZW4gPSBwZWVrKGdlbi5nbG9iYWxzLmN5Y2xlLCBwaGFzb3IoZnJlcXVlbmN5LCByZXNldCwgcHJvcHMpKTtcbiAgdWdlbi5uYW1lID0gJ2N5Y2xlJyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgdXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnZGF0YScsXG4gIGdsb2JhbHM6IHt9LFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpZHggPSB2b2lkIDA7XG4gICAgaWYgKF9nZW4ubWVtb1t0aGlzLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciB1Z2VuID0gdGhpcztcbiAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUpO1xuICAgICAgaWR4ID0gdGhpcy5tZW1vcnkudmFsdWVzLmlkeDtcbiAgICAgIHRyeSB7XG4gICAgICAgIF9nZW4ubWVtb3J5LmhlYXAuc2V0KHRoaXMuYnVmZmVyLCBpZHgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ2Vycm9yIHdpdGggcmVxdWVzdC4gYXNraW5nIGZvciAnICsgdGhpcy5idWZmZXIubGVuZ3RoICsgJy4gY3VycmVudCBpbmRleDogJyArIF9nZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBfZ2VuLm1lbW9yeS5oZWFwLmxlbmd0aCk7XG4gICAgICB9XG4gICAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IHRoaXNcbiAgICAgIC8vcmV0dXJuICdnZW4ubWVtb3J5JyArIHRoaXMubmFtZSArICcuYnVmZmVyJ1xuICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSBpZHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkeCA9IF9nZW4ubWVtb1t0aGlzLm5hbWVdO1xuICAgIH1cbiAgICByZXR1cm4gaWR4O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciB5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAxO1xuICB2YXIgcHJvcGVydGllcyA9IGFyZ3VtZW50c1syXTtcblxuICB2YXIgdWdlbiA9IHZvaWQgMCxcbiAgICAgIGJ1ZmZlciA9IHZvaWQgMCxcbiAgICAgIHNob3VsZExvYWQgPSBmYWxzZTtcblxuICBpZiAocHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoX2dlbi5nbG9iYWxzW3Byb3BlcnRpZXMuZ2xvYmFsXSkge1xuICAgICAgcmV0dXJuIF9nZW4uZ2xvYmFsc1twcm9wZXJ0aWVzLmdsb2JhbF07XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiB4ID09PSAnbnVtYmVyJykge1xuICAgIGlmICh5ICE9PSAxKSB7XG4gICAgICBidWZmZXIgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeTsgaSsrKSB7XG4gICAgICAgIGJ1ZmZlcltpXSA9IG5ldyBGbG9hdDMyQXJyYXkoeCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoeCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoeCkpIHtcbiAgICAvLyEgKHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSApIHtcbiAgICB2YXIgc2l6ZSA9IHgubGVuZ3RoO1xuICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IHgubGVuZ3RoOyBfaSsrKSB7XG4gICAgICBidWZmZXJbX2ldID0geFtfaV07XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB4ID09PSAnc3RyaW5nJykge1xuICAgIGJ1ZmZlciA9IHsgbGVuZ3RoOiB5ID4gMSA/IHkgOiBfZ2VuLnNhbXBsZXJhdGUgKiA2MCAvLyBYWFggd2hhdD8/P1xuICAgIH07c2hvdWxkTG9hZCA9IHRydWU7XG4gIH0gZWxzZSBpZiAoeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgIGJ1ZmZlciA9IHg7XG4gIH1cblxuICB1Z2VuID0ge1xuICAgIGJ1ZmZlcjogYnVmZmVyLFxuICAgIG5hbWU6IHByb3RvLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKSxcbiAgICBkaW06IGJ1ZmZlci5sZW5ndGgsIC8vIFhYWCBob3cgZG8gd2UgZHluYW1pY2FsbHkgYWxsb2NhdGUgdGhpcz9cbiAgICBjaGFubmVsczogMSxcbiAgICBnZW46IHByb3RvLmdlbixcbiAgICBvbmxvYWQ6IG51bGwsXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihmbmMpIHtcbiAgICAgIHVnZW4ub25sb2FkID0gZm5jO1xuICAgICAgcmV0dXJuIHVnZW47XG4gICAgfSxcblxuICAgIGltbXV0YWJsZTogcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuaW1tdXRhYmxlID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlLFxuICAgIGxvYWQ6IGZ1bmN0aW9uIGxvYWQoZmlsZW5hbWUpIHtcbiAgICAgIHZhciBwcm9taXNlID0gdXRpbGl0aWVzLmxvYWRTYW1wbGUoZmlsZW5hbWUsIHVnZW4pO1xuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChfYnVmZmVyKSB7XG4gICAgICAgIHVnZW4ubWVtb3J5LnZhbHVlcy5sZW5ndGggPSB1Z2VuLmRpbSA9IF9idWZmZXIubGVuZ3RoO1xuICAgICAgICB1Z2VuLm9ubG9hZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlczogeyBsZW5ndGg6IHVnZW4uZGltLCBpZHg6IG51bGwgfVxuICB9O1xuXG4gIF9nZW4ubmFtZSA9ICdkYXRhJyArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgaWYgKHNob3VsZExvYWQpIHVnZW4ubG9hZCh4KTtcblxuICBpZiAocHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIF9nZW4uZ2xvYmFsc1twcm9wZXJ0aWVzLmdsb2JhbF0gPSB1Z2VuO1xuICAgIH1cbiAgICBpZiAocHJvcGVydGllcy5tZXRhID09PSB0cnVlKSB7XG4gICAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcChsZW5ndGgsIF9pMikge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodWdlbiwgX2kyLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGVlayh1Z2VuLCBfaTIsIHsgbW9kZTogJ3NpbXBsZScsIGludGVycDogJ25vbmUnIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgICAgICAgcmV0dXJuIHBva2UodWdlbiwgdiwgX2kyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgZm9yICh2YXIgX2kyID0gMCwgbGVuZ3RoID0gdWdlbi5idWZmZXIubGVuZ3RoOyBfaTIgPCBsZW5ndGg7IF9pMisrKSB7XG4gICAgICAgIF9sb29wKGxlbmd0aCwgX2kyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgICB2YXIgeDEgPSBoaXN0b3J5KCksXG4gICAgICAgIHkxID0gaGlzdG9yeSgpLFxuICAgICAgICBmaWx0ZXIgPSB2b2lkIDA7XG5cbiAgICAvL0hpc3RvcnkgeDEsIHkxOyB5ID0gaW4xIC0geDEgKyB5MSowLjk5OTc7IHgxID0gaW4xOyB5MSA9IHk7IG91dDEgPSB5O1xuICAgIGZpbHRlciA9IG1lbW8oYWRkKHN1YihpbjEsIHgxLm91dCksIG11bCh5MS5vdXQsIC45OTk3KSkpO1xuICAgIHgxLmluKGluMSk7XG4gICAgeTEuaW4oZmlsdGVyKTtcblxuICAgIHJldHVybiBmaWx0ZXI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgdDYwID0gcmVxdWlyZSgnLi90NjAuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRlY2F5VGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogNDQxMDA7XG4gICAgdmFyIHByb3BzID0gYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCB7IGluaXRWYWx1ZTogMSB9LCBwcm9wcyksXG4gICAgICAgIHNzZCA9IGhpc3RvcnkocHJvcGVydGllcy5pbml0VmFsdWUpO1xuXG4gICAgc3NkLmluKG11bChzc2Qub3V0LCB0NjAoZGVjYXlUaW1lKSkpO1xuXG4gICAgc3NkLm91dC50cmlnZ2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzc2QudmFsdWUgPSAxO1xuICAgIH07XG5cbiAgICByZXR1cm4gc3NkLm91dDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZGF0YSA9IHJlcXVpcmUoJy4vZGF0YS5qcycpLFxuICAgIHBva2UgPSByZXF1aXJlKCcuL3Bva2UuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJyksXG4gICAgYWNjdW0gPSByZXF1aXJlKCcuL2FjY3VtLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdkZWxheScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSBpbnB1dHNbMF07XG5cbiAgICByZXR1cm4gaW5wdXRzWzBdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHRhcHNBbmRQcm9wZXJ0aWVzID0gQXJyYXkoX2xlbiA+IDIgPyBfbGVuIC0gMiA6IDApLCBfa2V5ID0gMjsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIHRhcHNBbmRQcm9wZXJ0aWVzW19rZXkgLSAyXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciB0aW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAyNTY7XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBzaXplOiA1MTIsIGZlZWRiYWNrOiAwLCBpbnRlcnA6ICdsaW5lYXInIH0sXG4gICAgICB3cml0ZUlkeCA9IHZvaWQgMCxcbiAgICAgIHJlYWRJZHggPSB2b2lkIDAsXG4gICAgICBkZWxheWRhdGEgPSB2b2lkIDAsXG4gICAgICBwcm9wZXJ0aWVzID0gdm9pZCAwLFxuICAgICAgdGFwVGltZXMgPSBbdGltZV0sXG4gICAgICB0YXBzID0gdm9pZCAwO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHRhcHNBbmRQcm9wZXJ0aWVzKSkge1xuICAgIHByb3BlcnRpZXMgPSB0YXBzQW5kUHJvcGVydGllc1t0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggLSAxXTtcbiAgICBpZiAodGFwc0FuZFByb3BlcnRpZXMubGVuZ3RoID4gMSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdGFwVGltZXMucHVzaCh0YXBzQW5kUHJvcGVydGllc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHByb3BlcnRpZXMgPSB0YXBzQW5kUHJvcGVydGllcztcbiAgfVxuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIGlmIChkZWZhdWx0cy5zaXplIDwgdGltZSkgZGVmYXVsdHMuc2l6ZSA9IHRpbWU7XG5cbiAgZGVsYXlkYXRhID0gZGF0YShkZWZhdWx0cy5zaXplKTtcblxuICB1Z2VuLmlucHV0cyA9IFtdO1xuXG4gIHdyaXRlSWR4ID0gYWNjdW0oMSwgMCwgeyBtYXg6IGRlZmF1bHRzLnNpemUgfSk7XG5cbiAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IHRhcFRpbWVzLmxlbmd0aDsgX2krKykge1xuICAgIHVnZW4uaW5wdXRzW19pXSA9IHBlZWsoZGVsYXlkYXRhLCB3cmFwKHN1Yih3cml0ZUlkeCwgdGFwVGltZXNbX2ldKSwgMCwgZGVmYXVsdHMuc2l6ZSksIHsgbW9kZTogJ3NhbXBsZXMnLCBpbnRlcnA6IGRlZmF1bHRzLmludGVycCB9KTtcbiAgfVxuXG4gIHVnZW4ub3V0cHV0cyA9IHVnZW4uaW5wdXRzOyAvLyB1Z24sIFVnaCwgVUdIISBidXQgaSBndWVzcyBpdCB3b3Jrcy5cblxuICBwb2tlKGRlbGF5ZGF0YSwgaW4xLCB3cml0ZUlkeCk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gIHZhciBuMSA9IGhpc3RvcnkoKTtcblxuICBuMS5pbihpbjEpO1xuXG4gIHZhciB1Z2VuID0gc3ViKGluMSwgbjEub3V0KTtcbiAgdWdlbi5uYW1lID0gJ2RlbHRhJyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgZGl2ID0ge1xuICAgIGlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICAgIG91dCA9ICcoJyxcbiAgICAgICAgICBkaWZmID0gMCxcbiAgICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1swXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4obGFzdE51bWJlciksXG4gICAgICAgICAgZGl2QXRFbmQgPSBmYWxzZTtcblxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgaWYgKGkgPT09IDApIHJldHVybjtcblxuICAgICAgICB2YXIgaXNOdW1iZXJVZ2VuID0gaXNOYU4odiksXG4gICAgICAgICAgICBpc0ZpbmFsSWR4ID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgaWYgKCFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4pIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAvIHY7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXIgKyAnIC8gJyArIHY7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRmluYWxJZHgpIG91dCArPSAnIC8gJztcbiAgICAgIH0pO1xuXG4gICAgICBvdXQgKz0gJyknO1xuXG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZGl2O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbicpLFxuICAgIHdpbmRvd3MgPSByZXF1aXJlKCcuL3dpbmRvd3MnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhJyksXG4gICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlaycpLFxuICAgIHBoYXNvciA9IHJlcXVpcmUoJy4vcGhhc29yJyksXG4gICAgZGVmYXVsdHMgPSB7XG4gIHR5cGU6ICd0cmlhbmd1bGFyJywgbGVuZ3RoOiAxMDI0LCBhbHBoYTogLjE1LCBzaGlmdDogMFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgdmFyIHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgcHJvcHMpO1xuICB2YXIgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShwcm9wZXJ0aWVzLmxlbmd0aCk7XG5cbiAgdmFyIG5hbWUgPSBwcm9wZXJ0aWVzLnR5cGUgKyAnXycgKyBwcm9wZXJ0aWVzLmxlbmd0aCArICdfJyArIHByb3BlcnRpZXMuc2hpZnQ7XG4gIGlmICh0eXBlb2YgZ2VuLmdsb2JhbHMud2luZG93c1tuYW1lXSA9PT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgYnVmZmVyW2ldID0gd2luZG93c1twcm9wZXJ0aWVzLnR5cGVdKHByb3BlcnRpZXMubGVuZ3RoLCBpLCBwcm9wZXJ0aWVzLmFscGhhLCBwcm9wZXJ0aWVzLnNoaWZ0KTtcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy53aW5kb3dzW25hbWVdID0gZGF0YShidWZmZXIpO1xuICB9XG5cbiAgdmFyIHVnZW4gPSBnZW4uZ2xvYmFscy53aW5kb3dzW25hbWVdO1xuICB1Z2VuLm5hbWUgPSAnZW52JyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdlcScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBvdXQgPSB0aGlzLmlucHV0c1swXSA9PT0gdGhpcy5pbnB1dHNbMV0gPyAxIDogJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gKCcgKyBpbnB1dHNbMF0gKyAnID09PSAnICsgaW5wdXRzWzFdICsgJykgfCAwXFxuXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJycgKyB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gWycnICsgdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBpbjJdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnZmxvb3InLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gJyggJyArIGlucHV0c1swXSArICcgfCAwICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gfCAwO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGZsb29yID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgZmxvb3IuaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiBmbG9vcjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdmb2xkJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soaW5wdXRzWzBdLCB0aGlzLm1pbiwgdGhpcy5tYXgpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dF07XG4gIH0sXG4gIGNyZWF0ZUNhbGxiYWNrOiBmdW5jdGlvbiBjcmVhdGVDYWxsYmFjayh2LCBsbywgaGkpIHtcbiAgICB2YXIgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdiArICcsXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfcmFuZ2UgPSAnICsgaGkgKyAnIC0gJyArIGxvICsgJyxcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwcyA9IDBcXG5cXG4gIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlID49ICcgKyBoaSArICcpe1xcbiAgICAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSAtPSAnICsgdGhpcy5uYW1lICsgJ19yYW5nZVxcbiAgICBpZignICsgdGhpcy5uYW1lICsgJ192YWx1ZSA+PSAnICsgaGkgKyAnKXtcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwcyA9ICgoJyArIHRoaXMubmFtZSArICdfdmFsdWUgLSAnICsgbG8gKyAnKSAvICcgKyB0aGlzLm5hbWUgKyAnX3JhbmdlKSB8IDBcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSAtPSAnICsgdGhpcy5uYW1lICsgJ19yYW5nZSAqICcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzXFxuICAgIH1cXG4gICAgJyArIHRoaXMubmFtZSArICdfbnVtV3JhcHMrK1xcbiAgfSBlbHNlIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIDwgJyArIGxvICsgJyl7XFxuICAgICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlICs9ICcgKyB0aGlzLm5hbWUgKyAnX3JhbmdlXFxuICAgIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIDwgJyArIGxvICsgJyl7XFxuICAgICAgJyArIHRoaXMubmFtZSArICdfbnVtV3JhcHMgPSAoKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIC0gJyArIGxvICsgJykgLyAnICsgdGhpcy5uYW1lICsgJ19yYW5nZS0gMSkgfCAwXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfdmFsdWUgLT0gJyArIHRoaXMubmFtZSArICdfcmFuZ2UgKiAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwc1xcbiAgICB9XFxuICAgICcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzLS1cXG4gIH1cXG4gIGlmKCcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzICYgMSkgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgaGkgKyAnICsgJyArIGxvICsgJyAtICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlXFxuJztcbiAgICByZXR1cm4gJyAnICsgb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjFdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnZ2F0ZScsXG4gIGNvbnRyb2xTdHJpbmc6IG51bGwsIC8vIGluc2VydCBpbnRvIG91dHB1dCBjb2RlZ2VuIGZvciBkZXRlcm1pbmluZyBpbmRleGluZ1xuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICB2YXIgbGFzdElucHV0TWVtb3J5SWR4ID0gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAnIF0nLFxuICAgICAgICBvdXRwdXRNZW1vcnlTdGFydElkeCA9IHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAxLFxuICAgICAgICBpbnB1dFNpZ25hbCA9IGlucHV0c1swXSxcbiAgICAgICAgY29udHJvbFNpZ25hbCA9IGlucHV0c1sxXTtcblxuICAgIC8qIFxuICAgICAqIHdlIGNoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCBjb250cm9sIGlucHV0cyBlcXVhbHMgb3VyIGxhc3QgaW5wdXRcbiAgICAgKiBpZiBzbywgd2Ugc3RvcmUgdGhlIHNpZ25hbCBpbnB1dCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgY3VycmVudGx5XG4gICAgICogc2VsZWN0ZWQgaW5kZXguIElmIG5vdCwgd2UgcHV0IDAgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGxhc3Qgc2VsZWN0ZWQgaW5kZXgsXG4gICAgICogY2hhbmdlIHRoZSBzZWxlY3RlZCBpbmRleCwgYW5kIHRoZW4gc3RvcmUgdGhlIHNpZ25hbCBpbiBwdXQgaW4gdGhlIG1lbWVyeSBhc3NvaWNhdGVkXG4gICAgICogd2l0aCB0aGUgbmV3bHkgc2VsZWN0ZWQgaW5kZXhcbiAgICAgKi9cblxuICAgIG91dCA9ICcgaWYoICcgKyBjb250cm9sU2lnbmFsICsgJyAhPT0gJyArIGxhc3RJbnB1dE1lbW9yeUlkeCArICcgKSB7XFxuICAgIG1lbW9yeVsgJyArIGxhc3RJbnB1dE1lbW9yeUlkeCArICcgKyAnICsgb3V0cHV0TWVtb3J5U3RhcnRJZHggKyAnICBdID0gMCBcXG4gICAgJyArIGxhc3RJbnB1dE1lbW9yeUlkeCArICcgPSAnICsgY29udHJvbFNpZ25hbCArICdcXG4gIH1cXG4gIG1lbW9yeVsgJyArIG91dHB1dE1lbW9yeVN0YXJ0SWR4ICsgJyArICcgKyBjb250cm9sU2lnbmFsICsgJyBdID0gJyArIGlucHV0U2lnbmFsICsgJ1xcblxcbic7XG4gICAgdGhpcy5jb250cm9sU3RyaW5nID0gaW5wdXRzWzFdO1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICB0aGlzLm91dHB1dHMuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIHYuZ2VuKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gW251bGwsICcgJyArIG91dF07XG4gIH0sXG4gIGNoaWxkZ2VuOiBmdW5jdGlvbiBjaGlsZGdlbigpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQuaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgICBfZ2VuLmdldElucHV0cyh0aGlzIC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKF9nZW4ubWVtb1t0aGlzLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICcgXSc7XG4gICAgfVxuXG4gICAgcmV0dXJuICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggKyAnIF0nO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb250cm9sLCBpbjEsIHByb3BlcnRpZXMpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBjb3VudDogMiB9O1xuXG4gIGlmICgodHlwZW9mIHByb3BlcnRpZXMgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHByb3BlcnRpZXMpKSAhPT0gdW5kZWZpbmVkKSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBwcm9wZXJ0aWVzKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBvdXRwdXRzOiBbXSxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBjb250cm9sXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGxhc3RJbnB1dDogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gICAgfSxcbiAgICBpbml0aWFsaXplZDogZmFsc2VcbiAgfSwgZGVmYXVsdHMpO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1Z2VuLmNvdW50OyBpKyspIHtcbiAgICB1Z2VuLm91dHB1dHMucHVzaCh7XG4gICAgICBpbmRleDogaSxcbiAgICAgIGdlbjogcHJvdG8uY2hpbGRnZW4sXG4gICAgICBwYXJlbnQ6IHVnZW4sXG4gICAgICBpbnB1dHM6IFt1Z2VuXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxuICAgICAgbmFtZTogdWdlbi5uYW1lICsgJ19vdXQnICsgX2dlbi5nZXRVSUQoKVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuLyogZ2VuLmpzXG4gKlxuICogbG93LWxldmVsIGNvZGUgZ2VuZXJhdGlvbiBmb3IgdW5pdCBnZW5lcmF0b3JzXG4gKlxuICovXG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxudmFyIE1lbW9yeUhlbHBlciA9IHJlcXVpcmUoJ21lbW9yeS1oZWxwZXInKTtcblxudmFyIGdlbiA9IHtcblxuICBhY2N1bTogMCxcbiAgZ2V0VUlEOiBmdW5jdGlvbiBnZXRVSUQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWNjdW0rKztcbiAgfSxcblxuICBkZWJ1ZzogZmFsc2UsXG4gIHNhbXBsZXJhdGU6IDQ0MTAwLCAvLyBjaGFuZ2Ugb24gYXVkaW9jb250ZXh0IGNyZWF0aW9uXG4gIHNob3VsZExvY2FsaXplOiBmYWxzZSxcbiAgZ2xvYmFsczoge1xuICAgIHdpbmRvd3M6IHt9XG4gIH0sXG5cbiAgLyogY2xvc3VyZXNcbiAgICpcbiAgICogRnVuY3Rpb25zIHRoYXQgYXJlIGluY2x1ZGVkIGFzIGFyZ3VtZW50cyB0byBtYXN0ZXIgY2FsbGJhY2suIEV4YW1wbGVzOiBNYXRoLmFicywgTWF0aC5yYW5kb20gZXRjLlxuICAgKiBYWFggU2hvdWxkIHByb2JhYmx5IGJlIHJlbmFtZWQgY2FsbGJhY2tQcm9wZXJ0aWVzIG9yIHNvbWV0aGluZyBzaW1pbGFyLi4uIGNsb3N1cmVzIGFyZSBubyBsb25nZXIgdXNlZC5cbiAgICovXG5cbiAgY2xvc3VyZXM6IG5ldyBTZXQoKSxcbiAgcGFyYW1zOiBuZXcgU2V0KCksXG5cbiAgcGFyYW1ldGVyczogW10sXG4gIGVuZEJsb2NrOiBuZXcgU2V0KCksXG4gIGhpc3RvcmllczogbmV3IE1hcCgpLFxuXG4gIG1lbW86IHt9LFxuXG4gIGRhdGE6IHt9LFxuXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0OiBmdW5jdGlvbiBfZXhwb3J0KG9iaikge30sXG4gIGFkZFRvRW5kQmxvY2s6IGZ1bmN0aW9uIGFkZFRvRW5kQmxvY2sodikge1xuICAgIHRoaXMuZW5kQmxvY2suYWRkKCcgICcgKyB2KTtcbiAgfSxcbiAgcmVxdWVzdE1lbW9yeTogZnVuY3Rpb24gcmVxdWVzdE1lbW9yeShtZW1vcnlTcGVjKSB7XG4gICAgdmFyIGltbXV0YWJsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbWVtb3J5U3BlYykge1xuICAgICAgdmFyIHJlcXVlc3QgPSBtZW1vcnlTcGVjW2tleV07XG5cbiAgICAgIHJlcXVlc3QuaWR4ID0gZ2VuLm1lbW9yeS5hbGxvYyhyZXF1ZXN0Lmxlbmd0aCwgaW1tdXRhYmxlKTtcbiAgICB9XG4gIH0sXG5cblxuICAvKiBjcmVhdGVDYWxsYmFja1xuICAgKlxuICAgKiBwYXJhbSB1Z2VuIC0gSGVhZCBvZiBncmFwaCB0byBiZSBjb2RlZ2VuJ2RcbiAgICpcbiAgICogR2VuZXJhdGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciB1Z2VuIGdyYXBoLlxuICAgKiBUaGUgZ2VuLmNsb3N1cmVzIHByb3BlcnR5IHN0b3JlcyBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlXG4gICAqIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGZpbmFsIGZ1bmN0aW9uOyB0aGVzZSBhcmUgcHJlZml4ZWRcbiAgICogYmVmb3JlIGFueSBkZWZpbmVkIHBhcmFtcyB0aGUgZ3JhcGggZXhwb3Nlcy4gRm9yIGV4YW1wbGUsIGdpdmVuOlxuICAgKlxuICAgKiBnZW4uY3JlYXRlQ2FsbGJhY2soIGFicyggcGFyYW0oKSApIClcbiAgICpcbiAgICogLi4uIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gd2lsbCBoYXZlIGEgc2lnbmF0dXJlIG9mICggYWJzLCBwMCApLlxuICAgKi9cblxuICBjcmVhdGVDYWxsYmFjazogZnVuY3Rpb24gY3JlYXRlQ2FsbGJhY2sodWdlbiwgbWVtKSB7XG4gICAgdmFyIGRlYnVnID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcbiAgICB2YXIgc2hvdWxkSW5saW5lTWVtb3J5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBmYWxzZTtcblxuICAgIHZhciBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkodWdlbikgJiYgdWdlbi5sZW5ndGggPiAxLFxuICAgICAgICBjYWxsYmFjayA9IHZvaWQgMCxcbiAgICAgICAgY2hhbm5lbDEgPSB2b2lkIDAsXG4gICAgICAgIGNoYW5uZWwyID0gdm9pZCAwO1xuXG4gICAgaWYgKHR5cGVvZiBtZW0gPT09ICdudW1iZXInIHx8IG1lbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKG1lbSk7XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2NiIG1lbW9yeTonLCBtZW0gKVxuICAgIHRoaXMubWVtb3J5ID0gbWVtO1xuICAgIHRoaXMubWVtbyA9IHt9O1xuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKTtcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKCk7XG4gICAgdGhpcy5wYXJhbXMuY2xlYXJcbiAgICAvL3RoaXMuZ2xvYmFscyA9IHsgd2luZG93czp7fSB9XG5cbiAgICAoKTt0aGlzLnBhcmFtZXRlcnMubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIgICd1c2Ugc3RyaWN0J1xcblwiO1xuICAgIGlmIChzaG91bGRJbmxpbmVNZW1vcnkgPT09IGZhbHNlKSB0aGlzLmZ1bmN0aW9uQm9keSArPSBcIiAgdmFyIG1lbW9yeSA9IGdlbi5tZW1vcnlcXG5cXG5cIjtcblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEgKyBpc1N0ZXJlbzsgaSsrKSB7XG4gICAgICBpZiAodHlwZW9mIHVnZW5baV0gPT09ICdudW1iZXInKSBjb250aW51ZTtcblxuICAgICAgdmFyIGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgICAgIGJvZHkgPSAnJztcblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KGNoYW5uZWwpID8gY2hhbm5lbFsxXSArICdcXG4nICsgY2hhbm5lbFswXSA6IGNoYW5uZWw7XG5cbiAgICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgICAgYm9keSA9IGJvZHkuc3BsaXQoJ1xcbidcblxuICAgICAgLy9pZiggZGVidWcgKSBjb25zb2xlLmxvZyggJ2Z1bmN0aW9uQm9keSBsZW5ndGgnLCBib2R5IClcblxuICAgICAgLy8gbmV4dCBsaW5lIGlzIHRvIGFjY29tbW9kYXRlIG1lbW8gYXMgZ3JhcGggaGVhZFxuICAgICAgKTtpZiAoYm9keVtib2R5Lmxlbmd0aCAtIDFdLnRyaW0oKS5pbmRleE9mKCdsZXQnKSA+IC0xKSB7XG4gICAgICAgIGJvZHkucHVzaCgnXFxuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICAgIHZhciBsYXN0aWR4ID0gYm9keS5sZW5ndGggLSAxO1xuXG4gICAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICAgIGJvZHlbbGFzdGlkeF0gPSAnICBnZW4ub3V0WycgKyBpICsgJ10gID0gJyArIGJvZHlbbGFzdGlkeF0gKyAnXFxuJztcblxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gYm9keS5qb2luKCdcXG4nKTtcbiAgICB9XG5cbiAgICB0aGlzLmhpc3Rvcmllcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB2YWx1ZS5nZW4oKTtcbiAgICB9KTtcblxuICAgIHZhciByZXR1cm5TdGF0ZW1lbnQgPSBpc1N0ZXJlbyA/ICcgIHJldHVybiBnZW4ub3V0JyA6ICcgIHJldHVybiBnZW4ub3V0WzBdJztcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpO1xuXG4gICAgaWYgKHRoaXMuZW5kQmxvY2suc2l6ZSkge1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoQXJyYXkuZnJvbSh0aGlzLmVuZEJsb2NrKSk7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKHJldHVyblN0YXRlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2gocmV0dXJuU3RhdGVtZW50KTtcbiAgICB9XG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nXG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgLy9cbiAgICApO2lmIChzaG91bGRJbmxpbmVNZW1vcnkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMucGFyYW1ldGVycy5wdXNoKCdtZW1vcnknKTtcbiAgICB9XG4gICAgdmFyIGJ1aWxkU3RyaW5nID0gJ3JldHVybiBmdW5jdGlvbiBnZW4oICcgKyB0aGlzLnBhcmFtZXRlcnMuam9pbignLCcpICsgJyApeyBcXG4nICsgdGhpcy5mdW5jdGlvbkJvZHkgKyAnXFxufSc7XG5cbiAgICBpZiAodGhpcy5kZWJ1ZyB8fCBkZWJ1ZykgY29uc29sZS5sb2coYnVpbGRTdHJpbmcpO1xuXG4gICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oYnVpbGRTdHJpbmcpXG5cbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgICgpO3ZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gdGhpcy5jbG9zdXJlcy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgdmFyIGRpY3QgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICB2YXIgbmFtZSA9IE9iamVjdC5rZXlzKGRpY3QpWzBdLFxuICAgICAgICAgICAgdmFsdWUgPSBkaWN0W25hbWVdO1xuXG4gICAgICAgIGNhbGxiYWNrW25hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gICAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcCgpIHtcbiAgICAgICAgdmFyIGRpY3QgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgICAgdmFyIG5hbWUgPSBPYmplY3Qua2V5cyhkaWN0KVswXSxcbiAgICAgICAgICAgIHVnZW4gPSBkaWN0W25hbWVdO1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjYWxsYmFjaywgbmFtZSwge1xuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB1Z2VuLnZhbHVlO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgICAgICAgdWdlbi52YWx1ZSA9IHY7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgICAgICk7XG4gICAgICB9O1xuXG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gdGhpcy5wYXJhbXMudmFsdWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgX2xvb3AoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YTtcbiAgICBjYWxsYmFjay5vdXQgPSBuZXcgRmxvYXQzMkFycmF5KDIpO1xuICAgIGNhbGxiYWNrLnBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlcnMuc2xpY2UoMFxuXG4gICAgLy9pZiggTWVtb3J5SGVscGVyLmlzUHJvdG90eXBlT2YoIHRoaXMubWVtb3J5ICkgKSBcbiAgICApO2NhbGxiYWNrLm1lbW9yeSA9IHRoaXMubWVtb3J5LmhlYXA7XG5cbiAgICB0aGlzLmhpc3Rvcmllcy5jbGVhcigpO1xuXG4gICAgcmV0dXJuIGNhbGxiYWNrO1xuICB9LFxuXG5cbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIEdpdmVuIGFuIGFyZ3VtZW50IHVnZW4sIGV4dHJhY3QgaXRzIGlucHV0cy4gSWYgdGhleSBhcmUgbnVtYmVycywgcmV0dXJuIHRoZSBudW1lYnJzLiBJZlxuICAgKiB0aGV5IGFyZSB1Z2VucywgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0czogZnVuY3Rpb24gZ2V0SW5wdXRzKHVnZW4pIHtcbiAgICByZXR1cm4gdWdlbi5pbnB1dHMubWFwKGdlbi5nZXRJbnB1dCk7XG4gIH0sXG4gIGdldElucHV0OiBmdW5jdGlvbiBnZXRJbnB1dChpbnB1dCkge1xuICAgIHZhciBpc09iamVjdCA9ICh0eXBlb2YgaW5wdXQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGlucHV0KSkgPT09ICdvYmplY3QnLFxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IHZvaWQgMDtcblxuICAgIGlmIChpc09iamVjdCkge1xuICAgICAgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uIFxuICAgICAgaWYgKGdlbi5tZW1vW2lucHV0Lm5hbWVdKSB7XG4gICAgICAgIC8vIGlmIGl0IGhhcyBiZWVuIG1lbW9pemVkLi4uXG4gICAgICAgIHByb2Nlc3NlZElucHV0ID0gZ2VuLm1lbW9baW5wdXQubmFtZV07XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgIGdlbi5nZXRJbnB1dChpbnB1dFswXSk7XG4gICAgICAgIGdlbi5nZXRJbnB1dChpbnB1dFsxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiBub3QgbWVtb2l6ZWQgZ2VuZXJhdGUgY29kZSAgXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQuZ2VuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ25vIGdlbiBmb3VuZDonLCBpbnB1dCwgaW5wdXQuZ2VuKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29kZSA9IGlucHV0LmdlblxuICAgICAgICAvL2lmKCBjb2RlLmluZGV4T2YoICdPYmplY3QnICkgPiAtMSApIGNvbnNvbGUubG9nKCAnYmFkIGlucHV0OicsIGlucHV0LCBjb2RlIClcblxuICAgICAgICAoKTtpZiAoQXJyYXkuaXNBcnJheShjb2RlKSkge1xuICAgICAgICAgIGlmICghZ2VuLnNob3VsZExvY2FsaXplKSB7XG4gICAgICAgICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdlbi5jb2RlTmFtZSA9IGNvZGVbMF07XG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKGNvZGVbMV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnYWZ0ZXIgR0VOJyAsIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dDtcbiAgfSxcbiAgc3RhcnRMb2NhbGl6ZTogZnVuY3Rpb24gc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXTtcbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gdHJ1ZTtcbiAgfSxcbiAgZW5kTG9jYWxpemU6IGZ1bmN0aW9uIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZTtcblxuICAgIHJldHVybiBbdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApXTtcbiAgfSxcbiAgZnJlZTogZnVuY3Rpb24gZnJlZShncmFwaCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGdyYXBoKSkge1xuICAgICAgLy8gc3RlcmVvIHVnZW5cbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IzID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IzID0gZ3JhcGhbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDM7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSAoX3N0ZXAzID0gX2l0ZXJhdG9yMy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgY2hhbm5lbCA9IF9zdGVwMy52YWx1ZTtcblxuICAgICAgICAgIHRoaXMuZnJlZShjaGFubmVsKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yMyA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMyA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyAmJiBfaXRlcmF0b3IzLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMy5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMykge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoKHR5cGVvZiBncmFwaCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZ3JhcGgpKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKGdyYXBoLm1lbW9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZm9yICh2YXIgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSkge1xuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZnJlZShncmFwaC5tZW1vcnlbbWVtb3J5S2V5XS5pZHgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShncmFwaC5pbnB1dHMpKSB7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gdHJ1ZTtcbiAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3I0ID0gZmFsc2U7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yNCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3I0ID0gZ3JhcGguaW5wdXRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA0OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gKF9zdGVwNCA9IF9pdGVyYXRvcjQubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgPSB0cnVlKSB7XG4gICAgICAgICAgICAgIHZhciB1Z2VuID0gX3N0ZXA0LnZhbHVlO1xuXG4gICAgICAgICAgICAgIHRoaXMuZnJlZSh1Z2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yNCA9IHRydWU7XG4gICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjQgPSBlcnI7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgJiYgX2l0ZXJhdG9yNC5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3I0LnJldHVybigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3I0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnZ3QnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJztcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgKz0gJygoICcgKyBpbnB1dHNbMF0gKyAnID4gJyArIGlucHV0c1sxXSArICcpIHwgMCApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+IGlucHV0c1sxXSA/IDEgOiAwO1xuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBndCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGd0LmlucHV0cyA9IFt4LCB5XTtcbiAgZ3QubmFtZSA9ICdndCcgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBndDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2d0ZScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSB8fCBpc05hTih0aGlzLmlucHV0c1sxXSkpIHtcbiAgICAgIG91dCArPSAnKCAnICsgaW5wdXRzWzBdICsgJyA+PSAnICsgaW5wdXRzWzFdICsgJyB8IDAgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPj0gaW5wdXRzWzFdID8gMSA6IDA7XG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIGd0ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgZ3QuaW5wdXRzID0gW3gsIHldO1xuICBndC5uYW1lID0gJ2d0ZScgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBndDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2d0cCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pIHx8IGlzTmFOKHRoaXMuaW5wdXRzWzFdKSkge1xuICAgICAgb3V0ID0gJygnICsgaW5wdXRzWzBdICsgJyAqICggKCAnICsgaW5wdXRzWzBdICsgJyA+ICcgKyBpbnB1dHNbMV0gKyAnICkgfCAwICkgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqIChpbnB1dHNbMF0gPiBpbnB1dHNbMV0gfCAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBndHAgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBndHAuaW5wdXRzID0gW3gsIHldO1xuXG4gIHJldHVybiBndHA7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGluMSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMDtcblxuICB2YXIgdWdlbiA9IHtcbiAgICBpbnB1dHM6IFtpbjFdLFxuICAgIG1lbW9yeTogeyB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9IH0sXG4gICAgcmVjb3JkZXI6IG51bGwsXG5cbiAgICBpbjogZnVuY3Rpb24gX2luKHYpIHtcbiAgICAgIGlmIChfZ2VuLmhpc3Rvcmllcy5oYXModikpIHtcbiAgICAgICAgdmFyIG1lbW9IaXN0b3J5ID0gX2dlbi5oaXN0b3JpZXMuZ2V0KHYpO1xuICAgICAgICB1Z2VuLm5hbWUgPSBtZW1vSGlzdG9yeS5uYW1lO1xuICAgICAgICByZXR1cm4gbWVtb0hpc3Rvcnk7XG4gICAgICB9XG5cbiAgICAgIHZhciBvYmogPSB7XG4gICAgICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh1Z2VuKTtcblxuICAgICAgICAgIGlmICh1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwpIHtcbiAgICAgICAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh1Z2VuLm1lbW9yeSk7XG4gICAgICAgICAgICBfZ2VuLm1lbW9yeS5oZWFwW3VnZW4ubWVtb3J5LnZhbHVlLmlkeF0gPSBpbjE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeDtcblxuICAgICAgICAgIF9nZW4uYWRkVG9FbmRCbG9jaygnbWVtb3J5WyAnICsgaWR4ICsgJyBdID0gJyArIGlucHV0c1swXVxuXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICApO19nZW4uaGlzdG9yaWVzLnNldCh2LCBvYmopO1xuXG4gICAgICAgICAgcmV0dXJuIGlucHV0c1swXTtcbiAgICAgICAgfSxcblxuICAgICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX2luJyArIF9nZW4uZ2V0VUlEKCksXG4gICAgICAgIG1lbW9yeTogdWdlbi5tZW1vcnlcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuaW5wdXRzWzBdID0gdjtcblxuICAgICAgdWdlbi5yZWNvcmRlciA9IG9iajtcblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG5cbiAgICBvdXQ6IHtcbiAgICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgICBpZiAodWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsKSB7XG4gICAgICAgICAgaWYgKF9nZW4uaGlzdG9yaWVzLmdldCh1Z2VuLmlucHV0c1swXSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgX2dlbi5oaXN0b3JpZXMuc2V0KHVnZW4uaW5wdXRzWzBdLCB1Z2VuLnJlY29yZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHVnZW4ubWVtb3J5KTtcbiAgICAgICAgICBfZ2VuLm1lbW9yeS5oZWFwW3VnZW4ubWVtb3J5LnZhbHVlLmlkeF0gPSBwYXJzZUZsb2F0KGluMSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeDtcblxuICAgICAgICByZXR1cm4gJ21lbW9yeVsgJyArIGlkeCArICcgXSAnO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKClcbiAgfTtcblxuICB1Z2VuLm91dC5tZW1vcnkgPSB1Z2VuLm1lbW9yeTtcblxuICB1Z2VuLm5hbWUgPSAnaGlzdG9yeScgKyB1Z2VuLnVpZDtcbiAgdWdlbi5vdXQubmFtZSA9IHVnZW4ubmFtZSArICdfb3V0JztcbiAgdWdlbi5pbi5fbmFtZSA9IHVnZW4ubmFtZSA9ICdfaW4nO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF07XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XSA9IHY7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiLypcblxuIGEgPSBjb25kaXRpb25hbCggY29uZGl0aW9uLCB0cnVlQmxvY2ssIGZhbHNlQmxvY2sgKVxuIGIgPSBjb25kaXRpb25hbChbXG4gICBjb25kaXRpb24xLCBibG9jazEsXG4gICBjb25kaXRpb24yLCBibG9jazIsXG4gICBjb25kaXRpb24zLCBibG9jazMsXG4gICBkZWZhdWx0QmxvY2tcbiBdKVxuXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdpZmVsc2UnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBjb25kaXRpb25hbHMgPSB0aGlzLmlucHV0c1swXSxcbiAgICAgICAgZGVmYXVsdFZhbHVlID0gX2dlbi5nZXRJbnB1dChjb25kaXRpb25hbHNbY29uZGl0aW9uYWxzLmxlbmd0aCAtIDFdKSxcbiAgICAgICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnX291dCA9ICcgKyBkZWZhdWx0VmFsdWUgKyAnXFxuJztcblxuICAgIC8vY29uc29sZS5sb2coICdkZWZhdWx0VmFsdWU6JywgZGVmYXVsdFZhbHVlIClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uZGl0aW9uYWxzLmxlbmd0aCAtIDI7IGkgKz0gMikge1xuICAgICAgdmFyIGlzRW5kQmxvY2sgPSBpID09PSBjb25kaXRpb25hbHMubGVuZ3RoIC0gMyxcbiAgICAgICAgICBjb25kID0gX2dlbi5nZXRJbnB1dChjb25kaXRpb25hbHNbaV0pLFxuICAgICAgICAgIHByZWJsb2NrID0gY29uZGl0aW9uYWxzW2kgKyAxXSxcbiAgICAgICAgICBibG9jayA9IHZvaWQgMCxcbiAgICAgICAgICBibG9ja05hbWUgPSB2b2lkIDAsXG4gICAgICAgICAgb3V0cHV0ID0gdm9pZCAwO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncGInLCBwcmVibG9jayApXG5cbiAgICAgIGlmICh0eXBlb2YgcHJlYmxvY2sgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGJsb2NrID0gcHJlYmxvY2s7XG4gICAgICAgIGJsb2NrTmFtZSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoX2dlbi5tZW1vW3ByZWJsb2NrLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyB1c2VkIHRvIHBsYWNlIGFsbCBjb2RlIGRlcGVuZGVuY2llcyBpbiBhcHByb3ByaWF0ZSBibG9ja3NcbiAgICAgICAgICBfZ2VuLnN0YXJ0TG9jYWxpemUoKTtcblxuICAgICAgICAgIF9nZW4uZ2V0SW5wdXQocHJlYmxvY2spO1xuXG4gICAgICAgICAgYmxvY2sgPSBfZ2VuLmVuZExvY2FsaXplKCk7XG4gICAgICAgICAgYmxvY2tOYW1lID0gYmxvY2tbMF07XG4gICAgICAgICAgYmxvY2sgPSBibG9ja1sxXS5qb2luKCcnKTtcbiAgICAgICAgICBibG9jayA9ICcgICcgKyBibG9jay5yZXBsYWNlKC9cXG4vZ2ksICdcXG4gICcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJsb2NrID0gJyc7XG4gICAgICAgICAgYmxvY2tOYW1lID0gX2dlbi5tZW1vW3ByZWJsb2NrLm5hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG91dHB1dCA9IGJsb2NrTmFtZSA9PT0gbnVsbCA/ICcgICcgKyB0aGlzLm5hbWUgKyAnX291dCA9ICcgKyBibG9jayA6IGJsb2NrICsgJyAgJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGJsb2NrTmFtZTtcblxuICAgICAgaWYgKGkgPT09IDApIG91dCArPSAnICc7XG4gICAgICBvdXQgKz0gJyBpZiggJyArIGNvbmQgKyAnID09PSAxICkge1xcbicgKyBvdXRwdXQgKyAnXFxuICB9JztcblxuICAgICAgaWYgKCFpc0VuZEJsb2NrKSB7XG4gICAgICAgIG91dCArPSAnIGVsc2UnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0ICs9ICdcXG4nO1xuICAgICAgfVxuICAgICAgLyogICAgICAgICBcbiAgICAgICBlbHNlYFxuICAgICAgICAgICAgfWVsc2UgaWYoIGlzRW5kQmxvY2sgKSB7XG4gICAgICAgICAgICAgIG91dCArPSBge1xcbiAgJHtvdXRwdXR9XFxuICB9XFxuYFxuICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgXG4gICAgICAgICAgICAgIC8vaWYoIGkgKyAyID09PSBjb25kaXRpb25hbHMubGVuZ3RoIHx8IGkgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggLSAxICkge1xuICAgICAgICAgICAgICAvLyAgb3V0ICs9IGB7XFxuICAke291dHB1dH1cXG4gIH1cXG5gXG4gICAgICAgICAgICAgIC8vfWVsc2V7XG4gICAgICAgICAgICAgICAgb3V0ICs9IFxuICAgICAgYCBpZiggJHtjb25kfSA9PT0gMSApIHtcbiAgICAgICR7b3V0cHV0fVxuICAgICAgICB9IGVsc2UgYFxuICAgICAgICAgICAgICAvL31cbiAgICAgICAgICAgIH0qL1xuICAgIH1cblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ19vdXQnO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUgKyAnX291dCcsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkoYXJnc1swXSkgPyBhcmdzWzBdIDogYXJncztcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbY29uZGl0aW9uc11cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnaW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIF9nZW4ucGFyYW1ldGVycy5wdXNoKHRoaXMubmFtZSk7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiB0aGlzLm5hbWU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgdmFyIGlucHV0ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgaW5wdXQuaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBpbnB1dC5uYW1lID0gbmFtZSAhPT0gdW5kZWZpbmVkID8gbmFtZSA6ICcnICsgaW5wdXQuYmFzZW5hbWUgKyBpbnB1dC5pZDtcbiAgaW5wdXRbMF0gPSB7XG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICBpZiAoIV9nZW4ucGFyYW1ldGVycy5pbmNsdWRlcyhpbnB1dC5uYW1lKSkgX2dlbi5wYXJhbWV0ZXJzLnB1c2goaW5wdXQubmFtZSk7XG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMF0nO1xuICAgIH1cbiAgfTtcbiAgaW5wdXRbMV0gPSB7XG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICBpZiAoIV9nZW4ucGFyYW1ldGVycy5pbmNsdWRlcyhpbnB1dC5uYW1lKSkgX2dlbi5wYXJhbWV0ZXJzLnB1c2goaW5wdXQubmFtZSk7XG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMV0nO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gaW5wdXQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGxpYnJhcnkgPSB7XG4gIGV4cG9ydDogZnVuY3Rpb24gX2V4cG9ydChkZXN0aW5hdGlvbikge1xuICAgIGlmIChkZXN0aW5hdGlvbiA9PT0gd2luZG93KSB7XG4gICAgICBkZXN0aW5hdGlvbi5zc2QgPSBsaWJyYXJ5Lmhpc3Rvcnk7IC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluOyAvLyBpbiBpcyBhIGtleXdvcmQgaW4gamF2YXNjcmlwdFxuICAgICAgZGVzdGluYXRpb24udGVybmFyeSA9IGxpYnJhcnkuc3dpdGNoOyAvLyBzd2l0Y2ggaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcblxuICAgICAgZGVsZXRlIGxpYnJhcnkuaGlzdG9yeTtcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LmluO1xuICAgICAgZGVsZXRlIGxpYnJhcnkuc3dpdGNoO1xuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oZGVzdGluYXRpb24sIGxpYnJhcnkpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxpYnJhcnksICdzYW1wbGVyYXRlJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiBsaWJyYXJ5Lmdlbi5zYW1wbGVyYXRlO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHt9XG4gICAgfSk7XG5cbiAgICBsaWJyYXJ5LmluID0gZGVzdGluYXRpb24uaW5wdXQ7XG4gICAgbGlicmFyeS5oaXN0b3J5ID0gZGVzdGluYXRpb24uc3NkO1xuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeTtcblxuICAgIGRlc3RpbmF0aW9uLmNsaXAgPSBsaWJyYXJ5LmNsYW1wO1xuICB9LFxuXG5cbiAgZ2VuOiByZXF1aXJlKCcuL2dlbi5qcycpLFxuXG4gIGFiczogcmVxdWlyZSgnLi9hYnMuanMnKSxcbiAgcm91bmQ6IHJlcXVpcmUoJy4vcm91bmQuanMnKSxcbiAgcGFyYW06IHJlcXVpcmUoJy4vcGFyYW0uanMnKSxcbiAgYWRkOiByZXF1aXJlKCcuL2FkZC5qcycpLFxuICBzdWI6IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gIG11bDogcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgZGl2OiByZXF1aXJlKCcuL2Rpdi5qcycpLFxuICBhY2N1bTogcmVxdWlyZSgnLi9hY2N1bS5qcycpLFxuICBjb3VudGVyOiByZXF1aXJlKCcuL2NvdW50ZXIuanMnKSxcbiAgc2luOiByZXF1aXJlKCcuL3Npbi5qcycpLFxuICBjb3M6IHJlcXVpcmUoJy4vY29zLmpzJyksXG4gIHRhbjogcmVxdWlyZSgnLi90YW4uanMnKSxcbiAgdGFuaDogcmVxdWlyZSgnLi90YW5oLmpzJyksXG4gIGFzaW46IHJlcXVpcmUoJy4vYXNpbi5qcycpLFxuICBhY29zOiByZXF1aXJlKCcuL2Fjb3MuanMnKSxcbiAgYXRhbjogcmVxdWlyZSgnLi9hdGFuLmpzJyksXG4gIHBoYXNvcjogcmVxdWlyZSgnLi9waGFzb3IuanMnKSxcbiAgZGF0YTogcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gIHBlZWs6IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICBjeWNsZTogcmVxdWlyZSgnLi9jeWNsZS5qcycpLFxuICBoaXN0b3J5OiByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgZGVsdGE6IHJlcXVpcmUoJy4vZGVsdGEuanMnKSxcbiAgZmxvb3I6IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgY2VpbDogcmVxdWlyZSgnLi9jZWlsLmpzJyksXG4gIG1pbjogcmVxdWlyZSgnLi9taW4uanMnKSxcbiAgbWF4OiByZXF1aXJlKCcuL21heC5qcycpLFxuICBzaWduOiByZXF1aXJlKCcuL3NpZ24uanMnKSxcbiAgZGNibG9jazogcmVxdWlyZSgnLi9kY2Jsb2NrLmpzJyksXG4gIG1lbW86IHJlcXVpcmUoJy4vbWVtby5qcycpLFxuICByYXRlOiByZXF1aXJlKCcuL3JhdGUuanMnKSxcbiAgd3JhcDogcmVxdWlyZSgnLi93cmFwLmpzJyksXG4gIG1peDogcmVxdWlyZSgnLi9taXguanMnKSxcbiAgY2xhbXA6IHJlcXVpcmUoJy4vY2xhbXAuanMnKSxcbiAgcG9rZTogcmVxdWlyZSgnLi9wb2tlLmpzJyksXG4gIGRlbGF5OiByZXF1aXJlKCcuL2RlbGF5LmpzJyksXG4gIGZvbGQ6IHJlcXVpcmUoJy4vZm9sZC5qcycpLFxuICBtb2Q6IHJlcXVpcmUoJy4vbW9kLmpzJyksXG4gIHNhaDogcmVxdWlyZSgnLi9zYWguanMnKSxcbiAgbm9pc2U6IHJlcXVpcmUoJy4vbm9pc2UuanMnKSxcbiAgbm90OiByZXF1aXJlKCcuL25vdC5qcycpLFxuICBndDogcmVxdWlyZSgnLi9ndC5qcycpLFxuICBndGU6IHJlcXVpcmUoJy4vZ3RlLmpzJyksXG4gIGx0OiByZXF1aXJlKCcuL2x0LmpzJyksXG4gIGx0ZTogcmVxdWlyZSgnLi9sdGUuanMnKSxcbiAgYm9vbDogcmVxdWlyZSgnLi9ib29sLmpzJyksXG4gIGdhdGU6IHJlcXVpcmUoJy4vZ2F0ZS5qcycpLFxuICB0cmFpbjogcmVxdWlyZSgnLi90cmFpbi5qcycpLFxuICBzbGlkZTogcmVxdWlyZSgnLi9zbGlkZS5qcycpLFxuICBpbjogcmVxdWlyZSgnLi9pbi5qcycpLFxuICB0NjA6IHJlcXVpcmUoJy4vdDYwLmpzJyksXG4gIG10b2Y6IHJlcXVpcmUoJy4vbXRvZi5qcycpLFxuICBsdHA6IHJlcXVpcmUoJy4vbHRwLmpzJyksIC8vIFRPRE86IHRlc3RcbiAgZ3RwOiByZXF1aXJlKCcuL2d0cC5qcycpLCAvLyBUT0RPOiB0ZXN0XG4gIHN3aXRjaDogcmVxdWlyZSgnLi9zd2l0Y2guanMnKSxcbiAgbXN0b3NhbXBzOiByZXF1aXJlKCcuL21zdG9zYW1wcy5qcycpLCAvLyBUT0RPOiBuZWVkcyB0ZXN0LFxuICBzZWxlY3RvcjogcmVxdWlyZSgnLi9zZWxlY3Rvci5qcycpLFxuICB1dGlsaXRpZXM6IHJlcXVpcmUoJy4vdXRpbGl0aWVzLmpzJyksXG4gIHBvdzogcmVxdWlyZSgnLi9wb3cuanMnKSxcbiAgYXR0YWNrOiByZXF1aXJlKCcuL2F0dGFjay5qcycpLFxuICBkZWNheTogcmVxdWlyZSgnLi9kZWNheS5qcycpLFxuICB3aW5kb3dzOiByZXF1aXJlKCcuL3dpbmRvd3MuanMnKSxcbiAgZW52OiByZXF1aXJlKCcuL2Vudi5qcycpLFxuICBhZDogcmVxdWlyZSgnLi9hZC5qcycpLFxuICBhZHNyOiByZXF1aXJlKCcuL2Fkc3IuanMnKSxcbiAgaWZlbHNlOiByZXF1aXJlKCcuL2lmZWxzZWlmLmpzJyksXG4gIGJhbmc6IHJlcXVpcmUoJy4vYmFuZy5qcycpLFxuICBhbmQ6IHJlcXVpcmUoJy4vYW5kLmpzJyksXG4gIHBhbjogcmVxdWlyZSgnLi9wYW4uanMnKSxcbiAgZXE6IHJlcXVpcmUoJy4vZXEuanMnKSxcbiAgbmVxOiByZXF1aXJlKCcuL25lcS5qcycpXG59O1xuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYnJhcnk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2x0JyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICc7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pIHx8IGlzTmFOKHRoaXMuaW5wdXRzWzFdKSkge1xuICAgICAgb3V0ICs9ICcoKCAnICsgaW5wdXRzWzBdICsgJyA8ICcgKyBpbnB1dHNbMV0gKyAnKSB8IDAgICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDwgaW5wdXRzWzFdID8gMSA6IDA7XG4gICAgfVxuICAgIG91dCArPSAnXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBsdCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGx0LmlucHV0cyA9IFt4LCB5XTtcbiAgbHQubmFtZSA9ICdsdCcgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBsdDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2x0ZScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSB8fCBpc05hTih0aGlzLmlucHV0c1sxXSkpIHtcbiAgICAgIG91dCArPSAnKCAnICsgaW5wdXRzWzBdICsgJyA8PSAnICsgaW5wdXRzWzFdICsgJyB8IDAgICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDw9IGlucHV0c1sxXSA/IDEgOiAwO1xuICAgIH1cbiAgICBvdXQgKz0gJ1xcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgbHQgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBsdC5pbnB1dHMgPSBbeCwgeV07XG4gIGx0Lm5hbWUgPSAnbHRlJyArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIGx0O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnbHRwJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgPSAnKCcgKyBpbnB1dHNbMF0gKyAnICogKCggJyArIGlucHV0c1swXSArICcgPCAnICsgaW5wdXRzWzFdICsgJyApIHwgMCApICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoaW5wdXRzWzBdIDwgaW5wdXRzWzFdIHwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgbHRwID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbHRwLmlucHV0cyA9IFt4LCB5XTtcblxuICByZXR1cm4gbHRwO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnbWF4JyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pIHx8IGlzTmFOKGlucHV0c1sxXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLm1heCkpO1xuXG4gICAgICBvdXQgPSAnZ2VuLm1heCggJyArIGlucHV0c1swXSArICcsICcgKyBpbnB1dHNbMV0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1heChwYXJzZUZsb2F0KGlucHV0c1swXSksIHBhcnNlRmxvYXQoaW5wdXRzWzFdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgbWF4ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbWF4LmlucHV0cyA9IFt4LCB5XTtcblxuICByZXR1cm4gbWF4O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ21lbW8nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1swXSArICdcXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCBtZW1vTmFtZSkge1xuICB2YXIgbWVtbyA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIG1lbW8uaW5wdXRzID0gW2luMV07XG4gIG1lbW8uaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBtZW1vLm5hbWUgPSBtZW1vTmFtZSAhPT0gdW5kZWZpbmVkID8gbWVtb05hbWUgKyAnXycgKyBfZ2VuLmdldFVJRCgpIDogJycgKyBtZW1vLmJhc2VuYW1lICsgbWVtby5pZDtcblxuICByZXR1cm4gbWVtbztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ21pbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSB8fCBpc05hTihpbnB1dHNbMV0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgTWF0aC5taW4pKTtcblxuICAgICAgb3V0ID0gJ2dlbi5taW4oICcgKyBpbnB1dHNbMF0gKyAnLCAnICsgaW5wdXRzWzFdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5taW4ocGFyc2VGbG9hdChpbnB1dHNbMF0pLCBwYXJzZUZsb2F0KGlucHV0c1sxXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIG1pbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIG1pbi5pbnB1dHMgPSBbeCwgeV07XG5cbiAgcmV0dXJuIG1pbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSwgaW4yKSB7XG4gICAgdmFyIHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IC41O1xuXG4gICAgdmFyIHVnZW4gPSBtZW1vKGFkZChtdWwoaW4xLCBzdWIoMSwgdCkpLCBtdWwoaW4yLCB0KSkpO1xuICAgIHVnZW4ubmFtZSA9ICdtaXgnICsgZ2VuLmdldFVJRCgpO1xuXG4gICAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIG1vZCA9IHtcbiAgICBpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgICBvdXQgPSAnKCcsXG4gICAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbMF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKGxhc3ROdW1iZXIpLFxuICAgICAgICAgIG1vZEF0RW5kID0gZmFsc2U7XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgIGlmIChpID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGlzTnVtYmVyVWdlbiA9IGlzTmFOKHYpLFxuICAgICAgICAgICAgaXNGaW5hbElkeCA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxO1xuXG4gICAgICAgIGlmICghbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgJSB2O1xuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyICsgJyAlICcgKyB2O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0ZpbmFsSWR4KSBvdXQgKz0gJyAlICc7XG4gICAgICB9KTtcblxuICAgICAgb3V0ICs9ICcpJztcblxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIG1vZDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdtc3Rvc2FtcHMnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IHZvaWQgMDtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgX2dlbi5zYW1wbGVyYXRlICsgJyAvIDEwMDAgKiAnICsgaW5wdXRzWzBdICsgJyBcXG5cXG4nO1xuXG4gICAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IG91dDtcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbdGhpcy5uYW1lLCBvdXRdO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBfZ2VuLnNhbXBsZXJhdGUgLyAxMDAwICogdGhpcy5pbnB1dHNbMF07XG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0O1xuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgbXN0b3NhbXBzID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbXN0b3NhbXBzLmlucHV0cyA9IFt4XTtcbiAgbXN0b3NhbXBzLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIG1zdG9zYW1wcztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ210b2YnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLmV4cCkpO1xuXG4gICAgICBvdXQgPSAnKCAnICsgdGhpcy50dW5pbmcgKyAnICogZ2VuLmV4cCggLjA1Nzc2MjI2NSAqICgnICsgaW5wdXRzWzBdICsgJyAtIDY5KSApICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKC4wNTc3NjIyNjUgKiAoaW5wdXRzWzBdIC0gNjkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCBwcm9wcykge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IHR1bmluZzogNDQwIH07XG5cbiAgaWYgKHByb3BzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24ocHJvcHMuZGVmYXVsdHMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwgZGVmYXVsdHMpO1xuICB1Z2VuLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgbXVsID0ge1xuICAgIGlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICAgIG91dCA9ICcoJyxcbiAgICAgICAgICBzdW0gPSAxLFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBtdWxBdEVuZCA9IGZhbHNlLFxuICAgICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZTtcblxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgaWYgKGlzTmFOKHYpKSB7XG4gICAgICAgICAgb3V0ICs9IHY7XG4gICAgICAgICAgaWYgKGkgPCBpbnB1dHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgbXVsQXRFbmQgPSB0cnVlO1xuICAgICAgICAgICAgb3V0ICs9ICcgKiAnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBzdW0gPSB2O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdW0gKj0gcGFyc2VGbG9hdCh2KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbnVtQ291bnQrKztcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChhbHJlYWR5RnVsbFN1bW1lZCkgb3V0ID0gJyc7XG5cbiAgICAgIGlmIChudW1Db3VudCA+IDApIHtcbiAgICAgICAgb3V0ICs9IG11bEF0RW5kIHx8IGFscmVhZHlGdWxsU3VtbWVkID8gc3VtIDogJyAqICcgKyBzdW07XG4gICAgICB9XG5cbiAgICAgIGlmICghYWxyZWFkeUZ1bGxTdW1tZWQpIG91dCArPSAnKSc7XG5cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBtdWw7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnbmVxJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9IC8qdGhpcy5pbnB1dHNbMF0gIT09IHRoaXMuaW5wdXRzWzFdID8gMSA6Ki8nICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAoJyArIGlucHV0c1swXSArICcgIT09ICcgKyBpbnB1dHNbMV0gKyAnKSB8IDBcXG5cXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCBpbjIpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgaW4yXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ25vaXNlJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwO1xuXG4gICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnOiBNYXRoLnJhbmRvbSB9KTtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9IGdlbi5ub2lzZSgpXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIG5vaXNlID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gbm9pc2U7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdub3QnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSkge1xuICAgICAgb3V0ID0gJyggJyArIGlucHV0c1swXSArICcgPT09IDAgPyAxIDogMCApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gIWlucHV0c1swXSA9PT0gMCA/IDEgOiAwO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIG5vdCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIG5vdC5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIG5vdDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwYW4nLFxuICBpbml0VGFibGU6IGZ1bmN0aW9uIGluaXRUYWJsZSgpIHtcbiAgICB2YXIgYnVmZmVyTCA9IG5ldyBGbG9hdDMyQXJyYXkoMTAyNCksXG4gICAgICAgIGJ1ZmZlclIgPSBuZXcgRmxvYXQzMkFycmF5KDEwMjQpO1xuXG4gICAgdmFyIHNxcnRUd29PdmVyVHdvID0gTWF0aC5zcXJ0KDIpIC8gMjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTAyNDsgaSsrKSB7XG4gICAgICB2YXIgcGFuID0gLTEgKyBpIC8gMTAyNCAqIDI7XG4gICAgICBidWZmZXJMW2ldID0gc3FydFR3b092ZXJUd28gKiAoTWF0aC5jb3MocGFuKSAtIE1hdGguc2luKHBhbikpO1xuICAgICAgYnVmZmVyUltpXSA9IHNxcnRUd29PdmVyVHdvICogKE1hdGguY29zKHBhbikgKyBNYXRoLnNpbihwYW4pKTtcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5wYW5MID0gZGF0YShidWZmZXJMLCAxLCB7IGltbXV0YWJsZTogdHJ1ZSB9KTtcbiAgICBnZW4uZ2xvYmFscy5wYW5SID0gZGF0YShidWZmZXJSLCAxLCB7IGltbXV0YWJsZTogdHJ1ZSB9KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGVmdElucHV0LCByaWdodElucHV0KSB7XG4gIHZhciBwYW4gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IC41O1xuICB2YXIgcHJvcGVydGllcyA9IGFyZ3VtZW50c1szXTtcblxuICBpZiAoZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkKSBwcm90by5pbml0VGFibGUoKTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2xlZnRJbnB1dCwgcmlnaHRJbnB1dF0sXG4gICAgbGVmdDogbXVsKGxlZnRJbnB1dCwgcGVlayhnZW4uZ2xvYmFscy5wYW5MLCBwYW4sIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pKSxcbiAgICByaWdodDogbXVsKHJpZ2h0SW5wdXQsIHBlZWsoZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSlcbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGFyYW0nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICBfZ2VuLnBhcmFtcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIHRoaXMpKTtcblxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmluaXRpYWxWYWx1ZTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJ21lbW9yeVsnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJ10nO1xuXG4gICAgcmV0dXJuIF9nZW4ubWVtb1t0aGlzLm5hbWVdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHByb3BOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAwO1xuICB2YXIgdmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDA7XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBpZiAodHlwZW9mIHByb3BOYW1lICE9PSAnc3RyaW5nJykge1xuICAgIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyBfZ2VuLmdldFVJRCgpO1xuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gcHJvcE5hbWU7XG4gIH0gZWxzZSB7XG4gICAgdWdlbi5uYW1lID0gcHJvcE5hbWU7XG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF07XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XSA9IHY7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gIH07XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGVlaycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGZ1bmN0aW9uQm9keSA9IHZvaWQgMCxcbiAgICAgICAgbmV4dCA9IHZvaWQgMCxcbiAgICAgICAgbGVuZ3RoSXNMb2cyID0gdm9pZCAwLFxuICAgICAgICBpZHggPSB2b2lkIDA7XG5cbiAgICBpZHggPSBpbnB1dHNbMV07XG4gICAgbGVuZ3RoSXNMb2cyID0gKE1hdGgubG9nMih0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCkgfCAwKSA9PT0gTWF0aC5sb2cyKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoKTtcblxuICAgIGlmICh0aGlzLm1vZGUgIT09ICdzaW1wbGUnKSB7XG5cbiAgICAgIGZ1bmN0aW9uQm9keSA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICA9ICcgKyBpZHggKyAnLCBcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19waGFzZSA9ICcgKyAodGhpcy5tb2RlID09PSAnc2FtcGxlcycgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEpKSArICcsIFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4ID0gJyArIHRoaXMubmFtZSArICdfcGhhc2UgfCAwLFxcbic7XG5cbiAgICAgIGlmICh0aGlzLmJvdW5kbW9kZSA9PT0gJ3dyYXAnKSB7XG4gICAgICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgPyAnKCAnICsgdGhpcy5uYW1lICsgJ19pbmRleCArIDEgKSAmICgnICsgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKyAnIC0gMSknIDogdGhpcy5uYW1lICsgJ19pbmRleCArIDEgPj0gJyArIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoICsgJyA/ICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4ICsgMSAtICcgKyB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCArICcgOiAnICsgdGhpcy5uYW1lICsgJ19pbmRleCArIDEnO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmJvdW5kbW9kZSA9PT0gJ2NsYW1wJykge1xuICAgICAgICBuZXh0ID0gdGhpcy5uYW1lICsgJ19pbmRleCArIDEgPj0gJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEpICsgJyA/ICcgKyAodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxKSArICcgOiAnICsgdGhpcy5uYW1lICsgJ19pbmRleCArIDEnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dCA9IHRoaXMubmFtZSArICdfaW5kZXggKyAxJztcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaW50ZXJwID09PSAnbGluZWFyJykge1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gJyAgICAgICcgKyB0aGlzLm5hbWUgKyAnX2ZyYWMgID0gJyArIHRoaXMubmFtZSArICdfcGhhc2UgLSAnICsgdGhpcy5uYW1lICsgJ19pbmRleCxcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19iYXNlICA9IG1lbW9yeVsgJyArIHRoaXMubmFtZSArICdfZGF0YUlkeCArICAnICsgdGhpcy5uYW1lICsgJ19pbmRleCBdLFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX25leHQgID0gJyArIG5leHQgKyAnLCc7XG5cbiAgICAgICAgaWYgKHRoaXMuYm91bmRtb2RlID09PSAnaWdub3JlJykge1xuICAgICAgICAgIGZ1bmN0aW9uQm9keSArPSAnXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfb3V0ICAgPSAnICsgdGhpcy5uYW1lICsgJ19pbmRleCA+PSAnICsgKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSkgKyAnIHx8ICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4IDwgMCA/IDAgOiAnICsgdGhpcy5uYW1lICsgJ19iYXNlICsgJyArIHRoaXMubmFtZSArICdfZnJhYyAqICggbWVtb3J5WyAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICsgJyArIHRoaXMubmFtZSArICdfbmV4dCBdIC0gJyArIHRoaXMubmFtZSArICdfYmFzZSApXFxuXFxuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmdW5jdGlvbkJvZHkgKz0gJ1xcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX291dCAgID0gJyArIHRoaXMubmFtZSArICdfYmFzZSArICcgKyB0aGlzLm5hbWUgKyAnX2ZyYWMgKiAoIG1lbW9yeVsgJyArIHRoaXMubmFtZSArICdfZGF0YUlkeCArICcgKyB0aGlzLm5hbWUgKyAnX25leHQgXSAtICcgKyB0aGlzLm5hbWUgKyAnX2Jhc2UgKVxcblxcbic7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSAnICAgICAgJyArIHRoaXMubmFtZSArICdfb3V0ID0gbWVtb3J5WyAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICsgJyArIHRoaXMubmFtZSArICdfaW5kZXggXVxcblxcbic7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG1vZGUgaXMgc2ltcGxlXG4gICAgICBmdW5jdGlvbkJvZHkgPSAnbWVtb3J5WyAnICsgaWR4ICsgJyArICcgKyBpbnB1dHNbMF0gKyAnIF0nO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb25Cb2R5O1xuICAgIH1cblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ19vdXQnO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUgKyAnX291dCcsIGZ1bmN0aW9uQm9keV07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRhdGEsIGluZGV4LCBwcm9wZXJ0aWVzKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6IDEsIG1vZGU6ICdwaGFzZScsIGludGVycDogJ2xpbmVhcicsIGJvdW5kbW9kZTogJ3dyYXAnIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgZGF0YTogZGF0YSxcbiAgICBkYXRhTmFtZTogZGF0YS5uYW1lLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbmRleCwgZGF0YV1cbiAgfSwgZGVmYXVsdHMpO1xuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHByb3RvID0geyBiYXNlbmFtZTogJ3BoYXNvcicgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmcmVxdWVuY3kgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDE7XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIHByb3BzID0gYXJndW1lbnRzWzJdO1xuXG4gIGlmIChwcm9wcyA9PT0gdW5kZWZpbmVkKSBwcm9wcyA9IHsgbWluOiAtMSB9O1xuXG4gIHZhciByYW5nZSA9IChwcm9wcy5tYXggfHwgMSkgLSBwcm9wcy5taW47XG5cbiAgdmFyIHVnZW4gPSB0eXBlb2YgZnJlcXVlbmN5ID09PSAnbnVtYmVyJyA/IGFjY3VtKGZyZXF1ZW5jeSAqIHJhbmdlIC8gZ2VuLnNhbXBsZXJhdGUsIHJlc2V0LCBwcm9wcykgOiBhY2N1bShtdWwoZnJlcXVlbmN5LCAxIC8gZ2VuLnNhbXBsZXJhdGUgLyAoMSAvIHJhbmdlKSksIHJlc2V0LCBwcm9wcyk7XG5cbiAgdWdlbi5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcC5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncG9rZScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGRhdGFOYW1lID0gJ21lbW9yeScsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBpZHggPSB2b2lkIDAsXG4gICAgICAgIG91dCA9IHZvaWQgMCxcbiAgICAgICAgd3JhcHBlZCA9IHZvaWQgMDtcblxuICAgIGlkeCA9IHRoaXMuZGF0YS5nZW5cblxuICAgIC8vZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICAvL3dyYXBwZWQgPSB3cmFwKCB0aGlzLmlucHV0c1sxXSwgMCwgdGhpcy5kYXRhTGVuZ3RoICkuZ2VuKClcbiAgICAvL2lkeCA9IHdyYXBwZWRbMF1cbiAgICAvL2dlbi5mdW5jdGlvbkJvZHkgKz0gd3JhcHBlZFsxXVxuICAgICgpO3ZhciBvdXRwdXRTdHIgPSB0aGlzLmlucHV0c1sxXSA9PT0gMCA/ICcgICcgKyBkYXRhTmFtZSArICdbICcgKyBpZHggKyAnIF0gPSAnICsgaW5wdXRzWzBdICsgJ1xcbicgOiAnICAnICsgZGF0YU5hbWUgKyAnWyAnICsgaWR4ICsgJyArICcgKyBpbnB1dHNbMV0gKyAnIF0gPSAnICsgaW5wdXRzWzBdICsgJ1xcbic7XG5cbiAgICBpZiAodGhpcy5pbmxpbmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgX2dlbi5mdW5jdGlvbkJvZHkgKz0gb3V0cHV0U3RyO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3RoaXMuaW5saW5lLCBvdXRwdXRTdHJdO1xuICAgIH1cbiAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRhdGEsIHZhbHVlLCBpbmRleCwgcHJvcGVydGllcykge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IGNoYW5uZWxzOiAxIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgZGF0YTogZGF0YSxcbiAgICBkYXRhTmFtZTogZGF0YS5uYW1lLFxuICAgIGRhdGFMZW5ndGg6IGRhdGEuYnVmZmVyLmxlbmd0aCxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbdmFsdWUsIGluZGV4XVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIF9nZW4uaGlzdG9yaWVzLnNldCh1Z2VuLm5hbWUsIHVnZW4pO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3BvdycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSB8fCBpc05hTihpbnB1dHNbMV0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdwb3cnOiBNYXRoLnBvdyB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5wb3coICcgKyBpbnB1dHNbMF0gKyAnLCAnICsgaW5wdXRzWzFdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBpbnB1dHNbMF0gPT09ICdzdHJpbmcnICYmIGlucHV0c1swXVswXSA9PT0gJygnKSB7XG4gICAgICAgIGlucHV0c1swXSA9IGlucHV0c1swXS5zbGljZSgxLCAtMSk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGlucHV0c1sxXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzFdWzBdID09PSAnKCcpIHtcbiAgICAgICAgaW5wdXRzWzFdID0gaW5wdXRzWzFdLnNsaWNlKDEsIC0xKTtcbiAgICAgIH1cblxuICAgICAgb3V0ID0gTWF0aC5wb3cocGFyc2VGbG9hdChpbnB1dHNbMF0pLCBwYXJzZUZsb2F0KGlucHV0c1sxXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIHBvdyA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHBvdy5pbnB1dHMgPSBbeCwgeV07XG4gIHBvdy5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIHBvdy5uYW1lID0gcG93LmJhc2VuYW1lICsgJ3twb3cuaWR9JztcblxuICByZXR1cm4gcG93O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpLFxuICAgIGRlbHRhID0gcmVxdWlyZSgnLi9kZWx0YS5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3JhdGUnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgcGhhc2UgPSBoaXN0b3J5KCksXG4gICAgICAgIGluTWludXMxID0gaGlzdG9yeSgpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmaWx0ZXIgPSB2b2lkIDAsXG4gICAgICAgIHN1bSA9IHZvaWQgMCxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIHRoaXMpKTtcblxuICAgIG91dCA9ICcgdmFyICcgKyB0aGlzLm5hbWUgKyAnX2RpZmYgPSAnICsgaW5wdXRzWzBdICsgJyAtICcgKyBnZW5OYW1lICsgJy5sYXN0U2FtcGxlXFxuICBpZiggJyArIHRoaXMubmFtZSArICdfZGlmZiA8IC0uNSApICcgKyB0aGlzLm5hbWUgKyAnX2RpZmYgKz0gMVxcbiAgJyArIGdlbk5hbWUgKyAnLnBoYXNlICs9ICcgKyB0aGlzLm5hbWUgKyAnX2RpZmYgKiAnICsgaW5wdXRzWzFdICsgJ1xcbiAgaWYoICcgKyBnZW5OYW1lICsgJy5waGFzZSA+IDEgKSAnICsgZ2VuTmFtZSArICcucGhhc2UgLT0gMVxcbiAgJyArIGdlbk5hbWUgKyAnLmxhc3RTYW1wbGUgPSAnICsgaW5wdXRzWzBdICsgJ1xcbic7XG4gICAgb3V0ID0gJyAnICsgb3V0O1xuXG4gICAgcmV0dXJuIFtnZW5OYW1lICsgJy5waGFzZScsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSwgcmF0ZSkge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHBoYXNlOiAwLFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgcmF0ZV1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdyb3VuZCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGgucm91bmQpKTtcblxuICAgICAgb3V0ID0gJ2dlbi5yb3VuZCggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgucm91bmQocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciByb3VuZCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHJvdW5kLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gcm91bmQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc2FoJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIF9nZW4uZGF0YVt0aGlzLm5hbWVdID0gMDtcbiAgICBfZ2VuLmRhdGFbdGhpcy5uYW1lICsgJ19jb250cm9sJ10gPSAwO1xuXG4gICAgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICcgPSBnZW4uZGF0YS4nICsgdGhpcy5uYW1lICsgJ19jb250cm9sLFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX3RyaWdnZXIgPSAnICsgaW5wdXRzWzFdICsgJyA+ICcgKyBpbnB1dHNbMl0gKyAnID8gMSA6IDBcXG5cXG4gIGlmKCAnICsgdGhpcy5uYW1lICsgJ190cmlnZ2VyICE9PSAnICsgdGhpcy5uYW1lICsgJyAgKSB7XFxuICAgIGlmKCAnICsgdGhpcy5uYW1lICsgJ190cmlnZ2VyID09PSAxICkgXFxuICAgICAgZ2VuLmRhdGEuJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzBdICsgJ1xcbiAgICBnZW4uZGF0YS4nICsgdGhpcy5uYW1lICsgJ19jb250cm9sID0gJyArIHRoaXMubmFtZSArICdfdHJpZ2dlclxcbiAgfVxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9ICdnZW4uZGF0YS4nICsgdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFsnZ2VuLmRhdGEuJyArIHRoaXMubmFtZSwgJyAnICsgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCBjb250cm9sKSB7XG4gIHZhciB0aHJlc2hvbGQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IDA7XG4gIHZhciBwcm9wZXJ0aWVzID0gYXJndW1lbnRzWzNdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdDogMCB9O1xuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgY29udHJvbCwgdGhyZXNob2xkXVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc2VsZWN0b3InLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDA7XG5cbiAgICBzd2l0Y2ggKGlucHV0cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnB1dHNbMV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGlucHV0c1swXSArICcgPT09IDEgPyAnICsgaW5wdXRzWzFdICsgJyA6ICcgKyBpbnB1dHNbMl0gKyAnXFxuXFxuJztcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbdGhpcy5uYW1lICsgJ19vdXQnLCBvdXRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG91dCA9ICcgdmFyICcgKyB0aGlzLm5hbWUgKyAnX291dCA9IDBcXG4gIHN3aXRjaCggJyArIGlucHV0c1swXSArICcgKyAxICkge1xcbic7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBvdXQgKz0gJyAgICBjYXNlICcgKyBpICsgJzogJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGlucHV0c1tpXSArICc7IGJyZWFrO1xcbic7XG4gICAgICAgIH1cblxuICAgICAgICBvdXQgKz0gJyAgfVxcblxcbic7XG5cbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbdGhpcy5uYW1lICsgJ19vdXQnLCAnICcgKyBvdXRdO1xuICAgIH1cblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ19vdXQnO1xuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGlucHV0cyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGlucHV0c1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogaW5wdXRzXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnc2lnbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGguc2lnbikpO1xuXG4gICAgICBvdXQgPSAnZ2VuLnNpZ24oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpZ24ocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBzaWduID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgc2lnbi5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIHNpZ247XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc2luJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBNYXRoLnNpbiB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5zaW4oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpbihwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHNpbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHNpbi5pbnB1dHMgPSBbeF07XG4gIHNpbi5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIHNpbi5uYW1lID0gc2luLmJhc2VuYW1lICsgJ3tzaW4uaWR9JztcblxuICByZXR1cm4gc2luO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJyksXG4gICAgZ3QgPSByZXF1aXJlKCcuL2d0LmpzJyksXG4gICAgZGl2ID0gcmVxdWlyZSgnLi9kaXYuanMnKSxcbiAgICBfc3dpdGNoID0gcmVxdWlyZSgnLi9zd2l0Y2guanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gICAgdmFyIHNsaWRlVXAgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDE7XG4gICAgdmFyIHNsaWRlRG93biA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMTtcblxuICAgIHZhciB5MSA9IGhpc3RvcnkoMCksXG4gICAgICAgIGZpbHRlciA9IHZvaWQgMCxcbiAgICAgICAgc2xpZGVBbW91bnQgPSB2b2lkIDA7XG5cbiAgICAvL3kgKG4pID0geSAobi0xKSArICgoeCAobikgLSB5IChuLTEpKS9zbGlkZSkgXG4gICAgc2xpZGVBbW91bnQgPSBfc3dpdGNoKGd0KGluMSwgeTEub3V0KSwgc2xpZGVVcCwgc2xpZGVEb3duKTtcblxuICAgIGZpbHRlciA9IG1lbW8oYWRkKHkxLm91dCwgZGl2KHN1YihpbjEsIHkxLm91dCksIHNsaWRlQW1vdW50KSkpO1xuXG4gICAgeTEuaW4oZmlsdGVyKTtcblxuICAgIHJldHVybiBmaWx0ZXI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIHN1YiA9IHtcbiAgICBpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgICBvdXQgPSAwLFxuICAgICAgICAgIGRpZmYgPSAwLFxuICAgICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbMF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKGxhc3ROdW1iZXIpLFxuICAgICAgICAgIHN1YkF0RW5kID0gZmFsc2UsXG4gICAgICAgICAgaGFzVWdlbnMgPSBmYWxzZSxcbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IDA7XG5cbiAgICAgIHRoaXMuaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkpIGhhc1VnZW5zID0gdHJ1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaGFzVWdlbnMpIHtcbiAgICAgICAgLy8gc3RvcmUgaW4gdmFyaWFibGUgZm9yIGZ1dHVyZSByZWZlcmVuY2VcbiAgICAgICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gKCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQgPSAnKCc7XG4gICAgICB9XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgIGlmIChpID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGlzTnVtYmVyVWdlbiA9IGlzTmFOKHYpLFxuICAgICAgICAgICAgaXNGaW5hbElkeCA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxO1xuXG4gICAgICAgIGlmICghbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgLSB2O1xuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZWVkc1BhcmVucyA9IHRydWU7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXIgKyAnIC0gJyArIHY7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRmluYWxJZHgpIG91dCArPSAnIC0gJztcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobmVlZHNQYXJlbnMpIHtcbiAgICAgICAgb3V0ICs9ICcpJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dCA9IG91dC5zbGljZSgxIC8vIHJlbW92ZSBvcGVuaW5nIHBhcmVuXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNVZ2Vucykgb3V0ICs9ICdcXG4nO1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IGhhc1VnZW5zID8gW3RoaXMubmFtZSwgb3V0XSA6IG91dDtcblxuICAgICAgaWYgKGhhc1VnZW5zKSBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH1cbiAgfTtcblxuICBzdWIubmFtZSA9ICdzdWInICsgc3ViLmlkO1xuXG4gIHJldHVybiBzdWI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc3dpdGNoJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIGlmIChpbnB1dHNbMV0gPT09IGlucHV0c1syXSkgcmV0dXJuIGlucHV0c1sxXTsgLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgaW5wdXRzWzBdICsgJyA9PT0gMSA/ICcgKyBpbnB1dHNbMV0gKyAnIDogJyArIGlucHV0c1syXSArICdcXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX291dCc7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSArICdfb3V0Jywgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udHJvbCkge1xuICB2YXIgaW4xID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAxO1xuICB2YXIgaW4yID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAwO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtjb250cm9sLCBpbjEsIGluMl1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAndDYwJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgcmV0dXJuVmFsdWUgPSB2b2lkIDA7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCAnZXhwJywgTWF0aC5leHApKTtcblxuICAgICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gZ2VuLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gJyArIGlucHV0c1swXSArICcgKVxcblxcbic7XG5cbiAgICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gb3V0O1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IFt0aGlzLm5hbWUsIG91dF07XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguZXhwKC02LjkwNzc1NTI3ODkyMSAvIGlucHV0c1swXSk7XG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0O1xuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgdDYwID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgdDYwLmlucHV0cyA9IFt4XTtcbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIHQ2MDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICd0YW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IE1hdGgudGFuIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLnRhbiggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgdGFuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgdGFuLmlucHV0cyA9IFt4XTtcbiAgdGFuLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgdGFuLm5hbWUgPSB0YW4uYmFzZW5hbWUgKyAne3Rhbi5pZH0nO1xuXG4gIHJldHVybiB0YW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAndGFuaCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAndGFuaCc6IE1hdGgudGFuaCB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi50YW5oKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW5oKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgdGFuaCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHRhbmguaW5wdXRzID0gW3hdO1xuICB0YW5oLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgdGFuaC5uYW1lID0gdGFuaC5iYXNlbmFtZSArICd7dGFuaC5pZH0nO1xuXG4gIHJldHVybiB0YW5oO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGx0ID0gcmVxdWlyZSgnLi9sdC5qcycpLFxuICAgIHBoYXNvciA9IHJlcXVpcmUoJy4vcGhhc29yLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZnJlcXVlbmN5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiA0NDA7XG4gIHZhciBwdWxzZXdpZHRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAuNTtcblxuICB2YXIgZ3JhcGggPSBsdChhY2N1bShkaXYoZnJlcXVlbmN5LCA0NDEwMCkpLCAuNSk7XG5cbiAgZ3JhcGgubmFtZSA9ICd0cmFpbicgKyBnZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIGdyYXBoO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKTtcblxudmFyIGlzU3RlcmVvID0gZmFsc2U7XG5cbnZhciB1dGlsaXRpZXMgPSB7XG4gIGN0eDogbnVsbCxcblxuICBjbGVhcjogZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH07XG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIHYoKTtcbiAgICB9KTtcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9LFxuICBjcmVhdGVDb250ZXh0OiBmdW5jdGlvbiBjcmVhdGVDb250ZXh0KCkge1xuICAgIHZhciBBQyA9IHR5cGVvZiBBdWRpb0NvbnRleHQgPT09ICd1bmRlZmluZWQnID8gd2Via2l0QXVkaW9Db250ZXh0IDogQXVkaW9Db250ZXh0O1xuICAgIHRoaXMuY3R4ID0gbmV3IEFDKCk7XG4gICAgZ2VuLnNhbXBsZXJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlO1xuXG4gICAgdmFyIHN0YXJ0ID0gZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICBpZiAodHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgc3RhcnQpO1xuXG4gICAgICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgICAgICAgLy8gcmVxdWlyZWQgdG8gc3RhcnQgYXVkaW8gdW5kZXIgaU9TIDZcbiAgICAgICAgICAgIHZhciBteVNvdXJjZSA9IHV0aWxpdGllcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24pO1xuICAgICAgICAgICAgbXlTb3VyY2Uubm90ZU9uKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBzdGFydCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcjogZnVuY3Rpb24gY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIHRoaXMubm9kZSA9IHRoaXMuY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvcigxMDI0LCAwLCAyKSwgdGhpcy5jbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSwgdGhpcy5jYWxsYmFjayA9IHRoaXMuY2xlYXJGdW5jdGlvbjtcblxuICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uIChhdWRpb1Byb2Nlc3NpbmdFdmVudCkge1xuICAgICAgdmFyIG91dHB1dEJ1ZmZlciA9IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50Lm91dHB1dEJ1ZmZlcjtcblxuICAgICAgdmFyIGxlZnQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCksXG4gICAgICAgICAgcmlnaHQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMSk7XG5cbiAgICAgIGZvciAodmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGxlZnQubGVuZ3RoOyBzYW1wbGUrKykge1xuICAgICAgICBpZiAoIWlzU3RlcmVvKSB7XG4gICAgICAgICAgbGVmdFtzYW1wbGVdID0gcmlnaHRbc2FtcGxlXSA9IHV0aWxpdGllcy5jYWxsYmFjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBvdXQgPSB1dGlsaXRpZXMuY2FsbGJhY2soKTtcbiAgICAgICAgICBsZWZ0W3NhbXBsZV0gPSBvdXRbMF07XG4gICAgICAgICAgcmlnaHRbc2FtcGxlXSA9IG91dFsxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm5vZGUuY29ubmVjdCh0aGlzLmN0eC5kZXN0aW5hdGlvblxuXG4gICAgLy90aGlzLm5vZGUuY29ubmVjdCggdGhpcy5hbmFseXplciApXG5cbiAgICApO3JldHVybiB0aGlzO1xuICB9LFxuICBwbGF5R3JhcGg6IGZ1bmN0aW9uIHBsYXlHcmFwaChncmFwaCwgZGVidWcpIHtcbiAgICB2YXIgbWVtID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiA0NDEwMCAqIDEwO1xuXG4gICAgdXRpbGl0aWVzLmNsZWFyKCk7XG4gICAgaWYgKGRlYnVnID09PSB1bmRlZmluZWQpIGRlYnVnID0gZmFsc2U7XG5cbiAgICBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoZ3JhcGgpO1xuXG4gICAgdXRpbGl0aWVzLmNhbGxiYWNrID0gZ2VuLmNyZWF0ZUNhbGxiYWNrKGdyYXBoLCBtZW0sIGRlYnVnKTtcblxuICAgIGlmICh1dGlsaXRpZXMuY29uc29sZSkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUodXRpbGl0aWVzLmNhbGxiYWNrLnRvU3RyaW5nKCkpO1xuXG4gICAgcmV0dXJuIHV0aWxpdGllcy5jYWxsYmFjaztcbiAgfSxcbiAgbG9hZFNhbXBsZTogZnVuY3Rpb24gbG9hZFNhbXBsZShzb3VuZEZpbGVQYXRoLCBkYXRhKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vcGVuKCdHRVQnLCBzb3VuZEZpbGVQYXRoLCB0cnVlKTtcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGF1ZGlvRGF0YSA9IHJlcS5yZXNwb25zZTtcblxuICAgICAgICB1dGlsaXRpZXMuY3R4LmRlY29kZUF1ZGlvRGF0YShhdWRpb0RhdGEsIGZ1bmN0aW9uIChidWZmZXIpIHtcbiAgICAgICAgICBkYXRhLmJ1ZmZlciA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTtcbiAgICAgICAgICByZXNvbHZlKGRhdGEuYnVmZmVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmVxLnNlbmQoKTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG59O1xuXG51dGlsaXRpZXMuY2xlYXIuY2FsbGJhY2tzID0gW107XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbGl0aWVzOyIsIid1c2Ugc3RyaWN0JztcblxuLypcbiAqIG1hbnkgd2luZG93cyBoZXJlIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vY29yYmFuYnJvb2svZHNwLmpzL2Jsb2IvbWFzdGVyL2RzcC5qc1xuICogc3RhcnRpbmcgYXQgbGluZSAxNDI3XG4gKiB0YWtlbiA4LzE1LzE2XG4qL1xuXG52YXIgd2luZG93cyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBiYXJ0bGV0dDogZnVuY3Rpb24gYmFydGxldHQobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAyIC8gKGxlbmd0aCAtIDEpICogKChsZW5ndGggLSAxKSAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKTtcbiAgfSxcbiAgYmFydGxldHRIYW5uOiBmdW5jdGlvbiBiYXJ0bGV0dEhhbm4obGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAwLjYyIC0gMC40OCAqIE1hdGguYWJzKGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMC41KSAtIDAuMzggKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKTtcbiAgfSxcbiAgYmxhY2ttYW46IGZ1bmN0aW9uIGJsYWNrbWFuKGxlbmd0aCwgaW5kZXgsIGFscGhhKSB7XG4gICAgdmFyIGEwID0gKDEgLSBhbHBoYSkgLyAyLFxuICAgICAgICBhMSA9IDAuNSxcbiAgICAgICAgYTIgPSBhbHBoYSAvIDI7XG5cbiAgICByZXR1cm4gYTAgLSBhMSAqIE1hdGguY29zKDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpICsgYTIgKiBNYXRoLmNvcyg0ICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKTtcbiAgfSxcbiAgY29zaW5lOiBmdW5jdGlvbiBjb3NpbmUobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiBNYXRoLmNvcyhNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSBNYXRoLlBJIC8gMik7XG4gIH0sXG4gIGdhdXNzOiBmdW5jdGlvbiBnYXVzcyhsZW5ndGgsIGluZGV4LCBhbHBoYSkge1xuICAgIHJldHVybiBNYXRoLnBvdyhNYXRoLkUsIC0wLjUgKiBNYXRoLnBvdygoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSAvIChhbHBoYSAqIChsZW5ndGggLSAxKSAvIDIpLCAyKSk7XG4gIH0sXG4gIGhhbW1pbmc6IGZ1bmN0aW9uIGhhbW1pbmcobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAwLjU0IC0gMC40NiAqIE1hdGguY29zKE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpO1xuICB9LFxuICBoYW5uOiBmdW5jdGlvbiBoYW5uKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSk7XG4gIH0sXG4gIGxhbmN6b3M6IGZ1bmN0aW9uIGxhbmN6b3MobGVuZ3RoLCBpbmRleCkge1xuICAgIHZhciB4ID0gMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMTtcbiAgICByZXR1cm4gTWF0aC5zaW4oTWF0aC5QSSAqIHgpIC8gKE1hdGguUEkgKiB4KTtcbiAgfSxcbiAgcmVjdGFuZ3VsYXI6IGZ1bmN0aW9uIHJlY3Rhbmd1bGFyKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gMTtcbiAgfSxcbiAgdHJpYW5ndWxhcjogZnVuY3Rpb24gdHJpYW5ndWxhcihsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIDIgLyBsZW5ndGggKiAobGVuZ3RoIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpO1xuICB9LFxuXG5cbiAgLy8gcGFyYWJvbGFcbiAgd2VsY2g6IGZ1bmN0aW9uIHdlbGNoKGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0KSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgdmFyIGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vcihzaGlmdCAqIGxlbmd0aCkpICUgbGVuZ3RoO1xuICAgIHZhciBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyO1xuXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdygoaW5kZXggLSBuXzFfb3ZlcjIpIC8gbl8xX292ZXIyLCAyKTtcbiAgfSxcbiAgaW52ZXJzZXdlbGNoOiBmdW5jdGlvbiBpbnZlcnNld2VsY2gobGVuZ3RoLCBfaW5kZXgsIGlnbm9yZSkge1xuICAgIHZhciBzaGlmdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMDtcblxuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIHZhciBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3Ioc2hpZnQgKiBsZW5ndGgpKSAlIGxlbmd0aDtcbiAgICB2YXIgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMjtcblxuICAgIHJldHVybiBNYXRoLnBvdygoaW5kZXggLSBuXzFfb3ZlcjIpIC8gbl8xX292ZXIyLCAyKTtcbiAgfSxcbiAgcGFyYWJvbGE6IGZ1bmN0aW9uIHBhcmFib2xhKGxlbmd0aCwgaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPD0gbGVuZ3RoIC8gMikge1xuICAgICAgcmV0dXJuIHdpbmRvd3MuaW52ZXJzZXdlbGNoKGxlbmd0aCAvIDIsIGluZGV4KSAtIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAxIC0gd2luZG93cy5pbnZlcnNld2VsY2gobGVuZ3RoIC8gMiwgaW5kZXggLSBsZW5ndGggLyAyKTtcbiAgICB9XG4gIH0sXG4gIGV4cG9uZW50aWFsOiBmdW5jdGlvbiBleHBvbmVudGlhbChsZW5ndGgsIGluZGV4LCBhbHBoYSkge1xuICAgIHJldHVybiBNYXRoLnBvdyhpbmRleCAvIGxlbmd0aCwgYWxwaGEpO1xuICB9LFxuICBsaW5lYXI6IGZ1bmN0aW9uIGxpbmVhcihsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIGluZGV4IC8gbGVuZ3RoO1xuICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yID0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnd3JhcCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvZGUgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBzaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIG1pbiA9IGlucHV0c1sxXSxcbiAgICAgICAgbWF4ID0gaW5wdXRzWzJdLFxuICAgICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGRpZmYgPSB2b2lkIDA7XG5cbiAgICAvL291dCA9IGAoKCgke2lucHV0c1swXX0gLSAke3RoaXMubWlufSkgJSAke2RpZmZ9ICArICR7ZGlmZn0pICUgJHtkaWZmfSArICR7dGhpcy5taW59KWBcbiAgICAvL2NvbnN0IGxvbmcgbnVtV3JhcHMgPSBsb25nKCh2LWxvKS9yYW5nZSkgLSAodiA8IGxvKTtcbiAgICAvL3JldHVybiB2IC0gcmFuZ2UgKiBkb3VibGUobnVtV3JhcHMpOyAgIFxuXG4gICAgaWYgKHRoaXMubWluID09PSAwKSB7XG4gICAgICBkaWZmID0gbWF4O1xuICAgIH0gZWxzZSBpZiAoaXNOYU4obWF4KSB8fCBpc05hTihtaW4pKSB7XG4gICAgICBkaWZmID0gbWF4ICsgJyAtICcgKyBtaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpZmYgPSBtYXggLSBtaW47XG4gICAgfVxuXG4gICAgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzBdICsgJ1xcbiAgaWYoICcgKyB0aGlzLm5hbWUgKyAnIDwgJyArIHRoaXMubWluICsgJyApICcgKyB0aGlzLm5hbWUgKyAnICs9ICcgKyBkaWZmICsgJ1xcbiAgZWxzZSBpZiggJyArIHRoaXMubmFtZSArICcgPiAnICsgdGhpcy5tYXggKyAnICkgJyArIHRoaXMubmFtZSArICcgLT0gJyArIGRpZmYgKyAnXFxuXFxuJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCAnICcgKyBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIG1pbiwgbWF4XVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWVtb3J5SGVscGVyID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc2l6ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDQwOTYgOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIG1lbXR5cGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBGbG9hdDMyQXJyYXkgOiBhcmd1bWVudHNbMV07XG5cbiAgICB2YXIgaGVscGVyID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcblxuICAgIE9iamVjdC5hc3NpZ24oaGVscGVyLCB7XG4gICAgICBoZWFwOiBuZXcgbWVtdHlwZShzaXplKSxcbiAgICAgIGxpc3Q6IHt9LFxuICAgICAgZnJlZUxpc3Q6IHt9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaGVscGVyO1xuICB9LFxuICBhbGxvYzogZnVuY3Rpb24gYWxsb2MoYW1vdW50KSB7XG4gICAgdmFyIGlkeCA9IC0xO1xuXG4gICAgaWYgKGFtb3VudCA+IHRoaXMuaGVhcC5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKCdBbGxvY2F0aW9uIHJlcXVlc3QgaXMgbGFyZ2VyIHRoYW4gaGVhcCBzaXplIG9mICcgKyB0aGlzLmhlYXAubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5mcmVlTGlzdCkge1xuICAgICAgdmFyIGNhbmRpZGF0ZVNpemUgPSB0aGlzLmZyZWVMaXN0W2tleV07XG5cbiAgICAgIGlmIChjYW5kaWRhdGVTaXplID49IGFtb3VudCkge1xuICAgICAgICBpZHggPSBrZXk7XG5cbiAgICAgICAgdGhpcy5saXN0W2lkeF0gPSBhbW91bnQ7XG5cbiAgICAgICAgaWYgKGNhbmRpZGF0ZVNpemUgIT09IGFtb3VudCkge1xuICAgICAgICAgIHZhciBuZXdJbmRleCA9IGlkeCArIGFtb3VudCxcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSB2b2lkIDA7XG5cbiAgICAgICAgICBmb3IgKHZhciBfa2V5IGluIHRoaXMubGlzdCkge1xuICAgICAgICAgICAgaWYgKF9rZXkgPiBuZXdJbmRleCkge1xuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZSA9IF9rZXkgLSBuZXdJbmRleDtcbiAgICAgICAgICAgICAgdGhpcy5mcmVlTGlzdFtuZXdJbmRleF0gPSBuZXdGcmVlU2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggaWR4ICE9PSAtMSApIGRlbGV0ZSB0aGlzLmZyZWVMaXN0WyBpZHggXVxuXG4gICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5saXN0KSxcbiAgICAgICAgICBsYXN0SW5kZXggPSB2b2lkIDA7XG5cbiAgICAgIGlmIChrZXlzLmxlbmd0aCkge1xuICAgICAgICAvLyBpZiBub3QgZmlyc3QgYWxsb2NhdGlvbi4uLlxuICAgICAgICBsYXN0SW5kZXggPSBwYXJzZUludChrZXlzW2tleXMubGVuZ3RoIC0gMV0pO1xuXG4gICAgICAgIGlkeCA9IGxhc3RJbmRleCArIHRoaXMubGlzdFtsYXN0SW5kZXhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWR4ID0gMDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5saXN0W2lkeF0gPSBhbW91bnQ7XG4gICAgfVxuXG4gICAgaWYgKGlkeCArIGFtb3VudCA+PSB0aGlzLmhlYXAubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBFcnJvcignTm8gYXZhaWxhYmxlIGJsb2NrcyByZW1haW4gc3VmZmljaWVudCBmb3IgYWxsb2NhdGlvbiByZXF1ZXN0LicpO1xuICAgIH1cbiAgICByZXR1cm4gaWR4O1xuICB9LFxuICBmcmVlOiBmdW5jdGlvbiBmcmVlKGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmxpc3RbaW5kZXhdICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgRXJyb3IoJ0NhbGxpbmcgZnJlZSgpIG9uIG5vbi1leGlzdGluZyBibG9jay4nKTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RbaW5kZXhdID0gMDtcblxuICAgIHZhciBzaXplID0gMDtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5saXN0KSB7XG4gICAgICBpZiAoa2V5ID4gaW5kZXgpIHtcbiAgICAgICAgc2l6ZSA9IGtleSAtIGluZGV4O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmZyZWVMaXN0W2luZGV4XSA9IHNpemU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5SGVscGVyO1xuIl19

/* IMPORTANT README
*
* This class depends on having access to a folder of soundfonts that have been converted to
* binary string representations. More specifically, soundfonts designed to work with MIDI.js:
*
* https://github.com/gleitz/midi-js-soundfonts
*
* At some point it would be nice to make another soundfont system, as MIDI.js does not support
* defining loop points.
*
* By default soundfonts should be found in a folder named 'resources/soundfonts' one level above
* the location of the gibberish.js library (or gibberish.min.js). You can pass a different path
* as the second argument to the Gibberish.SoundFont constructor; the first is the name of the soundfont
* minus the "-mp3.js" extension. So, for example:
*
* b = new Gibberish.SoundFont( 'choir_aahs' ).connect()
* b.note( 'C4' )
*
* Note that you can only use note names, not frequency values.
*/

(function() {
  var cents = function(base, _cents) { return base * Math.pow(2,_cents/1200) },
      MIDI = { Soundfont: { instruments: {} } },
      SF = MIDI.Soundfont
  
  // TODO: GET RID OF THIS GLOBAL!!!! It's in there because we're using soundfonts meant for MIDI.js
  window.MIDI = MIDI
  
  var getScript = function( scriptPath, handler ) {
    var oReq = new XMLHttpRequest();

    // oReq.addEventListener("progress", updateProgress, false);
    oReq.addEventListener("load", transferComplete, false);
    oReq.addEventListener("error", function(e){ console.log( "SF load error", e ) }, false);

    oReq.open( 'GET', scriptPath, true );
    oReq.send()

    function updateProgress (oEvent) {
      if (oEvent.lengthComputable) {
        var percentComplete = oEvent.loaded / oEvent.total;
        number.innerHTML = Math.round( percentComplete * 100 )

        var sizeString = new String( "" + oEvent.total )
        sizeString = sizeString[0] + '.' + sizeString[1] + ' MB'
        size.innerHTML = sizeString
      } else {
        // Unable to compute progress information since the total size is unknown
      }
    }

    function transferComplete( evt ) {
      var script = document.createElement('script')
      script.innerHTML = evt.srcElement ? evt.srcElement.responseText : evt.target.responseText
      document.querySelector( 'head' ).appendChild( script )
      handler( script ) 
    }
  }
  
  var Base64Binary = {
  	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	
  	// will return a  Uint8Array type
  	decodeArrayBuffer: function(input) {
  		var bytes = (input.length/4) * 3;
  		var ab = new ArrayBuffer(bytes);
  		this.decode(input, ab);
		
  		return ab;
  	},
	
  	decode: function(input, arrayBuffer) {
  		//get last chars to see if are valid
  		var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));		 
  		var lkey2 = this._keyStr.indexOf(input.charAt(input.length-2));		 
	
  		var bytes = (input.length/4) * 3;
  		if (lkey1 == 64) bytes--; //padding chars, so skip
  		if (lkey2 == 64) bytes--; //padding chars, so skip
		
  		var uarray;
  		var chr1, chr2, chr3;
  		var enc1, enc2, enc3, enc4;
  		var i = 0;
  		var j = 0;
		
  		if (arrayBuffer)
  			uarray = new Uint8Array(arrayBuffer);
  		else
  			uarray = new Uint8Array(bytes);
		
  		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
  		for (i=0; i<bytes; i+=3) {	
  			//get the 3 octects in 4 ascii chars
  			enc1 = this._keyStr.indexOf(input.charAt(j++));
  			enc2 = this._keyStr.indexOf(input.charAt(j++));
  			enc3 = this._keyStr.indexOf(input.charAt(j++));
  			enc4 = this._keyStr.indexOf(input.charAt(j++));
	
  			chr1 = (enc1 << 2) | (enc2 >> 4);
  			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
  			chr3 = ((enc3 & 3) << 6) | enc4;
	
  			uarray[i] = chr1;			
  			if (enc3 != 64) uarray[i+1] = chr2;
  			if (enc4 != 64) uarray[i+2] = chr3;
  		}
	
  		return uarray;	
  	}
  }
    
  Gibberish.SoundFont = function( instrumentFileName, pathToResources ) {
    var that = this
    Gibberish.extend(this, {
      'instrumentFileName': instrumentFileName,
      name:'soundfont',
      properties: {
        amp:1,
        pan:0
      },
      playing:[],
      buffers:{},
      onload: null,
      out:[0,0],
      isLoaded: false,
      resourcePath: pathToResources || './resources/soundfonts/',
      
      callback: function( amp, pan ) {
        var val = 0
        for( var i = this.playing.length -1; i >= 0; i-- ) {
          var note = this.playing[ i ]
          
          val += this.interpolate( note.buffer, note.phase )
          
          note.phase += note.increment
          if( note.phase > note.length ) {
            this.playing.splice( this.playing.indexOf( note ), 1 )
          }
        }
        
        return this.panner( val * amp, pan, this.out );
      }.bind( this ),
      
      note: function( name, amp, cents ) {
        if( this.isLoaded ) {
          this.playing.push({
            buffer:this.buffers[ name ],
            phase:0,
            increment: cents || 0,
            length:this.buffers[ name ].length,
            'amp': isNaN( amp ) ? 1 : amp
          })
        }
      },
      interpolate: Gibberish.interpolate.bind( this ),
      panner: Gibberish.makePanner()
    })
    .init()
    .oscillatorInit()
    
    if( typeof arguments[0] === 'object' && arguments[0].instrumentFileName ) {
      this.instrumentFileName = arguments[0].instrumentFileName
    }
    
    if( !SF.instruments[ this.instrumentFileName ] ) {
    
      getScript( 'resources/soundfonts/' + this.instrumentFileName + '-mp3.js', function() {
        
        var font = SF[ this.instrumentFileName ]
        
        if( typeof SF.instruments[ this.instrumentFileName ] === 'undefined' ) {
          SF.instruments[ this.instrumentFileName ] = {}
        }
        
        this.buffers = SF.instruments[ this.instrumentFileName ]
        
        var count = 0
        for( var note in font ) {
          count++
          !function() {
            var _note = note
            
            var base = SF[ this.instrumentFileName ][ _note ].split(",")[1]
            var arrayBuffer = Base64Binary.decodeArrayBuffer( base );
            
            Gibberish.context.decodeAudioData( arrayBuffer, function( _buffer ) {
              SF.instruments[ this.instrumentFileName ][ _note ] = _buffer.getChannelData( 0 )
              count--
              if( count <= 0 ) { 
                console.log("Soundfont " + this.instrumentFileName + " is loaded.")
                this.isLoaded = true
                if( this.onload ) this.onload()
              }
            }.bind( this ), function(e) { console.log("ERROR", e.err, arguments, _note ) } )
            
          }.bind( this )()
        }
        
      }.bind( this ) )
    }else{
      this.buffers = SF.instruments[ this.instrumentFileName ]
      this.isLoaded = true
      setTimeout( function() { if( this.onload ) this.onload() }.bind( this ), 0 )
    }
    return this
  }
  Gibberish.SoundFont.prototype = Gibberish._oscillator;
})()
  
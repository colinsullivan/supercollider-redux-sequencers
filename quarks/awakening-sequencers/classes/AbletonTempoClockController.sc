AbletonTempoClockController : Object {
  // the actual TempoClock instance
  var <>clock = false,
    store,
    clockOffsetSeconds;

  *new {
    arg params;

    ^super.new().init(params);
  }
  init {
    arg params;
    var me = this;
    
    // reference to our StateStore
    store = params['store'];
    clockOffsetSeconds = params['clockOffsetSeconds'];

    store.subscribe({
      me.handleStateChange();
    });
  }

  isReady {
    ^(clock != false);
  }

  beats {
    ^clock.beats;
  }

  handleStateChange {
    var state = store.getState();
    var beat = state.abletonlink.beat;
    var bpm = state.abletonlink.bpm;
    var tempo;
    //var secondsPerBeat;
    var beatFloor = beat.floor();
    //var noteFreq;
   
    if (bpm == false, {
      ^this;    
    }, {
      tempo = bpm / 60.0;
    });

    if (clock == false, {
      "initializing TempoClock...".postln();
      clock = TempoClock.new(tempo: tempo, beats: beat + (tempo * clockOffsetSeconds));
      "TempoClock initialized.".postln();
    }, {
      clock.beats = beat + (tempo * clockOffsetSeconds);
      //"clock.beats:".postln;
      //clock.beats.postln;
    });

  }
}

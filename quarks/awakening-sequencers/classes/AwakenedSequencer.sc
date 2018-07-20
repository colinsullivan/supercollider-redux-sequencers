/**
 *  @file       AwakenedSequencer.sc
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the GPLv3 license.
 **/

/**
 *  @class        AwakenedSequencer
 *
 *  @classdesc    A framework for playing a stream in sync with a clock.
 *  Subclasses handle setting up the stream and patch that the stream is
 *  playing.
 **/
AwakenedSequencer : Object {

  // reference to our state store
  var store,
    // the key for this sequencer (as a symbol) in the sequencers list in the
    // state tree
    sequencerId,
    // last known state
    <>currentState,
    // if we are sending our sequence output to a SuperCollider synth, do so
    // through an instance of the cruciallib's [Patch](https://github.com/crucialfelix/crucial-library)
    // abstraction
    // patch could be false if just MIDI out
    patch,
    stream,
    // a patch needs an audio output channel
    <audioOut,
    // the MIDI output for this sequencer
    <midiOut,
    // Currently, built to be an AbletonTempoClockController
    clockController,
    // number representing SC audio output channel
    outputBus,
    streamPlayer,
    // if this sequencer uses buffers this is a reference to the
    // `BufferManager` instance
    bufManager,
    clock = false;

  *new {
    arg params;

    ^super.new.init(params);
  }

  getStateSlice {
    //var stateAddressComponents,
      //stateSlice = store.getState();
    //// get slice of state tree
    //stateAddressComponents = sequencerId.split($.);
    //while({
      //(stateAddressComponents.size() > 0);
    //}, {
      //stateSlice = stateSlice[stateAddressComponents.removeAt(0).asSymbol()];
    //});
    //^stateSlice;
    var state = store.getState();
    ^state.sequencers[sequencerId.asSymbol()];
  }

  isReady {
    ^currentState.isReady;
  }

  init {
    arg params;

    store = params['store'];
    sequencerId = params['sequencerId'];

    bufManager = params['bufManager'];
    
    if (params['outputBus'] == nil, {
      outputBus = 0;
    }, {
      outputBus = params['outputBus'];
    });

    currentState = this.getStateSlice();
    if (params['clockController'] != nil, {
      clockController = params['clockController']
    }, {
      Exception.new("clockController not provided").throw();
    });

    if (clockController.isReady(), {
      clock = clockController.clock;
    });

    audioOut = this.initAudioOut();
    midiOut = this.initMidiOut();
    patch = this.initPatch();
    stream = this.initStream();

    // grab initial state
    this.handleStateChange();

    // watch state store for updates
    store.subscribe({
      this.handleStateChange();
    });
  }
  
  initAudioOut {
    arg parentOutputChannel;
    ^MixerChannel.new(
      "AwakenedSequencer[" ++ currentState.sequencerId ++ "]" ,
      Server.default,
      2, 2,
      outbus: outputBus
    );
  }

  initMidiOut {
    if (currentState.midiOutDeviceName != false, {
      ^MIDIOut.newByName(
        currentState.midiOutDeviceName,
        currentState.midiOutPortName
      ).latency_(Server.default.latency);
    }, {
      ^false;
    });
  }

  handleStateChange {
    var state = store.getState(),
      lastState = currentState;
    currentState = this.getStateSlice();

    //"AwakenedSequencer.handleStateChange".postln();

    if (currentState.isReady == false, {
      if (clock == false, {
        "looking for clock...".postln();

        if (clockController.isReady(), {
          clock = clockController.clock;
        });

      });

      // TODO: what else is essential here ?
      if (clock != false, {
        if (currentState.playQuant != false, {
          if (currentState.stopQuant != false, {
            "dispatching ready..".postln();
            store.dispatch((
              type: "AWAKENING-SEQUENCERS-SEQ_READY",
              payload: (
                sequencerId: sequencerId
              )
            ));
          });    
        });    
      });
    });


    // if readyness changes
    if (currentState.isReady != lastState.isReady, {
      lastState.isReady = currentState.isReady;
      // go into playingState
      switch(currentState.playingState)
        {"QUEUED"} {
          this.queue();
        }
        //{"PLAYING"} {
          //this.play();
        //}
        {"STOP_QUEUED"} {
          this.queueStop();
        }
    });


    // if playing state has changed
    if (currentState.playingState != lastState.playingState, {
      //"AwakenedSequencer::playingState changed".postln();
      //"lastState.playingState:".postln;
      //lastState.playingState.postln;
      lastState.playingState = currentState.playingState;
      //"currentState.playingState:".postln;
      //currentState.playingState.postln;
      switch(currentState.playingState)
        {"REQUEUED"} {
          this.queue(true);
        }
        {"QUEUED"} {
          this.queue();
        }
        //{"PLAYING"} {
          //this.play();
        //}
        {"STOP_QUEUED"} {
          this.queueStop();
        }
        {"STOPPED"} {
          this.stop();
        }
    });

  }

  initStream {
    // subclasses implement this method to create a pattern generator
    // and return its stream
    ^false;
  }

  initPatch {
    // subclasses implement this method to create a sound generator driven
    // by the stream
    ^false;
  }

  queue {
    arg requeue = false;
    var prevStreamPlayer = streamPlayer;
    //"AwakenedSequencer.queue".postln();
    if ((streamPlayer != nil) && (requeue == false), {
      streamPlayer.stop();    
    });
    
    stream = this.initStream();

    /**
     *  The ReduxEventStreamPlayer instance will dispatch next beat
     *  events to the Redux state store as they happen.
     *
     *  https://github.com/colinsullivan/supercollider-redux
     */
    //streamPlayer = EventStreamPlayer.new(stream);
    streamPlayer = ReduxEventStreamPlayer.new(
      store,
      sequencerId,
      // this AwakenedSequencer's stream
      stream: stream
    );

    // if we are playing audio play player on the audio out channel
    if (audioOut != false, {
      audioOut.play(
        streamPlayer,
        (
          clock: clock,
          quant: currentState.playQuant
        )
      );
    });
    // if we are playing through a midi out, just call play on the stream
    if (midiOut != false, {
      streamPlayer.play(
        clock,
        // doReset: false (continue from where paused)
        false,
        currentState.playQuant
      );
    });

    clock.play({
      //"AwakenedSequencer: queued clock playing...".postln();
      // if we're still queued or requeued
      if (
        (currentState.playingState == "QUEUED")
        || (currentState.playingState == "REQUEUED")
      , {
        if (prevStreamPlayer != nil, {
          prevStreamPlayer.stop();    
        });
        // inform state store we've started playing
        //"Dispatching...".postln();
        store.dispatch((
          type: "AWAKENING-SEQUENCERS-SEQ_PLAYING",
          payload: (
            sequencerId: sequencerId
          )
        ));
      });
    }, currentState.playQuant);
  }

  //play {
    //"AwakenedSequencer.play".postln();

  //}

  queueStop {
    //"AwakenedSequencer.queueStop".postln();
    clock.play({
      // if we are still waiting to stop
      if (currentState.playingState == "STOP_QUEUED", {
        this.stop();
        store.dispatch((
          type: "AWAKENING-SEQUENCERS-SEQ_STOPPED",
          payload: (
            sequencerId: sequencerId
          )
        ));
      });
    }, currentState.stopQuant);
  }

  stop {
    //"AwakenedSequencer.stop".postln();
    // stop immediately
    if (streamPlayer != nil, {
      streamPlayer.stop();    
    });
    stream = this.initStream();
  }
}

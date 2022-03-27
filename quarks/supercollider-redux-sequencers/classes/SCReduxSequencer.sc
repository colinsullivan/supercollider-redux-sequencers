/**
 *  @file       SCReduxSequencer.sc
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the GPLv3 license.
 **/

/**
 *  @class        SCReduxSequencer
 *
 *  @classdesc    A framework for playing a stream in sync with a clock.
 *  Subclasses handle setting up the stream and patch that the stream is
 *  playing.
 **/
SCReduxSequencer : Object {

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
    // the MIDI output for this sequencer
    <midiOut,
    // number representing SC audio output channel
    <outputBus,
    streamPlayer,
    prevStreamPlayer,
    // if this sequencer uses buffers this is a reference to the
    // `BufferManager` instance
    bufManager,
    clock,
    params;

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
    arg inParams;

    params = inParams;
    store = params['store'];
    sequencerId = params['sequencerId'];

    bufManager = params['bufManager'];
    
    if (params['outputBus'] == nil, {
      outputBus = 0;
    }, {
      outputBus = params['outputBus'];
    });

    currentState = this.getStateSlice();
    if (params['clock'] != nil, {
      clock = params['clock'];
    }, {
      clock = TempoClock.default();
    });

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

    if (currentState.isReady == false, {
      if (currentState.playQuant != false, {
        if (currentState.stopQuant != false, {
          store.dispatch((
            type: SCReduxSequencers.actionTypes['SEQUENCER_READY'],
            payload: (
              sequencerId: sequencerId
            )
          ));
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
      lastState.playingState = currentState.playingState;
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

    // if prop change has been queued
    if (currentState.lastPropChangeQueuedAt != lastState.lastPropChangeQueuedAt, {
      this.queuePropChange();    
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
    prevStreamPlayer = streamPlayer;
    if (requeue == false, {
      this.stop();
    });

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
      // this SCReduxSequencer's stream
      stream: stream
    );

    streamPlayer.play(
      clock,
      // doReset: false (continue from where paused)
      false,
      currentState.playQuant,
    );

    clock.play({
      this.dispatchPlay();
    }, currentState.playQuant);
  }

  dispatchPlay {
    // if we're still queued or requeued
    if (
      (currentState.playingState == "QUEUED")
      || (currentState.playingState == "REQUEUED"), {
      if (prevStreamPlayer != nil, {
        prevStreamPlayer.stop();    
      });
      // inform state store we've started playing
      store.dispatch((
        type: SCReduxSequencers.actionTypes['SEQUENCER_PLAYING'],
        payload: (
          sequencerId: sequencerId
        )
      ));
    });
  }

  queueStop {
    clock.play({
      // if we are still waiting to stop
      if (currentState.playingState == "STOP_QUEUED", {
        this.stop();
        store.dispatch((
          type: SCReduxSequencers.actionTypes['SEQUENCER_STOPPED'],
          payload: (
            sequencerId: sequencerId
          )
        ));
      });
    }, currentState.stopQuant);
  }

  stop {
    // stop immediately
    if (streamPlayer != nil, {
      streamPlayer.stop();    
    });
    stream = this.initStream();
  }

  queuePropChange {
    var lastPropChangeQueuedAt = currentState.lastPropChangeQueuedAt;
    clock.play({
      if (currentState.lastPropChangeQueuedAt == lastPropChangeQueuedAt, {
        store.dispatch((
          type: SCReduxSequencers.actionTypes['SEQUENCER_PROP_CHANGED'],
          payload: (
            sequencerId: sequencerId
          )
        ));
      });
    }, currentState.propQuant);
  }
}


/**
 *  @class        GenerativeSequencer
 *
 *  @classdesc    A framework for playing a stream in sync with a clock.
 *  Subclasses handle setting up the stream and patch that the stream is
 *  playing.
 **/
GenerativeSequencer : Object {

  // reference to our state store
  var store,
    // the key for this sequencer (as a symbol) in the sequencers list in the
    // state tree
    sequencerId,
    // last known state
    currentState,
    // if we are sending our sequence output to a SuperCollider synth, do so
    // through an instance of the cruciallib's [Patch](https://github.com/crucialfelix/crucial-library)
    // abstraction
    patch,
    // a patch needs an audio output channel
    patchOutputChannel,
    //TODO: MIDI out
    seqOutputMIDI,
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
    ^state.sequencers[sequencerId];
  }

  isReady {
    ^currentState.isReady;
  }

  init {
    arg params;
    var me;

    store = params['store'];
    sequencerId = params['sequencerId'];

    bufManager = params['bufManager'];
    
    if (params['outputBus'] == nil, {
      outputBus = 0;
    }, {
      outputBus = params['outputBus'];
    });

    currentState = this.getStateSlice();
    clockController = ReduxAbletonTempoClockController.new((store: store, clockOffsetSeconds: currentState.clockOffsetSeconds));
    
    patchOutputChannel = this.create_output_channel();
    this.initPatch();
    this.initStream();

    // watch state store for updates
    me = this;
    store.subscribe({
      me.handleStateChange();
    });
  }
  
  create_output_channel {
    arg parentOutputChannel;
    ^MixerChannel.new(
      "GenerativeSequencer[" ++ currentState.name ++ "]" ,
      Server.default,
      2, 2,
      outbus: outputBus
    );
  }

  handleStateChange {
    var state = store.getState(),
      newState = this.getStateSlice();

    //"GenerativeSequencer.handleStateChange".postln();

    if (clock == false, {

      if (clockController.isReady(), {
        clock = clockController.clock;
        store.dispatch((
          type: "AWAKENING-SEQUENCERS-SEQ_READY",
          payload: (
            name: sequencerId
          )
        ));
      }, {
        ^this;
      });

    });

    // if readyness changes
    if (currentState.isReady != newState.isReady, {
      currentState.isReady = newState.isReady;
      // go into playingState    
      switch(currentState.playingState)
        {"QUEUED"} {
          this.queue();
        }
        {"PLAYING"} {
          this.play();
        }
        {"STOP_QUEUED"} {
          this.queueStop();
        }
    });


    // if playing state has changed
    if (currentState.playingState != newState.playingState, {
      currentState.playingState = newState.playingState;

      switch(newState.playingState)
        {"QUEUED"} {
          this.queue();
        }
        {"PLAYING"} {
          this.play();
        }
        {"STOP_QUEUED"} {
          this.queueStop();
        }
    });
    
    // if we are playing and the transport changes
    //if (
      //newState.beat != currentState.beat && newState.playingState == "PLAYING", {
      ////("[TAWSequencer (" + name + ")]: Transport has changed.").postln();
      //// schedule next beat
      //this.scheduleNextBeat();
    //});

    // if a parameter update needs to be queued ?
    //if (newState.queuedDispatch.size() > 0, {
      //// queue all parameters    
    //});

    //currentState = newState;

  }

  initStream {

  }

  getStream {
    
  }

  initPatch {

  }

  queue {
    "GenerativeSequencer.queue".postln();
    streamPlayer = ReduxEventStreamPlayer.new(
      store,
      sequencerId,
      stream: this.getStream()
    );
    // ddwMixerChannel hack required, this will only work
    // on a `ReduxEventStreamPlayer`
    patchOutputChannel.play(
      streamPlayer,
      (
        clock: clock,
        quant: currentState.playQuant
      )
    );
    clock.play({
      "Dispatching...".postln();
      store.dispatch((
        type: "AWAKENING-SEQUENCERS-SEQ_PLAYING",
        payload: (
          name: sequencerId
        )
      ));
    }, currentState.playQuant);
  }

  play {

  }

  queueStop {
    clock.play({
      "Dispatching...".postln();
      streamPlayer.stop();
      store.dispatch((
        type: "AWAKENING-SEQUENCERS-SEQ_STOPPED",
        payload: (
          name: sequencerId
        )
      ));
    }, currentState.stopQuant);
  }
}

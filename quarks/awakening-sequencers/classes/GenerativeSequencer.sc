GenerativeSequencer : Object {

  // reference to our state store
  var store,
    // the key for this sequencer (as a symbol) in the sequencers list in the
    // state tree
    sequencerId,
    // last known state
    <currentState,
    // if we are sending our sequence output to a SuperCollider synth, do so
    // through an instance of the cruciallib's [Patch](https://github.com/crucialfelix/crucial-library)
    // abstraction
    <>seqOutputPatch,
    // a patch needs an audio output channel
    <>patchOutputChannel,
    //TODO: MIDI out
    seqOutputMIDI,
    // Currently, built to be an AbletonTempoClockController
    clockController,
    // number representing SC audio output channel
    <>outputBus,
    <>clock = false;

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
    
    if (params['outputBus'] == nil, {
      this.outputBus = 0;
    }, {
      this.outputBus = params['outputBus'];
    });

    currentState = this.getStateSlice();
    clockController = ReduxAbletonTempoClockController.new((store: store, clockOffsetSeconds: currentState.clockOffsetSeconds));
    
    this.initOutputs();
    this.patchOutputChannel = this.create_output_channel();
    this.initSeqGenerator();

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
      outbus: this.outputBus
    );
  }

  handleStateChange {
    var state = store.getState(),
      newState = this.getStateSlice();

    //"GenerativeSequencer.handleStateChange".postln();

    if (this.clock == false, {

      if (clockController.isReady(), {
        this.clock = clockController.clock;
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


    // if playing state has changed
    if (currentState.playingState != newState.playingState, {

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

    currentState = newState;

  }

  initSeqGenerator {

  }

  initOutputs {

  }

  queue {
    //"GenerativeSequencer.queue".postln();
    this.clock.play({
      //"Dispatching...".postln();
      store.dispatch((
        type: "AWAKENING-SEQUENCERS-SEQ_PLAYING",
        payload: (
          name: sequencerId
        )
      ));
    }, [4, 0]);
  }

  play {

  }

  queueStop {
    this.clock.play({
      //"Dispatching...".postln();
      store.dispatch((
        type: "AWAKENING-SEQUENCERS-SEQ_STOPPED",
        payload: (
          name: sequencerId
        )
      ));
    }, [8, 0]);
  }
}

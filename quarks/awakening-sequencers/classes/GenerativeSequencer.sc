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
    seqOutputPatch,
    // a patch needs an audio output channel
    patchOutputChannel,
    //TODO: MIDI out
    seqOutputMIDI,
    // Currently, built to be an AbletonTempoClockController
    clockController,
    <>clock;

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

  init {
    arg params;
    var me;

    store = params['store'];
    sequencerId = params['sequencerId'];

    currentState = this.getStateSlice();
    "currentState:".postln;
    currentState.postln;

    clockController = AbletonTempoClockController.new((store: store, clockOffsetSeconds: currentState.clockOffsetSeconds));

    this.initOutputs();
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
      outbus: parentOutputChannel
    );
  }

  handleStateChange {
    var state = store.getState(),
      newState = this.getStateSlice();

    if (this.clock == false, {

      if (clockController.isReady(), {
        this.clock = clockController.clock;
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
    if (
      newState.transport.beat != currentState.transport.beat
      && newState.playingState == "PLAYING", {
      //("[TAWSequencer (" + name + ")]: Transport has changed.").postln();
      // schedule next beat
      this.scheduleNextBeat();
    });

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
    this.clock.play({
      store.dispatch((
        type: "AWAKENING-SEQUENCERS-SEQ_PLAYING",
        payload: (
          name: sequencerId
        )
      ));
    });
  }

  play {

  }

  queueStop {

  }

}

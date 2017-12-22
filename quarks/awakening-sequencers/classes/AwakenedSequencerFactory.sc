/**
 *  @class        AwakenedSequencerFactory
 *
 *  @classdesc    Watches state store for new sequencers and creates them.
 **/
AwakenedSequencerFactory : Object {
  classvar <>instance;
  // reference to our state store
  var store,
    bufManager,
    // our list of sequencers (AwakenedSequencer instances / subclasses)
    sequencers;

  *new {
    ^super.new.init();
  }

  *getInstance {
    if (this.instance == nil, {
      this.instance = AwakenedSequencerFactory.new();
    });
    ^this.instance;
  }

  setStore {
    arg theStore;
    store = theStore;
    this.handleStateChange();
    store.subscribe({
      this.handleStateChange();
    });
  }

  setBufManager {
    arg theBufManager;
    bufManager = theBufManager;
  }

  init {
    sequencers = IdentityDictionary.new();
  }

  handleStateChange {
    var state = store.getState();
    
    if ((state.sequencers != nil), {
      // for each sequencer in state
      state.sequencers.keysValuesDo({
        arg sequencerId, sequencerState;
        var sequencerClass = sequencerState['type'].asSymbol().asClass();

        // if it doesn't exist in our list
        if (sequencers[sequencerId] == nil, {
          // instantiate it
          sequencers[sequencerId] = sequencerClass.new((
            store: store,
            sequencerId: sequencerId,
            bufManager: bufManager
          ));
        });

      });
    });
  }
}

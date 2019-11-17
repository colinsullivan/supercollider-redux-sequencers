/**
 *  @file       SCReduxSequencerFactory.sc
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the GPLv3 license.
 **/

/**
 *  @class        SCReduxSequencerFactory
 *
 *  @classdesc    Watches state store for new sequencers and creates them.
 **/
SCReduxSequencerFactory : Object {
  classvar <>instance;
  // reference to our state store
  var store,
    bufManager,
    clock,
    // our list of sequencers (SCReduxSequencer instances / subclasses)
    sequencers;

  *new {
    ^super.new.init();
  }

  *getInstance {
    if (this.instance == nil, {
      this.instance = SCReduxSequencerFactory.new();
    });
    ^this.instance;
  }

  setStore {
    arg theStore;
    //"SCReduxSequencerFactory.setStore".postln();
    store = theStore;
    store.subscribe({
      this.handleStateChange();
    });
  }

  setBufManager {
    arg theBufManager;
    bufManager = theBufManager;
  }

  setClock {
    arg theClock;
    clock = theClock;
  }

  init {
    sequencers = IdentityDictionary.new();
  }

  handleStateChange {
    var state = store.getState();
    //"SCReduxSequencerFactory.handleStateChange".postln();
    
    if ((state.sequencers != nil), {
      // for each sequencer in state
      state.sequencers.keysValuesDo({
        arg sequencerId, sequencerState;
        var sequencerClass = sequencerState['classString'].asSymbol().asClass();

        // if class was not found, error
        if (sequencerClass == nil, {
          Error(
            "Class % not found, cannot instantiate sequencer".format(
              sequencerState['classString']
            )
          ).throw();
        });

        // if it doesn't exist in our list
        if (sequencers[sequencerId] == nil, {
          // instantiate it
          sequencers[sequencerId] = sequencerClass.new((
            store: store,
            sequencerId: sequencerId,
            bufManager: bufManager,
            clock: clock
          ));
        });

      });
    });
  }
}

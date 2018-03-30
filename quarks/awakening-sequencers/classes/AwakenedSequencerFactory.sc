/**
 *  @file       AwakenedSequencerFactory.sc
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the GPLv3 license.
 **/

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
    clockController,
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

  setClockController {
    arg theClockController;
    clockController = theClockController;
  }

  init {
    sequencers = IdentityDictionary.new();
    clockController = nil;
  }

  handleStateChange {
    var state = store.getState();
    
    if ((state.sequencers != nil), {
      // for each sequencer in state
      state.sequencers.keysValuesDo({
        arg sequencerId, sequencerState;
        var sequencerClass = sequencerState['type'].asSymbol().asClass();

        // if class was not found, error
        if (sequencerClass == nil, {
          Error(
            "Class % not found, cannot instantiate sequencer".format(
              sequencerState['type']
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
            clockController: clockController
          ));
        });

      });
    });
  }
}

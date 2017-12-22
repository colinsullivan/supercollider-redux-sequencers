#!/usr/bin/env node

/**
 *  @file       example.js
 *
 *	@desc       Ableton Link state changes into state store, forwarded to
 *	            SuperCollider replica state store.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/



import { createStore, combineReducers } from "redux"
import sc from 'supercolliderjs';
import supercolliderRedux from "supercollider-redux"
import abletonLinkRedux from "abletonlink-redux"
const SCStoreController = supercolliderRedux.SCStoreController;
const AbletonLinkController = abletonLinkRedux.AbletonLinkController;
import awakeningSequencers from "."

function create_default_state () {
  return {
    sequencers: {
      'metro': awakeningSequencers.create_default_sequencer('metro')
    }
  };
}

var rootReducer = combineReducers({
  [abletonLinkRedux.DEFAULT_MOUNT_POINT]: abletonLinkRedux.reducer,
  [supercolliderRedux.DEFAULT_MOUNT_POINT]: supercolliderRedux.reducer,
  sequencers: awakeningSequencers.reducer
});

var store = createStore(rootReducer, create_default_state());
sc.lang.boot().then((lang) => {
  var sclang = lang;
  sclang.interpret('API.mountDuplexOSC();').then(() => {
    var scStoreController = new SCStoreController(store);
    var abletonLinkController = new AbletonLinkController(store, 'abletonlink');
    
    let metroReady = false;
    store.subscribe(() => {
      let state = store.getState();
      let newMetroReady = state.sequencers.metro.isReady;

      if (newMetroReady != metroReady) {
        console.log("Queueing metronome...");
        metroReady = newMetroReady;
        store.dispatch(awakeningSequencers.actions.sequencerQueued('metro'));
      }
    });

    sclang.interpret(`
    var store, clockOffsetSeconds, sequencers;

    s.boot();

    s.waitForBoot({
      store = StateStore.getInstance();
      sequencers = IdentityDictionary.new();

      store.subscribe({
        var state = store.getState();

        if ((state.sequencers != nil) && (state.sequencers.metro != nil) && (sequencers['metro'] == nil), {
          "creating MetronomeSequencer".postln();
          sequencers['metro'] = MetronomeSequencer.new((store: store, sequencerId: 'metro'));
        });


      });
    })

    `);

    setInterval(() => {
      console.log("store.getState()");
      console.log(store.getState());
    }, 1000);

    setTimeout(() => {
      store.dispatch(awakeningSequencers.actions.sequencerStopQueued('metro'));
    }, 10000);
  });
});

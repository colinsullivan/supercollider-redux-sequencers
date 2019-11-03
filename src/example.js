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
const SCStoreController = supercolliderRedux.SCStoreController;
import SCReduxSequencers from "."

function create_default_state () {
  return {
    sequencers: {
      'metro': SCReduxSequencers.create_default_sequencer(
        'metro',
        'MetronomeSequencer'
      )
    }
  };
}

var rootReducer = combineReducers({
  [supercolliderRedux.DEFAULT_MOUNT_POINT]: supercolliderRedux.reducer,
  sequencers: SCReduxSequencers.reducer
});

var store = createStore(rootReducer, create_default_state());
sc.lang.boot().then((lang) => {
  var sclang = lang;
  sclang.interpret('API.mountDuplexOSC();').then(() => {
    var scStoreController = new SCStoreController(store);
    
    let metroReady = false;
    store.subscribe(() => {
      let state = store.getState();
      let newMetroReady = state.sequencers.metro.isReady;

      if (newMetroReady != metroReady) {
        console.log("Queueing metronome...");
        metroReady = newMetroReady;
        store.dispatch(SCReduxSequencers.actions.sequencerQueued('metro'));
      }
    });

    sclang.interpret(`
    var store, sequencerFactory;

    s.boot();

    s.waitForBoot({
      store = StateStore.getInstance();
      sequencerFactory = SCReduxSequencerFactory.getInstance();
      sequencerFactory.setStore(store);
    })

    `);

    setInterval(() => {
      console.log("store.getState()");
      console.log(store.getState());
    }, 1000);

    setTimeout(() => {
      store.dispatch(SCReduxSequencers.actions.sequencerStopQueued('metro'));
    }, 10000);
  });
});

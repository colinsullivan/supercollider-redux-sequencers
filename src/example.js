#!/usr/bin/env node

/**
 *  @file       example.js
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

import { createStore, combineReducers } from "redux";
import SCRedux from "supercollider-redux";
import SCReduxSequencers from ".";

function create_default_state() {
  return {
    sequencers: {
      metro: SCReduxSequencers.create_default_sequencer(
        "metro",
        "MetronomeSequencer"
      )
    }
  };
}

const rootReducer = combineReducers({
  [SCRedux.DEFAULT_MOUNT_POINT]: SCRedux.reducer,
  sequencers: SCReduxSequencers.reducer
});

const store = createStore(rootReducer, create_default_state());
const scReduxController = new SCRedux.SCReduxController(store, {
  interpretOnLangBoot: `
s.options.inDevice = "JackRouter";
s.options.outDevice = "JackRouter";
  `
});

scReduxController.boot().then(() => {
  scReduxController.getSCLang().interpret(
`
var store, sequencerFactory;

s.waitForBoot({
  store = SCReduxStore.getInstance();
  sequencerFactory = SCReduxSequencerFactory.getInstance();
  sequencerFactory.setStore(store);
})`
  );
  let metroReady = false;
  store.subscribe(() => {
    let state = store.getState();
    let newMetroReady = state.sequencers.metro.isReady;

    if (newMetroReady != metroReady) {
      console.log("Queueing metronome...");
      metroReady = newMetroReady;
      store.dispatch(SCReduxSequencers.actions.sequencerQueued("metro"));
    }
  });
  setInterval(() => {
    console.log("store.getState()");
    console.log(store.getState());
  }, 1000);

  setTimeout(() => {
    store.dispatch(SCReduxSequencers.actions.sequencerStopQueued("metro"));
  }, 10000);
});

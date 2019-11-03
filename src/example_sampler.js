#!/usr/bin/env node

/**
 *  @file       example_sampler.js
 *
 *	@desc       Ableton Link state changes into state store, forwarded to
 *	            SuperCollider replica state store.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

import path from "path";
import { createStore, combineReducers } from "redux";
import sc from "supercolliderjs";
import SCRedux from "supercollider-redux";
const SCStoreController = SCRedux.SCStoreController;
import SCReduxSequencers from ".";

function create_default_state() {
  return {
    sequencers: {
      sampler: SCReduxSequencers.create_default_sequencer(
        "sampler",
        "SamplerExampleSequencer"
      )
    }
  };
}

var rootReducer = combineReducers({
  [SCRedux.DEFAULT_MOUNT_POINT]: SCRedux.reducer,
  sequencers: SCReduxSequencers.reducer
});

var store = createStore(rootReducer, create_default_state());
sc.lang.boot().then(sclang => {
  sclang.interpret("API.mountDuplexOSC();").then(() => {
    var scStoreController = new SCStoreController(store);

    let isReady = false;
    store.subscribe(() => {
      let state = store.getState();
      let newIsReady = state.sequencers.sampler.isReady;

      if (newIsReady != isReady) {
        console.log("Queueing...");
        isReady = newIsReady;
        store.dispatch(SCReduxSequencers.actions.sequencerQueued("sampler"));
      }
    });

    sclang.interpret(`

  var store, sequencerFactory, bufManager, samples_done_loading;

  samples_done_loading = {

    "Samples done loading!".postln();

    store = StateStore.getInstance();
    sequencerFactory = SCReduxSequencerFactory.getInstance();
    sequencerFactory.setBufManager(bufManager);
    sequencerFactory.setStore(store);
  };

  bufManager = BufferManager.new((
    rootDir: "${path.resolve("./")}",
    doneLoadingCallback: samples_done_loading
  ));

  ServerBoot.add({
    bufManager.load_bufs([
      ["high-zap-desc_110bpm_2bar (Freeze)-1.wav", \\bloop]
    ]);
  });
  s.boot();
    `);

    setInterval(() => {
      console.log("store.getState()");
      console.log(store.getState());
    }, 1000);

    setTimeout(() => {
      store.dispatch(SCReduxSequencers.actions.sequencerStopQueued("sampler"));
    }, 10000);
  });
});

#!/usr/bin/env node

/**
 *  @file       parameter_example.js
 *
 *	@desc       Ableton Link state changes into state store, forwarded to
 *	            SuperCollider replica state store.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

import { createStore, combineReducers } from "redux";
import sc from "supercolliderjs";
import supercolliderRedux from "supercollider-redux";
const SCStoreController = supercolliderRedux.SCStoreController;
import SCReduxSequencers from ".";

function create_default_state() {
  var paramExampleSeq = SCReduxSequencers.create_default_sequencer(
    "paramexample",
    "ParamExampleSequencer"
  );
  paramExampleSeq.releaseTime = 0.3;
  return {
    sequencers: {
      paramexample: paramExampleSeq
    }
  };
}

var rootReducer = combineReducers({
  [supercolliderRedux.DEFAULT_MOUNT_POINT]: supercolliderRedux.reducer,
  sequencers: function(state, action) {
    state = SCReduxSequencers.reducer(state, action);

    switch (action.type) {
      case "PARAM_EXAMPLE_LEGATO":
        state.paramexample.releaseTime = 1.2;

        break;

      case "PARAM_EXAMPLE_STOCCATO":
        state.paramexample.releaseTime = 0.2;
        break;

      default:
        break;
    }

    return state;
  }
});

var store = createStore(rootReducer, create_default_state());
sc.lang.boot().then(sclang => {
  sclang.interpret("API.mountDuplexOSC();").then(() => {
    var scStoreController = new SCStoreController(store);

    let paramexampleReady = false;
    store.subscribe(() => {
      let state = store.getState();
      let newIsReady = state.sequencers.paramexample.isReady;

      if (newIsReady != paramexampleReady) {
        console.log("Queueing metronome...");
        paramexampleReady = newIsReady;
        store.dispatch(
          SCReduxSequencers.actions.sequencerQueued("paramexample")
        );
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
      store.dispatch({
        type: "PARAM_EXAMPLE_LEGATO"
      });

      setTimeout(() => {
        store.dispatch({
          type: "PARAM_EXAMPLE_STOCCATO"
        });

        setTimeout(() => {
          store.dispatch(
            SCReduxSequencers.actions.sequencerStopQueued("paramexample")
          );
        }, 6000);
      }, 6000);
    }, 6000);
  });
});

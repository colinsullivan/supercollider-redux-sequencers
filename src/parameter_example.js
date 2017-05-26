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



import { createStore } from "redux"
import supercolliderRedux from "supercollider-redux"
import abletonLinkRedux from "abletonlink-redux"
import SCStoreController from "./SCStoreController"
import AbletonLinkController from "./AbletonLinkController"
import awakeningSequencers from "."

function create_default_state () {
  return {
    sequencers: {
      'paramexample': awakeningSequencers.create_default_sequencer('paramexample')
    }
  };
}

var rootReducer = function (state = create_default_state(), action) {

  //state.simpleSound = simpleSound(state.simpleSound, action);
  state.abletonlink = abletonLinkRedux.reducer(state.abletonlink, action);
  state.supercolliderRedux = supercolliderRedux.reducer(state.supercolliderRedux, action);

  state.sequencers = awakeningSequencers.reducer(state.sequencers, action);

  return state;
  
};

var store = createStore(rootReducer);
var scStoreController = new SCStoreController(store);
var abletonLinkController = new AbletonLinkController(store, 'abletonlink');

let paramexampleReady = false;
store.subscribe(() => {
  let state = store.getState();
  let newIsReady = state.sequencers.paramexample.isReady;

  if (newIsReady != paramexampleReady) {
    console.log("Queueing metronome...");
    paramexampleReady = newIsReady;
    store.dispatch(awakeningSequencers.actions.sequencerQueued('paramexample'));
  }
});

setInterval(() => {
  console.log("store.getState()");
  console.log(store.getState());
}, 1000);

setTimeout(() => {
  store.dispatch(awakeningSequencers.actions.sequencerStopQueued('paramexample'));
}, 10000);


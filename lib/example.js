#!/usr/bin/env node
"use strict";

var _redux = require("redux");

var _supercolliderRedux = require("supercollider-redux");

var _supercolliderRedux2 = _interopRequireDefault(_supercolliderRedux);

var _abletonlinkRedux = require("abletonlink-redux");

var _abletonlinkRedux2 = _interopRequireDefault(_abletonlinkRedux);

var _SCStoreController = require("./SCStoreController");

var _SCStoreController2 = _interopRequireDefault(_SCStoreController);

var _ = require(".");

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var AbletonLinkController = _abletonlinkRedux2.default.AbletonLinkController;


function create_default_state() {
  return {
    sequencers: {
      'metro': _2.default.create_default_sequencer('metro')
    }
  };
}

var rootReducer = function rootReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : create_default_state();
  var action = arguments[1];


  state.abletonlink = _abletonlinkRedux2.default.reducer(state.abletonlink, action);
  state.supercolliderRedux = _supercolliderRedux2.default.reducer(state.supercolliderRedux, action);

  state.sequencers = _2.default.reducer(state.sequencers, action);

  return state;
};

var store = (0, _redux.createStore)(rootReducer);
var scStoreController = new _SCStoreController2.default(store);
var abletonLinkController = new AbletonLinkController(store, 'abletonlink');

var metroReady = false;
store.subscribe(function () {
  var state = store.getState();
  var newMetroReady = state.sequencers.metro.isReady;

  if (newMetroReady != metroReady) {
    console.log("Queueing metronome...");
    metroReady = newMetroReady;
    store.dispatch(_2.default.actions.sequencerQueued('metro'));
  }
});

setInterval(function () {
  console.log("store.getState()");
  console.log(store.getState());
}, 1000);

setTimeout(function () {
  store.dispatch(_2.default.actions.sequencerStopQueued('metro'));
}, 10000);
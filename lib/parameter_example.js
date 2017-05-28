#!/usr/bin/env node
"use strict";

var _redux = require("redux");

var _supercolliderRedux = require("supercollider-redux");

var _supercolliderRedux2 = _interopRequireDefault(_supercolliderRedux);

var _abletonlinkRedux = require("abletonlink-redux");

var _abletonlinkRedux2 = _interopRequireDefault(_abletonlinkRedux);

var _SCStoreController = require("./SCStoreController");

var _SCStoreController2 = _interopRequireDefault(_SCStoreController);

var _AbletonLinkController = require("./AbletonLinkController");

var _AbletonLinkController2 = _interopRequireDefault(_AbletonLinkController);

var _ = require(".");

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function create_default_state() {
  var paramExampleSeq = _2.default.create_default_sequencer('paramexample');
  paramExampleSeq.releaseTime = 0.3;
  return {
    sequencers: {
      'paramexample': paramExampleSeq
    }
  };
}

var rootReducer = function rootReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : create_default_state();
  var action = arguments[1];


  //state.simpleSound = simpleSound(state.simpleSound, action);
  state.abletonlink = _abletonlinkRedux2.default.reducer(state.abletonlink, action);
  state.supercolliderRedux = _supercolliderRedux2.default.reducer(state.supercolliderRedux, action);

  state.sequencers = _2.default.reducer(state.sequencers, action);

  switch (action.type) {
    case "PARAM_EXAMPLE_LEGATO":
      state.sequencers.paramexample.releaseTime = 1.2;

      break;

    case "PARAM_EXAMPLE_STOCCATO":
      state.sequencers.paramexample.releaseTime = 0.2;
      break;

    default:
      break;
  }

  return state;
};

var store = (0, _redux.createStore)(rootReducer);
var scStoreController = new _SCStoreController2.default(store);
var abletonLinkController = new _AbletonLinkController2.default(store, 'abletonlink');

var paramexampleReady = false;
store.subscribe(function () {
  var state = store.getState();
  var newIsReady = state.sequencers.paramexample.isReady;

  if (newIsReady != paramexampleReady) {
    console.log("Queueing metronome...");
    paramexampleReady = newIsReady;
    store.dispatch(_2.default.actions.sequencerQueued('paramexample'));
  }
});

setInterval(function () {
  console.log("store.getState()");
  console.log(store.getState());
}, 1000);

setTimeout(function () {
  store.dispatch({
    type: "PARAM_EXAMPLE_LEGATO"
  });

  setTimeout(function () {
    store.dispatch({
      type: "PARAM_EXAMPLE_STOCCATO"
    });

    setTimeout(function () {
      store.dispatch(_2.default.actions.sequencerStopQueued('paramexample'));
    }, 6000);
  }, 6000);
}, 6000);
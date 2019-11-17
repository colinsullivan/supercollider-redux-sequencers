#!/usr/bin/env node

/**
 *  @file       example.js
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/
"use strict";

var _redux = require("redux");

var _supercolliderRedux = _interopRequireDefault(require("supercollider-redux"));

var _ = _interopRequireDefault(require("."));

var _combineReducers;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function create_default_state() {
  return {
    sequencers: {
      metro: _["default"].create_default_sequencer("metro", "MetronomeSequencer")
    }
  };
}

var rootReducer = (0, _redux.combineReducers)((_combineReducers = {}, _defineProperty(_combineReducers, _supercolliderRedux["default"].DEFAULT_MOUNT_POINT, _supercolliderRedux["default"].reducer), _defineProperty(_combineReducers, "sequencers", _["default"].reducer), _combineReducers));
var store = (0, _redux.createStore)(rootReducer, create_default_state());
var scReduxController = new _supercolliderRedux["default"].SCReduxController(store, {
  interpretOnLangBoot: "\ns.options.inDevice = \"JackRouter\";\ns.options.outDevice = \"JackRouter\";\n  "
});
scReduxController.boot().then(function () {
  scReduxController.getSCLang().interpret("\nvar store, sequencerFactory;\n\ns.waitForBoot({\n  store = SCReduxStore.getInstance();\n  sequencerFactory = SCReduxSequencerFactory.getInstance();\n  sequencerFactory.setStore(store);\n})");
  var metroReady = false;
  store.subscribe(function () {
    var state = store.getState();
    var newMetroReady = state.sequencers.metro.isReady;

    if (newMetroReady != metroReady) {
      console.log("Queueing metronome...");
      metroReady = newMetroReady;
      store.dispatch(_["default"].actions.sequencerQueued("metro"));
    }
  });
  setInterval(function () {
    console.log("store.getState()");
    console.log(store.getState());
  }, 1000);
  setTimeout(function () {
    store.dispatch(_["default"].actions.sequencerStopQueued("metro"));
  }, 10000);
});
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
"use strict";

var _redux = require("redux");

var _supercolliderjs = _interopRequireDefault(require("supercolliderjs"));

var _supercolliderRedux = _interopRequireDefault(require("supercollider-redux"));

var _ = _interopRequireDefault(require("."));

var _combineReducers;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SCStoreController = _supercolliderRedux.default.SCStoreController;

function create_default_state() {
  return {
    sequencers: {
      'metro': _.default.create_default_sequencer('metro', 'MetronomeSequencer')
    }
  };
}

var rootReducer = (0, _redux.combineReducers)((_combineReducers = {}, _defineProperty(_combineReducers, _supercolliderRedux.default.DEFAULT_MOUNT_POINT, _supercolliderRedux.default.reducer), _defineProperty(_combineReducers, "sequencers", _.default.reducer), _combineReducers));
var store = (0, _redux.createStore)(rootReducer, create_default_state());

_supercolliderjs.default.lang.boot().then(function (lang) {
  var sclang = lang;
  sclang.interpret('API.mountDuplexOSC();').then(function () {
    var scStoreController = new SCStoreController(store);
    var metroReady = false;
    store.subscribe(function () {
      var state = store.getState();
      var newMetroReady = state.sequencers.metro.isReady;

      if (newMetroReady != metroReady) {
        console.log("Queueing metronome...");
        metroReady = newMetroReady;
        store.dispatch(_.default.actions.sequencerQueued('metro'));
      }
    });
    sclang.interpret("\n    var store, sequencerFactory;\n\n    s.boot();\n\n    s.waitForBoot({\n      store = StateStore.getInstance();\n      sequencerFactory = SCReduxSequencerFactory.getInstance();\n      sequencerFactory.setStore(store);\n    })\n\n    ");
    setInterval(function () {
      console.log("store.getState()");
      console.log(store.getState());
    }, 1000);
    setTimeout(function () {
      store.dispatch(_.default.actions.sequencerStopQueued('metro'));
    }, 10000);
  });
});
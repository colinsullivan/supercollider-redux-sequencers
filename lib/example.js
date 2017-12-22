#!/usr/bin/env node
"use strict";

var _combineReducers;

var _redux = require("redux");

var _supercolliderjs = require("supercolliderjs");

var _supercolliderjs2 = _interopRequireDefault(_supercolliderjs);

var _supercolliderRedux = require("supercollider-redux");

var _supercolliderRedux2 = _interopRequireDefault(_supercolliderRedux);

var _abletonlinkRedux = require("abletonlink-redux");

var _abletonlinkRedux2 = _interopRequireDefault(_abletonlinkRedux);

var _ = require(".");

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var SCStoreController = _supercolliderRedux2.default.SCStoreController;
var AbletonLinkController = _abletonlinkRedux2.default.AbletonLinkController;


function create_default_state() {
  return {
    sequencers: {
      'metro': _2.default.create_default_sequencer('metro', 'MetronomeSequencer')
    }
  };
}

var rootReducer = (0, _redux.combineReducers)((_combineReducers = {}, _defineProperty(_combineReducers, _abletonlinkRedux2.default.DEFAULT_MOUNT_POINT, _abletonlinkRedux2.default.reducer), _defineProperty(_combineReducers, _supercolliderRedux2.default.DEFAULT_MOUNT_POINT, _supercolliderRedux2.default.reducer), _defineProperty(_combineReducers, "sequencers", _2.default.reducer), _combineReducers));

var store = (0, _redux.createStore)(rootReducer, create_default_state());
_supercolliderjs2.default.lang.boot().then(function (lang) {
  var sclang = lang;
  sclang.interpret('API.mountDuplexOSC();').then(function () {
    var scStoreController = new SCStoreController(store);
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

    sclang.interpret("\n    var store, sequencerFactory;\n\n    s.boot();\n\n    s.waitForBoot({\n      store = StateStore.getInstance();\n      sequencerFactory = AwakenedSequencerFactory.getInstance();\n      sequencerFactory.setStore(store);\n    })\n\n    ");

    setInterval(function () {
      console.log("store.getState()");
      console.log(store.getState());
    }, 1000);

    setTimeout(function () {
      store.dispatch(_2.default.actions.sequencerStopQueued('metro'));
    }, 10000);
  });
});
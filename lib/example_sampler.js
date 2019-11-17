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
"use strict";

var _path = _interopRequireDefault(require("path"));

var _redux = require("redux");

var _supercolliderjs = _interopRequireDefault(require("supercolliderjs"));

var _supercolliderRedux = _interopRequireDefault(require("supercollider-redux"));

var _ = _interopRequireDefault(require("."));

var _combineReducers;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SCStoreController = _supercolliderRedux["default"].SCStoreController;

function create_default_state() {
  return {
    sequencers: {
      sampler: _["default"].create_default_sequencer("sampler", "SamplerExampleSequencer")
    }
  };
}

var rootReducer = (0, _redux.combineReducers)((_combineReducers = {}, _defineProperty(_combineReducers, _supercolliderRedux["default"].DEFAULT_MOUNT_POINT, _supercolliderRedux["default"].reducer), _defineProperty(_combineReducers, "sequencers", _["default"].reducer), _combineReducers));
var store = (0, _redux.createStore)(rootReducer, create_default_state());

_supercolliderjs["default"].lang.boot().then(function (sclang) {
  sclang.interpret("API.mountDuplexOSC();").then(function () {
    var scStoreController = new SCStoreController(store);
    var isReady = false;
    store.subscribe(function () {
      var state = store.getState();
      var newIsReady = state.sequencers.sampler.isReady;

      if (newIsReady != isReady) {
        console.log("Queueing...");
        isReady = newIsReady;
        store.dispatch(_["default"].actions.sequencerQueued("sampler"));
      }
    });
    sclang.interpret("\n\n  var store, sequencerFactory, bufManager, samples_done_loading;\n\n  samples_done_loading = {\n\n    \"Samples done loading!\".postln();\n\n    store = SCReduxStore.getInstance();\n    sequencerFactory = SCReduxSequencerFactory.getInstance();\n    sequencerFactory.setBufManager(bufManager);\n    sequencerFactory.setStore(store);\n  };\n\n  bufManager = BufferManager.new((\n    rootDir: \"".concat(_path["default"].resolve("./"), "\",\n    doneLoadingCallback: samples_done_loading\n  ));\n\n  ServerBoot.add({\n    bufManager.load_bufs([\n      [\"high-zap-desc_110bpm_2bar (Freeze)-1.wav\", \\bloop]\n    ]);\n  });\n  s.boot();\n    "));
    setInterval(function () {
      console.log("store.getState()");
      console.log(store.getState());
    }, 1000);
    setTimeout(function () {
      store.dispatch(_["default"].actions.sequencerStopQueued("sampler"));
    }, 10000);
  });
});
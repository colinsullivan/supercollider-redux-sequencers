#!/usr/bin/env node

/**
 *  @file       parameter_example.js
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
  var paramExampleSeq = _["default"].create_default_sequencer("paramexample", "ParamExampleSequencer");

  paramExampleSeq.releaseTime = 0.3;
  return {
    sequencers: {
      paramexample: paramExampleSeq
    }
  };
}

var rootReducer = (0, _redux.combineReducers)((_combineReducers = {}, _defineProperty(_combineReducers, _supercolliderRedux["default"].DEFAULT_MOUNT_POINT, _supercolliderRedux["default"].reducer), _defineProperty(_combineReducers, "sequencers", function sequencers(state, action) {
  state = _["default"].reducer(state, action);

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
}), _combineReducers));
var store = (0, _redux.createStore)(rootReducer, create_default_state());
var scReduxController = new _supercolliderRedux["default"].SCReduxController(store, {
  interpretOnLangBoot: "\ns.options.inDevice = \"JackRouter\";\ns.options.outDevice = \"JackRouter\";\n  "
});
scReduxController.boot().then(function () {
  var paramexampleReady = false;
  store.subscribe(function () {
    var state = store.getState();
    var newIsReady = state.sequencers.paramexample.isReady;

    if (newIsReady != paramexampleReady) {
      console.log("Queueing metronome...");
      paramexampleReady = newIsReady;
      store.dispatch(_["default"].actions.sequencerQueued("paramexample"));
    }
  });
  scReduxController.getSCLang().interpret("\n    var store, sequencerFactory;\n\n    s.boot();\n\n    s.waitForBoot({\n      store = SCReduxStore.getInstance();\n      sequencerFactory = SCReduxSequencerFactory.getInstance();\n      sequencerFactory.setStore(store);\n    })\n    ");
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
        store.dispatch(_["default"].actions.sequencerStopQueued("paramexample"));
      }, 6000);
    }, 6000);
  }, 6000);
});
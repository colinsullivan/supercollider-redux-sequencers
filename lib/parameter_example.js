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

var SCStoreController = _supercolliderRedux2.default.SCStoreController;
var AbletonLinkController = _abletonlinkRedux2.default.AbletonLinkController;


function create_default_state() {
  var paramExampleSeq = _2.default.create_default_sequencer('paramexample', 'ParamExampleSequencer');
  paramExampleSeq.releaseTime = 0.3;
  return {
    sequencers: {
      'paramexample': paramExampleSeq
    }
  };
}

var rootReducer = (0, _redux.combineReducers)((_combineReducers = {}, _defineProperty(_combineReducers, _abletonlinkRedux2.default.DEFAULT_MOUNT_POINT, _abletonlinkRedux2.default.reducer), _defineProperty(_combineReducers, _supercolliderRedux2.default.DEFAULT_MOUNT_POINT, _supercolliderRedux2.default.reducer), _defineProperty(_combineReducers, "sequencers", function sequencers(state, action) {

  state = _2.default.reducer(state, action);

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
_supercolliderjs2.default.lang.boot().then(function (sclang) {
  sclang.interpret('API.mountDuplexOSC();').then(function () {
    var scStoreController = new SCStoreController(store);
    var abletonLinkController = new AbletonLinkController(store, 'abletonlink');

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

    sclang.interpret("\n    var store, sequencerFactory;\n\n    s.boot();\n\n    s.waitForBoot({\n      store = StateStore.getInstance();\n      sequencerFactory = AwakenedSequencerFactory.getInstance();\n      sequencerFactory.setStore(store);\n    })\n    ");

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
  });
});
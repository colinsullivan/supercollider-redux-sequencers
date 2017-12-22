#!/usr/bin/env node
'use strict';

var _combineReducers;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _redux = require('redux');

var _supercolliderjs = require('supercolliderjs');

var _supercolliderjs2 = _interopRequireDefault(_supercolliderjs);

var _supercolliderRedux = require('supercollider-redux');

var _supercolliderRedux2 = _interopRequireDefault(_supercolliderRedux);

var _abletonlinkRedux = require('abletonlink-redux');

var _abletonlinkRedux2 = _interopRequireDefault(_abletonlinkRedux);

var _ = require('.');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var SCStoreController = _supercolliderRedux2.default.SCStoreController;
var AbletonLinkController = _abletonlinkRedux2.default.AbletonLinkController;


function create_default_state() {
  return {
    sequencers: {
      'sampler': _2.default.create_default_sequencer('sampler', 'SamplerExampleSequencer')
    }
  };
}

var rootReducer = (0, _redux.combineReducers)((_combineReducers = {}, _defineProperty(_combineReducers, _abletonlinkRedux2.default.DEFAULT_MOUNT_POINT, _abletonlinkRedux2.default.reducer), _defineProperty(_combineReducers, _supercolliderRedux2.default.DEFAULT_MOUNT_POINT, _supercolliderRedux2.default.reducer), _defineProperty(_combineReducers, 'sequencers', _2.default.reducer), _combineReducers));

var store = (0, _redux.createStore)(rootReducer, create_default_state());
_supercolliderjs2.default.lang.boot().then(function (sclang) {
  sclang.interpret('API.mountDuplexOSC();').then(function () {
    var scStoreController = new SCStoreController(store);
    var abletonLinkController = new AbletonLinkController(store, 'abletonlink');

    var isReady = false;
    store.subscribe(function () {
      var state = store.getState();
      var newIsReady = state.sequencers.sampler.isReady;

      if (newIsReady != isReady) {
        console.log("Queueing...");
        isReady = newIsReady;
        store.dispatch(_2.default.actions.sequencerQueued('sampler'));
      }
    });

    sclang.interpret('\n\n  var store, sequencerFactory, bufManager, samples_done_loading;\n\n  samples_done_loading = {\n\n    "Samples done loading!".postln();\n\n    store = StateStore.getInstance();\n    sequencerFactory = AwakenedSequencerFactory.getInstance();\n    sequencerFactory.setBufManager(bufManager);\n    sequencerFactory.setStore(store);\n  };\n\n  bufManager = BufferManager.new((\n    rootDir: "' + _path2.default.resolve('./') + '",\n    doneLoadingCallback: samples_done_loading\n  ));\n\n  ServerBoot.add({\n    bufManager.load_bufs([\n      ["high-zap-desc_110bpm_2bar (Freeze)-1.wav", \\bloop]\n    ]);\n  });\n  s.boot();\n    ');

    setInterval(function () {
      console.log("store.getState()");
      console.log(store.getState());
    }, 1000);

    setTimeout(function () {
      store.dispatch(_2.default.actions.sequencerStopQueued('sampler'));
    }, 10000);
  });
});
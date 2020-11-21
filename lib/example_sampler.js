#!/usr/bin/env node
"use strict";
/**
 *  @file       example_sampler.js
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/
var _a;
exports.__esModule = true;
var path_1 = require("path");
var redux_1 = require("redux");
var supercollider_redux_1 = require("supercollider-redux");
var _1 = require(".");
function create_default_state() {
    return {
        sequencers: {
            sampler: _1["default"].create_default_sequencer("sampler", "SamplerExampleSequencer")
        }
    };
}
var rootReducer = redux_1.combineReducers((_a = {},
    _a[supercollider_redux_1["default"].DEFAULT_MOUNT_POINT] = supercollider_redux_1["default"].reducer,
    _a.sequencers = _1["default"].reducer,
    _a));
var store = redux_1.createStore(rootReducer, create_default_state());
var scReduxController = new supercollider_redux_1["default"].SCReduxController(store);
scReduxController.boot().then(function () {
    var isReady = false;
    store.subscribe(function () {
        var state = store.getState();
        var newIsReady = state.sequencers.sampler.isReady;
        if (newIsReady != isReady) {
            console.log("Queueing...");
            isReady = newIsReady;
            store.dispatch(_1["default"].actions.sequencerQueued("sampler"));
        }
    });
    scReduxController.getSCLang().interpret("\nvar store, sequencerFactory, bufManager, samples_done_loading;\n\nsamples_done_loading = {\n\n  \"Samples done loading!\".postln();\n\n  store = SCReduxStore.getInstance();\n  sequencerFactory = SCReduxSequencerFactory.getInstance();\n  sequencerFactory.setBufManager(bufManager);\n  sequencerFactory.setStore(store);\n};\n\nbufManager = BufferManager.new((\n  rootDir: \"" + path_1["default"].resolve("./") + "\",\n  doneLoadingCallback: samples_done_loading\n));\n\ns.waitForBoot({\n  bufManager.load_bufs([\n    [\"high-zap-desc_110bpm_2bar (Freeze)-1.wav\", \\bloop]\n  ]);\n});\n    ");
    setInterval(function () {
        console.log("store.getState()");
        console.log(store.getState());
    }, 1000);
    setTimeout(function () {
        store.dispatch(_1["default"].actions.sequencerStopQueued("sampler"));
    }, 10000);
});

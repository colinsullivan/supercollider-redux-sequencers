#!/usr/bin/env node
"use strict";
/**
 *  @file       example.js
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/
var _a;
exports.__esModule = true;
var redux_1 = require("redux");
var supercollider_redux_1 = require("supercollider-redux");
var _1 = require(".");
function create_default_state() {
    return {
        sequencers: {
            metro: _1["default"].create_default_sequencer("metro", "MetronomeSequencer")
        }
    };
}
var rootReducer = redux_1.combineReducers((_a = {},
    _a[supercollider_redux_1["default"].DEFAULT_MOUNT_POINT] = supercollider_redux_1["default"].reducer,
    _a.sequencers = _1["default"].reducer,
    _a));
var store = redux_1.createStore(rootReducer, create_default_state());
var scReduxController = new supercollider_redux_1["default"].SCReduxController(store, {
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
            store.dispatch(_1["default"].actions.sequencerQueued("metro"));
        }
    });
    setInterval(function () {
        console.log("store.getState()");
        console.log(store.getState());
    }, 1000);
    setTimeout(function () {
        store.dispatch(_1["default"].actions.sequencerStopQueued("metro"));
    }, 10000);
});

#!/usr/bin/env node
"use strict";
/**
 *  @file       parameter_example.js
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
    var paramExampleSeq = _1["default"].create_default_sequencer("paramexample", "ParamExampleSequencer");
    paramExampleSeq.releaseTime = 0.3;
    return {
        sequencers: {
            paramexample: paramExampleSeq
        }
    };
}
var rootReducer = redux_1.combineReducers((_a = {},
    _a[supercollider_redux_1["default"].DEFAULT_MOUNT_POINT] = supercollider_redux_1["default"].reducer,
    _a.sequencers = function (state, action) {
        state = _1["default"].reducer(state, action);
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
    },
    _a));
var store = redux_1.createStore(rootReducer, create_default_state());
var scReduxController = new supercollider_redux_1["default"].SCReduxController(store);
scReduxController.boot().then(function () {
    var paramexampleReady = false;
    store.subscribe(function () {
        var state = store.getState();
        var newIsReady = state.sequencers.paramexample.isReady;
        if (newIsReady != paramexampleReady) {
            console.log("Queueing metronome...");
            paramexampleReady = newIsReady;
            store.dispatch(_1["default"].actions.sequencerQueued("paramexample"));
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
                store.dispatch(_1["default"].actions.sequencerStopQueued("paramexample"));
            }, 6000);
        }, 6000);
    }, 6000);
});

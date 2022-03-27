"use strict";
/**
 *
 *  @file       reducers.js
 *
 *	@desc       Translate actions into changes in the Redux state store.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.sequencer = exports.create_default_state = void 0;
var actionTypes = require("./actionTypes");
var models_1 = require("./models");
function create_default_state() {
    return {};
}
exports.create_default_state = create_default_state;
function create_timestamp() {
    return new Date().getTime() / 1000.0;
}
function sequencer(state, action) {
    var newState = state;
    if (action.payload && action.payload.sequencerId == state.sequencerId) {
        switch (action.type) {
            case actionTypes.SEQUENCER_QUEUED:
                newState = __assign({}, state);
                if (state.playingState === models_1.PLAYING_STATES.PLAYING) {
                    newState.playingState = models_1.PLAYING_STATES.REQUEUED;
                }
                else {
                    newState.playingState = models_1.PLAYING_STATES.QUEUED;
                }
                break;
            case actionTypes.SEQUENCER_PLAYING:
                newState = __assign(__assign({}, state), { playingState: models_1.PLAYING_STATES.PLAYING });
                break;
            case actionTypes.SEQUENCER_STOPPED:
                // this is sent from the SCReduxSequencer scheduled stop
                if (state.playingState === models_1.PLAYING_STATES.STOP_QUEUED) {
                    newState = __assign(__assign({}, state), { playingState: models_1.PLAYING_STATES.STOPPED });
                }
                break;
            case actionTypes.SEQUENCER_STOP_QUEUED:
                newState = __assign(__assign({}, state), { playingState: models_1.PLAYING_STATES.STOP_QUEUED });
                break;
            case actionTypes.SEQUENCER_READY:
                newState = __assign(__assign({}, state), { isReady: true });
                break;
            case actionTypes.SEQUENCER_PROP_CHANGE_QUEUED:
                newState = __assign(__assign(__assign({}, state), { lastPropChangeQueuedAt: create_timestamp() }), action.payload.props);
                break;
            case actionTypes.SEQUENCER_PROP_CHANGED:
                newState = __assign(__assign({}, state), { lastPropChangeAt: create_timestamp() });
                break;
            default:
                break;
        }
    }
    switch (action.type) {
        case actionTypes.SUPERCOLLIDER_EVENTSTREAMPLAYER_NEXTBEAT:
            if (action.payload.id == state.sequencerId) {
                newState = __assign(__assign({}, state), { nextBeat: action.payload.nextBeat, nextTime: action.payload.nextTime, beat: state.beat + 1, event: __assign({}, action.payload) });
            }
            break;
        case actionTypes.SUPERCOLLIDER_EVENTSTREAMPLAYER_ENDED:
            if (action.payload.id == state.sequencerId &&
                // only care about an EventStreamPlayer ended message if we are
                // playing, implies a one-shot that ended by itself.  Otherwise
                // this ended message may race with a manual sequencer stop.
                state.playingState === models_1.PLAYING_STATES.PLAYING) {
                newState = __assign(__assign({}, state), { beat: 0, event: undefined, nextBeat: false, playingState: models_1.PLAYING_STATES.STOPPED });
            }
            break;
        default:
            break;
    }
    return newState;
}
exports.sequencer = sequencer;
function default_1(sequencers, action) {
    if (sequencers === void 0) { sequencers = create_default_state(); }
    var dirty = false;
    var changedSequencers = {};
    for (var sequencerId in sequencers) {
        var seq = sequencer(sequencers[sequencerId], action);
        if (seq !== sequencers[sequencerId]) {
            dirty = true;
            changedSequencers[sequencerId] = seq;
        }
    }
    if (dirty) {
        sequencers = Object.assign({}, sequencers, changedSequencers);
    }
    return sequencers;
}
exports["default"] = default_1;

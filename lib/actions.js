"use strict";
/**
 *  @file       actions.js
 *
 *	@desc       Action set for dispatching changes to the store.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/
exports.__esModule = true;
exports.sequencerPropChangeQueued = exports.sequencerStopQueued = exports.sequencerStopped = exports.sequencerPlaying = exports.sequencerQueued = void 0;
var actionTypes = require("./actionTypes");
function sequencerQueued(sequencerId) {
    return {
        type: actionTypes.SEQUENCER_QUEUED,
        payload: {
            sequencerId: sequencerId
        }
    };
}
exports.sequencerQueued = sequencerQueued;
function sequencerPlaying(sequencerId) {
    return {
        type: actionTypes.SEQUENCER_PLAYING,
        payload: {
            sequencerId: sequencerId
        }
    };
}
exports.sequencerPlaying = sequencerPlaying;
function sequencerStopped(sequencerId) {
    return {
        type: actionTypes.SEQUENCER_STOPPED,
        payload: {
            sequencerId: sequencerId
        }
    };
}
exports.sequencerStopped = sequencerStopped;
function sequencerStopQueued(sequencerId) {
    return {
        type: actionTypes.SEQUENCER_STOP_QUEUED,
        payload: {
            sequencerId: sequencerId
        }
    };
}
exports.sequencerStopQueued = sequencerStopQueued;
function sequencerPropChangeQueued(sequencerId, props) {
    if (props === void 0) { props = {}; }
    return {
        type: actionTypes.SEQUENCER_PROP_CHANGE_QUEUED,
        payload: {
            sequencerId: sequencerId,
            props: props
        }
    };
}
exports.sequencerPropChangeQueued = sequencerPropChangeQueued;

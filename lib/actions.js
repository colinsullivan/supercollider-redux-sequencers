"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sequencerQueued = sequencerQueued;
exports.sequencerPlaying = sequencerPlaying;
exports.sequencerStopped = sequencerStopped;
exports.sequencerStopQueued = sequencerStopQueued;

var _actionTypes = require("./actionTypes");

var actionTypes = _interopRequireWildcard(_actionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function sequencerQueued(sequencerId) {
  return {
    type: actionTypes.SEQUENCER_QUEUED,
    payload: {
      sequencerId: sequencerId
    }
  };
} /**
   *  @file       actions.js
   *
   *	@desc       Action set for dispatching changes to the store.
   *
   *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
   *
   *  @copyright  2017 Colin Sullivan
   *  @license    Licensed under the MIT license.
   **/

function sequencerPlaying(sequencerId) {
  return {
    type: actionTypes.SEQUENCER_PLAYING,
    payload: {
      sequencerId: sequencerId
    }
  };
}

function sequencerStopped(sequencerId) {
  return {
    type: actionTypes.SEQUENCER_STOPPED,
    payload: {
      sequencerId: sequencerId
    }
  };
}

function sequencerStopQueued(sequencerId) {
  return {
    type: actionTypes.SEQUENCER_STOP_QUEUED,
    payload: {
      sequencerId: sequencerId
    }
  };
}
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sequencerQueued = sequencerQueued;
exports.sequencerPlaying = sequencerPlaying;
exports.sequencerStopped = sequencerStopped;
exports.sequencerStopQueued = sequencerStopQueued;
exports.sequencerPropChangeQueued = sequencerPropChangeQueued;

var actionTypes = _interopRequireWildcard(require("./actionTypes"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
function sequencerQueued(sequencerId) {
  return {
    type: actionTypes.SEQUENCER_QUEUED,
    payload: {
      sequencerId: sequencerId
    }
  };
}

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

function sequencerPropChangeQueued(sequencerId) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    type: actionTypes.SEQUENCER_PROP_CHANGE_QUEUED,
    payload: {
      sequencerId: sequencerId,
      props: props
    }
  };
}
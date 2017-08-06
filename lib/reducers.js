"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PLAYING_STATES = undefined;
exports.create_default_state = create_default_state;
exports.create_default_sequencer = create_default_sequencer;
exports.sequencer = sequencer;

exports.default = function () {
  var sequencers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : create_default_state();
  var action = arguments[1];

  for (var sequencerId in sequencers) {
    sequencers[sequencerId] = sequencer(sequencers[sequencerId], action);
  }
  return sequencers;
};

var _actionTypes = require("./actionTypes");

var actionTypes = _interopRequireWildcard(_actionTypes);

var _supercolliderRedux = require("supercollider-redux");

var _supercolliderRedux2 = _interopRequireDefault(_supercolliderRedux);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

var PLAYING_STATES = exports.PLAYING_STATES = {
  STOPPED: "STOPPED",
  QUEUED: "QUEUED",
  PLAYING: "PLAYING",
  STOP_QUEUED: "STOP_QUEUED"
};

function create_default_state() {
  return {};
}
function create_default_sequencer(sequencerId, name) {
  return {
    name: name,
    sequencerId: sequencerId,
    clockOffsetSeconds: 0.0,
    beat: 0,
    nextBeat: false,
    numBeats: 8,
    playingState: PLAYING_STATES.STOPPED,
    isReady: false,
    playQuant: [4, 0],
    stopQuant: [8, 0],
    event: false
  };
}
function sequencer(state, action) {
  if (action.payload && action.payload.sequencerId == state.sequencerId) {
    switch (action.type) {
      case actionTypes.SEQUENCER_QUEUED:
        state.playingState = PLAYING_STATES.QUEUED;
        break;

      case actionTypes.SEQUENCER_PLAYING:
        state.playingState = PLAYING_STATES.PLAYING;
        break;

      case actionTypes.SEQUENCER_STOPPED:
        state.playingState = PLAYING_STATES.STOPPED;
        break;

      case actionTypes.SEQUENCER_STOP_QUEUED:
        state.playingState = PLAYING_STATES.STOP_QUEUED;
        break;

      case actionTypes.SEQUENCER_READY:
        state.isReady = true;
        break;

      default:
        break;
    }
  }

  switch (action.type) {
    case _supercolliderRedux2.default.actionTypes.SUPERCOLLIDER_EVENTSTREAMPLAYER_NEXTBEAT:
      if (action.payload.id == state.sequencerId) {
        state.nextBeat = action.payload.nextBeat;
        state.beat = (state.beat + 1) % state.numBeats;
        state.event = Object.assign({}, action.payload);
      }

      break;

    default:
      break;
  }

  return state;
}
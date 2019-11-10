"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create_default_state = create_default_state;
exports.create_default_sequencer = create_default_sequencer;
exports.sequencer = sequencer;
exports["default"] = _default;
exports.PLAYING_STATES = void 0;

var actionTypes = _interopRequireWildcard(require("./actionTypes"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PLAYING_STATES = {
  STOPPED: "STOPPED",
  QUEUED: "QUEUED",
  PLAYING: "PLAYING",
  REQUEUED: "REQUEUED",
  STOP_QUEUED: "STOP_QUEUED"
};
exports.PLAYING_STATES = PLAYING_STATES;

function create_default_state() {
  return {};
}

function create_default_sequencer(sequencerId, type) {
  return {
    sequencerId: sequencerId,
    type: type,
    clockOffsetSeconds: 0.0,
    beat: 0,
    nextBeat: false,
    nextTime: 0,
    numBeats: 8,
    playingState: PLAYING_STATES.STOPPED,
    isReady: false,
    playQuant: [4, 0],
    stopQuant: [8, 0],
    propQuant: [4, 4],
    lastPropChangeQueuedAt: false,
    lastPropChangeAt: false,
    event: false,
    midiOutDeviceName: false,
    midiOutPortName: false
  };
}

function create_timestamp() {
  return new Date().getTime() / 1000.0;
}

function sequencer(state, action) {
  var newState = state;

  if (action.payload && action.payload.sequencerId == state.sequencerId) {
    switch (action.type) {
      case actionTypes.SEQUENCER_QUEUED:
        newState = _objectSpread({}, state);

        if (state.playingState === PLAYING_STATES.PLAYING) {
          newState.playingState = PLAYING_STATES.REQUEUED;
        } else {
          newState.playingState = PLAYING_STATES.QUEUED;
        }

        break;

      case actionTypes.SEQUENCER_PLAYING:
        newState = _objectSpread({}, state, {
          playingState: PLAYING_STATES.PLAYING
        });
        break;

      case actionTypes.SEQUENCER_STOPPED:
        // this is sent from the SCReduxSequencer scheduled stop
        if (state.playingState === PLAYING_STATES.STOP_QUEUED) {
          newState = _objectSpread({}, state, {
            playingState: PLAYING_STATES.STOPPED
          });
        }

        break;

      case actionTypes.SEQUENCER_STOP_QUEUED:
        newState = _objectSpread({}, state, {
          playingState: PLAYING_STATES.STOP_QUEUED
        });
        break;

      case actionTypes.SEQUENCER_READY:
        newState = _objectSpread({}, state, {
          isReady: true
        });
        break;

      case actionTypes.SEQUENCER_PROP_CHANGE_QUEUED:
        newState = _objectSpread({}, state, {
          lastPropChangeQueuedAt: create_timestamp()
        }, action.payload.props);
        break;

      case actionTypes.SEQUENCER_PROP_CHANGED:
        newState = _objectSpread({}, state, {
          lastPropChangeAt: create_timestamp()
        });
        break;

      default:
        break;
    }
  }

  switch (action.type) {
    case actionTypes.SUPERCOLLIDER_EVENTSTREAMPLAYER_NEXTBEAT:
      if (action.payload.id == state.sequencerId) {
        newState = _objectSpread({}, state, {
          nextBeat: action.payload.nextBeat,
          nextTime: action.payload.nextTime,
          beat: state.beat + 1,
          event: _objectSpread({}, action.payload)
        });
      }

      break;

    case actionTypes.SUPERCOLLIDER_EVENTSTREAMPLAYER_ENDED:
      if (action.payload.id == state.sequencerId && // only care about an EventStreamPlayer ended message if we are
      // playing, implies a one-shot that ended by itself.  Otherwise
      // this ended message may race with a manual sequencer stop.
      state.playingState === PLAYING_STATES.PLAYING) {
        newState = _objectSpread({}, state, {
          beat: 0,
          event: false,
          nextBeat: false,
          playingState: PLAYING_STATES.STOPPED
        });
      }

      break;

    default:
      break;
  }

  return newState;
}

function _default() {
  var sequencers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : create_default_state();
  var action = arguments.length > 1 ? arguments[1] : undefined;
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
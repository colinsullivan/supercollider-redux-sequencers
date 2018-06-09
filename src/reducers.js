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

import * as actionTypes from "./actionTypes";
import supercolliderRedux from "supercollider-redux";

export var PLAYING_STATES = {
  STOPPED: "STOPPED",
  QUEUED: "QUEUED",
  PLAYING: "PLAYING",
  REQUEUED: "REQUEUED",
  STOP_QUEUED: "STOP_QUEUED"
};

export function create_default_state () {
  return {
  };
}
export function create_default_sequencer (sequencerId, type) {
  return {
    sequencerId,
    type,
    clockOffsetSeconds: 0.0,
    beat: 0,
    nextBeat: false,
    nextTime: 0,
    numBeats: 8,
    playingState: PLAYING_STATES.STOPPED,
    isReady: false,
    playQuant: [4, 0],
    stopQuant: [8, 0],
    event: false,
    midiOutDeviceName: false,
    midiOutPortName: false
  }
}
export function sequencer (state, action) {
  if (action.payload && action.payload.sequencerId == state.sequencerId) {
    switch (action.type) {
      case actionTypes.SEQUENCER_QUEUED:
        state = Object.assign({}, state);
        if (state.playingState === PLAYING_STATES.PLAYING) {
          state.playingState = PLAYING_STATES.REQUEUED;
        } else {
          state.playingState = PLAYING_STATES.QUEUED;
        }
        break;

      case actionTypes.SEQUENCER_PLAYING:
        state = Object.assign({}, state);
        state.playingState = PLAYING_STATES.PLAYING;
        break;

      case actionTypes.SEQUENCER_STOPPED:
        state = Object.assign({}, state);
        state.playingState = PLAYING_STATES.STOPPED;
        break;

      case actionTypes.SEQUENCER_STOP_QUEUED:
        state = Object.assign({}, state);
        state.playingState = PLAYING_STATES.STOP_QUEUED;
        break;

      case actionTypes.SEQUENCER_READY:
        state = Object.assign({}, state);
        state.isReady = true;
        break;
      
      default:
        break;
    }
  }

  switch (action.type) {
    case supercolliderRedux.actionTypes.SUPERCOLLIDER_EVENTSTREAMPLAYER_NEXTBEAT:
      if (action.payload.id == state.sequencerId) {
        state = Object.assign({}, state);
        state.nextBeat = action.payload.nextBeat;
        state.nextTime = action.payload.nextTime;
        state.beat = state.beat + 1;
        state.event = Object.assign({}, action.payload);
      }
      
      break;

    case supercolliderRedux.actionTypes.SUPERCOLLIDER_EVENTSTREAMPLAYER_ENDED:
      if (action.payload.id == state.sequencerId) {
        state = Object.assign({}, state);
        state.beat = 0;
        state.event = false;
        state.nextBeat = false;
        state.playingState = PLAYING_STATES.STOPPED;
      }
      
      break;
    
    default:
      break;
  }


  return state;
}
export default function (sequencers = create_default_state(), action) {
  var dirty = false;
  for (var sequencerId in sequencers) {
    let seq = sequencer(sequencers[sequencerId], action);
    if (seq !== sequencers[sequencerId]) {
      dirty = true;
      sequencers[sequencerId] = seq;
    }
  }
  if (dirty) {
    sequencers = Object.assign({}, sequencers);
  }
  return sequencers;
}

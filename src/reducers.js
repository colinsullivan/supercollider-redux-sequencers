/**
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

export var PLAYING_STATES = {
  STOPPED: "STOPPED",
  QUEUED: "QUEUED",
  PLAYING: "PLAYING",
  STOP_QUEUED: "STOP_QUEUED"
};

export function create_default_state () {
  return {
  };
}
export function create_default_sequencer (name) {
  return {
    name: name,
    clockOffsetSeconds: 0.0,
    transport: {
      beat: 0
    },
    meter: {
      numBeats: 8,
      beatDur: 1
    },
    playingState: PLAYING_STATES.STOPPED,
    isReady: false
  }
}
export function sequencer (state, action) {
  if (action.payload && action.payload.name == state.name) {
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
  return state;
}
export default function (sequencers = create_default_state(), action) {
  for (var name in sequencers) {
    sequencers[name] = sequencer(sequencers[name], action);
  }
  return sequencers;
}

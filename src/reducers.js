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
import { PLAYING_STATES } from './models';

export function create_default_state() {
  return {};
}
function create_timestamp() {
  return new Date().getTime() / 1000.0;
}
export function sequencer(state, action) {
  let newState = state;
  if (action.payload && action.payload.sequencerId == state.sequencerId) {
    switch (action.type) {
      case actionTypes.SEQUENCER_QUEUED:
        newState = {
          ...state
        };
        if (state.playingState === PLAYING_STATES.PLAYING) {
          newState.playingState = PLAYING_STATES.REQUEUED;
        } else {
          newState.playingState = PLAYING_STATES.QUEUED;
        }
        break;

      case actionTypes.SEQUENCER_PLAYING:
        newState = {
          ...state,
          playingState: PLAYING_STATES.PLAYING
        };
        break;

      case actionTypes.SEQUENCER_STOPPED:
        // this is sent from the SCReduxSequencer scheduled stop
        if (state.playingState === PLAYING_STATES.STOP_QUEUED) {
          newState = {
            ...state,
            playingState: PLAYING_STATES.STOPPED
          };
        }
        break;

      case actionTypes.SEQUENCER_STOP_QUEUED:
        newState = {
          ...state,
          playingState: PLAYING_STATES.STOP_QUEUED
        };
        break;

      case actionTypes.SEQUENCER_READY:
        newState = {
          ...state,
          isReady: true
        };
        break;

      case actionTypes.SEQUENCER_PROP_CHANGE_QUEUED:
        newState = {
          ...state,
          lastPropChangeQueuedAt: create_timestamp(),
          ...action.payload.props
        };
        break;

      case actionTypes.SEQUENCER_PROP_CHANGED:
        newState = {
          ...state,
          lastPropChangeAt: create_timestamp()
        };
        break;

      default:
        break;
    }
  }

  switch (action.type) {
    case actionTypes.SUPERCOLLIDER_EVENTSTREAMPLAYER_NEXTBEAT:
      if (action.payload.id == state.sequencerId) {
        newState = {
          ...state,
          nextBeat: action.payload.nextBeat,
          nextTime: action.payload.nextTime,
          beat: state.beat + 1,
          event: { ...action.payload }
        };
      }
      break;

    case actionTypes.SUPERCOLLIDER_EVENTSTREAMPLAYER_ENDED:
      if (
        action.payload.id == state.sequencerId &&
        // only care about an EventStreamPlayer ended message if we are
        // playing, implies a one-shot that ended by itself.  Otherwise
        // this ended message may race with a manual sequencer stop.
        state.playingState === PLAYING_STATES.PLAYING
      ) {
        newState = {
          ...state,
          beat: 0,
          event: undefined,
          nextBeat: false,
          playingState: PLAYING_STATES.STOPPED
        };
      }
      break;

    default:
      break;
  }

  return newState;
}
export default function(sequencers = create_default_state(), action) {
  var dirty = false;
  var changedSequencers = {};
  for (var sequencerId in sequencers) {
    let seq = sequencer(sequencers[sequencerId], action);
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

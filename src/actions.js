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

import * as actionTypes from "./actionTypes"

export function sequencerQueued (name) {
  return {
    type: actionTypes.SEQUENCER_QUEUED,
    payload: {
      name
    }
  };
}

export function sequencerPlaying (name) {
  return {
    type: actionTypes.SEQUENCER_PLAYING,
    payload: {
      name
    }
  };
}

export function sequencerStopped (name) {
  return {
    type: actionTypes.SEQUENCER_STOPPED,
    payload: {
      name
    }
  };
}

export function sequencerStopQueued (name) {
  return {
    type: actionTypes.SEQUENCER_STOP_QUEUED,
    payload: {
      name
    }
  }
}

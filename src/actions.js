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

export function sequencerQueued (sequencerId) {
  return {
    type: actionTypes.SEQUENCER_QUEUED,
    payload: {
      sequencerId
    }
  };
}

export function sequencerPlaying (sequencerId) {
  return {
    type: actionTypes.SEQUENCER_PLAYING,
    payload: {
      sequencerId
    }
  };
}

export function sequencerStopped (sequencerId) {
  return {
    type: actionTypes.SEQUENCER_STOPPED,
    payload: {
      sequencerId
    }
  };
}

export function sequencerStopQueued (sequencerId) {
  return {
    type: actionTypes.SEQUENCER_STOP_QUEUED,
    payload: {
      sequencerId
    }
  }
}

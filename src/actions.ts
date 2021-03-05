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

import * as actionTypes from "./actionTypes";

export function sequencerQueued(sequencerId : string) {
  return {
    type: actionTypes.SEQUENCER_QUEUED,
    payload: {
      sequencerId
    }
  };
}

export function sequencerPlaying(sequencerId : string) {
  return {
    type: actionTypes.SEQUENCER_PLAYING,
    payload: {
      sequencerId
    }
  };
}

export function sequencerStopped(sequencerId : string) {
  return {
    type: actionTypes.SEQUENCER_STOPPED,
    payload: {
      sequencerId
    }
  };
}

export function sequencerStopQueued(sequencerId : string) {
  return {
    type: actionTypes.SEQUENCER_STOP_QUEUED,
    payload: {
      sequencerId
    }
  };
}

export function sequencerPropChangeQueued(sequencerId : string, props = {}) {
  return {
    type: actionTypes.SEQUENCER_PROP_CHANGE_QUEUED,
    payload: {
      sequencerId,
      props
    }
  };
}

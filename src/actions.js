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

export function sequencerQueued () {
  return {
    type: actionTypes.SEQUENCER_QUEUED
  };
}

export function sequencerPlaying () {
  return {
    type: actionTypes.SEQUENCER_PLAYING
  };
}

export function sequencerStopped () {
  return {
    type: actionTypes.SEQUENCER_STOPPED
  };
}

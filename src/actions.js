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

export function sequenceQueued () {
  return {
    type: actionTypes.SEQUENCE_QUEUED
  };
}

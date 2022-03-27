/**
 *  @file       selectors.js
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
} from "reselect";
import { isEqual, omit } from "lodash";

const getSequencers = (state) => state.sequencers;

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

/**
 *  Simplify sequencers for sending to SC.
 **/
export const getSCSequencers = createSelector(getSequencers, (sequencers) => {
  const sequencerIds = Object.keys(sequencers);
  let simplifiedSequencers = {};
  for (const sequencerId of sequencerIds) {
    simplifiedSequencers[sequencerId] = omit(sequencers[sequencerId], [
      "event",
      "nextBeat",
      "beat",
      "nextTime",
    ]);
  }
  return simplifiedSequencers;
});

export const getSCState = createDeepEqualSelector(
  getSCSequencers,
  (sequencers) => ({
    sequencers,
  })
);

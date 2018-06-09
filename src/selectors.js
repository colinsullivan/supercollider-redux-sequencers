/**
 *  @file       selectors.js
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the GPLv3 license.
 **/

import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash/isEqual';

const getSequencers = state => state.sequencers;

const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
);

/**
 *  Simplify sequencers for sending to SC.
 **/
export const getSCSequencers = createSelector(
  getSequencers,
  (sequencers) => {
    var simplifiedSequencers = {};
    console.log("getSCSequencers");
    Object.keys(sequencers).forEach((sequencerId) => {
      simplifiedSequencers[sequencerId] = Object.assign(
        {},
        sequencers[sequencerId]
      );
      delete simplifiedSequencers[sequencerId].event;
      delete simplifiedSequencers[sequencerId].nextBeat;
      delete simplifiedSequencers[sequencerId].beat;
      delete simplifiedSequencers[sequencerId].nextTime;
    });
    return simplifiedSequencers;
  }
);

export const getSCState = createDeepEqualSelector(
  getSCSequencers,
  (sequencers) => ({
    sequencers
  })
);

"use strict";
/**
 *  @file       selectors.js
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/
exports.__esModule = true;
exports.getSCState = exports.getSCSequencers = void 0;
var reselect_1 = require("reselect");
var lodash_1 = require("lodash");
var getSequencers = function (state) { return state.sequencers; };
var createDeepEqualSelector = reselect_1.createSelectorCreator(reselect_1.defaultMemoize, lodash_1.isEqual);
/**
 *  Simplify sequencers for sending to SC.
 **/
exports.getSCSequencers = reselect_1.createSelector(getSequencers, function (sequencers) {
    var sequencerIds = Object.keys(sequencers);
    var simplifiedSequencers = {};
    for (var _i = 0, sequencerIds_1 = sequencerIds; _i < sequencerIds_1.length; _i++) {
        var sequencerId = sequencerIds_1[_i];
        simplifiedSequencers[sequencerId] = lodash_1.omit(sequencers[sequencerId], [
            "event",
            "nextBeat",
            "beat",
            "nextTime",
        ]);
    }
    return simplifiedSequencers;
});
exports.getSCState = createDeepEqualSelector(exports.getSCSequencers, function (sequencers) { return ({
    sequencers: sequencers
}); });

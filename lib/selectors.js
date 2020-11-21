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
var isEqual_1 = require("lodash/isEqual");
var getSequencers = function (state) { return state.sequencers; };
var createDeepEqualSelector = reselect_1.createSelectorCreator(reselect_1.defaultMemoize, isEqual_1["default"]);
/**
 *  Simplify sequencers for sending to SC.
 **/
exports.getSCSequencers = reselect_1.createSelector(getSequencers, function (sequencers) {
    var simplifiedSequencers = {};
    Object.keys(sequencers).forEach(function (sequencerId) {
        simplifiedSequencers[sequencerId] = Object.assign({}, sequencers[sequencerId]);
        delete simplifiedSequencers[sequencerId].event;
        delete simplifiedSequencers[sequencerId].nextBeat;
        delete simplifiedSequencers[sequencerId].beat;
        delete simplifiedSequencers[sequencerId].nextTime;
    });
    return simplifiedSequencers;
});
exports.getSCState = createDeepEqualSelector(exports.getSCSequencers, function (sequencers) { return ({
    sequencers: sequencers
}); });

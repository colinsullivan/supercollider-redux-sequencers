"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSCState = exports.getSCSequencers = void 0;

var _reselect = require("reselect");

var _isEqual = _interopRequireDefault(require("lodash/isEqual"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  @file       selectors.js
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/
var getSequencers = function getSequencers(state) {
  return state.sequencers;
};

var createDeepEqualSelector = (0, _reselect.createSelectorCreator)(_reselect.defaultMemoize, _isEqual.default);
/**
 *  Simplify sequencers for sending to SC.
 **/

var getSCSequencers = (0, _reselect.createSelector)(getSequencers, function (sequencers) {
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
exports.getSCSequencers = getSCSequencers;
var getSCState = createDeepEqualSelector(getSCSequencers, function (sequencers) {
  return {
    sequencers: sequencers
  };
});
exports.getSCState = getSCState;
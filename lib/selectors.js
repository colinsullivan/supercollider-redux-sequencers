'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSCState = exports.getSCSequencers = undefined;

var _reselect = require('reselect');

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

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

var createDeepEqualSelector = (0, _reselect.createSelectorCreator)(_reselect.defaultMemoize, _isEqual2.default);

/**
 *  Simplify sequencers for sending to SC.
 **/
var getSCSequencers = exports.getSCSequencers = (0, _reselect.createSelector)(getSequencers, function (sequencers) {
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

var getSCState = exports.getSCState = createDeepEqualSelector(getSCSequencers, function (sequencers) {
  return {
    sequencers: sequencers
  };
});
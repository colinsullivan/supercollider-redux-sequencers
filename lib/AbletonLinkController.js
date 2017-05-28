"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  @file       AbletonLinkController.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  @copyright  2017 Colin Sullivan
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  @license    Licensed under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      **/

var _abletonlink = require("abletonlink");

var _abletonlink2 = _interopRequireDefault(_abletonlink);

var _abletonlinkRedux = require("abletonlink-redux");

var _abletonlinkRedux2 = _interopRequireDefault(_abletonlinkRedux);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  @class        AbletonLinkController
 *
 *  @classdesc    Entity which spawns the Ableton Link instance and
 *  translates updates into actions for the Redux state store.
 *  
 **/
var AbletonLinkController = function () {
  function AbletonLinkController(store, stateTreePrefix) {
    var _this = this;

    _classCallCheck(this, AbletonLinkController);

    this.store = store;

    this.stateTreePrefix = stateTreePrefix;

    this.link = new _abletonlink2.default();

    var lastBpm = null;
    this.link.startUpdate(20, function (beat, phase, bpm) {
      if (bpm != lastBpm) {
        _this.store.dispatch(_abletonlinkRedux2.default.actions.linkBPMChanged(bpm));
        lastBpm = bpm;
      }
      _this.store.dispatch(_abletonlinkRedux2.default.actions.linkTransportChanged(beat, phase));
    });

    this.store.subscribe(function () {
      _this.handleStoreChanged();
    });
  }

  _createClass(AbletonLinkController, [{
    key: "handleLinkUpdate",
    value: function handleLinkUpdate() {}
  }, {
    key: "handleStoreChanged",
    value: function handleStoreChanged() {
      var state = this.store.getState();

      if (this.stateTreePrefix) {
        state = state[this.stateTreePrefix];
      }

      if (state.queued_bpm) {
        this.link.bpm = state.queued_bpm;
      }
    }
  }]);

  return AbletonLinkController;
}();

exports.default = AbletonLinkController;
"use strict";
exports.__esModule = true;
exports.create_default_sequencer = exports.PLAYING_STATES = void 0;
var PLAYING_STATES;
(function (PLAYING_STATES) {
    PLAYING_STATES["STOPPED"] = "STOPPED";
    PLAYING_STATES["QUEUED"] = "QUEUED";
    PLAYING_STATES["PLAYING"] = "PLAYING";
    PLAYING_STATES["REQUEUED"] = "REQUEUED";
    PLAYING_STATES["STOP_QUEUED"] = "STOP_QUEUED";
})(PLAYING_STATES = exports.PLAYING_STATES || (exports.PLAYING_STATES = {}));
;
var create_default_sequencer = function (sequencerId, scClassName) { return ({
    sequencerId: sequencerId,
    scClassName: scClassName,
    // TODO: This should be `eventCount`
    beat: 0,
    nextBeat: false,
    nextTime: 0,
    numBeats: 8,
    playingState: PLAYING_STATES.STOPPED,
    isReady: false,
    playQuant: [4, 0],
    stopQuant: [8, 0],
    propQuant: [4, 4],
    lastPropChangeQueuedAt: false,
    lastPropChangeAt: false,
    event: undefined,
    midiOutDeviceName: false,
    midiOutPortName: false
}); };
exports.create_default_sequencer = create_default_sequencer;

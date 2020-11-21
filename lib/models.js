"use strict";
exports.__esModule = true;
exports.create_default_sequencer = exports.PLAYING_STATES = void 0;
var PLAYING_STATES;
(function (PLAYING_STATES) {
    PLAYING_STATES[PLAYING_STATES["STOPPED"] = 0] = "STOPPED";
    PLAYING_STATES[PLAYING_STATES["QUEUED"] = 1] = "QUEUED";
    PLAYING_STATES[PLAYING_STATES["PLAYING"] = 2] = "PLAYING";
    PLAYING_STATES[PLAYING_STATES["REQUEUED"] = 3] = "REQUEUED";
    PLAYING_STATES[PLAYING_STATES["STOP_QUEUED"] = 4] = "STOP_QUEUED";
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
    event: false,
    midiOutDeviceName: false,
    midiOutPortName: false
}); };
exports.create_default_sequencer = create_default_sequencer;

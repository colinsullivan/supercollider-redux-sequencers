export declare enum PLAYING_STATES {
    STOPPED = 0,
    QUEUED = 1,
    PLAYING = 2,
    REQUEUED = 3,
    STOP_QUEUED = 4
}
export declare type Quant = [number, number];
export declare type SCReduxSequencer = {
    sequencerId: string;
    scClassName: string;
    beat: number;
    nextBeat: number | boolean;
    nextTime: number;
    numBeats: number;
    playingState: PLAYING_STATES;
    isReady: boolean;
    playQuant: Quant;
    stopQuant: Quant;
    propQuant: Quant;
    lastPropChangeQueuedAt: number | boolean;
    lastPropChangeAt: number | boolean;
    event: object | boolean;
    midiOutDeviceName: string | boolean;
    midiOutPortName: string | boolean;
};
export declare const create_default_sequencer: (sequencerId: string, scClassName: string) => SCReduxSequencer;

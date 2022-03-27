export declare enum PLAYING_STATES {
    STOPPED = "STOPPED",
    QUEUED = "QUEUED",
    PLAYING = "PLAYING",
    REQUEUED = "REQUEUED",
    STOP_QUEUED = "STOP_QUEUED"
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
    event: Record<string, any> | undefined;
    midiOutDeviceName: string | boolean;
    midiOutPortName: string | boolean;
};
export declare const create_default_sequencer: (sequencerId: string, scClassName: string) => SCReduxSequencer;

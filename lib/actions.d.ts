export function sequencerQueued(sequencerId: any): {
    type: string;
    payload: {
        sequencerId: any;
    };
};
export function sequencerPlaying(sequencerId: any): {
    type: string;
    payload: {
        sequencerId: any;
    };
};
export function sequencerStopped(sequencerId: any): {
    type: string;
    payload: {
        sequencerId: any;
    };
};
export function sequencerStopQueued(sequencerId: any): {
    type: string;
    payload: {
        sequencerId: any;
    };
};
export function sequencerPropChangeQueued(sequencerId: any, props?: {}): {
    type: string;
    payload: {
        sequencerId: any;
        props: {};
    };
};

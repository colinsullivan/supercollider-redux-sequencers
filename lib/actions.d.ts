/**
 *  @file       actions.js
 *
 *	@desc       Action set for dispatching changes to the store.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/
export declare function sequencerQueued(sequencerId: string): {
    type: string;
    payload: {
        sequencerId: string;
    };
};
export declare function sequencerPlaying(sequencerId: string): {
    type: string;
    payload: {
        sequencerId: string;
    };
};
export declare function sequencerStopped(sequencerId: string): {
    type: string;
    payload: {
        sequencerId: string;
    };
};
export declare function sequencerStopQueued(sequencerId: string): {
    type: string;
    payload: {
        sequencerId: string;
    };
};
export declare function sequencerPropChangeQueued(sequencerId: string, props?: {}): {
    type: string;
    payload: {
        sequencerId: string;
        props: {};
    };
};

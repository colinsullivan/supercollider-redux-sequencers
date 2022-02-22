/**
 *  Simplify sequencers for sending to SC.
 **/
export const getSCSequencers: import("reselect").OutputSelector<any, {}, (res: any) => {}>;
export const getSCState: import("reselect").OutputSelector<any, {
    sequencers: {};
}, (res: {}) => {
    sequencers: {};
}>;

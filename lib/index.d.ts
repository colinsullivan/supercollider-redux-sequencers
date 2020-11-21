import * as actions from "./actions";
import * as actionTypes from "./actionTypes";
import * as selectors from "./selectors";
import reducer from "./reducers";
import { PLAYING_STATES } from "./models";
export { SCReduxSequencer } from "./models";
declare const _default: {
    actions: typeof actions;
    actionTypes: typeof actionTypes;
    reducer: typeof reducer;
    create_default_sequencer: (sequencerId: string, scClassName: string) => import("./models").SCReduxSequencer;
    PLAYING_STATES: typeof PLAYING_STATES;
    selectors: typeof selectors;
};
export default _default;

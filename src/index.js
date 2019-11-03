import * as actions from "./actions";
import * as actionTypes from "./actionTypes";
import * as selectors from "./selectors";
import reducer, { create_default_sequencer, PLAYING_STATES } from "./reducers";

export default {
  actions,
  actionTypes,
  reducer,
  create_default_sequencer,
  PLAYING_STATES,
  selectors
};

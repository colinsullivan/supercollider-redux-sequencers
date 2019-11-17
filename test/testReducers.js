/**
 *  @file       testReducers.js
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

import { createStore, combineReducers } from "redux";
import { expect } from "chai";

import SCReduxSequencers from "../src/";

const { actionTypes } = SCReduxSequencers;

function create_default_state() {
  var metroInitialState = {
    ...SCReduxSequencers.create_default_sequencer(
      "metro",
      "MetronomeSequencer"
    ),
    myParam: "one"
  };
  metroInitialState.numBeats = 4;
  metroInitialState.stopQuant = [4, 4];
  var metroTwoInitialState = SCReduxSequencers.create_default_sequencer(
    "metro_two",
    "MetronomeSequencer"
  );
  metroTwoInitialState.numBeats = 4;
  metroTwoInitialState.stopQuant = [4, 4];
  return {
    sequencers: {
      metro: metroInitialState,
      metro_two: metroTwoInitialState
    }
  };
}

var rootReducer = combineReducers({
  sequencers: SCReduxSequencers.reducer
});

describe("reducers", function() {
  var store = createStore(rootReducer, create_default_state()),
    state,
    prevState;

  it("should init", function() {
    state = store.getState();
    expect(state).to.have.property("sequencers");
    expect(state.sequencers).to.have.property("metro");
  });

  it("should change sequencers list after sequencer is queued", function() {
    prevState = state;

    store.dispatch(SCReduxSequencers.actions.sequencerQueued("metro"));

    state = store.getState();

    expect(prevState.sequencers).to.not.equal(state.sequencers);
  });

  it("should change sequencer that was queued", function() {
    expect(prevState.sequencers.metro).to.not.equal(state.sequencers.metro);
  });

  it("should not change sequencer that was not queued", function() {
    expect(prevState.sequencers.metro_two).to.equal(state.sequencers.metro_two);
  });

  it("should update state when prop change is queued", function() {
    prevState = store.getState();
    expect(prevState.sequencers.metro.lastPropChangeQueuedAt).to.be.false;
    expect(prevState.sequencers.metro.lastPropChangeAt).to.be.false;

    expect(prevState.sequencers.metro.myParam).to.equal("one");

    store.dispatch(
      SCReduxSequencers.actions.sequencerPropChangeQueued("metro", {
        myParam: "two"
      })
    );

    state = store.getState();

    expect(prevState.sequencers.metro).to.not.equal(state.sequencers.metro);
    expect(state.sequencers.metro.lastPropChangeQueuedAt).to.be.a("number");
    expect(state.sequencers.metro.myParam).to.equal("two");
  });

  it("should update state when props are changed", function() {
    prevState = store.getState();

    // this action would come from SC to indicate the parameter change went
    // into effect
    store.dispatch({
      type: actionTypes.SEQUENCER_PROP_CHANGED,
      payload: {
        sequencerId: "metro"
      }
    });

    state = store.getState();

    expect(prevState.sequencers.metro).to.not.equal(state.sequencers.metro);
    expect(state.sequencers.metro.lastPropChangeQueuedAt).to.equal(
      prevState.sequencers.metro.lastPropChangeQueuedAt
    );
    expect(state.sequencers.metro.lastPropChangeAt).to.be.a("number");
  });
});

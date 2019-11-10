/**
 *  @file       testSCReplicaState.js
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
import * as actionTypes from "../src/actionTypes";
import { getSCState } from "../src/selectors";

function create_default_state() {
  var metroInitialState = SCReduxSequencers.create_default_sequencer(
    "metro",
    "MetronomeSequencer"
  );
  metroInitialState.numBeats = 4;
  metroInitialState.stopQuant = [4, 4];
  return {
    sequencers: {
      metro: metroInitialState
    }
  };
}
var rootReducer = combineReducers({
  sequencers: SCReduxSequencers.reducer
});

describe("SCReplicaState", function() {
  var store = createStore(rootReducer, create_default_state()),
    state,
    scState,
    seqState,
    scSeqState;

  it("should select subset", function() {
    state = store.getState();
    scState = getSCState(state);
    seqState = state.sequencers[Object.keys(state.sequencers)[0]];
    scSeqState = scState.sequencers[Object.keys(scState.sequencers)[0]];
  });

  it("should contain all sequencers", function() {
    expect(Object.keys(state.sequencers)).to.deep.equal(
      Object.keys(scState.sequencers)
    );
  });

  it("should be missing certain sequencer properties", function() {
    expect(seqState).to.have.property("sequencerId");
    expect(scSeqState).to.have.property("sequencerId");
    expect(seqState).to.have.property("playingState");
    expect(scSeqState).to.have.property("playingState");

    expect(seqState).to.have.property("event");
    expect(scSeqState).to.not.have.property("event");
    expect(seqState).to.have.property("beat");
    expect(scSeqState).to.not.have.property("beat");
    expect(seqState).to.have.property("nextBeat");
    expect(scSeqState).to.not.have.property("nextBeat");
    expect(seqState).to.have.property("nextTime");
    expect(scSeqState).to.not.have.property("nextTime");
  });

  it("should reselect after sequencer changes playing state", function() {
    let prevState = state;
    let prevSeqState = seqState;
    let prevSCSeqState = scSeqState;

    // queue sequencer
    store.dispatch(
      SCReduxSequencers.actions.sequencerQueued(seqState.sequencerId)
    );
    state = store.getState();
    scState = getSCState(state);
    seqState = state.sequencers[Object.keys(state.sequencers)[0]];
    scSeqState = scState.sequencers[Object.keys(scState.sequencers)[0]];

    expect(state).to.not.equal(prevState);
    expect(state.sequencers).to.not.equal(prevState.sequencers);
    expect(seqState).to.not.equal(prevSeqState);
    expect(scSeqState).to.not.equal(prevSCSeqState);

    prevSeqState = seqState;
    prevSCSeqState = scSeqState;

    store.dispatch(
      SCReduxSequencers.actions.sequencerPlaying(seqState.sequencerId)
    );

    state = store.getState();
    scState = getSCState(state);
    seqState = state.sequencers[Object.keys(state.sequencers)[0]];
    scSeqState = scState.sequencers[Object.keys(scState.sequencers)[0]];

    expect(seqState).to.not.equal(prevSeqState);
    expect(scSeqState).to.not.equal(prevSCSeqState);
  });

  it("should remain the same as sequencer playback happens", function() {
    let prevSeqState = seqState;
    let prevSCSeqState = scSeqState;

    store.dispatch({
      type: actionTypes.SUPERCOLLIDER_EVENTSTREAMPLAYER_NEXTBEAT,
      payload: {
        id: seqState.sequencerId,
        nextTime: 1,
        nextBeat: 1,
        midinote: 44
      }
    });

    state = store.getState();
    scState = getSCState(state);
    seqState = state.sequencers[Object.keys(state.sequencers)[0]];
    scSeqState = scState.sequencers[Object.keys(scState.sequencers)[0]];

    expect(seqState).to.not.equal(prevSeqState);
    expect(scSeqState).to.equal(prevSCSeqState);
  });
});

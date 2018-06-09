/**
 *  @file       testReducers.js
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

import { createStore, combineReducers } from "redux"
import { expect } from 'chai';

import awakeningSequencers from "../src/"

function create_default_state () {
  var metroInitialState = awakeningSequencers.create_default_sequencer(
    'metro',
    'MetronomeSequencer'
  );
  metroInitialState.numBeats = 4;
  metroInitialState.stopQuant = [4, 4];
  var metroTwoInitialState = awakeningSequencers.create_default_sequencer(
    'metro_two',
    'MetronomeSequencer'
  );
  metroTwoInitialState.numBeats = 4;
  metroTwoInitialState.stopQuant = [4, 4];
  return {
    sequencers: {
      'metro': metroInitialState,
      'metro_two': metroTwoInitialState
    }
  };
}

var rootReducer = combineReducers({
  sequencers: awakeningSequencers.reducer
});

describe('reducers', function () {
  var store = createStore(rootReducer, create_default_state()),
    state,
    prevState;

  it("should init", function () {
    state = store.getState();
    expect(state).to.have.property('sequencers');
    expect(state.sequencers).to.have.property('metro');
  });

  it("should change sequencers list after sequencer is queued", function () {
    prevState = state;

    store.dispatch(awakeningSequencers.actions.sequencerQueued('metro'));

    state = store.getState();

    expect(prevState.sequencers).to.not.equal(state.sequencers);

  });

  it("should change sequencer that was queued", function () {
    expect(prevState.sequencers.metro).to.not.equal(state.sequencers.metro);
  });

  it("should not change sequencer that was not queued", function () {
    expect(prevState.sequencers.metro_two).to.equal(state.sequencers.metro_two);
  });
});

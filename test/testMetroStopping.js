/**
 *  @file       testMetroStopping.js
 *
 *	@desc       testing stopping behavior and known race conditions.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2018 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/


import { createStore, combineReducers, applyMiddleware } from "redux"
import logger from 'redux-logger'
import supercolliderRedux from "supercollider-redux"
import awakeningSequencers from "../src/"
import chai from "chai"
const expect = chai.expect;

import { shouldStartSuperCollider, shouldExitSuperCollider } from './lib';

function create_default_state () {
  var metroInitialState = awakeningSequencers.create_default_sequencer(
    'metro',
    'LongMetronomeSequencer'
  );
  metroInitialState.numBeats = 16;
  metroInitialState.playQuant = [4, 0];
  metroInitialState.stopQuant = [4, 0];

  var stopShorterMetro = awakeningSequencers.create_default_sequencer(
    'stopShorterMetro',
    'LongMetronomeSequencer'
  );
  metroInitialState.numBeats = 16;
  metroInitialState.playQuant = [4, 1];
  metroInitialState.stopQuant = [2, 0];
  return {
    sequencers: {
      'metro': metroInitialState,
      'stopShorterMetro': stopShorterMetro
    }
  };
}
var rootReducer = combineReducers({
  supercolliderRedux: supercolliderRedux.reducer,
  sequencers: awakeningSequencers.reducer
});

describe("Metronome Example", function () {
  it('should init store', function () {
    var store = createStore(rootReducer, create_default_state(), applyMiddleware(logger));
    this.store = store;
  });

  shouldStartSuperCollider();

  it("should become ready soon after SC started", function (done) {
    setTimeout(() => {
      var metroReady = this.store.getState().sequencers.metro.isReady;
      expect(metroReady).to.be.true;
      done();
    }, 250);
  });

  it("should start playing when queued", function (done) {
    this.store.dispatch(awakeningSequencers.actions.sequencerQueued('metro'));
    var currentState = this.store.getState().sequencers.metro;
    var playingState = currentState.playingState;
    var unsub = this.store.subscribe(() => {
      var newState = this.store.getState().sequencers.metro;
      let newPlayingState = newState.playingState;

      if (newPlayingState != playingState) {
        expect(
          newState,
          'object reference did not change, it is mutable'
        ).to.not.equal(currentState);
        playingState = newPlayingState;
        if (playingState == awakeningSequencers.PLAYING_STATES.PLAYING) {
          unsub();
          done();
        }
      }
    });
  });

  it("should play for 4 beats then queue stop", function (done) {
    var beat = this.store.getState().sequencers.metro.beat;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newBeat = state.sequencers.metro.beat;

      if (newBeat != beat) {
        beat = newBeat;
        if (beat >= 8) {
          this.store.dispatch(
            awakeningSequencers.actions.sequencerStopQueued('metro')
          );
          unsub();
          done();
        }
      }
    });
  });

  it("should have queued stop", function (done) {
    var state = this.store.getState();
    expect(
      state.sequencers.metro.playingState
    ).to.equal(awakeningSequencers.PLAYING_STATES.STOP_QUEUED);
    done();
  });

  it("should actually stop playing", function (done) {
    
    var playingState = this.store.getState().sequencers.metro.playingState;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        expect(
          state.sequencers.metro.playingState
        ).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
        unsub();
        done();
      }
    });
  });

  it('should queue again', function () {
    this.store.dispatch(awakeningSequencers.actions.sequencerQueued('metro'));
    let state = this.store.getState();
    expect(
      state.sequencers.metro.playingState
    ).to.equal(awakeningSequencers.PLAYING_STATES.QUEUED);
  });

  it('should switch directly to playing even though EventStreamPlayer sends stragglers', function (done) {
    var playingState = this.store.getState().sequencers.metro.playingState;
    expect(
      playingState
    ).to.equal(awakeningSequencers.PLAYING_STATES.QUEUED);
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        expect(
          state.sequencers.metro.playingState
        ).to.equal(awakeningSequencers.PLAYING_STATES.PLAYING);

        unsub();
        done();
      }
    });
  });

  it('stopShorterMetro should play', function (done) {
    var state = this.store.getState();

    this.store.dispatch(
      awakeningSequencers.actions.sequencerQueued('stopShorterMetro')
    );
    state = this.store.getState()
    expect(
      state.sequencers.stopShorterMetro.playingState
    ).to.equal(awakeningSequencers.PLAYING_STATES.QUEUED);

    var unsub = this.store.subscribe(() => {
      var newState = this.store.getState();

      if (newState.sequencers.stopShorterMetro.playingState !== state.sequencers.stopShorterMetro.playingState) {
        expect(
          newState.sequencers.stopShorterMetro.playingState
        ).to.equal(awakeningSequencers.PLAYING_STATES.PLAYING);

        unsub();
        done();
      }
    })
  });

  it('should immediately STOP_QUEUED when STOP_QUEUED', function () {
    var state = this.store.getState();
    this.store.dispatch(
      awakeningSequencers.actions.sequencerStopQueued('stopShorterMetro')
    );
    state = this.store.getState()
    expect(
      state.sequencers.stopShorterMetro.playingState
    ).to.equal(awakeningSequencers.PLAYING_STATES.STOP_QUEUED);
  });

  it('should go from STOP_QUEUED TO QUEUED when queued', function () {
    var state;
    this.store.dispatch(
      awakeningSequencers.actions.sequencerQueued('stopShorterMetro')
    );
    state = this.store.getState()
    expect(
      state.sequencers.stopShorterMetro.playingState
    ).to.equal(awakeningSequencers.PLAYING_STATES.QUEUED);
  });

  shouldExitSuperCollider();
});

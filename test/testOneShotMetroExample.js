/**
 *  @file       testOneShotMetroExample.js
 *
 *	@desc       Testing the SCReduxSequencer through the MetronomeSequencer
 *	example.  Also see `testOneShotMetroSequencer.sc` which is the corresponding
 *	SC code.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

import { createStore, combineReducers } from "redux";
import SCRedux from "supercollider-redux";
import SCReduxSequencers from "../src/";
import chai from "chai";
const expect = chai.expect;

import { shouldStartSuperCollider, shouldExitSuperCollider } from "./lib";

function create_default_state() {
  var metroInitialState = SCReduxSequencers.create_default_sequencer(
    "metro",
    "OneShotMetronomeSequencer"
  );
  metroInitialState.numBeats = 8;
  metroInitialState.stopQuant = [4, 4];
  return {
    sequencers: {
      metro: metroInitialState
    }
  };
}
var rootReducer = combineReducers({
  SCRedux: SCRedux.reducer,
  sequencers: SCReduxSequencers.reducer,
  tempo: () => 120
});

describe("One Shot Metronome Example", function() {
  it("should init store", function() {
    var store = createStore(rootReducer, create_default_state());
    this.store = store;
  });

  shouldStartSuperCollider();

  it("should become ready soon after SC started", function(done) {
    let metro = null;
    const unsub = this.store.subscribe(() => {
      const state = this.store.getState();
      const {
        scLangReadyState,
        scStoreReadyState,
        scSynthReadyState
      } = state.SCRedux;
      if (
        scLangReadyState === SCRedux.READY_STATES.READY &&
        scStoreReadyState === SCRedux.READY_STATES.READY &&
        scSynthReadyState === SCRedux.READY_STATES.READY
      ) {
        if (metro !== state.sequencers.metro) {
          metro = state.sequencers.metro;
          expect(metro.isReady).to.be.true;
          unsub();
          done();
        }
      }
    });
  });

  it("should start playing when queued", function(done) {
    this.store.dispatch(SCReduxSequencers.actions.sequencerQueued("metro"));
    var playingState = this.store.getState().sequencers.metro.playingState;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        if (playingState == SCReduxSequencers.PLAYING_STATES.PLAYING) {
          unsub();
          done();
        }
      }
    });
  });

  it("should actually stop playing", function(done) {
    var playingState = this.store.getState().sequencers.metro.playingState;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        expect(state.sequencers.metro.playingState).to.equal(
          SCReduxSequencers.PLAYING_STATES.STOPPED
        );
        unsub();
        done();
      }
    });
  });

  it("should start playing again when queued", function(done) {
    this.store.dispatch(SCReduxSequencers.actions.sequencerQueued("metro"));
    var playingState = this.store.getState().sequencers.metro.playingState;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        if (playingState == SCReduxSequencers.PLAYING_STATES.PLAYING) {
          unsub();
          done();
        }
      }
    });
  });

  it("should actually stop playing", function(done) {
    var playingState = this.store.getState().sequencers.metro.playingState;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        expect(
          state.sequencers.metro.playingState,
          "sequencer should have stopped"
        ).to.equal(SCReduxSequencers.PLAYING_STATES.STOPPED);
        unsub();
        done();
      }
    });
  });

  it("should loop when queued while playing", function(done) {
    var playingState = this.store.getState().sequencers.metro.playingState;

    expect(playingState).to.equal(SCReduxSequencers.PLAYING_STATES.STOPPED);

    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState !== playingState) {
        if (playingState === SCReduxSequencers.PLAYING_STATES.STOPPED) {
          // should go from stopped to queued
          expect(newPlayingState).to.equal(
            SCReduxSequencers.PLAYING_STATES.QUEUED
          );
        }
        // should go from queued to playing
        if (playingState === SCReduxSequencers.PLAYING_STATES.QUEUED) {
          expect(newPlayingState).to.equal(
            SCReduxSequencers.PLAYING_STATES.PLAYING
          );
          // queue again after a delay
          setTimeout(() => {
            this.store.dispatch(
              SCReduxSequencers.actions.sequencerQueued("metro")
            );
          }, 2000);
        } else if (playingState === SCReduxSequencers.PLAYING_STATES.PLAYING) {
          // should go from PLAYING -> REQUEUED
          expect(newPlayingState).to.equal(
            SCReduxSequencers.PLAYING_STATES.REQUEUED
          );
        } else if (playingState === SCReduxSequencers.PLAYING_STATES.REQUEUED) {
          // should go from REQUEUED -> PLAYING
          expect(newPlayingState).to.equal(
            SCReduxSequencers.PLAYING_STATES.PLAYING
          );
          unsub();
          done();
        }

        playingState = newPlayingState;
      }
    });

    // first queue
    setTimeout(() => {
      this.store.dispatch(SCReduxSequencers.actions.sequencerQueued("metro"));
    }, 50);
  });

  it("should actually stop playing again", function(done) {
    var playingState = this.store.getState().sequencers.metro.playingState;
    if (playingState === SCReduxSequencers.PLAYING_STATES.STOPPED) {
      done();
    } else {
      var unsub = this.store.subscribe(() => {
        let state = this.store.getState();
        let newPlayingState = state.sequencers.metro.playingState;

        if (newPlayingState !== playingState) {
          playingState = newPlayingState;
          expect(
            state.sequencers.metro.playingState,
            "sequencer should have stopped"
          ).to.equal(SCReduxSequencers.PLAYING_STATES.STOPPED);
          unsub();
          done();
        }
      });
    }
  });
  shouldExitSuperCollider();
});

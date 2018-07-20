/**
 *  @file       testMetroExample.js
 *
 *	@desc       Testing the AwakeningSequencer through the MetronomeSequencer
 *	example.  Also see `testMetroSequencer.sc` which is the corresponding
 *	SC code.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

import { createStore, combineReducers } from "redux"
import sc from 'supercolliderjs';
import supercolliderRedux from "supercollider-redux"
const SCStoreController = supercolliderRedux.SCStoreController
import awakeningSequencers from "../src/"
import chai from "chai"
const expect = chai.expect;

function create_default_state () {
  var metroInitialState = awakeningSequencers.create_default_sequencer(
    'metro',
    'MetronomeSequencer'
  );
  metroInitialState.numBeats = 4;
  metroInitialState.playQuant = [4, 0];
  metroInitialState.stopQuant = [4, 0];
  return {
    sequencers: {
      'metro': metroInitialState
    }
  };
}
var rootReducer = combineReducers({
  supercolliderRedux: supercolliderRedux.reducer,
  sequencers: awakeningSequencers.reducer
});

describe("Metronome Example", function () {
  it("should initialize properly", function (done) {

    var store = createStore(rootReducer, create_default_state());
    this.store = store;
    var unsub = store.subscribe(() => {
      let state = this.store.getState();
      let scStateStoreReadyState = state.supercolliderRedux.scStateStoreReadyState;

      if (scStateStoreReadyState === "READY") {
        unsub();
        done();
      }
    });
    sc.lang.boot().then((sclang) => {
      this.sclang = sclang;
        this.sclang.interpret(`

      var store, sequencerFactory, clockController;

      API.mountDuplexOSC();

      s.waitForBoot({
        store = StateStore.getInstance();
        clockController = ReduxTempoClockController.new((
          store: store
        ));
        sequencerFactory = AwakenedSequencerFactory.getInstance();
        sequencerFactory.setClockController(clockController);
        sequencerFactory.setStore(store);
      });

        `).then(() => {
          setTimeout(() => {
            this.scStoreController = new SCStoreController(this.store);
          }, 2000);
        }).catch(done);
    });
    
  });

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

  it("should quit sclang", function (done) {
    this.sclang.interpret('s.quit();').then(() => {
      this.sclang.quit().then(() => {
        setTimeout(done, 1000);
      }).catch(done);
    }).catch(done);
  });
});

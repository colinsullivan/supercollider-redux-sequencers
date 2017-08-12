/**
 *  @file       testOneShotMetroExample.js
 *
 *	@desc       Testing the AwakeningSequencer through the MetronomeSequencer
 *	example.  Also see `testOneShotMetroSequencer.sc` which is the corresponding
 *	SC code.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

import { createStore } from "redux"
import sc from 'supercolliderjs';
import supercolliderRedux from "supercollider-redux"
import abletonLinkRedux from "abletonlink-redux"
import SCStoreController from "../src/SCStoreController"
import AbletonLinkController from "../src/AbletonLinkController"
import awakeningSequencers from "../src/"
import chai from "chai"
const expect = chai.expect;

function create_default_state () {
  var metroInitialState = awakeningSequencers.create_default_sequencer(
    'metro'
  );
  metroInitialState.numBeats = 8;
  metroInitialState.stopQuant = [4, 4];
  return {
    sequencers: {
      'metro': metroInitialState
    }
  };
}
function rootReducer (state = create_default_state(), action) {

  state.abletonlink = abletonLinkRedux.reducer(state.abletonlink, action);
  state.supercolliderRedux = supercolliderRedux.reducer(state.supercolliderRedux, action);

  state.sequencers = awakeningSequencers.reducer(state.sequencers, action);

  return state;
  
}

describe("Metronome Example", function () {
  this.timeout(10000);

  it("should initialize properly", function (done) {

    var store = createStore(rootReducer);
    this.store = store;
    this.scStoreController = new SCStoreController(store);
    this.abletonLinkController = new AbletonLinkController(store, 'abletonlink');
    sc.lang.boot().then((sclang) => {
      this.sclang = sclang;
      done();
    });
    
  });

  it("should become ready when SC started", function (done) {
    var metroReady = this.store.getState().sequencers.metro.isReady;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newMetroReady = state.sequencers.metro.isReady;

      if (newMetroReady != metroReady) {
        metroReady = newMetroReady;
        if (metroReady) {
          unsub();
          done();
        }
      }
    });
    this.sclang.executeFile(__dirname + '/testOneShotMetroExample.sc').catch(done);
  });

  it("should start playing when queued", function (done) {
    this.store.dispatch(awakeningSequencers.actions.sequencerQueued('metro'));
    var playingState = this.store.getState().sequencers.metro.playingState;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        if (playingState == awakeningSequencers.PLAYING_STATES.PLAYING) {
          unsub();
          done();
        }
      }
    });
  });

  it("should actually stop playing on beat 0 (after 8 beats)", function (done) {
    
    var playingState = this.store.getState().sequencers.metro.playingState;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        expect(
          state.sequencers.metro.beat
        ).to.equal(0)
        expect(
          state.sequencers.metro.playingState
        ).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
        unsub();
        done();
      }
    });
  });

  it("should start playing again when queued", function (done) {
    this.store.dispatch(awakeningSequencers.actions.sequencerQueued('metro'));
    var playingState = this.store.getState().sequencers.metro.playingState;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        if (playingState == awakeningSequencers.PLAYING_STATES.PLAYING) {
          unsub();
          done();
        }
      }
    });
  });
  it("should actually stop playing again on beat 0 (after 8 beats)", function (done) {
    
    var playingState = this.store.getState().sequencers.metro.playingState;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        expect(
          state.sequencers.metro.beat
        ).to.equal(0)
        expect(
          state.sequencers.metro.playingState
        ).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
        unsub();
        done();
      }
    });
  });
  it("should not play when queued then stopped", function (done) {
    var beat = null;
    var playingState = this.store.getState().sequencers.metro.playingState;

    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;
      let newBeat = state.sequencers.metro.beat;

      if (beat != null && newBeat != beat) {
        unsub();
        done("Beat should not have changed");
      }

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        // if it is queued
        if (playingState == awakeningSequencers.PLAYING_STATES.QUEUED) {
          beat = this.store.getState().sequencers.metro.beat;

        } else {

          // otherwise, it should just stop
          expect(
            playingState
          ).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
         
          // and stay stopped
          setTimeout(() => {
            expect(
              playingState
            ).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
            unsub();
            done();
          }, 2000);
        }

      }
    });
    // first queue
    console.log("queueing...");
    this.store.dispatch(awakeningSequencers.actions.sequencerQueued('metro'));
    // shortly after stop
    setTimeout(() => {
      console.log("immediately stopping...");
      this.store.dispatch(
        awakeningSequencers.actions.sequencerStopped('metro')
      );
    }, 30);
  });
});

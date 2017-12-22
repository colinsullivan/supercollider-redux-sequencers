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

import { createStore, combineReducers } from "redux"
import sc from 'supercolliderjs';
import supercolliderRedux from "supercollider-redux"
import abletonLinkRedux from "abletonlink-redux"
const SCStoreController = supercolliderRedux.SCStoreController;
const AbletonLinkController = abletonLinkRedux.AbletonLinkController;
import awakeningSequencers from "../src/"
import chai from "chai"
const expect = chai.expect;

function create_default_state () {
  var metroInitialState = awakeningSequencers.create_default_sequencer(
    'metro',
    'OneShotMetronomeSequencer'
  );
  metroInitialState.numBeats = 8;
  metroInitialState.stopQuant = [4, 4];
  return {
    sequencers: {
      'metro': metroInitialState
    }
  };
}
var rootReducer = combineReducers({
  abletonlink: abletonLinkRedux.reducer,
  supercolliderRedux: supercolliderRedux.reducer,
  sequencers: awakeningSequencers.reducer
});

describe("Metronome Example", function () {
  this.timeout(10000);

  it("should initialize properly", function (done) {

    var store = createStore(rootReducer, create_default_state());
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
    this.sclang.interpret(`
  var store, sequencerFactory;

  API.mountDuplexOSC();

  s.waitForBoot({
    store = StateStore.getInstance();
    sequencerFactory = AwakenedSequencerFactory.getInstance();
    sequencerFactory.setStore(store);
  })
    `).catch(done);
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
          state.sequencers.metro.beat, 'sequencer should have stopped at beat 0'
        ).to.equal(0)
        expect(
          state.sequencers.metro.playingState, 'sequencer should have stopped'
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
            playingState, 'sequencer should have changed to stopped'
          ).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
         
          // and stay stopped
          setTimeout(() => {
            expect(
              playingState, 'sequencer should have remain stopped'
            ).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
            unsub();
            done();
          }, 2000);
        }

      }
    });
    // first queue
    setTimeout(() => {
      this.store.dispatch(awakeningSequencers.actions.sequencerQueued('metro'));
      // shortly after stop
      setTimeout(() => {
        this.store.dispatch(
          awakeningSequencers.actions.sequencerStopped('metro')
        );
      }, 50);
    }, 50);
  });

  it("should quit sclang", function (done) {
    this.sclang.interpret('s.quit();').then(() => {
      this.sclang.quit().then(() => {
        setTimeout(done, 1000);
      }).catch(done);
    }).catch(done);
  });
});

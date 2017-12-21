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

import { createStore } from "redux"
import sc from 'supercolliderjs';
import supercolliderRedux from "supercollider-redux"
import abletonLinkRedux from "abletonlink-redux"
import SCStoreController from "../src/SCStoreController"
const AbletonLinkController = abletonLinkRedux.AbletonLinkController;
import awakeningSequencers from "../src/"
import chai from "chai"
const expect = chai.expect;

function create_default_state () {
  var metroInitialState = awakeningSequencers.create_default_sequencer(
    'metro'
  );
  metroInitialState.numBeats = 4;
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
    this.sclang.interpret(`

  var store, sequencers;

  API.mountDuplexOSC();

  s.waitForBoot({
    store = StateStore.getInstance();
    sequencers = IdentityDictionary.new();

    // when state changes, this method will be called
    store.subscribe({
      var state = store.getState();

      if ((state.sequencers != nil) && (state.sequencers.metro != nil) && (sequencers['metro'] == nil), {
        sequencers['metro'] = MetronomeSequencer.new((store: store, sequencerId: 'metro'));
      });
    });
  });

    `).catch(done);
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
        if (beat == 0) {
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

  it("should actually stop playing on beat 0", function (done) {
    
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

  it("should quit sclang", function (done) {
    this.sclang.interpret('s.quit();').then(() => {
      this.sclang.quit().then(() => {
        setTimeout(done, 1000);
      }).catch(done);
    }).catch(done);
  });
});

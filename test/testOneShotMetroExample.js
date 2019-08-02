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
import supercolliderRedux from "supercollider-redux"
import awakeningSequencers from "../src/"
import chai from "chai"
const expect = chai.expect;

import { shouldStartSuperCollider, shouldExitSuperCollider } from './lib';

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
  supercolliderRedux: supercolliderRedux.reducer,
  sequencers: awakeningSequencers.reducer
});

describe("One Shot Metronome Example", function () {
  this.timeout(10000);

  it('should init store', function () {
    var store = createStore(rootReducer, create_default_state());
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

  it("should actually stop playing", function (done) {
    
    var playingState = this.store.getState().sequencers.metro.playingState;
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState != playingState) {
        playingState = newPlayingState;
        expect(
          state.sequencers.metro.playingState, 'sequencer should have stopped'
        ).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
        unsub();
        done();
      }
    });
  });

  // TODO: Develop a different action type for this behavior
  //it("should not play when queued then stopped", function (done) {
    //var beat = null;
    //var playingState = this.store.getState().sequencers.metro.playingState;

    //var unsub = this.store.subscribe(() => {
      //let state = this.store.getState();
      //let newPlayingState = state.sequencers.metro.playingState;
      //let newBeat = state.sequencers.metro.beat;

      //if (beat != null && newBeat != beat) {
        //unsub();
        //done("Beat should not have changed");
      //}

      //if (newPlayingState != playingState) {
        //playingState = newPlayingState;
        //// if it is queued
        //if (playingState == awakeningSequencers.PLAYING_STATES.QUEUED) {
          //beat = this.store.getState().sequencers.metro.beat;

        //} else {

          //// otherwise, it should just stop
          //expect(
            //playingState, 'sequencer should have changed to stopped'
          //).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
         
          //// and stay stopped
          //setTimeout(() => {
            //expect(
              //playingState, 'sequencer should have remain stopped'
            //).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
            //unsub();
            //done();
          //}, 2000);
        //}

      //}
    //});
    //// first queue
    //setTimeout(() => {
      //this.store.dispatch(awakeningSequencers.actions.sequencerQueued('metro'));
      //// shortly after stop
      //setTimeout(() => {
        //this.store.dispatch(
          //awakeningSequencers.actions.sequencerStopped('metro')
        //);
      //}, 50);
    //}, 50);
  //});

  it("should loop when queued while playing", function (done) {
    var playingState = this.store.getState().sequencers.metro.playingState;

    expect(playingState).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
    
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let newPlayingState = state.sequencers.metro.playingState;

      if (newPlayingState !== playingState) {

        if (playingState === awakeningSequencers.PLAYING_STATES.STOPPED) {
          // should go from stopped to queued
          expect(newPlayingState).to.equal(
            awakeningSequencers.PLAYING_STATES.QUEUED
          );
        }
        // should go from queued to playing
        if (playingState === awakeningSequencers.PLAYING_STATES.QUEUED) {
          expect(newPlayingState).to.equal(
            awakeningSequencers.PLAYING_STATES.PLAYING
          );
          // queue again after a delay
          setTimeout(() => {
            this.store.dispatch(
              awakeningSequencers.actions.sequencerQueued('metro')
            );
          }, 2000);
        } else if (playingState === awakeningSequencers.PLAYING_STATES.PLAYING) {
          // should go from PLAYING -> REQUEUED
          expect(newPlayingState).to.equal(
            awakeningSequencers.PLAYING_STATES.REQUEUED
          );
        } else if (playingState === awakeningSequencers.PLAYING_STATES.REQUEUED) {
          // should go from REQUEUED -> PLAYING
          expect(newPlayingState).to.equal(
            awakeningSequencers.PLAYING_STATES.PLAYING
          );
          unsub();
          done();
        }

        playingState = newPlayingState;
      }
    });

    // first queue
    setTimeout(() => {
      this.store.dispatch(awakeningSequencers.actions.sequencerQueued('metro'));
    }, 50);
  });
  
  it("should actually stop playing again", function (done) {
    
    var playingState = this.store.getState().sequencers.metro.playingState;
    if (playingState === awakeningSequencers.PLAYING_STATES.STOPPED) {
      done();
    } else {
      var unsub = this.store.subscribe(() => {
        let state = this.store.getState();
        let newPlayingState = state.sequencers.metro.playingState;

        if (newPlayingState !== playingState) {
          playingState = newPlayingState;
          expect(
            state.sequencers.metro.playingState, 'sequencer should have stopped'
          ).to.equal(awakeningSequencers.PLAYING_STATES.STOPPED);
          unsub();
          done();
        }
      });
    }
  });
  shouldExitSuperCollider();
});

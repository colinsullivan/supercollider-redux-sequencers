/**
 *  @file       testOutboardExample.js
 *
 *	@desc       Testing the ability to run sequencer output to a MIDI port.
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
import midi from "midi";

import { shouldStartSuperCollider, shouldExitSuperCollider } from "./lib";

const MIDI_PORT_INDEX = 1;

function create_default_state() {
  var metroInitialState = SCReduxSequencers.create_default_sequencer(
    "metro",
    "OutboardExampleSequencer"
  );
  metroInitialState.numBeats = 4;
  metroInitialState.stopQuant = [4, 4];
  metroInitialState.midiOutDeviceName = "(in) SuperCollider";
  metroInitialState.midiOutPortName = "(in) SuperCollider";
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

describe("Outboard Example", function() {
  it("should init store", function() {
    var store = createStore(rootReducer, create_default_state());
    this.store = store;
  });

  it("should init test MIDI input", function() {
    this.midiInput = new midi.input();
    const numPorts = this.midiInput.getPortCount();
    let i = 0;
    while (i < numPorts) {
      console.log(`MIDI port index ${i}: ${this.midiInput.getPortName(i)}`);
      i += 1;
    }

    this.midiNotesReceived = [];
    this.midiInput.on("message", (deltaTime, message) => {
      //console.log('m:' + message + ' d:' + deltaTime);
      this.midiNotesReceived.push(message);
    });
    this.midiInput.openPort(MIDI_PORT_INDEX);
  });

  shouldStartSuperCollider();

  it("should become ready soon after SC started", function(done) {
    setTimeout(() => {
      var metroReady = this.store.getState().sequencers.metro.isReady;
      expect(metroReady).to.be.true;
      done();
    }, 250);
  });

  it("should start playing when queued", function(done) {
    this.store.dispatch(SCReduxSequencers.actions.sequencerQueued("metro"));
    var currentState = this.store.getState().sequencers.metro;
    var playingState = currentState.playingState;
    var unsub = this.store.subscribe(() => {
      var newState = this.store.getState().sequencers.metro;
      let newPlayingState = newState.playingState;

      if (newPlayingState != playingState) {
        expect(
          newState,
          "object reference did not change, it is mutable"
        ).to.not.equal(currentState);
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

  it("should have received some midi notes", function(done) {
    expect(this.midiNotesReceived.length).to.be.above(0);
    done();
  });

  it("Should close midi port", function(done) {
    this.midiInput.closePort();
    done();
  });

  shouldExitSuperCollider();
});

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

import { createStore, combineReducers } from "redux"
import sc from 'supercolliderjs';
import supercolliderRedux from "supercollider-redux"
const SCStoreController = supercolliderRedux.SCStoreController
import awakeningSequencers from "../src/"
import chai from "chai"
const expect = chai.expect;
import midi from 'midi';

function create_default_state () {
  var metroInitialState = awakeningSequencers.create_default_sequencer(
    'metro',
    'OutboardExampleSequencer'
  );
  metroInitialState.numBeats = 4;
  metroInitialState.stopQuant = [4, 4];
  metroInitialState.midiOutDeviceName = "(in) SuperCollider";
  metroInitialState.midiOutPortName = "(in) SuperCollider";
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

const MIDI_PORT_INDEX = 3;

describe("Outboard Example", function () {
  this.timeout(10000);

  it("should initialize properly", function (done) {

    var store = createStore(rootReducer, create_default_state());
    this.midiInput = new midi.input();

    this.midiNotesReceived = []
    this.midiInput.on('message', (deltaTime, message) => {
      //console.log('m:' + message + ' d:' + deltaTime);
      this.midiNotesReceived.push(message);
    });
    console.log(this.midiInput.getPortName(MIDI_PORT_INDEX));
    this.midiInput.openPort(MIDI_PORT_INDEX);

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
      MIDIClient.init();

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
          }, 4000);
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

  it("should have received some midi notes", function (done) {
    expect(this.midiNotesReceived.length).to.be.above(0);
    done();
  });

  //it("should have received midi notes through virtual port", function (done) {
    //// four notes, note on and off
    //expect(this.midiNotesReceived.length).to.equal(4 * 2);
    //done();
  //});

  it("Should close midi port", function (done) {
    this.midiInput.closePort();
    done();
  });

  it("should quit sclang", function (done) {
    this.sclang.interpret('s.quit();').then(() => {
      this.sclang.quit().then(() => {
        setTimeout(done, 1000);
      }).catch(done);
    }).catch(done);
  });
});

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
import abletonLinkRedux from "abletonlink-redux"
const SCStoreController = supercolliderRedux.SCStoreController
const AbletonLinkController = abletonLinkRedux.AbletonLinkController;
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
  abletonlink: abletonLinkRedux.reducer,
  supercolliderRedux: supercolliderRedux.reducer,
  sequencers: awakeningSequencers.reducer
});

describe("Outboard Example", function () {
  this.timeout(10000);

  it("should initialize properly", function (done) {

    var store = createStore(rootReducer, create_default_state());
    this.midiInput = new midi.input();
    console.log(this.midiInput.getPortName(3));

    this.midiNotesReceived = []
    this.midiInput.on('message', (deltaTime, message) => {
      //console.log('m:' + message + ' d:' + deltaTime);
      this.midiNotesReceived.push(message);
    });
    this.midiInput.openPort(3);

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
  MIDIClient.init;
  API.mountDuplexOSC();

  s.waitForBoot({
    store = StateStore.getInstance();
    sequencerFactory = AwakenedSequencerFactory.getInstance();
    sequencerFactory.setStore(store);
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

  it("should actually stop playing on beat 0 (after 4 beats)", function (done) {
    
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

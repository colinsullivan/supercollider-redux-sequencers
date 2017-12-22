#!/usr/bin/env node

/**
 *  @file       example_sampler.js
 *
 *	@desc       Ableton Link state changes into state store, forwarded to
 *	            SuperCollider replica state store.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/



import path from 'path'
import { createStore, combineReducers } from "redux"
import sc from 'supercolliderjs';
import supercolliderRedux from "supercollider-redux"
import abletonLinkRedux from "abletonlink-redux"
const SCStoreController = supercolliderRedux.SCStoreController;
const AbletonLinkController = abletonLinkRedux.AbletonLinkController;
import awakeningSequencers from "."

function create_default_state () {
  return {
    sequencers: {
      'sampler': awakeningSequencers.create_default_sequencer(
        'sampler',
        'SamplerExampleSequencer'
      )
    }
  };
}

var rootReducer = combineReducers({
  [abletonLinkRedux.DEFAULT_MOUNT_POINT]: abletonLinkRedux.reducer,
  [supercolliderRedux.DEFAULT_MOUNT_POINT]: supercolliderRedux.reducer,
  sequencers: awakeningSequencers.reducer
});

var store = createStore(rootReducer, create_default_state());
sc.lang.boot().then((sclang) => {
  sclang.interpret('API.mountDuplexOSC();').then(() => {
    var scStoreController = new SCStoreController(store);
    var abletonLinkController = new AbletonLinkController(store, 'abletonlink');

    let isReady = false;
    store.subscribe(() => {
      let state = store.getState();
      let newIsReady = state.sequencers.sampler.isReady;

      if (newIsReady != isReady) {
        console.log("Queueing...");
        isReady = newIsReady;
        store.dispatch(awakeningSequencers.actions.sequencerQueued('sampler'));
      }
    });

    sclang.interpret(`

  var store, sequencerFactory, bufManager, samples_done_loading;

  samples_done_loading = {

    "Samples done loading!".postln();

    store = StateStore.getInstance();
    sequencerFactory = AwakenedSequencerFactory.getInstance();
    sequencerFactory.setBufManager(bufManager);
    sequencerFactory.setStore(store);
  };

  bufManager = BufferManager.new((
    rootDir: "${path.resolve('./')}",
    doneLoadingCallback: samples_done_loading
  ));

  ServerBoot.add({
    bufManager.load_bufs([
      ["high-zap-desc_110bpm_2bar (Freeze)-1.wav", \\bloop]
    ]);
  });
  s.boot();
    `);

    setInterval(() => {
      console.log("store.getState()");
      console.log(store.getState());
    }, 1000);

    setTimeout(() => {
      store.dispatch(awakeningSequencers.actions.sequencerStopQueued('sampler'));
    }, 10000);

  });
});

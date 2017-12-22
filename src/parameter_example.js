#!/usr/bin/env node

/**
 *  @file       parameter_example.js
 *
 *	@desc       Ableton Link state changes into state store, forwarded to
 *	            SuperCollider replica state store.
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
import awakeningSequencers from "."

function create_default_state () {
  var paramExampleSeq = awakeningSequencers.create_default_sequencer('paramexample');
  paramExampleSeq.releaseTime = 0.3;
  return {
    sequencers: {
      'paramexample': paramExampleSeq
    }
  };
}

var rootReducer = combineReducers({
  [abletonLinkRedux.DEFAULT_MOUNT_POINT]: abletonLinkRedux.reducer,
  [supercolliderRedux.DEFAULT_MOUNT_POINT]: supercolliderRedux.reducer,
  sequencers: function (state, action) {

    state = awakeningSequencers.reducer(state, action);

    switch (action.type) {
      case "PARAM_EXAMPLE_LEGATO":
        state.paramexample.releaseTime = 1.2;
        
        break;

      case "PARAM_EXAMPLE_STOCCATO":
        state.paramexample.releaseTime = 0.2;
        break;
      
      default:
        break;
    }

    return state;
    
  }
});

var store = createStore(rootReducer, create_default_state());
sc.lang.boot().then((sclang) => {
  sclang.interpret('API.mountDuplexOSC();').then(() => {
    var scStoreController = new SCStoreController(store);
    var abletonLinkController = new AbletonLinkController(store, 'abletonlink');

    let paramexampleReady = false;
    store.subscribe(() => {
      let state = store.getState();
      let newIsReady = state.sequencers.paramexample.isReady;

      if (newIsReady != paramexampleReady) {
        console.log("Queueing metronome...");
        paramexampleReady = newIsReady;
        store.dispatch(awakeningSequencers.actions.sequencerQueued('paramexample'));
      }
    });

    sclang.interpret(`
  var store, sequencers;

  s.waitForBoot({
    store = StateStore.getInstance();
    sequencers = IdentityDictionary.new();

    // when state changes, this method will be called
    store.subscribe({
      var state = store.getState();


      if ((state.sequencers != nil) && (state.sequencers.paramexample != nil) && (sequencers['paramexample'] == nil), {
        sequencers['paramexample'] = ParamExampleSequencer.new((store: store, sequencerId: 'paramexample'));
      });


    });
  });

  s.boot();

    `);

    setInterval(() => {
      console.log("store.getState()");
      console.log(store.getState());
    }, 1000);

    setTimeout(() => {
      store.dispatch({
        type: "PARAM_EXAMPLE_LEGATO"
      });

      setTimeout(() => {
        store.dispatch({
          type: "PARAM_EXAMPLE_STOCCATO"
        });

        setTimeout(() => {
          store.dispatch(awakeningSequencers.actions.sequencerStopQueued('paramexample'));
        }, 6000);

      }, 6000);

    }, 6000);


  });
});

//import sc from "supercolliderjs";

import SCRedux from "supercollider-redux";

export function boot(done) {
  var unsub = this.store.subscribe(() => {
    let state = this.store.getState().SCRedux;
    const { scStoreReadyState, scSynthReadyState } = state;

    if (
      scSynthReadyState === SCRedux.READY_STATES.READY &&
      scStoreReadyState === SCRedux.READY_STATES.READY
    ) {
      this.scReduxController
        .getSCLang()
        .interpret(
          `
var store, sequencerFactory;

MIDIClient.init();

store = SCReduxStore.getInstance();
sequencerFactory = SCReduxSequencerFactory.getInstance();
sequencerFactory.setStore(store);
          `
        )
        .then(() => {
          unsub();
          done();
        });
    }
  });
  this.scReduxController = new SCRedux.SCReduxController(this.store);
  this.scReduxController.boot().catch(done);
}

export function quit(done) {
  this.scReduxController
    .quit()
    .then(done)
    .catch(done);
}

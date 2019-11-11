//import sc from "supercolliderjs";

import SCRedux from "supercollider-redux";

export function shouldStartSuperCollider() {
  it("should initialize properly", function(done) {
    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      const scSynthReadyState = state.SCRedux.scSynthReadyState;

      if (scSynthReadyState === SCRedux.READY_STATES.READY) {
        this.sclang
          .interpret(
            `
var store, sequencerFactory, clockController;

MIDIClient.init();

store = SCReduxStore.getInstance();
clockController = SCReduxTempoClockController.new((
  store: store
));
sequencerFactory = SCReduxSequencerFactory.getInstance();
sequencerFactory.setClockController(clockController);
sequencerFactory.setStore(store);
          `
          )
          .then(() => {
            unsub();
            done();
          });
      }
    });
    this.sclangController = new SCRedux.SCLangController(this.store, {
      interpretOnLangBoot: `
s.options.inDevice = "JackRouter";
s.options.outDevice = "JackRouter";
`
    });
    this.scStoreController = new SCRedux.SCStoreController(this.store);
    this.sclangController.boot().then(sclang => {
      this.sclang = sclang;
      this.scStoreController.init();
    });
  });
}

export function shouldExitSuperCollider() {
  it("should exit supercollider", function(done) {
    this.scStoreController.quit();
    this.sclangController.quit().then(done);
  });
}

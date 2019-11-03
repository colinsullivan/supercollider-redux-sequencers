import sc from 'supercolliderjs';

import supercolliderRedux from "supercollider-redux"
export function shouldStartSuperCollider () {
  it("should initialize properly", function (done) {

    var unsub = this.store.subscribe(() => {
      let state = this.store.getState();
      let scStateStoreReadyState = state.supercolliderRedux.scStateStoreReadyState;

      if (scStateStoreReadyState === "READY") {
        unsub();
        done();
      }
    });
    sc.lang.boot({
      debug: true,
      echo: true,
      stdin: false
    }).then((sclang) => {
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
        sequencerFactory = SCReduxSequencerFactory.getInstance();
        sequencerFactory.setClockController(clockController);
        sequencerFactory.setStore(store);
      });

        `).then(() => {
          setTimeout(() => {
            this.scStoreController = new supercolliderRedux.SCStoreController(
              this.store
            );
          }, 4000);
        }).catch(done);
    });
    
  });
}

export function shouldExitSuperCollider () {
  it('should pause', function (done) {
    setTimeout(done, 1000);
  });
  it('should disconnect SCStoreController', function () {
    this.scStoreController.disconnect();
    this.scStoreController = null;
  });
  it('should quit the server', function (done) {
    this.sclang.interpret(`Server.freeAll(); Server.quitAll();`).then(() => {
      setTimeout(done, 1000);
    }).catch(done);
  });

  it("should quit sclang", function (done) {
    this.sclang.quit().then(() => done()).catch(done);
  });
}

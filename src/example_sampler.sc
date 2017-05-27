(
  var store, clockOffsetSeconds, sequencers, bufManager, samples_done_loading;

  API.mountDuplexOSC();


  // I needed this to acutally sync with ableton
  clockOffsetSeconds = 0;

  samples_done_loading = {

    "Samples done loading!".postln();

    "Creating state store...".postln();
    store = StateStore.getInstance();
    sequencers = IdentityDictionary.new();

    // when state changes, this method will be called
    store.subscribe({
      var state = store.getState();


      if ((state.sequencers != nil) && (state.sequencers.sampler != nil) && (sequencers['sampler'] == nil), {
        sequencers['sampler'] = SamplerExampleSequencer.new((
          store: store,
          sequencerId: 'sampler',
          bufManager: bufManager
        ));
      });


    });
    
  };

  bufManager = BufferManager.new((
    rootDir: "./",
    doneLoadingCallback: samples_done_loading
  ));

  ServerBoot.add({
    bufManager.load_bufs([
      ["high-zap-desc_110bpm_2bar (Freeze)-1.wav", \bloop]
    ]);
  });
  s.boot();


)

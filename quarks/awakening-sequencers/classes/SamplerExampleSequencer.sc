SamplerExampleSequencer : GenerativeSequencer{
  var pat, patchSynth;

  initPatch {
    //patch = Patch("cs.sfx.PlayBuf", (
      //buf: bufManager.bufs[\bloop],
      ////gate: 0,
      ////startTime: 0,
      //attackTime: 0.01,
      //releaseTime: 0.01
    //));
    patch = Patch({
      arg freq, gate = 1, buf;
      var out;

      out = PlayBuf.ar(
        buf.numChannels,
        buf,
        trigger: gate,
        doneAction: 2
      );

      out;

    }, (
      buf: bufManager.bufs[\bloop],
      gate: 0
    ));
    patch.prepareForPlay();
    patchSynth = patch.asSynthDef().add();
    
  }

  initStream {
    pat = Pbind(
      // the name of the SynthDef to use for each note
      \instrument, patchSynth.name,
      //\midinote, Pseq([96, 84, 84, 84], inf),
      // rhythmic values
      \dur, Pseq([1, Rest(1), Rest(1), Rest(1)], inf)
    );
    
  }

  getStream {
    ^pat.asStream();
  }
}

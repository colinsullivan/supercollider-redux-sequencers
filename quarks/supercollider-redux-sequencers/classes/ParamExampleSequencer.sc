ParamExampleSequencer : SCReduxSequencer {
  var pat,
    instr,
    patStream,
    patchSynth,
    releaseTime;

  initPatch {
    instr = Instr(\paramexample, {
      arg freq, amp = 1.0, modIndex = 0.5, releaseTime = 0.3;
      var out, car, mod;
      mod = SinOsc.ar(freq * modIndex);
      car = SinOsc.ar(freq * mod, 0, amp);
      out = car * EnvGen.kr(Env.linen(0.001, 0.05, releaseTime), doneAction: 2);
      [out, out];
    }, [
      \freq,
      \amp,
      \lowfreq,
      ControlSpec(0.1, 5.0, \lin)
    ]);
    // define a simple synth
    patch = Patch(\paramexample);
    releaseTime = patch.releaseTime;
    patch.prepareForPlay();
    patchSynth = patch.asSynthDef().add();
    ^patch
  }

  initStream {

    pat = Pbind(
      // the name of the SynthDef to use for each note
      \instrument, patchSynth.name,
      \midinote, Pseq([96, 84, 84, 84], inf),
      // this parameter changes each beat
      \modIndex, Prand([1.0 / 2.0, 1.0 / 4.0, 2.0, 4.0], inf),
      // rhythmic values
      \dur, 1,
      \releaseTime, releaseTime
    );
    
    ^pat.asStream();

  }

  handleStateChange {
    super.handleStateChange();

    releaseTime.value = currentState.releaseTime;
  }
}

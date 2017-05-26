MetronomeSequencer : GenerativeSequencer {
  var pat,
    patStream,
    currentNote,
    patPlayer,
    patchSynth;

  initOutputs {
    // define a simple synth
    this.seqOutputPatch = Patch({
      arg freq, amp = 0.0;
      var out;
      out = SinOsc.ar(freq, 0, amp) * EnvGen.kr(Env.linen(0.001, 0.05, 0.3), doneAction: 2);
      [out, out];
    });
    this.seqOutputPatch.prepareForPlay();
    patchSynth = this.seqOutputPatch.asSynthDef().add();
  }

  initStream {

    pat = Pbind(
      // the name of the SynthDef to use for each note
      \instrument, patchSynth.name,
      \midinote, Pseq([96, 84, 84, 84], inf),
      // rhythmic values
      \dur, 1
    );

  }

  queue {
    super.queue();
    "MetronomeSequencer.queue".postln();
    patPlayer = ReduxEventStreamPlayer.new(
      store,
      sequencerId,
      stream: pat.asStream()
    );
    patPlayer.play(clockController.clock, quant: this.currentState.playQuant);
  }

  queueStop {
    super.queueStop();
    "MetronomeSequencer.queueStop".postln();
    this.clock.play({
      patPlayer.stop();
    }, this.currentState.stopQuant);
  }
}

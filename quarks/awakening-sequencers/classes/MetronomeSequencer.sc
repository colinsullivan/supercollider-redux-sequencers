MetronomeSequencer : GenerativeSequencer {
  var pat, patPlayer;
  initOutputs {
    // define a simple synth
    SynthDef(\simple, {
      arg freq, amp = 0.0;
      var out;
      out = SinOsc.ar(freq, 0, amp) * EnvGen.kr(Env.linen(0.001, 0.05, 0.3), doneAction: 2);
      Out.ar(0, [out, out]);
    }).add();
  }
  initSeqGenerator {

    pat = Pbind(
      // the name of the SynthDef to use for each note
      \instrument, \simple,
      \midinote, Pseq([96, 84, 84, 84], inf),
      // rhythmic values
      \dur, 1
    );

  }

  queue {
    super.queue();
    "MetronomeSequencer.queue".postln();
    patPlayer = pat.play(clock: this.clock, quant: [4, 0]);
  }

  queueStop {
    super.queueStop();
    "MetronomeSequencer.queueStop".postln();
    this.clock.play({
      patPlayer.stop();
    }, [8, 0]);
  }
}

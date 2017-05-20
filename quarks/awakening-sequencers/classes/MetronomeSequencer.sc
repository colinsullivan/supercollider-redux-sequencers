MetronomeSequencer : GenerativeSequencer {
  var pat, patStream, currentNote, patPlayer;
  initOutputs {
    // define a simple synth
    this.seqOutputPatch = Patch({
      arg freq, amp = 0.0;
      var out;
      out = SinOsc.ar(freq, 0, amp) * EnvGen.kr(Env.linen(0.001, 0.05, 0.3), doneAction: 2);
      Out.ar(0, [out, out]);
    });
  }
  initSeqGenerator {

    pat = Pbind(
      \midinote, Pseq([96, 84, 84, 84], inf),
      // rhythmic values
      \dur, 1
    );

    patStream = pat.asStream();
    currentNote = patStream.next(());

  }

  getNextNoteBeat {
    ^this.clock.nextTimeOnGrid(currentNote.dur, 0);
  }

  //scheduleNextBeat {
    //super.scheduleNextBeat();
    //var nextNoteBeat = this.getNextNoteBeat(),
      //noteLatency;
    //noteLatency = this.clock.beats2secs(nextNoteBeat) - this.clock.seconds;
    //currentNote = patStream.next(());
    //this.seqOutputPatch.stop();
    //this.seqOutputPatch.playToMixer(
      //this.patchOutputChannel,
      //atTime: noteLatency
    //);
    
  //}

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

OutboardExampleSequencer : AwakenedSequencer {
  var pat,
    patStream,
    patchSynth;

  initStream {

    pat = Pbind(
      \type, \midi,
      \midiout, this.midiOut,
      \midinote, Pseq([96, 84, 84, 84], inf),
      // rhythmic values
      \dur, 1
    );

    ^pat.asStream();
  }
}


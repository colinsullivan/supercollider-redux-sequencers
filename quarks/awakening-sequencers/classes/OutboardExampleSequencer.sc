OutboardExampleSequencer : AwakenedSequencer {
  var pat,
    patStream,
    patchSynth;

  initStream {

    pat = Pbind(
      \type, \midi,
      \midiout, this.midiOut,
      //\midicmd, \noteOn,
      \chan, 0,
      \midinote, Pseq([96, 84, 84, 84], 1),
      // rhythmic values
      \dur, 1
    );

    ^pat.asStream();
  }

  initAudioOut {
    ^false;
  }
}


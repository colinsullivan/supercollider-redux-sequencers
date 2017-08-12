/**
 *  @file       OneShotMetronomeSequencer.sc
 *
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/


/**
 *  @class        OneShotMetronomeSequencer
 *
 *  @classdesc    A sequencer that doesn't repeat
 */
OneShotMetronomeSequencer : AwakenedSequencer {
  var pat,
    patStream,
    patchSynth;

  initPatch {
    // define a simple synth
    patch = Patch({
      arg freq, amp = 0.0;
      var out;
      out = SinOsc.ar(freq, 0, amp) * EnvGen.kr(Env.linen(0.001, 0.05, 0.3), doneAction: 2);
      [out, out];
    });
    patch.prepareForPlay();
    patchSynth = patch.asSynthDef().add();
    ^patch
  }

  initStream {

    pat = Pbind(
      // the name of the SynthDef to use for each note
      \instrument, patchSynth.name,
      // a sequence of 8 notes that does not repeat
      \midinote, Pseq([96, 84, 84, 84, 96, 84*2, 84*2, 84*2]),
      // rhythmic values
      \dur, 1
    );

    ^pat.asStream();
  }
}

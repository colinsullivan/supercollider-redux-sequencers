/**
 *  @file       testOneShotMetroExample.sc
 *
 *	@desc       This is an example of creating a sequencer that is started and
 *  stops by itself.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

(
  var store, sequencers;

  API.mountDuplexOSC();

  s.boot();

  s.waitForBoot({
    store = StateStore.getInstance();
    sequencers = IdentityDictionary.new();

    // when state changes, this method will be called
    store.subscribe({
      var state = store.getState();


      if ((state.sequencers != nil) && (state.sequencers.metro != nil) && (sequencers['metro'] == nil), {
        sequencers['metro'] = OneShotMetronomeSequencer.new((store: store, sequencerId: 'metro'));
      });
    });
  });

)

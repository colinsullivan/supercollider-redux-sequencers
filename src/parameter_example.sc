/**
 *  @file       parameter_example.sc
 *
 *	@desc       This is an example of creating a sequencer that is started
 *  and parameters are played with while it is going.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

(
  var store, clockOffsetSeconds, sequencers;

  API.mountDuplexOSC();

  s.boot();

  // I needed this to acutally sync with ableton
  clockOffsetSeconds = 0;

  store = StateStore.getInstance();
  sequencers = IdentityDictionary.new();

  // when state changes, this method will be called
  //lastBeatFloor = 0;
  store.subscribe({
    var state = store.getState();


    if ((state.sequencers != nil) && (state.sequencers.paramexample != nil) && (sequencers['paramexample'] == nil), {
      sequencers['paramexample'] = ParamExampleSequencer.new((store: store, sequencerId: 'paramexample'));
    });


  });
)

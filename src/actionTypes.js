/**
 *  @file       actionTypes.js
 *
 *	@desc       Enum of action types.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

export const SEQUENCER_QUEUED = "SC_REDUX_SEQUENCERS-SEQ_QUEUED";
export const SEQUENCER_PLAYING = "SC_REDUX_SEQUENCERS-SEQ_PLAYING";
export const SEQUENCER_STOPPED = "SC_REDUX_SEQUENCERS-SEQ_STOPPED";
export const SEQUENCER_STOP_QUEUED = "SC_REDUX_SEQUENCERS-SEQ_STOP_QUEUED";
export const SEQUENCER_READY = "SC_REDUX_SEQUENCERS-SEQ_READY";
export const SEQUENCER_MIDI_OUT_CHANGED = "SC_REDUX_SEQUENCERS-SEQUENCER_MIDI_OUT_CHANGED"
export const SEQUENCER_PROP_CHANGE_QUEUED = "SC_REDUX_SEQUENCERS-SEQUENCER_PROP_CHANGE_QUEUED";
export const SEQUENCER_PROP_CHANGED = "SC_REDUX_SEQUENCERS-SEQUENCER_PROP_CHANGED";

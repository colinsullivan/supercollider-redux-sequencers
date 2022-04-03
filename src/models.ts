export enum PLAYING_STATES {
  STOPPED = "STOPPED",
  QUEUED = "QUEUED",
  PLAYING = "PLAYING",
  REQUEUED = "REQUEUED",
  STOP_QUEUED = "STOP_QUEUED"
};

export type Quant = [number, number] | null;

export type SCReduxSequencer = {
  sequencerId: string,
  scClassName: string,
  beat: number,
  nextBeat: number | boolean,
  nextTime: number,
  numBeats: number,
  playingState: PLAYING_STATES,
  isReady: boolean,
  playQuant: Quant,
  stopQuant: Quant,
  propQuant: Quant,
  lastPropChangeQueuedAt: number | boolean,
  lastPropChangeAt: number | boolean,
  event: Record<string, any> | undefined,
  midiOutDeviceName: string | boolean,
  midiOutPortName: string | boolean
};

export const create_default_sequencer = (sequencerId : string, scClassName : string) : SCReduxSequencer => ({
  sequencerId,
  scClassName,
  // TODO: This should be `eventCount`
  beat: 0,
  nextBeat: false,
  nextTime: 0,
  numBeats: 8,
  playingState: PLAYING_STATES.STOPPED,
  isReady: false,
  playQuant: [4, 0],
  stopQuant: [8, 0],
  propQuant: [4, 4],
  lastPropChangeQueuedAt: false,
  lastPropChangeAt: false,
  event: undefined,
  midiOutDeviceName: false,
  midiOutPortName: false
});

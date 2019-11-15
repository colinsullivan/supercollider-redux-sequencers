# supercollider-redux-sequencers
A Node.js and SuperCollider framework based on [supercollider-redux](https://github.com/colinsullivan/supercollider-redux).  Provides a musical sequencer that can be started and stopped from Node.js and dispatches state updates to the Node.js process at each event played.

The SuperCollider pattern generators are intended to be written using the [Pbind](http://doc.sccode.org/Tutorials/A-Practical-Guide/PG_03_What_Is_Pbind.html) library, a prominent way to build generative event generators in SuperCollider.

The Node.js interface to SuperCollider is a [Redux](https://redux.js.org/) state store, all starting and stopping of sequencers occurs via actions dispatched to the store, and all note events received from the sequencers are actions dispatched from the SuperCollider state store.

## Sequence Example


## SuperCollider Classes
All SuperCollider code is included in a [quark](http://doc.sccode.org/Guides/UsingQuarks.html) inside the `quarks/supercollider-redux-sequencers` directory.

* `SCReduxSequencer`: A framework for playing a stream to a specific clock and with a `ReduxEventStreamPlayer`.  Responds to state changes in the store, scheduling starting and stopping of the event stream player appropriately.
* `ReduxEventStreamPlayer`: This is a subclass of `EventStreamPlayer` which will dispatch actions each time an event from the stream is played.  Very useful for modifying other state based on the playback of a Pattern, for example.

## Examples

To run the examples:

    npm install

For each example, there is a Node.js script and a SuperCollider script that must be run simultaneously.

### Basic Example
This example plays a metronome implemented in `MetronomeSequencer.sc`.  It is now in `testMetroExample.js` as well.

    $ npm run start_example

### Sampler
This example demonstrates a sampler that requires samples are loaded.

    $ npm run start_sampler_example

### Parameterized
This example demonstrates how a SuperCollider pattern can be parameterized through the state store.  See `ParamExampleSequencer` in the quark.

    $ npm run start_parameter_example

## Sidenotes

It is possible to run Node.js and a child SuperCollider process using [supercolliderjs](https://github.com/crucialfelix/supercolliderjs).  The unit tests do this.

## Unit Tests

    $ npm run test

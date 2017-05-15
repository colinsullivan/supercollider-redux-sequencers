/**
 *  @file       reducers.js
 *
 *	@desc       Translate actions into changes in the Redux state store.
 *
 *  @author     Colin Sullivan <colin [at] colin-sullivan.net>
 *
 *  @copyright  2017 Colin Sullivan
 *  @license    Licensed under the MIT license.
 **/

import * as actionTypes from "./actionTypes";

export function create_default_state () {
  return {
    sequencers: []
  };
}
export default function (state = create_default_state(), action) {
  switch (action.type) {

      // TODO
    
    default:
      break;
  }
  return state;
}

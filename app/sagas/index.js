/**
 * Saga is a middleware provider for Redux. Like
 * Redux, it listens for event keys broadcast from the actions. Saga events
 * typically exist in the middle of the action->reducer lifecycle though, hence the name middleware.
 * Saga middleware in particular is used to process async calls (fetch, AWS, etc). It does
 * this via generator functions (the functions with the * by the name) allowing the Promises
 * to be iterated (and chained) until complete.
 * 
 * Saga/Redux are event-driven, meaning they will subscribe to the events
 * broadcast by the actions and upon completion, optionally publish additional events.
 * 
 * Lifecycle:   Component handler => 
 *              action(event_name, params) => (event broadcast)
 *              saga(event_name, params) => (event listen)
 *                  api_based_on_event(params) =>
 *                  success/fail_event_name fired with return payload (event broadcast)
 *              reducer(success/fail_event_name, payload) => (event listen)
 *              Component update based on state change
 * 
 * The syntax is a bit esoteric but all you need to deal with 
 * is the "yield put" calls used to invoke the API found
 * inside the generator functions (e.g., function* foo(action)).
 */

import { call, put, takeEvery, select } from 'redux-saga/effects'
import * as c from '../constants'
import { getColors, getRawJSON } from '../api/rest'
import { isObjectEmpty } from '../utils/datatransformer'



/**
 * Entry point for this middleware.
 * Starts async API call (promise-based) corresponding 
 * to the event triggered by the action layer.
 */
function* mySaga() {
}
export default mySaga
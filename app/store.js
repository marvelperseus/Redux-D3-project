import {
    createStore,
    applyMiddleware,
    compose
} from 'redux'
import createSagaMiddleware from 'redux-saga'


//================================
// Internal Imports
//================================
import appState from './reducers'
import mySaga from './sagas'

//================================
// Store and Middleware
//================================

// create the saga middleware
const sagaMiddleware = createSagaMiddleware()
// mount it on the Store w/ redux dev tools
// TODO: disable this for actual production sites.
const composeEnhancers = (typeof window != 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose
const store = createStore(
    appState,
    composeEnhancers(applyMiddleware(sagaMiddleware))
)
// then run the saga
sagaMiddleware.run(mySaga)

export default store
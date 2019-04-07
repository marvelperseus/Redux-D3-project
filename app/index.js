//================================
// Application Imports
//================================
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import {
  // HashRouter as Router,
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import { AppContainer } from 'react-hot-loader'
import { Sidebar, Segment } from 'semantic-ui-react'

//================================
// Internal Imports
//================================
import store from './store'
import Main from './Components/Main'

import SidebarMenu from './Components/menus/SidebarMenu'
import TopMenu from './Components/menus/TopMenu'

//================================
// CSS Imports
//================================

// Thirdparty CSS
import 'bootstrap/dist/css/bootstrap.css'
// Local SASS
require('./css/sass/main.scss')

//===================================
// Main React Container: Root
//===================================
export const Root = props => (
  <Provider store={store}>
        <Router>
          <Sidebar.Pushable as={Segment}>
            {/* <SidebarMenu />
            <TopMenu /> */}

            <Sidebar.Pusher>
              <Switch>
                <Route path='/' component={Main} />
              </Switch>
            </Sidebar.Pusher>
          </Sidebar.Pushable>          
        </Router>
      </Provider>
)

if (typeof window !== 'undefined') { // filter to support server-side rendering

    //===================================
    // Render Root component into HTML
    //===================================
    ReactDOM.render(
      <Root />,
      document.getElementById('root')
    )

    // Hot Module Replacement API for development only
    if (module.hot) {
        module.hot.accept(Root, () => {
            const NextApp = Root
            ReactDOM.render(
              <AppContainer>
                <NextApp store={store} />
              </AppContainer>,
              document.getElementById('root')
            )
        })
    }
}

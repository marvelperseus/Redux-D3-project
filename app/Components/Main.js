import React, { Component } from 'react'
import {
    Route,
    Switch,
    Redirect
} from 'react-router-dom'
import { Container } from 'semantic-ui-react'

import GraphHome from './Graphs/GraphHome'
import ErrorDisplay from './ErrorDisplay'

/**
 * Main Layout and Router
 */
class Main extends Component {

    constructor(props) {
        super(props)
        this.state = {
            error     : null,
            errorInfo : null
        }        
    }

     /**
     * Catches errors in child components
     * 
     * @param {*} error 
     * @param {*} info 
     */
    componentDidCatch(error, info) {
        // Display fallback UI
        this.setState({
            error     : error,
            errorInfo : info
        })
    }

    render() {
        return (
            <Container fluid>
                {this.state.error && <ErrorDisplay      
                    errorClass='graph-workspace'
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                />}
                <Switch>
                    <Route exact path='/graphs' render={()=><GraphHome {...this.props}/>}/>
                    <Redirect to='/graphs' />
                </Switch>
            </Container>
        )
    }
}

export default Main

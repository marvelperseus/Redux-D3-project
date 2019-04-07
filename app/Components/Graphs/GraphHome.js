import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Header, Divider, Container, Form, Radio, Grid } from 'semantic-ui-react'

import {    
    basinSetData,
    basinClearData,
    basinSelectFormation,
    basinZoom,
    basinZoomClear,
    uepSetData,
    uepClearData,
    uepSelectFormation,
    uepDeselectFormation,
    uepZoom,
    uepZoomClear,
    burialSetMode,
    uepSetMode,
    mevSetData,
    mevClearData,
    mevSetMode,
    mevSelectModel,
    mevZoom,
    mevZoomClear
} from '../../actions'

import FileUpload from './FileUpload'
import BasinGraphs from './BasinGraphs'
import UepGraphs from './UepGraphs'
import MevGraphs from './MevGraphs'

class GraphHome extends Component {
    constructor(props) {
        super(props)
        this.state = {
            group : 'mev'
        }
    }

    handleGroupChange = (e, { value }) => {
        this.setState({
            group : value
        })
    }

    renderSwitch = () => {
        return (
            <Form className="graph-switch">
                <Form.Field>
                    <Radio
                        label='Burial History'
                        name='graphGroup'
                        value='burial'
                        checked={this.state.group === 'burial'}
                        onChange={this.handleGroupChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Radio
                        label='Temperature / Maturity'
                        name='graphGroup'
                        value='temperature'
                        checked={this.state.group === 'temperature'}
                        onChange={this.handleGroupChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Radio
                        label='Thermal History'
                        name='graphGroup'
                        value='thermal'
                        checked={this.state.group === 'thermal'}
                        onChange={this.handleGroupChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Radio
                        label='UEP'
                        name='graphGroup'
                        value='uep'
                        checked={this.state.group === 'uep'}
                        onChange={this.handleGroupChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Radio
                        label='Model Ensemble Visualization'
                        name='graphGroup'
                        value='mev'
                        checked={this.state.group === 'mev'}
                        onChange={this.handleGroupChange}
                    />
                </Form.Field>
            </Form>
        )
    }    

    render() {
        const { group } = this.state

        return (
            <div className="graph-page">
                <FileUpload {...this.props} group = {group}/>
                <div className="graph-main">
                    { (group === 'burial' || group === 'temperature' || group === 'thermal') && 
                        <BasinGraphs {...this.props} group = {group} />
                    }
                    { (group === 'uep') && 
                        <UepGraphs {...this.props} group = {group} />
                    }
                    { (group === 'mev') && 
                        <MevGraphs {...this.props} group = {group} />
                    }
                    { this.renderSwitch() }
                </div>
            </div>
            
        )
    }
}

GraphHome.propTypes = {
    basinData              : PropTypes.object,
    basinFormationSelected : PropTypes.object,
    basinZoomFactors       : PropTypes.array,
    uepData                : PropTypes.object,
    uepFormationSelected   : PropTypes.object,
    uepZoomFactors         : PropTypes.array,
    burialMode             : PropTypes.string,
    uepMode                : PropTypes.string,
    mevData                : PropTypes.object,
    mevMode                : PropTypes.string,
    mevZoomFactors         : PropTypes.array
}

const mapStateToProps = (state) => ({
    basinData              : state.basinData,
    basinFormationSelected : state.basinFormationSelected,
    basinZoomFactors       : state.basinZoomFactors,
    uepData                : state.uepData,
    uepFormationSelected   : state.uepFormationSelected,
    uepZoomFactors         : state.uepZoomFactors,
    burialMode             : state.burialMode,
    uepMode                : state.uepMode,
    mevData                : state.mevData,
    mevMode                : state.mevMode,
    mevModelSelected       : state.mevModelSelected,
    mevZoomFactors         : state.mevZoomFactors
})

export default connect(
    mapStateToProps,
    {
        basinSetData,
        basinClearData,
        basinSelectFormation,
        basinZoom,
        basinZoomClear,
        uepSetData,
        uepClearData,
        uepSelectFormation,
        uepDeselectFormation,
        uepZoom,
        uepZoomClear,
        burialSetMode,
        uepSetMode,
        mevSetData,
        mevClearData,
        mevSetMode,
        mevSelectModel,
        mevZoom,
        mevZoomClear
    }
)(GraphHome)


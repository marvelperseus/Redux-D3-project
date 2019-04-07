import React, { Component } from 'react'
import * as d3 from 'd3'

import BurialGraph from './BurialGraph'
import ThermalGraph from './ThermalGraph'
import VLineGraph from './VLineGraph'
import StratGraph from './StratGraph'
import LithoGraph from './LithoGraph'

import { isObjectEmpty } from '../../utils/datatransformer'

import { cropFullWidthGraph, cropGraph } from '../../utils/utils'

class BasinGraphs extends Component {
    constructor(props) {
        super(props)

        this.state = {
            layoutLithology    : { left: 20, right: 20, top: 20, bottom: 50, width: 0, height: 0 },
            layoutStratigraphy : { left: 50, right: 40, top: 20, bottom: 50, width: 0, height: 0 },
            layoutBurial       : { left: 60, right: 60, top: 20, bottom: 90, width: 0, height: 0 },
            layoutTemperature  : { left: 20, right: 20, top: 20, bottom: 50, width: 0, height: 0 },
            layoutMaturity     : { left: 20, right: 20, top: 20, bottom: 50, width: 0, height: 0 },
            layoutThermal      : { left: 60, right: 30, top: 20, bottom: 50, width: 0, height: 0 },
            layoutCalculated   : false
        }
    }

    componentDidMount = () => {
        this.calculateLayouts()
        d3.select(window).on('resize', this.calculateLayouts.bind(this))
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.basinData) !== JSON.stringify(this.props.basinData)) {
            this.calculateLayouts()
        }
    }

    calculateLayouts = () => {
        if (isObjectEmpty(this.props.basinData) || !this.graphContentComponent) return

        const { layoutLithology, layoutStratigraphy, layoutBurial, layoutTemperature, layoutMaturity, layoutThermal } = this.state

        const HEIGHT_GRAPH_TYPE = 60
        const HEIGHT_GRAPH_TITLE = 30
        const graphContentWidth = parseInt(d3.select(this.graphContentComponent).style('width'))
        const graphContentHeight = parseInt(d3.select(this.graphContentComponent).style('height')) - HEIGHT_GRAPH_TYPE - HEIGHT_GRAPH_TITLE

        const { stratData, transformedAreaData } = this.props.basinData
        const stratYMin = d3.min(stratData, (d) => d.top)
        const stratYMax = d3.max(stratData, (d) => d.bottom)
        const burialYMin = d3.min(transformedAreaData.map(d => d.minValue))
        const burialYMax = Math.ceil(d3.max(transformedAreaData.map(d => d.maxValue)) / 1000) * 1000

        layoutBurial.height = graphContentHeight - layoutBurial.top - layoutBurial.bottom
        layoutLithology.height = layoutBurial.height * (stratYMax - stratYMin) / (burialYMax - burialYMin)
        layoutStratigraphy.height = layoutLithology.height
        
        layoutLithology.width = Math.round(layoutLithology.height * 0.14)
        layoutStratigraphy.width = Math.round(layoutStratigraphy.height * 0.34)
        layoutBurial.width = graphContentWidth - (layoutLithology.width + layoutLithology.left + layoutLithology.right) - (layoutStratigraphy.width + layoutStratigraphy.left + layoutStratigraphy.right) - layoutBurial.left - layoutBurial.right

        layoutTemperature.height = layoutLithology.height
        layoutTemperature.width = Math.round((graphContentWidth - (layoutLithology.width + layoutLithology.left + layoutLithology.right) - (layoutStratigraphy.width + layoutStratigraphy.left + layoutStratigraphy.right)) / 2) - layoutTemperature.left - layoutTemperature.right

        layoutMaturity.height = layoutLithology.height
        layoutMaturity.width = Math.round((graphContentWidth - (layoutLithology.width + layoutLithology.left + layoutLithology.right) - (layoutStratigraphy.width + layoutStratigraphy.left + layoutStratigraphy.right)) / 2) - layoutMaturity.left - layoutMaturity.right

        layoutThermal.height = layoutLithology.height
        layoutThermal.width = graphContentWidth - (layoutLithology.width + layoutLithology.left + layoutLithology.right) - (layoutStratigraphy.width + layoutStratigraphy.left + layoutStratigraphy.right) - layoutThermal.left - layoutThermal.right

        this.setState({
            layoutLithology,
            layoutStratigraphy,
            layoutBurial,
            layoutTemperature,
            layoutMaturity,
            layoutThermal,
            layoutCalculated : true
        })
    }

    cropGraphs = (area, graph) => {
        const { layoutLithology, layoutStratigraphy, layoutTemperature, layoutMaturity } = this.state
        if (graph !== 'litho') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.litho-graph'), layoutLithology, area)
        if (graph !== 'strat') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.strat-graph'), layoutStratigraphy, area)
        if (graph !== 'temperature') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.temperature-graph'), layoutTemperature, area)
        if (graph !== 'maturity') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.maturity-depth-graph'), layoutMaturity, area)
    }


    render() {
        const { layoutLithology, layoutStratigraphy, layoutBurial, layoutTemperature, layoutMaturity, layoutThermal, layoutCalculated } = this.state
        const { group, basinData, basinFormationSelected, basinZoomFactors, basinZoom, basinZoomClear, burialMode } = this.props

        return (
            <div className="graph-content basin-graphs" ref={el => this.graphContentComponent = el}>
                <h1 className="graph-type">Basin Graphs</h1>
                { !isObjectEmpty(basinData) && this.graphContentComponent && layoutCalculated &&
                    <div className={'graphs ' + group}>
                        <LithoGraph
                            group={group}
                            layout={JSON.parse(JSON.stringify(layoutLithology))}
                            data={basinData.lithoData}
                            zoomFactors={basinZoomFactors}
                            zoom={basinZoom}
                            zoomClear={basinZoomClear}
                            crop={this.cropGraphs.bind(this)}
                            {...this.props}
                        />
                        <StratGraph
                            group={group}
                            layout={JSON.parse(JSON.stringify(layoutStratigraphy))}
                            data={{
                                data              : basinData.stratData,
                                formationSelected : basinFormationSelected,
                                burialMode,
                                needsYAxis        : true
                            }}
                            zoomFactors={basinZoomFactors}
                            zoom={basinZoom}
                            zoomClear={basinZoomClear}
                            crop={this.cropGraphs.bind(this)}
                            {...this.props}
                        />
                        {group === 'burial' && 
                            <BurialGraph
                                group={group}
                                layout={JSON.parse(JSON.stringify(layoutBurial))}
                                data={{
                                    dataset           : basinData.transformedAreaData,
                                    layerNames        : basinData.layerNames,
                                    ageData           : basinData.ageData,
                                    formationSelected : basinFormationSelected,
                                    burialMode,
                                    isolinesData      : basinData.bm['isomaturity']
                                }}
                                {...this.props}
                            />
                        }
                        {group === 'temperature' && 
                            <VLineGraph
                                group={group}
                                layout={JSON.parse(JSON.stringify(layoutTemperature))}
                                data={{                                    
                                    values       : basinData.bm['present_day_temperature'],
                                    axisConfig   : {xLabel: 'Temperature (C)', yLabel: 'TVD'},
                                    xScaleType   : 'linear',
                                    burialDepths : basinData.bm['present_day_burial_depth'],
                                    stratData    : basinData.stratData
                                }}
                                title="Present Day Temperature"
                                className="temperature-graph"
                                zoomFactors={basinZoomFactors}
                                zoom={basinZoom}
                                zoomClear={basinZoomClear}
                                crop={this.cropGraphs.bind(this)}
                                {...this.props}
                            />
                        }
                        {group === 'temperature' &&
                            <VLineGraph
                                group={group}
                                layout={JSON.parse(JSON.stringify(layoutMaturity))}                                
                                data={{
                                    values       : basinData.bm['present_day_maturity'],
                                    axisConfig   : {xLabel: 'EasyRo (%RoEq.)', yLabel: 'TVD'},
                                    xScaleType   : 'log',
                                    burialDepths : basinData.bm['present_day_burial_depth'],
                                    stratData    : basinData.stratData
                                }}
                                title="Maturity vs Depth"
                                className="maturity-depth-graph"
                                zoomFactors={basinZoomFactors}
                                zoom={basinZoom}
                                zoomClear={basinZoomClear}
                                crop={this.cropGraphs.bind(this)}
                                {...this.props}
                            />
                        }
                        {group === 'thermal' && 
                            <ThermalGraph
                                group={group}
                                layout={JSON.parse(JSON.stringify(layoutThermal))}
                                data={{
                                    dataset           : basinData.thermalHistoryData,
                                    ageData           : basinData.ageData,
                                    formationSelected : basinFormationSelected
                                }}
                                {...this.props}
                            />
                        }
                    </div>
                }
            </div>
        )
    }
}

export default BasinGraphs

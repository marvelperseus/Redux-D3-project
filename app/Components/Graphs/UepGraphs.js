import React, { Component } from 'react'
import * as d3 from 'd3'

import UepAxisGraph from './UepAxisGraph'
import StratGraph from './StratGraph'
import OrganofaciesGraph from './OrganofaciesGraph'
import TocHIGraph from './TocHIGraph'
import AreaYieldGraph from './AreaYieldGraph'
import ExpulsionSummaryGraph from './ExpulsionSummaryGraph'

import { isObjectEmpty } from '../../utils/datatransformer'

import { cropFullWidthGraph } from '../../utils/utils'

const WIDTH_RATIO_AXIS = 1.5
const WIDTH_RATIO_STRATIGRAPHY = 3
const WIDTH_RATIO_ORGANOFACIES = 1
const WIDTH_RATIO_TOCHI = 9
const WIDTH_RATIO_AERIAL = 9
const WIDTH_RATIO_SUMMARY = 9
const WIDTH_RATIO_ALL = WIDTH_RATIO_AXIS + WIDTH_RATIO_STRATIGRAPHY + WIDTH_RATIO_ORGANOFACIES + WIDTH_RATIO_TOCHI + WIDTH_RATIO_AERIAL + WIDTH_RATIO_SUMMARY

class UepGraphs extends Component {
    constructor(props) {
        super(props)

        this.state = {
            layoutAxis         : { left: 40, right: 20, top: 30, bottom: 80, width: 0, height: 0 },
            layoutStratigraphy : { left: 20, right: 20, top: 30, bottom: 80, width: 0, height: 0 },
            layoutOrganofacies : { left: 30, right: 30, top: 30, bottom: 80, width: 0, height: 0 },
            layoutTOCHI        : { left: 30, right: 30, top: 30, bottom: 80, width: 0, height: 0 },
            layoutAreaYield    : { left: 20, right: 20, top: 30, bottom: 80, width: 0, height: 0 },
            layoutSummary      : { left: 50, right: 40, top: 30, bottom: 80, width: 0, height: 0 },
            layoutCalculated   : false
        }
    }

    componentDidMount = () => {
        this.calculateLayouts()
        d3.select(window).on('resize', this.calculateLayouts.bind(this))
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.uepData) !== JSON.stringify(this.props.uepData)) {
            this.calculateLayouts()
        }
    }

    calculateLayouts = () => {
        if (isObjectEmpty(this.props.uepData) || !this.graphContentComponent) return

        const { layoutAxis, layoutStratigraphy, layoutOrganofacies, layoutTOCHI, layoutAreaYield, layoutSummary } = this.state

        const HEIGHT_GRAPH_TYPE = 60
        const HEIGHT_GRAPH_TITLE = 30
        const graphContentWidth = parseInt(d3.select(this.graphContentComponent).style('width'))
        const graphContentHeight = parseInt(d3.select(this.graphContentComponent).style('height')) - HEIGHT_GRAPH_TYPE - HEIGHT_GRAPH_TITLE

        const eWidth = graphContentWidth - layoutAxis.left - layoutAxis.right - layoutStratigraphy.left - layoutStratigraphy.right - layoutOrganofacies.left - layoutOrganofacies.right - layoutTOCHI.left - layoutTOCHI.right - layoutAreaYield.left - layoutAreaYield.right - layoutSummary.left - layoutSummary.right

        layoutAxis.height = graphContentHeight - layoutAxis.top - layoutAxis.bottom
        layoutAxis.width = Math.floor(eWidth * WIDTH_RATIO_AXIS / WIDTH_RATIO_ALL)

        layoutStratigraphy.height = graphContentHeight - layoutStratigraphy.top - layoutStratigraphy.bottom
        layoutStratigraphy.width = Math.floor(eWidth * WIDTH_RATIO_STRATIGRAPHY / WIDTH_RATIO_ALL)
        
        layoutOrganofacies.height = graphContentHeight - layoutOrganofacies.top - layoutOrganofacies.bottom
        layoutOrganofacies.width = Math.floor(eWidth * WIDTH_RATIO_ORGANOFACIES / WIDTH_RATIO_ALL)

        layoutTOCHI.height = graphContentHeight - layoutTOCHI.top - layoutTOCHI.bottom
        layoutTOCHI.width = Math.floor(eWidth * WIDTH_RATIO_TOCHI / WIDTH_RATIO_ALL)

        layoutAreaYield.height = graphContentHeight - layoutAreaYield.top - layoutAreaYield.bottom
        layoutAreaYield.width = Math.floor(eWidth * WIDTH_RATIO_AERIAL / WIDTH_RATIO_ALL)

        layoutSummary.height = graphContentHeight - layoutSummary.top - layoutSummary.bottom - 150
        layoutSummary.width = Math.floor(eWidth * WIDTH_RATIO_SUMMARY / WIDTH_RATIO_ALL)

        this.setState({
            layoutAxis,
            layoutStratigraphy,
            layoutOrganofacies,
            layoutTOCHI,
            layoutAreaYield,
            layoutSummary,
            layoutCalculated : true
        })
    }

    cropGraphs = (area, graph) => {
        const { layoutAxis, layoutStratigraphy, layoutOrganofacies, layoutTOCHI, layoutAreaYield } = this.state
        if (graph !== 'uepaxis') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.uepaxis-graph'), layoutAxis, area)
        if (graph !== 'strat') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.strat-graph'), layoutStratigraphy, area)
        if (graph !== 'organo') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.organofacies-graph'), layoutOrganofacies, area)
        if (graph !== 'tochi') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.tochi-graph'), layoutTOCHI, area)
        if (graph !== 'areayield') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.areayield-graph'), layoutAreaYield, area)
    }

    render() {
        const { group, uepData, uepFormationSelected, uepZoomFactors, uepZoom, uepZoomClear, uepMode } = this.props
        const { layoutAxis, layoutStratigraphy, layoutOrganofacies, layoutCalculated, layoutTOCHI, layoutAreaYield, layoutSummary } = this.state
        return (
            <div className="graph-content uep-graphs" ref={el => this.graphContentComponent = el}>
                <h1 className="graph-type">{ uepData.wellName }</h1>
                { !isObjectEmpty(uepData) && this.graphContentComponent && layoutCalculated &&
                    <div className={'graphs ' + group}>
                        <UepAxisGraph
                            group={group}
                            layout={JSON.parse(JSON.stringify(layoutAxis))}
                            data={{
                                formations : uepData.formations,
                                mode       : uepMode
                            }}
                            zoomFactors={uepZoomFactors}
                            zoom={uepZoom}
                            zoomClear={uepZoomClear}
                            crop={this.cropGraphs.bind(this)}
                            {...this.props}
                        />
                        <StratGraph
                            group={group}
                            layout={JSON.parse(JSON.stringify(layoutStratigraphy))}
                            data={{
                                data              : uepData.formations,
                                formationSelected : uepFormationSelected,
                                needsYAxis        : false,
                                uepMode           : uepMode
                            }}
                            zoomFactors={uepZoomFactors}
                            zoom={uepZoom}
                            zoomClear={uepZoomClear}
                            crop={this.cropGraphs.bind(this)}
                            {...this.props}
                        />
                        <OrganofaciesGraph
                            group={group}
                            layout={JSON.parse(JSON.stringify(layoutOrganofacies))}
                            data={{
                                data              : uepData.formations,
                                formationSelected : uepFormationSelected,
                                mode              : uepMode
                            }}
                            zoomFactors={uepZoomFactors}
                            zoom={uepZoom}
                            zoomClear={uepZoomClear}
                            crop={this.cropGraphs.bind(this)}
                            {...this.props}
                        />
                        <TocHIGraph
                            group={group}
                            layout={JSON.parse(JSON.stringify(layoutTOCHI))}
                            data={{
                                formations        : uepData.formations,
                                dataInDepth       : uepData.hiTocInDepth,
                                dataInAge         : uepData.hiTocInAge,
                                formationSelected : uepFormationSelected,
                                mode              : uepMode
                            }}
                            zoomFactors={uepZoomFactors}
                            zoom={uepZoom}
                            zoomClear={uepZoomClear}
                            crop={this.cropGraphs.bind(this)}
                            {...this.props}
                        />
                        <AreaYieldGraph
                            group={group}
                            layout={JSON.parse(JSON.stringify(layoutAreaYield))}
                            data={{
                                data              : uepData.areayield,
                                layoutSummary,
                                formations        : uepData.formations,
                                formationSelected : uepFormationSelected,
                                mode              : uepMode
                            }}
                            zoomFactors={uepZoomFactors}
                            zoom={uepZoom}
                            zoomClear={uepZoomClear}
                            crop={this.cropGraphs.bind(this)}
                            {...this.props}
                        />
                        <ExpulsionSummaryGraph
                            group={group}
                            layout={JSON.parse(JSON.stringify(layoutSummary))}
                            data={{
                                data              : uepData.expulsionSummary,
                                samples           : uepData.sampleIndics,
                                formationSelected : uepFormationSelected
                            }}
                            {...this.props}
                        />
                    </div>
                }
            </div>            
        )
    }
}

export default UepGraphs

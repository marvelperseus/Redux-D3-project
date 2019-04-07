import React, { Component } from 'react'
import * as d3 from 'd3'
import { Checkbox } from 'semantic-ui-react'

import MevAxisGraph from './MevAxisGraph'
import StratGraph from './StratGraph'
import MevFractionGraph from './MevFractionGraph'

import { isObjectEmpty } from '../../utils/datatransformer'

import { cropFullWidthGraph } from '../../utils/utils'

const WIDTH_LEFT = 0.4
const WIDTH_RIGHT = 0.6

const WIDTH_RATIO_STANDARD_AXIS = 2
const WIDTH_RATIO_STANDARD = 10

const WIDTH_RATIO_MODELS_AXIS = 2
const WIDTH_RATIO_MODELS_STRAT = 4
const WIDTH_RATIO_MODELS = 12

class MevGraphs extends Component {
    constructor(props) {
        super(props)

        this.state = {
            layoutAxisStandard : { left: 40, right: 40, top: 20, bottom: 50, width: 0, height: 0 },
            layoutAxisModels   : { left: 40, right: 40, top: 20, bottom: 50, width: 0, height: 0 },
            layoutStratigraphy : { left: 20, right: 20, top: 20, bottom: 50, width: 0, height: 0 },
            layoutProperty     : { left: 20, right: 20, top: 20, bottom: 50, width: 0, height: 0 },
            layoutCalculated   : false
        }
    }

    componentDidMount = () => {
        this.calculateLayouts()
        d3.select(window).on('resize', this.calculateLayouts.bind(this))
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.mevData) !== JSON.stringify(this.props.mevData)) {
            this.calculateLayouts()
        }
        if (JSON.stringify(prevProps.mevMode) !== JSON.stringify(this.props.mevMode)) {
            this.calculateLayouts()
        }
    }

    calculateLayouts = () => {
        if (isObjectEmpty(this.props.mevData) || !this.graphContentComponent) return

        const { layoutAxisStandard, layoutAxisModels, layoutStratigraphy, layoutProperty } = this.state

        const propertiesCount = Object.keys(this.props.mevData.properties).length + 1

        const HEIGHT_GRAPH_TYPE = 60
        const HEIGHT_GRAPH_TITLE = 30
        const HEIGHT_MODE_SWITCH = 37
        const HEIGHT_SCROLL = 10
        const HEIGHT_MODEL_NAME  = 50

        const graphContentWidth = parseInt(d3.select(this.graphContentComponent).style('width'))
        const graphContentHeight = parseInt(d3.select(this.graphContentComponent).style('height')) 
            - HEIGHT_GRAPH_TYPE - HEIGHT_GRAPH_TITLE - HEIGHT_MODE_SWITCH
            - (propertiesCount > 2 ? HEIGHT_SCROLL : 0)
            - HEIGHT_MODEL_NAME

        const graphLeftContentWidth = graphContentWidth * WIDTH_LEFT
        const graphRightContentWidth = graphContentWidth * WIDTH_RIGHT

        const eWidthStandard = graphLeftContentWidth - layoutAxisStandard.left - layoutAxisStandard.right
        layoutAxisStandard.height = graphContentHeight - layoutAxisStandard.top - layoutAxisStandard.bottom
        layoutAxisStandard.width = Math.floor(eWidthStandard * WIDTH_RATIO_STANDARD_AXIS / WIDTH_RATIO_STANDARD)

        const eWidthModels = graphLeftContentWidth
            - layoutAxisModels.left - layoutAxisModels.right
            - layoutStratigraphy.left - layoutStratigraphy.right
        layoutAxisModels.height = graphContentHeight - layoutAxisModels.top - layoutAxisModels.bottom
        layoutAxisModels.width = Math.floor(eWidthModels * WIDTH_RATIO_MODELS_AXIS / WIDTH_RATIO_MODELS)
        layoutStratigraphy.height = graphContentHeight - layoutStratigraphy.top - layoutStratigraphy.bottom
        layoutStratigraphy.width = Math.floor(eWidthModels * WIDTH_RATIO_MODELS_STRAT / WIDTH_RATIO_MODELS)

        layoutProperty.height = graphContentHeight - layoutProperty.top - layoutProperty.bottom
        layoutProperty.width = Math.floor(graphRightContentWidth / 2) - layoutProperty.left - layoutProperty.right

        this.setState({
            layoutAxisStandard,
            layoutAxisModels,
            layoutStratigraphy,
            layoutProperty,
            layoutCalculated : true
        })
    }

    cropGraphs = (area, graph) => {
        const { layoutAxisStandard, layoutAxisModels, layoutStratigraphy, layoutProperty } = this.state
        const { mevMode } = this.props

        const propertyKeys = ['Clay Fraction', ...(Object.keys(this.props.mevData.properties))]
        const propertyClasses = propertyKeys.map((key) => 'mev-' + key.toLowerCase().replace(/ /g, '') + '-graph')

        if (graph !== 'mevaxis') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.mevaxis-graph'), mevMode === 'standard' ? layoutAxisStandard : layoutAxisModels, area)
        if (graph !== 'strat') cropFullWidthGraph(d3.select(this.graphContentComponent).select('.strat-graph'), layoutStratigraphy, area)
        propertyClasses.forEach((pc) => {
            if (graph !== pc) cropFullWidthGraph(d3.select(this.graphContentComponent).select(`.${pc}`), layoutProperty, area)
        })
    }

    handleChangeMode() {
        const { mevMode } = this.props
        if (mevMode === 'standard') {
            this.props.mevSetMode('models')
        } else {
            this.props.mevSetMode('standard')
        }
    }

    render() {
        const { group, mevData, mevMode, mevModelSelected, mevZoomFactors, mevZoom, mevZoomClear } = this.props
        const { layoutAxisStandard, layoutAxisModels, layoutStratigraphy, layoutProperty, layoutCalculated } = this.state
        var selectedModel
        if (!isObjectEmpty(mevModelSelected)) {
            selectedModel = mevModelSelected.modelKey
        } else {
            selectedModel = 'model 1'
        }
        let vMin, vMax, yMin, yMax, yTickUnit, formdata, yTicks
        if (!isObjectEmpty(mevData)) {
            if (mevMode === 'standard') {
                vMin = d3.min(mevData.wellPath['TVDss']['values'])
                vMax = d3.max(mevData.wellPath['TVDss']['values'])
            } else if (mevMode === 'models' && mevModelSelected) {
                vMin = d3.min(Object.values(mevData.formation[mevModelSelected.modelKey]))
                vMax = d3.max(Object.values(mevData.formation[mevModelSelected.modelKey]))
            }
            yTickUnit = Math.round(((vMax - vMin) / 10) / 1000) * 1000
            yMin = Math.floor(vMin / yTickUnit) * yTickUnit
            yMax = Math.ceil(vMax / yTickUnit) * yTickUnit
            var temp = d3.max(Object.values(mevData.age['models'][selectedModel])) - d3.min(Object.values(mevData.age['models'][selectedModel])) 
            var ageTickUnit = temp/(yMax-yMin)*yTickUnit
            if (mevMode === 'models') {
                var formDepthMin = Math.floor(d3.min(Object.values(mevData.formation[selectedModel])) / yTickUnit) * yTickUnit
                var formDepthMax = Math.ceil(d3.max(Object.values(mevData.formation[selectedModel])) / yTickUnit) * yTickUnit
                var ageDepthMin = Math.floor(d3.min(Object.values(mevData.age['models'][selectedModel])) / ageTickUnit) * ageTickUnit
                var ageDepthMax = Math.ceil(d3.max(Object.values(mevData.age['models'][selectedModel])) / ageTickUnit) * ageTickUnit
            }

            yTicks = [...(_.range(yMin, yMax, yTickUnit)), yMax]
            if (mevMode === 'models' && mevModelSelected) {
                yMin = vMin
                yMax = vMax
            }
        }
        return (
            <div className="graph-content mev-graphs" ref={el => this.graphContentComponent = el}>
                <h1 className="graph-type">{ mevData.title }</h1>
                { !isObjectEmpty(mevData) && this.graphContentComponent && layoutCalculated &&
                    <div className={'graphs ' + group}>
                        <div className={'mev-graphs-model-name' + (mevMode === 'standard' ? ' no-border-bottom' : '')}>
                            { mevMode === 'models' && mevModelSelected && mevModelSelected.modelKey }
                        </div>
                        <div className="mev-graphs-left">
                        {mevMode === 'standard'?
                          (  <MevAxisGraph
                            group={group}
                            layout={JSON.parse(JSON.stringify(mevMode === 'standard' ? layoutAxisStandard : layoutAxisModels))}
                            data={{
                                mode     : mevMode,
                                title    : 'Depth',
                                formdata : Object.values(mevData.formation[selectedModel]),
                                unit     : 'TVDss '  + '[' + mevData.wellPath['TVDss']['unit'] + ']',
                                yTickUnit,
                                yMin,
                                yMax
                            }}
                            zoomFactors={mevZoomFactors}
                            zoom={mevZoom}
                            zoomClear={mevZoomClear}
                            {...this.props}
                            />) : (<div><MevAxisGraph
                            group={group}
                            layout={JSON.parse(JSON.stringify(mevMode === 'standard' ? layoutAxisStandard : layoutAxisModels))}
                            data={{
                                mode     : mevMode,
                                title    : 'Depth',
                                formdata : Object.values(mevData.formation[selectedModel]),
                                unit     : 'TVDss '  + '[' + mevData.wellPath['TVDss']['unit'] + ']',
                                yTickUnit,
                                yMin,
                                yMax
                            }}
                            zoomFactors={mevZoomFactors}
                            zoom={mevZoom}
                            zoomClear={mevZoomClear}
                            {...this.props}
                            />
                            <MevAxisGraph
                                group={group}
                                layout={JSON.parse(JSON.stringify(mevMode === 'standard' ? layoutAxisStandard : layoutAxisModels))}
                                data={{
                                    mode      : mevMode,
                                    title     : 'Age',
                                    formdata  : Object.values(mevData.age['models'][selectedModel]),
                                    unit      : 'Age '  + '[' + mevData.age['unit'] + ']',
                                    yTickUnit : ageTickUnit,
                                    yMin      : ageDepthMin,
                                    yMax      : ageDepthMax
                                }}
                                zoomFactors={mevZoomFactors}
                                zoom={mevZoom}
                                zoomClear={mevZoomClear}
                                {...this.props}
                            /></div>)}
                            { mevMode === 'models' && mevModelSelected &&
                                <StratGraph
                                    group={group}
                                    layout={JSON.parse(JSON.stringify(layoutStratigraphy))}
                                    data={{
                                        data       : mevData.formations[mevModelSelected.modelKey],
                                        needsYAxis : false
                                    }}
                                    zoomFactors={mevZoomFactors}
                                    zoom={mevZoom}
                                    zoomClear={mevZoomClear}
                                    crop={this.cropGraphs.bind(this)}
                                    {...this.props}
                                />
                            }
                        </div>
                        <div className="mev-graphs-right">
                            <MevFractionGraph
                                title="Clay Fraction"
                                className="mev-fraction-graph mev-clayfraction-graph"
                                group={group}
                                layout={JSON.parse(JSON.stringify(layoutProperty))}
                                data={{
                                    mode        : mevMode,
                                    tvdss       : mevData.wellPath['TVDss']['values'],
                                    models      : mevData.clayFraction['models'],
                                    average     : mevData.clayFraction['average'][0],
                                    std         : mevData.clayFraction['standard deviation'][0],
                                    unit        : mevData.clayFraction['unit'],
                                    yMin,
                                    yMax,
                                    yTicks,
                                    xMin        : 0,
                                    xMax        : 100,
                                    xTickUnit   : 20,
                                    propertyKey : 'Clay Fraction',
                                    mevModelSelected
                                }}
                                zoomFactors={mevZoomFactors}
                                zoom={mevZoom}
                                zoomClear={mevZoomClear}
                                crop={this.cropGraphs.bind(this)}
                                {...this.props}
                            />
                            { Object.keys(mevData.properties).map((propertyKey) => {
                                const vs = _.flatten(Object.values(mevData.properties[propertyKey]['models']).map((model) => model.map((d) => d)))
                                const vMin = d3.min(vs)
                                const vMax = d3.max(vs)
                                const xTickUnit = Math.ceil(((vMax - vMin) / 5) / 25) * 25
                                const xMin = Math.floor(vMin / xTickUnit) * xTickUnit
                                const xMax = Math.ceil(vMax / xTickUnit) * xTickUnit

                                return (
                                    <MevFractionGraph
                                        key={propertyKey}
                                        title={propertyKey}
                                        className={'mev-fraction-graph mev-'+propertyKey.toLowerCase().replace(/ /g, '')+'-graph'}
                                        group={group}
                                        layout={JSON.parse(JSON.stringify(layoutProperty))}
                                        zoomFactors={mevZoomFactors}
                                        zoom={mevZoom}
                                        zoomClear={mevZoomClear}
                                        crop={this.cropGraphs.bind(this)}
                                        data={{
                                            mode    : mevMode,
                                            tvdss   : mevData.wellPath['TVDss']['values'],
                                            models  : mevData.properties[propertyKey]['models'],
                                            average : mevData.properties[propertyKey]['average'][0],
                                            std     : mevData.properties[propertyKey]['standard deviation'][0],
                                            unit    : mevData.properties[propertyKey]['unit'],
                                            yMin,
                                            yMax,
                                            yTicks,
                                            xMin,
                                            xMax,
                                            xTickUnit,
                                            propertyKey,
                                            mevModelSelected
                                        }}
                                        {...this.props}
                                    />
                                )
                            })}
                        </div>
                    </div>
                }
                { !isObjectEmpty(mevData) && this.graphContentComponent && layoutCalculated &&
                    <div className="mode-switch">
                        <span className={mevMode === 'standard' ? ' mode-switch-label-bold' : 'mode-switch-label'}>Mean and Standard Deviation</span>
                        <Checkbox
                            defaultChecked={mevMode === 'models'}
                            onChange={this.handleChangeMode.bind(this)}
                            toggle
                        />
                        <span className={mevMode === 'models' ? ' mode-switch-label-bold' : 'mode-switch-label'}>{ mevData.modelsCount } models</span>
                    </div>
                }
            </div>            
        )
    }
}

export default MevGraphs

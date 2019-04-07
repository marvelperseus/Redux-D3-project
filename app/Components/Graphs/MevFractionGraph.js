import React, { Component } from 'react'
import * as d3 from 'd3'

import BaseGraph from './BaseGraph'
import { setupFullWidthCroppingZoom } from '../../utils/utils'

class MevFractionGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {
        const { group, layout, title } = this.props
        const { mode, unit, tvdss, models, average, std, yMin, yMax, yTicks, xMin, xMax, xTickUnit, propertyKey, mevModelSelected } = this.props.data

        this.dataStandard = tvdss.map((t, i) => ({
            tvdss : t,
            val   : average[i],
            std   : std[i]
        }))

        this.dataModels = Object.keys(models).map((modelKey, i) => {
            return {
                modelKey,
                values : tvdss.map((t, i) => ({
                    tvdss : t,
                    val   : models[modelKey][i]
                }))
            }
        })

        const xTicks = [...(_.range(xMin, xMax, xTickUnit)), xMax]

        this.xScale = d3.scaleLinear().range([0, layout.width]).domain([xMin, xMax])
        this.yScale = d3.scaleLinear().range([0, layout.height]).domain([yMin, yMax])

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom))
        
        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        this.g.append('defs').append('clipPath')
            .attr('id', 'clip-mevfraction')
            .append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)

        this.xAxis = d3.axisBottom().scale(this.xScale)
        this.xAxisEl = this.g.append('g')
            .attr('class', 'mevfraction-axis mevfraction-axis-x')
            .attr('transform', 'translate(0,' + layout.height + ')')
            .call(this.xAxis.tickValues(xTicks).tickSizeInner(-layout.height).tickSizeOuter(0).tickPadding(10))
        this.xAxisEl.append('text')
            .attr('class', 'mevfraction-axis-label')
            .attr('x', layout.width / 2)
            .attr('y', 40)
            .text(title + ' (' + unit + ')')

        this.yAxis = d3.axisLeft().scale(this.yScale)
        this.yAxisEl = this.g.append('g')
            .attr('clip-path', 'url(#clip-mevfraction)')
            .attr('class', 'mevfraction-axis mevfraction-axis-y')
            .call(this.yAxis.tickValues(yTicks).tickSizeInner(-layout.width).tickSizeOuter(0))

        this.graphContainer = this.g.append('g').attr('clip-path', 'url(#clip-mevfraction)')
    
        if (mode === 'standard') {
            this.areaFunction = d3.area()
                .x0((d) => this.xScale(d.val - d.std))
                .x1((d) => this.xScale(d.val + d.std))
                .y((d) => this.yScale(d.tvdss))
            this.area = this.graphContainer.append('path')
                .datum(this.dataStandard)
                .attr('d', this.areaFunction)
                .attr('class', 'mevfraction-area')
        }

        this.curveFunction = d3.line()
            .x((d) => this.xScale(d.val))
            .y((d) => this.yScale(d.tvdss))
            .curve(d3.curveLinear)
        
        if (mode === 'standard') {
            this.curve = this.graphContainer.append('path')
                .attr('d', this.curveFunction(this.dataStandard))
                .attr('class', 'mevfraction-curve mevfraction-curve-bold')
        } else {
            this.curves = this.dataModels.map((dmodel) => {
                return this.graphContainer.append('path')
                    .attr('d', this.curveFunction(dmodel.values))
                    .attr('class', (d) => {
                        if (mevModelSelected && dmodel.modelKey === mevModelSelected.modelKey) {
                            return 'mevfraction-curve mevfraction-curve-selected'
                        } else {
                            return 'mevfraction-curve'
                        }
                    })
            })
        }
        
        this.borderContainer = this.g.append('g')
        this.borderContainer.append('path')
            .attr('class', 'mevfraction-border').attr('d', `M 0 0 H ${layout.width}`)
        this.borderContainer.append('path')
            .attr('class', 'mevfraction-border').attr('d', `M 0 ${layout.height} H ${layout.width}`)
        this.borderContainer.append('path')
            .attr('class', 'mevfraction-border').attr('d', `M 0 0 V ${layout.height}`)
        this.borderContainer.append('path')
            .attr('class', 'mevfraction-border').attr('d', `M ${layout.width} 0 V ${layout.height}`)

        setupFullWidthCroppingZoom(this.svg, this.g, layout, this.props.zoom.bind(this), this.props.zoomClear.bind(this), this.props.crop, propertyKey.toLowerCase().replace(/ /g, ''))

        if (mode === 'models') {
            this.curvesWiderContainer = this.g.append('g').attr('clip-path', 'url(#clip-mevfraction)')

            this.curvesWider = this.dataModels.map((dmodel) => {
                return this.curvesWiderContainer.append('path')
                    .attr('d', this.curveFunction(dmodel.values))
                    .attr('class', 'mevfraction-curve-wider')
                    .on('click', () => {
                        this.props.mevSelectModel({
                            propertyKey,
                            modelKey : dmodel.modelKey,
                            values   : dmodel.values
                        })
                    })
            })
        }
    }

    zoomGraph() {
        const { layout, zoomFactors } = this.props
        const { mode } = this.props.data

        let transformY = d3.zoomIdentity

        for (let i = 0; i < zoomFactors.length; i++) {
            const factors = zoomFactors[i]

            transformY = transformY
                .translate(0, layout.height / 2)
                .scale(factors.scaleY)
                .translate(0, factors.y)
        }

        const newYScale = transformY.rescaleY(this.yScale)

        this.yAxisEl.call(this.yAxis.scale(newYScale))

        if (mode === 'standard') {
            this.areaFunction.y((d) => newYScale(d.tvdss))
            this.area.attr('d', this.areaFunction)
        }

        this.curveFunction.y((d) => newYScale(d.tvdss))

        if (mode === 'standard') {
            this.curve.attr('d', this.curveFunction(this.dataStandard))
        } else {
            this.dataModels.forEach((dmodel, index) => {
                this.curves[index].attr('d', this.curveFunction(dmodel.values))
                this.curvesWider[index].attr('d', this.curveFunction(dmodel.values))
            })
        }
    }

    render() {
        const {title, className} = this.props
        return (
            <BaseGraph
                title={title}
                className={className}
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                zoomGraph={this.zoomGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default MevFractionGraph
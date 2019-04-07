import React, { Component } from 'react'
import * as d3 from 'd3'
import * as _ from 'lodash'

import BaseGraph from './BaseGraph'
import { setupFullWidthCroppingZoom } from '../../utils/utils'

class ExpulsionSummaryGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {
        this.axisLabels = { xAxis: 'Standard Thermal Stress (ºC at 2 ºC/Ma)', yAxis: 'Total formation areal yield expelled (mmboe/km2)' }
        
        const { layout } = this.props
        const { data, samples, formationSelected } = this.props.data

        let mixedData = []
        if (formationSelected) {
            const indics = Object.keys(samples).filter((i) => samples[i] >= formationSelected.topDepth && samples[i] <= formationSelected.bottomDepth)
            mixedData = data.T2_tb.map((tb, i) =>({
                tb  : tb,
                hc  : _.sum(indics.map((index) => data.expelled_hc_per_sample[index][i])),
                oil : _.sum(indics.map((index) => data.expelled_oil_per_sample[index][i]))
            }))
        } else {
            mixedData = data.T2_tb.map((tb, i) =>({
                tb  : tb,
                hc  : data.expelled_hc[i],
                oil : data.expelled_oil[i]
            }))
        }

        const xMin = 70
        const xMax = 270
        const xTicks = [...(_.range(xMin, xMax, (xMax - xMin) / 8)), xMax]
        const yMin = 0
        let yMax = d3.max(mixedData.map((d) => d.hc))
        let yTickSpace = 2
        let yFormat = d3.format('.0f')
        if (yMax <= 1) {
            yTickSpace = 0.1
            yFormat = d3.format('.1f')
        } else if (yMax > 1 && yMax <= 5) {
            yTickSpace = 0.25
            yFormat = d3.format('.2f')
        } else if (yMax > 5 && yMax <= 10) {
            yTickSpace = 1
            yFormat = d3.format('.0f')
        }
        yMax = Math.ceil(d3.max(mixedData.map((d) => d.hc)) / yTickSpace) * yTickSpace
        const yTicks = [...(_.range(0, yMax, yTickSpace)), yMax]

        this.xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, layout.width])
        this.yScale = d3.scaleLinear().domain([yMin, yMax]).range([layout.height, 0])

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom))

        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        this.g.append('defs')
            .append('clipPath')
            .attr('id', 'clip-expulsionsummary')
            .append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)

        const linesG = this.g.append('g')

        this.vLines = linesG.selectAll('.expulsionsummary-vline')
            .data(xTicks.filter((t) => t !== xMin && t !== xMax))
            .enter()
            .append('path')
            .attr('class', 'expulsionsummary-vline')
            .attr('d', t => `M ${this.xScale(t)+0.5} 0.5 V ${layout.height}`)

        this.hLines = linesG.selectAll('.expulsionsummary-hline')
            .data(yTicks.filter((t) => t !== yMin && t !== yMax))
            .enter()
            .append('path')
            .attr('class', 'expulsionsummary-hline')
            .attr('d', t => `M 0.5 ${this.yScale(t)+0.5} H ${layout.width}`)

        const borderG = this.g.append('g')
        borderG.append('path').attr('class', 'expulsionsummary-border').attr('d', `M ${layout.width+0.5} 0.5 V ${layout.height+0.5}`)
        borderG.append('path').attr('class', 'expulsionsummary-border').attr('d', `M 0.5 0.5 H ${layout.width+0.5}`)

        this.xAxis = d3.axisBottom()
            .scale(this.xScale)
        this.xAxisEl = this.g.append('g')
            .attr('class', 'expulsionsummary-axis expulsionsummary-axis-x')
            .attr('transform', 'translate(0,' + layout.height + ')')
            .call(this.xAxis.tickValues(xTicks).tickSizeInner(3).tickSizeOuter(0))
        this.xAxisEl.append('text')
            .attr('class', 'expulsionsummary-axis-label')
            .attr('x', layout.width / 2)
            .attr('y', 30)
            .text(this.axisLabels.xAxis)

        this.yAxis = d3.axisLeft()
            .scale(this.yScale)
        this.yAxisEl = this.g.append('g')
            .attr('class', 'expulsionsummary-axis expulsionsummary-axis-y')
            .call(this.yAxis.tickValues(yTicks).tickSizeInner(3).tickSizeOuter(0).tickFormat(yFormat))
        this.yAxisEl.append('text')
            .attr('class', 'expulsionsummary-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -42)
            .attr('x', -layout.height / 2)
            .attr('dy', '1em')
            .text(this.axisLabels.yAxis)

        const areaG = this.g.append('g')
            .attr('clip-path', 'url(#clip-expulsionsummary)')

        this.oilArea = d3.area()
            .x((d) => this.xScale(d.tb))
            .y0((d) => this.yScale(yMin))
            .y1((d) => this.yScale(d.oil))
        this.oilPath = areaG.append('path')
            .datum(mixedData)
            .attr('class', 'area-oil')
            .attr('d', this.oilArea)
        this.gasArea = d3.area()
            .x((d) => this.xScale(d.tb))
            .y0((d) => this.yScale(d.oil))
            .y1((d) => this.yScale(d.hc))
        this.gasPath = areaG.append('path')
            .datum(mixedData)
            .attr('class', 'area-gas')
            .attr('d', this.gasArea)
    }

    render() {
        const { formationSelected } = this.props.data
        return (
            <BaseGraph
                title={'Expulsion Summary' + (formationSelected ? ' - ' + formationSelected.layerName : '')}
                className="expulsionsummary-graph"
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default ExpulsionSummaryGraph

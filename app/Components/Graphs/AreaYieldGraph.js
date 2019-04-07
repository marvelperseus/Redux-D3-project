import React, { Component } from 'react'
import * as d3 from 'd3'
import * as _ from 'lodash'

import BaseGraph from './BaseGraph'
import { setupFullWidthCroppingZoom } from '../../utils/utils'

class AreaYieldGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {
        const { layout, group } = this.props
        const { formations, layoutSummary, formationSelected, mode } = this.props.data

        let data
        if (mode === 'depth') {
            formations.forEach((d, i) => {
                formations[i].top = d.topDepth
                formations[i].bottom = d.bottomDepth
            })
            data = this.props.data.data.depth_mode
        } else {
            formations.forEach((d, i) => {
                formations[i].top = d.age
                formations[i].bottom = d.initAge
            })
            data = this.props.data.data.time_mode
        }

        const ageMin = d3.min(formations.map((f) => f.age))
        const ageMax = d3.max(formations.map((f) => f.initAge))
        const depthMin = d3.min(formations.map((f) => f.topDepth))
        const depthMax = d3.max(formations.map((f) => f.bottomDepth))
        const ageTickSpace = 5
        const depthTickSpace = 50
        const ageTicks = _.range(Math.ceil(ageMin / ageTickSpace) * ageTickSpace, Math.floor(ageMax / ageTickSpace) * ageTickSpace + ageTickSpace, ageTickSpace)
        const depthTicks = _.range(Math.ceil(depthMin / depthTickSpace) * depthTickSpace, Math.floor(depthMax / depthTickSpace) * depthTickSpace + depthTickSpace, depthTickSpace)

        this.formationLimits = []
        formations.forEach((d) => {
            this.formationLimits.push(d.top)
            this.formationLimits.push(d.bottom)
        })
        this.formationLimits = _.uniq(this.formationLimits).sort((d1, d2) => d1 - d2)

        const xMin = 0
        let xMax = Math.floor(d3.max(data.ueo_tb) + d3.max(data.ueg_tb))
        xMax = xMax + (xMax < 5 ? 1 : Math.floor(xMax * 0.2))
        const dx = xMax >=5 ? 2 : (xMax < 1 ? 0.1 : 0.5)
        const xTicks = _.range(xMin, xMax, dx)
        if (xTicks[xTicks.length - 1] !== xMax) {
            xTicks.push(xMax)
        }
 
        this.boxData = data.zmin.map((zmin, i) => ({
            zmin : zmin,
            th   : data.sample_thickness[i],
            ueo  : data.ueo_tb[i],
            ueg  : data.ueg_tb[i]
        }))

        this.xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, layout.width])
        this.yScale = d3.scaleLinear().domain(d3.extent(this.formationLimits)).range([0, layout.height])

        this.xFormatter = d3.format('.1f')

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom))

        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        this.g.append('defs')
            .append('clipPath')
            .attr('id', 'clip-areayield')
            .append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)

        this.xAxis = d3.axisBottom()
            .scale(this.xScale)
        this.xAxisEl = this.g.append('g')
            .attr('class', 'areayield-axis areayield-axis-x')
            .attr('transform', 'translate(0,' + layout.height + ')')
            .call(this.xAxis.tickValues(xTicks).tickSize(-layout.height).tickSizeOuter(0).tickPadding(6).tickFormat(this.xFormatter))

        this.yAxis = d3.axisLeft()
            .scale(this.yScale)
        this.yAxisEl = this.g.append('g')
            .attr('class', 'areayield-axis areayield-axis-y')
            .call(this.yAxis.tickValues(mode === 'depth' ? depthTicks : ageTicks).tickSize(-layout.width).tickSizeOuter(0).tickFormat(''))
        
        const boxesG = this.g.append('g').attr('clip-path', 'url(#clip-areayield)')

        this.formationLines = boxesG
            .selectAll('.areayield-formation-line')
            .data(this.formationLimits)
            .enter()
            .append('path')
            .attr('class', 'areayield-formation-line')
            .attr('d', (d) => `M 0.5 ${parseInt(this.yScale(d))+0.5} H ${layout.width+0.5}`)

        this.oilBoxes = boxesG
            .selectAll('.areayield-box-oil')
            .data(this.boxData)
            .enter()
            .append('rect')
            .attr('class', (d) => formationSelected ? (d.zmin >= formationSelected.top && d.zmin + d.th <= formationSelected.bottom ? 'areayield-box-oil' : 'areayield-box-oil areayield-box-opacity') : 'areayield-box-oil')
            .attr('x', 0)
            .attr('y', (d) => this.yScale(d.zmin))
            .attr('width', (d) => this.xScale(d.ueo))
            .attr('height', (d) => this.yScale(d.zmin + d.th) - this.yScale(d.zmin))
        
        this.gasBoxes = boxesG
            .selectAll('.areayield-box-gas')
            .data(this.boxData)
            .enter()
            .append('rect')
            .attr('class', (d) => formationSelected ? (d.zmin >= formationSelected.top && d.zmin + d.th <= formationSelected.bottom ? 'areayield-box-gas' : 'areayield-box-gas areayield-box-opacity') : 'areayield-box-gas')
            .attr('x', (d) => this.xScale(d.ueo))
            .attr('y', (d) => this.yScale(d.zmin))
            .attr('width', (d) => this.xScale(d.ueg + d.ueo) - this.xScale(d.ueo))
            .attr('height', (d) => this.yScale(d.zmin + d.th) - this.yScale(d.zmin))
        
        const borderG = this.g.append('g')
        borderG.append('path').attr('class', 'areayield-border').attr('d', `M 0.5 0.5 V ${layout.height+0.5}`)
        borderG.append('path').attr('class', 'areayield-border').attr('d', `M ${layout.width+0.5} 0.5 V ${layout.height+0.5}`)
        borderG.append('path').attr('class', 'areayield-border').attr('d', `M 0.5 0.5 H ${layout.width+0.5}`)
        borderG.append('path').attr('class', 'areayield-border').attr('d', `M 0.5 ${layout.height+0.5} H ${layout.width+0.5}`)

        this.g.append('text')
            .attr('x', layout.width / 2)
            .attr('y', layout.height + 25)
            .attr('text-anchor', 'middle')
            .text('Areal yield expelled')
            .attr('font-size', 10)
        this.g.append('text')
            .attr('x', layout.width / 2)
            .attr('y', layout.height + 36)
            .attr('text-anchor', 'middle')
            .text('(mmboe/km2 per sample interval)')
            .attr('font-size', 10)

        setupFullWidthCroppingZoom(this.svg, this.g, layout, this.props.zoom.bind(this), this.props.zoomClear.bind(this), this.props.crop, 'areayield')

        const legendG = this.svg.append('g')
            .attr('transform', `translate(${layout.left}, ${layout.top + layout.height})`)
        const legendBoxWidth = layout.width + layout.right + layoutSummary.left + layoutSummary.width
        const legendBoxHeight = 23
        const legendBoxTop = 47
        legendG.append('rect')
            .attr('class', 'areayield-legend-box')
            .attr('x', 0)
            .attr('y', legendBoxTop)
            .attr('width', legendBoxWidth)
            .attr('height', legendBoxHeight)
        legendG.append('rect')
            .attr('class', 'areayield-legend-oil-rect')
            .attr('x', legendBoxWidth / 2 - 50)
            .attr('y', legendBoxTop + legendBoxHeight / 2 - 5)
            .attr('width', 10)
            .attr('height', 10)
        legendG.append('text')
            .attr('class', 'areayield-legend-oil-label')
            .attr('x', legendBoxWidth / 2 - 25)
            .attr('y', legendBoxTop + legendBoxHeight / 2 + 4)
            .text('Oil')
        legendG.append('rect')
            .attr('class', 'areayield-legend-gas-rect')
            .attr('x', legendBoxWidth / 2)
            .attr('y', legendBoxTop + legendBoxHeight / 2 - 5)
            .attr('width', 10)
            .attr('height', 10)
        legendG.append('text')
            .attr('class', 'areayield-legend-gas-label')
            .attr('x', legendBoxWidth / 2 + 30)
            .attr('y', legendBoxTop + legendBoxHeight / 2 + 4)
            .text('Gas')
    }

    zoomGraph() {
        const { layout, zoomFactors } = this.props

        let transformY = d3.zoomIdentity

        for (let i = 0; i < zoomFactors.length; i++) {
            const factors = zoomFactors[i]

            transformY = transformY
                .translate(0, layout.height / 2)
                .scale(factors.scaleY)
                .translate(0, factors.y)
        }

        const newYScale = transformY.rescaleY(this.yScale)

        this.formationLines.attr('d', (d) => `M 0 ${parseInt(newYScale(d))} H ${layout.width}`)

        this.yAxisEl.call(this.yAxis.scale(newYScale))

        this.oilBoxes.attr('y', (d) => newYScale(d.zmin))
            .attr('height', (d) => newYScale(d.zmin + d.th) - newYScale(d.zmin))
        
        this.gasBoxes.attr('y', (d) => newYScale(d.zmin))
            .attr('height', (d) => newYScale(d.zmin + d.th) - newYScale(d.zmin))
    }

    render() {
        return (
            <BaseGraph
                title="Areal Yield Expelled"
                className="areayield-graph"
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                zoomGraph={this.zoomGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default AreaYieldGraph

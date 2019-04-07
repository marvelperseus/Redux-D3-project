import React, { Component } from 'react'
import * as d3 from 'd3'
import * as _ from 'lodash'

import BaseGraph from './BaseGraph'
import { setupFullWidthCroppingZoom } from '../../utils/utils'

const POINT_SIZE_BIG = 3
const POINT_SIZE_SMALL = 2

class TocHIGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {
        const { layout, } = this.props
        const { dataInDepth, dataInAge, formations, formationSelected, mode } = this.props.data

        let data
        if (mode === 'depth') {
            formations.forEach((d, i) => {
                formations[i].top = d.topDepth
                formations[i].bottom = d.bottomDepth
            })
            data = dataInDepth
        } else {
            formations.forEach((d, i) => {
                formations[i].top = d.age
                formations[i].bottom = d.initAge
            })
            data = dataInAge
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

        const xMin = 0.1
        const xMax = 1000
        const xTicks = [0.1, 1, 10, 100, 1000]
        const xFormatter = d3.format('.1f')

        this.dxToc = data.index.map((de, i) => ({x: data.tocX[i], index: de})).sort((d1, d2) => (d1.x - d2.x))
        this.dx0Toc = data.index.map((de, i) => ({x: data.tocX0[i], index: de})).sort((d1, d2) => (d1.x - d2.x))
        this.xSameToc = JSON.stringify(this.dxToc) === JSON.stringify(this.dx0Toc)

        this.dxHi = data.index.map((de, i) => ({x: data.hiX[i], index: de})).sort((d1, d2) => (d1.x - d2.x))
        this.dx0Hi = data.index.map((de, i) => ({x: data.hiX0[i], index: de})).sort((d1, d2) => (d1.x - d2.x))
        this.xSameHi = JSON.stringify(this.dxHi) === JSON.stringify(this.dx0Hi)
        
        this.xScale = d3.scaleLog().domain([xMin, xMax]).range([0, layout.width])
        this.yScale = d3.scaleLinear().domain(d3.extent(this.formationLimits)).range([0, layout.height])

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom))

        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        this.g.append('defs')
            .append('clipPath')
            .attr('id', 'clip-tochi')
            .append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)

        this.xAxis = d3.axisBottom()
            .scale(this.xScale)
        this.xAxisEl = this.g.append('g')
            .attr('class', 'tochi-axis tochi-axis-x')
            .attr('transform', 'translate(0,' + layout.height + ')')
            .call(this.xAxis.tickValues(xTicks).tickSize(3).tickSizeOuter(0).tickFormat(xFormatter))

        this.yAxis = d3.axisLeft()
            .scale(this.yScale)
        this.yAxisEl = this.g.append('g')
            .attr('class', 'tochi-axis tochi-axis-y')
            .call(this.yAxis.tickValues(mode === 'depth' ? depthTicks : ageTicks).tickSize(-layout.width).tickSizeOuter(0).tickFormat(''))
        
        const linesG = this.g.append('g').attr('clip-path', 'url(#clip-tochi)')

        const vLineValues = [...(_.range(0.2, 1.1, 0.1)), ...(_.range(2, 11, 1)), ...(_.range(20, 101, 10)), ...(_.range(200, 1001, 100))]
        this.vLines = linesG
            .selectAll('.tochi-vline')
            .data(vLineValues)
            .enter()
            .append('path')
            .attr('class', 'tochi-vline')
            .attr('d', (d) => `M ${this.xScale(d)+0.5} 0.5 V ${layout.height+0.5}`)

        this.formationLines = linesG
            .selectAll('.tochi-formation-line')
            .data(this.formationLimits)
            .enter()
            .append('path')
            .attr('class', 'tochi-formation-line')
            .attr('d', (d) => `M 0.5 ${this.yScale(d)+0.5} H ${layout.width+0.5}`)

        this.tocXPoints = linesG.selectAll('.toc-x-point')
            .data(this.dxToc)
            .enter()
            .append('path')
            .attr('class', (d) => formationSelected ? (d.index >= formationSelected.top && d.index <= formationSelected.bottom ? 'toc-x-point' : 'toc-x-point point-opacity') : 'toc-x-point')
            .attr('d', (d) => this.getDiamondPath(this.xScale(d.x), this.yScale(d.index), this.xSame ? POINT_SIZE_BIG : POINT_SIZE_SMALL))

        if (!this.xSameToc) {
            this.tocX0Points = linesG.selectAll('.toc-x0-point')
                .data(this.dx0Toc)
                .enter()
                .append('path')
                .attr('class', (d) => formationSelected ? (d.index >= formationSelected.top && d.index <= formationSelected.bottom ? 'toc-x0-point' : 'toc-x0-point point-opacity') : 'toc-x0-point')
                .attr('d', (d) => this.getDiamondPath(this.xScale(d.x), this.yScale(d.index), POINT_SIZE_BIG))
        }

        this.hiXPoints = linesG.selectAll('.hi-x-point')
            .data(this.dxHi)
            .enter()
            .append('path')
            .attr('class', (d) => formationSelected ? (d.index >= formationSelected.top && d.index <= formationSelected.bottom ? 'hi-x-point' : 'hi-x-point point-opacity') : 'hi-x-point')
            .attr('d', (d) => this.getDiamondPath(this.xScale(d.x), this.yScale(d.index), this.xSame ? POINT_SIZE_BIG : POINT_SIZE_SMALL))

        if (!this.xSameHi) {
            this.hiX0Points = linesG.selectAll('.hi-x0-point')
                .data(this.dx0Hi)
                .enter()
                .append('path')
                .attr('class', (d) => formationSelected ? (d.index >= formationSelected.top && d.index <= formationSelected.bottom ? 'hi-x0-point' : 'hi-x0-point point-opacity') : 'hi-x0-point')
                .attr('d', (d) => this.getDiamondPath(this.xScale(d.x), this.yScale(d.index), POINT_SIZE_BIG))
        }

        const borderG = this.g.append('g')
        borderG.append('path').attr('class', 'tochi-border').attr('d', `M 0.5 0.5 V ${layout.height+0.5}`)
        borderG.append('path').attr('class', 'tochi-border').attr('d', `M ${layout.width+0.5} 0.5 V ${layout.height+0.5}`)
        borderG.append('path').attr('class', 'tochi-border').attr('d', `M 0.5 0.5 H ${layout.width+0.5}`)
        borderG.append('path').attr('class', 'tochi-border').attr('d', `M 0.5 ${layout.height+0.5} H ${layout.width+0.5}`)

        setupFullWidthCroppingZoom(this.svg, this.g, layout, this.props.zoom.bind(this), this.props.zoomClear.bind(this), this.props.crop, 'tochi')

        const legendG = this.svg.append('g')
            .attr('transform', `translate(${layout.left}, ${layout.top + layout.height})`)
        legendG.append('rect')
            .attr('class', 'tochi-legend-box')
            .attr('x', 0)
            .attr('y', 30)
            .attr('width', layout.width)
            .attr('height', 40)

        if (this.xSameToc) {
            legendG.append('path')
                .attr('class', 'tochi-legend-point-toc')
                .attr('d', this.getDiamondPath(15, 50, POINT_SIZE_BIG * 2))
            legendG.append('text')
                .attr('x', 27)
                .attr('y', 48)
                .text('Measured TOC (wpc)')
                .attr('font-size', 12)
            legendG.append('text')
                .attr('x', 26)
                .attr('y', 63)
                .text('immature sample')
                .attr('font-size', 10)
        } else {
            legendG.append('path')
                .attr('class', 'tochi-legend-point-toc')
                .attr('d', this.getDiamondPath(15, 41, POINT_SIZE_SMALL))
            legendG.append('text')
                .attr('x', 26)
                .attr('y', 46)
                .text('Measured TOC (wpc)')
                .attr('font-size', 10)
            legendG.append('path').attr('d', this.getDiamondPath(15, 59, POINT_SIZE_BIG))
            legendG.append('text')
                .attr('x', 27)
                .attr('y', 64)
                .text('TOC at deposition')
                .attr('font-size', 10)
        }

        if (this.xSameHi) {
            legendG.append('path')
                .attr('class', 'tochi-legend-point-hi')
                .attr('d', this.getDiamondPath(layout.width / 2 + 15, 50, POINT_SIZE_BIG * 2))
            legendG.append('text')
                .attr('x', layout.width / 2 + 27)
                .attr('y', 48)
                .text('Measured HI (wpc)')
                .attr('font-size', 12)
            legendG.append('text')
                .attr('x', layout.width / 2 + 26)
                .attr('y', 63)
                .text('immature sample')
                .attr('font-size', 10)
        } else {
            legendG.append('path')
                .attr('class', 'tochi-legend-point-hi')
                .attr('d', this.getDiamondPath(layout.width / 2 + 15, 41, POINT_SIZE_SMALL))
            legendG.append('text')
                .attr('x', layout.width / 2 + 26)
                .attr('y', 46)
                .text('Measured HI (wpc)')
                .attr('font-size', 10)
            legendG.append('path').attr('d', this.getDiamondPath(layout.width / 2 + 15, 59, POINT_SIZE_BIG))
            legendG.append('text')
                .attr('x', layout.width / 2 + 27)
                .attr('y', 64)
                .text('HI at deposition')
                .attr('font-size', 10)
        }
    }

    getDiamondPath(cx, cy, r) {
        return `M ${cx-r} ${cy} ${cx} ${cy+r} ${cx+r} ${cy} ${cx} ${cy-r} Z`
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

        this.yAxisEl.call(this.yAxis.scale(newYScale))

        this.formationLines.attr('d', (d) => `M 0.5 ${newYScale(d)+0.5} H ${layout.width+0.5}`)

        this.tocXPoints.attr('d', (d) => this.getDiamondPath(this.xScale(d.x), newYScale(d.index), this.xSame ? POINT_SIZE_BIG : POINT_SIZE_SMALL))
        if (!this.xSameToc) {
            this.tocX0Points.attr('d', (d) => this.getDiamondPath(this.xScale(d.x), newYScale(d.index), POINT_SIZE_BIG))
        }

        this.hiXPoints.attr('d', (d) => this.getDiamondPath(this.xScale(d.x), newYScale(d.index), this.xSame ? POINT_SIZE_BIG : POINT_SIZE_SMALL))
        if (!this.xSameHi) {
            this.hiX0Points.attr('d', (d) => this.getDiamondPath(this.xScale(d.x), newYScale(d.index), POINT_SIZE_BIG))
        }
    }

    render() {
        return (
            <BaseGraph
                title="TOC, Hydrogen Index"
                className="tochi-graph"
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                zoomGraph={this.zoomGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default TocHIGraph

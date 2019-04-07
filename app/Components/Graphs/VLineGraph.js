import React, { Component } from 'react'
import * as d3 from 'd3'

import BaseGraph from './BaseGraph'
import { setupCroppingZoom, getEpochColor } from '../../utils/utils'

class VLineGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {
        this.data = this.props.data.burialDepths.map( (row, idx) => {
            return {
                'yval' : row,
                'xval' : +this.props.data.values[idx]
            }
        })
        this.depths = [...(this.props.data.stratData.map(d => d.bottom)), ...(this.props.data.stratData.map(d => d.top))]
        this.yDomain = [d3.min(this.depths), d3.max(this.depths)]
        this.yThresholds = [...new Set(this.props.data.stratData.reduce((arr, block) => [...arr, block.top, block.bottom], []))]
        this.axisConfig = this.props.data.axisConfig

        
        const { layout, xScaleType } = this.props

        const xMax = d3.max(this.data, (d) => d.xval)
        const xMin = d3.min(this.data, (d) => d.xval)

        this.xFormatter = (d) => (d % 1 !== 0) ? d3.format('.1f')(d) : d3.format('.0f')(d)
        this.yFormatter = (d) => (d % 1 !== 0) ? d3.format('.2f')(d) : d3.format('.0f')(d)

        this.xScale = xScaleType === 'log' ? d3.scaleLog() : d3.scaleLinear()
        this.xScale.range([0, layout.width])
            .domain([xMin, xMax])

        this.yScale = d3.scaleLinear()
            .range([layout.height, 0])
            .domain([this.yDomain[1], this.yDomain[0]])

        this.xValue = (e) => this.xScale(e.xval)
        this.yValue = (e) => this.yScale(e.yval)

        this.xAxis = d3.axisBottom()
            .scale(this.xScale)
            .tickFormat(this.xFormatter)
    
        this.yAxis = d3.axisLeft()
            .scale(this.yScale)

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('class', 'vertical-line-svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom))

        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        this.g.append('defs').append('clipPath')
            .attr('id', 'clip-verticalline')
            .append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)

        this.g.append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)
            .attr('fill', '#FAFAFA')

        this.xAxisEl = this.g.append('g')
             .attr('class', 'axis axis--x')
             .attr('transform', 'translate(0,' + layout.height + ')')
             .call(this.xAxis.ticks(5).tickSize(3).tickSizeOuter(0))
 
        this.xAxisEl.append('text')          
             .attr('y',  layout.bottom - 20)
             .attr('x',  layout.width/2)        
             .style('text-anchor', 'middle')
             .attr('fill', '#5D6971')
             .style('font-size', '10px')
             .text(this.axisConfig.xLabel)
 
        this.yAxisEl = this.g.append('g')
             .attr('class', 'axis axis--y')
             .call(this.yAxis.tickValues(this.visibleYAxisThresholds(this.yScale)).tickSize(3).tickSizeOuter(0).tickFormat(''))

        this.g.append('g')
          .attr('class', 'axis axis--x')
          .call(d3.axisBottom(this.xScale).ticks(0).tickSizeOuter(0))

        this.g.append('g')
          .attr('class', 'axis axis--y')
          .attr('transform', 'translate(' + layout.width + ', 0)')
          .call(d3.axisRight(this.yScale).ticks(0).tickSizeOuter(0))

        this.vlines = this.g.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,' + layout.height + ')')
            .style('color', '#CCC')
            .style('stroke-width', '0.5px')
            .call(this.vGridLine(this.xScale))

        this.hlines = this.g.append('g')
            .attr('class', 'grid')
            .style('color', '#777')
            .style('stroke-width', '0.5px')
            .call(this.hGridLine(this.yScale))

        const parentGroupContainer = this.g.append('g').attr('clip-path', 'url(#clip-verticalline)')

        var parentGroup = parentGroupContainer.append('g')

        parentGroup.append('rect')
            .attr('class', 'overlay')
            .attr('width', layout.width)
            .attr('height', layout.height)
      
        const line = d3.line()
            .x(this.xValue)
            .y(this.yValue)
            .curve(d3.curveLinear)

        this.lines = parentGroup.append('path')
            .data([this.data])

        this.lines
            .attr('class', 'line')
            .attr('d', line)

        const radius = 2.5
        this.points = parentGroup.selectAll('circle')
            .data(this.data)
            .enter()
            .append('circle')

        this.points
            .attr('fill', 'black')
            .attr('r', radius)
            .attr('cx', this.xValue)
            .attr('cy', this.yValue)

        setupCroppingZoom(this.svg, this.g, layout, this.props.zoom.bind(this), this.props.zoomClear.bind(this), this.props.crop, this.props.className === 'temperature-graph' ? 'temperature' : 'maturity')
    }

    zoomGraph() {
        const { layout, zoomFactors } = this.props

        let transformX = d3.zoomIdentity
        let transformY = d3.zoomIdentity

        for (let i=0; i<zoomFactors.length; i++) {
            const factors = zoomFactors[i]

            transformX = transformX
                .translate(layout.width/2, 0)
                .scale(factors.scaleX)
                .translate(factors.x, 0)

            transformY = transformY
                .translate(0, layout.height/2)
                .scale(factors.scaleY)
                .translate(0, factors.y)
        }

        const newYScale = transformY.rescaleY(this.yScale)

        this.yAxisEl.call(this.yAxis.scale(newYScale).tickValues(this.visibleYAxisThresholds(newYScale)))

        this.hlines.call(this.hGridLine(newYScale))

        this.points
            .attr('cy', (d) => newYScale(d.yval))

        const line = d3.line()
          .x((d) => this.xScale(d.xval))
          .y((d) => newYScale(d.yval))
          .curve(d3.curveLinear)

        this.lines.attr('d', line)
    }   

    visibleYAxisThresholds(scale) {
        const domain = scale.domain()

        return this.yThresholds.filter((val) => {
            return val <= domain[0] && val >= domain[1]
        })
    }

    hGridLine(scale) {
        const { layout } = this.props
        return d3.axisLeft(scale)
            .tickValues(this.visibleYAxisThresholds(scale))
            .tickSize(-layout.width)
            .tickFormat('')
    }

    vGridLine(scale) {
        const { layout } = this.props
        return d3.axisBottom(scale).ticks(5)
            .tickSize(-layout.height)
            .tickFormat('')
    }

    render() {
        return (
            <BaseGraph
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                zoomGraph={this.zoomGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default VLineGraph
import React, { Component } from 'react'
import * as d3 from 'd3'

import BaseGraph from './BaseGraph'
import { getLithoData } from '../../utils/datatransformer'
import { setupFullWidthCroppingZoom } from '../../utils/utils'

class LithoGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {
        this.legendHeight = 80
        this.xLabel = '%'

        const { layout, data } = this.props

        this.data = data[0]
        this.legends = data[3]
        this.depths = [...(data[0].map(d => d.lowerLeftCoord[1])), ...(data[0].map(d => d.lowerLeftCoord[1] - d.height))]
        this.extents = {
            xExtent : [0, 100],
            yExtent : [d3.min(this.depths), d3.max(this.depths)]
        }

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('class', 'vertical-line-svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom) + this.legendHeight)

        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        this.g.append('defs').append('clipPath')
            .attr('id', 'clip-lithology')
            .append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)

        this.xScale = d3.scaleLinear().domain(this.extents.xExtent).range([0, layout.width])
        this.yScale = d3.scaleLinear().domain(this.extents.yExtent).range([0, layout.height])

        this.boxRealm = this.g.append('g')
            .attr('clip-path', 'url(#clip-lithology)')
            .selectAll('.element')
            .data(this.data)
            .enter()
            .append('rect')

        this.boxRealm
            .attr('class', 'element')
            .attr('x', d => this.xScale(d.lowerLeftCoord[0]))
            .attr('y', d => this.yScale(d.lowerLeftCoord[1] - d.height))
            .attr('width', d => this.xScale(d.width))
            .attr('height', d => this.yScale(d.lowerLeftCoord[1]) - this.yScale(d.lowerLeftCoord[1] - d.height))
            .style('stroke', '#777')
            .style('stroke-width', '0.5px')
            .style('fill', d => d.color)

        const legendHeight = Math.floor(this.legendHeight / this.legends.length)
        const legendWrapper = this.svg.append('g')

        legendWrapper
            .attr('class', 'legends-g')
            .attr('transform', `translate(${layout.left}, ${layout.top + this.yScale(this.extents.yExtent[1]) + layout.bottom - 1})`)

        legendWrapper.append('rect')
            .attr('width', layout.width)
            .attr('height', this.legendHeight)
            .attr('fill', 'none')
            .attr('stroke', '#808080')
            .attr('stroke-width', '1')
            .attr('rx', '1')
            .attr('ry', '1')

        var legend = legendWrapper.selectAll('.legend')
            .data(this.legends)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => {
                var vert = i * legendHeight
                return 'translate(0,' + vert + ')'
            })

        legend.append('rect')
            .attr('x', 4)
            .attr('y', legendHeight / 2 - 4)
            .attr('width', 16)
            .attr('height', 8)
            .attr('fill', d => d[1])
            .attr('stroke', '#000000')
            .attr('stroke-width', '1')
          
        legend.append('text')
            .attr('font-size', 10)
            .attr('x', 24)
            .attr('y', 14)
            .text(d => d[0])

        const xAxis = d3.axisBottom().scale(this.xScale).ticks(5).tickSize(3)
        const xAxisEl = this.g.append('g')
            .attr('transform', `translate(0, ${this.yScale(this.extents.yExtent[1])})`)
            .call(xAxis)
        xAxisEl.append('text')        
            .attr('y',  layout.bottom - 20)
            .attr('x',  layout.width/2)
            .style('text-anchor', 'middle')
            .attr('fill', '#5D6971')
            .style('font-size', '10px')
            .text(this.xLabel)

        setupFullWidthCroppingZoom(this.svg, this.g, layout, this.props.zoom.bind(this), this.props.zoomClear.bind(this), this.props.crop, 'litho')

        this.g.append('path')
            .attr('d', `M 0.5 0.5 H ${layout.width}`)
            .attr('stroke', '#000000')
        this.g.append('path')
            .attr('d', `M 0.5 0.5 V ${layout.height}`)
            .attr('stroke', '#000000')
        this.g.append('path')
            .attr('d', `M ${layout.width+0.5} 0.5 V ${layout.height}`)
            .attr('stroke', '#000000')
    }

    zoomGraph() {
        const { layout, zoomFactors } = this.props
        let transformY = d3.zoomIdentity

        for (let i = 0; i < zoomFactors.length; i++) {
            const factors = zoomFactors[i]

            transformY = transformY
                .translate(0, layout.height/2)
                .scale(factors.scaleY)
                .translate(0, factors.y)
        }

        const newYScale = transformY.rescaleY(this.yScale)

        this.boxRealm.attr('y', d => newYScale(d.lowerLeftCoord[1] - d.height))
        this.boxRealm.attr('height', d => newYScale(d.lowerLeftCoord[1]) - newYScale(d.lowerLeftCoord[1] - d.height))
    }

    render() {
        return ( 
            <BaseGraph
                title="Lithology"
                className="litho-graph"
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                zoomGraph={this.zoomGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default LithoGraph

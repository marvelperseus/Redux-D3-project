import React, { Component } from 'react'
import * as d3 from 'd3'

import BaseGraph from './BaseGraph'
import { isObjectEmpty } from '../../utils/datatransformer'
import { setupFullWidthCroppingZoom, fixOverlappingLabels } from '../../utils/utils'

class MevAxisGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {        
        const { group, layout } = this.props
        const { mode, unit, yTickUnit, yMin, yMax, formdata } = this.props.data
        this.depths = []
        formdata.forEach((d) => {
            this.depths.push(d)
        })
        this.depths =  _.uniq(this.depths).sort((a1, a2) => a1 - a2)
        var depthTicks = _.range(yMin, yMax + yTickUnit, yTickUnit) 
        if (mode === 'standard') {
            this.depthScale = d3.scaleLinear().domain([Math.floor(yMin / yTickUnit) * yTickUnit, Math.ceil(yMax / yTickUnit) * yTickUnit]).range([0, layout.height])            
        } else {
            this.Scales = d3.scaleLinear().domain(d3.extent(this.depths)).range([0, layout.height])
            this.depthScale = d3.scaleQuantile().domain(this.depths).range(this.depths.map((d) => this.Scales(d)))
        }
        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('width', layout.width)
            .attr('height', layout.height + (layout.top + 30))

        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        const defs = this.g.append('defs')
        defs.append('clipPath')
            .attr('id', 'clip-mevaxis')
            .attr('x', -layout.left)
            .attr('y', layout.top)
            .attr('width', layout.width)
            .attr('height', layout.height + 10)
        if (mode === 'standard') {
            this.depthAxis = d3.axisLeft().scale(this.depthScale).tickSize(3).tickSizeOuter(0).tickFormat(d3.format('.0f')).tickValues(depthTicks)
        } else {
            this.depthAxis = d3.axisLeft().scale(this.depthScale).tickSize(3).tickSizeOuter(0).tickFormat(d3.format('.1f'))
        }
    
        this.depthAxisEl = this.g.append('g') 
            .attr('clip-path', 'url(#clip-uepaxis)')
            .attr('class', 'uepaxis-axis')
            .call(this.depthAxis)

        this.depthXAxisLabel = this.g.append('text')
            .attr('class', 'uepaxis-label')
            .attr('x', -15)
            .attr('y', layout.height + 20)
            .style('fill', 'black')
            .text(unit)

        setupFullWidthCroppingZoom(this.svg, this.g, layout, this.props.zoom.bind(this), this.props.zoomClear.bind(this), this.props.crop, 'mevaxis')
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
        let newDepthScale
        if (mode === 'standard') {
            newDepthScale = transformY.rescaleY(this.depthScale)
        } else {
            this.Scales = d3.scaleLinear().domain(d3.extent(this.depths)).range([0, layout.height])
            newDepthScale = d3.scaleQuantile().domain(this.depths).range(this.depths.map((d) => this.Scales(d)))
        }
        this.depthAxisEl.call(this.depthAxis.scale(newDepthScale))
        this.depthAxisEl.select('path').attr('d', `M0.5,0.5V${layout.height+0.5}`)
    }

    render() {
        return (
            <BaseGraph
                title={this.props.data.title}
                className="mevaxis-graph uepaxis-graph"
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                zoomGraph={this.zoomGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default MevAxisGraph

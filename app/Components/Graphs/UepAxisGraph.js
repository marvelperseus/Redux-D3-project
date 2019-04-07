import React, { Component } from 'react'
import * as d3 from 'd3'

import BaseGraph from './BaseGraph'
import { setupFullWidthCroppingZoom, fixOverlappingLabels } from '../../utils/utils'

class UepAxisGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {
        this.axisConfig = { y1: 'm', y2: 'Ma' }
        
        const { group, layout } = this.props
        const { formations, mode } = this.props.data

        this.ages = []
        this.depths = []
        formations.forEach((d) => {
            this.ages.push(d.age)
            this.ages.push(d.initAge)
            this.depths.push(d.topDepth)
            this.depths.push(d.bottomDepth)
        })
        this.ages = _.uniq(this.ages).sort((a1, a2) => a1 - a2)
        this.depths = _.uniq(this.depths).sort((d1, d2) => d1 - d2)
        const ageMin = d3.min(this.ages)
        const ageMax = d3.max(this.ages)
        const depthMin = d3.min(this.depths)
        const depthMax = d3.max(this.depths)
        const ageTickSpace = 5
        const depthTickSpace = 50
        const ageTicks = _.range(Math.ceil(ageMin / ageTickSpace) * ageTickSpace, Math.floor(ageMax / ageTickSpace) * ageTickSpace + ageTickSpace, ageTickSpace)
        const depthTicks = _.range(Math.ceil(depthMin / depthTickSpace) * depthTickSpace, Math.floor(depthMax / depthTickSpace) * depthTickSpace + depthTickSpace, depthTickSpace)
        
        if (mode === 'age') {
            this.ageScale = d3.scaleLinear().domain(d3.extent(this.ages)).range([0, layout.height])
            this.depthScale = d3.scaleQuantile().domain(this.depths).range(this.ages.map((d) => this.ageScale(d)))
        } else {
            this.depthScale = d3.scaleLinear().domain(d3.extent(this.depths)).range([0, layout.height])
            this.ageScale = d3.scaleQuantile().domain(this.ages).range(this.depths.map((d) => this.depthScale(d)))
        }

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom))

        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        const defs = this.g.append('defs')
        defs.append('clipPath')
            .attr('id', 'clip-uepaxis')
            .append('rect')
            .attr('x', -layout.left)
            .attr('y', -5)
            .attr('width', layout.left + layout.width + layout.right)
            .attr('height', layout.height + 10)

        if (mode === 'depth') {
            this.depthAxis = d3.axisLeft().scale(this.depthScale).tickSize(3).tickSizeOuter(0).tickFormat(d3.format('.0f')).tickValues(depthTicks)
        } else {
            this.depthAxis = d3.axisLeft().scale(this.depthScale).tickSize(3).tickSizeOuter(0).tickFormat(d3.format('.1f'))
        }        
        this.depthAxisEl = this.g.append('g') 
            .attr('clip-path', 'url(#clip-uepaxis)')
            .attr('class', 'uepaxis-axis' + (mode === 'depth' ? ' uepaxis-axis-bold' : ''))
            .call(this.depthAxis)

        if (mode === 'age') {
            this.ageAxis = d3.axisLeft().scale(this.ageScale).tickSize(3).tickSizeOuter(0).tickFormat(d3.format('.0f')).tickValues(ageTicks)
        } else {
            this.ageAxis = d3.axisLeft().scale(this.ageScale).tickSize(3).tickSizeOuter(0).tickFormat(d3.format('.1f'))
        }
        this.ageAxisEl = this.g.append('g')
            .attr('clip-path', 'url(#clip-uepaxis)')
            .attr('class', 'uepaxis-axis' + (mode === 'age' ? ' uepaxis-axis-bold' : ''))
            .attr('transform', 'translate(' + (layout.width) + ',' + 0 + ')')
            .call(this.ageAxis)

        this.depthAxisLabelCircle = this.g.append('circle')
            .attr('class', 'uepaxis-label-circle' + (mode === 'depth' ? ' uepaxis-label-circle-bold' : ''))
            .attr('cx', 0)
            .attr('cy', -15)
            .attr('r', 10)
        this.depthAxisLabelCircle.on('click', this.changeMode.bind(this, 'depth'))
        this.depthAxisLabel = this.g.append('text')
            .attr('class', 'uepaxis-label' + (mode === 'depth' ? ' uepaxis-label-bold' : ''))
            .attr('x', 0)
            .attr('y', -11)
            .text(this.axisConfig.y1)
        this.depthAxisLabel.on('click', this.changeMode.bind(this, 'depth'))
        
        this.ageAxisLabelCircle = this.g.append('circle')
            .attr('class', 'uepaxis-label-circle' + (mode === 'age' ? ' uepaxis-label-circle-bold' : ''))
            .attr('cx', layout.width)
            .attr('cy', -15)
            .attr('r', 10)
        this.ageAxisLabelCircle.on('click', this.changeMode.bind(this, 'age'))
        this.ageAxisLabel = this.g.append('text')
            .attr('class', 'uepaxis-label' + (mode === 'age' ? ' uepaxis-label-bold' : ''))
            .attr('x', layout.width)
            .attr('y', -11)
            .text(this.axisConfig.y2)
        this.ageAxisLabel.on('click', this.changeMode.bind(this, 'age'))

        setupFullWidthCroppingZoom(this.svg, this.g, layout, this.props.zoom.bind(this), this.props.zoomClear.bind(this), this.props.crop, 'uepaxis')

        fixOverlappingLabels(this.depthAxisEl.selectAll('.tick'), (n) => parseFloat(window.getComputedStyle(n).transform.split(', ')[5]), 8)
        fixOverlappingLabels(this.ageAxisEl.selectAll('.tick'), (n) => parseFloat(window.getComputedStyle(n).transform.split(', ')[5]), 8)
    }

    changeMode(mode) {
        this.props.uepSetMode(mode)
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
        let newAgeScale
        if (mode === 'age') {
            newAgeScale = transformY.rescaleY(this.ageScale)
            newDepthScale = d3.scaleQuantile().domain(this.depths).range(this.ages.map((d) => newAgeScale(d)))
        } else {
            newDepthScale = transformY.rescaleY(this.depthScale)
            newAgeScale = d3.scaleQuantile().domain(this.ages).range(this.depths.map((d) => newDepthScale(d)))
        }

        this.depthAxisEl.call(this.depthAxis.scale(newDepthScale))
        this.depthAxisEl.select('path').attr('d', `M0.5,0.5V${layout.height+0.5}`)

        this.ageAxisEl.call(this.ageAxis.scale(newAgeScale))
        this.ageAxisEl.select('path').attr('d', `M0.5,0.5V${layout.height+0.5}`)
        
        fixOverlappingLabels(this.depthAxisEl.selectAll('.tick'), (n) => parseFloat(window.getComputedStyle(n).transform.split(', ')[5]), 8)
        fixOverlappingLabels(this.ageAxisEl.selectAll('.tick'), (n) => parseFloat(window.getComputedStyle(n).transform.split(', ')[5]), 8)
    }

    render() {
        return (
            <BaseGraph
                title="&nbsp;"
                className="uepaxis-graph"
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                zoomGraph={this.zoomGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default UepAxisGraph

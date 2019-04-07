import React, { Component } from 'react'
import * as d3 from 'd3'

import BaseGraph from './BaseGraph'
import { setupFullWidthCroppingZoom } from '../../utils/utils'

const ORGANOFACIES_COLORMAP = {
    'A'  : '#012AD3',
    'B'  : '#830802',
    'C'  : '#108302',
    'DE' : '#6C6C6C',
    'F'  : '#898989'
}

class OrganofaciesGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {
        const { layout, group } = this.props
        const { data, formationSelected, mode } = this.props.data

        this.depths = []
        this.ages = []
        data.forEach((d) => {
            this.depths.push(d.topDepth)
            this.depths.push(d.bottomDepth)
            this.ages.push(d.age)
            this.ages.push(d.initAge)
        })
        this.depths = _.uniq(this.depths).sort((d1, d2) => d1 - d2)
        this.ages = _.uniq(this.ages).sort((a1, a2) => a1 - a2)

        if (mode === 'depth') {
            this.yScale = d3.scaleLinear().domain(d3.extent(this.depths)).range([0, layout.height])
            data.forEach((d, i) => {
                data[i].top = d.topDepth
                data[i].bottom = d.bottomDepth
            })
        } else {
            this.yScale = d3.scaleLinear().domain(d3.extent(this.ages)).range([0, layout.height])
            data.forEach((d, i) => {
                data[i].top = d.age
                data[i].bottom = d.initAge
            })
        }

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom))

        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        const defs = this.g.append('defs')
        defs.append('clipPath')
            .attr('id', 'clip-organofacies')
            .append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)

        const boxesG = this.g.append('g').attr('clip-path', 'url(#clip-organofacies)')
        this.boxes = boxesG
            .selectAll('.organofacies-box')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'organofacies-box')
            .attr('x',(d) => 0)
            .attr('y', (d) => { return this.yScale(d.top) })
            .attr('width', layout.width)
            .attr('height', (d) => { return this.yScale(d.bottom) - this.yScale(d.top) })
            .attr('fill', (d) => ORGANOFACIES_COLORMAP[d.organofacies])

        const labelsG = this.g.append('g').attr('clip-path', 'url(#clip-organofacies)')

        this.labels = labelsG.selectAll('.organofacies-label')
            .data(data)
            .enter().append('text')
            .attr('x', layout.width/2)
            .attr('y', (d) => (this.yScale(d.bottom) + this.yScale(d.top)) / 2)
            .attr('transform', 'translate(0, 2)')
            .attr('class', 'organofacies-label')
            .text((d) => d.organofacies)
            .attr('opacity', (d) => (this.yScale(d.bottom) - this.yScale(d.top)) > 15 ? 1 : 0)

        this.g.append('path').attr('class', 'organofacies-border').attr('d', `M 0.5 0.5 V ${layout.height - 0.5}`)
        this.g.append('path').attr('class', 'organofacies-border').attr('d', `M ${layout.width - 0.5} 0.5 V ${layout.height - 0.5}`)
        this.g.append('path').attr('class', 'organofacies-border').attr('d', `M 0.5 0.5 H ${layout.width - 0.5}`)
        this.g.append('path').attr('class', 'organofacies-border').attr('d', `M 0.5 ${layout.height - 0.5} H ${layout.width - 0.5}`)

        setupFullWidthCroppingZoom(this.svg, this.g, layout, this.props.zoom.bind(this), this.props.zoomClear.bind(this), this.props.crop, 'organo')

        if (group === 'uep' && formationSelected) {
            this.boxes.style('fill', (d) => d.layerName === formationSelected.layerName ? ORGANOFACIES_COLORMAP[d.organofacies] : '#F0F0F0')
            this.labels.style('fill', (d) => d.layerName === formationSelected.layerName ? '#F0F0F0' : '#000000')
        }
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

        this.boxes.attr('y', d => newYScale(d.top))
        this.boxes.attr('height', d => newYScale(d.bottom) - newYScale(d.top))

        let topIndex = -1
        let bottomIndex = -1
        let onlyIndex = -1
        this.boxes.each((d, i) => {
            if (newYScale(d.top) < 0 && newYScale(d.bottom) >= 0) {
                topIndex = i
            }
            if (newYScale(d.top) < layout.height && newYScale(d.bottom) >= layout.height) {
                bottomIndex = i
            }
            if (newYScale(d.top) < 0 && newYScale(d.bottom) > layout.height) {
                onlyIndex = i
            }
        })

        this.labels.attr('y', (d, i) => {
            if (i === onlyIndex) {
                return layout.height / 2
            } else if (i === topIndex) {
                return newYScale(d.bottom) / 2
            } else if (i === bottomIndex) {
                return newYScale(d.top) + (layout.height - newYScale(d.top)) / 2
            } else {
                return (newYScale(d.bottom) + newYScale(d.top)) / 2
            }
        })

        this.labels.attr('opacity', (d) => _.min([newYScale(d.bottom), layout.height]) - _.max([newYScale(d.top), 0]) > 15 ? 1 : 0)
    }

    render() {
        return (
            <BaseGraph
                title="Organofacies"
                className="organofacies-graph"
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                zoomGraph={this.zoomGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default OrganofaciesGraph

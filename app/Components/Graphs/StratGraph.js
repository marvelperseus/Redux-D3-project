import React, { Component } from 'react'
import * as d3 from 'd3'

import BaseGraph from './BaseGraph'
import { setupFullWidthCroppingZoom, getEpochColor, fixOverlappingLabels } from '../../utils/utils'

const STRAT_LABEL_MIN_HEIGHT = 15

class StratGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {
        this.axisConfig = { y1: 'm', y2: 'Ma' }
        
        const { layout, group } = this.props
        const { data, formationSelected, burialMode, needsYAxis, uepMode } = this.props.data

        this.ages = []
        this.depths = []
        data.forEach((d) => {
            this.ages.push(d.age)
            this.ages.push(d.initAge)
            this.depths.push(d.topDepth)
            this.depths.push(d.bottomDepth)
        })
        this.ages = _.uniq(this.ages).sort((a1, a2) => a1 - a2)
        this.depths = _.uniq(this.depths).sort((d1, d2) => d1 - d2)

        if (group === 'uep' && uepMode === 'age') {
            this.yScale = d3.scaleLinear().domain(d3.extent(this.ages)).range([0, layout.height])
            this.y2Scale = d3.scaleQuantile().domain(this.depths).range(this.ages.map((d) => this.yScale(d)))
            data.forEach((d, i) => {
                data[i].top = d.age
                data[i].bottom = d.initAge
            })
        } else {
            this.yScale = d3.scaleLinear().domain(d3.extent(this.depths)).range([0, layout.height])
            this.y2Scale = d3.scaleQuantile().domain(this.ages).range(this.depths.map((d) => this.yScale(d)))
            data.forEach((d, i) => {
                data[i].top = d.topDepth
                data[i].bottom = d.bottomDepth
            })
        }

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom))

        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        const defs = this.g.append('defs')
        defs.append('clipPath')
            .attr('id', 'clip-strat')
            .append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)
        defs.append('clipPath')
            .attr('id', 'clip-stratbig')
            .append('rect')
            .attr('x', -layout.left)
            .attr('y', -5)
            .attr('width', layout.left + layout.width + layout.right)
            .attr('height', layout.height + 10)

        const boxesG = this.g.append('g').attr('clip-path', 'url(#clip-strat)')
        this.boxes = boxesG.selectAll('.strat-box')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'strat-box')
            .attr('x',(d) => 0)
            .attr('y', (d) => { return this.yScale(d.top) })
            .attr('width', layout.width)
            .attr('height', (d) => { return this.yScale(d.bottom) - this.yScale(d.top) })
            .style('fill', d =>  getEpochColor(d.initAge, d.age))

        var labelsG = this.g.append('g').attr('clip-path', 'url(#clip-strat)')

        this.labels = labelsG.selectAll('.strat-label')
            .data(data)
            .enter().append('text')
            .attr('x', layout.width/2)
            .attr('y', (d) => (this.yScale(d.bottom) + this.yScale(d.top)) / 2 + 1)
            .attr('transform', 'translate(0, 2)')
            .attr('class', 'strat-label')
            .text((d) => d.layerName)
            .attr('opacity', (d) => (this.yScale(d.bottom) - this.yScale(d.top)) > STRAT_LABEL_MIN_HEIGHT ? 1 : 0)

        if (needsYAxis) {
            this.y1Axis = d3.axisLeft().scale(this.yScale).tickSize(3).tickSizeOuter(0).tickValues(this.depths)
            this.y1AxisEl = this.g.append('g') 
                .attr('clip-path', 'url(#clip-stratbig)')
                .attr('class', 'strat-axis strat-axis-y1')
                .call(this.y1Axis)

            this.y2Axis = d3.axisRight().scale(this.y2Scale).tickSize(3).tickSizeOuter(0)
            this.y2AxisEl = this.g.append('g')
                .attr('clip-path', 'url(#clip-stratbig)')
                .attr('class', 'strat-axis strat-axis-y2')
                .attr('transform', 'translate(' + (layout.width) + ',' + 0 + ')')
                .call(this.y2Axis)
            
            this.g.append('text')
                .attr('class', 'strat-axis-label strat-axis-label-y1')
                .attr('x', -3)
                .attr('y', -5)
                .text(this.axisConfig.y1)
            this.g.append('text')
                .attr('class', 'strat-axis-label strat-axis-label-y2')
                .attr('x', layout.width + 3)
                .attr('y', -5)
                .text(this.axisConfig.y2)
        } else {
            this.g.append('path').attr('class', 'strat-border').attr('d', `M 0.5 0.5 V ${layout.height + 0.5}`)
            this.g.append('path').attr('class', 'strat-border').attr('d', `M ${layout.width + 0.5} 0.5 V ${layout.height + 0.5}`)
        }

        this.g.append('path').attr('class', 'strat-border').attr('d', `M 0.5 0.5 H ${layout.width + 0.5}`)
        this.g.append('path').attr('class', 'strat-border').attr('d', `M 0.5 ${layout.height + 0.5} H ${layout.width + 0.5}`)

        setupFullWidthCroppingZoom(this.svg, this.g, layout, this.props.zoom.bind(this), this.props.zoomClear.bind(this), this.props.crop, 'strat')

        if (needsYAxis) {
            fixOverlappingLabels(this.y1AxisEl.selectAll('.tick'), (n) => parseFloat(window.getComputedStyle(n).transform.split(', ')[5]), 8)
            fixOverlappingLabels(this.y2AxisEl.selectAll('.tick'), (n) => parseFloat(window.getComputedStyle(n).transform.split(', ')[5]), 8)
        }

        if ((group === 'thermal' || group === 'uep') && formationSelected) {
            this.boxes.style('fill', (d) => d.layerName === formationSelected.layerName ? getEpochColor(d.initAge, d.age) : '#F0F0F0')
        }

        if ((group === 'burial' && burialMode === 'standard') && formationSelected) {
            this.boxes.style('fill', (d) => d.layerName === formationSelected.layerName ? '#B2B2B2' : '#E9E9E9')
        }

        this.g.selectAll('.dragging-rect').on('click', this.onBoxClick.bind(this))
    }

    zoomGraph() {
        const { layout, zoomFactors, group } = this.props
        const { uepMode } = this.props.data

        let transformY = d3.zoomIdentity

        for (let i = 0; i < zoomFactors.length; i++) {
            const factors = zoomFactors[i]

            transformY = transformY
                .translate(0, layout.height / 2)
                .scale(factors.scaleY)
                .translate(0, factors.y)
        }

        let newYScale
        let newY2Scale
        if (group === 'uep' && uepMode === 'age') {
            newYScale = transformY.rescaleY(this.yScale)
            newY2Scale = d3.scaleQuantile().domain(this.depths).range(this.ages.map((d) => newYScale(d)))   
        } else {
            newYScale = transformY.rescaleY(this.yScale)
            newY2Scale = d3.scaleQuantile().domain(this.ages).range(this.depths.map((d) => newYScale(d)))
        }

        this.boxes
            .attr('y', d => newYScale(d.top))
            .attr('height', d => newYScale(d.bottom) - newYScale(d.top))

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
        this.labels.attr('opacity', (d) => _.min([newYScale(d.bottom), layout.height]) - _.max([newYScale(d.top), 0]) > STRAT_LABEL_MIN_HEIGHT ? 1 : 0)

        if (this.props.data.needsYAxis) {
            this.y1AxisEl.call(this.y1Axis.scale(newYScale))
            this.y1AxisEl.select('path').attr('d', `M0.5,0.5V${layout.height+0.5}`)
    
            this.y2AxisEl.call(this.y2Axis.scale(newY2Scale))
            this.y2AxisEl.select('path').attr('d', `M0.5,0.5V${layout.height+0.5}`)
            
            fixOverlappingLabels(this.y1AxisEl.selectAll('.tick'), (n) => parseFloat(window.getComputedStyle(n).transform.split(', ')[5]), 8)
            fixOverlappingLabels(this.y2AxisEl.selectAll('.tick'), (n) => parseFloat(window.getComputedStyle(n).transform.split(', ')[5]), 8)
        }
    }

    onBoxClick() {
        const { layout, group } = this.props
        const { formationSelected, burialMode } = this.props.data

        const py = d3.event.offsetY - layout.top
        let formation = null

        this.boxes.each((d, i, n) => {
            const e = d3.select(n[i])
            const y = parseFloat(e.attr('y'))
            const height = parseFloat(e.attr('height'))
            if (y <= py && py <= y + height) {
                formation = d
            }
        })
        
        if (formation && (group === 'thermal' || (group === 'burial' && burialMode === 'standard')) && (!formationSelected || formationSelected.layerName !== formation.layerName)) {
            this.props.basinSelectFormation(formation)
        }

        if (formation && group === 'uep' && (!formationSelected || formationSelected.layerName !== formation.layerName)) {
            this.props.uepSelectFormation(formation)
        }
        
        if (formation && group === 'uep' && (formationSelected && formationSelected.layerName === formation.layerName)) {
            this.props.uepDeselectFormation()
        }
    }

    render() {
        return (
            <BaseGraph
                title="Stratigraphy"
                className="strat-graph"
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                zoomGraph={this.zoomGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default StratGraph

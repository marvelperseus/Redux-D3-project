import React, { Component } from 'react'
import * as d3 from 'd3'
import * as _ from 'lodash'

import BaseGraph from './BaseGraph'
import { getAgeTable } from '../../utils/datatransformer'
import { fixOverlappingLabels } from '../../utils/utils'

class ThermalGraph extends Component {
    constructor(props) {
        super(props)
    }

    drawGraph() {
        this.dataset = this.props.data.dataset
        this.ageTable = this.props.data.ageData
        this.axisLabels = {
            xAxis : 'Age (Ma)',
            yAxis : 'EasyRo (%RoEq.)'
        }

        const { layout } = this.props
        const { formationSelected } = this.props.data

        if (formationSelected && formationSelected.layerName) {
            this.data = Object.values(this.dataset).find((d) => d[0][0] === formationSelected.layerName)
        } else {
            this.data = Object.values(this.dataset)[0]
        }

        this.xMax = this.yMax = d3.max(Object.values(this.dataset)[Object.keys(this.dataset).length - 1], (d) => d[3])
        this.xMin = 0

        this.yMax = d3.max(this.data, (d) => d[4])
        if (this.yMax < 2) {
            this.yMax = 2
        }
        this.yMax = this.yMax + 0.2
        this.yMin = 0.3
        this.yTicks = (_.range(0.4, this.yMax, 0.2)).map((t) => Math.round(t * 10) / 10)
        this.yMax = this.yTicks[this.yTicks.length - 1]

        this.xTicks = this.ageTable.filter((a) => a <= this.xMax)

        this.colorArea = d3.area()
            .x((d) => this.xScale(d.age))
            .y0((d) => {
                return this.yScale(this.yMin)
            })
            .y1((d) => {
                return this.yScale(d.val)
            })
        this.areaData = [
            { y1: 0.3, y2: 0.6, color: '#E1E1E1', domain: '' },
            { y1: 0.6, y2: 1.2, color: '#D3DECD', domain: 'OIL' },
            { y1: 1.2, y2: 2, color: '#FFF8E4', domain: 'CONDENSATES' },
            { y1: 2, y2: this.yMax, color: '#FDC0C1', domain: 'GAS' }
        ].map((d) => {
            d.data = this.data.filter((t) => t[4] >= d.y1 && t[4] <= d.y2).map((t) => ({ age: t[3], val: t[4] }))
            return d
        })

        this.delimits = [
            { age: -1, val: 0.6 },
            { age: -1, val: 1.2 },
            { age: -1, val: 2 }
        ]
        this.delimits.forEach((d, i) => {
            const dL = this.data[this.data.filter((t) => t[4] <= d.val).length - 1]
            const dR = this.data.filter((t) => t[4] >= d.val)[0]
            if (dL && dR) {
                const dAge = dL[3] + (dR[3] - dL[3]) * (d.val - dL[4]) / (dR[4] - dL[4])
                this.areaData[i].data.push({ val: d.val, age: dAge })
                this.areaData[i+1].data.unshift({ val: d.val, age: dAge })
                this.delimits[i].age = dAge
                this.xTicks.push(dAge)
            }
        })

        this.xTicks.sort((x1, x2) => x2 - x1)

        const iLast = _.findLastIndex(this.areaData, (d) => d.data.length > 0)
        if (iLast > -1  && this.areaData[iLast].data[this.areaData[iLast].data.length - 1].age !== 0) {
            this.areaData[iLast].data.push({ age: 0, val: this.areaData[iLast].data[this.areaData[iLast].data.length - 1].val })
        }

        this.xFormatter = (d) => (d % 1 !== 0) ? d3.format('.1f')(d) : d3.format('.0f')(d)

        this.xScale = d3.scaleLinear()
            .range([0, layout.width])
            .domain([this.xMax, this.xMin])

        this.xAxis = d3.axisBottom()
            .scale(this.xScale)
            .tickSize(4).tickSizeOuter(0)
            .tickValues(this.xTicks)
            .tickFormat(this.xFormatter)
    
        this.yScale = d3.scaleLinear()
            .range([0, layout.height])
            .domain([this.yMax, this.yMin])
    
        this.yAxis = d3.axisLeft()
            .scale(this.yScale)
            .tickSize(3).tickSizeOuter(0)
            .tickValues(this.yTicks)

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('class', 'thermal-history-svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom))

        const g = this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')

        g.append('defs').append('clipPath')
            .attr('id', 'clip-thermalhistory')
            .append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)

        this.xAxisEl = g.append('g')
             .attr('class', 'axis axis--x')
             .attr('transform', 'translate(0,' + layout.height + ')')
             .call(this.xAxis)

        this.xAxisEl.selectAll('text') 
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-45)')
            .style('font-weight', (d) => this.delimits.map((d) => d.age).includes(d) ? 'bold' : 'normal')
 
        this.xAxisEl.append('text')          
             .attr('y',  layout.bottom - 10)
             .attr('x',  layout.width/2)        
             .style('text-anchor', 'middle')
             .attr('fill', '#5D6971')
             .style('font-size', '10px')
             .text(this.axisLabels.xAxis)
 
        this.yAxisEl = g.append('g')
             .attr('class', 'axis axis--y')
             .call(this.yAxis)

        this.yAxisEl.selectAll('text')
            .style('font-weight', (d) => this.delimits.map((d) => d.val).includes(d) ? 'bold' : 'normal')

        this.yAxisEl.append('text')
            .attr('class', 'label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -42)
            .attr('x', -layout.height / 2)
            .attr('dy', '.71em')
            .attr('fill', '#5D6971')
            .style('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(this.axisLabels.yAxis)

        g.append('path')
            .attr('d', `M0.5,0.5H${layout.width + 0.5}`)
            .attr('stroke', 'currentColor')

        g.append('path')
            .attr('d', `M${layout.width + 0.5},0.5V${layout.height + 0.5}`)
            .attr('stroke', 'currentColor')

        this.graphContainer = g.append('g').attr('clip-path', 'url(#clip-thermalhistory)')

        this.areaData.forEach((d) => {
            this.graphContainer.append('path')
                .datum(d.data)
                .attr('d', this.colorArea)
                .style('fill', d.color)
        })

        const lineFunction = d3.line()
            .x((d) => this.xScale(d[3]))
            .y((d) => this.yScale(d[4]))
            .curve(d3.curveLinear)

        this.lines = this.graphContainer.append('path')
            .attr('d', lineFunction(this.data))
            .attr('stroke', '#000000')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none')

        this.points = this.graphContainer.selectAll('circle')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('r', 2)
            .attr('fill', '#000000')
            .attr('cx', (d) => this.xScale(d[3]))
            .attr('cy', (d) => this.yScale(d[4]))

        this.hLines = g.append('g')
            .attr('class', 'hlines')
            .selectAll('.hline')
            .data(this.yTicks)
            .enter()
            .append('path')
            .attr('class', 'hline')
            .attr('d', (d) => `M0.5,${this.yScale(d)+0.5}H${layout.width + 0.5}`)
            .attr('stroke', '#A0A0A0')
            .attr('stroke-width', (d) => this.delimits.map((d) => d.val).includes(d) ? 0 : 0.3)

        this.vLines = g.append('g')
            .attr('class', 'vlines')
            .selectAll('.vline')
            .data(this.xTicks)
            .enter()
            .append('path')
            .attr('class', 'vline')
            .attr('d', (d) => `M${this.xScale(d)+0.5},0.5V${layout.height + 0.5}`)
            .attr('stroke', (d) => '#A0A0A0')
            .attr('stroke-width', (d) => this.delimits.map((d) => d.age).includes(d) ? 0 : 0.3)

        this.delimitHLines = g.append('g')
            .attr('class', 'delimit-hlines')
            .selectAll('.delimit-hline')
            .data(this.delimits)
            .enter()
            .append('path')
            .attr('class', 'delimit-hline')
            .attr('d', (d) => `M0.5,${this.yScale(d.val)+0.5}H${this.xScale(d.age) + 0.5}`)
            .attr('stroke', '#7F7F7F')
            .attr('stroke-width', 1)

        this.delimitVLines = g.append('g')
            .attr('class', 'delimit-vlines')
            .selectAll('.delimit-vline')
            .data(this.delimits.filter((d) => d.age >= 0))
            .enter()
            .append('path')
            .attr('class', 'delimit-vline')
            .attr('d', (d) => `M${this.xScale(d.age)+0.5},${this.yScale(d.val)+0.5}V${layout.height + 0.5}`)
            .attr('stroke', '#7F7F7F')
            .attr('stroke-width', 1)

        this.areaData.forEach((d) => {
            if (d.data.length === 0) return

            this.graphContainer.append('text')
                .text(d.domain)
                .attr('class', 'domain-label')
                .attr('x', this.xScale((d.data[0].age + d.data[d.data.length - 1].age) / 2))
                .attr('y', this.yScale((d.data[0].val + this.yMin) / 2))
        })

        fixOverlappingLabels(this.xAxisEl.selectAll('.tick'), (n) => parseFloat(window.getComputedStyle(n).transform.split(', ')[4]), 20, this.delimits.filter((d) => d.age >= 0).map((d) => _.indexOf(this.xTicks, d.age)))
    }

    render() {
        const { formationSelected } = this.props.data
        return (
            <BaseGraph
                title={'Thermal History - ' + (formationSelected && formationSelected.layerName)}
                className="thermal-graph"
                onGraphBodyElementReady={el => this.graphBodyElement = el}
                drawGraph={this.drawGraph.bind(this)}
                {...this.props}
            >
            </BaseGraph>
        )
    }
}

export default ThermalGraph

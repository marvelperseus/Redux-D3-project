import React, { Component } from 'react'
import * as d3 from 'd3'
import * as _ from 'lodash'
import Draggable from 'react-draggable'
import { Checkbox } from 'semantic-ui-react'

import BaseGraph from './BaseGraph'
import { getAgeTable } from '../../utils/datatransformer'
import { getEpochColor, fixOverlappingLabels } from '../../utils/utils'

class BurialGraph extends Component {
    constructor(props) {
        super(props)

        this.state = {
            ballPosition : 0
        }
    }

    handleBallDrag() {
        const position = -parseInt(window.getComputedStyle(this.ballElement).transform.split(', ')[4]) / this.props.layout.width
        this.setState({
            ballPosition : position
        }, () => {
            this.drawCursor()
        })
    }

    handleBallDragStop() {
        this.handleBallDrag()
    }

    drawGraph() {
        const { layout } = this.props
        const { dataset, ageData, layerNames, formationSelected, burialMode, isolinesData } = this.props.data

        const isolinesArray = Object.values(isolinesData)

        this.axisLabels = { xAxis: 'Age (Ma)', yAxis: 'TVDss (m)' }
        this.areaData = {}
        layerNames.forEach((val, index) => {
            this.areaData[val] = {column: val, index}
        })
    
        const xMax = this.xMax = d3.max(dataset, (d) => d.Age)
        const xMin = this.xMin = d3.min(dataset, (d) => d.Age)
        const yMin = d3.min(dataset.map(row => row.minValue))
        const yMax = Math.ceil(d3.max(dataset.map(row => row.maxValue)) / 1000) * 1000

        this.xFormatter = d3.format('.0f')
        this.yFormatter = (d) => (d % 1 !== 0) ? d3.format('.2f')(d) : d3.format('.0f')(d)
        this.y2Formatter = d3.format('.0f')

        this.xScale = d3.scaleLinear()
            .range([0, layout.width])
            .domain([xMax, xMin])
        this.yScale = d3.scaleLinear()
            .range([layout.height, 0])
            .domain([yMax, yMin])
    
        this.xAxis = d3.axisBottom()
            .scale(this.xScale)
            .tickSize(4).tickSizeOuter(0)
            .tickFormat(this.xFormatter)    
        this.yAxis = d3.axisLeft()
            .scale(this.yScale)
            .tickSize(3).tickSizeOuter(0)
            .tickFormat(this.yFormatter)
        this.y2Axis = d3.axisRight()
            .scale(this.yScale)
            .tickSize(3).tickSizeOuter(0)
            .tickFormat(this.y2Formatter)

        this.svg = d3.select(this.graphBodyElement).append('svg')
            .attr('width', layout.width + (layout.left + layout.right))
            .attr('height', layout.height + (layout.top + layout.bottom))        
        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')
  
        this.g.append('defs').append('clipPath')
            .attr('id', 'clip-burial')
            .append('rect')
            .attr('width', layout.width)
            .attr('height', layout.height)

        this.xAxisEl = this.g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + layout.height + ')')
            .call(this.xAxis)
        this.xAxisEl.append('text')
            .attr('class', 'label')
            .attr('x', layout.width / 2)
            .attr('y', 30)
            .attr('fill', '#5D6971')
            .style('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(this.axisLabels.xAxis)
    
        this.yAxisEl = this.g.append('g')
            .attr('class', 'axis axis--y')
            .call(this.yAxis)
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

        this.y2AxisEl = this.g.append('g')
            .attr('class', 'axis axis--y')
            .attr('transform', `translate(${layout.width},0)`)
            .call(this.y2Axis)

        this.g.append('g')
            .attr('class', 'axis')
            .append('path')
            .attr('d', `M 0.5 0.5 H ${layout.width}`)

        if (burialMode === 'standard') {
            const isolineG = this.g.append('g').attr('clip-path', 'url(#clip-burial)')

            isolinesArray.forEach((isoline, index) => {
                if (index === isolinesArray.length - 1) return

                const dt = isoline.age.map((d, i) => ({
                    age     : isoline.age[i],
                    tvdss   : isoline.tvdss[i],
                    tvdss_n : isolinesArray[index + 1].tvdss[i]
                }))

                isolineG.append('path')
                    .datum(dt)
                    .attr('class', 'isoarea')
                    .attr('d', d3.area()
                        .x(d => this.xScale(d.age))
                        .y(d => this.yScale(d.tvdss))
                        .y1(d => this.yScale(d.tvdss_n))
                    )
                    .style('fill', isoline.color)
                    .style('stroke', isoline.color)
            })

            const bottomIsoline = isolinesArray[isolinesArray.length - 1]
            const bottomIsolinePoints = bottomIsoline.age.map((d, i) => ([ this.xScale(bottomIsoline.age[i]), this.yScale(bottomIsoline.tvdss[i])]))
            dataset.forEach((d) => {
                bottomIsolinePoints.unshift([this.xScale(d.Age), this.yScale(d.depths[d.depths.length - 1])])
            })
            isolineG.append('path')
                .attr('class', 'isoarea')
                .attr('d', d3.area()(bottomIsolinePoints))
                .style('fill', bottomIsoline.color)
        }

        const areaG = this.g.append('g').attr('clip-path', 'url(#clip-burial)')        
        const areaForRow = (rowObj) => d3.area()
            .x((d) => this.xScale(d.Age))
            .y0((d) => {
                if (rowObj.index > 0) {
                    return this.yScale(d.depths[rowObj.index - 1])
                } else {
                    return 0
                }
            })
            .y1((d) => {
                return this.yScale(d.depths[rowObj.index])
            })
        for (var y in this.areaData) {
            if (this.areaData[y].index > 0) {
                this.areaData[y].area = areaForRow(this.areaData[y])
                this.areaData[y].path = areaG.append('path')
                    .datum(dataset)
                    .attr('class', () => {
                        if (burialMode === 'standard' && formationSelected)
                            return 'area-standard'
                        else
                            return 'area'
                    })
                    .attr('d', this.areaData[y].area)
                    .style('fill', () => {
                        if (burialMode === 'standard' && formationSelected) {
                            if (formationSelected.layerName === this.areaData[y].column) {
                                return '#434242'
                            } else {
                                return '#C8C8C8'
                            }
                        } else {
                            const idx = this.areaData[y].index
                            const initAge = ageData[ageData.length - idx - 2]
                            const finalAge = ageData[ageData.length - idx - 1]
                            return getEpochColor(initAge, finalAge)
                        }
                    })
                    .attr('data-series', y)
            }
        }

        if (burialMode === 'standard') {
            const isolineStrokeG = this.g.append('g').attr('clip-path', 'url(#clip-burial)')

            isolinesArray.forEach((isoline, index) => {
                const dt = isoline.age.map((d, i) => ({
                    age   : isoline.age[i],
                    tvdss : isoline.tvdss[i]
                }))

                isolineStrokeG.append('path')
                    .datum(dt)
                    .attr('class', 'isoarea')
                    .attr('d', d3.area()
                        .x(d => this.xScale(d.age))
                        .y(d => this.yScale(d.tvdss))
                        .y1(d => this.yScale(d.tvdss)+3)
                    )
                    .style('fill', isoline.color)
            })

            const bottomPoints = dataset.map(d => ({
                age   : d.Age,
                depth : d.depths[d.depths.length - 1]
            }))
            isolineStrokeG.append('path')
                .datum(bottomPoints)
                .attr('class', 'isoarea')
                .attr('d', d3.area()
                    .x(d => this.xScale(d.age))
                    .y(d => this.yScale(d.depth))
                    .y1(d => this.yScale(d.depth)+3)
                )
                .style('fill', '#434242')

            const bottomAreaPoints = bottomPoints.map((d, i) => ([ this.xScale(d.age), this.yScale(d.depth)+3]))
            bottomAreaPoints.push([layout.width, layout.height])
            bottomAreaPoints.push([0, layout.height])
            isolineStrokeG.append('path')
                .attr('class', 'isoarea')
                .attr('d', d3.area()(bottomAreaPoints))
                .style('fill', '#FFFFFF')
        }

        this.hline = d3.axisLeft(this.yScale)
            .tickSize(-layout.width).tickSizeOuter(0)
            .tickFormat('')
        this.hlines = this.g.append('g')
            .style('color', '#D0D0D0')
            .style('stroke-width', '0.5px')
            .call(this.hline)

        this.vline = d3.axisTop()
            .scale(this.xScale)
            .tickSize(-layout.height).tickSizeOuter(0)
            .tickFormat('')
        this.vlines = this.g.append('g')
            .style('color', '#D0D0D0')
            .style('stroke-width', '0.5px')
            .call(this.vline)

        if (burialMode === 'standard') {
            const isolineCount = isolinesArray.length
            const isolineCountHalf = Math.round(isolineCount / 2)
            const isolineLegendsWidth = 220
            const isolineLegendsHeight = 55 + isolineCount / 2 * 30

            const isolineLegendG = this.g.append('g').attr('clip-path', 'url(#clip-burial)')
                .attr('transform', 'translate(10,' + (layout.height - isolineLegendsHeight - 8) + ')')
            isolineLegendG.append('rect')
                .attr('class', 'isoline-legends-rect')
                .attr('width', isolineLegendsWidth)
                .attr('height', isolineLegendsHeight)
                .attr('x', 0)
                .attr('y', 0)
            isolineLegendG.append('text')
                .attr('class', 'isoline-legends-title1')
                .attr('x', isolineLegendsWidth / 2)
                .attr('y', 20)
                .text('Standard Thermal Stress')
            isolineLegendG.append('text')
                .attr('class', 'isoline-legends-title2')
                .attr('x', isolineLegendsWidth / 2)
                .attr('y', 40)
                .text('(ºC @ 2 ºC/Ma)')
            isolinesArray.forEach((isoline, index) => {
                isolineLegendG.append('rect')
                    .attr('class', 'isoline-legend-box')
                    .attr('x', 10 + parseInt(index / Math.round(isolineCount / 2)) * isolineLegendsWidth / 2)
                    .attr('y', 55 + 30 * (index >= isolineCountHalf ? index - isolineCountHalf : index))
                    .attr('width', 20)
                    .attr('height', 20)
                    .attr('fill', isoline.color)
                isolineLegendG.append('text')
                    .attr('class', 'isoline-legend-text')
                    .attr('x', 35 + parseInt(index / Math.round(isolineCount / 2)) * isolineLegendsWidth / 2)
                    .attr('y', 70 + 30 * (index >= isolineCountHalf ? index - isolineCountHalf : index))
                    .text((index === isolineCount - 1 ? '>' : '') + parseInt(isoline.STS) + ' ºC')
            })
        }

        const cursorG = this.cursorG = this.g.append('g').attr('class', 'cursor-g')

        this.cursorOverlay = cursorG.append('rect')
            .attr('class', 'cursor-overlay')
            .attr('x', layout.width)
            .attr('y', 1)
            .attr('width', 0)
            .attr('height', layout.height - 2)
        this.cursorThinLine = cursorG.append('path')
            .attr('class', 'cursor-thin-line')
            .attr('d', `M ${layout.width + layout.right + 100} 0.5 V ${layout.height + layout.bottom - 40}`)
        this.cursorThickLine = cursorG.append('path')
            .attr('class', 'cursor-thick-line')
            .attr('d', `M ${layout.width + layout.right + 100} 0.5 V ${layout.height}`)
        this.cursorAgeLabel = cursorG.append('text')
            .attr('class', 'cursor-agelabel')
            .attr('x', layout.width)
            .attr('y', layout.height + layout.bottom - 41)
        this.cursorLegendLeft = cursorG.append('text')
            .attr('class', 'cursor-legend-left')
            .text('Thickness (m)')
        this.cursorLegendRight = cursorG.append('text')
            .attr('class', 'cursor-legend-right')
            .text('Depth (m)')

        this.drawCursor()
    }

    drawCursor() {
        const { layout } = this.props
        const position = this.state.ballPosition

        const pos = layout.width * (1 - position)
        const age = this.xMin + Math.round((this.xMax - this.xMin) * position)
        let depths = _.uniqBy(this.getDepthsAtAge(age), (d) => this.y2Formatter(d))
        depths.sort((d1, d2) => d1 - d2)
        const depthMax = d3.max(depths)
        const depthMin = d3.min(depths)
        let depthSizes = []
        depths.forEach((d, i) => {
            if (i === depths.length - 1) {
                return
            }
            depthSizes.push({d1: d, d2: depths[i + 1], s: depths[i + 1] - d})
        })

        this.cursorOverlay.attr('x', pos)
            .attr('width', layout.width - pos)

        this.cursorThinLine.attr('d', `M ${pos} 0.5 V ${layout.height + layout.bottom - 40}`)

        this.cursorThickLine.attr('d', `M ${pos} ${this.yScale(depthMin)} V ${this.yScale(depthMax)}`)

        this.cursorAgeLabel.text(`${age} Ma`)
            .attr('x', pos - 20)

        this.cursorG.selectAll('.cursor-depthtext')
            .remove()
        this.cursorG.selectAll('.cursor-depthtext')
            .data(depths)
            .enter()
            .append('text')
            .attr('class', 'cursor-depthtext')
            .attr('x', pos + 10)
            .attr('y', d => this.yScale(d) + 5)
            .text(d => this.y2Formatter(d))

        this.cursorG.selectAll('.cursor-depthtext-tick')
            .remove()
        this.cursorG.selectAll('.cursor-depthtext-tick')
            .data(depths)
            .enter()
            .append('line')
            .attr('class', 'cursor-depthtext-tick')
            .attr('x1', pos)
            .attr('y1', d => this.yScale(d))
            .attr('x2', pos + 7)
            .attr('y2', d => this.yScale(d))

        this.cursorG.selectAll('.cursor-depthsize')
            .remove()
        this.cursorG.selectAll('.cursor-depthsize')
            .data(depthSizes)
            .enter()
            .append('text')
            .attr('class', 'cursor-depthsize')
            .attr('x', pos - 5)
            .attr('y', d => (this.yScale(d.d1) + this.yScale(d.d2)) / 2 + 3)
            .text(d => this.y2Formatter(d.s))

        this.cursorLegendLeft
            .attr('x', pos - 10)
            .attr('y', this.yScale(depthMin) - 10)

        this.cursorLegendRight
            .attr('x', pos + 10)
            .attr('y', this.yScale(depthMin) - 10)

        this.cursorG.attr('class', 'cursor-g' + (position === 0 ? ' cursor-g-0' : ''))

        this.y2AxisEl.selectAll('.tick').attr('opacity', position > 0 ? 0 : 1)

        fixOverlappingLabels(this.cursorG.selectAll('.cursor-depthtext'), (n) => parseFloat(d3.select(n).attr('y')), 8)
        fixOverlappingLabels(this.cursorG.selectAll('.cursor-depthsize'), (n) => parseFloat(d3.select(n).attr('y')), 8)
    }

    getDepthsAtAge(age) {
        const { dataset } = this.props.data

        const data = dataset.find(d => d.Age === age)

        if (data) {
            return data.depths
        } else {
            const ageLeft = d3.min(dataset.filter(d => d.Age > age), d => d.Age)
            const ageRight = d3.max(dataset.filter(d => d.Age < age), d => d.Age)
            const depthsLeft = dataset.find(d => d.Age === ageLeft).depths
            const depthsRight = dataset.find(d => d.Age === ageRight).depths
            const depths = depthsLeft.map((d1, i) => {
                let d2 = depthsRight[i]
                return d2 + (d1 - d2) * (age - ageRight) / (ageLeft - ageRight)
            })
            return depths
        }
    }

    handleChangeMode() {
        const { burialMode } = this.props.data
        if (burialMode === 'basic') {
            this.props.burialSetMode('standard')
        } else {
            this.props.burialSetMode('basic')
        }
    }

    render() {
        const { layout } = this.props
        const { ballPosition } = this.state
        const { formationSelected, burialMode } = this.props.data

        return (
            <div className="burial-graph">
                <BaseGraph
                    title={'Burial History' + (burialMode === 'standard' && formationSelected ? ' - ' + formationSelected.layerName : '')}
                    onGraphBodyElementReady={el => this.graphBodyElement = el}
                    drawGraph={this.drawGraph.bind(this)}
                    {...this.props}
                >
                </BaseGraph>
                <Draggable
                    axis="x"
                    bounds={{left: -layout.width, right: 0}}
                    position={{x: -ballPosition * layout.width, y: 0}}
                    onDrag={this.handleBallDrag.bind(this)}
                    onStop={this.handleBallDragStop.bind(this)}
                >
                    <div className="burial-ball" ref={el => this.ballElement = el}>
                        <div className="burial-ball-inner"></div>
                    </div>
                </Draggable>
                <div className="mode-switch">
                    <Checkbox
                        defaultChecked={burialMode === 'standard'}
                        onChange={this.handleChangeMode.bind(this)}
                        label="Standard Thermal Stress"
                        toggle
                    />
                </div>
            </div>
        )
    }
}

export default BurialGraph

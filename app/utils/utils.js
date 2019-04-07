import * as d3 from 'd3'

export const calculateTransformFactors = (width, height, x, y, cWidth, cHeight) => {
    const focalPoint = {
        x : +x + width/2,
        y : +y + height/2
    }
  
    const scaleX = cWidth / width
    const scaleY = cHeight / height

    return {
        scaleX,
        scaleY,
        x : -focalPoint.x,
        y : -focalPoint.y
    }
}

export const getEpochColor = (init_age, final_age) => {
    const med = (init_age + final_age) / 2
    const results = epochColors.filter((row) => med <= row['beginAge'] && med > row['endAge'])
    let mappedColor = (results.length === 1) ? results[0]['color'] : '#000'
    return mappedColor
}

export const epochColors = [
    {
        'name'     : 'Holocene',
        'endAge'   : 0.0,
        'beginAge' : 0.017,
        'color'    : '#fef2e0'
    },
    {
        'name'     : 'Pleistocene',
        'endAge'   : 0.017,
        'beginAge' : 2.58,
        'color'    : '#fff2ae'
    },
    {
        'name'     : 'Pliocene',
        'endAge'   : 2.58,
        'beginAge' : 5.333,
        'color'    : '#ffff99'
    },
    {
        'name'     : 'Miocene',
        'endAge'   : 5.333,
        'beginAge' : 23.03,
        'color'    : '#ffff00'
    },
    {
        'name'     : 'Oligocene',
        'endAge'   : 23.03,
        'beginAge' : 33.9,
        'color'    : '#fdc07a'
    },
    {
        'name'     : 'Eocene',
        'endAge'   : 33.9,
        'beginAge' : 56.0,
        'color'    : '#fdb46c'
    },
    {
        'name'     : 'Paleocene',
        'endAge'   : 56.0,
        'beginAge' : 66.0,
        'color'    : '#fda75f'
    },
    {
        'name'     : 'Upper Cretaceous',
        'endAge'   : 66.0,
        'beginAge' : 100.5,
        'color'    : '#a6d84a'
    },
    {
        'name'     : 'Lower Cretaceous',
        'endAge'   : 100.5,
        'beginAge' : 145.0,
        'color'    : '#8ccd57'
    },
    {
        'name'     : 'Upper Jurassic',
        'endAge'   : 145.0,
        'beginAge' : 163.5,
        'color'    : '#b3e3ee'
    },
    {
        'name'     : 'Middle Jurassic',
        'endAge'   : 163.5,
        'beginAge' : 174.1,
        'color'    : '#80cfd8'
    },
    {
        'name'     : 'Lower Jurassic',
        'endAge'   : 174.1,
        'beginAge' : 201.3,
        'color'    : '#42aed0'
    },
    {
        'name'     : 'Upper Triassic',
        'endAge'   : 201.3,
        'beginAge' : 237.0,
        'color'    : '#BD8CC3'
    },
    {
        'name'     : 'Middle Triassic',
        'endAge'   : 237.0,
        'beginAge' : 247.2,
        'color'    : '#B168B1'
    },
    {
        'name'     : 'Lower Triassic',
        'endAge'   : 247.2,
        'beginAge' : 251.902,
        'color'    : '#983999'
    },
    {
        'name'     : 'Lopingian',
        'endAge'   : 251.902,
        'beginAge' : 259.1,
        'color'    : '#FBA794'
    },
    {
        'name'     : 'Guadalupian',
        'endAge'   : 259.1,
        'beginAge' : 272.95,
        'color'    : '#FB745C'
    },
    {
        'name'     : 'Cisuralian',
        'endAge'   : 272.95,
        'beginAge' : 298.9,
        'color'    : '#EF5845'
    },
    {
        'name'     : 'Upper Pennsylvanian',
        'endAge'   : 298.9,
        'beginAge' : 307.0,
        'color'    : '#BFD0BA'
    },
    {
        'name'     : 'Middle Pennsylvanian',
        'endAge'   : 307.0,
        'beginAge' : 315.2,
        'color'    : '#A6C7B7'
    },
    {
        'name'     : 'Lower Pennsylvanian',
        'endAge'   : 315.2,
        'beginAge' : 323.2,
        'color'    : '#8CBEB4'
    },
    {
        'name'     : 'Upper Mississippian',
        'endAge'   : 323.2,
        'beginAge' : 330.9,
        'color'    : '#B3BE6C'
    },
    {
        'name'     : 'Middle Mississippian',
        'endAge'   : 330.9,
        'beginAge' : 346.7,
        'color'    : '#99B46C'
    },
    {
        'name'     : 'Lower Mississippian',
        'endAge'   : 346.7,
        'beginAge' : 358.9,
        'color'    : '#80AB6C'
    },
    {
        'name'     : 'Upper Devonian',
        'endAge'   : 358.9,
        'beginAge' : 382.7,
        'color'    : '#F1E19D'
    },
    {
        'name'     : 'Middle Devonian',
        'endAge'   : 382.7,
        'beginAge' : 393.3,
        'color'    : '#F1C868'
    },
    {
        'name'     : 'Lower Devonian',
        'endAge'   : 393.3,
        'beginAge' : 419.2,
        'color'    : '#E5AC4D'
    },
    {
        'name'     : 'Pridoli',
        'endAge'   : 419.2,
        'beginAge' : 423.0,
        'color'    : '#E6F5E1'
    },
    {
        'name'     : 'Ludlow',
        'endAge'   : 423.0,
        'beginAge' : 427.4,
        'color'    : '#BFE6CF'
    },
    {
        'name'     : 'Wenlock',
        'endAge'   : 427.4,
        'beginAge' : 433.4,
        'color'    : '#B3E1C2'
    },
    {
        'name'     : 'Llandovery',
        'endAge'   : 433.4,
        'beginAge' : 443.8,
        'color'    : '#99D7B3'
    },
    {
        'name'     : 'Upper Ordovician',
        'endAge'   : 443.8,
        'beginAge' : 458.4,
        'color'    : '#7FCA93'
    },
    {
        'name'     : 'Middle Ordovician',
        'endAge'   : 458.4,
        'beginAge' : 470.0,
        'color'    : '#4DB47E'
    },
    {
        'name'     : 'Lower Ordovician',
        'endAge'   : 470.0,
        'beginAge' : 485.4,
        'color'    : '#1A9D6F'
    },
    {
        'name'     : 'Furongian',
        'endAge'   : 485.4,
        'beginAge' : 497.0,
        'color'    : '#B3E095'
    },
    {
        'name'     : 'Miaolingian',
        'endAge'   : 497.0,
        'beginAge' : 509.0,
        'color'    : '#A6CF86'
    },
    {
        'name'     : 'Series 2',
        'endAge'   : 509.0,
        'beginAge' : 521.0,
        'color'    : '#99C078'
    },
    {
        'name'     : 'Terreneuvian',
        'endAge'   : 521.0,
        'beginAge' : 541.0,
        'color'    : '#8CB06C'
    }
]

export const lithoColor = (litho) => {
    switch (litho) {
    case 'salt':
        return '#FABEF9'
    case 'limestone_early_diagenesis':
        return '#BEE2FA'
    case 'limestone':
        return '#BEE2FA'
    case 'marl':
        return '#BEE2FA'
    case 'shale':
        return '#024408'
    case 'sand':
        return '#FFFF99'
    case 'sandstone':
        return '#FFFF99'
    }
}

export const setupFullWidthCroppingZoom = (svg, g, layout, zoom, zoomClear, crop, graph) => {
    const draggingGround = g.append('rect')
        .attr('class', 'dragging-rect')
        .attr('width', layout.width)
        .attr('height', layout.height)
        .attr('fill-opacity', 0.001)

    draggingGround.on('dblclick', () => {
        zoomClear()
    })

    const cropGround = svg.append('g')
        .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')
    const cropSelection = cropGround.append('rect')
        .classed('crop-selection', true)
        .attr('fill-opacity', '0.001')
        .attr('width', 0)
        .attr('height', 0)
    const cropArea = {
        startX      : 0,
        startY      : 0,
        currentX    : 0,
        currentY    : 0,
        translateX  : 0,
        translateY  : 0,
        isFullWidth : true
    }

    const cropOutsiders = []
    for (let i=0; i<2; i++) {
        cropOutsiders.push(
            cropGround.append('rect')
                .classed('crop-outsider', true)
                .attr('fill-opacity', '0.5')
                .attr('width', 0).attr('height', 0)
        )
    }

    const dragger = d3.drag()
        .on('start', function () {
            let m = d3.mouse(this)
            m = [
                Math.max(Math.min(m[0], layout.width), 0),
                Math.max(Math.min(m[1], layout.height), 0)
            ]
            cropArea.startX = m[0]
            cropArea.startY = m[1]

            cropSelection
                .attr('x', cropArea.startX)
                .attr('y', cropArea.startY)
        })
        .on('drag', function () {
            let m = d3.mouse(this)
            m = [
                Math.max(Math.min(m[0], layout.width), 0),
                Math.max(Math.min(m[1], layout.height), 0)
            ]

            cropArea.currentX = m[0] - cropArea.startX
            cropArea.currentY = m[1] - cropArea.startY
            
            let boxWidth = layout.width
            let boxHeight = Math.abs(cropArea.currentY)

            cropArea.translateX = -cropArea.startX
            cropArea.translateY = cropArea.currentY < 0 ? cropArea.currentY : 0

            cropSelection
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('transform', 'translate(' + cropArea.translateX + ',' + cropArea.translateY + ')')

            const areaWidth = Math.round(boxWidth)
            const areaHeight = Math.round(boxHeight)
            const areaX = Math.round(+cropSelection.attr('x') + +cropArea.translateX)
            const areaY = Math.round(+cropSelection.attr('y') + +cropArea.translateY)

            cropOutsiders[0]
                .attr('width', areaWidth)
                .attr('height', areaY)
                .attr('x', areaX)
                .attr('y', 0)
            cropOutsiders[1]
                .attr('width', areaWidth)
                .attr('height', layout.height - areaY - areaHeight)
                .attr('x', areaX)
                .attr('y', areaY + areaHeight)

            crop(cropArea, graph)
        })
        .on('end', () => {
            const areaWidth = cropSelection.attr('width')
            const areaHeight = cropSelection.attr('height')
            const areaX = +cropSelection.attr('x') + +cropArea.translateX
            const areaY = +cropSelection.attr('y') + +cropArea.translateY

            const tFactors = calculateTransformFactors(areaWidth, areaHeight, areaX, areaY, layout.width, layout.height)

            cropSelection.attr('transform', 'translate(0,0)')
                .attr('width', 0)
                .attr('height', 0)
            for (let i=0; i<2; i++) {
                cropOutsiders[i]
                    .attr('width', 0)
                    .attr('height', 0)
            }

            if (areaWidth < 1 || areaHeight < 1) {
                return
            }

            crop(null, graph)
            zoom(tFactors)
        })

    draggingGround.call(dragger)
}

export const cropFullWidthGraph = (graphEle, layout, cropArea) => {
    if (!graphEle) return

    const cropSelection = graphEle.select('.crop-selection')
    const cropOutsiders = graphEle.selectAll('.crop-outsider')

    if (!cropSelection || !cropOutsiders) return

    if (cropArea) {
        let boxWidth = layout.width
        let boxHeight = Math.abs(cropArea.currentY)

        cropSelection
            .attr('x', cropArea.startX)
            .attr('y', cropArea.startY)
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('transform', 'translate(' + cropArea.translateX + ',' + cropArea.translateY + ')')

        const areaWidth = Math.round(boxWidth)
        const areaHeight = Math.round(boxHeight)
        const areaX = 0
        const areaY = Math.round(+cropArea.startY + +cropArea.translateY)

        d3.select(cropOutsiders.nodes()[0])
            .attr('width', areaWidth)
            .attr('height', areaY)
            .attr('x', areaX)
            .attr('y', 0)
        d3.select(cropOutsiders.nodes()[1])
            .attr('width', areaWidth)
            .attr('height', layout.height - areaY - areaHeight)
            .attr('x', areaX)
            .attr('y', areaY + areaHeight)
    } else {
        cropSelection.attr('transform', 'translate(0,0)')
            .attr('width', 0)
            .attr('height', 0)
        for (let i=0; i<2; i++) {
            d3.select(cropOutsiders.nodes()[i])
                .attr('width', 0)
                .attr('height', 0)
        }
    }
}

export const setupCroppingZoom = (svg, g, layout, zoom, zoomClear, crop, graph) => {
    const draggingGround = g.append('rect')
        .attr('width', layout.width)
        .attr('height', layout.height)
        .attr('fill-opacity', 0.001)

    draggingGround.on('dblclick', () => {
        zoomClear()
    })

    const cropGround = svg.append('g')
        .attr('transform', 'translate(' + layout.left + ',' + layout.top + ')')
    const cropSelection = cropGround.append('rect')
        .classed('crop-selection', true)
        .attr('fill-opacity', '0.001')
        .attr('width', 0)
        .attr('height', 0)
    const cropArea = {
        startX      : 0,
        startY      : 0,
        currentX    : 0,
        currentY    : 0,
        translateX  : 0,
        translateY  : 0,
        isFullWidth : false
    }

    const cropOutsiders = []
    for (let i=0; i<4; i++) {
        cropOutsiders.push(
            cropGround.append('rect')
                .classed('crop-outsider', true)
                .attr('fill-opacity', '0.5')
                .attr('width', 0).attr('height', 0)
        )
    }

    const dragger = d3.drag()
        .on('start', function () {
            let m = d3.mouse(this)
            m = [
                Math.max(Math.min(m[0], layout.width), 0),
                Math.max(Math.min(m[1], layout.height), 0)
            ]
            cropArea.startX = m[0]
            cropArea.startY = m[1]

            cropSelection
                .attr('x', cropArea.startX)
                .attr('y', cropArea.startY)
        })
        .on('drag', function () {
            let m = d3.mouse(this)
            m = [
                Math.max(Math.min(m[0], layout.width), 0),
                Math.max(Math.min(m[1], layout.height), 0)
            ]

            cropArea.currentX = m[0] - cropArea.startX
            cropArea.currentY = m[1] - cropArea.startY
            
            let boxWidth = Math.abs(cropArea.currentX)
            let boxHeight = Math.abs(cropArea.currentY)

            const smallLength = 15

            if (boxWidth < smallLength) {
                boxWidth = layout.width
                cropArea.translateX = -cropArea.startX
                cropArea.translateY = cropArea.currentY < 0 ? cropArea.currentY : 0
            } else if (boxHeight < smallLength) {
                boxHeight = layout.height
                cropArea.translateX = cropArea.currentX < 0 ? cropArea.currentX : 0
                cropArea.translateY = -cropArea.startY
            } else {
                cropArea.translateX = cropArea.currentX < 0 ? cropArea.currentX : 0
                cropArea.translateY = cropArea.currentY < 0 ? cropArea.currentY : 0
            }

            cropSelection
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('transform', 'translate(' + cropArea.translateX + ',' + cropArea.translateY + ')')

            const areaWidth = Math.round(boxWidth)
            const areaHeight = Math.round(boxHeight)
            const areaX = Math.round(+cropSelection.attr('x') + +cropArea.translateX)
            const areaY = Math.round(+cropSelection.attr('y') + +cropArea.translateY)

            cropOutsiders[0]
                .attr('width', areaX)
                .attr('height', layout.height)
                .attr('x', 0)
                .attr('y', 0)
            cropOutsiders[1]
                .attr('width', layout.width - areaX - areaWidth)
                .attr('height', layout.height)
                .attr('x', areaX + areaWidth)
                .attr('y', 0)
            cropOutsiders[2]
                .attr('width', areaWidth)
                .attr('height', areaY)
                .attr('x', areaX)
                .attr('y', 0)
            cropOutsiders[3]
                .attr('width', areaWidth)
                .attr('height', layout.height - areaY - areaHeight)
                .attr('x', areaX)
                .attr('y', areaY + areaHeight)

            crop(cropArea, graph)
        })
        .on('end', () => {
            const areaWidth = cropSelection.attr('width')
            const areaHeight = cropSelection.attr('height')
            const areaX = +cropSelection.attr('x') + +cropArea.translateX
            const areaY = +cropSelection.attr('y') + +cropArea.translateY

            const tFactors = calculateTransformFactors(areaWidth, areaHeight, areaX, areaY, layout.width, layout.height)

            cropSelection.attr('transform', 'translate(0,0)')
                .attr('width', 0)
                .attr('height', 0)
            for (let i=0; i<4; i++) {
                cropOutsiders[i]
                    .attr('width', 0)
                    .attr('height', 0)
            }

            if (areaWidth < 1 || areaHeight < 1) {
                return
            }

            crop(null, graph)
            zoom({ ...tFactors, scaleX: 1, x: -layout.width/2 })
        })

    draggingGround.call(dragger)
}

export const cropGraph = (graphEle, layout, cropArea) => {
    if (!graphEle) return

    const cropSelection = graphEle.select('.crop-selection')
    const cropOutsiders = graphEle.selectAll('.crop-outsider')

    if (!cropSelection || !cropOutsiders) return

    if (cropArea) {
        let boxWidth = cropArea.isFullWidth ? Math.abs(layout.width) : Math.abs(cropArea.currentX)
        let boxHeight = Math.abs(cropArea.currentY)

        const smallLength = 15

        if (boxWidth < smallLength) {
            boxWidth = layout.width
            cropArea.translateX = -cropArea.startX
            cropArea.translateY = cropArea.currentY < 0 ? cropArea.currentY : 0
        } else if (boxHeight < smallLength) {
            boxHeight = layout.height
            cropArea.translateX = cropArea.currentX < 0 ? cropArea.currentX : 0
            cropArea.translateY = -cropArea.startY
        } else {
            cropArea.translateX = cropArea.currentX < 0 ? cropArea.currentX : 0
            cropArea.translateY = cropArea.currentY < 0 ? cropArea.currentY : 0
        }

        cropSelection
            .attr('x', cropArea.startX)
            .attr('y', cropArea.startY)
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('transform', 'translate(' + cropArea.translateX + ',' + cropArea.translateY + ')')

        const areaWidth = Math.round(boxWidth)
        const areaHeight = Math.round(boxHeight)
        const areaX = Math.round(+cropArea.startX + +cropArea.translateX)
        const areaY = Math.round(+cropArea.startY + +cropArea.translateY)

        d3.select(cropOutsiders.nodes()[0])
            .attr('width', areaX)
            .attr('height', layout.height)
            .attr('x', 0)
            .attr('y', 0)
        d3.select(cropOutsiders.nodes()[1])
            .attr('width', layout.width - areaX - areaWidth)
            .attr('height', layout.height)
            .attr('x', areaX + areaWidth)
            .attr('y', 0)
        d3.select(cropOutsiders.nodes()[2])
            .attr('width', areaWidth)
            .attr('height', areaY)
            .attr('x', areaX)
            .attr('y', 0)
        d3.select(cropOutsiders.nodes()[3])
            .attr('width', areaWidth)
            .attr('height', layout.height - areaY - areaHeight)
            .attr('x', areaX)
            .attr('y', areaY + areaHeight)
    } else {
        cropSelection.attr('transform', 'translate(0,0)')
            .attr('width', 0)
            .attr('height', 0)
        for (let i=0; i<4; i++) {
            d3.select(cropOutsiders.nodes()[i])
                .attr('width', 0)
                .attr('height', 0)
        }
    }
}

export const fixOverlappingLabels = (elements, getPosition, space, defaultVisibleIndics = []) => {
    const vis = (_.union([0, elements.size() - 1], defaultVisibleIndics)).sort((i1, i2) => i1 - i2)
    elements.attr('opacity', (d, i, n) => {
        if (vis.includes(i)) {
            return 1
        } else {
            const i1 = _.max(vis.filter((t) => t < i))
            const i2 = _.min(vis.filter((t) => t > i))
            const tx = getPosition(n[i])
            const tx1 = getPosition(n[i1])
            const tx2 = getPosition(n[i2])
            if (tx1 + space < tx && tx + space < tx2) {
                vis.push(i)
                vis.sort((t1, t2) => t1 - t2)
                return 1
            } else {
                return 0
            }
        }
    })
}
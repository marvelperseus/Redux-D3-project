import React, { Component } from 'react'

import { isObjectEmpty } from '../../utils/datatransformer'

class BaseGraph extends Component {
    constructor(props) {
        super(props)
    }

    shouldComponentUpdate() {
        return false
    }

    setGraphBodyElement(el) {
        this.graphBodyElement = el
        this.props.onGraphBodyElementReady(el)
        this.drawGraph()
    }

    setTitleElement(el) {
        this.titleElement = el
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.title) !== JSON.stringify(this.props.title)) {
            this.titleElement.innerHTML = nextProps.title
        }

        if (JSON.stringify(nextProps.group) !== JSON.stringify(this.props.group)) {
            this.drawGraph()
        }

        if (JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)) {
            this.drawGraph()
        }
        
        if (JSON.stringify(nextProps.layout) !== JSON.stringify(this.props.layout)) {
            this.drawGraph()
        }

        if (JSON.stringify(nextProps.zoomFactors) !== JSON.stringify(this.props.zoomFactors) && this.props.zoomGraph) {
            this.props.zoomGraph()
        }
    }

    drawGraph() {
        if (!this.graphBodyElement) return

        while (this.graphBodyElement.firstChild) {
            this.graphBodyElement.removeChild(this.graphBodyElement.firstChild)
        }

        this.props.drawGraph()

        if (this.props.zoomGraph) {
            this.props.zoomGraph()
        }
    }

    render() {
        const { className, title, children } = this.props
        return (
            <div className={'graph' + (className ? ' ' + className : '')}>
                <div className="graph-title" ref={el => this.setTitleElement(el)}>{ title }</div>
                <div className="graph-body" ref={el => this.setGraphBodyElement(el)}></div>
                { children }
            </div>
        )
    }
}

export default BaseGraph

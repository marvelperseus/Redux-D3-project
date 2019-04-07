import React, { Component } from 'react'
import * as d3 from 'd3'
import {
    transformForAreaGraph,
    getLayerNames,
    getStratData,
    getThermalHistoryData,
    getLithoData,
    getAgeTable,
    getUepFormations,
    getUepHiTocInDepth,
    getUepHiTocInAge,
    getUepAreaYield,
    getUepExpulsionSummary,
    getUepSampleIndics,
    getMevProperties,
    getMevFormations
} from '../../utils/datatransformer'

/**
 * FileUpload
 */
class FileUpload extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedFiles : {}
        }
    }

    getGraphType = () => {
        const { group } = this.props
        if (group === 'burial' || group === 'temperature' || group === 'thermal') {
            return 'basin'
        } else if (group === 'uep') {
            return 'uep'
        } else if (group === 'mev') {
            return 'mev'
        }
    }

    /**
     * Handles File upload, parses and sets data into redux
     */
    fileChangedHandler = (event) => {
        let file = event.target.files[0]
        let fileReader = new FileReader()
        fileReader.onloadend = (e) => {
            const graphType = this.getGraphType()
            let selectedFiles = this.state.selectedFiles
            if (graphType === 'basin') {
                // parse JSON data
                let basinData = null
                try {
                    basinData = JSON.parse(fileReader.result)
                    // transform data
                    const transformedAreaData = transformForAreaGraph(basinData)
                    const layerNames = getLayerNames(basinData)
                    const stratData = getStratData(basinData)
                    const thermalHistoryData = getThermalHistoryData(basinData)
                    const lithoData = getLithoData(basinData)
                    const ageData = getAgeTable(basinData)
                    // set into redux
                    this.props.basinSetData({ 
                        lithoData,
                        stratData,
                        transformedAreaData,
                        thermalHistoryData,
                        ageData,
                        layerNames,
                        bm : basinData['bm_result']
                    })
                    const defaultFormation = stratData.find((s) => s.height === d3.max(stratData, (d) => d.height))
                    this.props.basinSelectFormation(defaultFormation)
                    selectedFiles[graphType] = file.name
                    this.setState({ selectedFiles })
                } catch (e) {
                    this.props.basinClearData()
                    selectedFiles[graphType] = null
                    this.setState({ selectedFiles })
                    return
                }
            } else if (graphType === 'uep') {
                // parse JSON data
                let uepData = null
                try {
                    uepData = JSON.parse(fileReader.result)
                    this.props.uepSetData({
                        wellName         : uepData['Well_name'],
                        formations       : getUepFormations(uepData),
                        hiTocInDepth     : getUepHiTocInDepth(uepData),
                        hiTocInAge       : getUepHiTocInAge(uepData),
                        areayield        : getUepAreaYield(uepData),
                        expulsionSummary : getUepExpulsionSummary(uepData),
                        sampleIndics     : getUepSampleIndics(uepData)
                    })
                    selectedFiles[graphType] = file.name
                    this.setState({ selectedFiles })
                } catch (e) {
                    this.props.uepClearData()
                    selectedFiles[graphType] = null
                    this.setState({ selectedFiles })
                    return
                }
            }
            else if (graphType === 'mev') {
                // parse JSON data
                let mevData = null
                try {
                    mevData = JSON.parse(fileReader.result)
                    this.props.mevSetData({
                        title        : mevData['Plot Title'],
                        modelsCount  : Object.keys(mevData['Age']['models']).length,
                        formation    : mevData['Top Formations TVDss'],
                        wellPath     : mevData['Well Path'],
                        age          : mevData['Age'],
                        clayFraction : mevData['Clay Fraction'],
                        properties   : getMevProperties(mevData),
                        formations   : getMevFormations(mevData)
                    })
                    this.props.mevSelectModel({
                        propertyKey : 'Clay Fraction',
                        modelKey    : Object.keys(mevData['Clay Fraction'].models)[0],
                        values      : Object.values(mevData['Clay Fraction'].models)[0]
                    })
                    selectedFiles[graphType] = file.name
                    this.setState({ selectedFiles })
                } catch (e) {
                    this.props.mevClearData()
                    selectedFiles[graphType] = null
                    this.setState({ selectedFiles })
                    return
                }
            }
        }
        fileReader.readAsText(file)
    }
   
    render() {
        return (          
            <div className="graph-upload">
                <input 
                    className="btn" 
                    accept=".csv, .json, .xsl"
                    type="file" 
                    onChange={this.fileChangedHandler}/>
                <div className="file-name">{ this.state.selectedFiles[this.getGraphType()] || 'No chosen' }</div>
            </div>
        )
    }

}

export default FileUpload
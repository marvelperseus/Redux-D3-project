import * as c from '../constants'

import { lithoColor } from './utils'

/**
 * Data Transformer functions.
 */

/**
 * Checks whether a JS object has data
 */
export const isObjectEmpty = (obj) => {
    for (var key in obj) {
    // bail if something is found
        if (obj.hasOwnProperty(key)) {
            return false
        }   
    }
    return true
}

/**
 * Matrix A becomes matrix A'
 * 
 * cost: o(n^2)
 * 
 * @param {*} m the array of values to transpose 
 */
const transpose = m => m[0].map((x, i) => m.map(x => x[i]))

/** Abstracts the age table */
export const getAgeTable = (graphJSON) => graphJSON['bm_result']['event_agetable']

/**
 * Gets the Layer Names from the JSON data.
 * @param {*} indata 
 */
export const getLayerNames = (indata) => {
    const metadata = indata['json_input_file']['basinmodel']['layers']
    return metadata.map((row) => row.LayerName)
}

/**
 * timestep_geometry is 2X2 <== dependent terms
 * timestep_timetable is 1x1 <== independent term
 * 
 * ONE timestep_geometry row PER timestep_timetable
 * EACH timestep_geometry rows HAS timestep_timetable.length rows
 * 
 * For example,
 * timestep_geometry=27 each entry of which has 67 entries:
 * timestep_timetable=67
 * 
 * The timestep_timetable values are ages.
 * timestep_geometry sub entries are depths, the parent entries are measurements of some sort
 * 
 * TODO make this more efficient, if possible.
 * 
 * @param indata the raw JSON from python run
 * @returns [key, data, ageTable] the columns, transformed data and age data, resp.
 */
export const transformForAreaGraph = (indata) => {
    if (!indata || !indata['bm_result'] || !indata['json_input_file']) {
        throw ('incorrect input data format')
    }

    const bmData = indata['bm_result']
    const ageData = bmData['timestep_timetable']
    // depth value by layer: one row per layer
    const depth2by2 = bmData['timestep_geometry']
    
    // transpose: o(n^2) ouch
    // FLIP to create layer depths by age: one row per age
    const depth2by2Transpose = transpose(depth2by2)

    // reconstruct: o(n^2) ouch
    // layer depths by age: one row per age with all layer values and supporting metadata
    let data = []
    depth2by2Transpose.forEach((depthValues, index) => { 
        let jsonData = {}, layerValues = [], maxVal = null, minVal = null
        jsonData['Age'] = ageData[index]
        depthValues.forEach((geoRecord, geoRecordIndex) => {
            if (geoRecordIndex === 0) { // workaround for missing row
                return
            }
            layerValues[geoRecordIndex - 1] = (geoRecord === 0) ? 0 : geoRecord
            if (maxVal < geoRecord) {
                maxVal = geoRecord
            }
            if (minVal > geoRecord) {
                minVal = geoRecord
            }
        })
        jsonData['depths'] = layerValues
        jsonData['maxValue'] = maxVal || 0
        jsonData['minValue'] = minVal || 0
        data.push(jsonData)
    })
    return data
}

export const getThermalHistoryData = (dataset) => {
    return dataset['bm_result']['thermal_history']
}

/**
 * Extrema in layers using Bathy data
 */
export const giveMinMaxTVDSS = (dataset) => {

    const bathy = dataset['bm_result']['timestep_bathy']
    // copy, don't mutate data
    const depth = Object.assign([], dataset['bm_result']['present_day_burial_depth'])
    depth.push(bathy[bathy.length - 1])
   
    let ymin = Math.min(...depth)
    let ymax =  Math.max(...depth)

    const step = 500
    ymax = parseInt(ymax / 1000, 10) * 1000 + 5 * step
    ymin = parseInt(ymin / 1000, 10) * 1000 - 2 * step

    return [ymin, ymax]

}

/**
 * Build layer data
 */
export const getStratData = (dataset) => {
   
    let dataMap = []
    dataset['json_input_file']['basinmodel']['layers'].map( (formation) => {
        const z_bottom = formation['BottomDepth']
        const z_top = formation['TopDepth']

        let layer = {}
        if (z_bottom != z_top) { // skip top layers
            
            layer.height = z_bottom - z_top
            layer.width = 1

            layer.layerName = formation['LayerName']
            layer.bottom = z_bottom
            layer.top = z_top
            layer.topDepth = z_top
            layer.bottomDepth = z_bottom
            layer.age = formation['FinalAge']
            layer.initAge = formation['InitAge']

            dataMap.push(layer)
        }
    })

    return dataMap
}

/**
 * Port of Python code to JS
 * 
 * @param {*} dataset 
 */
export const getLithoData = (dataset) => {

    const xmin = 0
    const xmax = 100
    const inputdata = dataset['json_input_file']
    const litho_correspondance = {
        'salt'                       : 'Evap',
        'limestone_early_diagenesis' : 'CO3', 
        'limestone'                  : 'CO3', 
        'marl'                       : 'CO3', 
        'shale'                      : 'Clay', 
        'sand'                       : 'Qtz', 
        'sandstone'                  : 'Qtz'
    }

    const litho_list = ['salt', 'limestone_early_diagenesis', 'limestone', 'marl', 'shale', 'sand', 'sandstone']
    const litho_lib = inputdata['lithology']

    var patches = [], label = []
    inputdata['basinmodel']['layers'].map( (formation) => {
        let layer = {}

        var z_bottom = formation['BottomDepth']
        var z_top = formation['TopDepth']

        if (z_bottom != z_top) {

            var litho_name = formation['LithologyName']
            var litho_volprop
            if (litho_lib[litho_name]['volumic_proportions']) {
                litho_volprop = litho_lib[litho_name]['volumic_proportions']
            } else {
                litho_volprop = {[litho_name]: 1}
            }

            layer.box_height = z_bottom - z_top
            layer.x = xmin
console.log(litho_volprop)
            litho_list.forEach( (l) => {
                if (litho_volprop[l]) {
                    layer.box_width = litho_volprop[l] * xmax
                    // console.log(layer.x)
                    var polygon = {
                        lowerLeftCoord : [layer.x, z_bottom],
                        width          : layer.box_width,
                        height         : layer.box_height,
                        color          : lithoColor(l)
                    }
                    layer.x = layer.x + layer.box_width
                    patches.push(polygon)
                    label.push(l)
                }
            })
            console.log(patches)
            console.log(label)
        }

    })
			

	// Save of lithology legend
    var litho_handles = [], litho_label = []
    litho_list.forEach( (litho) => {
        //var color = plot_utils.give_litho_rgb_color(litho)
		//p = Patch(facecolor=color, edgecolor='k')
        //litho_handles.append(p)
        if (!litho_label.find((l) => l[0] === litho_correspondance[litho])) {
            litho_label.push([litho_correspondance[litho], lithoColor(litho)])
        }
    })

    return [patches, label, litho_handles, litho_label]
}


export const getUepFormations = (uepData) => {
    let dataMap = []
    for (let formation_name in uepData['formation_description']) {
        const formation = uepData['formation_description'][formation_name]
        const z_bottom = formation['bottom_depth']
        const z_top = formation['top_depth']

        let layer = {}
        if (z_bottom != z_top) { // skip top layers
            layer.layerName = formation_name
            layer.topDepth = formation['top_depth']
            layer.bottomDepth = formation['bottom_depth']
            layer.age = formation['end_age_Ma']
            layer.initAge = formation['start_age_Ma']
            layer.organofacies = formation['organofacies']

            dataMap.push(layer)
        }
    }

    return dataMap
}

export const getUepHiTocInDepth = (uepData) => {
    const rawData = uepData['HI_toc']['depth_mode']
    return {
        index : rawData.depth,
        hiX   : rawData.x_hi_for_depth_axis,
        hiX0  : rawData.x_hi0_for_depth_axis,
        tocX  : rawData.x_toc_for_depth_axis,
        tocX0 : rawData.x_toc0_for_depth_axis
    }
}

export const getUepHiTocInAge = (uepData) => {
    const rawData = uepData['HI_toc']['time_mode']
    return {
        index : rawData.age,
        hiX   : rawData.x_hi_for_age_axis,
        hiX0  : rawData.x_hi0_for_age_axis,
        tocX  : rawData.x_toc_for_age_axis,
        tocX0 : rawData.x_toc0_for_age_axis
    }
}

export const getUepAreaYield = (uepData) => {
    return uepData['area_yield_expelled']
}

export const getUepExpulsionSummary = (uepData) => {
    return uepData['Expulsion_summary']
}

export const getUepSampleIndics = (uepData) => {
    return uepData['sample_description']
}

export const getMevProperties = (mevData) => {
    const propertyKeys = Object.keys(mevData).slice(5)
    const properties = {}
    propertyKeys.forEach((k) => {
        properties[k] = mevData[k]
    })
    
    return properties
}

export const getMevFormations = (mevData) => {
    const topFormationsData = mevData['Top Formations TVDss']
    const ageData = mevData['Age']
    const result = {}
    Object.keys(topFormationsData).slice(1).forEach((modelKey) => {
        let formations = topFormationsData[modelKey]
        let formationKeys = Object.keys(formations)
        let formationValues = Object.values(formations)
        formationKeys.sort((k1, k2) => (formations[k1] - formations[k2] < 0 ? -1 : 1))
        formationValues.sort((v1, v2) => (v1 - v2 < 0 ? -1 : 1))
        result[modelKey] = []
        formationKeys.forEach((formationKey, index) => {
            if (index === formationKeys.length - 1) return
            result[modelKey].push({
                layerName   : formationKey,
                topDepth    : formationValues[index],
                bottomDepth : formationValues[index + 1],
                age         : ageData['models'][modelKey][index],
                initAge     : ageData['models'][modelKey][index]
            })
        })
    })
    return result
}
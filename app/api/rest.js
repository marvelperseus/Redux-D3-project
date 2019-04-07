
import { getHTTPClient } from './util'

const httpClient = getHTTPClient()

import { transformForAreaGraph, getLayerNames, getStratData, isObjectEmpty } from '../utils/datatransformer'

/**
 * Issues an AJAX post to fetch raw data
 * @param path to json data
 */
export const getRawJSON = (path) => {
    return httpClient.get(path)
                .then(response => {
                    if (isObjectEmpty(response.data)) {
                        throw 'No data found for ' + path
                    }
                    // transform response
                    const transformedAreaData = transformForAreaGraph(response.data)
                    const layerNames = getLayerNames(response.data)
                    const stratData = getStratData(response.data)
                    // set into redux
                    return {
                        payload : { 
                            graphJSON : response.data,
                            layerNames,
                            transformedAreaData,
                            stratData
                        }
                    }
                })
                .catch((err) => {
                    return { 
                        error : {
                            message : err.message,
                            status  : err.status
                        }    
                    }
                })
}

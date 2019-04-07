import * as c from '../constants'

export const initialState = {    
    basinData              : {},
    basinFormationSelected : null,
    basinZoomFactors       : [],
    uepData                : {},
    uepFormationSelected   : null,
    uepZoomFactors         : [],
    burialMode             : 'basic',
    uepMode                : 'depth',
    mevData                : {},
    mevMode                : 'standard',
    mevModelSelected       : null,
    mevZoomFactors         : []
}

const appState = (state = initialState, action) => {
   
    // switch on the action type, process accordingly
    switch (action.type) {

    case c.BASIN_SET_DATA:
        return {
            ...state,
            basinData : action.payload
        }

    case c.BASIN_SELECT_FORMATION:
        return {
            ...state,
            basinFormationSelected : action.payload
        }
    
    case c.BASIN_DESELECT_FORMATION:
        return {
            ...state,
            basinFormationSelected : initialState.basinFormationSelected
        }
    
    case c.BASIN_CLEAR_DATA:
        return {
            ...state,
            basinData              : initialState.basinData,
            basinFormationSelected : initialState.basinFormationSelected
        }

    case c.BASIN_ZOOM:
        return {
            ...state,
            basinZoomFactors : [...state.basinZoomFactors, action.payload]
        }
    
    case c.BASIN_ZOOM_CLEAR:
        return {
            ...state,
            basinZoomFactors : initialState.basinZoomFactors
        }

    case c.UEP_SET_DATA:
        return {
            ...state,
            uepData : action.payload
        }

    case c.UEP_SELECT_FORMATION:
        return {
            ...state,
            uepFormationSelected : action.payload
        }
    
    case c.UEP_DESELECT_FORMATION:
        return {
            ...state,
            uepFormationSelected : initialState.uepFormationSelected
        }

    case c.UEP_CLEAR_DATA:
        return {
            ...state,
            uepData              : initialState.uepData,
            uepFormationSelected : initialState.uepFormationSelected
        }
    
    case c.UEP_ZOOM:
        return {
            ...state,
            uepZoomFactors : [...state.uepZoomFactors, action.payload]
        }
    
    case c.UEP_ZOOM_CLEAR:
        return {
            ...state,
            uepZoomFactors : initialState.uepZoomFactors
        }
    
    case c.BURIAL_SET_MODE:
        return {
            ...state,
            burialMode : action.payload
        }
    
    case c.UEP_SET_MODE:
        return {
            ...state,
            uepMode : action.payload
        }

    case c.MEV_SET_DATA:
        return {
            ...state,
            mevData : action.payload
        }

    case c.MEV_CLEAR_DATA:
        return {
            ...state,
            mevData : initialState.mevData
        }
    
    case c.MEV_SET_MODE:
        return {
            ...state,
            mevMode : action.payload
        }

    case c.MEV_SELECT_MODEL:
        return {
            ...state,
            mevModelSelected : action.payload
        }

    case c.MEV_ZOOM:
        return {
            ...state,
            mevZoomFactors : [...state.mevZoomFactors, action.payload]
        }
    
    case c.MEV_ZOOM_CLEAR:
        return {
            ...state,
            mevZoomFactors : initialState.mevZoomFactors
        }

    default:
        return state
    }
}

export default appState
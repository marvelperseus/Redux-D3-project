import * as c from '../constants'

export const basinSetData = (data) => {
    return {
        type    : c.BASIN_SET_DATA,
        payload : data
    }
}

export const basinSelectFormation = (formation) => {
    return {
        type    : c.BASIN_SELECT_FORMATION,
        payload : formation
    }
}

export const basinDeselectFormation = () => {
    return {
        type : c.BASIN_DESELECT_FORMATION
    }
}

export const basinClearData = () => {
    return {
        type : c.BASIN_CLEAR_DATA
    }
}

export const basinZoom = (factor) => {
    return {
        type    : c.BASIN_ZOOM,
        payload : factor
    }
}

export const basinZoomClear = () => {
    return {
        type : c.BASIN_ZOOM_CLEAR
    }
}

export const uepSetData = (data) => {
    return {
        type    : c.UEP_SET_DATA,
        payload : data
    }
}

export const uepSelectFormation = (formation) => {
    return {
        type    : c.UEP_SELECT_FORMATION,
        payload : formation
    }
}

export const uepDeselectFormation = () => {
    return {
        type : c.UEP_DESELECT_FORMATION
    }
}

export const uepClearData = () => {
    return {
        type : c.UEP_CLEAR_DATA
    }
}

export const uepZoom = (factor) => {
    return {
        type    : c.UEP_ZOOM,
        payload : factor
    }
}

export const uepZoomClear = () => {
    return {
        type : c.UEP_ZOOM_CLEAR
    }
}

export const burialSetMode = (factor) => {
    return {
        type    : c.BURIAL_SET_MODE,
        payload : factor
    }
}

export const uepSetMode = (factor) => {
    return {
        type    : c.UEP_SET_MODE,
        payload : factor
    }
}

export const mevSetData = (data) => {
    return {
        type    : c.MEV_SET_DATA,
        payload : data
    }
}

export const mevClearData = () => {
    return {
        type : c.MEV_CLEAR_DATA
    }
}

export const mevSetMode = (factor) => {
    return {
        type    : c.MEV_SET_MODE,
        payload : factor
    }
}

export const mevSelectModel = (model) => {
    return {
        type    : c.MEV_SELECT_MODEL,
        payload : model
    }
}

export const mevZoom = (factor) => {
    return {
        type    : c.MEV_ZOOM,
        payload : factor
    }
}

export const mevZoomClear = () => {
    return {
        type : c.MEV_ZOOM_CLEAR
    }
}
import React from 'react'

import { shallow } from 'enzyme'
import configureStore from 'redux-mock-store'

import GraphHome from '../../app/Components/Graphs/GraphHome'
import FileUpload from '../../app/Components/Graphs/FileUpload'
import StratGraph from '../../app/Components/Graphs/StratGraph'
import BurialGraph from '../../app/Components/Graphs/BurialGraph'
import VerticalMaturityDepth from '../../app/Components/Graphs/VerticalMaturityDepth'
import VerticalTemperatureGraph from '../../app/Components/Graphs/VerticalTemperatureGraph'

import { initialState } from '../../app/reducers'
import { transformForAreaGraph, getLayerNames, getStratData } from '../../app/utils/datatransformer'
import { graphJSON } from '../data/sample-data'

// here it is possible to pass in any middleware if needed into //configureStore
const mockStore = configureStore()

/**
 * Baseline non-Connected component tests using Enzyme.
 * 
 *  graphJSON           : state.graphJSON,
    layerNames          : state.layerNames,
    transformedAreaData : state.transformedAreaData,
    stratData           : state.stratData
 */
describe('The Graph compoments render', () => {

    let store, transformedAreaData, layerNames, stratData
    beforeEach(() => {
        //creates the store with any initial state or middleware needed  

        store = mockStore(initialState)

        console.log(graphJSON.length)
        transformedAreaData = transformForAreaGraph(graphJSON)
        layerNames = getLayerNames(graphJSON)
        stratData = getStratData(graphJSON)
    })

    it('renders the <GraphHome/> component', () => {
        const component = shallow(<GraphHome store={store}
            graphJSON={graphJSON}
            layerNames={layerNames}
            transformedAreaData={transformedAreaData}
            stratData={stratData}
        />).dive()
        expect(component).toExist()
        //expect(component).toMatchSnapshot()
        expect(component.find(<StratGraph />).exists())
        expect(component.find(<BurialGraph/>).exists())
        expect(component.find(<VerticalMaturityDepth/>).exists())
        expect(component.find(<VerticalTemperatureGraph/>).exists())
        expect(component.find(<FileUpload/>).exists())
    })

    it('mount the <BurialGraph/> component', () => {
        const component = mount(<BurialGraph 
                graphJSON={graphJSON}
                layerNames={layerNames}
                transformedAreaData={transformedAreaData}
                stratData={stratData}
                />)
        expect(component).toExist()
    })

    it('mount the <VerticalMaturityDepth/> component', () => {
       
        const component = mount(<VerticalMaturityDepth 
                graphJSON={graphJSON}
                layerNames={layerNames}
                transformedAreaData={transformedAreaData}
                stratData={stratData}
                />)
        expect(component).toExist()
    })

    it('mount the <VerticalTemperatureGraph/> component', () => {
        const component = mount(<VerticalTemperatureGraph 
            graphJSON={graphJSON}
            layerNames={layerNames}
            transformedAreaData={transformedAreaData}
            stratData={stratData}
            />)
        expect(component).toExist()
    })

    it('mounts the <StratGraph/> component', () => {
        const component = mount(<StratGraph 
            graphJSON={graphJSON}
            layerNames={layerNames}
            transformedAreaData={transformedAreaData}
            stratData={stratData}
            />)
        expect(component).toExist()
    })

})


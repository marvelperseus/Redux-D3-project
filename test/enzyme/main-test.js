import React from 'react'

import { shallow } from 'enzyme'

import Main from '../../app/Components/Main'
import SideNav from '../../app/Components/SideNav'
import Nav from '../../app/Components/Nav'
import ErrorDisplay from '../../app/Components/ErrorDisplay'

/**
 * Baseline non-Connected component tests using Enzyme.
 */
describe('The top level component render', () => {

    it('renders the <Main/> component', () => {
        const component = shallow(<Main/>)
        expect(component).toExist()
        expect(component.find('#hummingbird-app-main')).toHaveLength(1)
        expect(component.find(<SideNav/>).exists())
        expect(component.find(<Nav/>).exists())
        expect(component).toMatchSnapshot()
    })

    it('renders the <ErrorDisplay/> component', () => {
        const component = shallow(
        <ErrorDisplay 
            errorClass=''
            error={null}
            errorInfo={null}
            />)
        expect(component).toHaveLength(1)
    })


})


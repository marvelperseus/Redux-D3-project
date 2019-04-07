import React, { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * React component errors.
 */
class ErrorDisplay extends Component {
    
    render() {
        const { errorClass, error, errorInfo} = this.props
        return (
            <div className={errorClass}>
                <h2>Error</h2>
                <p className='color-red'>
                    {error && error.toString()}
                </p>
                <div>Component Stack Error Details:</div>
                <p className="small">
                {errorInfo && errorInfo.componentStack}
                </p>
            </div>
        )
    }
}

ErrorDisplay.propTypes = {
    errorClass : PropTypes.string,
    error      : PropTypes.object,
    errorInfo  : PropTypes.object
}

export default ErrorDisplay
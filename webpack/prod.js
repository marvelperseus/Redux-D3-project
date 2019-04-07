'use strict'

const webpack = require('webpack')
const Merge = require('webpack-merge')
let makeWebpackConfig = require('./makeConfig')

module.exports = Merge(makeWebpackConfig, {
    output : {
        publicPath : './'
    },
    plugins : [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV' : JSON.stringify('production')
        })
    ]
})
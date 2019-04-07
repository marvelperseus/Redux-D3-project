'use strict'

const dotenv = require('dotenv')
const path = require('path')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')


process.traceDeprecation = true
process.noDeprecation = true

dotenv.config()
const exposed = [
]
const exposedEnvironment = {}
exposed.forEach(i => {
    console.log(process.env[i])
    exposedEnvironment[i] = JSON.stringify(process.env[i])
})

module.exports = {
    entry : {
        app : [
            'babel-polyfill',
            'react-hot-loader/patch',
            // activate HMR for React
            // bundle the client for hot reloading
            // only- means to only hot reload for successful updates
            path.resolve(__dirname, '../app/index.js')
        ]
    },
    resolve : {
        extensions : ['*', '.js', '.jsx']
    },
    performance : {
        hints : process.env.NODE_ENV === 'production' ? 'warning' : false
    },
    output : {
        filename          : 'app/[name].min.js',
        path              : path.resolve(__dirname, '../build'),
        sourceMapFilename : '[name].map'
    },
    module : {
        rules : [
            {
                test    : /\.(js|jsx)$/,
                exclude : /node_modules/,
                use     : ['babel-loader', 'eslint-loader']
            },
            {
                test : /\.css$/,
                use  : ['style-loader', 'css-loader']
            },
            {
                test : /\.scss$/,
                use  : [
                    {
                        loader : 'style-loader'
                    },
                    {
                        loader : 'css-loader'
                    },
                    {
                        loader : 'sass-loader'
                    }
                ]
            }
        ]
    },
    plugins : [
        new webpack.DefinePlugin({
            'process.env' : exposedEnvironment
        }),
        new CopyWebpackPlugin([
            // Copy directory contents to {output}/to/directory/
            { from: 'public/data', to: 'data' }
        ]), // build optimization plugins
        new HtmlWebpackPlugin({
            filename : path.resolve(__dirname, '../build/index.html'),
            template : path.resolve(__dirname, '../public/index.html'),
            minify   : {
                removeComments                : true,
                collapseWhitespace            : true,
                removeRedundantAttributes     : true,
                useShortDoctype               : true,
                removeEmptyAttributes         : true,
                removeStyleLinkTypeAttributes : true,
                keepClosingSlash              : true,
                minifyJS                      : true,
                minifyCSS                     : true,
                minifyURLs                    : true
            }
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename      : '[name].css',
            chunkFilename : '[id].css'
        }),
        new webpack.ProvidePlugin({
            React    : 'react',
            ReactDOM : 'react-dom'
        }),
        new CompressionPlugin({  
            asset     : '[path].gz[query]',
            algorithm : 'gzip',
            test      : /\.js$|\.css$|\.html$/,
            minRatio  : 1024
        })
    ]
}

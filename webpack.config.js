'use strict';
const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'none',
    context: __dirname,
    entry: {
        index: './www/index.js'
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname , 'dist', 'www'),
        publicPath: '/xc-score/'
    },
    resolve: {
        modules: ['node_modules'],
        alias: {
            jquery: 'jquery/dist/jquery.min.js',
            handlebars: 'handlebars/dist/handlebars.min.js',
            jquery_typeahead: 'jquery-typeahead/dist/jquery.typeahead.min.js'
        }
    },
    devtool: 'inline-source-map',
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};
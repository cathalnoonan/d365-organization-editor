const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/scripts/organizationeditor.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'organizationeditor.bundle.js'
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                presets: [
                    '@babel/preset-env'
                ]
            }
        }]
    },
    resolve: {
        modules: [
            'node_modules'
        ],
        extensions: [
            '.js'
        ]
    },
    devtool: 'none',
    target: 'web'
};
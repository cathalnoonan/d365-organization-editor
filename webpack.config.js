const path = require('path')

module.exports = (env, argv) => ({
    target: ['web', 'es5'],
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'organizationeditor.js',
        sourceMapFilename: 'organizationeditor-js.map',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            }
        ]
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.ts']
    },
    externals: {
        axios: 'axios',
    }
})
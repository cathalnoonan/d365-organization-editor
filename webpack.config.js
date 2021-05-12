const path = require('path')

module.exports = {
    mode: 'production',
    target: ['web', 'es2015'],
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'main.ts'),
    output: {
        path: path.resolve(__dirname, 'temp'),
        filename: 'organizationeditor.js',
        sourceMapFilename: 'organizationeditor.js.map',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    configFile: 'tsconfig.json',
                },
            }
        ]
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.ts']
    }
}
const path = require('path')

module.exports = {
    //mode: 'production',
    mode: 'development',
    target: ['web', 'es2015'],
    devtool: 'inline-source-map',
    entry: path.resolve(__dirname, 'src', 'index.ts'),
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
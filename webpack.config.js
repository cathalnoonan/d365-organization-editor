const path = require('path');

function createWebpackConfig(argv) {
    const isDevelopment = argv.mode === 'development';

    const config = {
        devtool: isDevelopment ? 'inline-source-map' : 'source-map',
        entry: './src/scripts/organizationeditor.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'organizationeditor.bundle.js',
            sourceMapFilename: 'organizationeditor.bundle.js.map',
        },
        module: {
            rules: [
                {
                    test: /\.js?$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            ]
        },
        resolve: {
            modules: ['node_modules'],
            extensions: ['.js']
        },
        target: 'web',
    }

    return config;
}

module.exports = (env, argv) => createWebpackConfig(argv);
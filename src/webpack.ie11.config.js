const path = require('path')

const config = require('./webpack.config')

// Overrides specific for IE:11
config.target = ['web', 'es5']
config.output = {
    path: path.resolve(__dirname, 'temp'),
    filename: 'organizationeditor.es5.js',
    sourceMapFilename: 'organizationeditor.es5.js.map',
}
config.module.rules[0].options.configFile = 'tsconfig.ie11.json'


module.exports = config
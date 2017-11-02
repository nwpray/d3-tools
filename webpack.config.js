var path = require('path');
var Webpack = require('webpack');

module.exports = {
    entry: './index.js',
    output:{
        path: path.resolve('dist'),
        filename: 'd3-tools.min.js',
        library: 'd3-tools',
        libraryTarget: "umd",
        umdNamedDefine: true
    },
    resolve:{
        extensions:['.js']
    },
    module:{
        rules:[
            {
                test:/\.js$/,
                use:['babel-loader']
            }
        ]
    },
    plugins:[
        new Webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            comments: false,
            minimize: true
        })
    ]
};

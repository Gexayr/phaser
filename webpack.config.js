const path = require('path');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    mode: 'development',
    devServer: {
        // open: true,
        port: 8080,
        static: {
            directory: path.join(__dirname, '/'), // rather than contentBase
            watch: true,
        },
    },
};
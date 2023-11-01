const path = require('path');

module.exports = {
    resolve: {
        extensions: ['.ts', '.js'],
    },

    mode: 'development',

    entry: {
        soakTest: './src/tests/soak.test.ts',
        seedCrocs: './src/tests/create-crocs.seed.ts',
    },

    output: {
        path: path.resolve(__dirname, 'dist'),

        libraryTarget: 'commonjs',

        filename: '[name].bundle.js',
    },

    module: {
        rules: [
            {
                test: /\.ts$/,

                // exclude: /node_modules/,

                loader: 'babel-loader',

                options: {
                    presets: [['@babel/typescript']],
                    plugins: ['@babel/plugin-transform-class-properties', '@babel/plugin-transform-object-rest-spread'],
                },
            },
        ],
    },

    stats: {
        colors: true,
    },

    // target: 'web',

    externals: /k6(\/.*)?/,

    devtool: 'source-map',
};

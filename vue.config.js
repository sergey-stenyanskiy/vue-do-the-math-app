const path = require("path");

module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  indexPath: 'index.html',

  pages: {
    index: {
      entry: './src/index.ts',
      filename: 'index.html',
      title: 'do-the-math-app'
    }
  },

  configureWebpack: {
    devtool: 'eval-source-map',
    output: {
      devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]',
      devtoolModuleFilenameTemplate: (info) => {
        const resPath = path.normalize(info.resourcePath);
        const isVue = resPath.match(/\.vue$/) || resPath.match(/\.ts$/);
        const isSource = info.query === "?vue&type=script&lang=ts" || info.query === '';

        const generated = `webpack-generated:///${resPath}?${info.hash}`;
        const vuesource = `sources://${info.resourcePath}`;

        return isVue && isSource ? vuesource : generated;
      }
    },
    module: {
      rules: [
        {
          test: /\.pug$/i,
          loader: "pug-plain-loader"
        },
      ]
    }
  },

  chainWebpack: (config) => {
    config.module
      .rule('svg-sprite')
      .use('svgo-loader')
      .loader('svgo-loader')
  }
};

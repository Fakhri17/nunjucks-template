module.exports = {
  paths: {
    public_dir: 'dist',
    assets_dir: 'src/assets',
    libs_dir: 'src/libs',
    src_dir: 'src',
    node_modules_dir: 'node_modules',
  },
  sass: {
    // Determines the style of the final CSS files
    // Values: ['nested', 'expanded', 'compact', 'compressed']
    outputStyle: 'compressed'
  },
  js: {
    // Determines if the final JS files would be compressed
    // Values: [true, false]
    doCompress: true,
    // Determines if the .js source file would be included after compression
    // doCompress must be true
    // Values: [true, false]
    doKeepSource: true,
  },
};
/**
 * This config is used to build the bundled ts file for the library.
 */
const typescript = require('rollup-plugin-typescript2');
const dts = require('rollup-plugin-dts');

module.exports = [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/iaptic.bundled.ts',
      format: 'es'
    },
    plugins: [
      typescript({
        typescript: require('typescript'),
        compilerOptions: {
          declaration: false,
          module: "esnext",
        },
        include: ["src/**/*"],
        exclude: ["**/__tests__/**"]
      })
    ]
  }
]; 
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'IapticJS',
      globals: {
        '@stripe/stripe-js': 'Stripe'
      },
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
  external: [...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
      declaration: true,
      declarationDir: 'dist/types',
      declarationMap: true,
      exclude: ['**/__tests__/**', '**/*.test.ts']
    })
  ]
};

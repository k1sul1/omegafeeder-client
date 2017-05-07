import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';

export default {
  entry: 'src/main.js',
  format: 'umd',
  moduleName: 'omegafeeder-client',
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    globals(),
    builtins(),
    buble({

    })
  ],
  dest: 'build/bundle.js'
};

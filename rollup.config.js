import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import typescript from "@rollup/plugin-typescript";
import { terser } from 'rollup-plugin-terser';
import { browser, module } from './package.json';

const config = {
  input: module,
  output: {
    file: browser,
    format: 'umd',
    name: 'FpWizard',
  },
  plugins: [
    resolve(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    typescript({ tsconfig: "./tsconfig.json" }),
    commonjs(),
    terser(),
  ],
  external: ["react", "react-dom"]
};

// eslint-disable-next-line import/no-default-export
export default config;
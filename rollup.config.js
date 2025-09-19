import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import builtins from 'builtin-modules';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';


const rollupConfig = {
	input: 'index.mjs',
	plugins: [
		commonjs(),
		nodeResolve({
			preferBuiltins: false,
		}),
		json(),
		esbuild({
			minifyIdentifiers: true,
			minifySyntax: true,
			legalComments: 'none',
		}),
	],
	external: builtins,
	output: {
		format: 'cjs',
		file: 'dist/index.js',
	},
};

export default rollupConfig;

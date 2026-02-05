import typescript from "rollup-plugin-typescript2";
import del from "rollup-plugin-delete";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import * as sass from 'sass-embedded';
import postcss from "rollup-plugin-postcss";
import { visualizer } from 'rollup-plugin-visualizer';

export default {
    input: "src/index.ts",
    output: [
        {
            file: "lib/index.cjs",
            format: "cjs"
        },
        {
            file: "lib/index.esm.js",
            format: "esm"
        },
    ],
    onwarn(warning, warn) {
        // If it's a circular dependency and inside node_modules, ignore it
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('node_modules')) {
            return;
        }
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return;
        }
        warn(warning);
    },
    plugins: [
        del({ targets: ["lib/*"]}),
        typescript({ useTsconfigDeclarationDir: true }),
        resolve(),
        commonjs(),
        postcss({
            extract: 'styles.css',
            minimize: true,
            use: [['sass', {
                implementation: sass, 
                silenceDeprecations: ['legacy-js-api']
            }]],
        }),
        visualizer({
            filename: 'vector-sigma-bundle-analysis.html',
            open: true,
        }),
    ],
    external: ['react', 'react-dom']
}
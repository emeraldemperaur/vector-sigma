import typescript from "rollup-plugin-typescript2";
import del from "rollup-plugin-delete";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
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
    plugins: [
        del({ targets: ["lib/*"]}),
        typescript({ useTsconfigDeclarationDir: true }),
        resolve(),
        commonjs(),
        postcss({
            extract: true,
            minimize: true
        }),
        visualizer({
            filename: 'vector-sigma-bundle-analysis.html',
            open: true,
        }),
    ],
    external: ['react', 'react-dom']
}
import typescript from "rollup-plugin-typescript2";
import del from "rollup-plugin-delete";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import * as sass from 'sass-embedded';
import postcss from "rollup-plugin-postcss";
import { visualizer } from 'rollup-plugin-visualizer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const externalPackages = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
];

const makeExternalPredicate = (id) => {
    return externalPackages.some(pkgName => id === pkgName || id.startsWith(`${pkgName}/`));
};

export default [
    {
        input: "src/index.ts",
        output: [
            { file: "lib/index.cjs", format: "cjs" },
            { file: "lib/index.esm.js", format: "esm" },
        ],
        external: makeExternalPredicate,
        onwarn(warning, warn) {
            if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('node_modules')) return;
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
            if (warning.code === 'THIS_IS_UNDEFINED') return;
            warn(warning);
        },
        plugins: [
            del({ targets: ["lib/*"]}),
            typescript({ useTsconfigDeclarationDir: true }),
            resolve(),
            commonjs(),
            postcss({ extract: false, inject: true, minimize: true, use: [['sass', { implementation: sass, silenceDeprecations: ['legacy-js-api'] }]] }),
            visualizer({ filename: 'vector-sigma-bundle-analysis.html', open: true }),
        ]
    },
    {
        input: "src/index.ts",
        output: {
            file: "lib/index.umd.js",
            format: "umd",
            name: "VectorSigma",
            globals: {
                'react': 'React',
                'react-dom': 'ReactDOM',
                'formik': 'Formik',
                'yup': 'Yup'
            }
        },
        external: ['react', 'react-dom', 'formik', 'yup'],
        onwarn(warning, warn) {
            if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('node_modules')) return;
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
            if (warning.code === 'THIS_IS_UNDEFINED') return;
            warn(warning);
        },
        plugins: [
            typescript({ useTsconfigDeclarationDir: true }),
            resolve({ browser: true }), 
            commonjs(),
            postcss({ extract: false, inject: true, minimize: true, use: [['sass', { implementation: sass, silenceDeprecations: ['legacy-js-api'] }]] }),
        ]
    }
];
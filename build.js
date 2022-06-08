import { copy } from 'esbuild-plugin-copy';
import * as esbuild from "esbuild";

esbuild.build({
    entryPoints: ['src/index.js', 'src/settings.js'],
    bundle: true,
    outdir: "build",
    minify: true,
    plugins: [
        copy({
            assets: {
                from: ['./public/*', 'manifest.json'],
                to: ['./build'],
            }
        })
    ]
}).catch(() => process.exit(1));


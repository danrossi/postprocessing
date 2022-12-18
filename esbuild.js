import { createRequire } from "module";
import { glsl } from "esbuild-plugin-glsl";
import tsPaths from "esbuild-ts-paths";
import esbuild from "esbuild";
import glob from "tiny-glob";

const require = createRequire(import.meta.url);
const pkg = require("./package");
const minify = process.argv.includes("-m");
const watch = process.argv.includes("-w");
const plugins = [glsl({ minify }), tsPaths()];
const external = ["three", "spatial-controls", "tweakpane"];
const date = new Date();
const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date.toDateString()}
 * ${pkg.homepage}
 * Copyright 2015-${date.getFullYear()} ${pkg.author.name}
 * @license ${pkg.license}
 */`;

// Library

await esbuild.build({
	entryPoints: await glob("src/**/worker.ts"),
	outExtension: { ".js": ".txt" },
	outdir: "temp",
	target: "es6",
	logLevel: "info",
	format: "iife",
	bundle: true,
	minify,
	watch
}).catch(() => process.exit(1));

await esbuild.build({
	entryPoints: ["src/index.ts"],
	outfile: `dist/${pkg.name}.js`,
	banner: { js: banner },
	logLevel: "info",
	format: "esm",
	bundle: true,
	external,
	plugins
}).catch(() => process.exit(1));

// Manual

await esbuild.build({
	entryPoints: ["manual/assets/js/libs/vendor.ts"],
	outdir: "manual/assets/js/dist/libs",
	globalName: "VENDOR",
	target: "es6",
	logLevel: "info",
	format: "iife",
	bundle: true,
	minify
}).catch(() => process.exit(1));

await esbuild.build({
	entryPoints: ["manual/assets/js/src/index.ts"]
		.concat(await glob("manual/assets/js/src/demos/*.ts")),
	outdir: "manual/assets/js/dist",
	logLevel: "info",
	format: "iife",
	target: "es6",
	bundle: true,
	external,
	plugins,
	minify,
	watch
}).catch(() => process.exit(1));

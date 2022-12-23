import { createRequire } from "module";
import { glsl } from "esbuild-plugin-glsl";
import alias from "esbuild-plugin-alias";
import esbuild from "esbuild";
import glob from "tiny-glob";
import path from "path";
import url from "url";

//#region Values

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const require = createRequire(import.meta.url);
const pkg = require("./package");
const minify = process.argv.includes("-m");
const watch = process.argv.includes("-w");
const external = ["three", "spatial-controls", "tweakpane"];
const date = new Date();

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date.toDateString()}
 * ${pkg.homepage}
 * Copyright 2015-${date.getFullYear()} ${pkg.author.name}
 * @license ${pkg.license}
 */`;

const plugins = [
	glsl({ minify }),
	alias({
		"postprocessing": path.resolve(__dirname, "./src"),
		"temp": path.resolve(__dirname, "./temp")
	})
];

//#endregion

//#region Library

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

//#endregion

//#region Manual

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

//#endregion

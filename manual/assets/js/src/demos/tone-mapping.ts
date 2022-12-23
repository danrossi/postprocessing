import {
	CubeTexture,
	CubeTextureLoader,
	FogExp2,
	LoadingManager,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	EffectPass,
	GeometryPass,
	RenderPipeline,
	ToneMappingEffect,
	ToneMappingMode
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "../utils/CameraUtils.js";
import { FPSMeter } from "../utils/FPSMeter.js";
import { toRecord } from "../utils/ArrayUtils.js";
import * as Domain from "../objects/Domain.js";

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	const path = document.baseURI + "img/textures/skies/sunset/";
	const format = ".png";
	const urls = [
		path + "px" + format, path + "nx" + format,
		path + "py" + format, path + "ny" + format,
		path + "pz" + format, path + "nz" + format
	];

	return new Promise<Map<string, unknown>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(urls, (t) => {

			t.encoding = sRGBEncoding;
			assets.set("sky", t);

		});

	});

}

window.addEventListener("load", () => void load().then((assets) => {

	// Renderer

	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false
	});

	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	renderer.physicallyCorrectLights = true;
	renderer.outputEncoding = sRGBEncoding;

	const container = document.querySelector(".viewport") as HTMLElement;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.setSensitivity(2.2);
	settings.rotation.setDamping(0.05);
	settings.translation.setDamping(0.1);
	controls.setPosition(0, 0, 1);
	controls.lookAt(0, 0, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.fog = new FogExp2(0x373134, 0.06);
	scene.background = assets.get("sky") as CubeTexture;
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	// Post Processing

	const effect = new ToneMappingEffect({
		blendFunction: BlendFunction.NORMAL,
		mode: ToneMappingMode.REINHARD2_ADAPTIVE,
		resolution: 256,
		whitePoint: 16.0,
		middleGrey: 0.6,
		minLuminance: 0.01,
		averageLuminance: 0.01,
		adaptationRate: 1.0
	});

	const pipeline = new RenderPipeline(renderer);
	const effectPass = new EffectPass(effect);
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(effectPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const adaptiveLuminanceMaterial = effect.adaptiveLuminanceMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(renderer, "toneMappingExposure", { min: 0, max: 2, step: 1e-3 });
	folder.addInput(effect, "mode", { options: ToneMappingMode });

	let subfolder = folder.addFolder({ title: "Reinhard2" });
	subfolder.addInput(effect, "whitePoint", { min: 1, max: 20, step: 1e-2 });
	subfolder.addInput(effect, "middleGrey", { min: 0, max: 1, step: 1e-4 });
	subfolder.addInput(effect, "averageLuminance", { min: 1e-4, max: 1, step: 1e-3 });
	subfolder = subfolder.addFolder({ title: "Adaptive" });
	subfolder.addInput(effect, "resolution", {
		options: toRecord([64, 128, 256, 512]),
		label: "resolution"
	});

	subfolder.addInput(adaptiveLuminanceMaterial, "minLuminance", { min: 0, max: 3, step: 1e-3 });
	subfolder.addInput(adaptiveLuminanceMaterial, "adaptationRate", { min: 0, max: 3, step: 1e-3 });

	folder.addInput(effectPass, "dithering");
	folder.addInput(effect.blendMode.opacity, "value", { label: "opacity", min: 0, max: 1, step: 0.01 });
	folder.addInput(effect.blendMode, "blendFunction", { options: BlendFunction });

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp: number): void {

		fpsMeter.update(timestamp);
		controls.update(timestamp);
		pipeline.render();
		requestAnimationFrame(render);

	});

}));

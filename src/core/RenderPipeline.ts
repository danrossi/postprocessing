import { Vector2, WebGLRenderer } from "three";
import { Log, Resolution, Timer } from "../utils";
import { BufferManager } from "./BufferManager";
import { Disposable } from "./Disposable";
import { Renderable } from "./Renderable";
import { Resizable } from "./Resizable";
import { Pass } from "./Pass";

const v = new Vector2();

/**
 * A render pipeline that can be used to group and run passes.
 */

export class RenderPipeline implements Disposable, Renderable, Resizable {

	/**
	 * A shared buffer manager.
	 */

	private static readonly bufferManager = new BufferManager();

	/**
	 * The current renderer.
	 */

	private _renderer: WebGLRenderer | null;

	/**
	 * A list of passes.
	 */

	private passes: Pass[];

	/**
	 * A timer.
	 */

	readonly timer: Timer;

	/**
	 * The current resolution.
	 *
	 * @see {@link updateStyle}
	 */

	readonly resolution: Resolution;

	/**
	 * Determines whether the style of the canvas should be updated when the resolution is changed. Default is `true`.
	 */

	updateStyle: boolean;

	/**
	 * Determines whether the last pass should automatically render to screen. Default is `true`.
	 */

	autoRenderToScreen: boolean;

	/**
	 * Constructs a new render pipeline.
	 *
	 * @param renderer - A renderer.
	 */

	constructor(renderer: WebGLRenderer | null = null) {

		this._renderer = renderer;
		this.passes = [];
		this.timer = new Timer();

		this.resolution = new Resolution();
		this.resolution.addEventListener("change", () => this.onResolutionChange());

		this.updateStyle = true;
		this.autoRenderToScreen = true;

	}

	/**
	 * The renderer.
	 */

	get renderer(): WebGLRenderer | null {

		return this._renderer;

	}

	set renderer(value: WebGLRenderer | null) {

		this._renderer = value;

		for(const pass of this.passes) {

			pass.renderer = value;

		}

		if(value !== null) {

			// Update the render resolution.
			this.onResolutionChange();

		}

	}

	/**
	 * Registers a pass.
	 *
	 * @param pass - The pass.
	 */

	private registerPass(pass: Pass) {

		if(this.renderer !== null) {

			this.renderer.getDrawingBufferSize(v);
			pass.resolution.setBaseSize(v.width, v.height);
			pass.renderer = this.renderer;

		}

		pass.timer = this.timer;

	}

	/**
	 * Unregisters a pass.
	 *
	 * @param pass - The pass.
	 */

	private unregisterPass(pass: Pass) {

		pass.renderer = null;
		pass.timer = null;

	}

	/**
	 * Adds a pass.
	 *
	 * @param pass - The pass.
	 */

	addPass(pass: Pass) {

		this.registerPass(pass);
		this.passes.push(pass);

	}

	/**
	 * Removes a pass.
	 *
	 * @param pass - The pass.
	 */

	removePass(pass: Pass): void {

		const passes = this.passes;
		const index = passes.indexOf(pass);
		const exists = (index !== -1);
		const removed = exists && (passes.splice(index, 1).length > 0);

		if(removed) {

			this.unregisterPass(pass);

		}

	}

	/**
	 * Removes all passes.
	 */

	removeAllPasses(): void {

		for(const pass of this.passes) {

			this.unregisterPass(pass);

		}

		this.passes = [];

	}

	/**
	 * Renders this pipeline.
	 *
	 * This method should be called once per frame via `requestAnimationFrame`.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
	 * @param timestamp - The current time in milliseconds.
	 */

	render(timestamp?: number): void {

		if(this.renderer === null) {

			return;

		}

		this.timer.update(timestamp);

		for(const pass of this.passes) {

			if(pass.enabled) {

				pass.render();

			}

		}

	}

	/**
	 * Handles resolution change events.
	 *
	 * @param resolution - The resolution.
	 */

	private onResolutionChange(resolution = this.resolution): void {

		if(this.renderer === null) {

			Log.debug("Unable to update the render size because the renderer is null");
			return;

		}

		const width = resolution.width;
		const height = resolution.height;
		const logicalSize = this.renderer.getSize(v);

		if(logicalSize.width !== width || logicalSize.height !== height) {

			this.renderer.setSize(width, height, this.updateStyle);

		}

		// The drawing buffer size takes the device pixel ratio into account.
		const effectiveSize = this.renderer.getDrawingBufferSize(v);

		for(const pass of this.passes) {

			pass.resolution.setBaseSize(effectiveSize.width, effectiveSize.height);

		}

	}

	/**
	 * Sets the render size.
	 *
	 * @param width - The width.
	 * @param height - The height.
	 * @param updateStyle - Whether the style of the canvas should be updated. Default is `true`.
	 */

	setSize(width: number, height: number, updateStyle = true): void {

		this.updateStyle = updateStyle;
		this.resolution.setBaseSize(width, height);

	}

	dispose(): void {

		for(const pass of this.passes) {

			pass.dispose();

		}

		this.removeAllPasses();
		this.timer.dispose();

		RenderPipeline.bufferManager.dispose();

	}

}

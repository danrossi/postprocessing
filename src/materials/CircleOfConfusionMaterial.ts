import { NoBlending, OrthographicCamera, PerspectiveCamera, ShaderMaterial, Texture, Uniform, Vector2 } from "three";
import { orthographicDepthToViewZ, viewZToOrthographicDepth } from "../utils";

import fragmentShader from "./glsl/circle-of-confusion.frag";
import vertexShader from "./glsl/common.vert";

/**
 * A circle of confusion shader material.
 */

export class CircleOfConfusionMaterial extends ShaderMaterial {

	/**
	 * Constructs a new circle of confusion material.
	 */

	constructor() {

		super({
			name: "CircleOfConfusionMaterial",
			uniforms: {
				depthBuffer: new Uniform(null),
				focusDistance: new Uniform(0.0),
				focusRange: new Uniform(0.0),
				cameraParams: new Uniform(new Vector2(0.3, 1000))
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

	}

	/**
	 * The current near plane setting.
	 */

	private get near(): number {

		return this.uniforms.cameraNear.value;

	}

	/**
	 * The current far plane setting.
	 */

	private get far(): number {

		return this.uniforms.cameraFar.value;

	}

	/**
	 * The depth buffer.
	 */

	set depthBuffer(value: Texture) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The focus distance. Range: [0.0, 1.0].
	 */

	get focusDistance(): number {

		return this.uniforms.focusDistance.value;

	}

	set focusDistance(value: number) {

		this.uniforms.focusDistance.value = value;

	}

	/**
	 * The focus distance in world units.
	 */

	get worldFocusDistance(): number {

		return -orthographicDepthToViewZ(this.focusDistance, this.near, this.far);

	}

	set worldFocusDistance(value: number) {

		this.focusDistance = viewZToOrthographicDepth(-value, this.near, this.far);

	}

	/**
	 * The focus range. Range: [0.0, 1.0].
	 */

	get focusRange(): number {

		return this.uniforms.focusRange.value;

	}

	set focusRange(value: number) {

		this.uniforms.focusRange.value = value;

	}

	/**
	 * The focus range in world units.
	 */

	get worldFocusRange(): number {

		return -orthographicDepthToViewZ(this.focusRange, this.near, this.far);

	}

	set worldFocusRange(value: number) {

		this.focusRange = viewZToOrthographicDepth(-value, this.near, this.far);

	}

	/**
	 * Copies the settings of the given camera.
	 *
	 * @param camera - A camera.
	 */

	copyCameraSettings(camera: OrthographicCamera | PerspectiveCamera) {

		const cameraParams = this.uniforms.cameraParams.value as Vector2;
		cameraParams.x = camera.near;
		cameraParams.y = camera.far;

		if(camera instanceof PerspectiveCamera) {

			this.defines.PERSPECTIVE_CAMERA = "1";

		} else {

			delete this.defines.PERSPECTIVE_CAMERA;

		}

		this.needsUpdate = true;

	}

}

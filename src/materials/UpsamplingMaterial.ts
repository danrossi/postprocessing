import { NoBlending, ShaderMaterial, Texture, Uniform, Vector2 } from "three";
import { Resizable } from "../core";

import fragmentShader from "./glsl/convolution.upsampling.frag";
import vertexShader from "./glsl/convolution.upsampling.vert";

/**
 * An upsampling material.
 *
 * Based on an article by Fabrice Piquet.
 * @see https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 */

export class UpsamplingMaterial extends ShaderMaterial implements Resizable {

	/**
	 * Constructs a new upsampling material.
	 */

	constructor() {

		super({
			name: "UpsamplingMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				supportBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				radius: new Uniform(0.85)
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
	 * The input buffer.
	 */

	set inputBuffer(value: Texture) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * A support buffer.
	 */

	set supportBuffer(value: Texture) {

		this.uniforms.supportBuffer.value = value;

	}

	/**
	 * The blur radius.
	 */

	get radius(): number {

		return this.uniforms.radius.value;

	}

	set radius(value: number) {

		this.uniforms.radius.value = value;

	}

	setSize(width: number, height: number): void {

		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);

	}

}

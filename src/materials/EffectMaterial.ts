import {
	NoBlending,
	OrthographicCamera,
	PerspectiveCamera,
	ShaderMaterial,
	Texture,
	Uniform,
	Vector3,
	Vector4
} from "three";

import { Resizable } from "../core";
import { EffectShaderSection, EffectShaderSection as Section, WebGLExtension } from "../enums";
import { EffectShaderData } from "../utils";

import fragmentTemplate from "./glsl/effect.frag";
import vertexTemplate from "./glsl/effect.vert";

/**
 * An effect material for compound shaders. Supports dithering.
 */

export class EffectMaterial extends ShaderMaterial implements Resizable {

	/**
	 * Constructs a new effect material.
	 */

	constructor() {

		super({
			name: "EffectMaterial",
			defines: {
				ENCODE_OUTPUT: "1"
			},
			uniforms: {
				gBuffer: new Uniform(null),
				resolution: new Uniform(new Vector4()),
				cameraParams: new Uniform(new Vector3(0.3, 1000.0, 1.0)),
				time: new Uniform(0.0)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false
		});

	}

	/**
	 * The input buffer.
	 */

	set inputBuffer(value: Texture | null) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Sets the shader data.
	 *
	 * @param data - The shader data.
	 * @return This material.
	 */

	setShaderData(data: EffectShaderData): this {

		return this.setShaderParts(data.shaderParts)
			.setDefines(data.defines)
			.setUniforms(data.uniforms)
			.setExtensions(data.extensions);

	}

	/**
	 * Sets the shader parts.
	 *
	 * @param shaderParts - A collection of shader code snippets. See {@link EffectShaderSection}.
	 * @return This material.
	 */

	private setShaderParts(shaderParts: Map<EffectShaderSection, string | null>): this {

		this.fragmentShader = fragmentTemplate
			.replace(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) ?? "")
			.replace(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV) ?? "")
			.replace(Section.FRAGMENT_MAIN_IMAGE, shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) ?? "");

		this.vertexShader = vertexTemplate
			.replace(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD) ?? "")
			.replace(Section.VERTEX_MAIN_SUPPORT, shaderParts.get(Section.VERTEX_MAIN_SUPPORT) ?? "");

		this.needsUpdate = true;
		return this;

	}

	/**
	 * Sets the shader macros.
	 *
	 * @param defines - A collection of preprocessor macro definitions.
	 * @return This material.
	 */

	private setDefines(defines: Map<string, string>): this {

		for(const entry of defines.entries()) {

			this.defines[entry[0]] = entry[1];

		}

		this.needsUpdate = true;
		return this;

	}

	/**
	 * Sets the shader uniforms.
	 *
	 * @param uniforms - A collection of uniforms.
	 * @return This material.
	 */

	private setUniforms(uniforms: Map<string, Uniform>): this {

		for(const entry of uniforms.entries()) {

			this.uniforms[entry[0]] = entry[1];

		}

		return this;

	}

	/**
	 * Sets the required shader extensions.
	 *
	 * @param extensions - A collection of extensions.
	 * @return This material.
	 */

	private setExtensions(extensions: Set<WebGLExtension>): this {

		for(const extension of extensions) {

			this.extensions[extension] = true;

		}

		return this;

	}

	/**
	 * Indicates whether output encoding is enabled.
	 */

	get encodeOutput(): boolean {

		return (this.defines.ENCODE_OUTPUT !== undefined);

	}

	set encodeOutput(value: boolean) {

		if(this.encodeOutput !== value) {

			if(value) {

				this.defines.ENCODE_OUTPUT = "1";

			} else {

				delete this.defines.ENCODE_OUTPUT;

			}

			this.needsUpdate = true;

		}

	}

	/**
	 * The current animation time in seconds.
	 */

	get time(): number {

		return this.uniforms.time.value;

	}

	set time(value: number) {

		this.uniforms.time.value = value;

	}

	/**
	 * Copies the settings of the given camera.
	 *
	 * @param camera - A camera.
	 */

	copyCameraSettings(camera: OrthographicCamera | PerspectiveCamera): void {

		const cameraParams = this.uniforms.cameraParams.value as Vector3;
		cameraParams.x = camera.near;
		cameraParams.y = camera.far;

		if(camera instanceof PerspectiveCamera) {

			this.defines.PERSPECTIVE_CAMERA = "1";

		} else {

			delete this.defines.PERSPECTIVE_CAMERA;

		}

		this.needsUpdate = true;

	}

	setSize(width: number, height: number): void {

		const resolution = this.uniforms.resolution.value as Vector4;
		const cameraParams = this.uniforms.cameraParams.value as Vector3;
		resolution.set(width, height, 1.0 / width, 1.0 / height);
		cameraParams.z = width / height;

	}

}

import { LinearEncoding, TextureEncoding, Uniform } from "three";
import { Pass } from "../core";
import { BlendFunction, EffectAttribute, WebGLExtension } from "../enums";
import { ObservableMap, ObservableSet } from "../utils";
import { BlendMode } from "./blending";

/**
 * An abstract effect.
 *
 * Effects are subpasses that can be merged using the {@link EffectPass}.
 */

export abstract class Effect extends Pass {

	/**
	 * The blend mode.
	 */

	readonly blendMode: BlendMode;

	/**
	 * Preprocessor macro definitions.
	 */

	readonly defines: Map<string, string>;

	/**
	 * Shader uniforms.
	 */

	readonly uniforms: Map<string, Uniform>;

	/**
	 * A set of required extensions. Only applies to WebGL 1.
	 */

	readonly extensions: Set<WebGLExtension>;

	/**
	 * @see {@link attributes}
	 */

	private _attributes: EffectAttribute;

	/**
	 * @see {@link fragmentShader}
	 */

	private _fragmentShader: string | null;

	/**
	 * @see {@link vertexShader}
	 */

	private _vertexShader: string | null;

	/**
	 * @see {@link inputColorSpace}
	 */

	private _inputColorSpace: TextureEncoding | null;

	/**
	 * @see {@link outputColorSpace}
	 */

	private _outputColorSpace: TextureEncoding | null;

	/**
	 * Constructs a new effect.
	 *
	 * @param name - A name that will be used for debugging purposes. Doesn't have to be unique.
	 */

	constructor(name: string) {

		super(name);

		const defines = new ObservableMap<string, string>();
		const uniforms = new ObservableMap<string, Uniform>();
		const extensions = new ObservableSet<WebGLExtension>();
		defines.addEventListener("change", (e) => this.dispatchEvent(e));
		uniforms.addEventListener("change", (e) => this.dispatchEvent(e));
		extensions.addEventListener("change", (e) => this.dispatchEvent(e));

		this.defines = defines;
		this.uniforms = uniforms;
		this.extensions = extensions;

		this.blendMode = new BlendMode(BlendFunction.NORMAL);
		this.blendMode.addEventListener("change", () => this.setChanged());

		this._attributes = EffectAttribute.NONE;
		this._fragmentShader = null;
		this._vertexShader = null;
		this._inputColorSpace = LinearEncoding;
		this._outputColorSpace = null;

	}

	/**
	 * The fragment shader.
	 */

	get fragmentShader(): string | null {

		return this._fragmentShader;

	}

	set fragmentShader(value: string | null) {

		this.fragmentShader = value;
		this.setChanged();

	}

	/**
	 * The fragment shader.
	 */

	get vertexShader(): string | null {

		return this._vertexShader;

	}

	set vertexShader(value: string | null) {

		this._vertexShader = value;
		this.setChanged();

	}

	/**
	 * The input color space. Default is `LinearEncoding`.
	 *
	 * Ensures that the input colors are in the specified color space, converting them if necessary.
	 */

	get inputColorSpace(): TextureEncoding | null {

		return this._inputColorSpace;

	}

	set inputColorSpace(value: TextureEncoding | null) {

		this._inputColorSpace = value;
		this.setChanged();

	}

	/**
	 * The output color space. Default is `null`.
	 *
	 * Should only be defined if this effect converts the input colors to a different color space.
	 */

	get outputColorSpace(): TextureEncoding | null {

		return this._outputColorSpace;

	}

	set outputColorSpace(value: TextureEncoding | null) {

		this._outputColorSpace = value;
		this.setChanged();

	}

	/**
	 * Special attributes that serve as hints for the {@link EffectPass}.
	 */

	get attributes(): EffectAttribute {

		return this._attributes;

	}

	set attributes(value: EffectAttribute) {

		this._attributes = value;

	}

}

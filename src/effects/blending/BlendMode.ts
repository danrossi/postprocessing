import { EventDispatcher, Uniform } from "three";
import { BlendFunction } from "../../enums";

import add from "./glsl/add.frag";
import alpha from "./glsl/alpha.frag";
import average from "./glsl/average.frag";
import color from "./glsl/color.frag";
import colorBurn from "./glsl/color-burn.frag";
import colorDodge from "./glsl/color-dodge.frag";
import darken from "./glsl/darken.frag";
import difference from "./glsl/difference.frag";
import divide from "./glsl/divide.frag";
import exclusion from "./glsl/exclusion.frag";
import hardLight from "./glsl/hard-light.frag";
import hardMix from "./glsl/hard-mix.frag";
import hue from "./glsl/hue.frag";
import invert from "./glsl/invert.frag";
import invertRGB from "./glsl/invert-rgb.frag";
import lighten from "./glsl/lighten.frag";
import linearBurn from "./glsl/linear-burn.frag";
import linearDodge from "./glsl/linear-dodge.frag";
import linearLight from "./glsl/linear-light.frag";
import luminosity from "./glsl/luminosity.frag";
import multiply from "./glsl/multiply.frag";
import negation from "./glsl/negation.frag";
import normal from "./glsl/normal.frag";
import overlay from "./glsl/overlay.frag";
import pinLight from "./glsl/pin-light.frag";
import reflect from "./glsl/reflect.frag";
import saturation from "./glsl/saturation.frag";
import screen from "./glsl/screen.frag";
import softLight from "./glsl/soft-light.frag";
import src from "./glsl/src.frag";
import subtract from "./glsl/subtract.frag";
import vividLight from "./glsl/vivid-light.frag";

const blendFunctions = new Map<BlendFunction, string>([
	[BlendFunction.ADD, add],
	[BlendFunction.ALPHA, alpha],
	[BlendFunction.AVERAGE, average],
	[BlendFunction.COLOR, color],
	[BlendFunction.COLOR_BURN, colorBurn],
	[BlendFunction.COLOR_DODGE, colorDodge],
	[BlendFunction.DARKEN, darken],
	[BlendFunction.DIFFERENCE, difference],
	[BlendFunction.DIVIDE, divide],
	[BlendFunction.DST, ""],
	[BlendFunction.EXCLUSION, exclusion],
	[BlendFunction.HARD_LIGHT, hardLight],
	[BlendFunction.HARD_MIX, hardMix],
	[BlendFunction.HUE, hue],
	[BlendFunction.INVERT, invert],
	[BlendFunction.INVERT_RGB, invertRGB],
	[BlendFunction.LIGHTEN, lighten],
	[BlendFunction.LINEAR_BURN, linearBurn],
	[BlendFunction.LINEAR_DODGE, linearDodge],
	[BlendFunction.LINEAR_LIGHT, linearLight],
	[BlendFunction.LUMINOSITY, luminosity],
	[BlendFunction.MULTIPLY, multiply],
	[BlendFunction.NEGATION, negation],
	[BlendFunction.NORMAL, normal],
	[BlendFunction.OVERLAY, overlay],
	[BlendFunction.PIN_LIGHT, pinLight],
	[BlendFunction.REFLECT, reflect],
	[BlendFunction.SATURATION, saturation],
	[BlendFunction.SCREEN, screen],
	[BlendFunction.SOFT_LIGHT, softLight],
	[BlendFunction.SRC, src],
	[BlendFunction.SUBTRACT, subtract],
	[BlendFunction.VIVID_LIGHT, vividLight]
]);

/**
 * A blend mode.
 */

export class BlendMode extends EventDispatcher {

	/**
	 * @see {@link blendFunction}
	 */

	private _blendFunction: BlendFunction;

	/**
	 * A uniform that controls the opacity of this blend mode.
	 *
	 * @see {@link opacity}
	 */

	readonly opacityUniform: Uniform;

	/**
	 * Constructs a new blend mode.
	 *
	 * @param blendFunction - The blend function.
	 * @param opacity - The opacity of the color that will be blended with the base color.
	 */

	constructor(blendFunction: BlendFunction, opacity = 1.0) {

		super();

		this._blendFunction = blendFunction;
		this.opacityUniform = new Uniform(opacity);

	}

	/**
	 * A convenience accessor for the opacity uniform value.
	 *
	 * @see {@link opacityUniform}
	 */

	get opacity(): number {

		return this.opacityUniform.value as number;

	}

	set opacity(value: number) {

		this.opacityUniform.value = value;

	}

	/**
	 * The blend function.
	 */

	get blendFunction() {

		return this._blendFunction;

	}

	set blendFunction(value) {

		this._blendFunction = value;
		this.dispatchEvent({ type: "change" });

	}

	/**
	 * The shader code of the current blend function.
	 */

	get shaderCode(): string {

		return blendFunctions.get(this.blendFunction) as string;

	}

}

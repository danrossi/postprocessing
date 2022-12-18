/**
 * An enumeration of SMAA predication modes.
 */

export enum PredicationMode {

	/**
	 * No predicated thresholding.
	 */

	DISABLED,

	/**
	 * Depth-based predicated thresholding.
	 */

	DEPTH,

	/**
	 * Predicated thresholding using a custom buffer.
	 */

	CUSTOM

}

/**
 * Describes objects that can free internal resources.
 */

export interface Disposable {

	/**
	 * Frees internal resources.
	 */

	dispose(): void;

}

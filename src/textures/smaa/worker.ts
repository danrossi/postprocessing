import { SMAAAreaImageData } from "./SMAAAreaImageData";
import { SMAASearchImageData } from "./SMAASearchImageData";

/**
 * Generates the SMAA area and search lookup tables.
 */

self.addEventListener("message", () => {

	const areaImageData = SMAAAreaImageData.generate();
	const searchImageData = SMAASearchImageData.generate();

	const ctx: Worker = self as any;
	ctx.postMessage({ areaImageData, searchImageData }, [
		areaImageData.data.buffer,
		searchImageData.data.buffer
	]);

	close();

});

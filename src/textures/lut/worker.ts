import { TetrahedralUpscaler } from "./TetrahedralUpscaler";

interface LUTMessage {

	data: Uint8Array | Float32Array;
	size: number;

}

/**
 * Performs long-running LUT transformations.
 *
 * @param event - A message event.
 */

self.addEventListener("message", (event: MessageEvent<LUTMessage>) => {

	const request = event.data;
	const data = TetrahedralUpscaler.expand(request.data, request.size);

	const ctx: Worker = self as any;
	ctx.postMessage(data, [data.buffer]);
	close();

});

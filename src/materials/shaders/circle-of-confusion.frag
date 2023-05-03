#include <common>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D depthBuffer;

#else

	uniform mediump sampler2D depthBuffer;

#endif

uniform float focusDistance;
uniform float focusRange;
uniform vec2 cameraParams;

varying vec2 vUv;

#define getDepth(uv) texture2D(depthBuffer, uv).r

void main() {

	float depth = getDepth(vUv);

	#ifdef PERSPECTIVE_CAMERA

		float viewZ = perspectiveDepthToViewZ(depth, cameraParams.x, cameraParams.y);
		float linearDepth = viewZToOrthographicDepth(viewZ, cameraParams.x, cameraParams.y);

	#else

		float linearDepth = depth;

	#endif

	float signedDistance = linearDepth - focusDistance;
	float magnitude = smoothstep(0.0, focusRange, abs(signedDistance));

	gl_FragColor.rg = magnitude * vec2(
		step(signedDistance, 0.0),
		step(0.0, signedDistance)
	);

}

import React, { Suspense, lazy, useCallback } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

const DEFAULT_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

/**
 * Uses @splinetool/react-spline (Three.js canvas renderer) — same package as
 * the Interactive Robot UI — which has full built-in mouse-cursor tracking.
 * onLoad clears the WebGL renderer background to transparent so the robot
 * blends seamlessly with the chat background in both dark and light themes.
 */
export function SplineViewerWeb({ sceneUrl }) {
  const url = sceneUrl || process.env.REACT_APP_SPLINE_SCENE_URL || DEFAULT_SCENE;

  const onLoad = useCallback((splineApp) => {
    try {
      // Clear the Three.js WebGL renderer background to fully transparent.
      // This makes the canvas see-through so it adopts the page background colour.
      const renderer = splineApp.renderer ?? splineApp._renderer;
      if (renderer?.setClearColor) {
        renderer.setClearColor(0x000000, 0);
        renderer.setClearAlpha(0);
      }
      // Belt-and-suspenders: clear the canvas element's own CSS background too.
      const canvas = splineApp.canvas ?? splineApp._canvas;
      if (canvas) {
        canvas.style.background = 'transparent';
      }
    } catch (_) {
      // Fail silently — renderer API may differ between runtime versions.
    }
  }, []);

  return (
    <Suspense
      fallback={
        <div className="spline-fallback spline-fallback--compact">
          <span className="spline-fallback-dot" />
        </div>
      }
    >
      <Spline
        scene={url}
        className="robot-spline-viewer"
        onLoad={onLoad}
      />
    </Suspense>
  );
}

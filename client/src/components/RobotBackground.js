import React from 'react';
import { SplineViewerWeb } from './SplineViewerWeb';

/**
 * Centered 3D robot behind the chat transcript (Spline viewer).
 */
export function RobotBackground({ sceneUrl }) {
  return (
    <div className="robot-background-center">
      <SplineViewerWeb sceneUrl={sceneUrl} />
    </div>
  );
}

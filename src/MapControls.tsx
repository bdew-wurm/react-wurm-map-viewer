import React from "react";
import type { MapMode } from "./types";
import styles from "./MapViewer.module.scss";

interface Props {
  mode: MapMode;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onModeChange: (mode: MapMode) => void;
}

const modes = [
  ["3d", "3D"],
  ["flat", "Flat"],
  ["roads", "Road"],
] as const;

export const MapControls: React.FC<Props> = ({
  mode,
  onZoomIn,
  onZoomOut,
  onModeChange,
}) => (
  <>
    <div className={`${styles.controls} ${styles.zoomControls}`}>
      <button type="button" aria-label="Zoom in" onClick={onZoomIn}>+</button>
      <button type="button" aria-label="Zoom out" onClick={onZoomOut}>−</button>
    </div>

    <div className={`${styles.controls} ${styles.modeControls}`} aria-label="Map style">
      {modes.map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={mode === value ? styles.selected : ""}
          aria-pressed={mode === value}
          onClick={() => onModeChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  </>
);

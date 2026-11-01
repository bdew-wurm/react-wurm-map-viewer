import React, { useEffect, useRef } from "react";
import type { Point } from "./types";
import styles from "./MapViewer.module.scss";

interface Props {
  dimension: number;
  center: Point;
  zoom: number;
  tiles: Record<string, HTMLImageElement>;
  step: number;
  onRenderError: (message: string | null) => void;
}

export const MapCanvas: React.FC<Props> = ({
  dimension,
  center,
  zoom,
  tiles,
  step,
  onRenderError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      onRenderError("This browser could not create a 2D map canvas.");
      return;
    }

    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, dimension, dimension);
    for (const [key, image] of Object.entries(tiles)) {
      const [x, y] = key.split(".").map(Number);
      context.drawImage(image, x * step, y * step, step, step);
    }

    onRenderError(null);
  }, [dimension, onRenderError, step, tiles]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.map}
      width={dimension}
      height={dimension}
      style={{
        width: dimension * zoom,
        height: dimension * zoom,
        left: `calc(50% - ${center.x * zoom}px)`,
        top: `calc(50% - ${center.y * zoom}px)`,
      }}
    />
  );
};

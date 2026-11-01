import React from "react";
import type { MapData, MapMode, Point } from "./types";
import styles from "./MapViewer.module.scss";

interface Props {
  mapData: MapData;
  mode: MapMode;
  center: Point;
  zoom: number;
}

export const MapMarkers: React.FC<Props> = ({ mapData, mode, center, zoom }) => (
  <div className={styles.markers}>
    {[...mapData.deeds, ...mapData.focusZones].map((marker, index) => {
      const isFocusZone = marker.type !== undefined;
      const showBorders = mode === "3d"
        ? mapData.settings.showDeedBordersIn3dMode
        : mapData.settings.showDeedBordersInFlatMode;
      const left = `calc(50% + ${(marker.x - center.x) * zoom - 128}px)`;
      const top = `calc(50% + ${(marker.y - center.y) * zoom - 128 - (mode === "3d" ? marker.height * zoom / 40 : 0)}px)`;
      const markerName = marker.name.length > 24
        ? `${marker.name.substring(0, 22)}...`
        : marker.name;

      return (
        <div
          key={`${marker.name}-${index}`}
          className={styles.marker}
          style={{ left, top }}
        >
          {showBorders && (
            <div
              className={`${styles.border}${isFocusZone ? ` ${styles.focusZoneBorder}` : ""}`}
              style={{
                left: 128 + (marker.sx - marker.x - 0.5) * zoom,
                top: 128 + (marker.sy - marker.y - 0.5) * zoom,
                width: (1 + marker.ex - marker.sx) * zoom - 2,
                height: (1 + marker.ey - marker.sy) * zoom - 2,
              }}
            />
          )}
          <span
            className={[
              styles.label,
              marker.permanent ? styles.permanent : "",
              isFocusZone ? styles.focusZoneLabel : "",
            ].filter(Boolean).join(" ")}
          >
            {markerName}
          </span>
        </div>
      );
    })}
  </div>
);

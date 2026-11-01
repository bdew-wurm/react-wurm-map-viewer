"use client";

import React, { useCallback, useRef, useState } from "react";
import { MapCanvas } from "./MapCanvas";
import { MapControls } from "./MapControls";
import { MapMarkers } from "./MapMarkers";
import { MapSearch } from "./MapSearch";
import { MapStatus } from "./MapStatus";
import styles from "./MapViewer.module.scss";
import type { MapData, MapMarker, Point } from "./types";
import { useMapData } from "./useMapData";
import { bounded } from "./utils";

interface Props {
  baseUrl: string;
}

export const MapViewer: React.FC<Props> = ({ baseUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointer: Point; center: Point } | null>(null);
  const [center, setCenter] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState("0, 0");
  const [search, setSearch] = useState("");

  const handleConfigLoaded = useCallback((data: MapData): void => {
    setCenter({ x: data.settings.x, y: data.settings.y });
    setZoom(1);
  }, []);

  const { mapData, configError, mode, setMode, tiles, failedTiles }
    = useMapData(baseUrl, handleConfigLoaded);
  const dimension = mapData
    ? mapData.settings.size * mapData.settings.step
    : 0;

  const handleRenderError = useCallback((message: string | null): void => {
    setRenderError(message);
  }, []);

  const zoomAt = (factor: number, pointer?: Point): void => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const nextZoom = Math.min(Math.max(zoom * factor, 0.125), 8);
    if (nextZoom === zoom) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const offset = pointer
      ? { x: pointer.x - rect.left - rect.width / 2, y: pointer.y - rect.top - rect.height / 2 }
      : { x: 0, y: 0 };
    const shift = 1 / zoom - 1 / nextZoom;
    setCenter({
      x: bounded(center.x + offset.x * shift, dimension),
      y: bounded(center.y + offset.y * shift, dimension),
    });
    setZoom(nextZoom);
  };

  const goToDeed = (deed: MapMarker): void => {
    setCenter({ x: deed.x, y: deed.y });
  };

  const updateCoordinates = (event: React.PointerEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCoordinates(
      `${Math.floor(center.x + (event.clientX - rect.left - rect.width / 2) / zoom)}, ${Math.floor(center.y + (event.clientY - rect.top - rect.height / 2) / zoom)}`,
    );
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.target instanceof Element && event.target.closest("button, input")) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointer: { x: event.clientX, y: event.clientY },
      center,
    };
    setSearch("");
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (!drag) {
      updateCoordinates(event);
      return;
    }

    setCenter({
      x: bounded(drag.center.x - (event.clientX - drag.pointer.x) / zoom, dimension),
      y: bounded(drag.center.y - (event.clientY - drag.pointer.y) / zoom, dimension),
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (event.deltaY !== 0) {
      zoomAt(event.deltaY > 0 ? 0.5 : 2, { x: event.clientX, y: event.clientY });
    }
  };

  if (configError) {
    return (
      <MapStatus
        loading={false}
        configError={configError}
        renderError={null}
        failedTileCount={0}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.viewer}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      {mapData && (
        <>
          <MapCanvas
            dimension={dimension}
            center={center}
            zoom={zoom}
            tiles={tiles}
            step={mapData.settings.step}
            onRenderError={handleRenderError}
          />
          <MapMarkers mapData={mapData} mode={mode} center={center} zoom={zoom} />
        </>
      )}

      <MapControls
        mode={mode}
        onZoomIn={() => zoomAt(2)}
        onZoomOut={() => zoomAt(0.5)}
        onModeChange={setMode}
      />
      <MapSearch
        deeds={mapData?.deeds ?? []}
        search={search}
        onSearchChange={setSearch}
        onSelect={goToDeed}
      />
      <MapStatus
        loading={!mapData}
        configError={null}
        renderError={renderError}
        failedTileCount={failedTiles.length}
      />
      <div className={styles.coordinates}>{coordinates}</div>
    </div>
  );
};

export type { MapData, MapMarker, MapMode, MapSettings } from "./types";

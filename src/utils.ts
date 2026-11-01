import type { MapData, MapMarker, MapMode } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isMapMode = (value: unknown): value is MapMode =>
  value === "3d" || value === "flat" || value === "roads";

const isMapMarker = (value: unknown): value is MapMarker =>
  isRecord(value)
  && typeof value.name === "string"
  && isNumber(value.x)
  && isNumber(value.y)
  && isNumber(value.height)
  && isNumber(value.sx)
  && isNumber(value.sy)
  && isNumber(value.ex)
  && isNumber(value.ey)
  && (value.permanent === undefined || typeof value.permanent === "boolean")
  && (value.type === undefined || isNumber(value.type));

const isDeed = (value: unknown): value is MapMarker =>
  isMapMarker(value) && typeof value.permanent === "boolean" && value.type === undefined;

const isFocusZone = (value: unknown): value is MapMarker =>
  isMapMarker(value) && value.type !== undefined && value.permanent === undefined;

export const readMapData = (source: unknown): MapData => {
  if (!isRecord(source) || !isRecord(source.config)) {
    throw new Error("The map config did not define a config object.");
  }

  const result: Record<string, unknown> = { ...source, focusZones: source.focusZones ?? [] };

  const rawConfig = source.config;
  const mode = rawConfig.mode;
  if (
    !isNumber(rawConfig.size)
    || rawConfig.size <= 0
    || !isNumber(rawConfig.step)
    || rawConfig.step <= 0
    || !isNumber(rawConfig.x)
    || !isNumber(rawConfig.y)
    || !isMapMode(mode)
    || typeof rawConfig.showDeedBordersIn3dMode !== "boolean"
    || typeof rawConfig.showDeedBordersInFlatMode !== "boolean"
  ) {
    throw new Error("The map config has invalid dimensions, view, or display options.");
  }

  if (
    !Array.isArray(result.deeds)
    || !result.deeds.every(isDeed)
    || !Array.isArray(result.focusZones)
    || !result.focusZones.every(isFocusZone)
  ) {
    throw new Error("The map config contains invalid deed or focus-zone data.");
  }

  return {
    settings: {
      size: rawConfig.size,
      step: rawConfig.step,
      x: rawConfig.x,
      y: rawConfig.y,
      mode,
      showDeedBordersIn3dMode: rawConfig.showDeedBordersIn3dMode,
      showDeedBordersInFlatMode: rawConfig.showDeedBordersInFlatMode,
    },
    deeds: result.deeds,
    focusZones: result.focusZones,
  };
};

export const mapBaseUrl = (baseUrl: string): URL =>
  new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`, window.location.href);

export const bounded = (value: number, dimension: number): number =>
  Math.min(Math.max(value, 0), dimension);

export const normalizedName = (value: string): string =>
  value.replace(/[^a-z]/gi, "").toLowerCase();

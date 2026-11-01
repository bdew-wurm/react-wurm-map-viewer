export type MapMode = "3d" | "flat" | "roads";

export interface MapSettings {
  size: number;
  step: number;
  x: number;
  y: number;
  mode: MapMode;
  showDeedBordersIn3dMode: boolean;
  showDeedBordersInFlatMode: boolean;
}

export interface MapMarker {
  name: string;
  x: number;
  y: number;
  height: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  permanent?: boolean;
  type?: number;
}

export interface MapData {
  settings: MapSettings;
  deeds: MapMarker[];
  focusZones: MapMarker[];
}

export interface Point {
  x: number;
  y: number;
}

export interface TileState {
  mode: MapMode;
  images: Record<string, HTMLImageElement>;
  failures: string[];
}

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { MapData, MapMode, TileState } from "./types";
import { mapBaseUrl, readMapData } from "./utils";

interface UseMapDataResult {
  mapData: MapData | null;
  configError: string | null;
  mode: MapMode;
  setMode: Dispatch<SetStateAction<MapMode>>;
  tiles: Record<string, HTMLImageElement>;
  failedTiles: string[];
}

export const useMapData = (
  baseUrl: string,
  onConfigLoaded: (data: MapData) => void,
): UseMapDataResult => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [mode, setMode] = useState<MapMode>("3d");
  const [tileState, setTileState] = useState<TileState>({
    mode: "3d",
    images: {},
    failures: [],
  });

  useEffect(() => {
    let active = true;

    const loadConfig = async (): Promise<void> => {
      try {
        const response = await fetch(new URL("config.json", mapBaseUrl(baseUrl)));
        if (!response.ok) {
          throw new Error(`Could not load map config (${response.status} ${response.statusText}).`);
        }

        const data = readMapData(await response.json() as unknown);
        if (active) {
          setMapData(data);
          setMode(data.settings.mode);
          onConfigLoaded(data);
          setConfigError(null);
        }
      } catch (error) {
        if (active) {
          setConfigError(error instanceof Error ? error.message : String(error));
        }
      }
    };

    void loadConfig();
    return () => {
      active = false;
    };
  }, [baseUrl, onConfigLoaded]);

  useEffect(() => {
    if (!mapData) {
      return;
    }

    let active = true;
    for (let x = 0; x < mapData.settings.size; x++) {
      for (let y = 0; y < mapData.settings.size; y++) {
        const key = `${x}.${y}`;
        const image = new Image();
        image.onload = () => {
          if (active) {
            setTileState(current => ({
              mode,
              images: current.mode === mode
                ? { ...current.images, [key]: image }
                : { [key]: image },
              failures: current.mode === mode ? current.failures : [],
            }));
          }
        };
        image.onerror = () => {
          if (active) {
            setTileState(current => ({
              mode,
              images: current.mode === mode ? current.images : {},
              failures: current.mode === mode
                ? current.failures.includes(key) ? current.failures : [...current.failures, key]
                : [key],
            }));
          }
        };
        image.src = new URL(
          `sections-${mode}/${key}.png`,
          mapBaseUrl(baseUrl),
        ).toString();
      }
    }

    return () => {
      active = false;
    };
  }, [baseUrl, mapData, mode]);

  return {
    mapData,
    configError,
    mode,
    setMode,
    tiles: tileState.mode === mode ? tileState.images : {},
    failedTiles: tileState.mode === mode ? tileState.failures : [],
  };
};

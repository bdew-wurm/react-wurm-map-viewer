import React, { useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import type { MapMarker } from "./types";
import { normalizedName } from "./utils";
import styles from "./MapViewer.module.scss";

interface Props {
  deeds: MapMarker[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (deed: MapMarker) => void;
}

export const MapSearch: React.FC<Props> = ({
  deeds,
  search,
  onSearchChange,
  onSelect,
}) => {
  const matches = useMemo(() => {
    const query = normalizedName(search);
    return query
      ? deeds.filter(deed => normalizedName(deed.name).startsWith(query))
      : [];
  }, [deeds, search]);

  const selectDeed = (deed: MapMarker): void => {
    onSelect(deed);
    onSearchChange("");
  };

  const submitSearch = (): void => {
    if (matches[0]) {
      selectDeed(matches[0]);
    }
  };

  return (
    <div className={styles.search}>
      <input
        aria-label="Search deeds"
        type="search"
        value={search}
        onChange={event => onSearchChange(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            submitSearch();
          }
        }}
      />
      <button type="button" aria-label="Search" onClick={submitSearch}>
        <FaSearch aria-hidden="true" />
      </button>
      {matches.length > 0 && (
        <div className={styles.autocomplete} role="listbox" aria-label="Matching deeds">
          {matches.map(deed => (
            <button
              key={deed.name}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => selectDeed(deed)}
            >
              {deed.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

import React from "react";
import styles from "./MapViewer.module.scss";

interface Props {
  loading: boolean;
  configError: string | null;
  renderError: string | null;
  failedTileCount: number;
}

export const MapStatus: React.FC<Props> = ({
  loading,
  configError,
  renderError,
  failedTileCount,
}) => {
  if (configError) {
    return <div className={styles.error}>Unable to load map: {configError}</div>;
  }

  return (
    <>
      {loading && (
        <div className={styles.status} role="status">Loading map config...</div>
      )}
      {renderError && <div className={styles.status}>{renderError}</div>}
      {failedTileCount > 0 && (
        <div className={styles.status} role="status">
          Could not load {failedTileCount} map section{failedTileCount === 1 ? "" : "s"}.
        </div>
      )}
    </>
  );
};

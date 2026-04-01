import React, { useState } from "react";
import Box from "@mui/material/Box";

const spinKeyframe = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  size?: number;
}

const RefreshButton = ({ onRefresh, size = 16 }: RefreshButtonProps) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleClick = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <Box
      component="button"
      onClick={handleClick}
      disabled={refreshing}
      title="Refresh"
      sx={{
        border: "none", background: "none",
        cursor: refreshing ? "default" : "pointer",
        color: refreshing ? "#0078D4" : "#A19F9D",
        fontSize: size, p: 0,
        display: "flex", alignItems: "center",
        transition: "color 0.15s",
        animation: refreshing ? "spin 0.8s linear infinite" : "none",
        "&:hover:not(:disabled)": { color: "#0078D4" },
      }}
    >
      <style>{spinKeyframe}</style>
      ↻
    </Box>
  );
};

export default RefreshButton;
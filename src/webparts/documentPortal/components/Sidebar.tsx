// src/webparts/documentPortal/components/Sidebar.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import Fade from "@mui/material/Fade";
import FolderIcon from "@mui/icons-material/Folder";
import PolicyIcon from "@mui/icons-material/Policy";
import ArticleIcon from "@mui/icons-material/Article";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import BusinessIcon from "@mui/icons-material/Business";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import KeyboardDoubleArrowDown from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUp from "@mui/icons-material/KeyboardDoubleArrowUp";

const ACCENT = "#6e3cbe";
const SIDEBAR_WIDTH = 260;
const INITIAL_SHOW_COUNT = 0; // show none initially — user clicks "Show More"

export interface DocTypeItem {
  name: string;
  count: number;
}

export interface SidebarProps {
  docTypes: DocTypeItem[];
  totalDocumentCount: number;
  selectedDocType: string | null; // null = "All Documents"
  onSelectDocType: (docType: string | null) => void;
  changeRequestUrl?: string; // URL to the page hosting DcrForm web part
  taskHubUrl?: string; // URL to the page hosting TaskHub web part
}

// Map doc-type names to MUI icons
const getDocTypeIcon = (name: string): React.ReactElement => {
  const key = name.toLowerCase();
  if (key.includes("policy")) return <PolicyIcon />;
  if (key.includes("procedure")) return <FormatListBulletedIcon />;
  if (key.includes("form")) return <ArticleIcon />;
  if (key.includes("work instruction")) return <AssignmentIcon />;
  if (key.includes("standard")) return <BusinessIcon />;
  if (key.includes("manual")) return <DescriptionIcon />;
  return <DescriptionIcon />;
};

// Styling helper
const getItemStyles = (isParent = false, isSubItem = false): Record<string, unknown> => ({
  borderRadius: isParent ? "10px" : "8px",
  margin: isParent ? "4px 8px" : "2px 8px",
  minHeight: isParent ? "44px" : "36px",
  transition: "all 0.2s ease-in-out",
  position: "relative",
  "&:hover": {
    backgroundColor: isParent ? "rgba(110, 60, 190, 0.08)" : "rgba(110, 60, 190, 0.05)",
    transform: "translateX(2px)",
    boxShadow: "0 2px 8px rgba(110, 60, 190, 0.15)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(110, 60, 190, 0.12)",
    color: ACCENT,
    boxShadow: "0 2px 12px rgba(110, 60, 190, 0.2)",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      width: "4px",
      height: "24px",
      backgroundColor: ACCENT,
      borderRadius: "0 2px 2px 0",
    },
    "& .MuiListItemIcon-root": { color: ACCENT },
    "& .MuiListItemText-primary": { fontWeight: 600 },
    "&:hover": { backgroundColor: "rgba(110, 60, 190, 0.15)" },
  },
  ...(isSubItem && { pl: 5, marginLeft: "16px" }),
});

const Sidebar = ({
  docTypes,
  totalDocumentCount,
  selectedDocType,
  onSelectDocType,
  changeRequestUrl,
  taskHubUrl,
}: SidebarProps): React.ReactElement => {
  const [showAll, setShowAll] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayed = showAll ? docTypes : docTypes.slice(0, INITIAL_SHOW_COUNT);
  const hasMore = docTypes.length > INITIAL_SHOW_COUNT;

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 5);
      setCanScrollUp(scrollTop > 5);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll, showAll, docTypes]);

  const handleChangeRequest = (): void => {
    if (changeRequestUrl) {
      window.open(changeRequestUrl, "_blank", "noopener");
    }
  };

  const handleTaskHub = (): void => {
    if (taskHubUrl) {
      window.open(taskHubUrl, "_blank", "noopener");
    }
  };

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#fafafa",
        borderRight: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "2px 0 10px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: "white",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#2c2c2c", fontSize: "1rem", letterSpacing: "0.5px" }}
        >
          Navigation
        </Typography>
        <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem", display: "block", mt: 0.5 }}>
          Browse document types
        </Typography>
      </Box>

      {/* Scroll up indicator */}
      <Fade in={canScrollUp}>
        <Box
          sx={{
            position: "absolute",
            top: 80,
            left: 0,
            width: SIDEBAR_WIDTH,
            height: "30px",
            background: "linear-gradient(to bottom, rgba(250,250,250,0.95), transparent)",
            zIndex: 10,
            pointerEvents: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            pt: 0.5,
          }}
        >
          <KeyboardDoubleArrowUp sx={{ color: ACCENT, opacity: 0.8, fontSize: "18px" }} />
        </Box>
      </Fade>

      {/* Scrollable content */}
      <Box ref={scrollRef} sx={{ flex: 1, overflow: "auto", position: "relative", pt: 1 }}>
        <List sx={{ px: 1 }}>
          {/* All Documents */}
          <ListItemButton
            selected={selectedDocType === null}
            onClick={() => onSelectDocType(null)}
            sx={getItemStyles(true)}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <FolderIcon sx={{ fontSize: "1.2rem" }} />
            </ListItemIcon>
            <ListItemText
              primary="All Documents"
              sx={{ "& .MuiListItemText-primary": { fontSize: "0.9rem", fontWeight: 500 } }}
            />
            {totalDocumentCount > 0 && (
              <Chip
                size="small"
                label={totalDocumentCount.toLocaleString()}
                sx={{
                  backgroundColor: "rgba(110, 60, 190, 0.1)",
                  color: ACCENT,
                  fontSize: "0.75rem",
                  height: "20px",
                  fontWeight: 600,
                }}
              />
            )}
          </ListItemButton>

          {/* Document Types section header */}
          <Box sx={{ mt: 1.5, mb: 0.5, px: 1.5 }}>
            <Typography
              variant="caption"
              sx={{ color: "#999", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}
            >
              Document Types
            </Typography>
          </Box>

          {/* Type items */}
          <Collapse in={true} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {displayed.map((dt) => (
                <ListItemButton
                  key={dt.name}
                  selected={selectedDocType === dt.name}
                  onClick={() => onSelectDocType(dt.name)}
                  sx={getItemStyles(false, true)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {React.cloneElement(getDocTypeIcon(dt.name), { sx: { fontSize: "1.1rem" } })}
                  </ListItemIcon>
                  <ListItemText
                    primary={dt.name}
                    sx={{ "& .MuiListItemText-primary": { fontSize: "0.9rem" } }}
                  />
                  {dt.count > 0 && (
                    <Chip
                      size="small"
                      label={dt.count}
                      sx={{
                        backgroundColor: "rgba(110, 60, 190, 0.08)",
                        color: ACCENT,
                        fontSize: "0.7rem",
                        height: "18px",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </ListItemButton>
              ))}

              {/* Show More button */}
              {hasMore && !showAll && (
                <Paper
                  elevation={0}
                  sx={{
                    mx: 2,
                    my: 1,
                    backgroundColor: "rgba(110, 60, 190, 0.04)",
                    border: "1px dashed rgba(110, 60, 190, 0.2)",
                    borderRadius: "8px",
                  }}
                >
                  <ListItemButton
                    onClick={() => setShowAll(true)}
                    sx={{
                      borderRadius: "8px",
                      color: ACCENT,
                      minHeight: "40px",
                      "&:hover": { backgroundColor: "rgba(110, 60, 190, 0.08)" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ExpandMore sx={{ color: ACCENT, fontSize: "1.1rem" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Show ${docTypes.length - INITIAL_SHOW_COUNT} More Types`}
                      sx={{ "& .MuiListItemText-primary": { fontSize: "0.85rem", fontWeight: 500 } }}
                    />
                  </ListItemButton>
                </Paper>
              )}
            </List>
          </Collapse>

          {/* Actions section */}
          <Box sx={{ mt: 3, mb: 1, px: 1.5 }}>
            <Typography
              variant="caption"
              sx={{ color: "#999", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}
            >
              Actions
            </Typography>
          </Box>

          <ListItemButton
            onClick={handleChangeRequest}
            disabled={!changeRequestUrl}
            sx={{
              ...getItemStyles(false, true),
              color: ACCENT,
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AddCircleOutlineIcon sx={{ fontSize: "1.1rem", color: ACCENT }} />
            </ListItemIcon>
            <ListItemText
              primary="Submit Change Request"
              sx={{ "& .MuiListItemText-primary": { fontSize: "0.9rem", fontWeight: 500 } }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={handleTaskHub}
            disabled={!taskHubUrl}
            sx={{
              ...getItemStyles(false, true),
              color: ACCENT,
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AssignmentTurnedInIcon sx={{ fontSize: "1.1rem", color: ACCENT }} />
            </ListItemIcon>
            <ListItemText
              primary="Task Hub"
              sx={{ "& .MuiListItemText-primary": { fontSize: "0.9rem", fontWeight: 500 } }}
            />
          </ListItemButton>
        </List>

        {/* Bottom spacer */}
        <Box sx={{ height: "80px" }} />
      </Box>

      {/* Sticky Show Less */}
      {hasMore && showAll && (
        <Paper
          elevation={3}
          sx={{
            position: "sticky",
            bottom: 0,
            background: "linear-gradient(to top, rgba(255,255,255,0.98) 80%, transparent)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid rgba(110, 60, 190, 0.1)",
            pt: 2,
            pb: 2,
            mx: 1,
            borderRadius: "12px 12px 0 0",
          }}
        >
          <ListItemButton
            onClick={() => setShowAll(false)}
            sx={{
              borderRadius: "10px",
              mx: 1,
              color: ACCENT,
              backgroundColor: "rgba(110, 60, 190, 0.08)",
              border: "1px dashed rgba(110, 60, 190, 0.2)",
              minHeight: "44px",
              "&:hover": {
                backgroundColor: "rgba(110, 60, 190, 0.12)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(110, 60, 190, 0.2)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <ExpandLess sx={{ color: ACCENT }} />
            </ListItemIcon>
            <ListItemText
              primary="Show Less"
              sx={{ "& .MuiListItemText-primary": { fontWeight: 600, fontSize: "0.9rem" } }}
            />
          </ListItemButton>
        </Paper>
      )}

      {/* Scroll down indicator */}
      <Fade in={canScrollDown}>
        <Box
          sx={{
            position: "absolute",
            bottom: showAll ? "100px" : "20px",
            left: 0,
            width: SIDEBAR_WIDTH,
            height: "30px",
            background: "linear-gradient(to top, rgba(250,250,250,0.95), transparent)",
            zIndex: 10,
            pointerEvents: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            pb: 0.5,
          }}
        >
          <KeyboardDoubleArrowDown sx={{ color: ACCENT, opacity: 0.8, fontSize: "18px" }} />
        </Box>
      </Fade>
    </Box>
  );
};

export default Sidebar;

// src/webparts/documentPortal/components/FilterDropdown.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Menu,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import { BRANDING } from "../../../shared/theme/theme";

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
    setSearchTerm("");
  };

  const handleToggle = (option: string): void => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onChange([]);
  };

  const handleClearAll = (): void => {
    onChange([]);
  };

  // Filter and sort options - selected items first
  const filteredOptions = useMemo(() => {
    const filtered = options.filter((opt) =>
      opt.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort: selected first, then alphabetical
    return [...filtered].sort((a, b) => {
      const aSelected = selected.includes(a) ? 0 : 1;
      const bSelected = selected.includes(b) ? 0 : 1;
      if (aSelected !== bSelected) return aSelected - bSelected;
      return a.localeCompare(b);
    });
  }, [options, searchTerm, selected]);

  const isActive = selected.length > 0;

  return (
    <>
      <Button
        onClick={handleOpen}
        sx={{
          fontSize: "12px",
          padding: "6px 10px",
          borderRadius: "6px",
          backgroundColor: isActive ? BRANDING.primary : "white",
          color: isActive ? "white" : "#64748B",
          border: isActive ? "none" : "1px solid #E2E8F0",
          textTransform: "none",
          fontWeight: 400,
          minWidth: "auto",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          "&:hover": {
            backgroundColor: isActive ? BRANDING.primaryDark : "#F8FAFC",
          },
        }}
      >
        <span>{label}</span>
        
        {isActive && (
          <>
            <Box
              component="span"
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "1px 6px",
                borderRadius: "4px",
                fontSize: "11px",
              }}
            >
              {selected.length}
            </Box>
            
            {/* Close button with circle */}
            <Box
              component="span"
              onClick={handleClear}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: 0.8,
                "&:hover": { opacity: 1 },
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" fill="rgba(255,255,255,0.25)" />
                <path
                  d="M5 5L9 9M9 5L5 9"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Box>
          </>
        )}
        
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 16,
            color: isActive ? "rgba(255,255,255,0.7)" : "#94A3B8",
          }}
        />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 280,
            maxHeight: 400,
            mt: 0.5,
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          },
        }}
      >
        {/* Search */}
        <Box sx={{ p: 1.5 }}>
          <TextField
            placeholder={`Search ${label.toLowerCase()}...`}
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F8FAFC",
                fontSize: "13px",
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "#E2E8F0" },
                "&.Mui-focused fieldset": { borderColor: BRANDING.primary },
              },
            }}
          />
        </Box>

        {/* Options list */}
        <List sx={{ maxHeight: 240, overflow: "auto", py: 0 }}>
          {filteredOptions.length === 0 ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography sx={{ fontSize: "13px", color: "#94A3B8" }}>
                No options found
              </Typography>
            </Box>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <ListItemButton
                  key={option}
                  onClick={() => handleToggle(option)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    mx: 0.75,
                    mb: 0.25,
                    borderRadius: "6px",
                    backgroundColor: isSelected
                      ? "rgba(15, 76, 129, 0.08)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isSelected
                        ? "rgba(15, 76, 129, 0.12)"
                        : "#F8FAFC",
                    },
                  }}
                >
                  <ListItemText
                    primary={option}
                    primaryTypographyProps={{
                      fontSize: "13px",
                      fontWeight: isSelected ? 500 : 400,
                      color: isSelected ? BRANDING.primary : "#475569",
                    }}
                  />
                  {isSelected && (
                    <CheckIcon
                      sx={{ fontSize: 18, color: BRANDING.primary }}
                    />
                  )}
                </ListItemButton>
              );
            })
          )}
        </List>

        {/* Footer */}
        <Box
          sx={{
            p: 1,
            borderTop: "1px solid #F1F5F9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            size="small"
            onClick={handleClearAll}
            disabled={selected.length === 0}
            sx={{
              fontSize: "12px",
              color: "#64748B",
              textTransform: "none",
              "&:hover": { backgroundColor: "transparent" },
              "&.Mui-disabled": { color: "#CBD5E1" },
            }}
          >
            Clear
          </Button>
          <Typography sx={{ fontSize: "11px", color: "#94A3B8" }}>
            {selected.length} selected
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default FilterDropdown;
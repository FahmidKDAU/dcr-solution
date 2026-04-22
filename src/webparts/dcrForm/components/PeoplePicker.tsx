// src/webparts/dcrForm/components/PeoplePicker.tsx
import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Portal from "@mui/material/Portal";
import SharePointService from "../../../shared/services/SharePointService";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";
import { getAvatarColor, getAvatarInitials } from "../../../shared/utils/avatarUtils";
import { BRANDING } from "../../../shared/theme/theme";

interface PeoplePickerProps {
  label: string;
  value: SharePointPerson | undefined;
  onChange: (person: SharePointPerson | undefined) => void;
  required?: boolean;
  disabled?: boolean;
  excludeIds?: number[];
}

const Avatar = ({ name, size = 22 }: { name: string; size?: number }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: getAvatarColor(name),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.36,
      fontWeight: 600,
      color: "#fff",
      flexShrink: 0,
      letterSpacing: "0.3px",
    }}
  >
    {getAvatarInitials(name)}
  </Box>
);

export const PeoplePicker = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  excludeIds = [],
}: PeoplePickerProps) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SharePointPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (text: string): Promise<void> => {
    if (text.length < 2) { setOptions([]); return; }
    setLoading(true);
    try {
      const results = await SharePointService.searchUsers(text);
      setOptions(results.filter((p) => !excludeIds.includes(p.Id)));
      setHighlightedIndex(0);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (person: SharePointPerson) => {
    onChange(person);
    setInputValue("");
    setOpen(false);
    setOptions([]);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setInputValue("");
    setOptions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || options.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, options.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && options[highlightedIndex]) handleSelect(options[highlightedIndex]);
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <Box ref={containerRef} sx={{ position: "relative", width: "100%" }}>
      {/* Input box — matches form field style */}
      <Box
        onClick={() => !disabled && inputRef.current?.focus()}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: isFocused ? `1px solid ${BRANDING.primary}` : "1px solid #E2E8F0",
          borderRadius: "6px",
          backgroundColor: disabled ? "#F8FAFC" : "#fff",
          px: "12px",
          py: "9px",
          minHeight: "38px",
          cursor: disabled ? "not-allowed" : "text",
          transition: "border-color 0.15s",
          "&:hover": !disabled ? { borderColor: "#CBD5E1" } : {},
        }}
      >
        {/* Selected person chip */}
        {value && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#F1F5F9",
              borderRadius: "4px",
              pl: "6px",
              pr: "2px",
              py: "2px",
              flexShrink: 0,
            }}
          >
            <Avatar name={value.Title} size={18} />
            <Typography sx={{ fontSize: "12px", color: "#475569", fontWeight: 500, whiteSpace: "nowrap" }}>
              {value.Title}
            </Typography>
            {!disabled && (
              <Box
                onMouseDown={handleClear}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  borderRadius: "2px",
                  cursor: "pointer",
                  color: "#94A3B8",
                  "&:hover": { color: "#475569", backgroundColor: "#E2E8F0" },
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </Box>
            )}
          </Box>
        )}

        {/* Text input */}
        <input
          ref={inputRef}
          value={inputValue}
          placeholder={value ? "" : "Search people..."}
          disabled={disabled}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
            handleSearch(e.target.value).catch(console.error);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => { setOpen(true); setIsFocused(true); }}
          onBlur={() => setIsFocused(false)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "13px",
            color: "#1E293B",
            backgroundColor: "transparent",
            fontFamily: "inherit",
            minWidth: "80px",
          }}
        />

        {loading && <CircularProgress size={14} sx={{ color: BRANDING.primary, flexShrink: 0 }} />}
      </Box>

      {/* Dropdown */}
      {open && (
        <Portal>
          <Paper
            ref={dropdownRef}
            elevation={0}
            sx={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999,
              borderRadius: "6px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {loading && (
              <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={13} sx={{ color: BRANDING.primary }} />
                <Typography sx={{ fontSize: "13px", color: "#94A3B8" }}>Searching...</Typography>
              </Box>
            )}
            {!loading && inputValue.length < 2 && (
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontSize: "13px", color: "#94A3B8" }}>Type at least 2 characters</Typography>
              </Box>
            )}
            {!loading && inputValue.length >= 2 && options.length === 0 && (
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontSize: "13px", color: "#94A3B8" }}>No results found</Typography>
              </Box>
            )}
            {!loading && options.map((person, index) => (
              <Box
                key={person.Id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(person); }}
                onMouseEnter={() => setHighlightedIndex(index)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  px: 2,
                  py: "10px",
                  cursor: "pointer",
                  backgroundColor: index === highlightedIndex ? "#F8FAFC" : "#fff",
                  "&:hover": { backgroundColor: "#F8FAFC" },
                  borderBottom: index < options.length - 1 ? "1px solid #F1F5F9" : "none",
                }}
              >
                <Avatar name={person.Title} size={28} />
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#1E293B", lineHeight: 1.3 }}>
                    {person.Title}
                  </Typography>
                  {person.EMail && (
                    <Typography sx={{ fontSize: "11px", color: "#94A3B8", lineHeight: 1.3 }}>
                      {person.EMail}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
        </Portal>
      )}
    </Box>
  );
};
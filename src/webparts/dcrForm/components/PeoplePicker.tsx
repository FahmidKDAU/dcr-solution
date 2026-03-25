import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Portal from "@mui/material/Portal";
import SharePointService from "../../../shared/services/SharePointService";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";

interface PeoplePickerProps {
  label: string;
  value: SharePointPerson | undefined;
  onChange: (person: SharePointPerson | undefined) => void;
  required?: boolean;
  disabled?: boolean;
  excludeIds?: number[];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#0078D4", "#107C10", "#5C2D91", "#D83B01", "#008575", "#C239B3"];
const getColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const Avatar = ({ name, size = 24 }: { name: string; size?: number }) => (
  <Box sx={{ width: size, height: size, borderRadius: "50%", backgroundColor: getColor(name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
    {getInitials(name)}
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const PeoplePicker = ({ label, value, onChange, required = false, disabled = false, excludeIds = [] }: PeoplePickerProps) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SharePointPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recalculate dropdown position whenever it opens
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

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideContainer = containerRef.current?.contains(target) ?? false;
      const clickedInsideDropdown = dropdownRef.current?.contains(target) ?? false;

      if (!clickedInsideContainer && !clickedInsideDropdown) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (searchText: string): Promise<void> => {
    if (searchText.length < 2) { setOptions([]); return; }
    setLoading(true);
    try {
      const results = await SharePointService.searchUsers(searchText);
      const filteredResults = results.filter((person) => !excludeIds.includes(person.Id));
      setOptions(filteredResults);
      setHighlightedIndex(0);
    } catch (error) {
      console.error("Error searching users:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (person: SharePointPerson) => {
    onChange(person);
    setInputValue(person.Title);
    setOpen(false);
    setOptions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || options.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, options.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && options[highlightedIndex]) handleSelect(options[highlightedIndex]);
    if (e.key === "Escape") { setOpen(false); onChange(undefined); }
  };

  return (
    <Box ref={containerRef} sx={{ position: "relative", width: "100%", my: 0.75 }}>
      {label && (
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "#323130",
            mb: 0.5,
            px: 0.25,
          }}
        >
          {label}
          {required && (
            <Box component="span" sx={{ color: "#D13438", ml: 0.5 }}>
              *
            </Box>
          )}
        </Typography>
      )}
      {/* Input */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, border: isFocused ? "2px solid #0078D4" : "1px solid #8A8886", borderRadius: "4px", backgroundColor: "#fff", px: 1, py: 0.5, minHeight: 32, opacity: disabled ? 0.5 : 1 }}>
        {value && <Avatar name={value.Title} size={20} />}
        <InputBase
          inputRef={inputRef}
          value={inputValue}
          placeholder={value ? value.Title : `Search ${label || "people"}...`}
          disabled={disabled}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
            handleSearch(e.target.value).catch(console.error);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => { setOpen(true); setIsFocused(true); }}
          onBlur={() => setIsFocused(false)}
          sx={{ flex: 1, fontSize: 13, "& input": { padding: 0, color: "#323130", "&::placeholder": { color: "#A19F9D", opacity: 1 } } }}
        />
        {loading && <CircularProgress size={14} sx={{ color: "#0078D4", flexShrink: 0 }} />}
      </Box>

      {/* Dropdown — rendered in a Portal to escape Dialog overflow clipping */}
      {open && (
        <Portal>
          <Paper
            ref={dropdownRef}
            elevation={8}
            sx={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999,
              borderRadius: "4px",
              border: "1px solid #EDEBE9",
              boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {loading && (
              <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={14} sx={{ color: "#0078D4" }} />
                <Typography sx={{ fontSize: 13, color: "#605E5C" }}>Searching...</Typography>
              </Box>
            )}
            {!loading && inputValue.length >= 2 && options.length === 0 && (
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#A19F9D" }}>No results found</Typography>
              </Box>
            )}
            {!loading && inputValue.length < 2 && (
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#A19F9D" }}>Type at least 2 characters to search</Typography>
              </Box>
            )}
            {!loading && options.map((person, index) => (
              <Box
                key={person.Id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(person); }}
                onMouseEnter={() => setHighlightedIndex(index)}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1, cursor: "pointer", backgroundColor: index === highlightedIndex ? "#F3F2F1" : "#fff", transition: "background 0.1s", "&:hover": { backgroundColor: "#F3F2F1" } }}
              >
                <Avatar name={person.Title} size={28} />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#323130", lineHeight: 1.3 }}>{person.Title}</Typography>
                  {person.EMail && <Typography sx={{ fontSize: 11, color: "#A19F9D", lineHeight: 1.3 }}>{person.EMail}</Typography>}
                </Box>
              </Box>
            ))}
          </Paper>
        </Portal>
      )}
    </Box>
  );
};
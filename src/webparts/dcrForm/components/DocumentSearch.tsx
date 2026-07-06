// src/webparts/dcrForm/components/DocumentSearch.tsx
import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Document } from "../../../shared/types/Document";
import { BRANDING } from "../../../shared/theme/theme";

interface DocumentSearchProps {
  documents: Document[];
  value: number | undefined;
  onChange: (documentId: number | undefined) => void;
}

export const DocumentSearch = ({
  documents,
  value,
  onChange,
}: DocumentSearchProps): React.ReactElement => {
  const validDocuments = documents.filter((d) => !!d.DocumentTitle);
  const selectedDoc = validDocuments.find((d) => d.Id === value) ?? null;

  return (
    <Autocomplete
      options={validDocuments}
      getOptionLabel={(doc) =>
        [doc.DocumentNumber, doc.DocumentTitle].filter(Boolean).join(" — ")
      }
      value={selectedDoc}
      onChange={(_, newValue) => onChange(newValue?.Id ?? undefined)}
      isOptionEqualToValue={(option, val) => option.Id === val.Id}
      filterOptions={(options, { inputValue }) => {
        const q = inputValue.toLowerCase();
        return options.filter(
          (doc) =>
            doc.DocumentTitle?.toLowerCase().includes(q) ||
            doc.DocumentNumber?.toLowerCase().includes(q)
        );
      }}
      noOptionsText={
        <Typography sx={{ fontSize: "13px", color: "#94A3B8", px: "2px" }}>
          No documents found
        </Typography>
      }
      popupIcon={
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 6l4 4 4-4"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: "10px",
            py: "9px !important",
            px: "12px !important",
            minHeight: "unset !important",
          }}
        >
          {option.DocumentNumber && (
            <Typography
              sx={{
                fontSize: "12px",
                color: BRANDING.primary,
                fontFamily: "monospace",
                flexShrink: 0,
              }}
            >
              {option.DocumentNumber}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: "13px",
              color: "#1E293B",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {option.DocumentTitle}
          </Typography>
          {(option.CoreFunctionality?.Title || option.VersionNumber) && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "#94A3B8",
                flexShrink: 0,
              }}
            >
              {[option.CoreFunctionality?.Title, option.VersionNumber
                ? `v${option.VersionNumber}`
                : undefined]
                .filter(Boolean)
                .join(" · ")}
            </Typography>
          )}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search by title or document number..."
          InputLabelProps={{ shrink: false, style: { display: "none" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: "14px",
              borderRadius: "6px",
              backgroundColor: "white",
              padding: "0 !important",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": {
                borderColor: BRANDING.primary,
                borderWidth: "1px",
              },
            },
            "& .MuiInputBase-input": {
              padding: "10px 14px !important",
              fontSize: "14px",
              "&::placeholder": { color: "#94A3B8", opacity: 1 },
            },
            "& .MuiAutocomplete-clearIndicator": {
              color: "#94A3B8",
              "&:hover": { color: "#475569", backgroundColor: "transparent" },
            },
            "& .MuiAutocomplete-popupIndicator": {
              color: "#94A3B8",
              "&:hover": { backgroundColor: "transparent" },
            },
          }}
        />
      )}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "6px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            mt: "4px",
            "& .MuiAutocomplete-listbox": {
              padding: "0",
              "& .MuiAutocomplete-option.Mui-focused": {
                backgroundColor: "#F8FAFC",
              },
            },
          },
        },
      }}
    />
  );
};
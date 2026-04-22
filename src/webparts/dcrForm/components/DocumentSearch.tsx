// src/webparts/dcrForm/components/DocumentSearch.tsx
import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
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
      getOptionLabel={(doc) => doc.DocumentTitle ?? ""}
      value={selectedDoc}
      onChange={(_, newValue) => onChange(newValue?.Id ?? undefined)}
      isOptionEqualToValue={(option, val) => option.Id === val.Id}
      filterOptions={(options, { inputValue }) =>
        options.filter((doc) =>
          doc.DocumentTitle?.toLowerCase().includes(inputValue.toLowerCase())
        )
      }
      noOptionsText={
        <Typography sx={{ fontSize: "13px", color: "#94A3B8" }}>
          No documents found
        </Typography>
      }
      popupIcon={
        // Match the MUI Select chevron style
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      }
      renderOption={(props, option) => (
        <Typography
          component="li"
          {...props}
          sx={{ fontSize: "14px", color: "#1E293B", py: "9px !important", px: "14px !important" }}
        >
          {option.DocumentTitle}
        </Typography>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search by document title..."
          // Remove the floating label entirely — we use FieldLabel above
          InputLabelProps={{ shrink: false, style: { display: "none" } }}
          InputProps={{
            ...params.InputProps,
            // Remove the default clear + popup buttons padding interference
          }}
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
            // Style the clear button to be subtle
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
      // Match the dropdown paper style
      slotProps={{
        paper: {
          sx: {
            borderRadius: "6px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            mt: "4px",
            "& .MuiAutocomplete-listbox": {
              padding: "4px 0",
              "& .MuiAutocomplete-option": {
                minHeight: "unset",
              },
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
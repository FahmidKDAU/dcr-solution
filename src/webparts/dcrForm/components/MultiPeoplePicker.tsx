// src/webparts/dcrForm/components/MultiPeoplePicker.tsx
import React, { useState } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import SharePointService from "../../../shared/services/SharePointService";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";
import { getAvatarColor, getAvatarInitials } from "../../../shared/utils/avatarUtils";
import { BRANDING } from "../../../shared/theme/theme";

interface MultiPeoplePickerProps {
  label: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
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

export const MultiPeoplePicker: React.FC<MultiPeoplePickerProps> = ({
  label,
  selectedIds,
  onChange,
  disabled = false,
  excludeIds = [],
}) => {
  const [options, setOptions] = useState<SharePointPerson[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<SharePointPerson[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string): Promise<void> => {
    if (text.length < 2) { setOptions([]); return; }
    setLoading(true);
    try {
      const results = await SharePointService.searchUsers(text);
      const currentIds = selectedIds ?? [];
      setOptions(results.filter((r) => !currentIds.includes(r.Id) && !excludeIds.includes(r.Id)));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Autocomplete
      multiple
      value={selectedPeople}
      onChange={(_, newValue) => {
        setSelectedPeople(newValue);
        onChange(newValue.map((p) => p.Id));
      }}
      options={options}
      getOptionLabel={(option) => option.Title || ""}
      isOptionEqualToValue={(option, value) => option.Id === value.Id}
      loading={loading}
      disabled={disabled}
      onInputChange={(_, newInput) => { handleSearch(newInput).catch(console.error); }}
      noOptionsText={<Typography sx={{ fontSize: "13px", color: "#94A3B8" }}>No results found</Typography>}
      loadingText={<Typography sx={{ fontSize: "13px", color: "#94A3B8" }}>Searching...</Typography>}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: "flex !important",
            alignItems: "center !important",
            gap: "10px !important",
            py: "10px !important",
            px: "16px !important",
            borderBottom: "1px solid #F1F5F9",
            "&:last-child": { borderBottom: "none" },
          }}
        >
          <Avatar name={option.Title} size={28} />
          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#1E293B", lineHeight: 1.3 }}>
              {option.Title}
            </Typography>
            {option.EMail && (
              <Typography sx={{ fontSize: "11px", color: "#94A3B8", lineHeight: 1.3 }}>
                {option.EMail}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.Id}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Avatar name={option.Title} size={16} />
                <span>{option.Title}</span>
              </Box>
            }
            size="small"
            sx={{
              borderRadius: "4px",
              backgroundColor: "#F1F5F9",
              border: "none",
              height: "24px",
              "& .MuiChip-label": {
                fontSize: "12px",
                color: "#475569",
                fontWeight: 500,
                px: "6px",
              },
              "& .MuiChip-deleteIcon": {
                fontSize: "14px",
                color: "#94A3B8",
                mr: "4px",
                "&:hover": { color: "#475569" },
              },
            }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={selectedPeople.length === 0 ? "Search people..." : ""}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={14} sx={{ color: BRANDING.primary }} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: "13px",
              borderRadius: "6px",
              minHeight: "38px",
              padding: "4px 8px !important",
              backgroundColor: disabled ? "#F8FAFC" : "#fff",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: BRANDING.primary, borderWidth: "1px" },
            },
            "& .MuiInputBase-input": {
              padding: "4px 4px !important",
              fontSize: "13px",
              "&::placeholder": { color: "#94A3B8", opacity: 1 },
            },
          }}
        />
      )}
    />
  );
};
// src/webparts/submitChangeRequest/components/MultiPeoplePicker.tsx
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
import { BRANDING } from "../../../shared/theme/theme";

interface MultiPeoplePickerProps {
  label: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  excludeIds?: number[];
}

// Avatar colors
const AVATAR_COLORS = [
  BRANDING.primary,
  "#0D7D5F",
  "#7C3AED",
  "#B5850A",
  "#9E3A5A",
  "#0891B2",
];

const getColor = (name: string): string =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

  const handleSearch = async (searchText: string): Promise<void> => {
    if (searchText.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await SharePointService.searchUsers(searchText);
      const currentIds = selectedIds ?? [];
      setOptions(
        results.filter(
          (r) => !currentIds.includes(r.Id) && !excludeIds.includes(r.Id)
        )
      );
    } catch (error) {
      console.error("Error searching users:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Label */}
      {label && (
        <Typography
          sx={{
            fontSize: "11px",
            fontWeight: 500,
            color: "#64748B",
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
      )}

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
        onInputChange={(_, newInputValue) => {
          handleSearch(newInputValue).catch(console.error);
        }}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1,
              px: 1.5,
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: getColor(option.Title),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 600,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {getInitials(option.Title)}
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}
              >
                {option.Title}
              </Typography>
              {option.EMail && (
                <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>
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
              label={option.Title}
              size="small"
              avatar={
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: getColor(option.Title),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 600,
                    color: "#fff",
                    ml: 0.5,
                  }}
                >
                  {getInitials(option.Title)}
                </Box>
              }
              sx={{
                borderRadius: "4px",
                backgroundColor: "#F1F5F9",
                border: "none",
                "& .MuiChip-label": {
                  fontSize: "12px",
                  color: "#475569",
                  fontWeight: 500,
                  px: 0.75,
                },
                "& .MuiChip-deleteIcon": {
                  fontSize: 16,
                  color: "#94A3B8",
                  "&:hover": {
                    color: "#64748B",
                  },
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
                  {loading ? (
                    <CircularProgress
                      size={16}
                      sx={{ color: BRANDING.primary }}
                    />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "13px",
                borderRadius: "6px",
                minHeight: 38,
                padding: "4px 8px !important",
                "& fieldset": {
                  borderColor: "#E2E8F0",
                },
                "&:hover fieldset": {
                  borderColor: "#CBD5E1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: BRANDING.primary,
                  borderWidth: "1px",
                },
              },
              "& .MuiInputBase-input": {
                padding: "4px 8px !important",
                "&::placeholder": {
                  color: "#94A3B8",
                  opacity: 1,
                },
              },
            }}
          />
        )}
        sx={{
          "& .MuiAutocomplete-tag": {
            margin: "2px",
          },
        }}
      />
    </Box>
  );
};
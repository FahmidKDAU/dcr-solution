import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import SharePointService from "../../../shared/services/SharePointService";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";

interface MultiPeoplePickerProps {
  label: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

export const MultiPeoplePicker = ({
  label,
  selectedIds,
  onChange,
  disabled = false,
}: MultiPeoplePickerProps) => {
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
    // Guard against undefined selectedIds
    const currentIds = selectedIds ?? [];
    setOptions(results.filter(r => !currentIds.includes(r.Id)));
  } catch (error) {
    console.error("Error searching users:", error);
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
        onChange(newValue.map(p => p.Id));
      }}
      options={options}
      getOptionLabel={(option) => option.Title || ""}
      isOptionEqualToValue={(option, value) => option.Id === value.Id}
      loading={loading}
      disabled={disabled}
      onInputChange={(_, newInputValue) => {
        handleSearch(newInputValue).catch(console.error);
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option.Title}
            size="small"
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
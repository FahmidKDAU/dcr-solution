import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import SharePointService from "../../../shared/services/SharePointService";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";

interface PeoplePickerProps {
  label: string;
  value: SharePointPerson | null;
  onChange: (person: SharePointPerson | null) => void;
  required?: boolean;
  disabled?: boolean;
}

export const PeoplePicker = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: PeoplePickerProps) => {
  const [options, setOptions] = useState<SharePointPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSearch = async (searchText: string) => {
    if (searchText.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await SharePointService.searchUsers(searchText);
      setOptions(results);
    } catch (error) {
      console.error("Error searching users:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
        handleSearch(newInputValue);
      }}
      options={options}
      getOptionLabel={(option) => option.Title || ""}
      isOptionEqualToValue={(option, value) => option.Id === value.Id}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
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
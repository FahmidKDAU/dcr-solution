import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Document } from "../../../shared/types/Document";

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
  const selectedDoc = documents.find((d) => d.Id === value) ?? null;

  return (
    <Autocomplete
      options={documents}
      getOptionLabel={(doc) => doc.DocumentTitle}
      value={selectedDoc}
      onChange={(_, newValue) => onChange(newValue?.Id ?? undefined)}
      isOptionEqualToValue={(option, val) => option.Id === val.Id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Existing Document"
          required
          placeholder="Search by document title..."
        />
      )}
      filterOptions={(options, { inputValue }) =>
        options.filter((doc) =>
          doc.DocumentTitle.toLowerCase().includes(inputValue.toLowerCase()),
        )
      }
      noOptionsText="No documents found"
    />
  );
};

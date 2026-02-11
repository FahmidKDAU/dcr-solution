import React from "react";
import { ChangeRequestFormData } from "./ChangeRequestForm";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Document } from "../../../shared/types/Document";
import { PeoplePicker } from "./PeoplePicker";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";

interface AdditionalFormProps {
  data: ChangeRequestFormData;
  onChange: (field: keyof ChangeRequestFormData, value: any) => void;
  documents: Document[];
}

export const AdditionalForm = ({
  data,
  onChange,
  documents,
}: AdditionalFormProps) => {
  // Helper to convert person ID to person object for display
  // For now, return null - PeoplePicker will handle search
  const getPersonById = (id: number | null): SharePointPerson | null => {
    return null;
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <h2>Additional Details</h2>

      {/* Classification */}
      <FormControl fullWidth>
        <InputLabel>Classification</InputLabel>
        <Select
          label="Classification"
          value={data.classification}
          onChange={(e) => onChange("classification", e.target.value)}
        >
          <MenuItem value="Public">Public</MenuItem>
          <MenuItem value="Internal">Internal</MenuItem>
          <MenuItem value="Confidential">Confidential</MenuItem>
          <MenuItem value="Restricted">Restricted</MenuItem>
        </Select>
      </FormControl>

      {/* Urgency */}
      <FormControl fullWidth>
        <InputLabel>Urgency</InputLabel>
        <Select
          label="Urgency"
          value={data.urgency}
          onChange={(e) => onChange("urgency", e.target.value)}
        >
          <MenuItem value="Standard">Standard</MenuItem>
          <MenuItem value="Urgent">Urgent</MenuItem>
          <MenuItem value="Minor">Minor</MenuItem>
        </Select>
      </FormControl>

      {/* Release Authority (Person Picker) */}
      <PeoplePicker
        label="Release Authority"
        value={getPersonById(data.releaseAuthorityId)}
        onChange={(person) =>
          onChange("releaseAuthorityId", person?.Id || null)
        }
      />

      {/* Author (Person Picker) */}
      <PeoplePicker
        label="Author"
        value={data.author} // No more getPersonById!
        onChange={(person) => onChange("author", person)}
      />

      {/* Draft Document Name */}
      <TextField
        label="Draft Document Name"
        variant="outlined"
        fullWidth
        value={data.draftDocumentName}
        onChange={(e) => onChange("draftDocumentName", e.target.value)}
        helperText="Optional: Specify a name for the draft document"
      />
    </Box>
  );
};

import React from "react";
import { ChangeRequestFormData } from "./ChangeRequestForm";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Document } from "../../../shared/types/Document";
import { Department } from "../../../shared/types/Department";
import FileUpload from "../../components/FileUpload";
import { DocumentSearch } from "./DocumentSearch";

interface InitialFormProps {
  data: ChangeRequestFormData;
  onChange: (
    field: keyof ChangeRequestFormData,
    value: ChangeRequestFormData[keyof ChangeRequestFormData],
  ) => void;
  documents: Document[];
  departments: Department[];
  isExistingDocumentSelected?: boolean;
}

export const InitialForm = ({
  data,
  onChange,
  documents,
  departments,
  isExistingDocumentSelected = false,
}: InitialFormProps): React.ReactElement => {
  const isDocumentLocked = !!isExistingDocumentSelected;

  return (
    <Box display="flex" flexDirection="column">
      {/* Title Field */}
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        required
        value={data.title}
        onChange={(e) => onChange("title", e.target.value)}
      />

      {/* Scope of Change Field */}
      <TextField
        label="Scope of Change"
        variant="outlined"
        multiline
        rows={4}
        fullWidth
        required
        value={data.scopeOfChange}
        onChange={(e) => onChange("scopeOfChange", e.target.value)}
      />

      {/* New Document Radio Group */}
      <FormControl fullWidth>
        <FormLabel>New Document? *</FormLabel>
        <RadioGroup
          value={data.newDocument ? "yes" : "no"}
          onChange={(e) => onChange("newDocument", e.target.value === "yes")}
        >
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
      </FormControl>

      {!data.newDocument && (
        <DocumentSearch
          documents={documents}
          value={data.documentId}
          onChange={(id) => onChange("documentId", id)}
        />
      )}
      {/* Core Functionality Dropdown */}
      <FormControl fullWidth>
        <FormLabel>Core Functionality *</FormLabel>
        <Select
          label="Core Functionality"
          value={data.departmentId ?? ""}
          required
          disabled={isDocumentLocked}
          onChange={(e) => {
            const deptId = Number(e.target.value);
            const selectedDept = departments.find((d) => d.Id === deptId);

            // Update both department and change authority
            onChange("departmentId", deptId);
            onChange("changeAuthority", selectedDept?.ChangeAuthority);
          }}
        >
          {departments.map((dept) => (
            <MenuItem key={dept.Id} value={dept.Id}>
              {dept.Title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Auto-populated Change Authority */}
      <TextField
        label="Change Authority"
        value={data.changeAuthority?.Title || "Not assigned"}
        disabled
        fullWidth
        variant="outlined"
        helperText="Automatically assigned based on selected department"
      />

      {/* External Document Radio Group */}
      <FormControl fullWidth>
        <FormLabel>External Document? *</FormLabel>
        <RadioGroup
          row
          value={data.externalDocument ? "yes" : "no"}
          onChange={(e) =>
            onChange("externalDocument", e.target.value === "yes")
          }
        >
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
      </FormControl>

      {/* Urgency Field */}
      <FormControl fullWidth required>
        <FormLabel>Urgency</FormLabel>
        <Select
          value={data.urgency}
          onChange={(e) =>
            onChange(
              "urgency",
              e.target.value as "Standard" | "Urgent" | "Minor",
            )
          }
          required
        >
          <MenuItem value="Standard">Standard</MenuItem>
          <MenuItem value="Urgent">Urgent</MenuItem>
          <MenuItem value="Minor">Minor</MenuItem>
        </Select>
      </FormControl>
      {/* File Upload */}
      <FileUpload
        onFilesSelected={(files) => onChange("attachments", files)}
        maxFiles={5}
      />
    </Box>
  );
};

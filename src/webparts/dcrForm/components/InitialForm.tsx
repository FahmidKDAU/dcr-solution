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

interface InitialFormProps {
  data: ChangeRequestFormData;
  onChange: (field: keyof ChangeRequestFormData, value: any) => void;
  documents: Document[];
  departments: Department[];
}

export const InitialForm = ({
  data,
  onChange,
  documents,
  departments,
}: InitialFormProps) => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
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

      {/* Conditional Document Selection - Only show if NOT new document */}
      {!data.newDocument && (
        <FormControl fullWidth>
          <FormLabel>Select Existing Document *</FormLabel>
          <Select
            label="Select Existing Document"
            value={data.documentId || ""}
            onChange={(e) => onChange("documentId", Number(e.target.value))}
            required={!data.newDocument}
          >
            {documents.map((doc) => (
              <MenuItem key={doc.Id} value={doc.Id}>
                {doc.DocumentTitle}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Core Functionality Dropdown */}
      <FormControl fullWidth>
        <FormLabel>Core Functionality *</FormLabel>
        <Select
          label="Core Functionality"
          value={data.departmentId || ""}
          required
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

      {/* File Upload */}
      <FileUpload
        onFilesSelected={(files) => onChange("attachments", files)}
        maxFiles={5}
      />
    </Box>
  );
};
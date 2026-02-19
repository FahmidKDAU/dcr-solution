import React from "react";
import { ChangeRequestFormData } from "./ChangeRequestForm";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Document } from "../../../shared/types/Document";
import { PeoplePicker } from "./PeoplePicker";

interface AdditionalFormProps {
  data: ChangeRequestFormData;
  onChange: (
    field: keyof ChangeRequestFormData,
    value: ChangeRequestFormData[keyof ChangeRequestFormData],
  ) => void;
  documents: Document[];
  isExistingDocumentSelected?: boolean;
}

export const AdditionalForm = ({
  data,
  onChange,
  documents,
  isExistingDocumentSelected = false,
}: AdditionalFormProps): JSX.Element => {
  const isDocumentLocked = !!isExistingDocumentSelected;

  // Placeholder data - Replace with actual hooks when ready
  const documentTypes = [
    { Id: 1, Title: "Policy" },
    { Id: 2, Title: "Procedure" },
    { Id: 3, Title: "Work Instruction" },
    { Id: 4, Title: "Form" },
  ];

  const documentCategories = [
    { Id: 1, Title: "Quality" },
    { Id: 2, Title: "Safety" },
    { Id: 3, Title: "Environmental" },
    { Id: 4, Title: "HR" },
  ];

  const audiences = [
    { Id: 1, Title: "All Staff" },
    { Id: 2, Title: "Management" },
    { Id: 3, Title: "Department Specific" },
    { Id: 4, Title: "External" },
  ];

  const businessFunctions = [
    { Id: 1, Title: "Operations" },
    { Id: 2, Title: "Finance" },
    { Id: 3, Title: "HR" },
    { Id: 4, Title: "IT" },
  ];

  return (
    <Box>
      {/* Document Classification Section */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h3"
          sx={{
            marginBottom: 3,
            paddingBottom: 1,
            borderBottom: "2px solid",
            borderColor: "primary.main",
          }}
        >
          Document Classification
        </Typography>

        <Box display="flex" flexDirection="column">
          <FormControl fullWidth>
            <InputLabel>Document Type</InputLabel>
            <Select
              label="Document Type"
              value={data.documentTypeId ?? ""}
              disabled={isDocumentLocked}
              onChange={(e) =>
                onChange("documentTypeId", Number(e.target.value))
              }
            >
              {documentTypes.map((type) => (
                <MenuItem key={type.Id} value={type.Id}>
                  {type.Title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Document Category</InputLabel>
            <Select
              label="Document Category"
              value={data.documentCategoryIds[0] || ""}
              disabled={isDocumentLocked}
              onChange={(e) =>
                onChange("documentCategoryIds", [Number(e.target.value)])
              }
            >
              {documentCategories.map((category) => (
                <MenuItem key={category.Id} value={category.Id}>
                  {category.Title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Classification</InputLabel>
            <Select
              label="Classification"
              value={data.classification}
              disabled={isDocumentLocked}
              onChange={(e) => onChange("classification", e.target.value)}
            >
              <MenuItem value="Public">Public</MenuItem>
              <MenuItem value="Internal">Internal</MenuItem>
              <MenuItem value="Confidential">Confidential</MenuItem>
              <MenuItem value="Restricted">Restricted</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Audience</InputLabel>
            <Select
              label="Audience"
              value={data.audienceId ?? ""}
              disabled={isDocumentLocked}
              onChange={(e) => onChange("audienceId", Number(e.target.value))}
            >
              {audiences.map((audience) => (
                <MenuItem key={audience.Id} value={audience.Id}>
                  {audience.Title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Business Function</InputLabel>
            <Select
              label="Business Function"
              value={data.businessFunctionIds[0] || ""}
              disabled={isDocumentLocked}
              onChange={(e) =>
                onChange("businessFunctionIds", [Number(e.target.value)])
              }
            >
              {businessFunctions.map((func) => (
                <MenuItem key={func.Id} value={func.Id}>
                  {func.Title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Divider sx={{ marginY: 4 }} />

      {/* Document Team Section */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h3"
          sx={{
            marginBottom: 3,
            paddingBottom: 1,
            borderBottom: "2px solid",
            borderColor: "primary.main",
          }}
        >
          Document Team
        </Typography>

        <Box display="flex" flexDirection="column">
          <PeoplePicker
            label="Release Authority"
            value={data.releaseAuthority}
            onChange={(person) => onChange("releaseAuthority", person)}
            disabled={isDocumentLocked}
          />

          <PeoplePicker
            label="Author"
            value={data.author}
            onChange={(person) => onChange("author", person)}
            disabled={isDocumentLocked}
          />

          <PeoplePicker
            label="Reviewer"
            value={undefined}
            onChange={(person) => {
              onChange("reviewerIds", person?.Id ? [person.Id] : []);
            }}
          />

          <PeoplePicker
            label="Contributor"
            value={undefined}
            onChange={(person) => {
              onChange("contributorIds", person?.Id ? [person.Id] : []);
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ marginY: 4 }} />

      {/* Document Settings Section */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h3"
          sx={{
            marginBottom: 3,
            paddingBottom: 1,
            borderBottom: "2px solid",
            borderColor: "primary.main",
          }}
        >
          Document Settings
        </Typography>

        <TextField
          label="Draft Document Name"
          value={data.draftDocumentName}
          disabled={isDocumentLocked}
          onChange={(e) => onChange("draftDocumentName", e.target.value)}
          helperText="Optional: Specify a name for the draft document"
          placeholder="e.g., Safety_Policy_v2_Draft"
        />
      </Box>
    </Box>
  );
};

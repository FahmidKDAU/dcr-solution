// src/webparts/submitChangeRequest/components/InitialForm.tsx
import React from "react";
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Typography,
  Button,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ChangeRequestFormData } from "./ChangeRequestForm";
import { Document } from "../../../shared/types/Document";
import { Department } from "../../../shared/types/Department";
import { DocumentSearch } from "./DocumentSearch";
import { BRANDING } from "../../../shared/theme/theme";

interface InitialFormProps {
  data: ChangeRequestFormData;
  onChange: (
    field: keyof ChangeRequestFormData,
    value: ChangeRequestFormData[keyof ChangeRequestFormData]
  ) => void;
  documents: Document[];
  departments: Department[];
  isExistingDocumentSelected?: boolean;
}

// Styled label component
const FieldLabel: React.FC<{
  children: React.ReactNode;
  required?: boolean;
}> = ({ children, required }) => (
  <Typography
    component="label"
    sx={{
      fontSize: "12px",
      color: "#475569",
      fontWeight: 500,
      display: "block",
      marginBottom: "6px",
    }}
  >
    {children}
    {required && (
      <Box component="span" sx={{ color: "#B91C1C", ml: 0.5 }}>
        *
      </Box>
    )}
  </Typography>
);

// Common input styles
const inputSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: "14px",
    borderRadius: "6px",
    backgroundColor: "white",
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
    padding: "10px 14px",
  },
};

const selectSx = {
  fontSize: "14px",
  borderRadius: "6px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#E2E8F0",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#CBD5E1",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: BRANDING.primary,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    padding: "10px 14px",
  },
};

export const InitialForm: React.FC<InitialFormProps> = ({
  data,
  onChange,
  documents,
  departments,
  isExistingDocumentSelected = false,
}) => {
  const isDocumentLocked = !!isExistingDocumentSelected;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onChange("attachments", Array.from(files));
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px", mb: 3 }}>
      {/* Title */}
      <Box>
        <FieldLabel required>Title</FieldLabel>
        <TextField
          placeholder="Enter document title"
          fullWidth
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
          sx={inputSx}
        />
      </Box>

      {/* Scope of Change with integrated upload */}
      <Box>
        <FieldLabel required>Scope of change</FieldLabel>
        <TextField
          placeholder="Describe the proposed changes..."
          multiline
          rows={3}
          fullWidth
          value={data.scopeOfChange}
          onChange={(e) => onChange("scopeOfChange", e.target.value)}
          sx={{
            ...inputSx,
            "& .MuiOutlinedInput-root": {
              ...inputSx["& .MuiOutlinedInput-root"],
              borderRadius: "6px 6px 0 0",
              "& fieldset": {
                borderColor: "#E2E8F0",
                borderBottom: "none",
              },
            },
          }}
        />
        {/* Attached upload zone */}
        <Box
          sx={{
            border: "1px solid #E2E8F0",
            borderTop: "1px dashed #CBD5E1",
            borderRadius: "0 0 6px 6px",
            padding: "12px 14px",
            backgroundColor: "#FAFBFC",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              backgroundColor: "#F1F5F9",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 16, color: BRANDING.primary }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: "12px", color: "#475569" }}>
              Attach supporting document{" "}
              <Box component="span" sx={{ color: "#94A3B8" }}>
                (optional)
              </Box>
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#94A3B8", mt: 0.25 }}>
              {data.attachments.length > 0
                ? data.attachments.map((f) => f.name).join(", ")
                : "PDF, DOC, DOCX up to 10MB"}
            </Typography>
          </Box>
          <Button
            component="label"
            variant="outlined"
            size="small"
            sx={{
              padding: "6px 12px",
              fontSize: "12px",
              borderColor: "#E2E8F0",
              color: "#475569",
              textTransform: "none",
              "&:hover": {
                borderColor: "#CBD5E1",
                backgroundColor: "white",
              },
            }}
          >
            Browse
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleFileSelect}
              multiple
            />
          </Button>
        </Box>
      </Box>

      {/* New Document / External Document Row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* New Document */}
        <FormControl>
          <FormLabel
            sx={{
              fontSize: "12px",
              color: "#475569",
              fontWeight: 500,
              mb: 1,
              "&.Mui-focused": { color: "#475569" },
            }}
          >
            New document?{" "}
            <Box component="span" sx={{ color: "#B91C1C" }}>
              *
            </Box>
          </FormLabel>
          <RadioGroup
            row
            value={data.newDocument ? "yes" : "no"}
            onChange={(e) => onChange("newDocument", e.target.value === "yes")}
          >
            <FormControlLabel
              value="yes"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: "#CBD5E1",
                    "&.Mui-checked": { color: BRANDING.primary },
                  }}
                />
              }
              label={<Typography sx={{ fontSize: "14px" }}>Yes</Typography>}
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: "#CBD5E1",
                    "&.Mui-checked": { color: BRANDING.primary },
                  }}
                />
              }
              label={<Typography sx={{ fontSize: "14px" }}>No</Typography>}
            />
          </RadioGroup>
        </FormControl>

        {/* External Document */}
        <FormControl>
          <FormLabel
            sx={{
              fontSize: "12px",
              color: "#475569",
              fontWeight: 500,
              mb: 1,
              "&.Mui-focused": { color: "#475569" },
            }}
          >
            External document?{" "}
            <Box component="span" sx={{ color: "#B91C1C" }}>
              *
            </Box>
          </FormLabel>
          <RadioGroup
            row
            value={data.externalDocument ? "yes" : "no"}
            onChange={(e) =>
              onChange("externalDocument", e.target.value === "yes")
            }
          >
            <FormControlLabel
              value="yes"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: "#CBD5E1",
                    "&.Mui-checked": { color: BRANDING.primary },
                  }}
                />
              }
              label={<Typography sx={{ fontSize: "14px" }}>Yes</Typography>}
            />
            <FormControlLabel
              value="no"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: "#CBD5E1",
                    "&.Mui-checked": { color: BRANDING.primary },
                  }}
                />
              }
              label={<Typography sx={{ fontSize: "14px" }}>No</Typography>}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Select Existing Document (when New Document = No) */}
      {!data.newDocument && (
        <Box>
          <FieldLabel required>Select existing document</FieldLabel>
          <DocumentSearch
            documents={documents}
            value={data.documentId}
            onChange={(id) => onChange("documentId", id)}
          />
        </Box>
      )}

      {/* Core Functionality */}
      <Box>
        <FieldLabel required>Core functionality</FieldLabel>
        <Select
          value={data.departmentId ?? ""}
          displayEmpty
          fullWidth
          disabled={isDocumentLocked}
          onChange={(e) => {
            const deptId = Number(e.target.value);
            const selectedDept = departments.find((d) => d.Id === deptId);
            onChange("departmentId", deptId);
            onChange("changeAuthority", selectedDept?.ChangeAuthority);
          }}
          sx={selectSx}
        >
          <MenuItem value="" disabled>
            <Typography sx={{ color: "#94A3B8" }}>
              Select department...
            </Typography>
          </MenuItem>
          {departments.map((dept) => (
            <MenuItem key={dept.Id} value={dept.Id}>
              {dept.Title}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Change Authority (auto-populated, read-only) */}
      <Box>
        <FieldLabel>Change authority</FieldLabel>
        <Box
          sx={{
            padding: "10px 14px",
            border: "1px solid #E2E8F0",
            borderRadius: "6px",
            backgroundColor: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {data.changeAuthority ? (
            <>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "#E6F1FB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  color: BRANDING.primary,
                  fontWeight: 600,
                }}
              >
                {data.changeAuthority.Title.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </Box>
              <Typography sx={{ fontSize: "14px", color: "#1E293B" }}>
                {data.changeAuthority.Title}
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: "14px", color: "#94A3B8" }}>
              Not assigned
            </Typography>
          )}
          <Typography
            sx={{ fontSize: "11px", color: "#94A3B8", marginLeft: "auto" }}
          >
            Auto-assigned from department
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
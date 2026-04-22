// src/webparts/submitChangeRequest/components/AdditionalForm.tsx
import React from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Typography,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { ChangeRequestFormData } from "./ChangeRequestForm";
import { Document } from "../../../shared/types/Document";
import { PeoplePicker } from "./PeoplePicker";
import { MultiPeoplePicker } from "./MultiPeoplePicker";
import { useLookupData } from "../../../shared/hooks/useLookupData";
import { BRANDING } from "../../../shared/theme/theme";

interface AdditionalFormProps {
  data: ChangeRequestFormData;
  onChange: (
    field: keyof ChangeRequestFormData,
    value: ChangeRequestFormData[keyof ChangeRequestFormData],
  ) => void;
  documents: Document[];
  isExistingDocumentSelected?: boolean;
}

// Section header component
const SectionHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Typography
    sx={{
      fontSize: "12px",
      color: BRANDING.primary,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      fontWeight: 600,
      marginBottom: "14px",
      paddingBottom: "8px",
      borderBottom: "1px solid #E2E8F0",
    }}
  >
    {children}
  </Typography>
);

// Field label component
const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    component="label"
    sx={{
      fontSize: "11px",
      color: "#64748B",
      fontWeight: 500,
      display: "block",
      marginBottom: "5px",
    }}
  >
    {children}
  </Typography>
);

// Common select styles
const selectSx = {
  fontSize: "13px",
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
    padding: "9px 12px",
  },
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: "13px",
    borderRadius: "6px",
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
    padding: "9px 12px",
  },
};

export const AdditionalForm: React.FC<AdditionalFormProps> = ({
  data,
  onChange,
  isExistingDocumentSelected = false,
}) => {
  const isDocumentLocked = !!isExistingDocumentSelected;

  const { documentTypes, categories, audienceGroups, businessFunctions } =
    useLookupData();

  return (
    <Box>
      {/* Document Classification Section */}
      <Box sx={{ marginBottom: "24px" }}>
        <SectionHeader>Document classification</SectionHeader>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          {/* Document Type */}
          <Box>
            <FieldLabel>Document type</FieldLabel>
            <Select
              value={data.documentTypeId ?? ""}
              displayEmpty
              fullWidth
              disabled={isDocumentLocked}
              onChange={(e) =>
                onChange("documentTypeId", Number(e.target.value) || undefined)
              }
              sx={selectSx}
            >
              <MenuItem value="">
                <Typography sx={{ color: "#94A3B8", fontSize: "13px" }}>
                  Select...
                </Typography>
              </MenuItem>
              {documentTypes.map((type) => (
                <MenuItem key={type.Id} value={type.Id}>
                  {type.Title}
                </MenuItem>
              ))}
            </Select>
          </Box>
          {/* Category */}
          <Box>
            <FieldLabel>Category</FieldLabel>
            <Select
              multiple
              value={data.documentCategoryIds}
              displayEmpty
              fullWidth
              disabled={isDocumentLocked}
              input={<OutlinedInput />}
              onChange={(e) => {
                const val = e.target.value;
                onChange(
                  "documentCategoryIds",
                  typeof val === "string" ? [] : (val as number[]),
                );
              }}
              renderValue={(selected) => {
                if ((selected as number[]).length === 0) {
                  return (
                    <Typography sx={{ color: "#94A3B8", fontSize: "13px" }}>
                      Select...
                    </Typography>
                  );
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as number[]).map((id) => {
                      const cat = categories.find((c) => c.Id === id);
                      return (
                        <Chip
                          key={id}
                          label={cat?.Title ?? id}
                          size="small"
                          sx={{ fontSize: "12px", height: "22px" }}
                        />
                      );
                    })}
                  </Box>
                );
              }}
              sx={{
                ...selectSx,
                "& .MuiSelect-select": {
                  padding: "8px 12px",
                  minHeight: "38px",
                },
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category.Id} value={category.Id}>
                  <Checkbox
                    checked={data.documentCategoryIds.includes(category.Id)}
                    size="small"
                    sx={{
                      padding: "2px 8px 2px 0",
                      color: "#CBD5E1",
                      "&.Mui-checked": { color: BRANDING.primary },
                    }}
                  />
                  <ListItemText
                    primary={category.Title}
                    primaryTypographyProps={{ fontSize: "13px" }}
                  />
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Classification */}
          <Box>
            <FieldLabel>Classification</FieldLabel>
            <Select
              value={data.classification}
              displayEmpty
              fullWidth
              disabled={isDocumentLocked}
              onChange={(e) => onChange("classification", e.target.value)}
              sx={selectSx}
            >
              <MenuItem value="">
                <Typography sx={{ color: "#94A3B8", fontSize: "13px" }}>
                  Select...
                </Typography>
              </MenuItem>
              <MenuItem value="Public">Public</MenuItem>
              <MenuItem value="Internal">Internal</MenuItem>
              <MenuItem value="Confidential">Confidential</MenuItem>
              <MenuItem value="Restricted">Restricted</MenuItem>
            </Select>
          </Box>

          {/* Audience */}
          <Box>
            <FieldLabel>Audience</FieldLabel>
            <Select
              value={data.audienceId ?? ""}
              displayEmpty
              fullWidth
              disabled={isDocumentLocked}
              onChange={(e) =>
                onChange("audienceId", Number(e.target.value) || undefined)
              }
              sx={selectSx}
            >
              <MenuItem value="">
                <Typography sx={{ color: "#94A3B8", fontSize: "13px" }}>
                  Select...
                </Typography>
              </MenuItem>
              {audienceGroups.map((audience) => (
                <MenuItem key={String(audience.Id)} value={audience.Id}>
                  {audience.Title}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Business Function */}
          <Box>
            <FieldLabel>Business function</FieldLabel>
            <Select
              multiple
              value={data.businessFunctionIds}
              displayEmpty
              fullWidth
              disabled={isDocumentLocked}
              input={<OutlinedInput />}
              onChange={(e) => {
                const val = e.target.value;
                onChange(
                  "businessFunctionIds",
                  typeof val === "string" ? [] : (val as number[]),
                );
              }}
              renderValue={(selected) => {
                if ((selected as number[]).length === 0) {
                  return (
                    <Typography sx={{ color: "#94A3B8", fontSize: "13px" }}>
                      Select...
                    </Typography>
                  );
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as number[]).map((id) => {
                      const func = businessFunctions.find((f) => f.Id === id);
                      return (
                        <Chip
                          key={id}
                          label={func?.Title ?? id}
                          size="small"
                          sx={{ fontSize: "12px", height: "22px" }}
                        />
                      );
                    })}
                  </Box>
                );
              }}
              sx={{
                ...selectSx,
                "& .MuiSelect-select": {
                  padding: "8px 12px",
                  minHeight: "38px",
                },
              }}
            >
              {businessFunctions.map((func) => (
                <MenuItem key={func.Id} value={func.Id}>
                  <Checkbox
                    checked={data.businessFunctionIds.includes(func.Id)}
                    size="small"
                    sx={{
                      padding: "2px 8px 2px 0",
                      color: "#CBD5E1",
                      "&.Mui-checked": { color: BRANDING.primary },
                    }}
                  />
                  <ListItemText
                    primary={func.Title}
                    primaryTypographyProps={{ fontSize: "13px" }}
                  />
                </MenuItem>
              ))}
            </Select>
          </Box>
          {/* Urgency */}
          <Box>
            <FieldLabel>Urgency</FieldLabel>
            <Select
              value={data.urgency}
              displayEmpty
              fullWidth
              onChange={(e) =>
                onChange("urgency", e.target.value as "Standard" | "Urgent")
              }
              sx={selectSx}
            >
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Urgent">Urgent</MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>

      {/* Document Team Section */}
      <Box sx={{ marginBottom: "24px" }}>
        <SectionHeader>Document team</SectionHeader>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          {/* Release Authority */}
          <Box>
            <FieldLabel>Release authority</FieldLabel>
            <PeoplePicker
              label=""
              value={data.releaseAuthority}
              onChange={(person) => onChange("releaseAuthority", person)}
              disabled={isDocumentLocked}
            />
          </Box>

          {/* Author */}
          <Box>
            <FieldLabel>Author</FieldLabel>
            <PeoplePicker
              label=""
              value={data.author}
              onChange={(person) => onChange("author", person)}
              disabled={isDocumentLocked}
            />
          </Box>

          {/* Reviewers */}
          <Box>
            <FieldLabel>Reviewers</FieldLabel>
            <MultiPeoplePicker
              label=""
              selectedIds={data.reviewerIds}
              onChange={(ids) => onChange("reviewerIds", ids)}
              excludeIds={data.contributorIds}
            />
          </Box>

          {/* Contributors */}
          <Box>
            <FieldLabel>Contributors</FieldLabel>
            <MultiPeoplePicker
              label=""
              selectedIds={data.contributorIds}
              onChange={(ids) => onChange("contributorIds", ids)}
              excludeIds={data.reviewerIds}
            />
          </Box>
        </Box>
      </Box>

      {/* Document Settings Section */}
      <Box>
        <SectionHeader>Document settings</SectionHeader>

        <Box>
          <FieldLabel>Draft document name</FieldLabel>
          <TextField
            placeholder="e.g., Safety_Policy_v2_Draft"
            fullWidth
            value={data.draftDocumentName}
            disabled={isDocumentLocked}
            onChange={(e) => onChange("draftDocumentName", e.target.value)}
            sx={inputSx}
          />
          <Typography
            sx={{
              fontSize: "11px",
              color: "#94A3B8",
              marginTop: "6px",
            }}
          >
            Optional: Specify a name for the draft document
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

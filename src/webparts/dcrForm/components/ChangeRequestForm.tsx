// src/webparts/submitChangeRequest/components/ChangeRequestForm.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Collapse,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";
import { useDocuments } from "../../../shared/hooks/useDocuments";
import { useDepartments } from "../../../shared/hooks/useDepartments";
import SharePointService from "../../../shared/services/SharePointService";
import { InitialForm } from "./InitialForm";
import { AdditionalForm } from "./AdditionalForm";
import { BRANDING } from "../../../shared/theme/theme";

export interface ChangeRequestFormData {
  // Required fields
  title: string;
  scopeOfChange: string;
  newDocument: boolean;
  externalDocument: boolean;
  departmentId: number | undefined;
  changeAuthority: SharePointPerson | undefined;
  documentId: number | undefined;
  attachments: File[];

  // Optional fields (Additional Details)
  documentTypeId: number | undefined;
  documentCategoryIds: number[];
  classification: "Public" | "Internal" | "Confidential" | "Restricted" | "";
  audienceId: number | undefined;
  businessFunctionIds: number[];
  urgency: "Standard" | "Urgent" | "";
  releaseAuthority: SharePointPerson | undefined;
  author: SharePointPerson | undefined;
  reviewerIds: number[];
  contributorIds: number[];
  draftDocumentName: string;
}

const ChangeRequestForm: React.FC = () => {
  const [additionalDetailsOpen, setAdditionalDetailsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const documentTypeOptions = [
    { Id: 1, Title: "Policy" },
    { Id: 2, Title: "Procedure" },
    { Id: 3, Title: "Work Instruction" },
    { Id: 4, Title: "Form" },
  ];

  const mapDocumentTypeToId = (
    documentType?: string | null
  ): number | undefined => {
    if (!documentType) return undefined;
    const match = documentTypeOptions.find(
      (type) => type.Title.toLowerCase() === documentType.toLowerCase()
    );
    return match?.Id ?? undefined;
  };

  const [formData, setFormData] = useState<ChangeRequestFormData>({
    // Required fields
    title: "",
    scopeOfChange: "",
    departmentId: undefined,
    newDocument: true,
    externalDocument: false,
    changeAuthority: undefined,
    documentId: undefined,
    attachments: [],

    // Optional fields
    documentTypeId: undefined,
    documentCategoryIds: [],
    classification: "",
    audienceId: undefined,
    businessFunctionIds: [],
    urgency: "Standard",
    releaseAuthority: undefined,
    author: undefined,
    reviewerIds: [],
    contributorIds: [],
    draftDocumentName: "",
  });

  const isExistingDocumentSelected =
    !formData.newDocument && !!formData.documentId;

  const { documents } = useDocuments();
  const { departments } = useDepartments();

  // Auto-populate from existing document
  useEffect(() => {
    const autoPopulateFromDocument = async (): Promise<void> => {
      if (formData.newDocument || !formData.documentId) return;

      try {
        const selectedDoc = await SharePointService.getDocumentById(
          formData.documentId
        );

        if (!selectedDoc) return;

        setFormData((prev) => ({
          ...prev,
          departmentId: selectedDoc.CoreFunctionality?.Id,
          changeAuthority: selectedDoc.ChangeAuthority ?? undefined,
          businessFunctionIds:
            selectedDoc.BusinessFunction?.map((bf) => bf.Id) || [],
          documentCategoryIds: selectedDoc.Category?.map((dc) => dc.Id) || [],
          documentTypeId: mapDocumentTypeToId(selectedDoc.DocumentType?.Title),
          classification: selectedDoc.Classification || "",
          audienceId: selectedDoc.Audience?.Id,
          releaseAuthority: selectedDoc.ReleaseAuthority ?? undefined,
          author: selectedDoc.Author0 ?? undefined,
          draftDocumentName: selectedDoc.DocumentTitle || "",
        }));
      } catch (error) {
        console.error("Error auto-populating from document:", error);
      }
    };

    autoPopulateFromDocument().catch(console.error);
  }, [formData.documentId, formData.newDocument]);

  // Reset fields when switching to New Document
  useEffect(() => {
    if (!formData.newDocument) return;

    setFormData((prev) => ({
      ...prev,
      documentId: undefined,
      departmentId: undefined,
      changeAuthority: undefined,
      externalDocument: false,
      businessFunctionIds: [],
      documentCategoryIds: [],
      documentTypeId: undefined,
      classification: "",
      audienceId: undefined,
      releaseAuthority: undefined,
      author: undefined,
      draftDocumentName: "",
    }));
  }, [formData.newDocument]);

  const handleFieldChange = (
    field: keyof ChangeRequestFormData,
    value: ChangeRequestFormData[keyof ChangeRequestFormData]
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.title &&
      formData.scopeOfChange &&
      formData.departmentId &&
      (formData.newDocument || formData.documentId)
    );
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitError(null);

    if (!isFormValid()) {
      setSubmitError("Please fill in all required fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        Title: formData.title,
        ScopeofChange: formData.scopeOfChange,
        NewDocument: formData.newDocument,
        ExternalDocument: formData.externalDocument,
        CoreFunctionalityId: formData.departmentId,
        ChangeAuthorityId: formData.changeAuthority?.Id,
        Urgency: formData.urgency || "Standard",
        Status: "Submitted",
        TargetDocumentId: formData.documentId || undefined,
        Classification: formData.classification || undefined,
        AudienceId: formData.audienceId || undefined,
        DraftDocumentName: formData.draftDocumentName || undefined,
        ReleaseAuthorityId: formData.releaseAuthority?.Id || undefined,
        Author0Id: formData.author?.Id || undefined,
        ReviewersId:
          formData.reviewerIds.length > 0 ? formData.reviewerIds : undefined,
        ContributorsId:
          formData.contributorIds.length > 0
            ? formData.contributorIds
            : undefined,
        BusinessFunctionId:
          formData.businessFunctionIds.length > 0
            ? formData.businessFunctionIds
            : undefined,
        CategoryId:
          formData.documentCategoryIds.length > 0
            ? formData.documentCategoryIds
            : undefined,
        isCrComplete: !!(formData.releaseAuthority && formData.author),
      };

      await SharePointService.createChangeRequest(payload);

      const changeRequests = await SharePointService.getChangeRequests();
      const latestItem = changeRequests[changeRequests.length - 1];
      const itemId = latestItem?.Id;

      if (!itemId) {
        throw new Error("Unable to resolve the created Change Request ID.");
      }

      // Create participant rows
      if (
        formData.reviewerIds.length > 0 ||
        formData.contributorIds.length > 0
      ) {
        await SharePointService.createParticipant(
          itemId,
          formData.contributorIds,
          formData.reviewerIds
        );
      }

      // Upload attachments
      if (formData.attachments.length > 0) {
        await SharePointService.uploadAttachments(
          itemId,
          formData.attachments,
          (current, total, fileName) => {
            console.log(`Uploading file ${current} of ${total}: ${fileName}`);
          }
        );
      }

      alert(
        `Success! Change Request created.\n\nCR Number: ${
          latestItem.ChangeRequestNumber || itemId
        }\nID: ${itemId}`
      );

      // Reset form
      setFormData({
        title: "",
        scopeOfChange: "",
        departmentId: undefined,
        newDocument: false,
        changeAuthority: undefined,
        documentId: undefined,
        attachments: [],
        documentTypeId: undefined,
        documentCategoryIds: [],
        classification: "",
        audienceId: undefined,
        businessFunctionIds: [],
        urgency: "Standard",
        releaseAuthority: undefined,
        author: undefined,
        reviewerIds: [],
        contributorIds: [],
        draftDocumentName: "",
        externalDocument: false,
      });
      setAdditionalDetailsOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error:", error);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: "white",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: BRANDING.primary,
          padding: "20px 24px",
        }}
      >
        <Typography
          sx={{
            fontSize: "18px",
            fontWeight: 500,
            color: "white",
            marginBottom: "4px",
          }}
        >
          Submit Change Request
        </Typography>
        <Typography
          sx={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          Request a new or updated document
        </Typography>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ padding: "24px" }}
      >
        {/* Error Alert */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        {/* Required Fields */}
        <InitialForm
          data={formData}
          onChange={handleFieldChange}
          documents={documents}
          departments={departments}
          isExistingDocumentSelected={isExistingDocumentSelected}
        />

        {/* Additional Details (Expandable) */}
        <Box
          sx={{
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            marginBottom: "24px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            onClick={() => setAdditionalDetailsOpen(!additionalDetailsOpen)}
            sx={{
              padding: "14px 20px",
              backgroundColor: additionalDetailsOpen ? "#F8FAFC" : "#F8FAFC",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              borderBottom: additionalDetailsOpen
                ? "1px solid #E2E8F0"
                : "none",
              "&:hover": {
                backgroundColor: "#F1F5F9",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: additionalDetailsOpen ? BRANDING.primary : "#475569",
                }}
              >
                Additional details
              </Typography>
              <Box
                component="span"
                sx={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  backgroundColor: additionalDetailsOpen
                    ? "#E6F1FB"
                    : "#E2E8F0",
                  color: additionalDetailsOpen ? BRANDING.primary : "#64748B",
                  borderRadius: "4px",
                }}
              >
                Optional
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {!additionalDetailsOpen && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#94A3B8",
                  }}
                >
                  Classification, team, settings
                </Typography>
              )}
              {additionalDetailsOpen ? (
                <ExpandLessIcon sx={{ color: BRANDING.primary, fontSize: 20 }} />
              ) : (
                <ExpandMoreIcon sx={{ color: BRANDING.primary, fontSize: 20 }} />
              )}
            </Box>
          </Box>

          {/* Content */}
          <Collapse in={additionalDetailsOpen}>
            <Box sx={{ padding: "20px" }}>
              <AdditionalForm
                data={formData}
                onChange={handleFieldChange}
                documents={documents}
                isExistingDocumentSelected={isExistingDocumentSelected}
              />
            </Box>
          </Collapse>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!isFormValid() || isSubmitting}
          sx={{
            padding: "14px",
            fontSize: "14px",
            fontWeight: 500,
            backgroundColor: BRANDING.primary,
            borderRadius: "6px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: BRANDING.primaryDark,
            },
            "&.Mui-disabled": {
              backgroundColor: "#CBD5E1",
              color: "white",
            },
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Change Request"}
        </Button>
      </Box>
    </Box>
  );
};

export default ChangeRequestForm;
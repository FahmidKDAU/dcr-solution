// src/webparts/submitChangeRequest/components/ChangeRequestForm.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Collapse,
  Alert,
  Fade,
  Slide,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
  title: string;
  scopeOfChange: string;
  newDocument: boolean;
  externalDocument: boolean;
  departmentId: number | undefined;
  changeAuthority: SharePointPerson | undefined;
  documentId: number | undefined;
  attachments: File[];
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

const EMPTY_FORM: ChangeRequestFormData = {
  title: "",
  scopeOfChange: "",
  departmentId: undefined,
  newDocument: true,
  externalDocument: false,
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
};

// ─── Success Screen ───────────────────────────────────────────────────────────

interface SuccessScreenProps {
  onSubmitAnother: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onSubmitAnother }) => (
  <Box
    sx={{
      minHeight: "100%",
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Header */}
    <Box sx={{ backgroundColor: BRANDING.primary, padding: "20px 24px" }}>
      <Typography sx={{ fontSize: "18px", fontWeight: 500, color: "white", mb: "4px" }}>
        Submit Change Request
      </Typography>
      <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
        Request a new or updated document
      </Typography>
    </Box>

    {/* Success content */}
    <Slide in direction="up" timeout={500} appear>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "#DFF6DD",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 40, color: "#107C10" }} />
        </Box>

        {/* Title */}
        <Typography
          sx={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#1E293B",
            mb: 1.5,
          }}
        >
          Change Request Submitted
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontSize: "14px",
            color: "#64748B",
            lineHeight: 1.6,
            maxWidth: 420,
            mb: 1.5,
          }}
        >
          Your change request has been submitted successfully and is now being
          reviewed by the Change Authority.
        </Typography>

        <Typography
          sx={{
            fontSize: "13px",
            color: "#94A3B8",
            lineHeight: 1.6,
            maxWidth: 420,
            mb: 4,
          }}
        >
          You will receive an email notification with updates as your request
          progresses through the review process.
        </Typography>

        {/* Actions */}
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          <Button
            variant="contained"
            onClick={onSubmitAnother}
            sx={{
              padding: "10px 24px",
              fontSize: "13px",
              fontWeight: 500,
              backgroundColor: BRANDING.primary,
              borderRadius: "6px",
              textTransform: "none",
              "&:hover": { backgroundColor: BRANDING.primaryDark },
            }}
          >
            Submit Another Request
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              window.open(
                `${window.location.origin}/sites/DocumentChangeManagementDemo/SitePages/Document-Portal.aspx`,
                "_blank"
              )
            }
            sx={{
              padding: "10px 24px",
              fontSize: "13px",
              fontWeight: 500,
              borderColor: BRANDING.primary,
              color: BRANDING.primary,
              borderRadius: "6px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#EFF6FC",
                borderColor: BRANDING.primary,
              },
            }}
          >
            Go to Document Portal
          </Button>
        </Box>
      </Box>
    </Slide>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ChangeRequestForm: React.FC = () => {
  const [additionalDetailsOpen, setAdditionalDetailsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const documentTypeOptions = [
    { Id: 1, Title: "Policy" },
    { Id: 2, Title: "Procedure" },
    { Id: 3, Title: "Work Instruction" },
    { Id: 4, Title: "Form" },
  ];

  const mapDocumentTypeToId = (documentType?: string | null): number | undefined => {
    if (!documentType) return undefined;
    const match = documentTypeOptions.find(
      (type) => type.Title.toLowerCase() === documentType.toLowerCase()
    );
    return match?.Id ?? undefined;
  };

  const [formData, setFormData] = useState<ChangeRequestFormData>(EMPTY_FORM);

  const isExistingDocumentSelected = !formData.newDocument && !!formData.documentId;
  const { documents } = useDocuments();
  const { departments } = useDepartments();

  // Auto-populate from existing document
  useEffect(() => {
    const autoPopulateFromDocument = async (): Promise<void> => {
      if (formData.newDocument || !formData.documentId) return;
      try {
        const selectedDoc = await SharePointService.getDocumentById(formData.documentId);
        if (!selectedDoc) return;
        setFormData((prev) => ({
          ...prev,
          departmentId: selectedDoc.CoreFunctionality?.Id,
          changeAuthority: selectedDoc.ChangeAuthority ?? undefined,
          businessFunctionIds: selectedDoc.BusinessFunction?.map((bf) => bf.Id) || [],
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.title &&
      formData.scopeOfChange &&
      formData.departmentId &&
      (formData.newDocument || formData.documentId)
    );
  };

  const handleSubmitAnother = (): void => {
    setSubmitted(false);
    setFormData({ ...EMPTY_FORM, newDocument: false });
    setAdditionalDetailsOpen(false);
    setSubmitError(null);
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
        ReviewersId: formData.reviewerIds.length > 0 ? formData.reviewerIds : undefined,
        ContributorsId: formData.contributorIds.length > 0 ? formData.contributorIds : undefined,
        BusinessFunctionId: formData.businessFunctionIds.length > 0 ? formData.businessFunctionIds : undefined,
        CategoryId: formData.documentCategoryIds.length > 0 ? formData.documentCategoryIds : undefined,
        isCrComplete: !!(formData.releaseAuthority && formData.author),
      };

      await SharePointService.createChangeRequest(payload);

      const changeRequests = await SharePointService.getChangeRequests();
      const latestItem = changeRequests[changeRequests.length - 1];
      const itemId = latestItem?.Id;

      if (!itemId) throw new Error("Unable to resolve the created Change Request ID.");

      // Create participant rows
      if (formData.reviewerIds.length > 0 || formData.contributorIds.length > 0) {
        await SharePointService.createParticipant(itemId, formData.contributorIds, formData.reviewerIds);
      }

      // Upload attachments
      if (formData.attachments.length > 0) {
        await SharePointService.uploadAttachments(itemId, formData.attachments, (current, total, fileName) => {
          console.log(`Uploading file ${current} of ${total}: ${fileName}`);
        });
      }

      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error:", error);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <Fade in={submitted} timeout={400} appear>
        <Box sx={{ minHeight: "100%", backgroundColor: "white" }}>
          <SuccessScreen onSubmitAnother={handleSubmitAnother} />
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ minHeight: "100%", backgroundColor: "white" }}>
      {/* Header */}
      <Box sx={{ backgroundColor: BRANDING.primary, padding: "20px 24px" }}>
        <Typography sx={{ fontSize: "18px", fontWeight: 500, color: "white", marginBottom: "4px" }}>
          Submit Change Request
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
          Request a new or updated document
        </Typography>
      </Box>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ padding: "24px" }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        <InitialForm
          data={formData}
          onChange={handleFieldChange}
          documents={documents}
          departments={departments}
          isExistingDocumentSelected={isExistingDocumentSelected}
        />

        {/* Additional Details */}
        <Box
          sx={{
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            marginBottom: "24px",
            overflow: "hidden",
          }}
        >
          <Box
            onClick={() => setAdditionalDetailsOpen(!additionalDetailsOpen)}
            sx={{
              padding: "14px 20px",
              backgroundColor: "#F8FAFC",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              borderBottom: additionalDetailsOpen ? "1px solid #E2E8F0" : "none",
              "&:hover": { backgroundColor: "#F1F5F9" },
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
                  backgroundColor: additionalDetailsOpen ? "#E6F1FB" : "#E2E8F0",
                  color: additionalDetailsOpen ? BRANDING.primary : "#64748B",
                  borderRadius: "4px",
                }}
              >
                Optional
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {!additionalDetailsOpen && (
                <Typography sx={{ fontSize: "12px", color: "#94A3B8" }}>
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
            "&:hover": { backgroundColor: BRANDING.primaryDark },
            "&.Mui-disabled": { backgroundColor: "#CBD5E1", color: "white" },
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Change Request"}
        </Button>
      </Box>
    </Box>
  );
};

export default ChangeRequestForm;
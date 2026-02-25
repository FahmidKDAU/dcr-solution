import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { Task } from "../../../../shared/types/Task";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";
import { AdditionalForm } from "../../../dcrForm/components/AdditionalForm";
import { ChangeRequestFormData } from "../../../dcrForm/components/ChangeRequestForm";
import SharePointService from "../../../../shared/services/SharePointService";
import { useDocuments } from "../../../../shared/hooks/useDocuments";

interface CAReviewTaskProps {
  task: Task;
  cr: IChangeRequest | null;
  onTaskComplete?: () => void;
}

// Map CR data to ChangeRequestFormData shape
const mapCRToFormData = (cr: IChangeRequest): ChangeRequestFormData => ({
  title: cr.Title ?? "",
  scopeOfChange: cr.ScopeOfChange ?? "",
  newDocument: cr.NewDocument ?? false,
  departmentId: cr.CoreFunctionality?.Id ?? undefined,
  changeAuthority: cr.ChangeAuthority ?? undefined,
  documentId: undefined,
  attachments: [],
  documentTypeId: undefined,
  documentCategoryIds: cr.Categories?.map(c => c.Id) ?? [],
  classification: cr.Classification ?? "",
  audienceId: cr.Audience?.Id ?? undefined,
  businessFunctionIds: cr.BusinessFunction?.map(bf => bf.Id) ?? [],
  urgency: cr.Urgency ?? "Standard",
  releaseAuthority: cr.ReleaseAuthority ?? undefined,
  author: cr.Author ?? undefined,
  reviewerIds: cr.Reviewers?.map(r => r.Id) ?? [],
  contributorIds: cr.Contributors?.map(c => c.Id) ?? [],
  draftDocumentName: cr.DraftDocumentName ?? "",
});

const CAReviewTask = ({ task, cr, onTaskComplete }: CAReviewTaskProps) => {
  const { documents } = useDocuments();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<ChangeRequestFormData>(
    cr ? mapCRToFormData(cr) : {
      title: "",
      scopeOfChange: "",
      newDocument: false,
      departmentId: undefined,
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
    }
  );

  const handleFieldChange = (
    field: keyof ChangeRequestFormData,
    value: ChangeRequestFormData[keyof ChangeRequestFormData]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validate required CA Review fields
  const isValid = (): boolean => {
    return !!(
      formData.releaseAuthority &&
      formData.author &&
      formData.reviewerIds.length > 0 &&
      formData.urgency
    );
  };

  const handleSubmit = async (): Promise<void> => {
    if (!cr?.ID) return;

    try {
      setSubmitting(true);

      await SharePointService.updateChangeRequest(cr.ID, {
        ReleaseAuthorityId: formData.releaseAuthority?.Id,
        Author0Id: formData.author?.Id,
        ReviewersId: { results: formData.reviewerIds },
        ContributorsId: { results: formData.contributorIds },
        Urgency: formData.urgency,
        AudienceId: formData.audienceId ?? null,
        BusinessFunctionId: formData.businessFunctionIds.length > 0
          ? { results: formData.businessFunctionIds }
          : undefined,
        Classification: formData.classification || undefined,
        DraftDocumentName: formData.draftDocumentName || undefined,
      });

      // Update task status to complete
      await SharePointService.updateTask(task.Id, {
        Status: "Complete",
      });

      onTaskComplete?.();
    } catch (error) {
      console.error("Error submitting CA Review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!cr) {
    return (
      <Box p={3}>
        <Typography color="text.secondary">Loading change request...</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">

      {/* Instructions */}
      <Box px={3} pt={2} pb={1}>
        <Typography variant="body2" color="text.secondary">
          Please review and complete all required fields before submitting.
          Fields marked with * are required.
        </Typography>
      </Box>

      {/* AdditionalForm — pre-populated from CR */}
      <Box flex={1} overflow="auto" px={3} pb={2}>
        <AdditionalForm
          data={formData}
          onChange={handleFieldChange}
          documents={documents}
          isExistingDocumentSelected={!cr.NewDocument}
        />
      </Box>

      {/* Validation message */}
      {!isValid() && (
        <Box px={3} pb={1}>
          <Typography variant="caption" color="error">
            * Release Authority, Author, and at least one Reviewer are required
          </Typography>
        </Box>
      )}

      {/* Action buttons pinned to bottom */}
      <Box
        px={3}
        py={2}
        borderTop="1px solid #e0e0e0"
        display="flex"
        justifyContent="flex-end"
        gap={2}
        sx={{ backgroundColor: "#fafafa" }}
      >
        <Button variant="outlined" color="error">
          Reject
        </Button>
        <Button
          variant="contained"
          color="success"
          disabled={!isValid() || submitting}
          onClick={handleSubmit}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Review"}
        </Button>
      </Box>

    </Box>
  );
};

export default CAReviewTask;
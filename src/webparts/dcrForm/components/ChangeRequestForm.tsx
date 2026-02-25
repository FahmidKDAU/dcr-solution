import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import SharePointService from "../../../shared/services/SharePointService";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";
import { useDocuments } from "../../../shared/hooks/useDocuments";
import { InitialForm } from "./InitialForm";
import { AdditionalForm } from "./AdditionalForm";
import { useDepartments } from "../../../shared/hooks/useDepartments";

interface DcrFormProps {
  context?: unknown;
}

export interface ChangeRequestFormData {
  // Tab 1: General Information
  title: string;
  newDocument: boolean;
  scopeOfChange: string;
  departmentId: number | undefined;
  changeAuthority: SharePointPerson | undefined;
  documentId: number | undefined;
  attachments: File[];

  // Tab 2: Additional Details
  documentTypeId: number | undefined;
  documentCategoryIds: number[];
  classification: "Public" | "Internal" | "Confidential" | "Restricted" | "";
  audienceId: number | undefined;
  businessFunctionIds: number[];
  urgency: "Standard" | "Urgent" | "Minor" | "";
  releaseAuthority: SharePointPerson | undefined;
  author: SharePointPerson | undefined;
  reviewerIds: number[];
  contributorIds: number[];
  draftDocumentName: string;
}

// TabPanel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({
  children,
  value,
  index,
}: TabPanelProps): React.ReactElement => {
  return (
    <div role="tabpanel" hidden={value !== index}>
 <Box>{children}</Box>
    </div>
  );
};

const ChangeRequestForm = (props: DcrFormProps): React.ReactElement => {
  const [tabValue, setTabValue] = useState(0);

  const documentTypeOptions = [
    { Id: 1, Title: "Policy" },
    { Id: 2, Title: "Procedure" },
    { Id: 3, Title: "Work Instruction" },
    { Id: 4, Title: "Form" },
  ];

  const mapDocumentTypeToId = (
    documentType?: string | null,
  ): number | undefined => {
    if (!documentType) {
      return undefined;
    }

    const match = documentTypeOptions.find(
      (type) => type.Title.toLowerCase() === documentType.toLowerCase(),
    );

    return match?.Id ?? undefined;
  };

  const [formData, setFormData] = useState<ChangeRequestFormData>({
    // Tab 1: Basic Request (Required)
    title: "",
    scopeOfChange: "",
    departmentId: undefined,
    newDocument: false,
    changeAuthority: undefined,
    documentId: undefined,
    attachments: [],

    // Tab 2: Additional Details (Optional)
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

  // Auto-populate Part 2 when existing document is selected
  useEffect(() => {
    const autoPopulateFromDocument = async (): Promise<void> => {
      // Only auto-populate if NOT a new document AND a document is selected
      if (formData.newDocument || !formData.documentId) {
        return;
      }

      try {
        console.log(`Auto-populating from document ID: ${formData.documentId}`);

        // Fetch full document details with metadata
        const selectedDoc = await SharePointService.getDocumentById(
          formData.documentId,
        );

        if (!selectedDoc) {
          console.warn("Selected document not found.");
          return;
        }

        console.log("Selected document metadata:", selectedDoc);

        // Auto-populate Part 2 fields from document metadata
        setFormData((prev) => ({
          ...prev,
          departmentId: selectedDoc.CoreFunctionality?.Id,
          changeAuthority: selectedDoc.ChangeAuthority ?? undefined,
          businessFunctionIds:
            selectedDoc.BusinessFunction?.map((bf) => bf.Id) || [],
          documentCategoryIds: selectedDoc.Category?.map((dc) => dc.Id) || [],
          documentTypeId: mapDocumentTypeToId(selectedDoc.DocumentType),
          classification: selectedDoc.Classification || "",
          audienceId: selectedDoc.Audience?.Id,
          releaseAuthority: selectedDoc.ReleaseAuthority ?? undefined,
          author: selectedDoc.Author0 ?? undefined,
          draftDocumentName: selectedDoc.DocumentTitle || "",
        }));

        console.log("Part 2 auto-populated from existing document");
      } catch (error: unknown) {
        console.error("Error auto-populating from document:", error);
        // Fail silently - don't interrupt user experience
      }
    };

    autoPopulateFromDocument().catch((error: unknown) => {
      console.error("Error auto-populating from document:", error);
    });
  }, [formData.documentId, formData.newDocument]);

  // Reset auto-populated fields when switching to New Document
  useEffect(() => {
    if (!formData.newDocument) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      documentId: undefined,
      departmentId: undefined,
      changeAuthority: undefined,
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

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: number,
  ): void => {
    setTabValue(newValue);
  };

  const handleFieldChange = (
    field: keyof ChangeRequestFormData,
    value: ChangeRequestFormData[keyof ChangeRequestFormData],
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    console.log(`Setting ${field} to:`, value);
  };

  // Validation for Part 1
  const isPart1Valid = (): boolean => {
    return !!(
      formData.title &&
      formData.scopeOfChange &&
      formData.departmentId &&
      (formData.newDocument || formData.documentId)
    );
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      // Validate Part 1 (mandatory)
      if (!isPart1Valid()) {
        alert("Please fill in all required fields before submitting.");
        setTabValue(0); // Navigate back to Part 1
        return;
      }

      const payload = {
        // Part 1 - Mandatory fields
        Title: formData.title,
        ScopeofChange: formData.scopeOfChange,
        NewDocument: formData.newDocument,
        CoreFunctionalityId: formData.departmentId,
        ChangeAuthorityId: formData.changeAuthority?.Id,
        Urgency: formData.urgency || "Standard",
        Status: "Submitted",

        // Part 2 - Optional fields
        Classification: formData.classification || undefined,
        AudienceId: formData.audienceId || undefined,
        DraftDocumentName: formData.draftDocumentName || undefined,
        ReleaseAuthorityId: formData.releaseAuthority?.Id || undefined,
        Author0Id: formData.author?.Id || undefined,

        // Multi-person fields
        ReviewersId:
          formData.reviewerIds.length > 0
            ? { results: formData.reviewerIds }
            : undefined,
        ContributorsId:
          formData.contributorIds.length > 0
            ?  formData.contributorIds 
            : undefined,

        // Multi-lookup fields
        BusinessFunctionId:
          formData.businessFunctionIds.length > 0
            ? { results: formData.businessFunctionIds }
            : undefined,
        CategoryId:
          formData.documentCategoryIds.length > 0
            ? { results: formData.documentCategoryIds }
            : undefined,
      };

      console.log("Submitting payload:", payload);
console.log("Payload being sent:", JSON.stringify(payload, null, 2));

      // Create the change request
      await SharePointService.createChangeRequest(payload);

      // Get the created item
      const changeRequests = await SharePointService.getChangeRequests();
      const latestItem = changeRequests[changeRequests.length - 1];
      const itemId = latestItem?.Id;

      if (!itemId) {
        throw new Error("Unable to resolve the created Change Request ID.");
      }

      console.log("Change Request created with ID:", itemId);

      // Upload attachments if any
      if (formData.attachments.length > 0) {
        console.log(`Uploading ${formData.attachments.length} file(s)...`);

        await SharePointService.uploadAttachments(
          itemId,
          formData.attachments,
          (current, total, fileName) => {
            console.log(`Uploading file ${current} of ${total}: ${fileName}`);
          },
        );

        console.log("All files uploaded successfully!");
      }

      alert(
        `Success! Change Request created.\n\n` +
          `CR Number: ${latestItem.ChangeRequestNumber || itemId}\n` +
          `ID: ${itemId}`,
      );

      // Reset form to initial state
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
      });
      setTabValue(0); // Reset to first tab
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("ERROR:", error);
      console.error("Error message:", message);
      alert(`Error: ${message}`);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ p: 4, pb: 2 }}>
        Document Change Request
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="Change Request Form Tabs"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label="Part 1: Basic Information *"
          sx={{ fontWeight: tabValue === 0 ? "bold" : "normal" }}
        />
        <Tab
          label="Part 2: Additional Details (Optional)"
          sx={{ fontStyle: "italic" }}
        />
      </Tabs>

      <form onSubmit={handleSubmit}>
        <TabPanel value={tabValue} index={0}>
          <Box padding={4}>
            {!isPart1Valid() && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please complete all required fields before submitting
              </Alert>
            )}

            <InitialForm
              data={formData}
              onChange={handleFieldChange}
              documents={documents}
              departments={departments}
              isExistingDocumentSelected={isExistingDocumentSelected}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box padding={4}>
            {!formData.newDocument && formData.documentId && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Part 2 has been auto-populated from the selected document. You
                can modify these values if needed.
              </Alert>
            )}

            <AdditionalForm
              data={formData}
              onChange={handleFieldChange}
              documents={documents}
              isExistingDocumentSelected={isExistingDocumentSelected}
            />
          </Box>
        </TabPanel>

        {/* Navigation and Submit */}
        <Box padding={4} display="flex" flexDirection="column" gap={2}>
          {/* Tab Navigation Buttons */}
          <Box display="flex" gap={2} justifyContent="space-between">
            {tabValue > 0 && (
              <Button
                variant="outlined"
                onClick={() => setTabValue(tabValue - 1)}
              >
                ← Previous
              </Button>
            )}

            {tabValue < 1 && (
              <Button
                variant="outlined"
                onClick={() => setTabValue(tabValue + 1)}
                sx={{ ml: "auto" }}
              >
                Next (Optional Details) →
              </Button>
            )}
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={!isPart1Valid()}
          >
            Submit Change Request
          </Button>

          {/* Validation Message */}
          {!isPart1Valid() && (
            <Typography variant="caption" color="error" align="center">
              * Please complete all required fields before submitting
            </Typography>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default ChangeRequestForm;

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import SharePointService from "../../../shared/services/SharePointService";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";
import { Department } from "../../../shared/types/Department";
import { useDocuments } from "../../../shared/hooks/useDocuments";
import { InitialForm } from "./InitialForm";
import { AdditionalForm } from "./AdditionalForm";
import { useDepartments } from "../../../shared/hooks/useDepartments";

interface DcrFormProps {
  // Add props here if needed
}

export interface ChangeRequestFormData {
  // Tab 1: General Information
  title: string;
  newDocument: boolean;
  scopeOfChange: string;
  departmentId: number | null;
  changeAuthority: SharePointPerson | undefined;
  documentId: number | null;
  attachments: File[];

  // Tab 2: Additional Details
  documentTypeId: number | null;
  documentCategoryIds: number[];
  classification: "Public" | "Internal" | "Confidential" | "Restricted" | "";
  audienceId: number | null;
  businessFunctionIds: number[];
  urgency: "Standard" | "Urgent" | "Minor" | "";
  releaseAuthority: SharePointPerson | null;
  author: SharePointPerson | null;
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

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const ChangeRequestForm = (props: DcrFormProps) => {
  const [tabValue, setTabValue] = useState(0);

  const [formData, setFormData] = useState<ChangeRequestFormData>({
    // Tab 1: Basic Request (Required)
    title: "",
    scopeOfChange: "",
    departmentId: null,
    newDocument: false,
    changeAuthority: undefined,
    documentId: null,
    attachments: [],

    // Tab 2: Additional Details (Optional)
    documentTypeId: null,
    documentCategoryIds: [],
    classification: "",
    audienceId: null,
    businessFunctionIds: [],
    urgency: "Standard",
    releaseAuthority: null,
    author: null,
    reviewerIds: [],
    contributorIds: [],
    draftDocumentName: "",
  });

  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
  } = useDocuments();

  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
  } = useDepartments();

  const [currentUser, setCurrentUser] = useState<SharePointPerson | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await SharePointService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData().catch(console.error);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFieldChange = async (
    field: keyof ChangeRequestFormData,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    console.log(`Setting ${field} to:`, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validation
      if (
        !formData.title ||
        !formData.scopeOfChange ||
        !formData.departmentId
      ) {
        alert("Please fill in all required fields");
        return;
      }

      if (!formData.newDocument && !formData.documentId) {
        alert("Please select an existing document");
        return;
      }

      const payload = {
        Title: formData.title,
        ScopeofChange: formData.scopeOfChange,
        NewDocument: formData.newDocument,
        ChangeAuthorityId: formData.changeAuthority?.Id,
        Status: "Awaiting CA Review",
        ReleaseAuthorityId: formData.releaseAuthority?.Id,
        Author0Id: formData.author?.Id,
      };

      console.log("Submitting payload:", payload);
      const result = await SharePointService.createChangeRequest(payload);
      const changeRequests = await SharePointService.getChangeRequests();
      const latestItem = changeRequests[changeRequests.length - 1];
      const itemId = latestItem.Id;
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

      alert(`Success! Change Request ID: ${itemId}`);

      // Reset form
      setFormData({
        title: "",
        scopeOfChange: "",
        departmentId: null,
        newDocument: false,
        changeAuthority: undefined,
        documentId: null,
        attachments: [],
        documentTypeId: null,
        documentCategoryIds: [],
        classification: "",
        audienceId: null,
        businessFunctionIds: [],
        urgency: "Standard",
        releaseAuthority: null,
        author: null,
        reviewerIds: [],
        contributorIds: [],
        draftDocumentName: "",
      });
      setTabValue(0); // Reset to first tab
    } catch (error: any) {
      console.error("ERROR:", error);
      console.error("Error message:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Box>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="Change Request Form Tabs"
      >
        <Tab label="Initial Request" />
        <Tab label="Additional Details" />
      </Tabs>

      <form onSubmit={handleSubmit}>
        <TabPanel value={tabValue} index={0}>
          <Box padding={4}>
            <InitialForm
              data={formData}
              onChange={handleFieldChange}
              documents={documents}
              departments={departments}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box padding={4}>
            <AdditionalForm
              data={formData}
              onChange={handleFieldChange}
              documents={documents}
            />
          </Box>
        </TabPanel>

        <Box padding={4}>
          <Button type="submit" variant="contained" size="large" fullWidth>
            Submit Change Request
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ChangeRequestForm;
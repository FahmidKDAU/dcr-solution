import React, { useEffect, useState } from "react";
import { PnPSetup } from "../../../shared/services/PnPSetup";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import SharePointService from "../../../shared/services/SharePointService";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";
import { Department } from "../../../shared/types/Department";
import { LookupFieldItem } from "../../../shared/types/LookupFieldItem";
import { Document } from "../../../shared/types/Document";
import MyDropzone, { FileUpload } from "../../components/FileUpload";
interface DcrFormProps {
  // Add props here if needed
}

interface DCRFormData {
  title: string;
  newDocument: boolean;
  scopeOfChange: string;
  departmentId: number | null;
  changeAuthority: SharePointPerson | undefined;
  documentId: number | null;
}

function DcrForm(props: DcrFormProps) {
  const [formData, setFormData] = useState<DCRFormData>({
    title: "",
    scopeOfChange: "",
    departmentId: null,
    newDocument: false,
    changeAuthority: undefined,
    documentId: null,
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentUser, setCurrentUser] = useState<SharePointPerson | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [depts, docs, user] = await Promise.all([
          SharePointService.getDepartments(),
          SharePointService.getDocuments(),
          SharePointService.getCurrentUser(),
        ]);

        setDepartments(depts);
        setDocuments(docs);
        setCurrentUser(user);
        console.log(documents);
        console.log(currentUser);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    void loadData();
  }, []);

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
        Status: "Awaiting CA Review", // Add initial status
      };

      console.log("Submitting payload:", payload);
      const result = await SharePointService.createChangeRequest(payload);
      const changeRequests = await SharePointService.getChangeRequests();
      const lastestItem = changeRequests[changeRequests.length - 1];
      const itemId = lastestItem.Id;
      console.log("Change Request created with ID:", itemId);

      // Upload attachments if any
      if (attachments.length > 0) {
        console.log(`Uploading ${attachments.length} file(s)...`);

        await SharePointService.uploadAttachments(
          itemId,
          attachments,
          (current, total, fileName) => {
            console.log(`Uploading file ${current} of ${total}: ${fileName}`);
          },
        );

        console.log("All files uploaded successfully!");
      }

      console.log(result.id);
      console.log(`item id: ${itemId}`);
      alert(`Success! Change Request ID: ${itemId}`);

      // Reset form
      setFormData({
        title: "",
        scopeOfChange: "",
        departmentId: null,
        newDocument: false,
        changeAuthority: undefined,
        documentId: null,
      });
      setAttachments([]); // Reset attachments
    } catch (error: any) {
      console.error("ERROR:", error);
      console.error("Error message:", error.message);
      alert(`Error: ${error.message}`);
    }
  };
  return (
    <Box>
      <Box padding={4}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Title Field */}
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            {/* Scope of Change Field */}
            <TextField
              label="Scope of Change"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              required
              value={formData.scopeOfChange}
              onChange={(e) =>
                setFormData({ ...formData, scopeOfChange: e.target.value })
              }
            />

            {/* New Document Radio Group */}
            <FormControl fullWidth>
              <FormLabel>New Document? *</FormLabel>
              <RadioGroup
                value={formData.newDocument ? "yes" : "no"}
                onChange={(e) => {
                  const isNew = e.target.value === "yes";
                  setFormData({
                    ...formData,
                    newDocument: isNew,
                    documentId: isNew ? null : formData.documentId,
                  });
                }}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            {/* Conditional Document Selection - Only show if NOT new document */}
            {!formData.newDocument && (
              <FormControl fullWidth>
                <FormLabel>Select Existing Document *</FormLabel>
                <Select
                  label="Select Existing Document"
                  value={formData.documentId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      documentId: Number(e.target.value),
                    })
                  }
                  required={!formData.newDocument}
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
                value={formData.departmentId || ""}
                required
                onChange={(e) => {
                  const deptId = Number(e.target.value);
                  const selectedDept = departments.find((d) => d.Id === deptId);
                  setFormData({
                    ...formData,
                    departmentId: deptId,
                    changeAuthority: selectedDept?.ChangeAuthority,
                  });
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
              value={formData.changeAuthority?.Title || "Not assigned"}
              disabled
              fullWidth
              variant="outlined"
              helperText="Automatically assigned based on selected department"
            />
            <FileUpload
              onFilesSelected={(files) => setAttachments(files)}
              maxFiles={5}
              maxSize={10485760}
              label="Drag and drop files here, or click to select"
            />
            {/* Submit Button */}
            <Button type="submit" variant="contained" size="large">
              Submit Change Request
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}

export default DcrForm;

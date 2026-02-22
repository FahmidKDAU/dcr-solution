import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Task } from "../../../shared/types/Task";
import { IChangeRequest } from "../../../shared/types/ChangeRequest";
import { Document } from "../../../shared/types/Document";
import SharePointService from "../../../shared/services/SharePointService";

interface TaskDetailProps {
  task: Task | null;
}

const CRField = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.4} display="block">
      {label}
    </Typography>
    <Typography variant="body2" mt={0.25}>{value ?? "—"}</Typography>
  </Box>
);

export const TaskDetail = ({ task }: TaskDetailProps) => {
  const [tab, setTab] = useState(0);
  const [cr, setCr] = useState<IChangeRequest | null>(null);
  const [crLoading, setCrLoading] = useState(false);
  const [publishedDoc, setPublishedDoc] = useState<Document | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  // Fetch CR when task changes
  useEffect(() => {
    if (!task?.ChangeRequestId) return;
    setCrLoading(true);
    setCr(null);
    SharePointService.getChangeRequestById(task.ChangeRequestId)
      .then(setCr)
      .catch(console.error)
      .finally(() => setCrLoading(false));
  }, [task?.ChangeRequestId]);

  // Fetch published doc when CR loads
  useEffect(() => {
    if (!cr?.TargetDocumentId) return;
    setDocLoading(true);
    setPublishedDoc(null);
    SharePointService.getDocumentById(cr.TargetDocumentId)
      .then(setPublishedDoc)
      .catch(console.error)
      .finally(() => setDocLoading(false));
  }, [cr?.TargetDocumentId]);

//   // Fetch attachments
//   useEffect(() => {
//     if (!task?.ChangeRequestId) return;
//     setAttachments([]);
//     SharePointService.getChangeRequestAttachments(task.ChangeRequestId)
//       .then(setAttachments)
//       .catch(console.error);
//   }, [task?.ChangeRequestId]);

  // Reset tab on task change
  useEffect(() => {
    setTab(0);
  }, [task?.Id]);

  // Empty state
  if (!task) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%" flexDirection="column" gap={1}>
        <Typography variant="h6" color="text.secondary">Select a task</Typography>
        <Typography variant="body2" color="text.disabled">CR details and documents will appear here</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px: 3, borderBottom: "1px solid #e0e0e0" }}
      >
        <Tab label="Change Request" />
        <Tab label={`Scope Document${attachments.length > 0 ? ` (${attachments.length})` : ""}`} />
        <Tab label="Published Document" />
      </Tabs>

      <Box flex={1} overflow="auto" display="flex" flexDirection="column">

        {/* Tab 1 — Change Request */}
        {tab === 0 && (
          <Box p={3}>
            {crLoading && (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress size={24} />
              </Box>
            )}
            {!crLoading && !cr && (
              <Typography color="text.secondary">No linked change request found.</Typography>
            )}
            {!crLoading && cr && (
              <Box display="flex" flexDirection="column" gap={2}>

                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">GENERAL</Typography>
                <Divider />
                <CRField label="CR Number" value={cr.ChangeRequestNumber} />
                <CRField label="Title" value={cr.Title} />
                <CRField label="Status" value={cr.Status} />
                <CRField label="Scope of Change" value={cr.ScopeOfChange} />
                <CRField label="Urgency" value={cr.Urgency} />
                <CRField label="New Document" value={cr.NewDocument ? "Yes" : "No"} />
                <CRField label="Classification" value={cr.Classification} />
                <CRField label="Draft Document Name" value={cr.DraftDocumentName} />

                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mt={1}>DEPARTMENT</Typography>
                <Divider />
                <CRField label="Core Functionality" value={cr.CoreFunctionality?.Title} />
                <CRField label="Business Function" value={cr.BusinessFunction?.map(bf => bf.Title).join(", ")} />
                <CRField label="Audience" value={cr.Audience?.Title} />

                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mt={1}>PEOPLE</Typography>
                <Divider />
                <CRField label="Submitted By" value={cr.CreatedBy?.Title} />
                <CRField label="Change Authority" value={cr.ChangeAuthority?.Title} />
                <CRField label="Release Authority" value={cr.ReleaseAuthority?.Title} />
                <CRField label="Author" value={cr.Author?.Title} />

              </Box>
            )}
          </Box>
        )}

        {/* Tab 2 — Scope Document */}
        {tab === 1 && (
          <Box p={3}>
            {attachments.length === 0 ? (
              <Typography color="text.secondary">No scope documents attached.</Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={1}>
                {attachments.map((file) => (
                  <Box
                    key={file.FileName}
                    display="flex"
                    alignItems="center"
                    gap={2}
                    py={1.5}
                    px={2}
                    sx={{ border: "1px solid #e0e0e0", borderRadius: 1, "&:hover": { backgroundColor: "#fafafa" } }}
                  >
                    <AttachFileIcon fontSize="small" sx={{ color: "text.disabled" }} />
                    <Typography variant="body2" flex={1}>{file.FileName}</Typography>
                    <Button size="small" variant="outlined" href={file.ServerRelativeUrl} target="_blank">
                      Open
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Tab 3 — Published Document */}
        {tab === 2 && (
          <Box flex={1} display="flex" flexDirection="column" height="100%">
            {docLoading && (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress size={24} />
              </Box>
            )}
            {!docLoading && !publishedDoc && (
              <Box p={3}>
                <Typography color="text.secondary">No published document linked to this change request.</Typography>
              </Box>
            )}
            {!docLoading && publishedDoc?.FileRef && (
              <iframe
                src={publishedDoc.FileRef}
                style={{ flex: 1, border: "none", width: "100%", height: "100%" }}
                title="Published Document"
              />
            )}
          </Box>
        )}

      </Box>
    </Box>
  );
};
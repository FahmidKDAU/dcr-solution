import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Task } from "../../../../shared/types/Task";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";
import SharePointService from "../../../../shared/services/SharePointService";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ParticipantTaskProps {
  task: Task;
  cr: IChangeRequest | null;
  onTaskComplete: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ParticipantTask = ({ task, cr, onTaskComplete }: ParticipantTaskProps) => {
  const [notes, setNotes] = useState(task.Notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const isReviewer = task.TaskType === "Reviewer Task";
  const positiveLabel = isReviewer ? "Approve" : "Mark Complete";
  const positiveStatus = isReviewer ? "Approved" : "Complete";

  useEffect(() => {
    if (!cr?.ID) return;
    setDocLoading(true);
    SharePointService.getDraftDocumentFolderByChangeRequestId(cr.ID)
      .then(setDocUrl)
      .catch(console.error)
      .finally(() => setDocLoading(false));
  }, [cr?.ID]);

  const handleAction = async (action: "positive" | "reject") => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, {
        Status: action === "positive" ? positiveStatus : "Rejected",
        Notes: notes,
        CompletedDate: new Date().toISOString(),
      });
      onTaskComplete();
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

      {/* ── Document Link ── */}
      {docLoading ? (
        <Box display="flex" alignItems="center" gap={1} py={1}>
          <CircularProgress size={14} sx={{ color: "#0078D4" }} />
          <Typography sx={{ fontSize: 12, color: "#605E5C" }}>Loading document...</Typography>
        </Box>
      ) : docUrl ? (
        <Box
          component="a"
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            backgroundColor: "#EFF6FC",
            border: "1px solid #C7E0F4",
            borderRadius: 1.5,
            textDecoration: "none",
            transition: "background 0.15s",
            "&:hover": { backgroundColor: "#DEEDFB" },
          }}
        >
          <Box sx={{ width: 32, height: 32, backgroundColor: "#0078D4", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AttachFileIcon sx={{ fontSize: 16, color: "#fff" }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0078D4", lineHeight: 1.3 }}>
              Open Draft Document
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#605E5C" }}>
              Click to open in SharePoint
            </Typography>
          </Box>
          <Box sx={{ fontSize: 11, color: "#0078D4", fontWeight: 600 }}>↗</Box>
        </Box>
      ) : (
        <Box sx={{ p: 1.5, backgroundColor: "#F8F8F8", border: "1px dashed #D2D0CE", borderRadius: 1.5 }}>
          <Typography sx={{ fontSize: 13, color: "#A19F9D", fontStyle: "italic" }}>
            No document available yet
          </Typography>
        </Box>
      )}

      <Divider />

      {/* ── Notes ── */}
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#323130", mb: 1 }}>
          Notes
        </Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder="Add any notes or comments..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={submitting}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: 13,
              "& fieldset": { borderColor: "#EDEBE9" },
              "&:hover fieldset": { borderColor: "#0078D4" },
              "&.Mui-focused fieldset": { borderColor: "#0078D4" },
            },
          }}
        />
      </Box>

      {/* ── Actions ── */}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          variant="contained"
          disableElevation
          disabled={submitting}
          onClick={() => handleAction("positive")}
          startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: 13 }}
        >
          {submitting ? "Saving..." : positiveLabel}
        </Button>
        <Button
          variant="outlined"
          color="error"
          disabled={submitting}
          onClick={() => handleAction("reject")}
          startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: 13 }}
        >
          Reject
        </Button>
      </Box>

    </Box>
  );
};

export default ParticipantTask;
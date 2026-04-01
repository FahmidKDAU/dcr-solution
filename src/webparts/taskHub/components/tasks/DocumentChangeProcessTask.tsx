import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { IChangeRequest } from "../../../../shared/types/ChangeRequest";
import { SharePointPerson } from "../../../../shared/types/SharePointPerson";
import { Task } from "../../../../shared/types/Task";
import { useParticipants } from "../../../../shared/hooks/useParticipants";
import SharePointService from "../../../../shared/services/SharePointService";
import ParticipantsTable from "../ParticipantsTable";

interface DocumentChangeProcessTaskProps {
  task: Task;
  cr: IChangeRequest;
  currentUser: SharePointPerson;
  onTaskComplete: () => void;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const DocumentChangeProcessTask = ({
  task, cr, currentUser, onTaskComplete,
}: DocumentChangeProcessTaskProps): React.ReactElement => {
  const { contributors, reviewers, loading, refetch } = useParticipants(cr.ID);
  const [manageOpen, setManageOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAuthor = cr.Author0?.Id === currentUser.Id;
  const isCa = cr.ChangeAuthority?.Id === currentUser.Id;

  const allParticipants = [...contributors, ...reviewers];
  const total = allParticipants.length;
  const complete = allParticipants.filter((p) => p.Status === "Complete").length;
  const inProgress = allParticipants.filter((p) => p.Status === "In Progress").length;
  const progressPercent = total > 0 ? Math.round((complete / total) * 100) : 0;
  const allComplete = total > 0 && allParticipants.every((p) => p.Status === "Complete");

  const contributorsComplete = contributors.filter((p) => p.Status === "Complete").length;
  const reviewersComplete = reviewers.filter((p) => p.Status === "Complete").length;

  const handleSubmitToPublishing = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, { Status: "Complete" });
      await SharePointService.updateChangeRequest(cr.ID, { Status: "Publishing Approval" });
      onTaskComplete();
    } catch (err) {
      console.error("Failed to submit to publishing:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, { Status: "Rejected" });
      await SharePointService.updateChangeRequest(cr.ID, {
        Status: "Rejected",
        RejectionReason: rejectReason,
      });
      setRejectOpen(false);
      onTaskComplete();
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2.5 }}>

      {/* ── Participants Card ── */}
      <Box sx={{
        border: "1px solid #EDEBE9", borderRadius: "10px",
        p: 2, backgroundColor: "#fff",
      }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.7, mb: 1.5 }}>
          Participants
        </Typography>

        {/* Stat boxes */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {[
            { label: "Contributors", count: contributors.length, complete: contributorsComplete },
            { label: "Reviewers", count: reviewers.length, complete: reviewersComplete },
          ].map((s) => (
            <Box key={s.label} sx={{ flex: 1, backgroundColor: "#FAFAFA", borderRadius: "8px", p: 1.5 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.6, mb: 0.75 }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 600, color: "#323130", lineHeight: 1 }}>
                {s.count}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#605E5C", mt: 0.5 }}>
                {s.complete} complete
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Progress bar */}
        {total > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: 12, color: "#605E5C" }}>Overall progress</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}>
                {complete} of {total} complete
              </Typography>
            </Box>
            <Box sx={{ height: 5, backgroundColor: "#F3F2F1", borderRadius: "99px", overflow: "hidden" }}>
              <Box sx={{
                height: "100%",
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? "#107C10" : "#0078D4",
                borderRadius: "99px",
                transition: "width 0.3s ease",
              }} />
            </Box>
            {inProgress > 0 && (
              <Typography sx={{ fontSize: 11, color: "#0078D4", mt: 0.75 }}>
                {inProgress} in progress
              </Typography>
            )}
          </Box>
        )}

        {total === 0 && !loading && (
          <Typography sx={{ fontSize: 12, color: "#A19F9D", mt: 1.5, fontStyle: "italic" }}>
            No participants assigned yet
          </Typography>
        )}
      </Box>

      {/* ── Manage Button ── */}
      <Button
        variant="outlined"
        startIcon={<PeopleIcon sx={{ fontSize: 15 }} />}
        onClick={() => setManageOpen(true)}
        fullWidth
        sx={{
          textTransform: "none", fontWeight: 500, fontSize: 13,
          borderColor: "#EDEBE9", color: "#323130",
          borderRadius: "8px", py: 1,
          "&:hover": { borderColor: "#0078D4", color: "#0078D4", backgroundColor: "#EFF6FC" },
        }}
      >
        Manage participants
      </Button>
{/* ── Author Action (only shown to Author who is not CA) ── */}
      {isAuthor && !isCa && (
        <Box sx={{ border: "1px solid #EDEBE9", borderRadius: "10px", overflow: "hidden" }}>
          <Box sx={{
            px: 2, py: 1.25, borderBottom: "1px solid #EDEBE9",
            backgroundColor: "#FAFAFA", display: "flex", alignItems: "center", gap: 1,
          }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 15, color: "#605E5C" }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}>
              Release candidate
            </Typography>
          </Box>
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {!allComplete ? (
              <Box sx={{
                display: "flex", alignItems: "flex-start", gap: 1, p: 1.25,
                backgroundColor: "#FFF4CE", borderRadius: "8px", border: "1px solid #FFB900",
              }}>
                <WarningAmberIcon sx={{ fontSize: 14, color: "#835B00", mt: 0.15, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: "#835B00", lineHeight: 1.5 }}>
                  All participants must complete before marking as ready.
                </Typography>
              </Box>
            ) : (
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1, p: 1.25,
                backgroundColor: "#DFF6DD", borderRadius: "8px", border: "1px solid #107C10",
              }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#107C10", flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: "#107C10", fontWeight: 600 }}>
                  All participants complete — ready to signal.
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              disableElevation
              fullWidth
              disabled={!allComplete || submitting}
              onClick={handleSubmitToPublishing}
              sx={{
                textTransform: "none", fontWeight: 500, fontSize: 13,
                borderRadius: "6px", backgroundColor: "#0078D4",
                "&:disabled": { backgroundColor: "#F3F2F1", color: "#A19F9D" },
              }}
            >
              {submitting ? "Submitting..." : "Release candidate ready"}
            </Button>
          </Box>
        </Box>
      )}

      {/* ── CA Action Card (only shown to CA) ── */}
      {isCa && (
        <Box sx={{ border: "1px solid #EDEBE9", borderRadius: "10px", overflow: "hidden" }}>
          <Box sx={{
            px: 2, py: 1.25, borderBottom: "1px solid #EDEBE9",
            backgroundColor: "#FAFAFA", display: "flex", alignItems: "center", gap: 1,
          }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 15, color: "#605E5C" }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}>
              Release candidate
            </Typography>
          </Box>
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{
                width: 26, height: 26, borderRadius: "50%", backgroundColor: "#0078D4",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                {getInitials(cr.ChangeAuthority?.Title ?? "CA")}
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}>
                  {cr.ChangeAuthority?.Title}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#A19F9D" }}>Change Authority</Typography>
              </Box>
            </Box>
            {!allComplete ? (
              <Box sx={{
                display: "flex", alignItems: "flex-start", gap: 1, p: 1.25,
                backgroundColor: "#FFF4CE", borderRadius: "8px", border: "1px solid #FFB900",
              }}>
                <WarningAmberIcon sx={{ fontSize: 14, color: "#835B00", mt: 0.15, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: "#835B00", lineHeight: 1.5 }}>
                  Waiting for all participants to complete before submitting.
                </Typography>
              </Box>
            ) : (
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1, p: 1.25,
                backgroundColor: "#DFF6DD", borderRadius: "8px", border: "1px solid #107C10",
              }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#107C10", flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: "#107C10", fontWeight: 600 }}>
                  All participants complete — ready to submit.
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained" disableElevation
                disabled={!allComplete || submitting}
                onClick={handleSubmitToPublishing}
                sx={{
                  flex: 1, textTransform: "none", fontWeight: 500,
                  fontSize: 13, borderRadius: "6px", backgroundColor: "#0078D4",
                  "&:disabled": { backgroundColor: "#F3F2F1", color: "#A19F9D" },
                }}
              >
                {submitting ? "Submitting..." : "Submit to publishing"}
              </Button>
              <Button
                variant="outlined" disabled={submitting}
                onClick={() => setRejectOpen(true)}
                sx={{
                  textTransform: "none", fontWeight: 500, fontSize: 13,
                  borderRadius: "6px", borderColor: "#F09595", color: "#A32D2D",
                  "&:hover": { backgroundColor: "#FCEBEB", borderColor: "#E24B4A" },
                }}
              >
                Reject
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      {/* ── Manage Modal ── */}
      <Dialog
        open={manageOpen}
        onClose={() => { setManageOpen(false); refetch(); }}
        maxWidth="lg" fullWidth
        PaperProps={{ sx: { borderRadius: 2, height: "80vh" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 15, fontWeight: 700 }}>
          Manage participants
          <IconButton size="small" onClick={() => { setManageOpen(false); refetch(); }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <ParticipantsTable
            changeRequestId={cr.ID}
            contributors={contributors}
            reviewers={reviewers}
            loading={loading}
            canAdd={isCa}
            canStart={isAuthor}
            onRefetch={refetch}
          />
        </DialogContent>
      </Dialog>

      {/* ── Reject Modal ── */}
      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
          Reject document changes
          <IconButton size="small" onClick={() => setRejectOpen(false)}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#605E5C", mb: 2 }}>
            Provide a reason for rejection. This will be visible to the author.
          </Typography>
          <TextField
            label="Rejection reason"
            multiline rows={3} fullWidth size="small"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button size="small" onClick={() => setRejectOpen(false)}
            sx={{ textTransform: "none", color: "#605E5C" }}>
            Cancel
          </Button>
          <Button size="small" variant="contained" color="error" disableElevation
            disabled={!rejectReason.trim() || submitting}
            onClick={handleReject}
            sx={{ textTransform: "none" }}>
            {submitting ? "Rejecting..." : "Confirm reject"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DocumentChangeProcessTask;
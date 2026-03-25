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

const DocumentChangeProcessTask = ({
  task,
  cr,
  currentUser,
  onTaskComplete,
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
  const allComplete =
    total > 0 &&
    allParticipants.every((participant) => participant.Status === "Complete");

  const handleSubmitToPublishing = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SharePointService.updateTask(task.Id, { Status: "Complete" });
      await SharePointService.updateChangeRequest(cr.ID, {
        Status: "Publishing Approval",
      });
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3 }}>

      {/* ── Summary Cards ── */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Contributors */}
        <Box sx={{ flex: 1, backgroundColor: "#F8F8F8", border: "1px solid #EDEBE9", borderRadius: 1.5, px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.6, mb: 1 }}>
            Contributors
          </Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#323130", lineHeight: 1 }}>
            {contributors.length}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#605E5C", mt: 0.5 }}>
            {contributors.filter((p) => p.Status === "Complete").length} complete
          </Typography>
        </Box>

        {/* Reviewers */}
        <Box sx={{ flex: 1, backgroundColor: "#F8F8F8", border: "1px solid #EDEBE9", borderRadius: 1.5, px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.6, mb: 1 }}>
            Reviewers
          </Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#323130", lineHeight: 1 }}>
            {reviewers.length}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#605E5C", mt: 0.5 }}>
            {reviewers.filter((p) => p.Status === "Complete").length} complete
          </Typography>
        </Box>
      </Box>

      {/* ── Progress Bar ── */}
      {total > 0 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
            <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
              Overall Progress
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#323130" }}>
              {complete} of {total} complete
            </Typography>
          </Box>
          <Box sx={{ height: 6, backgroundColor: "#F3F2F1", borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ height: "100%", width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? "#107C10" : "#0078D4", borderRadius: 3, transition: "width 0.3s ease" }} />
          </Box>
          {inProgress > 0 && (
            <Typography sx={{ fontSize: 11, color: "#0078D4", mt: 0.75 }}>
              {inProgress} in progress
            </Typography>
          )}
        </Box>
      )}

      {/* ── Manage Button ── */}
      <Button
        variant="outlined"
        startIcon={<PeopleIcon sx={{ fontSize: 16 }} />}
        onClick={() => setManageOpen(true)}
        sx={{ textTransform: "none", fontWeight: 600, alignSelf: "flex-start" }}
      >
        Manage Participants
      </Button>

      {/* ── CA Final Check ── */}
      {isCa && (
        <Box sx={{ borderTop: "1px solid #EDEBE9", pt: 2.5, mt: 1 }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: "#323130",
              textTransform: "uppercase",
              letterSpacing: 0.6,
              mb: 1.5,
            }}
          >
            Change Authority Review
          </Typography>

          {!allComplete && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                backgroundColor: "#FFF4CE",
                borderRadius: 1,
                border: "1px solid #FFB900",
                mb: 2,
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 14, color: "#835B00" }} />
              <Typography sx={{ fontSize: 12, color: "#835B00" }}>
                Waiting for all participants to complete before submitting to
                publishing.
              </Typography>
            </Box>
          )}

          {allComplete && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                backgroundColor: "#DFF6DD",
                borderRadius: 1,
                border: "1px solid #107C10",
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#107C10",
                  fontWeight: 600,
                }}
              >
                All participants complete — release candidate is ready.
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="contained"
              disableElevation
              disabled={!allComplete || submitting}
              onClick={handleSubmitToPublishing}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Submit to Publishing
            </Button>
            <Button
              variant="outlined"
              color="error"
              disabled={submitting}
              onClick={() => setRejectOpen(true)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Reject Changes
            </Button>
          </Box>
        </Box>
      )}

      {/* ── Manage Modal ── */}
      <Dialog
        open={manageOpen}
        onClose={() => { setManageOpen(false); refetch(); }}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, height: "80vh" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "#323130" }}>
          Manage Participants
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
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 14,
            fontWeight: 700,
            color: "#323130",
          }}
        >
          Reject Document Changes
          <IconButton size="small" onClick={() => setRejectOpen(false)}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#605E5C", mb: 2 }}>
            Please provide a reason for rejecting the document changes. This will
            be visible to the requestor.
          </Typography>
          <TextField
            label="Rejection Reason"
            multiline
            rows={3}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            size="small"
            onClick={() => setRejectOpen(false)}
            sx={{ textTransform: "none", color: "#605E5C" }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            disableElevation
            disabled={!rejectReason.trim() || submitting}
            onClick={handleReject}
            sx={{ textTransform: "none" }}
          >
            {submitting ? "Rejecting..." : "Confirm Reject"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DocumentChangeProcessTask;
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Participant } from "../../../shared/types/Participant";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";
import { PeoplePicker } from "../../dcrForm/components/PeoplePicker";
import SharePointService from "../../../shared/services/SharePointService";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ParticipantsTableProps {
  changeRequestId: number;
  contributors: Participant[];
  reviewers: Participant[];
  loading: boolean;
  canAdd: boolean;
  canStart: boolean;
  onRefetch: () => void;
}

export interface ParticipantRow {
  Id: number;
  PersonId: number;
  Role: string;
  Status: string;
  DueDate?: string;
  StartDate?: string;
  CompletedDate?: string;
  Notes?: string;
  Person: { Id: number; Title: string; EMail: string };
}
// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  "Not Started": { bg: "#F3F2F1", color: "#605E5C", dot: "#A19F9D" },
  "In Progress":  { bg: "#EFF6FC", color: "#0078D4", dot: "#0078D4" },
  Complete:       { bg: "#DFF6DD", color: "#107C10", dot: "#107C10" },
  Rejected:       { bg: "#FDE7E9", color: "#A4262C", dot: "#D13438" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES["Not Started"];
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px", backgroundColor: s.bg, color: s.color, fontSize: 11, fontWeight: 600, px: "8px", py: "3px", borderRadius: "20px", whiteSpace: "nowrap" }}>
      <Box component="span" sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: s.dot, flexShrink: 0 }} />
      {status}
    </Box>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#0078D4", "#107C10", "#5C2D91", "#D83B01", "#008575", "#C239B3"];
const getColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const Avatar = ({ name }: { name: string }) => (
  <Box sx={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: getColor(name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
    {getInitials(name)}
  </Box>
);

// ─── Date Display ─────────────────────────────────────────────────────────────

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Remove Confirm Modal ─────────────────────────────────────────────────────

const RemoveConfirmModal = ({
  open,
  participant,
  onConfirm,
  onClose,
}: {
  open: boolean;
  participant: Participant | null;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
    <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#323130" }}>
      Remove Participant
      <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Typography sx={{ fontSize: 13, color: "#605E5C" }}>
        Are you sure you want to remove <Box component="span" sx={{ fontWeight: 600, color: "#323130" }}>{participant?.Person?.Title}</Box> from this change request?
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
      <Button size="small" onClick={onClose} sx={{ textTransform: "none", color: "#605E5C" }}>Cancel</Button>
      <Button size="small" variant="contained" color="error" disableElevation onClick={onConfirm} sx={{ textTransform: "none" }}>Remove</Button>
    </DialogActions>
  </Dialog>
);

const StartConfirmModal = ({
  open,
  participant,
  onConfirm,
  onClose,
}: {
  open: boolean;
  participant: Participant | null;
  onConfirm: (notes: string) => Promise<void>;
  onClose: () => void;
}) => {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    setSaving(true);
    try {
      await onConfirm(notes.trim());
      setNotes("");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (): void => {
    if (saving) {
      return;
    }
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#323130" }}>
        Start Task
        <IconButton size="small" onClick={handleClose}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: 1.5, backgroundColor: "#FFF4CE", borderRadius: 1, border: "1px solid #FFB900" }}>
          <WarningAmberIcon sx={{ fontSize: 14, color: "#835B00", mt: 0.25, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12, color: "#835B00" }}>
            This will start the task for <Box component="span" sx={{ fontWeight: 600 }}>{participant?.Person?.Title}</Box> and send them a notification.
          </Typography>
        </Box>

        <TextField
          label="Notes (optional)"
          multiline
          rows={3}
          fullWidth
          size="small"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any instructions or context for the participant..."
          helperText="This will be included in the notification sent to the participant."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button size="small" onClick={handleClose} sx={{ textTransform: "none", color: "#605E5C" }}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          disableElevation
          disabled={saving}
          onClick={handleConfirm}
          startIcon={<PlayArrowIcon sx={{ fontSize: 13 }} />}
          sx={{ textTransform: "none" }}
        >
          {saving ? "Starting..." : "Start Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Add Participant Modal ────────────────────────────────────────────────────

const AddParticipantModal = ({
  open,
  role,
  existingParticipants,
  excludeIds,
  onConfirm,
  onClose,
}: {
  open: boolean;
  role: "Contributor" | "Reviewer";
  existingParticipants: Participant[];
  excludeIds?: number[];
  onConfirm: (person: SharePointPerson) => Promise<void>;
  onClose: () => void;
}) => {
  const [selectedPerson, setSelectedPerson] = useState<SharePointPerson | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const selectedPersonId = selectedPerson?.Id;

  const isDuplicate = selectedPersonId !== undefined
    ? existingParticipants.some((p) => p.Person?.Id === selectedPersonId)
    : false;

  const handleConfirm = async (): Promise<void> => {
    if (!selectedPerson || isDuplicate) return;
    setSaving(true);
    try {
      await onConfirm(selectedPerson);
      setSelectedPerson(undefined);
    } catch (err) {
      console.error("Failed to add participant:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedPerson(undefined);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#323130" }}>
        Add {role}
        <IconButton size="small" onClick={handleClose}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <PeoplePicker
          label={`Search for a ${role.toLowerCase()}`}
          value={selectedPerson}
          onChange={setSelectedPerson}
          excludeIds={excludeIds ?? []}
        />
        {isDuplicate && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, p: 1.25, backgroundColor: "#FDE7E9", borderRadius: 1, border: "1px solid #F1707B" }}>
            <WarningAmberIcon sx={{ fontSize: 14, color: "#A4262C" }} />
            <Typography sx={{ fontSize: 12, color: "#A4262C" }}>
              {selectedPerson?.Title} is already added as a {role.toLowerCase()}.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button size="small" onClick={handleClose} sx={{ textTransform: "none", color: "#605E5C" }}>Cancel</Button>
        <Button
          size="small"
          variant="contained"
          disableElevation
          disabled={!selectedPersonId || isDuplicate || saving}
          onClick={handleConfirm}
          sx={{ textTransform: "none" }}
        >
          {saving ? "Adding..." : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Row ──────────────────────────────────────────────────────────────────────

const ParticipantRow = ({
  participant,
  canStart,
  canAdd,
  onStart,
  onRemove,
  onDueDateChange,
}: {
  participant: Participant;
  canStart: boolean;
  canAdd: boolean;
  onStart: (p: Participant) => void;
  onRemove: (p: Participant) => void;
  onDueDateChange: (p: Participant, date: string) => void;
}) => {
  const isStarted = participant.Status !== "Not Started";
  const inputValue = participant.DueDate ? participant.DueDate.split("T")[0] : "";

  return (
    <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #F3F2F1" }}>
      {/* Top row: avatar + name + status + actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        {participant.Person?.Title && <Avatar name={participant.Person.Title} />}
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#323130", flex: 1 }}>
          {participant.Person?.Title ?? "—"}
        </Typography>
        <StatusBadge status={participant.Status} />
        {canStart && !isStarted && (
          <Tooltip title={!participant.DueDate ? "Set a due date first" : "Start task"}>
            <span>
              <Button
                size="small"
                variant="contained"
                disableElevation
                disabled={!participant.DueDate}
                onClick={() => onStart(participant)}
                startIcon={<PlayArrowIcon sx={{ fontSize: 13 }} />}
                sx={{ fontSize: 11, py: 0.4, px: 1.25, textTransform: "none" }}
              >
                Start
              </Button>
            </span>
          </Tooltip>
        )}
        {canAdd && (
          <Tooltip title="Remove participant">
            <IconButton size="small" onClick={() => onRemove(participant)} sx={{ color: "#A19F9D", "&:hover": { color: "#D13438" } }}>
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Bottom row: dates */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", pl: "43px", alignItems: "flex-end" }}>
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.4, mb: 0.5 }}>Due</Typography>
          {canStart ? (
            <TextField
              type="date"
              size="small"
              value={inputValue}
              onChange={(e) => { if (e.target.value) onDueDateChange(participant, e.target.value); }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ style: { fontSize: 12, padding: "4px 8px" } }}
              sx={{
                width: 150,
                "& .MuiOutlinedInput-root": {
                  fontSize: 12,
                  "& fieldset": { borderColor: inputValue ? "#EDEBE9" : "#FFB900" },
                  "&:hover fieldset": { borderColor: "#0078D4" },
                  "&.Mui-focused fieldset": { borderColor: "#0078D4" },
                },
              }}
            />
          ) : (
            <Typography sx={{ fontSize: 12, color: inputValue ? "#605E5C" : "#A19F9D", fontStyle: inputValue ? "normal" : "italic" }}>
              {inputValue ? formatDate(participant.DueDate) : "Not set"}
            </Typography>
          )}
          {canStart && !inputValue && (
            <Typography sx={{ fontSize: 10, color: "#835B00", mt: 0.25, display: "flex", alignItems: "center", gap: 0.5 }}>
              <WarningAmberIcon sx={{ fontSize: 11 }} /> Required to start
            </Typography>
          )}
        </Box>
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.4, mb: 0.25 }}>Started</Typography>
          <Typography sx={{ fontSize: 12, color: "#605E5C" }}>{formatDate(participant.StartDate)}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.4, mb: 0.25 }}>Completed</Typography>
          <Typography sx={{ fontSize: 12, color: "#605E5C" }}>{formatDate(participant.CompletedDate)}</Typography>
        </Box>
        {participant.Notes && (
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.4, mb: 0.25 }}>Notes</Typography>
            <Typography sx={{ fontSize: 12, color: "#605E5C" }}>{participant.Notes}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────

const ParticipantSection = ({
  title,
  role,
  participants,
  excludeIds,
  canAdd,
  canStart,
  changeRequestId,
  onRefetch,
}: {
  title: string;
  role: "Contributor" | "Reviewer";
  participants: Participant[];
  excludeIds: number[];
  canAdd: boolean;
  canStart: boolean;
  changeRequestId: number;
  onRefetch: () => void;
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [startTarget, setStartTarget] = useState<Participant | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Participant | null>(null);

  const handleStartConfirm = async (notes: string): Promise<void> => {
    if (!startTarget) return;
    try {
      await SharePointService.updateParticipant(startTarget.Id, {
        Status: "In Progress",
        StartDate: new Date().toISOString(),
      });

      const participantTask = await SharePointService.getParticipantTaskByContext(
        changeRequestId,
        startTarget.Person.Id,
        role,
      );

      if (participantTask) {
        if (notes) {
          await SharePointService.updateTask(participantTask.Id, {
            Comments: notes,
          });
        }
      } else {
        console.warn(
          "[handleStartConfirm] No task found for participant — notes not saved.",
          { changeRequestId, userId: startTarget.Person.Id, role },
        );
      }

      setStartTarget(null);
      onRefetch();
    } catch (err) {
      console.error("Failed to start participant:", err);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    try {
      await SharePointService.deleteParticipant(removeTarget.Id);
      setRemoveTarget(null);
      onRefetch();
    } catch (err) {
      console.error("Failed to remove participant:", err);
    }
  };

  const handleDueDateChange = async (participant: Participant, date: string) => {
    try {
      await SharePointService.updateParticipant(participant.Id, { DueDate: date });
      onRefetch();
    } catch (err) {
      console.error("Failed to update due date:", err);
    }
  };

const handleAdd = async (person: SharePointPerson) => {
  try {
    await SharePointService.addParticipant(changeRequestId, person.Id, role);
    setAddOpen(false);
    onRefetch();
  } catch (err) {
    console.error("Failed to add participant:", err);
  }
};
  return (
    <Box>
      {/* Section header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.25 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#323130", textTransform: "uppercase", letterSpacing: 0.6 }}>
          {title} ({participants.length})
        </Typography>
        {canAdd && (
          <Button size="small" variant="outlined" onClick={() => setAddOpen(true)} startIcon={<AddIcon sx={{ fontSize: 13 }} />} sx={{ fontSize: 11, py: 0.4, px: 1.25, textTransform: "none" }}>
            Add
          </Button>
        )}
      </Box>
      <Divider />

      {participants.length === 0 ? (
        <Typography sx={{ fontSize: 12, color: "#A19F9D", px: 2, py: 1.5 }}>
          No {title.toLowerCase()} added yet
        </Typography>
      ) : (
        participants.map((p) => (
          <ParticipantRow
            key={p.Id}
            participant={p}
            canStart={canStart}
            canAdd={canAdd}
            onStart={(participant) => setStartTarget(participant)}
            onRemove={(participant) => setRemoveTarget(participant)}
            onDueDateChange={handleDueDateChange}
          />
        ))
      )}

      <StartConfirmModal
        open={!!startTarget}
        participant={startTarget}
        onConfirm={handleStartConfirm}
        onClose={() => setStartTarget(null)}
      />

      <AddParticipantModal
        open={addOpen}
        role={role}
        existingParticipants={participants}
        excludeIds={excludeIds}
        onConfirm={handleAdd}
        onClose={() => setAddOpen(false)}
      />

      <RemoveConfirmModal
        open={!!removeTarget}
        participant={removeTarget}
        onConfirm={handleRemoveConfirm}
        onClose={() => setRemoveTarget(null)}
      />
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ParticipantsTable = ({ changeRequestId, contributors, reviewers, loading, canAdd, canStart, onRefetch }: ParticipantsTableProps) => {
  const excludeContributorIds = reviewers
    .map((r) => r.Person?.Id)
    .filter((id): id is number => id !== undefined);

  const excludeReviewerIds = contributors
    .map((c) => c.Person?.Id)
    .filter((id): id is number => id !== undefined);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <ParticipantSection title="Contributors" role="Contributor" participants={contributors} excludeIds={excludeContributorIds} canAdd={canAdd} canStart={canStart} changeRequestId={changeRequestId} onRefetch={onRefetch} />
      <ParticipantSection title="Reviewers" role="Reviewer" participants={reviewers} excludeIds={excludeReviewerIds} canAdd={canAdd} canStart={canStart} changeRequestId={changeRequestId} onRefetch={onRefetch} />
    </Box>
  );
};

export default ParticipantsTable;
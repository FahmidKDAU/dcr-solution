// src/webparts/adminDashboard/components/CRParticipantsTab.tsx
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import { IChangeRequest } from "../../../shared/types/ChangeRequest";
import { useParticipants } from "../../../shared/hooks/useParticipants";
import { getAvatarColor, getAvatarInitials } from "../../../shared/utils/avatarUtils";
import { SharePointPerson } from "../../../shared/types/SharePointPerson";
import { Participant } from "../../../shared/types/Participant";

interface CRParticipantsTabProps {
  cr: IChangeRequest;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Avatar = ({ name, size = 30 }: { name: string; size?: number }) => (
  <Box sx={{
    width: size, height: size, borderRadius: "50%",
    backgroundColor: getAvatarColor(name),
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  }}>
    <Typography sx={{ fontSize: size * 0.36, fontWeight: 600, color: "#fff", lineHeight: 1 }}>
      {getAvatarInitials(name)}
    </Typography>
  </Box>
);

const formatDate = (d: Date | string | undefined): string => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
};

const PARTICIPANT_STATUS: Record<string, { bg: string; color: string }> = {
  "Complete":    { bg: "#DFF6DD", color: "#107C10" },
  "In Progress": { bg: "#EFF6FC", color: "#0078D4" },
  "Not Started": { bg: "#F3F2F1", color: "#605E5C" },
  "Cancelled":   { bg: "#F3F2F1", color: "#A19F9D" },
};

// ─── Role person row (for fixed CR roles like CA, Author etc) ─────────────────

const RoleRow = ({ role, person }: { role: string; person: SharePointPerson | undefined | null }) => {
  if (!person?.Title) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.1, borderBottom: "1px solid #F3F2F1", "&:last-child": { borderBottom: "none" } }}>
      <Avatar name={person.Title} size={30} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#323130", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {person.Title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "#A19F9D" }}>{role}</Typography>
      </Box>
    </Box>
  );
};

// ─── Participant row (contributors / reviewers with status) ───────────────────

const ParticipantRow = ({ participant, role }: { participant: Participant; role: string }) => {
  const name = participant.Person?.Title ?? "Unknown";
  const sc = PARTICIPANT_STATUS[participant.Status] ?? { bg: "#F3F2F1", color: "#605E5C" };
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.1, borderBottom: "1px solid #F3F2F1", "&:last-child": { borderBottom: "none" } }}>
      <Avatar name={name} size={30} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#323130", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "#A19F9D" }}>
          {role}{participant.DueDate ? ` · Due ${formatDate(participant.DueDate)}` : ""}
        </Typography>
      </Box>
      <Box sx={{ display: "inline-flex", alignItems: "center", px: 1, py: 0.3, borderRadius: "10px", backgroundColor: sc.bg, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: sc.color }}>{participant.Status}</Typography>
      </Box>
    </Box>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.6, mb: 1 }}>
      {title}
    </Typography>
    <Box sx={{ border: "1px solid #EDEBE9", borderRadius: "8px", backgroundColor: "#fff", overflow: "hidden", px: 1.5 }}>
      {children}
    </Box>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CRParticipantsTab = ({ cr }: CRParticipantsTabProps): React.ReactElement => {
  const crId = cr.ID ?? cr.Id;
  const { contributors, reviewers, loading, error } = useParticipants(crId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={6}>
        <CircularProgress size={24} sx={{ color: "#0078D4" }} />
      </Box>
    );
  }

  if (error) {
    return <Box p={3}><Typography sx={{ fontSize: 13, color: "#A4262C" }}>{error}</Typography></Box>;
  }

  const hasContributors = contributors.length > 0;
  const hasReviewers = reviewers.length > 0;
  const completeCount = [...contributors, ...reviewers].filter(p => p.Status === "Complete").length;
  const totalParticipants = contributors.length + reviewers.length;

  return (
    <Box sx={{ px: 2, pt: 2, pb: 3 }}>

      {/* ── Core roles ── */}
      <Section title="Roles">
        <RoleRow role="Change Authority"     person={cr.ChangeAuthority} />
        <RoleRow role="Author"               person={cr.Author0} />
        <RoleRow role="Release Authority"    person={cr.ReleaseAuthority} />
        <RoleRow role="Core Functionality"   person={cr.CoreFunctionality as any} />
      </Section>

      {/* ── Participants (contributors + reviewers) ── */}
      {totalParticipants > 0 && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#A19F9D", textTransform: "uppercase", letterSpacing: 0.6 }}>
              Participants
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#605E5C" }}>
              {completeCount} / {totalParticipants} complete
            </Typography>
          </Box>

          {/* Progress bar */}
          <Box sx={{ height: 4, backgroundColor: "#F3F2F1", borderRadius: "99px", overflow: "hidden", mb: 1.5 }}>
            <Box sx={{
              height: "100%",
              width: `${totalParticipants > 0 ? Math.round((completeCount / totalParticipants) * 100) : 0}%`,
              backgroundColor: completeCount === totalParticipants ? "#107C10" : "#0078D4",
              borderRadius: "99px",
              transition: "width 0.3s ease",
            }} />
          </Box>

          <Box sx={{ border: "1px solid #EDEBE9", borderRadius: "8px", backgroundColor: "#fff", overflow: "hidden", px: 1.5 }}>
            {hasContributors && (
              <>
                <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#C8C6C4", textTransform: "uppercase", letterSpacing: 0.5, pt: 1, pb: 0.5 }}>
                  Contributors
                </Typography>
                {contributors.map(p => <ParticipantRow key={p.Id} participant={p} role="Contributor" />)}
              </>
            )}
            {hasContributors && hasReviewers && (
              <Divider sx={{ my: 0.5, borderColor: "#F3F2F1" }} />
            )}
            {hasReviewers && (
              <>
                <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#C8C6C4", textTransform: "uppercase", letterSpacing: 0.5, pt: 1, pb: 0.5 }}>
                  Reviewers
                </Typography>
                {reviewers.map(p => <ParticipantRow key={p.Id} participant={p} role="Reviewer" />)}
              </>
            )}
          </Box>
        </>
      )}

      {totalParticipants === 0 && (
        <Box sx={{ px: 1.5, py: 2, border: "1px solid #EDEBE9", borderRadius: "8px", backgroundColor: "#fff" }}>
          <Typography sx={{ fontSize: 12, color: "#A19F9D", fontStyle: "italic" }}>No participants assigned yet</Typography>
        </Box>
      )}
    </Box>
  );
};

export default CRParticipantsTab;
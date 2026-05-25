// src/webparts/adminDashboard/components/CRDrawer.tsx
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import { IChangeRequest } from "../../../shared/types/ChangeRequest";
import { getAvatarColor, getAvatarInitials } from "../../../shared/utils/avatarUtils";
import { BRANDING } from "../../../shared/theme/theme";
import CRDetailsTab from "./CrDetailsTab";
import AuditTrailTab from "../../taskHub/components/tabs/AuditTrailTab";
import CRParticipantsTab from "./CrParticipantsTab";

interface CRDrawerProps {
  cr: IChangeRequest | null;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  Submitted:              { bg: "#EFF6FC", color: "#0078D4", dot: "#0078D4" },
  "CA Review":            { bg: "#FFF4CE", color: "#835B00", dot: "#FFB900" },
  Approved:               { bg: "#DFF6DD", color: "#107C10", dot: "#107C10" },
  "Document Creation":    { bg: "#EFF6FC", color: "#0078D4", dot: "#0078D4" },
  "Document Review":      { bg: "#EFF6FC", color: "#0078D4", dot: "#0078D4" },
  "Ready for Publishing": { bg: "#EFF6FC", color: "#0078D4", dot: "#0078D4" },
  Published:              { bg: "#DFF6DD", color: "#107C10", dot: "#107C10" },
  Rejected:               { bg: "#FDE7E9", color: "#A4262C", dot: "#D13438" },
};

const ACTIVE_STATUSES = new Set([
  "Submitted", "CA Review", "Approved",
  "Document Creation", "Document Review", "Ready for Publishing",
]);

const StatusChip = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { bg: "#F3F2F1", color: "#605E5C", dot: "#C8C6C4" };
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3, borderRadius: "10px", backgroundColor: cfg.bg, flexShrink: 0 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: cfg.color, lineHeight: 1.4 }}>{status}</Typography>
    </Box>
  );
};

const Avatar = ({ name, size = 18 }: { name: string; size?: number }) => (
  <Box sx={{ width: size, height: size, borderRadius: "50%", backgroundColor: getAvatarColor(name), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Typography sx={{ fontSize: size * 0.38, fontWeight: 600, color: "#fff", lineHeight: 1 }}>{getAvatarInitials(name)}</Typography>
  </Box>
);

const formatDate = (date: string | undefined): string => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
};

const getDaysOpen = (created: string | undefined, status: string): string | null => {
  if (!created || !ACTIVE_STATUSES.has(status)) return null;
  const days = Math.floor((Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24));
  return days === 0 ? "Today" : `${days}d open`;
};

type TabId = "details" | "audit" | "participants";

const TABS: { id: TabId; label: string }[] = [
  { id: "details",      label: "Details" },
  { id: "audit",        label: "Audit trail" },
  { id: "participants", label: "Participants" },
];

const DrawerContent = ({ cr, onClose }: { cr: IChangeRequest; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const requestorName = cr.Requestor?.Title ?? cr.Author?.Title ?? cr.Author0?.Title ?? "—";
  const daysOpen = getDaysOpen(cr.Created, cr.Status);

  return (
    <Box
      sx={{ width: 400, display: "flex", flexDirection: "column", height: "100%" }}
      role="presentation"
    >
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, borderBottom: "1px solid #EDEBE9", flexShrink: 0, backgroundColor: "#fff" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", flex: 1, minWidth: 0, mr: 1 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#A19F9D", letterSpacing: 0.5, textTransform: "uppercase" }}>
              {cr.ChangeRequestNumber}
            </Typography>
            <StatusChip status={cr.Status} />
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "#605E5C", flexShrink: 0 }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#323130", lineHeight: 1.4, mb: 1 }}>
          {cr.Title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Avatar name={requestorName} />
            <Typography sx={{ fontSize: 12, color: "#605E5C" }}>{requestorName}</Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#C8C6C4" }}>·</Typography>
          <Typography sx={{ fontSize: 12, color: "#605E5C" }}>{formatDate(cr.Created)}</Typography>
          {daysOpen && (
            <>
              <Typography sx={{ fontSize: 12, color: "#C8C6C4" }}>·</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: daysOpen !== "Today" && parseInt(daysOpen) > 14 ? "#A4262C" : "#835B00" }}>
                {daysOpen}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: "flex", borderBottom: "1px solid #EDEBE9", px: 1, flexShrink: 0, backgroundColor: "#fff" }}>
        {TABS.map((tab) => (
          <Box
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            sx={{
              px: 1.5, py: 1.25,
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? BRANDING.primary : "#605E5C",
              borderBottom: activeTab === tab.id ? `2px solid ${BRANDING.primary}` : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              userSelect: "none",
              mb: "-1px",
              "&:hover": { color: "#323130" },
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Box>

      {/* Tab content */}
      <Box sx={{ flex: 1, overflow: "auto", minHeight: 0, backgroundColor: "#FAFAFA" }}>
        {activeTab === "details"      && <CRDetailsTab cr={cr} />}
        {activeTab === "audit"        && <AuditTrailTab cr={cr} />}
        {activeTab === "participants" && cr && <CRParticipantsTab cr={cr} />}
      </Box>
    </Box>
  );
};

const CRDrawer = ({ cr, onClose }: CRDrawerProps): React.ReactElement => {
  return (
    <Drawer
      anchor="right"
      open={!!cr}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: 400,
          boxSizing: "border-box",
          boxShadow: "-2px 0 16px rgba(0,0,0,0.1)",
        },
      }}
    >
      {cr && <DrawerContent cr={cr} onClose={onClose} />}
    </Drawer>
  );
};

export default CRDrawer;
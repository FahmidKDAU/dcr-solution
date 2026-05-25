// src/webparts/adminDashboard/components/AdminDashboard.tsx
import React, { useEffect, useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { IChangeRequest } from "../../../shared/types/ChangeRequest";
import { IAdminDashboardProps } from "./IAdminDashboardProps";
import { BRANDING } from "../../../shared/theme/theme";
import SharePointService from "../../../shared/services/SharePointService";
import CRDrawer from "./CrDrawer";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const ACTIVE_STATUSES = new Set([
  "Submitted", "CA Review", "Approved",
  "Document Creation", "Document Review", "Ready for Publishing",
]);

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  Submitted:              { bg: "#EFF6FC", color: "#0078D4", dot: "#0078D4" },
  "CA Review":            { bg: "#FFF4CE", color: "#835B00", dot: "#FFB900" },
  Approved:               { bg: "#DFF6DD", color: "#107C10", dot: "#107C10" },
  "Document Creation":    { bg: "#EFF6FC", color: "#0078D4", dot: "#0078D4" },
  "Document Review":      { bg: "#EFF6FC", color: "#0078D4", dot: "#0078D4" },
  "Ready for Publishing": { bg: "#F0F0FF", color: "#5C2D91", dot: "#5C2D91" },
  Published:              { bg: "#DFF6DD", color: "#107C10", dot: "#107C10" },
  Rejected:               { bg: "#FDE7E9", color: "#A4262C", dot: "#D13438" },
};

const ALL_TABS = [
  "All", "Submitted", "CA Review", "Document Creation",
  "Document Review", "Ready for Publishing", "Published", "Rejected",
];

// Richer avatar colour palette — more distinct, less muddy
const AVATAR_PALETTE = [
  "#0F4C81", "#107C10", "#5C2D91", "#D83B01",
  "#008575", "#C239B3", "#0078D4", "#744DA9",
  "#038387", "#E74856",
];

const getAvatarBg = (name: string): string =>
  AVATAR_PALETTE[(name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % AVATAR_PALETTE.length];

const getInitials = (name: string): string =>
  name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({ name, size = 26 }: { name: string; size?: number }) => (
  <Tooltip title={name} arrow>
    <Box sx={{
      width: size, height: size, borderRadius: "50%",
      backgroundColor: getAvatarBg(name),
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, cursor: "default",
    }}>
      <Typography sx={{ fontSize: size * 0.34, fontWeight: 600, color: "#fff", lineHeight: 1 }}>
        {getInitials(name)}
      </Typography>
    </Box>
  </Tooltip>
);

const StatusChip = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { bg: "#F3F2F1", color: "#605E5C", dot: "#C8C6C4" };
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3, borderRadius: "10px", backgroundColor: cfg.bg, whiteSpace: "nowrap" }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: cfg.color, lineHeight: 1.4 }}>{status}</Typography>
    </Box>
  );
};

const formatDate = (date: string | undefined): string => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
};

const getDaysOpen = (created: string | undefined, status: string): number | null => {
  if (!created || !ACTIVE_STATUSES.has(status)) return null;
  return Math.floor((Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24));
};

// ─── Sort types ───────────────────────────────────────────────────────────────

type SortField = "ChangeRequestNumber" | "Title" | "Status" | "Created" | "days";
type SortDir = "asc" | "desc";

const SortIcon = ({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) => {
  if (sortField !== field) return <UnfoldMoreIcon sx={{ fontSize: 13, color: "#C8C6C4", ml: 0.25 }} />;
  return sortDir === "asc"
    ? <ArrowUpwardIcon sx={{ fontSize: 13, color: BRANDING.primary, ml: 0.25 }} />
    : <ArrowDownwardIcon sx={{ fontSize: 13, color: BRANDING.primary, ml: 0.25 }} />;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = (_props: IAdminDashboardProps): React.ReactElement => {
  const [allCRs, setAllCRs] = useState<IChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedCR, setSelectedCR] = useState<IChangeRequest | null>(null);
  const [sortField, setSortField] = useState<SortField>("Created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    setLoading(true);
    SharePointService.getChangeRequests()
      .then(setAllCRs)
      .catch(() => setError("Could not load change requests."))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCRs.filter(cr => {
      const matchesStatus = statusTab === "All" || cr.Status === statusTab;
      const matchesSearch = !q || (
        cr.Title?.toLowerCase().includes(q) ||
        cr.ChangeRequestNumber?.toLowerCase().includes(q) ||
        cr.Author?.Title?.toLowerCase().includes(q) ||
        cr.Author0?.Title?.toLowerCase().includes(q) ||
        cr.ChangeAuthority?.Title?.toLowerCase().includes(q)
      );
      return matchesStatus && matchesSearch;
    });
  }, [allCRs, search, statusTab]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortField === "ChangeRequestNumber") { av = a.ChangeRequestNumber ?? ""; bv = b.ChangeRequestNumber ?? ""; }
      else if (sortField === "Title") { av = a.Title ?? ""; bv = b.Title ?? ""; }
      else if (sortField === "Status") { av = a.Status ?? ""; bv = b.Status ?? ""; }
      else if (sortField === "Created") { av = a.Created ? new Date(a.Created).getTime() : 0; bv = b.Created ? new Date(b.Created).getTime() : 0; }
      else if (sortField === "days") {
        av = getDaysOpen(a.Created, a.Status) ?? -1;
        bv = getDaysOpen(b.Created, b.Status) ?? -1;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { All: allCRs.length };
    allCRs.forEach(cr => { counts[cr.Status] = (counts[cr.Status] ?? 0) + 1; });
    return counts;
  }, [allCRs]);

  const activeCount = useMemo(() => allCRs.filter(cr => ACTIVE_STATUSES.has(cr.Status)).length, [allCRs]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusTab = (tab: string): void => { setStatusTab(tab); setPage(1); setSelectedCR(null); };
  const handleSearch = (value: string): void => { setSearch(value); setPage(1); };
  const handleRowClick = (cr: IChangeRequest): void => { setSelectedCR(prev => prev?.ID === cr.ID ? null : cr); };

  const ColHeader = ({ label, field, align = "left" }: { label: string; field?: SortField; align?: string }) => (
    <Box
      onClick={field ? () => handleSort(field) : undefined}
      sx={{
        display: "flex", alignItems: "center",
        cursor: field ? "pointer" : "default",
        userSelect: "none",
        justifyContent: align === "right" ? "flex-end" : "flex-start",
        "&:hover .sort-icon": field ? { color: "#605E5C" } : {},
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: sortField === field ? BRANDING.primary : "#A19F9D", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      {field && <SortIcon field={field} sortField={sortField} sortDir={sortDir} />}
    </Box>
  );

  const GRID = "90px minmax(0,1fr) 130px 150px 100px 60px";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#F9F8F7", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Header ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 0, borderBottom: "1px solid #EDEBE9", backgroundColor: "#fff", flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#201F1E", letterSpacing: -0.3 }}>
              Change requests
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#605E5C", mt: 0.25 }}>
              <Box component="span" sx={{ fontWeight: 600, color: "#201F1E" }}>{activeCount}</Box> active across the organisation
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search title, CR number, person…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "#A19F9D" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                fontSize: 13,
                borderRadius: "8px",
                backgroundColor: "#F9F8F7",
                "& fieldset": { borderColor: "#EDEBE9" },
                "&:hover fieldset": { borderColor: "#C8C6C4" },
                "&.Mui-focused fieldset": { borderColor: BRANDING.primary },
              },
            }}
          />
        </Box>

        {/* Status tabs */}
        <Box sx={{ display: "flex", overflowX: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
          {ALL_TABS.map(tab => {
            const count = countByStatus[tab] ?? 0;
            if (tab !== "All" && count === 0) return null;
            const isActive = statusTab === tab;
            return (
              <Box
                key={tab}
                onClick={() => handleStatusTab(tab)}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.75,
                  px: 1.5, py: 1.5,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? BRANDING.primary : "#605E5C",
                  borderBottom: isActive ? `2px solid ${BRANDING.primary}` : "2px solid transparent",
                  cursor: "pointer", whiteSpace: "nowrap", userSelect: "none",
                  flexShrink: 0, mb: "-1px",
                  "&:hover": { color: "#323130" },
                }}
              >
                {tab}
                <Box sx={{
                  fontSize: 11, fontWeight: 500,
                  px: 0.75, py: 0.1, borderRadius: "8px",
                  backgroundColor: isActive ? BRANDING.primary : "#F3F2F1",
                  color: isActive ? "#fff" : "#605E5C",
                  minWidth: 20, textAlign: "center",
                }}>
                  {count}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Table ── */}
      <Box sx={{ flex: 1 }}>
        {/* Column headers */}
        <Box sx={{
          display: "grid", gridTemplateColumns: GRID,
          px: 3, py: 1.25, gap: "10px",
          backgroundColor: "#F3F2F1",
          borderBottom: "1px solid #EDEBE9",
          position: "sticky", top: 0, zIndex: 1,
        }}>
          <ColHeader label="CR #"      field="ChangeRequestNumber" />
          <ColHeader label="Title"     field="Title" />
          <ColHeader label="Status"    field="Status" />
          <ColHeader label="Requestor" />
          <ColHeader label="Submitted" field="Created" />
          <ColHeader label="Days"      field="days" align="right" />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={10}>
            <CircularProgress size={28} sx={{ color: BRANDING.primary }} />
          </Box>
        ) : error ? (
          <Box p={4}><Typography color="error" fontSize={13}>{error}</Typography></Box>
        ) : paginated.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={10}>
            <Typography sx={{ fontSize: 13, color: "#A19F9D" }}>No change requests found</Typography>
          </Box>
        ) : (
          paginated.map(cr => {
            const isSelected = selectedCR?.ID === cr.ID;
            const days = getDaysOpen(cr.Created, cr.Status);
            const requestorName = cr.Author?.Title ?? cr.Author0?.Title ?? "—";
            const isOverdue = days !== null && days > 14;

            return (
              <Box
                key={cr.ID}
                onClick={() => handleRowClick(cr)}
                sx={{
                  display: "grid", gridTemplateColumns: GRID,
                  px: 3, py: 1.25, gap: "10px",
                  alignItems: "center",
                  borderBottom: "1px solid #F3F2F1",
                  borderLeft: isSelected ? `3px solid ${BRANDING.primary}` : "3px solid transparent",
                  backgroundColor: isSelected ? "#EFF6FC" : "#fff",
                  cursor: "pointer",
                  transition: "background 0.1s",
                  "&:hover": { backgroundColor: isSelected ? "#EFF6FC" : "#FAFAFA" },
                }}
              >
                <Typography sx={{ fontSize: 12, color: BRANDING.primary, fontWeight: 600 }}>
                  {cr.ChangeRequestNumber}
                </Typography>
                <Typography sx={{
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  color: "#201F1E",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {cr.Title}
                </Typography>
                <StatusChip status={cr.Status} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                  {requestorName !== "—" && <Avatar name={requestorName} size={24} />}
                  <Typography sx={{ fontSize: 12, color: "#323130", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {requestorName}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 12, color: "#605E5C" }}>{formatDate(cr.Created)}</Typography>
                <Typography sx={{
                  fontSize: 12, fontWeight: isOverdue ? 600 : 400, textAlign: "right",
                  color: days === null ? "#C8C6C4" : isOverdue ? "#A4262C" : days > 7 ? "#835B00" : "#605E5C",
                }}>
                  {days === null ? "—" : days === 0 ? "Today" : `${days}d`}
                </Typography>
              </Box>
            );
          })
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Box sx={{
            px: 3, py: 1.5, borderTop: "1px solid #EDEBE9",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            backgroundColor: "#F9F8F7",
          }}>
            <Typography sx={{ fontSize: 12, color: "#605E5C" }}>
              {Math.min((page - 1) * PAGE_SIZE + 1, sorted.length)}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) return null;
                return (
                  <Box key={p} onClick={() => setPage(p)} sx={{
                    width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "6px", fontSize: 12, cursor: "pointer",
                    backgroundColor: page === p ? BRANDING.primary : "transparent",
                    color: page === p ? "#fff" : "#605E5C",
                    border: page === p ? "none" : "1px solid #EDEBE9",
                    "&:hover": { backgroundColor: page === p ? BRANDING.primary : "#F3F2F1" },
                  }}>
                    {p}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Drawer ── */}
      <CRDrawer cr={selectedCR} onClose={() => setSelectedCR(null)} />
    </Box>
  );
};

export default AdminDashboard;
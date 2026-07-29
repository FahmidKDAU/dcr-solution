import React, { useState, useEffect, useRef, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SharePointService, { ContentSearchResult } from "../../../shared/services/SharePointService";
import { Document } from "../../../shared/types/Document";
import { BRANDING } from "../../../shared/theme/theme";

interface ContentSearchModalProps {
  open: boolean;
  onClose: () => void;
  documents: Document[];
  onOpenDocument: (doc: Document) => void;
}

interface MatchedResult {
  doc: Document;
  snippet: string;
}

const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const cleanAndHighlight = (raw: string, query: string): React.ReactElement => {
  const plain = raw
    .replace(/<c0>/gi, "")
    .replace(/<\/c0>/gi, "")
    .replace(/<ddd\/>/gi, "...");

  const terms = query.trim().split(/\s+/).filter(Boolean).map(escapeRegex);
  if (terms.length === 0) return <>{plain}</>;

  const splitPattern = new RegExp(`(${terms.join("|")})`, "gi");
  const parts = plain.split(splitPattern);

  return (
    <>
      {parts.map((part, i) =>
        new RegExp(`^(${terms.join("|")})$`, "i").test(part) ? (
          <Box
            key={i}
            component="mark"
            sx={{
              backgroundColor: "#FEF3E2",
              color: "#B5850A",
              fontWeight: 700,
              padding: "0 1px",
            }}
          >
            {part}
          </Box>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
};

const ContentSearchModal: React.FC<ContentSearchModalProps> = ({
  open, onClose, documents, onOpenDocument,
}) => {
  const [query, setQuery] = useState("");
  const [rawResults, setRawResults] = useState<ContentSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const docPathIndex = useMemo(() => {
    return documents
      .map((d) => ({
        doc: d,
        path: (d.PublishedFileUrl || d.FileRef || "").replace(/^\//, "").toLowerCase(),
      }))
      .filter((entry) => entry.path.length > 0);
  }, [documents]);

  const matchedResults: MatchedResult[] = useMemo(() => {
    return rawResults
      .map((r) => {
        const lowerPath = r.path.toLowerCase();
        const match = docPathIndex.find((entry) => lowerPath.includes(entry.path));
        return match ? { doc: match.doc, snippet: r.snippet } : null;
      })
      .filter((r): r is MatchedResult => r !== null);
  }, [rawResults, docPathIndex]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setRawResults([]);
      setSearched(false);
    }
  }, [open]);

  useEffect(() => {
    if (!query) {
      setRawResults([]);
      setSearched(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      SharePointService.searchDocumentContent(query)
        .then((r) => {
          setRawResults(r);
          setSearched(true);
        })
        .catch((error) => {
          console.error("Content search failed:", error);
          setRawResults([]);
          setSearched(true);
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "10px" } }}>
      <Box sx={{ p: 2, borderBottom: "1px solid #E2E8F0" }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Search inside document text..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={20} sx={{ color: BRANDING.primary }} />
          </Box>
        )}

        {!loading && searched && matchedResults.length === 0 && (
          <Box py={4} textAlign="center">
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              No matches found inside any documents.
            </Typography>
          </Box>
        )}

        {!loading && !searched && (
          <Box py={4} textAlign="center">
            <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
              Searches the actual text inside published PDFs and Word documents.
            </Typography>
          </Box>
        )}

        {!loading && matchedResults.map((result, i) => (
          <Box
            key={i}
            onClick={() => {
              onOpenDocument(result.doc);
              onClose();
            }}
            sx={{
              display: "flex", gap: 1.5, px: 2, py: 1.5,
              borderBottom: "1px solid #F1F5F9", cursor: "pointer",
              "&:hover": { backgroundColor: "#F8FAFC" },
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "#0078D4", mt: 0.25, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
                {result.doc.DocumentTitle}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#64748B", mt: 0.5, lineHeight: 1.5 }}>
                {cleanAndHighlight(result.snippet, query)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
};

export default ContentSearchModal;

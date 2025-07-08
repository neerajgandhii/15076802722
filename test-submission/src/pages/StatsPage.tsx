import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Collapse,
  Button,
  Stack,
  Divider,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const LOCAL_STORAGE_KEY = "shortened_urls";
const CLICK_DATA_KEY = "shortened_clicks";

export default function StatsPage() {
  const [urls, setUrls] = useState<any[]>([]);
  const [clicks, setClicks] = useState<{ [key: string]: any[] }>({});
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const clickData = localStorage.getItem(CLICK_DATA_KEY);
    setUrls(stored ? JSON.parse(stored) : []);
    setClicks(clickData ? JSON.parse(clickData) : {});
  }, []);

  const filteredUrls = urls.filter(
    (url) =>
      url.longUrl.toLowerCase().includes(filter.toLowerCase()) ||
      url.shortUrl.toLowerCase().includes(filter.toLowerCase())
  );

  const totalClicks = Object.values(clicks).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleExpand = (shortcode: string) => {
    setExpanded((prev) => ({
      ...prev,
      [shortcode]: !prev[shortcode],
    }));
  };

  return (
    <Box maxWidth="md" mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">URL Statistics</Typography>
          <Button component={Link} to="/" variant="outlined">
            Back to Shortener
          </Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
          <TextField
            label="Search URLs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            fullWidth
          />
          <Paper sx={{ p: 2, minWidth: 180, background: "#f7fafc" }}>
            <Typography variant="subtitle2">Summary</Typography>
            <Typography variant="body2">Total URLs: {urls.length}</Typography>
            <Typography variant="body2">Total Clicks: {totalClicks}</Typography>
          </Paper>
        </Stack>
        {filteredUrls.length === 0 && (
          <Typography>No shortened URLs found.</Typography>
        )}
        {filteredUrls.map((url, idx) => (
          <Paper key={idx} sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" sx={{ wordBreak: "break-all" }}>
                {url.shortUrl}
              </Typography>
              <Tooltip title="Copy short URL">
                <IconButton size="small" onClick={() => handleCopy(url.shortUrl)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography variant="body2">
              <strong>Original:</strong> {url.longUrl}
            </Typography>
            <Typography variant="body2">
              <strong>Created:</strong>{" "}
              {url.expiry
                ? new Date(new Date(url.expiry).getTime() - (url.validity ?? 30) * 60000).toLocaleString()
                : "Unknown"}
            </Typography>
            <Typography variant="body2">
              <strong>Expires:</strong> {url.expiry}
            </Typography>
            <Typography variant="body2">
              <strong>Total Clicks:</strong> {clicks[url.shortcode]?.length ?? 0}
              {clicks[url.shortcode]?.length > 0 && (
                <IconButton
                  size="small"
                  onClick={() => toggleExpand(url.shortcode)}
                  sx={{ ml: 1 }}
                  aria-label="expand"
                >
                  {expanded[url.shortcode] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Typography>
            <Collapse in={!!expanded[url.shortcode]}>
              {clicks[url.shortcode]?.length > 0 && (
                <Box mt={1}>
                  <Typography variant="subtitle2">Click Details:</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Location</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clicks[url.shortcode].map((click, i) => (
                        <TableRow key={i}>
                          <TableCell>{click.timestamp}</TableCell>
                          <TableCell>{click.source}</TableCell>
                          <TableCell>{click.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Collapse>
          </Paper>
        ))}
      </Paper>
    </Box>
  );
}
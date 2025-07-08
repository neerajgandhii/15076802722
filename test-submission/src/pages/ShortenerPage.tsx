import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import { Log } from "../logger/logger";
import { Link } from "react-router-dom";

interface URLInput {
  longUrl: string;
  validity?: number;
  shortcode?: string;
}

interface ShortenedURL extends URLInput {
  shortUrl: string;
  expiry: string;
}

const LOCAL_STORAGE_KEY = "shortened_urls";

export default function ShortenerPage() {
  const [inputs, setInputs] = useState<URLInput[]>([{ longUrl: "" }]);
  const [results, setResults] = useState<ShortenedURL[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(results));
  }, [results]);

  const handleInputChange = (
    index: number,
    field: "longUrl" | "validity" | "shortcode",
    value: string
  ) => {
    const updated = [...inputs];
    if (field === "validity") {
      updated[index][field] = value ? parseInt(value) : undefined;
    } else {
      updated[index][field] = value;
    }
    setInputs(updated);
    setSuccess(false);
  };

  const handleAddInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, { longUrl: "" }]);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const generateShortcode = () =>
    Math.random().toString(36).substring(2, 7) + Date.now().toString(36).slice(-2);

  const handleSubmit = async () => {
    const allResults = [
      ...results,
      ...JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"),
    ];
    const existingShortcodes = new Set(allResults.map((r) => r.shortcode));
    let anySuccess = false;

    for (let index = 0; index < inputs.length; index++) {
      const input = inputs[index];
      const { longUrl, validity, shortcode } = input;

      if (!isValidUrl(longUrl)) {
        alert(`Invalid URL at row ${index + 1}`);
        await Log("frontend", "error", "component", `Invalid URL at row ${index + 1}`);
        continue;
      }

      let code = shortcode && /^[a-zA-Z0-9]{3,15}$/.test(shortcode)
        ? shortcode
        : generateShortcode();

      let attempts = 0;
      let collision = false;
      while (existingShortcodes.has(code) && attempts < 5) {
        if (shortcode) {
          alert(`Shortcode "${code}" at row ${index + 1} is already taken. Please choose another.`);
          await Log("frontend", "error", "component", `Shortcode collision: ${code}`);
          collision = true;
          break;
        } else {
          code = generateShortcode();
          attempts++;
        }
      }
      if (collision) continue;

      existingShortcodes.add(code);

      const validMinutes = validity && validity > 0 ? validity : 30;
      const expiryDate = new Date(Date.now() + validMinutes * 60 * 1000);

      const newEntry: ShortenedURL = {
        longUrl,
        validity: validMinutes,
        shortcode: code,
        shortUrl: `${window.location.origin}/${code}`,
        expiry: expiryDate.toLocaleString(),
      };

      setResults((prev) => [...prev, newEntry]);
      anySuccess = true;

      await Log("frontend", "info", "component", `Created short URL: ${code} → ${longUrl}`);
    }
    setSuccess(anySuccess);
  };

  const canSubmit = inputs.some((input) => input.longUrl && isValidUrl(input.longUrl));

  return (
    <Box maxWidth="md" mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          URL Shortener
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          Enter up to 5 URLs to shorten. Optionally set validity (minutes) and a custom shortcode.
        </Typography>
        <Stack spacing={2} mb={2}>
          {inputs.map((input, index) => (
            <Stack
              key={index}
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="flex-start"
            >
              <TextField
                label="Long URL"
                fullWidth
                required
                value={input.longUrl}
                onChange={(e) =>
                  handleInputChange(index, "longUrl", e.target.value)
                }
                helperText="Paste the full URL you want to shorten"
              />
              <TextField
                label="Validity (min)"
                fullWidth
                type="number"
                value={input.validity ?? ""}
                onChange={(e) =>
                  handleInputChange(index, "validity", e.target.value)
                }
                helperText="Defaults to 30 minutes if left blank"
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Custom Shortcode"
                fullWidth
                value={input.shortcode ?? ""}
                onChange={(e) =>
                  handleInputChange(index, "shortcode", e.target.value.trim())
                }
                helperText="Optional: 3-15 alphanumeric characters"
              />
            </Stack>
          ))}
          <Box>
            <Button
              variant="outlined"
              disabled={inputs.length >= 5}
              onClick={handleAddInput}
              sx={{ mr: 2 }}
            >
              + Add another
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Generate Short Links
            </Button>
            <Button component={Link} to="/stats" variant="outlined" sx={{ ml: 2 }}>
              View Stats
            </Button>
          </Box>
        </Stack>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Shortened URLs generated successfully!
          </Alert>
        )}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Results
        </Typography>
        {results.length === 0 && (
          <Typography color="text.secondary">No shortened URLs yet.</Typography>
        )}
        <Stack spacing={2}>
          {results.map((res, idx) => (
            <Paper key={idx} sx={{ p: 2, background: "#f7fafc" }}>
              <Typography variant="body1">
                <strong>Original:</strong> {res.longUrl}
              </Typography>
              <Typography variant="body1">
                <strong>Shortened:</strong>{" "}
                <a href={res.shortUrl} target="_blank" rel="noreferrer">
                  {res.shortUrl}
                </a>
              </Typography>
              <Typography variant="body2">
                <strong>Expiry:</strong> {res.expiry}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
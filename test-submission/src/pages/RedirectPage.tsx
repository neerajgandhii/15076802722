import { Log } from "../logger/logger";
import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@mui/material";

const LOCAL_STORAGE_KEY = "shortened_urls";
const CLICK_DATA_KEY = "shortened_clicks";

export default function RedirectPage() {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored && shortcode) {
      const urls = JSON.parse(stored);
      const found = urls.find((u: any) => u.shortcode === shortcode);

      if (found) {
        // Check expiry
        const expiryDate = new Date(found.expiry);
        if (expiryDate < new Date()) {
          alert("This link has expired.");
          navigate("/", { replace: true });
          return;
        }

        // Track click analytics
        const clickDataRaw = localStorage.getItem(CLICK_DATA_KEY);
        const clickData = clickDataRaw ? JSON.parse(clickDataRaw) : {};
        if (!clickData[shortcode]) clickData[shortcode] = [];
        clickData[shortcode].push({
          timestamp: new Date().toISOString(),
          source: document.referrer || "direct",
          location: "unknown" // Placeholder, as we can't get real location client-side
        });
        localStorage.setItem(CLICK_DATA_KEY, JSON.stringify(clickData));

        // Log the redirect attempt
        Log("frontend", "info", "component", `Redirected from shortcode: ${shortcode}`);

        // Redirect
        window.location.href = found.longUrl;
        return;
      }
    }
    // If not found, redirect to home or show error
    navigate("/", { replace: true });
  }, [shortcode, navigate]);

  return (
    <div>
      Redirecting...
      <Button component={Link} to="/stats" variant="outlined" sx={{ ml: 2 }}>
        View Stats
      </Button>
    </div>
  );
}
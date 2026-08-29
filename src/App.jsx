import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ---------- Design tokens ---------- */
const C = {
  bg: "#0D0D0D",
  panel: "#161616",
  card: "#1A1A1A",
  line: "#2A2A2A",
  gold: "#FFC107",
  blue: "#0A84FF",
  white: "#FFFFFF",
  mute: "#9A9A9A",
  faint: "#6B6B6B",
};

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";

const COMMISSION_RATE = 0.1;

function ugx(n) {
  return "UGX " + Math.round(n).toLocaleString("en-US");
}

/* ---------- Small building blocks ---------- */
function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 16px" }}>
      <div style={{ width: 32 }}>
        {onBack && (
          <button onClick={onBack} style={iconBtnStyle}>
            â†
          </button>
        )}
      </div>
      

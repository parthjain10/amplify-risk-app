"use client";

import React, { useMemo, useState } from "react";

type FailureKey =
  | "Bed Adhesion Failure"
  | "Part Displacement / Layer Shift"
  | "Nozzle Clog / Flow Starvation"
  | "Overhang / Support Failure"
  | "Thermal & Layer-Bond Failure"
  | "Stringing / Blobs / Surface Defects";

type VariableKey =
  | "Room_Temperature"
  | "Humidity_Level"
  | "Printer_Brand"
  | "Printer_Enclosure"
  | "Printer_Age"
  | "Base_Stability"
  | "Filament_Type"
  | "Filament_Dry"
  | "Dust_Level"
  | "Printer_Glue"
  | "Printer_Maintenance"
  | "Nozzle_Diameter"
  | "Nozzle_Temperature"
  | "Nozzle_Life"
  | "Bed_Temperature"
  | "Overhangs"
  | "Supports"
  | "Support_Density"
  | "Contact_Area_mm2"
  | "Print_Speed"
  | "First_Layer_Speed"
  | "Layer_Height"
  | "Print_Geometry"
  | "Raft"
  | "Brim"
  | "Infill_Pattern"
  | "Infill_Percentage"
  | "Wall_Count"
  | "Cooling_Fan_Speed"
  | "Retraction_Distance"
  | "Z_Hop"
  | "Acceleration"
  | "Filament_Feeder";

type VariableDef = {
  id: number;
  label: string;
  key: VariableKey;
  options: string[];
  defaultValue: string;
};

// ---- Extracted from your Amplify.xlsx (INPUT dropdowns) ----
const VARIABLES: VariableDef[] = [
  { id: 1, label: "Room Temperature (Celcius)", key: "Room_Temperature", options: ["<18", "18–25", "25–32", ">32"], defaultValue: "18–25" },
  { id: 2, label: "Humidity", key: "Humidity_Level", options: ["Low (<30%)", "Medium (30–60%)", "High (>60%)"], defaultValue: "Medium (30–60%)" },
  { id: 3, label: "Printer Brand", key: "Printer_Brand", options: ["Creality", "Prusa", "Bambu Lab", "Ultimaker", "Raise3D", "FlashForge", "Anycubic", "Ender", "Other"], defaultValue: "Other" },
  { id: 4, label: "Printer Enclosure", key: "Printer_Enclosure", options: ["No", "Partial", "Full"], defaultValue: "No" },
  { id: 5, label: "Printer Age", key: "Printer_Age", options: ["<1 year", "1–3 years", "3–5 years", ">5 years"], defaultValue: "1–3 years" },
  { id: 6, label: "Base Stability", key: "Base_Stability", options: ["Very stable", "Stable", "Slightly unstable", "Unstable"], defaultValue: "Stable" },
  { id: 7, label: "Filament Type", key: "Filament_Type", options: ["PLA", "PETG", "ABS", "ASA", "Nylon", "TPU"], defaultValue: "PLA" },
  { id: 8, label: "Filament Dry", key: "Filament_Dry", options: ["Yes", "Partially", "No"], defaultValue: "Yes" },
  { id: 9, label: "Dust", key: "Dust_Level", options: ["Low", "Medium", "High"], defaultValue: "Medium" },
  { id: 10, label: "Printer Glue", key: "Printer_Glue", options: ["None", "Glue stick", "Hair spray", "Special adhesion sheet"], defaultValue: "None" },
  { id: 11, label: "Printer Maintenance", key: "Printer_Maintenance", options: ["Regular", "Occasional", "Rare", "None"], defaultValue: "Occasional" },
  { id: 12, label: "Nozzle Diameter", key: "Nozzle_Diameter", options: ["0.2 mm", "0.4 mm", "0.6 mm", "0.8 mm"], defaultValue: "0.4 mm" },
  { id: 13, label: "Nozzle Temperature", key: "Nozzle_Temperature", options: ["<190", "190–220", ">220"], defaultValue: "190–220" },
  { id: 14, label: "Nozzle Life", key: "Nozzle_Life", options: ["<2 years", "2–4 years", ">4 years"], defaultValue: "2–4 years" },
  { id: 15, label: "Bed Temperature", key: "Bed_Temperature", options: ["<50 °C", "50–60 °C", ">60 °C"], defaultValue: "50–60 °C" },
  { id: 16, label: "Overhangs", key: "Overhangs", options: ["No", "<45°", "45–60°", ">60°"], defaultValue: "No" },
  { id: 17, label: "Supports", key: "Supports", options: ["No", "Yes"], defaultValue: "No" },
  { id: 18, label: "Support Density", key: "Support_Density", options: ["Low", "Medium", "High"], defaultValue: "Medium" },
  { id: 19, label: "3D Print Contact Area", key: "Contact_Area_mm2", options: ["<100 mm²", "100–500 mm²", "500–2,000 mm²", "2,000–10,000 mm²", ">10,000 mm²"], defaultValue: "500–2,000 mm²" },
  { id: 20, label: "Print Speed", key: "Print_Speed", options: ["<40 mm/s", "40–70 mm/s", "70–100 mm/s", ">100 mm/s"], defaultValue: "40–70 mm/s" },
  { id: 21, label: "First Layer Speed", key: "First_Layer_Speed", options: ["<15 mm/s", "15–30 mm/s", "30–50 mm/s", ">50 mm/s"], defaultValue: "15–30 mm/s" },
  { id: 22, label: "Layer  Height", key: "Layer_Height", options: ["<0.12 mm", "0.12–0.24 mm", "0.24–0.36 mm", ">0.36 mm"], defaultValue: "0.12–0.24 mm" },
  { id: 23, label: "Print Geometry", key: "Print_Geometry", options: ["Simple", "Moderate", "Complex", "Very complex"], defaultValue: "Moderate" },
  { id: 24, label: "Raft", key: "Raft", options: ["No", "Yes"], defaultValue: "No" },
  { id: 25, label: "Brim", key: "Brim", options: ["No", "Small (≤5 mm)", "Medium (5–10 mm)", "Large (>10 mm)"], defaultValue: "No" },
  { id: 26, label: "Infill Pattern", key: "Infill_Pattern", options: ["Lines", "Grid", "Triangles", "Gyroid", "Cubic", "Adaptive Cubic", "Quarter Cubic", "Support Cubic", "Lightning", "Honeycomb", "3D Honeycomb", "Hilbert Curve"], defaultValue: "Gyroid" },
  { id: 27, label: "Infill Percentage", key: "Infill_Percentage", options: ["<10%", "10–25%", "25–50%", ">50%"], defaultValue: "25–50%" },
  { id: 28, label: "Wall Count", key: "Wall_Count", options: ["1", "2", "3–4", ">4"], defaultValue: "3–4" },
  { id: 29, label: "Cooling Fan Speed", key: "Cooling_Fan_Speed", options: ["0–25%", "25–50%", "50–75%", "75–100%"], defaultValue: "50–75%" },
  { id: 30, label: "Retraction", key: "Retraction_Distance", options: ["<1 mm", "1–3 mm", "3–6 mm", ">6 mm"], defaultValue: "1–3 mm" },
  { id: 31, label: "Z Hop", key: "Z_Hop", options: ["Off", "<0.2 mm", "0.2–0.6 mm", ">0.6 mm"], defaultValue: "0.2–0.6 mm" },
  { id: 32, label: "Acceleration", key: "Acceleration", options: ["Low", "Medium", "High"], defaultValue: "Medium" },
  { id: 33, label: "Filament Feeder", key: "Filament_Feeder", options: ["Direct Drive", "Bowden"], defaultValue: "Direct Drive" },
];

// ---- Modifier lookups (extracted from your RISK MODEL logic) ----
const MOD: Record<VariableKey, Record<string, number>> = {
  Room_Temperature: { "<18": 0, "18–25": 0.5, "25–32": 0.75, ">32": 1 },
  Humidity_Level: { "Low (<30%)": 0.8, "Medium (30–60%)": 1.0, "High (>60%)": 1.3 },
  Printer_Brand: { Creality: 1.1, Prusa: 0.9, "Bambu Lab": 0.85, Ultimaker: 0.8, Raise3D: 0.8, FlashForge: 1.0, Anycubic: 1.1, Ender: 1.2, Other: 1.1 },
  Printer_Enclosure: { No: 1.2, Partial: 1.0, Full: 0.7 },
  Printer_Age: { "<1 year": 0.9, "1–3 years": 1.0, "3–5 years": 1.2, ">5 years": 1.4 },
  Base_Stability: { "Very stable": 0.8, Stable: 1.0, "Slightly unstable": 1.2, Unstable: 1.5 },
  Filament_Type: { PLA: 1.0, PETG: 1.1, ABS: 0.8, ASA: 0.8, Nylon: 1.3, TPU: 1.3 },
  Filament_Dry: { Yes: 0.6, Partially: 1.0, No: 1.4 },
  Dust_Level: { Low: 0.9, Medium: 1.0, High: 1.25 },
  Printer_Glue: { None: 1.2, "Glue stick": 1.0, "Hair spray": 1.05, "Special adhesion sheet": 0.9 },
  Printer_Maintenance: { Regular: 0.8, Occasional: 1.0, Rare: 1.2, None: 1.4 },
  Nozzle_Diameter: { "0.2 mm": 1.25, "0.4 mm": 1.0, "0.6 mm": 0.95, "0.8 mm": 0.9 },
  Nozzle_Temperature: { "<190": 1.3, "190–220": 1.0, ">220": 1.2 },
  Nozzle_Life: { "<2 years": 0.9, "2–4 years": 1.0, ">4 years": 1.3 },
  Bed_Temperature: { "<50 °C": 1.4, "50–60 °C": 1.0, ">60 °C": 1.2 },
  Overhangs: { No: 1.0, "<45°": 1.0, "45–60°": 1.2, ">60°": 1.5 },
  Supports: { No: 1.2, Yes: 0.9 },
  Support_Density: { Low: 1.3, Medium: 1.0, High: 0.9 },
  Contact_Area_mm2: { "<100 mm²": 2.0, "100–500 mm²": 1.6, "500–2,000 mm²": 1.2, "2,000–10,000 mm²": 1.0, ">10,000 mm²": 0.8 },
  Print_Speed: { "<40 mm/s": 0.9, "40–70 mm/s": 1.0, "70–100 mm/s": 1.2, ">100 mm/s": 1.5 },
  First_Layer_Speed: { "<15 mm/s": 0.8, "15–30 mm/s": 1.0, "30–50 mm/s": 1.2, ">50 mm/s": 1.5 },
  Layer_Height: { "<0.12 mm": 1.4, "0.12–0.24 mm": 1.0, "0.24–0.36 mm": 1.1, ">0.36 mm": 1.3 },
  Print_Geometry: { Simple: 0.9, Moderate: 1.0, Complex: 1.3, "Very complex": 1.6 },
  Raft: { No: 1.0, Yes: 0.8 },
  Brim: { No: 1.0, "Small (≤5 mm)": 0.95, "Medium (5–10 mm)": 0.9, "Large (>10 mm)": 0.85 },
  Infill_Pattern: { Lines: 1.2, Grid: 1.1, Triangles: 1.0, Gyroid: 0.9, Cubic: 1.0, "Adaptive Cubic": 1.0, "Quarter Cubic": 0.9, "Support Cubic": 1.2, Lightning: 1.4, Honeycomb: 0.9, "3D Honeycomb": 1.0, "Hilbert Curve": 1.5 },
  Infill_Percentage: { "<10%": 1.5, "10–25%": 1.2, "25–50%": 1.0, ">50%": 0.9 },
  Wall_Count: { "1": 1.6, "2": 1.2, "3–4": 1.0, ">4": 0.85 },
  Cooling_Fan_Speed: { "0–25%": 1.3, "25–50%": 1.1, "50–75%": 1.0, "75–100%": 1.2 },
  Retraction_Distance: { "<1 mm": 1.3, "1–3 mm": 1.0, "3–6 mm": 1.1, ">6 mm": 1.4 },
  Z_Hop: { Off: 1.2, "<0.2 mm": 1.1, "0.2–0.6 mm": 1.0, ">0.6 mm": 1.3 },
  Acceleration: { Low: 0.9, Medium: 1.0, High: 1.3 },
  Filament_Feeder: { "Direct Drive": 0.9, Bowden: 1.2 },
};

// ---- Failure mode definitions extracted from your OUTPUT raw formulas + caps ----
const FAILURE_CAP: Record<FailureKey, number> = {
  "Bed Adhesion Failure": 66.12,
  "Part Displacement / Layer Shift": 89.52,
  "Nozzle Clog / Flow Starvation": 23.7,
  "Overhang / Support Failure": 40.87,
  "Thermal & Layer-Bond Failure": 227.52,
  "Stringing / Blobs / Surface Defects": 11.76,
};

function clamp100(x: number) {
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

function round0(x: number) {
  return Math.round(x);
}

function product(nums: number[]) {
  return nums.reduce((acc, n) => acc * n, 1);
}

export default function Page() {
  const [inputs, setInputs] = useState<Record<VariableKey, string>>(() => {
    const initial: any = {};
    for (const v of VARIABLES) initial[v.key] = v.defaultValue;
    return initial;
  });

  const mods = useMemo(() => {
    const m: Record<VariableKey, number> = {} as any;
    for (const v of VARIABLES) {
      const chosen = inputs[v.key];
      const val = MOD[v.key]?.[chosen];
      m[v.key] = typeof val === "number" ? val : 1; // fallback 1
    }
    return m;
  }, [inputs]);

  const failureRaw = useMemo(() => {
    const m = mods;
    const raw: Record<FailureKey, number> = {
      "Bed Adhesion Failure": product([
        m.Room_Temperature,
        m.Humidity_Level,
        m.Printer_Enclosure,
        m.Filament_Type,
        m.Filament_Dry,
        m.Dust_Level,
        m.Printer_Glue,
        m.Bed_Temperature,
        m.Printer_Maintenance,
        m.Contact_Area_mm2,
        m.First_Layer_Speed,
        m.Brim,
        m.Raft,
        m.Cooling_Fan_Speed,
        m.Print_Geometry,
        m.Layer_Height,
        // NOTE: your Excel raw formula also included Printer_Brand? No. (keeping it exactly as extracted)
      ]),
      "Part Displacement / Layer Shift": product([
        m.Printer_Brand,
        m.Printer_Age,
        m.Base_Stability,
        m.Printer_Maintenance,
        m.Overhangs,
        m.Supports,
        m.Support_Density,
        m.Contact_Area_mm2,
        m.Print_Geometry,
        m.Print_Speed,
        m.Cooling_Fan_Speed,
        m.Z_Hop,
        m.Acceleration,
      ]),
      "Nozzle Clog / Flow Starvation": product([
        m.Filament_Type,
        m.Filament_Dry,
        m.Dust_Level,
        m.Printer_Maintenance,
        m.Nozzle_Diameter,
        m.Nozzle_Temperature,
        m.Nozzle_Life,
        m.Print_Speed,
        m.Layer_Height,
        m.Retraction_Distance,
        m.Filament_Feeder,
      ]),
      "Overhang / Support Failure": product([
        m.Printer_Enclosure,
        m.Filament_Type,
        m.Nozzle_Diameter,
        m.Nozzle_Temperature,
        m.Bed_Temperature,
        m.Overhangs,
        m.Supports,
        m.Support_Density,
        m.Print_Speed,
        m.Layer_Height,
        m.Print_Geometry,
        m.Cooling_Fan_Speed,
      ]),
      "Thermal & Layer-Bond Failure": product([
        m.Room_Temperature,
        m.Humidity_Level,
        m.Printer_Enclosure,
        m.Filament_Type,
        m.Filament_Dry,
        m.Printer_Glue,
        m.Printer_Maintenance,
        m.Nozzle_Temperature,
        m.Bed_Temperature,
        m.Contact_Area_mm2,
        m.Print_Speed,
        m.Layer_Height,
        m.Print_Geometry,
        m.Raft,
        m.Brim,
        m.Infill_Pattern,
        m.Infill_Percentage,
        m.Wall_Count,
        m.Cooling_Fan_Speed,
      ]),
      "Stringing / Blobs / Surface Defects": product([
        m.Humidity_Level,
        m.Filament_Type,
        m.Filament_Dry,
        m.Nozzle_Temperature,
        m.Print_Speed,
        m.Layer_Height,
        m.Cooling_Fan_Speed,
        m.Retraction_Distance,
        m.Z_Hop,
      ]),
    };
    return raw;
  }, [mods]);

  const failurePct = useMemo(() => {
    const pct: Record<FailureKey, number> = {} as any;
    (Object.keys(FAILURE_CAP) as FailureKey[]).forEach((k) => {
      const cap = FAILURE_CAP[k];
      const raw = failureRaw[k];
      const p = clamp100(round0((raw / cap) * 100));
      pct[k] = p;
    });
    return pct;
  }, [failureRaw]);

  const totalRisk = useMemo(() => {
    const vals = (Object.keys(FAILURE_CAP) as FailureKey[]).map((k) => failurePct[k]);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return clamp100(round0(avg));
  }, [failurePct]);

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Amplify — Print Risk Engine</h1>
      <p style={{ marginBottom: 18, opacity: 0.8 }}>
        Each modifier is multiplied to get a <b>raw risk</b>. Then we normalize to 0–100 using a <b>cap</b> (worst-case raw).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Inputs (33 variables)</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {VARIABLES.map((v) => (
              <label key={v.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>{v.id}. {v.label}</span>
                <select
                  value={inputs[v.key]}
                  onChange={(e) => setInputs((prev) => ({ ...prev, [v.key]: e.target.value }))}
                  style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ccc" }}
                >
                  {v.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Results</h2>

          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Total Risk (average of 6)</div>
            <div style={{ fontSize: 42, fontWeight: 800 }}>{totalRisk} / 100</div>
          </div>

          {(Object.keys(FAILURE_CAP) as FailureKey[]).map((k) => (
            <div key={k} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{k}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    Raw: {failureRaw[k].toFixed(3)} &nbsp;|&nbsp; Cap: {FAILURE_CAP[k]}
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{failurePct[k]}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.75 }}>
        If you want weights instead of “average of 6”, tell me the importance of each failure mode and I’ll add a weighted total.
      </div>
    </div>
  );
}


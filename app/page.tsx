"use client";

import { useMemo, useState } from "react";
import { VARIABLES, FAILURE_MODES, computeScores } from "./riskModel";

export default function Home() {
  // init defaults from the model file
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of VARIABLES) {
      init[v.id] = v.defaultValue ?? v.options[0]?.label ?? "";
    }
    return init;
  });

  const { perFailureMode, total } = useMemo(() => computeScores(selected), [selected]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Amplify — Print Failure Risk</h1>
      <p style={{ marginTop: 0, opacity: 0.75, marginBottom: 18 }}>
        Excel logic rebuilt as a web app (33 variables → 6 failure modes → total risk).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 }}>
        {/* Left: Inputs */}
        <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Inputs</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {VARIABLES.map((v) => (
              <label key={v.id} style={{ display: "block" }}>
                <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.85 }}>{v.label}</div>
                <select
                  value={selected[v.id]}
                  onChange={(e) => setSelected((s) => ({ ...s, [v.id]: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(0,0,0,0.2)",
                    color: "inherit",
                  }}
                >
                  {v.options.map((o) => (
                    <option key={o.label} value={o.label}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <button
            onClick={() => {
              const init: Record<string, string> = {};
              for (const v of VARIABLES) init[v.id] = v.defaultValue ?? v.options[0]?.label ?? "";
              setSelected(init);
            }}
            style={{
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Reset to Excel defaults
          </button>
        </section>

        {/* Right: Results */}
        <aside style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 16, height: "fit-content" }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Results</h2>

          <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", marginBottom: 12 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Total Risk of Failure (average)</div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.1 }}>{total.toFixed(2)}</div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {FAILURE_MODES.map((fm, i) => (
              <div key={fm} style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{i + 1}) {fm}</div>
                <div style={{ fontSize: 22, fontWeight: 650 }}>{perFailureMode[i].toFixed(2)}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <p style={{ marginTop: 16, opacity: 0.65, fontSize: 12 }}>
        Note: Scores match your Excel structure: option score (0–10) × importance% per failure mode, summed across variables.
      </p>
    </main>
  );
}

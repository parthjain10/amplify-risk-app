"use client";

import { useMemo, useState } from "react";
import { VARIABLES, FAILURE_MODES, computeScores } from "./riskModel";

export default function Home() {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of VARIABLES) {
      init[v.id] = v.defaultValue ?? v.options[0]?.label ?? "";
    }
    return init;
  });

  const { perFailureMode, total } = useMemo(() => computeScores(selected), [selected]);

  const resetDefaults = () => {
    const init: Record<string, string> = {};
    for (const v of VARIABLES) init[v.id] = v.defaultValue ?? v.options[0]?.label ?? "";
    setSelected(init);
  };

  return (
    <main className="container">
      <h1 className="h1">Amplify — Print Failure Risk</h1>
      <p className="sub">
        Select settings → see failure-mode risks + total risk (Excel logic rebuilt in web form).
      </p>

      <div className="grid-main">
        {/* Inputs */}
        <section className="card card-pad">
          <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Inputs</h2>

          <div className="inputs-grid">
            {VARIABLES.map((v) => (
              <div key={v.id}>
                <div className="label">{v.label}</div>
                <select
                  className="select"
                  value={selected[v.id]}
                  onChange={(e) => setSelected((s) => ({ ...s, [v.id]: e.target.value }))}
                >
                  {v.options.map((o) => (
                    <option key={o.label} value={o.label}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button className="btn" onClick={resetDefaults}>
            Reset to Excel defaults
          </button>
        </section>

        {/* Results */}
        <aside className="card card-pad" style={{ height: "fit-content" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Results</h2>

          <div className="kpi">
            <div className="kpi-title">Total Risk of Failure (average)</div>
            <div className="kpi-value">{total.toFixed(2)}</div>
          </div>

          <div className="fm-grid">
            {FAILURE_MODES.map((fm, i) => (
              <div key={fm} className="fm-item">
                <div className="fm-name">
                  {i + 1}) {fm}
                </div>
                <div className="fm-score">{perFailureMode[i].toFixed(2)}</div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            Tip: This layout is responsive—3 columns on desktop, 2 on medium screens, 1 on mobile.
          </p>
        </aside>
      </div>
    </main>
  );
}


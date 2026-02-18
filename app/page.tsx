"use client";

import { useMemo, useState } from "react";
import { VARIABLES, FAILURE_MODES, computeScores } from "./riskModel";

type GroupKey = "printer" | "slicer" | "other";

const GROUPS: { key: GroupKey; title: string; hint: string; ids: string[] }[] = [
  {
    key: "printer",
    title: "Printer Variables",
    hint: "Hardware, machine condition, mechanics",
    ids: [
      "printer_brand",
      "printer_enclosure",
      "printer_age",
      "base_stability",
      "printer_glue",
      "printer_maintenance",
      "nozzle_diameter",
      "nozzle_life",
      "filament_feeder",
    ],
  },
  {
    key: "slicer",
    title: "Slicer Variables",
    hint: "Settings that change per print profile",
    ids: [
      "nozzle_temperature",
      "bed_temperature",
      "print_speed",
      "first_layer_speed",
      "layer_height",
      "supports",
      "support_density",
      "raft",
      "brim",
      "infill_pattern",
      "infill_percentage",
      "wall_count",
      "cooling_fan_speed",
      "retraction",
      "z_hop",
      "acceleration",
    ],
  },
  {
    key: "other",
    title: "Other Variables",
    hint: "Environment + material + geometry",
    ids: [
      "room_temperature_celcius",
      "humidity",
      "filament_type",
      "filament_dry",
      "dust",
      "overhangs",
      "print_contact_area",
      "print_geometry",
    ],
  },
];

export default function Home() {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of VARIABLES) init[v.id] = v.defaultValue ?? v.options[0]?.label ?? "";
    return init;
  });

  // active “book”
  const [active, setActive] = useState<GroupKey>("printer");

  const { perFailureMode, total } = useMemo(() => computeScores(selected), [selected]);

  const varById = useMemo(() => {
    const m = new Map<string, (typeof VARIABLES)[number]>();
    for (const v of VARIABLES) m.set(v.id, v);
    return m;
  }, []);

  const resetDefaults = () => {
    const init: Record<string, string> = {};
    for (const v of VARIABLES) init[v.id] = v.defaultValue ?? v.options[0]?.label ?? "";
    setSelected(init);
  };

  return (
    <main className="container">
      <h1 className="h1">Amplify — Print Failure Risk</h1>
      <p className="sub">Hover (or click on mobile) a “file” to pull it out and edit those settings.</p>

      <div className="grid-main">
        {/* Left: Bookshelf */}
        <section className="shelf">
          <div className="shelf-row">
            {GROUPS.map((g, idx) => {
              const isActive = active === g.key;
              const cls = `book bookStacked ${isActive ? "active" : "dim"}`;

              return (
                <div
                  key={g.key}
                  className={cls}
                  data-index={idx}
                  onMouseEnter={() => setActive(g.key)}
                  onClick={() => setActive(g.key)} // mobile
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setActive(g.key);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`accent ${g.key}`} />
                  <div className="bookHeader">
                    <div>
                      <div className="bookTitle">{g.title}</div>
                      <div className="bookHint">{g.hint}</div>
                    </div>
                    <div className="bookHint">{isActive ? "Open" : "Hover to open"}</div>
                  </div>

                  <div className="bookBody">
                    <div className="bookInputs">
                      {g.ids.map((id) => {
                        const v = varById.get(id);
                        if (!v) return null;

                        return (
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
                        );
                      })}
                    </div>

                    <button className="btn" onClick={resetDefaults}>
                      Reset to Excel defaults
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shelfLine" />
        </section>

        {/* Right: Results */}
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
        </aside>
      </div>
    </main>
  );
}

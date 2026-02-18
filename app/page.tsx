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

  const [active, setActive] = useState<GroupKey>("printer");

  const { perFailureMode, total } = useMemo(() => computeScores(selected), [selected]);

  const varById = useMemo(() => {
    const m = new Map<string, (typeof VARIABLES)[number]>();
    for (const v of VARIABLES) m.set(v.id, v);
    return m;
  }, []);

  const activeGroup = GROUPS.find((g) => g.key === active)!;

  const resetDefaults = () => {
    const init: Record<string, string> = {};
    for (const v of VARIABLES) init[v.id] = v.defaultValue ?? v.options[0]?.label ?? "";
    setSelected(init);
  };

  return (
    <main className="container">
      {/* Center flashy heading */}
      <header className="heroHead">
        <h1 className="heroTitle">Risk Engine</h1>
        <p className="heroSub">
          A sustainability-driven initiative to predict 3D print failures before you press “Print”.
        </p>
      </header>

      <div className="grid-main">
        {/* Left: Library shelf + open panel */}
        <section className="libraryZone">
          <div className="libraryShelfCard">
            <div className="shelfTopHint">Browse categories like books on a shelf (hover / click)</div>

            <div className="shelfRow">
              {GROUPS.map((g) => {
                const isActive = active === g.key;

                return (
                  <div
                    key={g.key}
                    className={`bookSpine ${g.key} ${isActive ? "active" : "dim"}`}
                    onMouseEnter={() => setActive(g.key)}
                    onClick={() => setActive(g.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setActive(g.key);
                    }}
                    title="Hover to pull out"
                  >
                    <div className="spineFoil">{g.key === "printer" ? "PRINTER" : g.key === "slicer" ? "SLICER" : "OTHER"}</div>
                    <div className="spineTitle">{g.title}</div>
                    <div className="spineSmall">{isActive ? "OPEN" : "HOVER"}</div>
                  </div>
                );
              })}
            </div>

            <div className="shelfPlank" />
          </div>

          {/* Opened book/panel */}
          <div className="openPanel">
            <div className="openPanelHeader">
              <div>
                <div className="openPanelTitle">{activeGroup.title}</div>
                <div className="openPanelHint">{activeGroup.hint}</div>
              </div>

              <button className="btn" onClick={resetDefaults} style={{ marginTop: 0 }}>
                Reset defaults
              </button>
            </div>

            <div className="openPanelBody">
              <div className="openInputs">
                {activeGroup.ids.map((id) => {
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

              <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
                Tip: Change a few values and watch Total Risk + Failure Mode scores update live.
              </div>
            </div>
          </div>
        </section>

        {/* Right: Results */}
        <aside className="card card-pad stickyResults">
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

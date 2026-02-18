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
      <header className="hero">
        <div className="heroTitle">Risk Engine</div>
        <div className="heroSub">
          A sustainability-driven initiative to predict 3D print failures before you press “Print”.
        </div>
      </header>

      <div className="grid-main">
        {/* LEFT */}
        <section className="leftPane">
          {/* Shelf with vertical spines standing on a horizontal shelf */}
          <div className="shelfCard">
            <div className="shelfHint">Hover a spine to pull the book out. Click works on mobile.</div>

            <div className="shelfWrap">
              {/* Spines */}
              <div className="spineRow">
                {GROUPS.map((g) => {
                  const isActive = active === g.key;
                  return (
                    <div
                      key={g.key}
                      className={`spine ${g.key} ${isActive ? "active" : "dim"}`}
                      onMouseEnter={() => setActive(g.key)}
                      onClick={() => setActive(g.key)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setActive(g.key);
                      }}
                    >
                      <div className="spineFoil">
                        {g.key === "printer" ? "PRINTER" : g.key === "slicer" ? "SLICER" : "OTHER"}
                      </div>
                      <div className="spineTitle">{g.title}</div>
                      <div className="spineSmall">{isActive ? "OPEN" : "HOVER"}</div>
                    </div>
                  );
                })}
                <div className="shelfPlank" />
              </div>

              {/* Opened book (shows inputs INSIDE it) */}
              <div className="openBook" key={active}>
                <div className="openBookHeader">
                  <div>
                    <div className="openBookTitle">{activeGroup.title}</div>
                    <div className="openBookHint">{activeGroup.hint}</div>
                  </div>

                  <button className="btn" onClick={resetDefaults}>
                    Reset defaults
                  </button>
                </div>

                <div className="openBookBody">
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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Results stay extreme right */}
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

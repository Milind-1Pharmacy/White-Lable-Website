/**
 * @file FieldRow.tsx
 * @description Renders one editor field from a `Field` descriptor — the big
 *  switch over field `kind` (text/area/color/upload/tags/toggle/rich/services/
 *  items/navlinks/navctas/group/note). Fully prop-driven: every handler lives on
 *  the `f` descriptor, so this component holds no business logic.
 * @dependencies react, ../icons, ../builderStyles, ../builderHelpers,
 *  ../builderTypes, ./Hoverable, ./UploadField
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { icon } from "../icons";
import {
  ADD_DASHED, ADD_FRAG, FIELD_HELP, FIELD_LABEL, FRAG_X, ITEM_COL_LABEL, ITEM_INPUT,
  SERVICE_X, TAG_X, TEXT_AREA, TEXT_INPUT,
} from "../builderStyles";
import { CTA_VARIANTS, ctaPreviewStyle } from "../builderHelpers";
import type { Field, ItemColField, ItemRow, NavCtaRow, NavLinkRow, NavSectionRow, RichFrag, ServiceRow } from "../builderTypes";
import { Hoverable } from "./Hoverable";
import { UploadField } from "./UploadField";

/** Quiet char counter — plain mono text, NO pill chrome. Hidden until you're near
 *  the cap (≥75%), then faint amber; red at the max. Typing is hard-capped by the
 *  input's own `maxLength`, so this is just a gentle "you're near the limit" hint. */
function CharCount({ count, max }: { count: number; max?: number; min?: number }) {
  if (!max) return null;
  const ratio = count / max;
  if (ratio < 0.75) return null; // stay invisible until it matters
  const color = count >= max ? "#DC2626" : "#B45309";
  return (
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color, flex: "none", opacity: 0.9 }}>
      {count}/{max}
    </span>
  );
}

/** Derive a short plural unit from a group label, e.g. "Hero images" → "images",
 *  "Service cards" → "cards", "Pillars" → "pillars". Falls back to "items". */
function unitFromLabel(label?: string): string {
  if (!label) return "items";
  const last = label.trim().split(/\s+/).pop() || "items";
  return last.toLowerCase();
}

/** The ONE prominent badge that matters: how many items/images are allowed, the
 *  minimum, and whether it's required — e.g. "3 / 4 images · min 1 · required".
 *  Calm grey normally, amber below min, red at max. */
function MediaBadge({ count, min, max, atMax, belowMin, unit = "items", required }: { count?: number; min?: number; max?: number; atMax?: boolean; belowMin?: boolean; unit?: string; required?: boolean }) {
  if (count == null && min == null && max == null) return null;
  const tone =
    atMax ? { fg: "#B91C1C", bg: "#FEF2F2", bd: "#FECACA" } :
    belowMin ? { fg: "#B45309", bg: "#FFFBEB", bd: "#FDE68A" } :
    { fg: "#52525B", bg: "#F6F6F8", bd: "#E8E8EC" };
  const parts: string[] = [];
  if (count != null) parts.push(`${count}${max != null ? ` / ${max}` : ""} ${unit}`);
  else if (max != null) parts.push(`up to ${max} ${unit}`);
  if (min != null && min > 0) parts.push(`min ${min}`);
  if (required) parts.push("required");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", flex: "none", padding: "3px 10px", borderRadius: 999, background: tone.bg, border: `1px solid ${tone.bd}`, fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, lineHeight: 1.4, color: tone.fg, whiteSpace: "nowrap", fontWeight: 500 }}>
      {parts.join("  ·  ")}
    </span>
  );
}

type ThemePreset = { name: string; label: string; colors: Record<string, string> };
/** The six colour tokens shown for each theme — key → short label. In display order. */
const SWATCH_KEYS: Array<{ key: string; label: string }> = [
  { key: "background", label: "BG" },
  { key: "primary", label: "Primary" },
  { key: "accent", label: "Accent" },
  { key: "secondary", label: "Secondary" },
  { key: "text", label: "Text" },
  { key: "ink", label: "Ink" },
];

/** Compact fused swatch strip (no labels) — used on the trigger button. */
function SwatchStrip({ colors, size = 16 }: { colors: Record<string, string>; size?: number }) {
  return (
    <span style={{ display: "inline-flex", flex: "none", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(0,0,0,.1)" }}>
      {SWATCH_KEYS.map((s) => (
        <span key={s.key} title={s.label} style={{ width: size, height: size, background: colors[s.key] || "#fff" }} />
      ))}
    </span>
  );
}

/** Labeled palette grid: each colour token as a block with its name + hex below.
 *  This is the clear "this colour = this token" layout the dropdown rows use. */
function PaletteGrid({ colors }: { colors: Record<string, string> }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, width: "100%" }}>
      {SWATCH_KEYS.map((s) => {
        const hex = (colors[s.key] || "#FFFFFF").toUpperCase();
        return (
          <div key={s.key} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <span style={{ height: 30, borderRadius: 7, background: hex, border: "1px solid rgba(0,0,0,.1)" }} />
            <span style={{ fontSize: 9.5, fontWeight: 600, color: "#52525B", letterSpacing: ".01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, color: "#A1A1AA" }}>{hex}</span>
          </div>
        );
      })}
    </div>
  );
}

/** A theme picker that shows each theme's labeled colour palette in the dropdown,
 *  so the user sees exactly which colour is which token before selecting. */
function ThemeSelect({ value, presets, onSelect }: { value: string; presets: ThemePreset[]; onSelect: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const current = presets.find((p) => p.name === value) ?? presets[0];

  // Measure the trigger so the portalled panel can sit right under it. Recompute
  // on open, and on scroll/resize while open (the editor body scrolls).
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (r) setRect({ left: r.left, top: r.bottom + 6, width: r.width });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger: current theme label + a compact swatch strip. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid #E4E4EA", borderRadius: 11, background: "#fff", cursor: "pointer", outline: "none", textAlign: "left" }}
      >
        {current && <SwatchStrip colors={current.colors} />}
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: "#27272A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{current?.label}</span>
        <span style={{ display: "flex", color: "#9CA3AF", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>{icon("chevronDown", 16)}</span>
      </button>
      {/* Panel is PORTALLED to <body> — escapes the editor's scroll container and all
          sibling stacking, so it paints fully opaque over the form (no bleed-through). */}
      {open && rect && typeof document !== "undefined" && createPortal(
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1000 }} />
          <div style={{ position: "fixed", left: rect.left, top: rect.top, width: rect.width, zIndex: 1001, background: "#fff", border: "1px solid #E4E4EA", borderRadius: 13, boxShadow: "0 18px 50px rgba(16,16,20,.2)", padding: 7, display: "flex", flexDirection: "column", gap: 4, maxHeight: 380, overflowY: "auto" }}>
            {presets.map((p) => {
              const active = p.name === value;
              return (
                <Hoverable
                  as="button"
                  key={p.name}
                  onClick={() => { onSelect(p.name); setOpen(false); }}
                  style={{ display: "flex", flexDirection: "column", gap: 9, width: "100%", padding: "11px 12px", border: `1px solid ${active ? "#A9C6EF" : "#EDEDF0"}`, borderRadius: 11, background: active ? "#F7FAFE" : "#fff", cursor: "pointer", textAlign: "left" }}
                  hover={{ borderColor: active ? "#A9C6EF" : "#D4D4DB", background: active ? "#F1F6FD" : "#FAFAFB" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: "#27272A" }}>{p.label}</span>
                    {active && <span style={{ display: "flex", color: "#2E6ACF", flex: "none" }}>{icon("check", 15)}</span>}
                  </span>
                  <PaletteGrid colors={p.colors} />
                </Hoverable>
              );
            })}
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}

/**
 * ActionButton - the "Let AI write it" button (kind: "action"). On click it shows a
 * brief "Writing…" spinner (~350ms, so the deterministic template fill FEELS
 * generated), runs `onClick`, then flashes "✓ Filled" before returning to idle.
 * Local state only — nothing else in the editor re-renders while it animates.
 */
function ActionButton({ label, doneLabel, iconName, tooltip, onClick }: { label: string; doneLabel?: string; iconName?: string; tooltip?: string; onClick?: () => void }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (tRef.current) clearTimeout(tRef.current); }, []);
  const run = () => {
    if (state === "busy") return;
    setState("busy");
    tRef.current = setTimeout(() => {
      onClick?.();
      setState("done");
      tRef.current = setTimeout(() => setState("idle"), 1100);
    }, 350);
  };
  const busy = state === "busy";
  const done = state === "done";
  return (
    <button
      onClick={run}
      title={tooltip}
      disabled={busy}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "9px 14px", borderRadius: 10, cursor: busy ? "wait" : "pointer",
        border: "1px solid " + (done ? "#BBF0D4" : "#DBE5F5"),
        background: done ? "#ECFDF3" : "#F1F6FD",
        color: done ? "#15803D" : "#2457B0",
        fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
        transition: "all .18s ease",
      }}
    >
      {busy ? (
        <span style={{ width: 13, height: 13, border: "2px solid #C7D7F2", borderTopColor: "#2457B0", borderRadius: "50%", animation: "wb-spin .7s linear infinite", display: "inline-block" }} />
      ) : (
        icon(done ? "check" : (iconName || "sparkles"), 14)
      )}
      {busy ? "Writing…" : done ? (doneLabel || "Filled") : label}
    </button>
  );
}

export function FieldRow({ f }: { f: Field }) {
  const [focus, setFocus] = useState(false);
  const focusStyle = focus ? { borderColor: "#2E6ACF", boxShadow: "0 0 0 3px rgba(46,106,207,.14)" } : null;
  // Index of the rich-heading fragment whose grip is held — gates `draggable` so
  // the text inputs stay selectable/editable until the user grabs the handle.
  const [fragDrag, setFragDrag] = useState<number | null>(null);

  // Auto-focus the first input of a NEWLY-added item/fragment row, so adding an
  // entity drops the cursor straight into it (the user just types). We watch the
  // row/fragment count and, when it grows, focus the last row's first text input.
  const listRef = useRef<HTMLDivElement>(null);
  const rowCount = f.kind === "items" ? (f.rows?.length ?? 0) : f.kind === "rich" ? (f.fragments?.length ?? 0) : 0;
  const prevCount = useRef(rowCount);
  useEffect(() => {
    if (rowCount > prevCount.current && listRef.current) {
      const rows = listRef.current.querySelectorAll<HTMLElement>("[data-wb-item-row]");
      const last = rows[rows.length - 1];
      const input = last?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input:not([type=color]), textarea");
      input?.focus();
    }
    prevCount.current = rowCount;
  }, [rowCount]);

  return (
    <div style={{ marginBottom: 20 }}>
      {f.kind === "group" && (
        <div style={{ margin: "10px 0 2px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#27272A" }}>{f.label}</div>
            {(f.max != null || f.min != null) && (
              <MediaBadge count={f.count} min={f.min} max={f.max} atMax={f.atMax} belowMin={f.belowMin} unit={unitFromLabel(f.countLabel || f.label)} required={f.min != null && f.min > 0} />
            )}
          </div>
          {f.sub && <div style={{ fontSize: 12.5, color: "#A1A1AA", marginTop: 3 }}>{f.sub}</div>}
        </div>
      )}

      {f.kind === "note" && (
        <div style={{ display: "flex", gap: 10, padding: "13px 14px", borderRadius: 12, background: "#F1F6FD", border: "1px solid #E9F0FB" }}>
          <span style={{ display: "flex", color: "#2E6ACF", flex: "none", marginTop: 1 }}>{icon("lock", 15)}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#2457B0", marginBottom: 2 }}>{f.label}</div>
            <div style={{ fontSize: 12.5, color: "#5A6B85", lineHeight: 1.5 }}>{f.text}</div>
          </div>
        </div>
      )}

      {f.kind === "action" && (
        <ActionButton label={f.label} doneLabel={f.doneLabel} iconName={f.icon} tooltip={f.tooltip} onClick={f.onClick} />
      )}

      {f.kind === "text" && (
        <>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <label style={FIELD_LABEL}>{f.label}</label>
            <CharCount count={f.count ?? (f.value || "").length} max={f.max} min={f.min} />
          </div>
          <input type="text" value={f.value || ""} onChange={f.onChange} placeholder={f.placeholder} maxLength={f.max} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ ...TEXT_INPUT, ...(focusStyle || {}) }} />
          {f.help && <p style={FIELD_HELP}>{f.help}</p>}
        </>
      )}

      {f.kind === "select" && (
        <>
          <label style={FIELD_LABEL}>{f.label}</label>
          <select value={f.value || ""} onChange={f.onChange} style={{ ...TEXT_INPUT, cursor: "pointer" }}>
            {f.options.map((o: { value: string; label: string }) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {f.help && <p style={FIELD_HELP}>{f.help}</p>}
        </>
      )}

      {f.kind === "themeselect" && (
        <>
          <label style={FIELD_LABEL}>{f.label}</label>
          <ThemeSelect value={f.value || ""} presets={f.presets} onSelect={f.onSelect} />
          {f.help && <p style={FIELD_HELP}>{f.help}</p>}
        </>
      )}

      {f.kind === "area" && (
        <>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <label style={FIELD_LABEL}>{f.label}</label>
            <CharCount count={f.count ?? (f.value || "").length} max={f.max} min={f.min} />
          </div>
          <textarea rows={3} value={f.value || ""} onChange={f.onChange} placeholder={f.placeholder} maxLength={f.max} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ ...TEXT_AREA, ...(focusStyle || {}) }} />
          {f.help && <p style={FIELD_HELP}>{f.help}</p>}
        </>
      )}

      {f.kind === "color" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ position: "relative", width: 42, height: 42, borderRadius: 11, overflow: "hidden", border: "1px solid #E4E4EA", flex: "none", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
            <span style={{ position: "absolute", inset: 0, background: f.value }} />
            <input type="color" value={f.value} onChange={f.onChange} style={{ position: "absolute", inset: -6, width: 60, height: 60, border: "none", padding: 0, cursor: "pointer", opacity: 0 }} />
          </label>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46", marginBottom: 3 }}>{f.label}</div>
            <input type="text" value={f.value} onChange={f.onChange} style={{ width: 120, padding: "6px 10px", border: "1px solid #E4E4EA", borderRadius: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: "#52525B", background: "#fff", outline: "none", textTransform: "uppercase" }} />
          </div>
        </div>
      )}

      {f.kind === "upload" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <label style={FIELD_LABEL}>{f.label}</label>
            {f.required && (
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#B45309", flex: "none" }}>required</span>
            )}
          </div>
          <UploadField value={f.value || ""} hint={f.hint} spec={f.spec} onChange={f.onChange} />
        </>
      )}

      {f.kind === "tags" && (
        <>
          <label style={FIELD_LABEL}>{f.label}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center", padding: "8px 9px", border: "1px solid #E4E4EA", borderRadius: 11, background: "#fff" }}>
            {f.items.map((t: { text: string; onRemove: () => void }, i: number) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 6px 5px 11px", borderRadius: 8, background: "#F4F4F6", fontSize: 12.5, color: "#3F3F46" }}>
                {t.text}
                <button onClick={t.onRemove} style={TAG_X}>{icon("x", 13)}</button>
              </span>
            ))}
            <input type="text" onKeyDown={f.onAdd} placeholder={f.placeholder} style={{ flex: 1, minWidth: 140, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#18181B", padding: "5px 4px" }} />
          </div>
        </>
      )}

      {f.kind === "toggle" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 15px", border: "1px solid #EDEDF0", borderRadius: 12, background: "#fff" }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#27272A" }}>{f.label}</div>
            {f.lockNote && <div style={{ fontSize: 12, color: "#A1A1AA", marginTop: 2 }}>{f.lockNote}</div>}
          </div>
          <button onClick={f.onToggle} style={f.trackStyle}>
            <span style={f.knobStyle} />
          </button>
        </div>
      )}

      {f.kind === "services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {f.rows.map((row: ServiceRow, i: number) => (
            <div key={i} style={{ padding: 14, border: "1px solid #EDEDF0", borderRadius: 13, background: "#fff", position: "relative" }}>
              <button onClick={row.onRemove} style={SERVICE_X}>{icon("x", 13)}</button>
              <input type="text" value={row.title} onChange={row.onTitle} placeholder="Service title" style={{ width: "calc(100% - 36px)", padding: "6px 0", border: "none", outline: "none", fontSize: 14.5, fontWeight: 600, color: "#18181B", background: "transparent" }} />
              <textarea rows={2} value={row.desc} onChange={row.onDesc} placeholder="Short description" style={{ width: "100%", marginTop: 4, padding: 0, border: "none", outline: "none", fontSize: 13, lineHeight: 1.5, color: "#71717A", background: "transparent", resize: "none" }} />
            </div>
          ))}
          <Hoverable as="button" onClick={f.onAdd} style={ADD_DASHED} hover={{ borderColor: "#2E6ACF", color: "#2E6ACF" }}>{icon("plus", 14)}Add service</Hoverable>
        </div>
      )}

      {f.kind === "items" && (
        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {/* Single clean badge: "3 / 4 images · min 1 · required". The high-value info. */}
          {(f.max != null || f.min != null) && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -2 }}>
              <MediaBadge count={f.count} min={f.min} max={f.max} atMax={f.atMax} belowMin={f.belowMin} unit={unitFromLabel(f.countLabel)} required={f.min != null && f.min > 0} />
            </div>
          )}
          {f.rows.map((row: ItemRow, i: number) => (
            <div key={i} data-wb-item-row style={{ padding: 14, border: "1px solid #EDEDF0", borderRadius: 13, background: "#fff", position: "relative" }}>
              <button onClick={row.onRemove} style={SERVICE_X} title="Remove">{icon("x", 13)}</button>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, paddingRight: 26 }}>
                {row.cols.map((col: ItemColField, j: number) => (
                  <div key={j}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#9CA3AF", marginBottom: 4, letterSpacing: ".01em" }}>{col.label}</label>
                      {!col.upload && col.max && <CharCount count={(col.value || "").length} max={col.max} min={col.min} />}
                    </div>
                    {col.upload ? (
                      <UploadField value={col.value} hint={col.placeholder} spec={col.spec} onChange={col.onUpload} />
                    ) : col.area ? (
                      <textarea rows={2} value={col.value} onChange={col.onChange} placeholder={col.placeholder} maxLength={col.max} style={{ width: "100%", padding: "7px 9px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13, lineHeight: 1.5, color: "#18181B", background: "#fff", outline: "none", resize: "vertical" }} />
                    ) : col.key === "color" || col.key === "bg" || col.key === "fg" || col.key === "accent" || col.key === "tagBg" || col.key === "tagColor" || col.key === "background" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <label style={{ position: "relative", width: 30, height: 30, borderRadius: 8, overflow: "hidden", border: "1px solid #E4E4EA", flex: "none", cursor: "pointer" }}>
                          <span style={{ position: "absolute", inset: 0, background: /^#[0-9a-fA-F]{3,8}$/.test(col.value) ? col.value : "#fff" }} />
                          <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(col.value) ? col.value : "#000000"} onChange={col.onChange} style={{ position: "absolute", inset: -6, width: 46, height: 46, border: "none", padding: 0, cursor: "pointer", opacity: 0 }} />
                        </label>
                        <input type="text" value={col.value} onChange={col.onChange} placeholder={col.placeholder} style={{ flex: 1, minWidth: 0, padding: "7px 9px", border: "1px solid #E4E4EA", borderRadius: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: "#52525B", background: "#fff", outline: "none", textTransform: "uppercase" }} />
                      </div>
                    ) : (
                      <input type={col.numeric ? "number" : "text"} value={col.value} onChange={col.onChange} placeholder={col.placeholder} maxLength={col.max} style={{ width: "100%", padding: "7px 9px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13.5, color: "#18181B", background: "#fff", outline: "none" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Below-min advisory. */}
          {f.belowMin && f.min != null && (
            <div style={{ fontSize: 12, color: "#D97706", padding: "2px 2px" }}>Add at least {f.min} {(f.countLabel || "items").toLowerCase()}.</div>
          )}
          {/* Add disables at max (greyed + tooltip). */}
          {f.atMax ? (
            <div title={`Maximum ${f.max} reached`} style={{ ...ADD_DASHED, opacity: 0.45, cursor: "not-allowed", pointerEvents: "none" }}>{icon("plus", 14)}Maximum {f.max} reached</div>
          ) : (
            <Hoverable as="button" onClick={f.onAdd} style={ADD_DASHED} hover={{ borderColor: "#2E6ACF", color: "#2E6ACF" }}>{icon("plus", 14)}{f.addLabel || "Add item"}</Hoverable>
          )}
        </div>
      )}

      {f.kind === "navlinks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {f.targets.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "#A1A1AA", padding: "6px 2px" }}>Add sections first — nav links scroll to your page sections.</div>
          ) : (
            f.rows.map((row: NavLinkRow, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, border: "1px solid #EDEDF0", borderRadius: 11, background: "#fff" }}>
                <input
                  type="text"
                  value={row.label}
                  onChange={row.onLabel}
                  placeholder="Label (e.g. About us)"
                  style={{ flex: "1 1 45%", minWidth: 0, padding: "7px 9px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13.5, color: "#18181B", background: "#fff", outline: "none" }}
                />
                <span style={{ color: "#C4C4CC", fontSize: 12, flex: "none" }}>{icon("arrowRight", 13)}</span>
                <select
                  value={row.href}
                  onChange={row.onTarget}
                  style={{ flex: "1 1 45%", minWidth: 0, padding: "7px 8px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13, color: "#52525B", background: "#fff", outline: "none", cursor: "pointer" }}
                >
                  {/* Keep an unknown saved href selectable so it isn't silently lost. */}
                  {!f.targets.some((t: { href: string }) => t.href === row.href) && row.href && (
                    <option value={row.href}>{row.href}</option>
                  )}
                  {f.targets.map((t: { href: string; label: string }) => (
                    <option key={t.href} value={t.href}>{t.label}</option>
                  ))}
                </select>
                <button onClick={row.onRemove} title="Remove" style={{ flex: "none", width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon("x", 13)}</button>
              </div>
            ))
          )}
          {f.targets.length > 0 && (
            <Hoverable as="button" onClick={f.onAdd} style={ADD_DASHED} hover={{ borderColor: "#2E6ACF", color: "#2E6ACF" }}>{icon("plus", 14)}{f.addLabel || "Add link"}</Hoverable>
          )}
        </div>
      )}

      {f.kind === "navsections" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Nav-link count badge: "4 / 6 nav links" (red at the cap). */}
          {f.max != null && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <MediaBadge count={f.count} max={f.max} atMax={f.atMax} unit="nav links" />
            </div>
          )}
          {f.atMax && (
            <div style={{ fontSize: 11.5, color: "#B45309", padding: "0 2px 2px" }}>Max {f.max} nav links reached — turn one off to add another.</div>
          )}
          {f.rows.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "#A1A1AA", padding: "6px 2px" }}>Add sections first — the nav links to your page sections.</div>
          ) : (
            f.rows.map((row: NavSectionRow, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", border: "1px solid #EDEDF0", borderRadius: 11, background: row.inNav ? "#fff" : "#FAFAFB", opacity: row.toggleDisabled ? 0.55 : 1 }}>
                {/* Show-in-nav toggle (disabled when the nav is full and this is off) */}
                <button
                  onClick={row.onToggle}
                  disabled={row.toggleDisabled}
                  title={row.toggleDisabled ? "Nav is full — turn one off first" : row.inNav ? "Hide from nav" : "Show in nav"}
                  aria-pressed={row.inNav}
                  style={{ flex: "none", width: 38, height: 22, borderRadius: 999, border: "none", padding: 2, cursor: row.toggleDisabled ? "not-allowed" : "pointer", background: row.inNav ? "#2E6ACF" : "#D4D4DB", transition: "background .2s", display: "flex", justifyContent: row.inNav ? "flex-end" : "flex-start", alignItems: "center" }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
                </button>
                {/* Section name (always) + editable nav label (when in nav) */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {row.inNav ? (
                    <input
                      type="text"
                      value={row.label}
                      onChange={row.onLabel}
                      placeholder={row.sectionLabel}
                      style={{ width: "100%", padding: "5px 8px", border: "1px solid #E4E4EA", borderRadius: 7, fontSize: 13.5, fontWeight: 600, color: "#18181B", background: "#fff", outline: "none" }}
                    />
                  ) : (
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: "#9CA3AF" }}>{row.sectionLabel}</span>
                  )}
                  <div style={{ fontSize: 10.5, color: "#B4B4BE", marginTop: 2, paddingLeft: row.inNav ? 8 : 0 }}>{row.inNav ? "Shown in nav · " + row.sectionLabel : "Hidden from nav"}</div>
                </div>
                {/* Reorder arrows (only when in nav) */}
                {row.inNav && (
                  <div style={{ display: "flex", flexDirection: "column", flex: "none" }}>
                    <button onClick={row.onMoveUp} disabled={!row.canMoveUp} title="Move up" style={{ border: "none", background: "transparent", cursor: row.canMoveUp ? "pointer" : "default", color: row.canMoveUp ? "#71717A" : "#D4D4DB", display: "flex", padding: 0, height: 13, transform: "rotate(180deg)" }}>{icon("chevronDown", 13)}</button>
                    <button onClick={row.onMoveDown} disabled={!row.canMoveDown} title="Move down" style={{ border: "none", background: "transparent", cursor: row.canMoveDown ? "pointer" : "default", color: row.canMoveDown ? "#71717A" : "#D4D4DB", display: "flex", padding: 0, height: 13 }}>{icon("chevronDown", 13)}</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {f.kind === "navctas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {f.rows.map((row: NavCtaRow, i: number) => (
            <div key={i} style={{ padding: 12, border: "1px solid #EDEDF0", borderRadius: 13, background: "#fff", position: "relative" }}>
              <button onClick={row.onRemove} style={SERVICE_X} title="Remove">{icon("x", 13)}</button>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, paddingRight: 26 }}>
                <div>
                  <label style={ITEM_COL_LABEL}>Label</label>
                  <input type="text" value={row.label} onChange={row.onLabel} placeholder="Login" style={ITEM_INPUT} />
                </div>
                <div>
                  <label style={ITEM_COL_LABEL}>Link</label>
                  <input type="text" value={row.href} onChange={row.onHref} placeholder="https://… or /contact" style={ITEM_INPUT} />
                </div>
                <div>
                  <label style={ITEM_COL_LABEL}>Variant</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <select value={row.variant} onChange={row.onVariant} style={{ flex: 1, minWidth: 0, padding: "7px 9px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13, color: "#52525B", background: "#fff", outline: "none", cursor: "pointer" }}>
                      {CTA_VARIANTS.map((v) => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                    {/* Live button preview of the chosen variant, brand-coloured. */}
                    <span style={ctaPreviewStyle(row.variant, f.colors)}>{row.label || "Button"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Hoverable as="button" onClick={f.onAdd} style={ADD_DASHED} hover={{ borderColor: "#2E6ACF", color: "#2E6ACF" }}>{icon("plus", 14)}{f.addLabel || "Add CTA"}</Hoverable>
        </div>
      )}

      {f.kind === "rich" && (
        <>
          <label style={FIELD_LABEL}>
            {f.label} <span style={{ color: "#A1A1AA", fontWeight: 400 }}>· styled fragments</span>
          </label>
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, border: "1px solid #E4E4EA", borderRadius: 13, background: "#FBFBFC" }}>
            {f.fragments.map((frag: RichFrag, i: number) => (
              <div
                key={i}
                data-wb-item-row
                draggable={fragDrag === i}
                onDragOver={(e) => { e.preventDefault(); try { e.dataTransfer.dropEffect = "move"; } catch { /* */ } }}
                onDrop={(e) => { e.preventDefault(); frag.onDropOn(); setFragDrag(null); }}
                onDragStart={(e) => { frag.onDragStart(); try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(i)); } catch { /* */ } }}
                onDragEnd={() => { frag.onDragEnd(); setFragDrag(null); }}
                style={{ display: "flex", alignItems: "center", gap: 7, opacity: fragDrag === i ? 0.5 : 1 }}
              >
                <span
                  onMouseDown={() => setFragDrag(i)}
                  onMouseUp={() => setFragDrag(null)}
                  style={{ display: "flex", color: "#C4C4CC", cursor: "grab" }}
                  title="Drag to reorder"
                >
                  {icon("grip", 14)}
                </span>
                <input type="text" value={frag.text} onChange={frag.onText} maxLength={frag.max} style={{ flex: 1, minWidth: 0, padding: "8px 10px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13.5, color: "#18181B", background: "#fff", outline: "none" }} />
                {frag.max && <CharCount count={(frag.text || "").length} max={frag.max} min={frag.min} />}
                <select value={frag.emphasis} onChange={frag.onEmphasis} style={{ padding: "8px 7px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 12.5, color: "#52525B", background: "#fff", outline: "none", cursor: "pointer" }}>
                  <option value="">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="italic-accent">Italic + accent</option>
                  <option value="accent">Accent</option>
                </select>
                <button onClick={frag.onBreak} title="Line break after" style={frag.brStyle}>{icon("chevronDown", 14)}</button>
                <button onClick={frag.onRemove} style={FRAG_X}>{icon("x", 13)}</button>
              </div>
            ))}
            <Hoverable as="button" onClick={f.onAdd} style={ADD_FRAG} hover={{ borderColor: "#2E6ACF", color: "#2E6ACF" }}>{icon("plus", 14)}Add fragment</Hoverable>
          </div>
          <div style={{ marginTop: 11, padding: "14px 16px", borderRadius: 12, background: "#fff", border: "1px solid #EDEDF0" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, letterSpacing: ".1em", color: "#B4B4BE", marginBottom: 6 }}>PREVIEW</div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, lineHeight: 1.1, color: "#18181B" }}>{f.richPreview}</div>
          </div>
        </>
      )}
    </div>
  );
}

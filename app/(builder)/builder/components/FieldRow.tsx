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

import React, { useState } from "react";
import { icon } from "../icons";
import {
  ADD_DASHED, ADD_FRAG, FIELD_HELP, FIELD_LABEL, FRAG_X, ITEM_COL_LABEL, ITEM_INPUT,
  SERVICE_X, TAG_X, TEXT_AREA, TEXT_INPUT,
} from "../builderStyles";
import { CTA_VARIANTS, ctaPreviewStyle } from "../builderHelpers";
import type { Field, ItemColField, ItemRow, NavCtaRow, NavLinkRow, RichFrag, ServiceRow } from "../builderTypes";
import { Hoverable } from "./Hoverable";
import { UploadField } from "./UploadField";

export function FieldRow({ f }: { f: Field }) {
  const [focus, setFocus] = useState(false);
  const focusStyle = focus ? { borderColor: "#2E6ACF", boxShadow: "0 0 0 3px rgba(46,106,207,.14)" } : null;
  // Index of the rich-heading fragment whose grip is held — gates `draggable` so
  // the text inputs stay selectable/editable until the user grabs the handle.
  const [fragDrag, setFragDrag] = useState<number | null>(null);

  return (
    <div style={{ marginBottom: 20 }}>
      {f.kind === "group" && (
        <div style={{ margin: "10px 0 2px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#27272A" }}>{f.label}</div>
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

      {f.kind === "text" && (
        <>
          <label style={FIELD_LABEL}>{f.label}</label>
          <input type="text" value={f.value || ""} onChange={f.onChange} placeholder={f.placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ ...TEXT_INPUT, ...(focusStyle || {}) }} />
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

      {f.kind === "area" && (
        <>
          <label style={FIELD_LABEL}>{f.label}</label>
          <textarea rows={3} value={f.value || ""} onChange={f.onChange} placeholder={f.placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ ...TEXT_AREA, ...(focusStyle || {}) }} />
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
          <label style={FIELD_LABEL}>{f.label}</label>
          <UploadField value={f.value || ""} hint={f.hint} onChange={f.onChange} />
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
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {f.rows.map((row: ItemRow, i: number) => (
            <div key={i} style={{ padding: 14, border: "1px solid #EDEDF0", borderRadius: 13, background: "#fff", position: "relative" }}>
              <button onClick={row.onRemove} style={SERVICE_X} title="Remove">{icon("x", 13)}</button>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, paddingRight: 26 }}>
                {row.cols.map((col: ItemColField, j: number) => (
                  <div key={j}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#9CA3AF", marginBottom: 4, letterSpacing: ".01em" }}>{col.label}</label>
                    {col.upload ? (
                      <UploadField value={col.value} hint={col.placeholder} onChange={col.onUpload} />
                    ) : col.area ? (
                      <textarea rows={2} value={col.value} onChange={col.onChange} placeholder={col.placeholder} style={{ width: "100%", padding: "7px 9px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13, lineHeight: 1.5, color: "#18181B", background: "#fff", outline: "none", resize: "vertical" }} />
                    ) : col.key === "color" || col.key === "bg" || col.key === "fg" || col.key === "accent" || col.key === "tagBg" || col.key === "tagColor" || col.key === "background" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <label style={{ position: "relative", width: 30, height: 30, borderRadius: 8, overflow: "hidden", border: "1px solid #E4E4EA", flex: "none", cursor: "pointer" }}>
                          <span style={{ position: "absolute", inset: 0, background: /^#[0-9a-fA-F]{3,8}$/.test(col.value) ? col.value : "#fff" }} />
                          <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(col.value) ? col.value : "#000000"} onChange={col.onChange} style={{ position: "absolute", inset: -6, width: 46, height: 46, border: "none", padding: 0, cursor: "pointer", opacity: 0 }} />
                        </label>
                        <input type="text" value={col.value} onChange={col.onChange} placeholder={col.placeholder} style={{ flex: 1, minWidth: 0, padding: "7px 9px", border: "1px solid #E4E4EA", borderRadius: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: "#52525B", background: "#fff", outline: "none", textTransform: "uppercase" }} />
                      </div>
                    ) : (
                      <input type={col.numeric ? "number" : "text"} value={col.value} onChange={col.onChange} placeholder={col.placeholder} style={{ width: "100%", padding: "7px 9px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13.5, color: "#18181B", background: "#fff", outline: "none" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Hoverable as="button" onClick={f.onAdd} style={ADD_DASHED} hover={{ borderColor: "#2E6ACF", color: "#2E6ACF" }}>{icon("plus", 14)}{f.addLabel || "Add item"}</Hoverable>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, border: "1px solid #E4E4EA", borderRadius: 13, background: "#FBFBFC" }}>
            {f.fragments.map((frag: RichFrag, i: number) => (
              <div
                key={i}
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
                <input type="text" value={frag.text} onChange={frag.onText} style={{ flex: 1, minWidth: 0, padding: "8px 10px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13.5, color: "#18181B", background: "#fff", outline: "none" }} />
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

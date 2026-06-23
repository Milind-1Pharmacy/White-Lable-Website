/**
 * @file SectionsCanvas.tsx
 * @description The Sections-step canvas: the "Add section" header and the
 *  drag-and-drop list of section cards with the accent drop-line indicator.
 *  Keeps the `wb-sec-list` id the GSAP card-stagger effect targets.
 * @dependencies react, ../builderStyles, ../icons, ../components/Hoverable,
 *  ../components/SectionCard, ../useBuilderState
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React from "react";
import { BTN_ADD, DROP_LINE } from "../builderStyles";
import { icon } from "../icons";
import { Hoverable } from "../components/Hoverable";
import { SectionCard } from "../components/SectionCard";
import type { BuilderApi } from "../useBuilderState";

export function SectionsCanvas({ api }: { api: BuilderApi }) {
  const {
    sectionCards, dragId, dropIndex, dragRef, setDragId, setDropIndex, commitReorder,
    setPickerOpen, setSelectedSectionId, setEditingKey, dupSection, removeSection,
  } = api;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: "#71717A" }}>Hero stays first · drag the grip to reorder everything else</div>
        <Hoverable as="button" onClick={() => setPickerOpen(true)} style={BTN_ADD} hover={{ background: "#DCE8F8", borderColor: "#A9C6EF" }}>
          <span style={{ display: "flex" }}>{icon("plus", 15)}</span>Add section
        </Hoverable>
      </div>
      <div
        id="wb-sec-list"
        style={{ display: "flex", flexDirection: "column", gap: 11 }}
        onDragOver={(e) => { if (dragRef.current) e.preventDefault(); }}
        onDrop={(e) => { e.preventDefault(); if (dropIndex != null) commitReorder(dropIndex); dragRef.current = null; setDragId(null); setDropIndex(null); }}
      >
        {sectionCards.map((c, cardIdx) => (
          <React.Fragment key={c.id}>
            {/* Drop-line in the gap ABOVE this card (never above Hero at idx 0). */}
            {dragId && dropIndex === cardIdx && cardIdx > 0 && <div style={DROP_LINE} />}
            <SectionCard
              card={c}
              dimmed={dragId === c.id}
              onSelect={() => setSelectedSectionId(c.id)}
              onEdit={() => { setEditingKey(c.id); setSelectedSectionId(c.id); }}
              onDup={() => dupSection(c.id)}
              onDel={() => removeSection(c.id)}
              onDragStart={(e) => { dragRef.current = c.id; setDragId(c.id); setDropIndex(cardIdx); try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", c.id); } catch { /* */ } }}
              onDragOver={(e) => {
                if (!dragRef.current) return;
                e.preventDefault();
                // Top half → land before this card; bottom half → after it.
                // Clamp to ≥1 so nothing can land above the pinned Hero.
                const r = e.currentTarget.getBoundingClientRect();
                const after = e.clientY - r.top > r.height / 2;
                setDropIndex(Math.max(1, after ? cardIdx + 1 : cardIdx));
              }}
              onDragEnd={() => { dragRef.current = null; setDragId(null); setDropIndex(null); }}
            />
            {/* Drop-line after the LAST card (drop at the very end). */}
            {dragId && cardIdx === sectionCards.length - 1 && dropIndex === sectionCards.length && <div style={DROP_LINE} />}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

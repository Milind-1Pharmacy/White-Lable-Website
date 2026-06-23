/**
 * @file SectionCard.tsx
 * @description A single card in the sections canvas — grip-armed drag handle,
 *  selection/edit/duplicate/delete controls. Fully prop-driven; its only internal
 *  state is the `armed` grip flag that gates native dragging.
 * @dependencies react, ../icons, ../builderStyles, ../builderTypes, ./Hoverable
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React, { useState } from "react";
import { icon } from "../icons";
import { CARD_BTN } from "../builderStyles";
import type { CardModel } from "../builderTypes";
import { Hoverable } from "./Hoverable";

export function SectionCard({
  card,
  dimmed,
  onSelect,
  onEdit,
  onDup,
  onDel,
  onDragStart,
  onDragOver,
  onDragEnd,
}: {
  card: CardModel;
  dimmed?: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDup: (e: React.MouseEvent) => void;
  onDel: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  // The card is `draggable` ONLY while the grip handle is held — otherwise a
  // mousedown on the card body starts text selection and the native drag never
  // fires (the "can't drag at all" symptom). Holding the grip arms the drag.
  const [armed, setArmed] = useState(false);
  const border = card.selected ? "#2E6ACF" : "#ECECEF";
  const shadow = card.selected ? "0 0 0 3px rgba(46,106,207,.12)" : "0 1px 2px rgba(16,16,20,.04)";
  const style: React.CSSProperties = {
    background: "#fff",
    border: "1px solid " + border,
    borderRadius: 13,
    boxShadow: shadow,
    transition: "box-shadow .2s,border-color .2s,opacity .16s",
    overflow: "hidden",
    cursor: "pointer",
    userSelect: "none",
    // The dragged card fades while its drop-line shows where it'll land.
    ...(dimmed ? { opacity: 0.4 } : null),
  };
  return (
    <div
      className="wb-sec-card"
      data-id={card.id}
      draggable={card.draggable && armed}
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={() => { setArmed(false); onDragEnd(); }}
      style={style}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 14px" }}>
        <span
          onMouseDown={() => card.draggable && setArmed(true)}
          onMouseUp={() => setArmed(false)}
          style={{ display: "flex", color: card.draggable ? "#C4C4CC" : "#E4E4EA", cursor: card.draggable ? "grab" : "default", touchAction: "none" }}
          title="Drag to reorder"
        >{icon("grip", 16)}</span>
        <span style={{ width: 30, height: 30, borderRadius: 8, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: card.dot, color: card.dotFg }}>{icon(card.iconName, 15)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#27272A" }}>{card.label}</span>
            {card.tag && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".08em", color: "#9CA3AF", border: "1px solid #ECECEF", borderRadius: 5, padding: "1px 5px" }}>{card.tag}</span>}
          </div>
          <div style={{ fontSize: 12, color: "#A1A1AA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.summary}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Hoverable as="button" onClick={onEdit} style={CARD_BTN} hover={{ background: "#F4F4F6", color: "#2E6ACF" }}>{icon("chevronRight", 16)}</Hoverable>
          {card.canManage && (
            <>
              <Hoverable as="button" onClick={onDup} style={CARD_BTN} hover={{ background: "#F4F4F6", color: "#27272A" }}>{icon("copy", 15)}</Hoverable>
              <Hoverable as="button" onClick={onDel} style={CARD_BTN} hover={{ background: "#FEF2F2", color: "#DC2626" }}>{icon("trash", 15)}</Hoverable>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

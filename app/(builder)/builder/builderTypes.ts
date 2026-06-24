/**
 * @file builderTypes.ts
 * @description Shared TypeScript types for the Website Builder UI: the editor
 *  field descriptor, item-column shapes, typed DOM event aliases, the per-row
 *  view-model types consumed by FieldRow, and the section-card model.
 * @responsibilities
 *  - Define `Field` (the editor's field descriptor) + `ItemCol`.
 *  - Define the typed DOM event aliases used across the builder.
 *  - Define the row view-model types (ServiceRow, ItemRow, NavLinkRow, …).
 *  - Define `CardModel` (a section/core card in the sections canvas).
 * @dependencies react (event + CSSProperties types)
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
import type React from "react";

/** A field descriptor consumed by the editor renderer. */
export type Field = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
  kind:
    | "text"
    | "area"
    | "color"
    | "upload"
    | "tags"
    | "toggle"
    | "rich"
    | "services"
    | "items"
    | "navlinks"
    | "navctas"
    | "select"
    | "group"
    | "note";
};

/** One sub-field within a repeatable item card (used by the `items` field kind).
 *  `limitId` (optional) points at a TEXT_LIMITS id in validationSchema; when set, the
 *  rendered input gets a hard maxLength + live char counter. */
export type ItemCol = { key: string; label: string; placeholder?: string; numeric?: boolean; area?: boolean; upload?: boolean; limitId?: string };

// ---------- typed DOM events ----------
export type InputEvt = React.ChangeEvent<HTMLInputElement>;
export type AreaEvt = React.ChangeEvent<HTMLTextAreaElement>;
export type SelectEvt = React.ChangeEvent<HTMLSelectElement>;
export type KeyEvt = React.KeyboardEvent<HTMLInputElement>;

// ---------- per-row view models (consumed by FieldRow) ----------
export type ServiceRow = { title: string; desc: string; onTitle: (e: InputEvt) => void; onDesc: (e: AreaEvt) => void; onRemove: () => void };
export type ItemColField = { key: string; label: string; placeholder?: string; numeric?: boolean; area?: boolean; upload?: boolean; limitId?: string; max?: number; min?: number; value: string; onChange: (e: InputEvt | AreaEvt) => void; onUpload: (url: string) => void };
export type ItemRow = { cols: ItemColField[]; onRemove: () => void };
export type NavLinkRow = { label: string; href: string; onLabel: (e: InputEvt) => void; onTarget: (e: SelectEvt) => void; onRemove: () => void };
export type NavCtaRow = { label: string; href: string; variant: string; onLabel: (e: InputEvt) => void; onHref: (e: InputEvt) => void; onVariant: (e: SelectEvt) => void; onRemove: () => void };
export type RichFrag = { index: number; text: string; emphasis: string; max?: number; min?: number; brStyle: React.CSSProperties; onText: (e: InputEvt) => void; onEmphasis: (e: SelectEvt) => void; onBreak: () => void; onRemove: () => void; onDragStart: () => void; onDropOn: () => void; onDragEnd: () => void };

// ---------- a section card view model ----------
export type CardModel = {
  id: string;
  core: boolean;
  label: string;
  tag: string;
  dot: string;
  dotFg: string;
  iconName: string;
  summary: string;
  selected: boolean;
  canManage: boolean;
  draggable: boolean;
};

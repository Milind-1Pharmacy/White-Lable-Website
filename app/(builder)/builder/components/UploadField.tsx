/**
 * @file UploadField.tsx
 * @description An image input with two equivalent ways to set the value: upload
 *  a local file to S3 (via uploadImage) or paste any image URL / tenant path.
 *  Shows a thumbnail of the current value, an uploading spinner and inline error.
 * @dependencies react, ../icons, ../builderStyles, @/lib/api/upload, ./Hoverable
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React, { useRef, useState } from "react";
import { icon } from "../icons";
import { UPLOAD_BOX } from "../builderStyles";
import { uploadImage } from "@/lib/api/upload";
import { Hoverable } from "./Hoverable";

/**
 * UploadField - an image input with TWO equivalent ways to set the value:
 *  1. Upload a local file → S3 (uploadImage) → the returned S3 URL is stored.
 *  2. Paste/type ANY image URL (or /tenant path) in the text box below.
 * Either way the value is just a URL string the modules render — an upload is a
 * convenience, never a requirement. A bad/unreachable URL falls back to the
 * placeholder icon so a half-typed URL never shows a broken-image glyph.
 */
export function UploadField({ value, hint, onChange }: { value: string; hint?: string; onChange?: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Remember which URL failed to load (so we show the placeholder instead of a
  // broken thumbnail). Storing the URL — not a boolean — auto-invalidates when
  // `value` changes, with no effect needed.
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
  const broken = brokenUrl === value;

  const pick = () => {
    if (busy) return;
    inputRef.current?.click();
  };
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const url = await uploadImage(file);
      onChange?.(url);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const showThumb = value && !busy && !broken;
  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      <Hoverable onClick={pick} style={{ ...UPLOAD_BOX, cursor: busy ? "wait" : "pointer" }} hover={{ borderColor: "#A9C6EF", background: "#F1F6FD" }}>
        <span style={{ width: 42, height: 42, borderRadius: 10, background: "#fff", border: "1px solid #EAEAEE", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", flex: "none", overflow: "hidden" }}>
          {showThumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" onError={() => setBrokenUrl(value)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : busy ? (
            <span style={{ width: 16, height: 16, border: "2px solid #C7D7F2", borderTopColor: "#2E6ACF", borderRadius: "50%", animation: "wb-spin .7s linear infinite" }} />
          ) : (
            icon("image", 18)
          )}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#52525B" }}>{busy ? "Uploading…" : value ? "Replace image" : "Click to upload"}</div>
          <div style={{ fontSize: 12, color: "#A1A1AA", marginTop: 2 }}>{hint || "Upload to S3, or paste any image URL below"}</div>
        </div>
      </Hoverable>
      {/* URL input — paste any image URL or /tenant path, or edit the uploaded one. */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="https://… or /tenant/image.png"
        style={{ width: "100%", marginTop: 7, padding: "7px 9px", border: "1px solid #E4E4EA", borderRadius: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#52525B", background: "#fff", outline: "none" }}
      />
      {err && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 5 }}>{err}</p>}
    </>
  );
}

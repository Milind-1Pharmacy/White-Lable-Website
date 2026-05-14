"use client";

import { useState } from "react";
import type { AIStoreSectionData } from "@/types/config.types";

type AIStoreProps = {
  data: AIStoreSectionData;
};

export function AIStore({ data: _ }: AIStoreProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="section">
      <div className="wrap">
        <div className="split__head">
          <div>
            <span className="eyebrow">
              <span className="dot" />
              Technology · 2026
            </span>
            <h2
              className="h-display h-2"
              style={{ marginTop: 14, minHeight: 80, lineHeight: 1.1 }}
            >
              Our{" "}
              <span className="serif-it" style={{ color: "var(--accent)" }}>
                AI-driven
              </span>{" "}
              retail stores.
            </h2>
          </div>
          <p className="body" style={{ maxWidth: 380, margin: 0 }}>
            A store-assistant that knows your prescription history, your
            alternatives and your pickup time — quietly working alongside our
            pharmacists.
          </p>
        </div>
        <div className="split__grid">
          <div className="split__tile">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.urmedz.in/wp-content/uploads/2025/08/shopn.png"
              alt="UrMedz AI-driven retail store"
            />
            <span
              className="imgbox__tag"
              style={{
                background: "rgba(255,255,255,.92)",
                color: "var(--ink)",
              }}
            >
              STORE FLOOR · WHITEFIELD
            </span>
          </div>
          <div className="split__tile" style={{ background: "var(--ink)" }}>
            {!playing ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.urmedz.in/wp-content/uploads/2025/08/shopn.png"
                  alt="Store assistant preview"
                  style={{ opacity: 0.55 }}
                />
                <button
                  className="play-btn"
                  onClick={() => setPlaying(true)}
                  aria-label="Play store assistant video"
                />
                <span
                  className="imgbox__tag"
                  style={{
                    background: "rgba(0,178,122,.95)",
                    color: "var(--ink)",
                  }}
                >
                  STORE ASSISTANT · DEMO
                </span>
              </>
            ) : (
              <video
                autoPlay
                controls
                src="https://www.urmedz.in/wp-content/uploads/2025/08/Urmedz-Store-Assistant.mp4"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

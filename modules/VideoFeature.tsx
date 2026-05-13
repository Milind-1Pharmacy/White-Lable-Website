"use client";

import { useState } from "react";
import type { VideoFeatureSectionData } from "@/types/config.types";

type VideoFeatureProps = {
  data: VideoFeatureSectionData;
};

export function VideoFeature({ data }: VideoFeatureProps) {
  const [playing, setPlaying] = useState(false);
  const words = data.marquee ?? ["Authentic", "Traceable", "Compliant", "Fast", "Scalable", "Trusted"];

  return (
    <section className="section" id="fulfilment">
      <div className="wrap">
        <div className="bts">
          {!playing ? (
            <>
              {data.poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.poster} alt="Inside a UrMedz fulfilment centre" />
              )}
              <div className="bts__overlay">
                <span className="bts__tag">{data.tag ?? "Behind the scenes · Fulfilment"}</span>
                <div className="bts__bottom">
                  <h3 className="bts__headline">
                    A look at our{" "}
                    <span className="serif-it" style={{ color: "var(--accent)" }}>hi-tech</span>{" "}
                    fulfilment centres.
                  </h3>
                  {data.videoUrl && (
                    <button className="btn btn-accent" onClick={() => setPlaying(true)}>
                      <span style={{ width: 0, height: 0, borderLeft: "10px solid currentColor", borderTop: "7px solid transparent", borderBottom: "7px solid transparent", marginRight: 2 }} />
                      {data.ctaLabel ?? "Watch the tour · 3:42"}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <video
              autoPlay
              controls
              src={data.videoUrl}
              poster={data.poster}
              style={{ background: "#000" }}
            />
          )}
        </div>

        <div className="marquee" style={{ marginTop: 40, paddingTop: 28, paddingBottom: 28, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="marquee__track">
            {[0, 1].map((g) => (
              <span key={g}>
                {words.map((w, wi) => (
                  <span key={wi}>{w}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

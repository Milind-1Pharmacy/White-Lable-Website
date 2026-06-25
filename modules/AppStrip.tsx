/**
 * @file AppStrip.tsx
 * @description Renders an app-promotion strip with store download badges.
 * @responsibilities
 *  - Show app logo, heading, and descriptor text.
 *  - Render App Store and Google Play badge links.
 *  - Fall back to branding logo when no strip logo is set.
 *  - Render nothing when no content is given.
 * @dependencies next/image, RichHeading, config.types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import Image from "next/image";
import type { AppStripSectionData, Branding } from "@wl/config-types";
import { renderRichHeading } from "@/modules/RichHeading";
import { safeHref } from "@/lib/safeUrl";

type AppStripProps = {
  data: AppStripSectionData;
  branding?: Branding;
};

/**
 * AppStrip - Promotes the mobile app with store download links.
 * @props {AppStripSectionData} data - Strip content from config.
 * @props {Branding} branding - Brand assets used as fallback.
 * @returns JSX element
 */
export function AppStrip({ data, branding }: AppStripProps) {
  const logo = data.logo ?? branding?.logo;
  const heading = renderRichHeading(data.heading);
  const hasAnyContent =
    !!logo ||
    !!heading ||
    !!data.descriptor ||
    !!data.appStoreUrl ||
    !!data.googlePlayUrl;

  if (!hasAnyContent) return null;

  return (
    <section
      className="wrap"
      id="app"
      style={{
        paddingTop: 24,
        paddingBottom: 24,
        marginBottom: 12,
      }}
    >
      <div className="appstrip">
        <div className="appstrip__left">
          {logo && (
            <Image
              src={logo}
              alt=""
              width={120}
              height={120}
              className="appstrip__icon"
            />
          )}
          <div>
            {heading && <h2 className="appstrip__h">{heading}</h2>}
            {data.descriptor && (
              <p className="appstrip__body">{data.descriptor}</p>
            )}
          </div>
        </div>
        <div className="appstrip__badges">
          {data.appStoreUrl && (
            <a
              className="store-badge store-badge--apple"
              href={safeHref(data.appStoreUrl)}
              target="_blank"
              rel="noreferrer"
            >
              <svg
                viewBox="0 0 384 512"
                width="24"
                height="24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                />
              </svg>
              <span>
                <span className="store-badge__small">Download on the</span>
                <span className="store-badge__big">App Store</span>
              </span>
            </a>
          )}
          {data.googlePlayUrl && (
            <a
              className="store-badge store-badge--google"
              href={safeHref(data.googlePlayUrl)}
              target="_blank"
              rel="noreferrer"
            >
              <svg
                viewBox="0 0 512 512"
                width="24"
                height="24"
                aria-hidden="true"
              >
                <path
                  fill="#00C2A1"
                  d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z"
                />
                <path
                  fill="#FFBC00"
                  d="M104.6 13c-5 1.6-9.4 4.4-13.1 8.1L296.3 226.6l29-29L104.6 13z"
                />
                <path
                  fill="#00ACE0"
                  d="M385.4 174.2 458 216.4l-72.6 41.9-29-30 29-54.1z"
                />
                <path
                  fill="#EE2D26"
                  d="M91.5 21.1c-4.4 4.6-7 11-7 19.4v431.2c0 8.4 2.6 14.8 7 19.4l213.7-213.7-213.7-256.3z"
                />
                <path
                  fill="#00C2A1"
                  d="M296.3 286.7 91.5 491.1c5.1 5.5 13.5 6.2 22.7 1l271.2-155.4-89.1-50z"
                />
              </svg>
              <span>
                <span className="store-badge__small">Get it on</span>
                <span className="store-badge__big">Google Play</span>
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

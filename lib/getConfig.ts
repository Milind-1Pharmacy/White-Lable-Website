/**
 * @file getConfig.ts
 * @description Loads, caches, and compliance-filters tenant config files.
 * @responsibilities
 *  - Read JSON configs from the configs directory.
 *  - Resolve the active tenant via TENANT env, falling back to app_master.
 *  - Apply the compliance filter before returning configs.
 *  - List and look up tenant configs by slug for previews.
 * @dependencies react cache, node:fs, node:path, @/lib/complianceFilter
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { AppConfig, ResolvedConfig, SystemConfig } from "@/types/config.types";
import { applyCompliance } from "@/lib/complianceFilter";

const CONFIG_DIR = path.join(process.cwd(), "configs");
const RESERVED_FILES = new Set(["system.json", "app_master.json"]);

/**
 * readJson - Reads and parses a JSON file from the configs directory.
 * @param {string} filename - File name within the configs directory.
 * @returns The parsed config object.
 */
async function readJson<T>(filename: string): Promise<T> {
  const file = await fs.readFile(path.join(CONFIG_DIR, filename), "utf8");
  return JSON.parse(file) as T;
}

/**
 * getSystemConfig - Loads the shared system.json ruleset (cached).
 * @returns The system config.
 */
export const getSystemConfig = cache(async (): Promise<SystemConfig> => {
  return readJson<SystemConfig>("system.json");
});

/**
 * getAppConfig - Loads the active tenant config, or app_master as fallback.
 * @returns The raw tenant config.
 */
export const getAppConfig = cache(async (): Promise<AppConfig> => {
  const tenant = process.env.TENANT?.trim();
  if (tenant) {
    const filename = tenant.endsWith(".json") ? tenant : `${tenant}.json`;
    try {
      return await readJson<AppConfig>(filename);
    } catch {
      // fall back to app_master.json if the tenant file is missing/unreadable
    }
  }
  return readJson<AppConfig>("app_master.json");
});

/**
 * getConfig - Loads the active tenant config with compliance applied (cached).
 * @returns The resolved, compliance-safe config.
 */
export const getConfig = cache(async (): Promise<ResolvedConfig> => {
  const [system, rawApp] = await Promise.all([getSystemConfig(), getAppConfig()]);
  const app = applyCompliance(rawApp, system);
  return { app, system };
});

export type TenantSummary = {
  slug: string;
  name: string;
  category: string;
  colors: AppConfig["branding"]["colors"];
  logo?: string;
};

/**
 * listConfigs - Summarizes every tenant config file (excludes reserved files).
 * @returns An array of tenant summaries for listing or previews.
 */
export const listConfigs = cache(async (): Promise<TenantSummary[]> => {
  const entries = await fs.readdir(CONFIG_DIR);
  const summaries = await Promise.all(
    entries
      .filter((f) => f.endsWith(".json") && !RESERVED_FILES.has(f))
      .map(async (filename): Promise<TenantSummary | null> => {
        try {
          const cfg = await readJson<AppConfig>(filename);
          const slug = filename.replace(/\.json$/, "");
          return {
            slug,
            name: cfg.tenant?.name ?? slug,
            category: cfg.tenant?.category ?? "",
            colors: cfg.branding?.colors,
            logo: cfg.branding?.logo,
          };
        } catch {
          return null;
        }
      }),
  );
  return summaries.filter((s): s is TenantSummary => s !== null);
});

/**
 * getConfigBySlug - Loads a specific tenant config by slug with compliance applied.
 * @param {string} slug - Tenant slug; validated and never a reserved file.
 * @returns The resolved config, or null when missing or invalid.
 */
export const getConfigBySlug = cache(
  async (slug: string): Promise<ResolvedConfig | null> => {
    if (!/^[a-z0-9_-]+$/i.test(slug)) return null;
    if (RESERVED_FILES.has(`${slug}.json`)) return null;
    try {
      const [system, rawApp] = await Promise.all([
        getSystemConfig(),
        readJson<AppConfig>(`${slug}.json`),
      ]);
      const app = applyCompliance(rawApp, system);
      return { app, system };
    } catch {
      return null;
    }
  },
);

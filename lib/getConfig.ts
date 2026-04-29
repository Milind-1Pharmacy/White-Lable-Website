import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { AppConfig, ResolvedConfig, SystemConfig } from "@/types/config.types";
import { applyCompliance } from "@/lib/complianceFilter";

const CONFIG_DIR = path.join(process.cwd(), "configs");
const RESERVED_FILES = new Set(["system.json", "app_master.json"]);

async function readJson<T>(filename: string): Promise<T> {
  const file = await fs.readFile(path.join(CONFIG_DIR, filename), "utf8");
  return JSON.parse(file) as T;
}

export const getSystemConfig = cache(async (): Promise<SystemConfig> => {
  return readJson<SystemConfig>("system.json");
});

export const getAppConfig = cache(async (): Promise<AppConfig> => {
  return readJson<AppConfig>("app_master.json");
});

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

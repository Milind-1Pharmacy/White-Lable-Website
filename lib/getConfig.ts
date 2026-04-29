import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { AppConfig, ResolvedConfig, SystemConfig } from "@/types/config.types";
import { applyCompliance } from "@/lib/complianceFilter";

const CONFIG_DIR = path.join(process.cwd(), "configs");

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

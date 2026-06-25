/**
 * @file prune-tenant-assets.mjs
 * @description Post-build pruning for the per-tenant static export. Next copies
 *  ALL of `public/` into `out/` verbatim, so every tenant build ships EVERY
 *  tenant's image folder (public/<project>/) — ~tens of MB of foreign assets and
 *  a cross-tenant leak (tenant A's images served from tenant B's domain).
 *
 *  This deletes, from `out/`, every per-tenant asset folder that the built tenant
 *  does NOT reference. It is conservative by construction: the ONLY directories it
 *  will ever consider deleting are the per-tenant folders that exist in `public/`
 *  (minus shared dirs). Framework output (`_next`), shared CSS (`site-css`) and all
 *  route folders are never touched — they aren't in the candidate set.
 *
 *  Keep = any public/<project> folder whose path is referenced by the built
 *  config (configs/<TENANT>.json, read from the repo — same file the build used).
 *
 * Usage (in buildspec, after `next build`):
 *   node scripts/prune-tenant-assets.mjs "$TENANT"
 *
 * Safe no-ops: missing out/, missing config, or no candidates → exits 0 quietly.
 * @author WhiteLabel Platform Team
 * @created 2026-06-25
 */
import { readdirSync, readFileSync, rmSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const PUBLIC = "public";
// Shared dirs in public/ that are NOT per-tenant assets — never prune candidates.
const SHARED_PUBLIC_DIRS = new Set(["site-css"]);

const tenant = (process.argv[2] || process.env.TENANT || "").trim();

/** List the per-tenant asset folder names that exist in public/ (the prune set). */
function candidateFolders() {
  if (!existsSync(PUBLIC)) return [];
  return readdirSync(PUBLIC, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !SHARED_PUBLIC_DIRS.has(d.name))
    .map((d) => d.name);
}

/**
 * The set of asset folders the built tenant references. We read the built config
 * verbatim and scrape any "/<folder>/..." path whose first segment is one of our
 * candidate folders — so a config that points at "/urmedz/hero.png" keeps urmedz/.
 */
function referencedFolders(candidates) {
  const path = join("configs", `${tenant}.json`);
  if (!tenant || !existsSync(path)) return new Set(); // no config → keep nothing extra
  const raw = readFileSync(path, "utf8");
  const found = new Set();
  for (const name of candidates) {
    // Match ONLY a local asset path: a JSON string value that STARTS with
    // "/<name>/..." (e.g. "/urmedz/hero.png"). Crucially this must NOT match the
    // folder name appearing mid-URL — e.g. an App Store link
    // "https://apps.apple.com/in/app/urmedz/..." references the brand, not a local
    // asset, and should never pin the folder. So we anchor to a quote + leading slash.
    if (new RegExp(`"/${name}/[^"]*\\.(png|jpe?g|svg|webp|gif|avif)"`, "i").test(raw)) {
      found.add(name);
    }
  }
  return found;
}

function main() {
  if (!existsSync(OUT)) {
    console.log(`[prune] ${OUT}/ not found — nothing to prune.`);
    return;
  }
  const candidates = candidateFolders();
  if (!candidates.length) {
    console.log("[prune] no per-tenant asset folders in public/ — nothing to prune.");
    return;
  }
  const keep = referencedFolders(candidates);
  // Always keep the folder named exactly after the tenant slug, if present — a
  // belt-and-suspenders for configs that build asset paths dynamically.
  if (tenant && candidates.includes(tenant)) keep.add(tenant);

  let removed = 0;
  for (const name of candidates) {
    const dir = join(OUT, name);
    if (keep.has(name)) continue;
    if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
    rmSync(dir, { recursive: true, force: true });
    console.log(`[prune] removed foreign tenant assets: out/${name}/`);
    removed++;
  }
  console.log(
    `[prune] tenant="${tenant || "(none)"}" kept=[${[...keep].join(", ") || "—"}] removed=${removed}`
  );
}

main();

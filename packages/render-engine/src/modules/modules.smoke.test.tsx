/**
 * @file modules.smoke.test.tsx
 * @description Enforces the core "render with partial/missing config" invariant:
 *  each section module must render WITHOUT throwing when handed an empty/partial
 *  data slice (it should return null or a benign fragment, never crash the page).
 *  This is the automated guard for the bug class fixed in Hero (unguarded cta).
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

import { About } from "./About";
import { Services } from "./Services";
import { Features } from "./Features";
import { Gallery } from "./Gallery";
import { AIStore } from "./AIStore";
import { Team } from "./Team";
import { Stats } from "./Stats";
import { Categories } from "./Categories";
import { Faq } from "./Faq";
import { HowItWorks } from "./HowItWorks";

/** Render and assert no throw. */
function rendersSafely(el: ReactElement) {
  expect(() => render(el)).not.toThrow();
}

describe("modules render safely with empty/partial config", () => {
  // Each is passed an empty object cast to its prop type — the module must guard
  // its array/object access and bail to null rather than throw.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const empty = {} as any;

  it("About", () => rendersSafely(<About data={empty} />));
  it("Services", () => rendersSafely(<Services data={empty} />));
  it("Features", () => rendersSafely(<Features data={empty} />));
  it("Gallery", () => rendersSafely(<Gallery data={empty} />));
  it("AIStore", () => rendersSafely(<AIStore data={empty} />));
  it("Team", () => rendersSafely(<Team data={empty} />));
  it("Stats", () => rendersSafely(<Stats data={empty} />));
  it("Categories", () => rendersSafely(<Categories data={empty} />));
  it("Faq", () => rendersSafely(<Faq data={empty} />));
  it("HowItWorks", () => rendersSafely(<HowItWorks data={empty} />));
});

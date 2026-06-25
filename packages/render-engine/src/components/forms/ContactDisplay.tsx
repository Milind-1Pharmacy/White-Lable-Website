/**
 * @file ContactDisplay.tsx
 * @description Read-only contact card with email, phone, and address.
 * @responsibilities
 *  - Build display items from available contact fields.
 *  - Link email (mailto) and phone (tel); show address as text.
 *  - Render nothing when no contact details exist.
 * @dependencies Card/CardContent UI, Contact config type
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { Card, CardContent } from "@wl/render-engine/components/ui/card";
import type { Contact } from "@wl/config-types";

type ContactDisplayProps = {
  contact: Contact;
};

/**
 * ContactDisplay - Shows tenant email, phone, and address in a card grid.
 * @props {Contact} contact - Tenant contact details from config
 * @returns JSX element
 */
// Note: non-transactional display only; no order/checkout flows.
export function ContactDisplay({ contact }: ContactDisplayProps) {
  const items: Array<{ label: string; value: string; href?: string }> = [];

  if (contact.email) {
    items.push({
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
    });
  }
  if (contact.phone) {
    items.push({
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, "")}`,
    });
  }
  if (contact.address) {
    items.push({ label: "Address", value: contact.address });
  }

  if (items.length === 0) return null;

  return (
    <Card className="border-black/5 bg-white/60">
      <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--brand-primary)]">
              {item.label}
            </p>
            {item.href ? (
              <a
                href={item.href}
                className="text-base text-[var(--brand-text)] underline-offset-4 hover:underline"
              >
                {item.value}
              </a>
            ) : (
              <p className="text-base text-[var(--brand-text)]">{item.value}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

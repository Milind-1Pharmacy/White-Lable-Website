import { Card, CardContent } from "@/components/ui/card";
import type { Contact } from "@/types/config.types";

type ContactDisplayProps = {
  contact: Contact;
};

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

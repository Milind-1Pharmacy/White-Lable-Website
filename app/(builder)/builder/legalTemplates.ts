/**
 * @file legalTemplates.ts
 * @description Pre-fill generators for the builder's Legal step. Each function
 *  returns a complete, ready-to-publish `LegalPage` (intro + titled sections) of
 *  generic-but-real prose, with the tenant's name and contact interpolated. The
 *  owner can edit every paragraph; these are sensible compliant defaults, not
 *  legal advice.
 * @compliance The wording is written to satisfy, at once, the privacy/terms
 *  expectations of: Meta (Business / Horizon app review), Google Play (User Data
 *  policy + Data safety), Apple (App Review Guideline 5.1.1 + account deletion),
 *  and Indian law (IT Act 2000 + DPDP Act 2023, incl. grievance officer +
 *  deletion request path). Sites are NON-TRANSACTIONAL business profiles.
 * @responsibilities
 *  - legalInfoFromConfig(config) — pull {tenantName,email,phone,address,site} out.
 *  - privacyPolicyTemplate / termsTemplate / disclaimerTemplate /
 *    dataDeletionTemplate — build a LegalPage each.
 * @dependencies @/types/config.types (LegalPage / LegalSection)
 * @author WhiteLabel Platform Team
 * @created 2026-06-24
 */
import type { AppConfig, LegalPage, LegalSection } from "@/types/config.types";

/** The minimal business facts the templates interpolate into the boilerplate. */
export type LegalInfo = {
  /** Business / brand name — appears throughout ("…operated by <name>"). */
  tenantName: string;
  /** Support + privacy contact email (also the deletion / grievance address). */
  email: string;
  /** Support phone. */
  phone: string;
  /** Registered / head-office address (grievance officer correspondence address). */
  address: string;
};

/** Pull the LegalInfo struct out of the draft config, with safe fallbacks. */
export function legalInfoFromConfig(config: AppConfig): LegalInfo {
  return {
    tenantName: config.tenant?.name?.trim() || "this business",
    email: config.contact?.email?.trim() || "support@example.com",
    phone: config.contact?.phone?.trim() || "",
    address: config.contact?.address?.trim() || "",
  };
}

/** A "How to reach us" line that gracefully drops blank phone/address. */
function contactLine(i: LegalInfo): string {
  const bits = [`email us at ${i.email}`];
  if (i.phone) bits.push(`call ${i.phone}`);
  if (i.address) bits.push(`write to us at ${i.address}`);
  return bits.join(", or ");
}

/**
 * privacyPolicyTemplate — the public Privacy Policy.
 * Required by all four standards. Covers identity, what data is collected, why,
 * who it is shared with, cookies/analytics, security, retention, the user's
 * rights INCLUDING a concrete data-deletion path, children, and changes +
 * grievance contact (DPDP Act 2023).
 */
export function privacyPolicyTemplate(i: LegalInfo): LegalPage {
  const sections: LegalSection[] = [
    {
      // Identifies who runs the site and how to reach them — the opening
      // "who we are" paragraph reviewers look for first.
      heading: "Who we are",
      body: [
        `This Privacy Policy explains how ${i.tenantName} ("we", "us", or "our") handles information about visitors to this website and the people who contact us through it. For any question about this policy or your information, you can ${contactLine(i)}.`,
      ],
    },
    {
      // Lists the data categories collected — maps to Google Play "data collected"
      // and Meta/Apple "what data the app collects".
      heading: "Information we collect",
      body: [
        "We keep data collection to the minimum needed to respond to you and to run this site. Depending on how you use it, we may collect:",
        {
          type: "list",
          items: [
            "Details you give us directly — such as your name, email address, phone number, and the contents of any enquiry or message you send.",
            "Basic technical information your browser shares automatically — such as your device type, browser, approximate location, and IP address.",
            "Anonymous usage and analytics data about which pages are viewed, to help us improve the site.",
          ],
        },
      ],
    },
    {
      // States WHY data is processed — Google Play/Meta both require stated purposes.
      heading: "How we use your information",
      body: [
        "We use the information above only to:",
        {
          type: "list",
          items: [
            "Respond to your enquiries and provide the support you ask for.",
            "Operate, maintain, and improve this website.",
            "Keep the site secure and prevent misuse or fraud.",
            "Meet our legal and regulatory obligations.",
          ],
        },
        "This is a business-profile website. We do not sell products or take payments here, and we do not use your information for automated decision-making.",
      ],
    },
    {
      // Discloses third-party sharing + the "equal protection" promise Apple wants.
      heading: "How we share information",
      body: [
        "We do not sell your personal information. We share it only with trusted service providers who help us run the site (for example, website hosting and analytics), and only to the extent they need it to perform that service. Where we share data, we require those providers to protect it to a standard at least equal to this policy. We may also disclose information where the law requires it.",
      ],
    },
    {
      // Cookie / analytics notice — required where any tracker loads (Meta + EU/GDPR-adjacent).
      heading: "Cookies and analytics",
      body: [
        "We may use cookies and similar technologies to make the site work and to understand how it is used. You can control or clear cookies through your browser settings; turning some off may affect how parts of the site behave.",
      ],
    },
    {
      // Security-practices disclosure (Google Play "secure data handling").
      heading: "How we keep information safe",
      body: [
        "We apply reasonable technical and organisational measures to protect your information against unauthorised access, loss, or misuse. No method of transmission or storage is completely secure, but we work to safeguard your data and to limit who can access it.",
      ],
    },
    {
      // Retention statement — required by Google Play + Apple.
      heading: "How long we keep information",
      body: [
        "We keep your information only for as long as needed to answer your enquiry, to run the site, or to meet a legal obligation. When it is no longer needed, we delete it or anonymise it.",
      ],
    },
    {
      // User rights + the concrete DELETION path — a hard requirement for all four
      // standards (Meta self-service/email path, Play & Apple deletion, DPDP rights).
      heading: "Your rights and how to delete your data",
      body: [
        "You can ask us to access, correct, or delete the personal information we hold about you, and you can withdraw your consent at any time. To make any of these requests — including a request to delete your data — please email us at " +
          i.email +
          ". We will respond within a reasonable time and within any period the law requires.",
      ],
    },
    {
      // Children's-data statement (Play Families / general minors protection).
      heading: "Children's privacy",
      body: [
        "This website is intended for a general adult audience and is not directed at children. We do not knowingly collect personal information from children. If you believe a child has provided us information, contact us and we will remove it.",
      ],
    },
    {
      // Changes + the DPDP-mandated grievance/contact officer details.
      heading: "Changes and how to contact us",
      body: [
        `We may update this policy from time to time; the latest version will always be available on this page. If you have a question, a concern, or a grievance about how your information is handled, you can ${contactLine(i)}. We take every complaint seriously and will work to resolve it.`,
      ],
    },
  ];

  return {
    eyebrow: "Legal",
    heading: "Privacy Policy",
    intro: `Your privacy matters to ${i.tenantName}. This page explains, in plain language, what information we collect, why we collect it, and the choices you have — including how to ask us to delete your data.`,
    sections,
  };
}

/**
 * termsTemplate — the public Terms & Conditions / Terms of Use.
 * Covers acceptance, eligibility, permitted + prohibited use, a NON-TRANSACTIONAL
 * notice (these sites don't sell), intellectual property, third-party links, a
 * warranty disclaimer, a limitation of liability, governing law (India), and
 * changes + contact.
 */
export function termsTemplate(i: LegalInfo): LegalPage {
  const sections: LegalSection[] = [
    {
      // Acceptance — using the site = agreeing to the terms.
      heading: "Acceptance of these terms",
      body: [
        `These Terms & Conditions govern your use of this website operated by ${i.tenantName}. By accessing or using the site, you agree to these terms. If you do not agree, please do not use the site.`,
      ],
    },
    {
      // Eligibility / age gate.
      heading: "Who may use this site",
      body: [
        "You may use this site if you are able to form a binding agreement under applicable law. If you are using it on behalf of an organisation, you confirm you are authorised to do so.",
      ],
    },
    {
      // Acceptable + prohibited use — the conduct rules reviewers expect.
      heading: "Acceptable use",
      body: [
        "You agree to use the site lawfully and respectfully. You must not:",
        {
          type: "list",
          items: [
            "Use the site for any unlawful, harmful, or fraudulent purpose.",
            "Attempt to gain unauthorised access to the site or its systems.",
            "Copy, scrape, or harvest content or data without permission.",
            "Upload malware or interfere with the site's normal operation.",
            "Post or send abusive, misleading, or infringing content.",
          ],
        },
      ],
    },
    {
      // The non-transactional notice — core to the business-profile compliance model.
      heading: "An information-only website",
      body: [
        "This is a business-profile website. It provides information about us and a way to get in touch. No purchases, orders, or payments are completed on this site. Any enquiry you send is for support and information only.",
      ],
    },
    {
      // Intellectual property.
      heading: "Intellectual property",
      body: [
        `All content on this site — including text, logos, graphics, and design — belongs to ${i.tenantName} or its licensors and is protected by law. You may view the content for your personal, non-commercial use, but you may not reproduce or reuse it without our written permission.`,
      ],
    },
    {
      // Third-party links disclaimer.
      heading: "Links to other sites",
      body: [
        "The site may link to third-party websites or apps that we do not control. We are not responsible for their content, products, or privacy practices. Visiting them is at your own risk and subject to their terms.",
      ],
    },
    {
      // Warranty disclaimer.
      heading: "No warranties",
      body: [
        'The site and its content are provided "as is" and "as available". While we try to keep information accurate and up to date, we make no warranties that it is complete, current, or error-free, and we may change or remove content at any time.',
      ],
    },
    {
      // Limitation of liability.
      heading: "Limitation of liability",
      body: [
        `To the fullest extent permitted by law, ${i.tenantName} will not be liable for any indirect or consequential loss arising from your use of, or inability to use, this site. Nothing in these terms limits any liability that cannot be limited under applicable law.`,
      ],
    },
    {
      // Governing law — India (IT Act 2000 framework).
      heading: "Governing law",
      body: [
        "These terms are governed by the laws of India, and any dispute relating to them or to the site will be subject to the jurisdiction of the competent courts in India.",
      ],
    },
    {
      // Changes + contact.
      heading: "Changes and contact",
      body: [
        `We may update these terms from time to time; the current version will always be on this page. If you have any question about them, you can ${contactLine(i)}.`,
      ],
    },
  ];

  return {
    eyebrow: "Legal",
    heading: "Terms & Conditions",
    intro: `Please read these terms carefully before using this website operated by ${i.tenantName}. Using the site means you accept them.`,
    sections,
  };
}

/**
 * disclaimerTemplate — a short legal disclaimer page. Folds in the tenant's own
 * footer `compliance.disclaimer` line when one is set, then adds the standard
 * business-profile / enquiry-only clarifications.
 */
export function disclaimerTemplate(i: LegalInfo, complianceLine?: string): LegalPage {
  const sections: LegalSection[] = [
    {
      // General information disclaimer.
      heading: "General information only",
      body: [
        `The information on this website is provided by ${i.tenantName} for general informational purposes only. While we aim to keep it accurate and current, we make no representation that it is complete or error-free, and you rely on it at your own discretion.`,
      ],
    },
    {
      // Non-transactional / enquiry-only clarification (mirrors compliance invariants).
      heading: "Not a transactional service",
      body: [
        "This is a business-profile website. It does not process orders or payments. Any contact option, including chat or messaging, is for support and enquiries only — not for placing orders.",
      ],
    },
  ];

  // If the tenant supplied a footer disclaimer line, surface it verbatim first.
  const intro = complianceLine?.trim()
    ? complianceLine.trim()
    : `This page sets out important information about how you should treat the content on ${i.tenantName}'s website.`;

  return { eyebrow: "Legal", heading: "Disclaimer", intro, sections };
}

/**
 * dataDeletionTemplate — the public "how to delete your account / data" page.
 * Required by Meta, Google Play, and Apple whenever a linked app lets people
 * create accounts; the route renders at /deactivate-account.
 */
export function dataDeletionTemplate(i: LegalInfo): LegalPage {
  const sections: LegalSection[] = [
    {
      // States the right + the exact channel to request deletion.
      heading: "How to request deletion",
      body: [
        `You can ask ${i.tenantName} to delete your account and the personal data associated with it at any time. To make a request, email us at ${i.email} from the address linked to your account, with the subject "Delete my data". If we need to verify your identity before acting, we will tell you what is required.`,
      ],
    },
    {
      // Tells the user what gets removed and what may be retained, and the timeline.
      heading: "What happens next",
      body: [
        "Once your request is verified, we will delete or anonymise the personal data we hold about you, except anything we are required to keep by law (for example, records we must retain for legal or accounting reasons). We will confirm once your request has been completed, within the timeframe required by applicable law.",
      ],
    },
  ];

  return {
    eyebrow: "Legal",
    heading: "Data Deletion",
    intro: `You are in control of your data. This page explains how to ask ${i.tenantName} to delete your account and the information connected to it.`,
    sections,
  };
}

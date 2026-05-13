# UrMedz Design Handoff

Complete design specification and component inventory for the UrMedz pharmacy landing page.

---

## Brand Guidelines

### Colors

**Primary Palette:**
- **Ink (Deep Navy)**: `#0A174C` — Headlines, primary text, dark backgrounds
- **Cream (Off-white)**: `#F4EFE6` — Light backgrounds, light text on dark
- **White**: `#FFFFFF` — Cards, modals, contrast elements
- **Accent (Teal)**: `#1FAFA6` — Interactive elements, highlights, CTAs (customizable via props)

**Secondary Accent Colors** (for pillar cards, stats, etc.):
- Yellow: `#F5A623`
- Purple: `#6B3FA0`
- Pink: `#E5326C`
- Teal (accent): `#1FAFA6`

**Neutrals:**
- Muted text: `#999999`
- Subtle borders: `#E5E1D8`
- Line (darker): `#CCCCCC`

### Typography

**Font Stack:**
```css
--font-sans: "Sohne", -apple-system, system-ui, sans-serif;
--font-display: "Fraunces", serif;  /* For italic/serif accents */
--font-mono: "IBM Plex Mono", monospace;  /* For labels, codes */
```

**Weights Used:**
- Regular: 400
- Medium: 500
- Bold: 600

**Scale (clamp-based, responsive):**
- **Display XL**: `clamp(40px, 6vw, 84px)` — Hero headlines
- **Display L**: `clamp(32px, 5vw, 72px)` — Section titles
- **Display M**: `clamp(24px, 3vw, 48px)` — Subsections
- **Body L**: `clamp(16px, 1.3vw, 19px)` — Large body text
- **Body**: `15px–17px` — Standard paragraph
- **Body S**: `13px–14px` — Secondary text
- **Label**: `10px–12px` — Captions, mono labels

### Spacing & Layout

**Gutter (container padding):**
```css
--gutter: clamp(16px, 5vw, 48px);
```
Used on all sections to create responsive margins.

**Grid & Gap:**
- Columns: CSS Grid, usually 2–4 columns on desktop, 1 on mobile
- Gap: `clamp(16px, 3vw, 56px)` for most grids
- Section vertical spacing: `clamp(48px, 8vw, 120px)`

**Border Radius:**
- Cards: `22px–24px`
- Buttons: `12px–14px`
- Large sections: `28px`

**Box Shadows:**
- Subtle: `0 2px 10px rgba(0,0,0,.06)`
- Medium: `0 12px 40px rgba(0,0,0,.12)`
- Strong: `0 30px 80px rgba(0,0,0,.45)`

---

## Component Inventory

All components accept an `accent` prop (hex string, e.g., `#1FAFA6`).

### 1. Nav (Navigation Bar)
**File:** `components/Nav.jsx`

**Props:**
- `accent` (string): Brand accent color
- `isOverDark` (boolean): If true, logo inverts to white on dark backgrounds

**Behavior:**
- Fixed to top, sticky on scroll
- Shows full "UrMedz Retail Pvt. Ltd." lockup when not scrolled
- Swaps to icon-only mark after 60px scroll
- Links: About, Services, Fulfillment, Team, FAQ, Contact
- Right side: "Get the app" link + "Order now" CTA button

**Data Needs:**
- Logo full: `assets/urmedz-logo-full.png`
- Logo icon: `assets/urmedz-icon.png`

---

### 2. AppStrip (App Download CTA)
**File:** `components/Nav.jsx` (exported as `AppStrip`)

**Props:**
- `accent` (string): Brand accent color

**Content:**
- Icon + headline: "Download the *UrMedz* app"
- Descriptor: "Authentic medicines · licensed pharmacists · doorstep delivery"
- Two badges: Apple App Store + Google Play
- Links to actual app stores (pre-configured)

**Styling:**
- Dark navy background (`var(--ink)`)
- Subtle radial gradient overlay
- Minimal, clean two-column layout (stacks on mobile)

---

### 3. Hero Sections (3 variants)
**File:** `components/Nav.jsx`

**HeroEditorial** — Text-heavy, image carousel on right
- Big headline + lede + CTA buttons
- Rotating carousel: 5.5s per slide
- Manual dots + arrows to navigate
- Stats tiles below (25+ stores, 10k/day orders)

**HeroFullBleed** — Full-screen image with overlay headline
- Carousel at 100vh height
- Dark overlay gradient
- Text centered
- Dots at bottom right

**HeroGrid** — Asymmetric grid, image on right, copy + stat cards on left
- Headline + two mini stat cards (Retail · Daily orders)
- Image carousel
- Most editorial feel

**Choose one** based on your design preference.

**Data Needs:**
- 3–4 hero images: `https://www.urmedz.in/wp-content/uploads/[slides]`
- Tags for each slide (optional)

---

### 4. About (Manifesto + Pillars)
**File:** `components/Sections.jsx`

**Props:**
- `accent` (string): Brand accent color

**Content:**
- Centered eyebrow: "About UrMedz · Est. 2024 · Bengaluru"
- Big headline: "Medicines are *indispensable.* *Access* and *affordability* change everything."
- Lede paragraph

**Three Pillar Cards:**
1. "50,000 sft fulfilment" — Yellow (`#F5A623`)
2. "Affordable alternatives" — Teal (`#1FAFA6`)
3. "Pharmacist-reviewed" — Pink (`#E5326C`)

Each pillar has:
- Colored number badge (01, 02, 03)
- Meta tag (location, stat, credential count)
- Title + description
- Hover effect (lift + glow)

**Styling:**
- Three-column grid, stacks to 1-column on mobile
- Clean white cards with subtle borders
- Colored top badges (no overlapping stripes)

---

### 5. Savings (Price Comparison Ledger)
**File:** `components/Sections.jsx`

**Props:**
- `accent` (string): Brand accent color

**Content:**
- Eyebrow: "Customer savings · Q1 2026"
- Headline: "Unraveling the magic of *brand options* in medicines."
- Receipt-style ledger with 4 medicine rows:
  - Category + name (left)
  - Branded price (struck-through)
  - % saved badge (brand-colored)
  - UrMedz price (bold)
  - Animated progress bar below each row

**Data Structure:**
```javascript
{
  name: "Diabetes Tablets",
  cat: "Cat. 01 · Metformin 500mg",
  brand: 1240,          // ₹1240
  urmedz: 670,          // ₹670
  pct: 46,              // 46% saved
  color: "#F5A623"      // Bar color
}
```

**Below ledger:**
- Wide video tile (21:9 aspect ratio)
- Poster image + "Watch the demo" CTA on hover
- Inline video player on click

**Video URLs:**
- Poster: `https://www.urmedz.in/wp-content/uploads/2024/12/img.jpg`
- Video: `https://www.urmedz.in/wp-content/uploads/2024/11/ur_medz_video-3.mp4`

---

### 6. ServicesIconRow (Service Cards)
**File:** `components/Sections.jsx`

**Props:**
- `accent` (string): Brand accent color

**Content:**
Four service cards (4-column grid, 2-column on tablet, 1 on mobile):

1. **Retail Stores**
   - Icon: `assets/icons/retail.svg` (or placeholder)
   - "A network of 25 stores and counting — neighbourhood pharmacies stocked with authentic medicines."

2. **Quick Commerce**
   - "India's largest network of dark stores in pharma — same-day and on-demand delivery."

3. **Hi-Tech Fulfilment**
   - "India's most advanced fulfilment centres in pharmaceutical distribution."

4. **E-commerce Fulfilment**
   - "India's largest pharmaceutical fulfilment partner in e-commerce."

**Styling:**
- White cards, subtle borders
- Hover: lift + border accent color

---

### 7. Stats (Big Numbers)
**File:** `components/Sections.jsx`

**Props:**
- `accent` (string): Brand accent color

**Content:**
Eyebrow: "By the numbers"

Four stats in a grid:
```javascript
{
  value: "25",
  suffix: "+",
  label: "Retail stores",
  footnote: "across South India, as of Q2 2026"
}
// ... 3 more
```

Typical stats:
- 25+ retail stores
- 10,000+ orders fulfilled daily
- 80,000 SKUs catalogued
- 2 fulfilment centres

**Styling:**
- Number animates on scroll (counter effect)
- Suffix/label vary per stat
- Four-column grid, responsive

---

### 8. VideoFeature (Behind-the-Scenes)
**File:** `components/MediaSections.jsx`

**Props:**
- `accent` (string): Brand accent color

**Content:**
- Tag: "Behind the scenes"
- Headline: "A look at our hi-tech fulfilment centres"
- CTA: "Watch Now" button
- Poster image + video player
- Marquee text below: "Authentic · Traceable · Compliant · Fast · Scalable · Trusted"

**Media:**
- Poster: `https://www.urmedz.in/wp-content/uploads/2024/11/video.jpg`
- Video: `https://www.urmedz.in/wp-content/uploads/2024/11/new-ur_medz_video-4.mp4`

---

### 9. Gallery (Image Grid)
**File:** `components/MediaSections.jsx`

**Props:**
- `accent` (string): Brand accent color

**Content:**
Eyebrow: "Inside UrMedz"
Headline: "From the store to the fulfilment floor"

Five images in a grid (2–3 per row):
```javascript
{
  src: "/urmedz/gallery/store.jpg",
  alt: "Inside a UrMedz retail store with organised shelves",
  caption: "Retail stores"
}
```

Captions:
1. Retail stores
2. Dispensing counter
3. Authentic stock
4. Fulfilment centre
5. Licensed pharmacists

**Image URLs:** Use your own or request from UrMedz content team.

---

### 10. TeamShowcase (Team Intro)
**File:** `components/MediaSections.jsx`

**Props:**
- `accent` (string): Brand accent color

**Content:**
- Eyebrow: "Our Team of Specialists"
- Title: "Proud to be powered by a dedicated team"
- Description: Multi-line paragraph about doctors, pharmacists, etc.
- Central pull-quote: "United by a single purpose — to make healthcare accessible, affordable, and trustworthy for everyone."
- Central icon: `assets/urmedz-icon.png`
- Four team images (arranged in corners or grid)

**Team Images:**
- Four placeholder images representing different roles
- Use real team photos if available

---

### 11. Why (Features/Value Prop)
**File:** `components/EndSections.jsx`

**Props:**
- `accent` (string): Brand accent color

**Content:**
Headline: "Why UrMedz"

Four feature cards:
1. **Authenticity at the source**
   - "Every medicine on our shelves is sourced from licensed distributors and traceable to its manufacturer — no grey-market shortcuts."

2. **Scale where it matters**
   - "A retail-plus-fulfilment footprint means the medicine you need is rarely more than a few kilometres away."

3. **Infrastructure built for compliance**
   - "Cold-chain handling, batch traceability and audit-ready dispatch — built into every store and centre."

4. **An AI-assisted platform**
   - "Our SaaS platform helps partner pharmacies forecast demand, manage inventory and stay compliant — quietly, in the background."

**Styling:**
- Simple text + icon cards
- Left-aligned titles
- Subtle hover effects

---

### 12. HowItWorks (Process Steps)
**File:** `components/EndSections.jsx`

**Props:**
- `accent` (string): Brand accent color

**Content:**
Headline: "How it works"

Three steps:
```javascript
{
  step: 1,
  title: "Browse or upload your prescription",
  description: "Search our catalogue or upload a doctor's prescription — we'll match it to authentic, in-stock medicines."
}
```

All three:
1. Browse or upload
2. Licensed pharmacist reviews
3. Delivered or ready for pickup

**Styling:**
- Numbered cards with accent color number
- Left-to-right flow on desktop
- Stack vertically on mobile

---

### 13. FAQ (Accordion)
**File:** `components/EndSections.jsx`

**Props:**
- `accent` (string): Brand accent color

**Content:**
Headline: "Frequently asked"

Five Q&A pairs:
1. "Where do you source your medicines from?" → Full answer
2. "How do you handle prescriptions?" → Full answer
3. "Which areas do you deliver to?" → Full answer
4. "What is your return policy?" → Full answer
5. "How can I get in touch?" → Full answer

**Behavior:**
- Click to expand/collapse
- Smooth animation
- Only one item open at a time (optional)

**Data from config:**
```javascript
{
  question: "...",
  answer: "..."
}
```

---

### 14. Footer
**Not included in component export.** Build separately with:
- Logo
- Links (About, Services, Fulfillment, Team, FAQ, Contact)
- Contact info (email, phone, address)
- Social links (optional)
- Copyright

---

## Data Sources & URLs

### Images

**Hero carousel:**
- Slide 1: `https://www.urmedz.in/wp-content/uploads/2024/12/banners_final-03-1jpg.jpg`
- Slide 2: `https://www.urmedz.in/wp-content/uploads/2024/10/banners-new.jpg`
- Slide 3: `https://www.urmedz.in/wp-content/uploads/2024/10/bnr2-2.jpg`

**Videos:**
- Savings demo poster: `https://www.urmedz.in/wp-content/uploads/2024/12/img.jpg`
- Savings demo video: `https://www.urmedz.in/wp-content/uploads/2024/11/ur_medz_video-3.mp4`
- Behind-the-scenes poster: `https://www.urmedz.in/wp-content/uploads/2024/11/video.jpg`
- Behind-the-scenes video: `https://www.urmedz.in/wp-content/uploads/2024/11/new-ur_medz_video-4.mp4`

**Assets to create:**
- `assets/urmedz-icon.png` — 38×38px square mark
- `assets/urmedz-logo-full.png` — "UrMedz Retail Pvt. Ltd." full lockup
- `assets/icons/` — Service icons (or use placeholders)
- `assets/gallery/` — 5 gallery images

### Contact Info
```
Email: care@urmedz.example
Phone: +91 80 4567 0049
Address: Cheemasandra, Whitefield, Bengaluru 560049
```

### App Links
```
App Store: https://apps.apple.com/in/app/urmedz/id6753715891
Google Play: https://play.google.com/store/apps/details?id=com.urmedzB2C
```

---

## Responsive Breakpoints

**Desktop:** 1440px+ (primary design target)
**Tablet:** 768px–1199px
**Mobile:** 320px–767px

All components use `clamp()` for fluid scaling. No hardcoded breakpoints needed.

---

## Implementation Checklist

- [ ] Install components in `src/components/urmedz/`
- [ ] Install CSS in `src/styles/styles.css`
- [ ] Copy assets to `public/assets/`
- [ ] Wire up nav links (About → #about, etc.)
- [ ] Replace placeholder image URLs with real ones
- [ ] Customize brand colors in CSS variables (optional)
- [ ] Test on mobile/tablet/desktop
- [ ] Set up analytics (Google Tag Manager, etc.)
- [ ] Add footer with legal/contact
- [ ] Deploy to production
- [ ] Test app store links

---

## Optional Enhancements

- **Tweaks Panel** — Enable live accent color picker via `<TweaksPanel>`
- **Form submission** — Add backend for contact form / waitlist
- **Localization** — Translate content to multiple languages
- **Dark mode** — Add CSS media query for prefers-color-scheme
- **Performance** — Image optimization, lazy loading, code splitting

---

## Contact & Support

For questions about components or design decisions, refer to the README in `urmedz-export/`.

Last updated: May 13, 2026

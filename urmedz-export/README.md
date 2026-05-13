# UrMedz Component Export

A polished, production-ready set of React components for a pharmacy/health-tech landing page.

## Quick Start

1. **Copy files into your React project:**
   - `components/` → `src/components/urmedz/`
   - `styles/styles.css` → `src/styles/`
   - `assets/` → `public/assets/` (logos, icons)

2. **Import and use:**
   ```jsx
   import { Nav, AppStrip, About, Savings } from './components/urmedz/index.js';
   import './styles/styles.css';

   export default function Page() {
     const accent = '#1FAFA6'; // your brand color
     return (
       <>
         <Nav accent={accent} isOverDark={true} />
         <AppStrip accent={accent} />
         <About accent={accent} />
         <Savings accent={accent} />
         {/* ... other sections */}
       </>
     );
   }
   ```

3. **Install fonts (optional):**
   Add to `index.html` or CSS:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&display=swap" rel="stylesheet">
   ```

## Components

All components accept an `accent` prop (string, hex color).

**Navigation & Download:**
- `Nav` — Sticky nav with logo swap
- `AppStrip` — App download CTA with store badges

**Main Sections:**
- `About` — Manifesto + pillar cards
- `Savings` — Price comparison ledger
- `ServicesIconRow` — Service cards
- `Stats` — Big statistics
- `Features` — Feature grid
- `HowItWorks` — Process steps
- `Gallery` — Image grid
- `VideoFeature` — Video + text
- `TeamShowcase` — Team intro
- `Why` — Value proposition
- `FAQ` — Accordion Q&A

## CSS Variables

Override in your stylesheet:

```css
:root {
  --ink: #0A174C;           /* Deep navy primary */
  --cream: #F4EFE6;         /* Off-white */
  --accent: #1FAFA6;        /* Brand color (customize) */
  
  --font-sans: "Sohne", system-ui, sans-serif;
  --font-display: "Fraunces", serif;
  --font-mono: "IBM Plex Mono", monospace;
}
```

## Optional: Tweaks Panel

For live design tweaks (accent color picker, etc.):

```jsx
import { useTweaks, TweaksPanel, TweakColor } from './components/urmedz/TweaksPanel';

function App() {
  const [t, setTweak] = useTweaks({ accent: '#1FAFA6' });
  return (
    <>
      <Nav accent={t.accent} />
      <AppStrip accent={t.accent} />
      <TweaksPanel>
        <TweakColor label="Accent" value={t.accent} 
          options={['#1FAFA6', '#F5A623', '#E5326C']} 
          onChange={(v) => setTweak('accent', v)} />
      </TweaksPanel>
    </>
  );
}
```

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+. Uses modern CSS (grid, gap, clamp, backdrop-filter).

## Files Included

- `components/Nav.jsx` — Navigation + AppStrip
- `components/Sections.jsx` — About, Savings, Services, Stats, Features, etc.
- `components/MediaSections.jsx` — VideoFeature, TeamShowcase, Gallery
- `components/EndSections.jsx` — Why, HowItWorks, FAQ
- `components/TweaksPanel.jsx` — Live design controls
- `components/index.js` — Export all
- `styles/styles.css` — All styling
- `README.md` — This file

Enjoy building!

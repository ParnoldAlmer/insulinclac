# 💉 Insulin Pen Prescription Calculator

A mobile-first PWA that helps clinicians calculate insulin pen prescriptions — from weight-based dosing to a copy-paste-ready Rx sig — in seconds.

---

## Features

### Pen Selection & Auto-Fill
Pick from 12 brand-name pens across three categories and the calculator pre-fills concentration, volume, dose frequency, and priming loss automatically.

| Category | Pens |
|---|---|
| **Long-Acting (Basal)** | Lantus, Toujeo, Levemir, Tresiba, Tresiba U-200, Basaglar |
| **Rapid-Acting** | Humalog, Humalog U-200, Novolog, Admelog, Apidra |
| **Ultra-Rapid** | Fiasp |

### Weight-Based Dosing
Enter the patient's weight (kg or lbs) and slide between **0.1 / 0.2 / 0.3 u/kg/day** to auto-calculate a starting basal dose. The slider appears only when a basal insulin is selected.

### Prescription Output
Every calculation generates:

- **Total units needed** (including optional priming loss)
- **Total mL** and **pens to order**
- **Copy-ready prescription sig** with NDC code
- **Breakdown note** showing baseline units, priming waste, and pen count

### Safety Checks
- Max single-injection limits per pen device (warns when dose exceeds deliverable amount)
- Bounds checking on total units (warning >3,000 / error >10,000) and pen count (warning >20 / error >50)
- Weight-unit conversion with confirmation to prevent kg/lbs mix-ups
- Real-time field validation with color-coded feedback
- Pen expiration awareness for long day-supply prescriptions

### Cost & Affordability
- Links to **$35/month programs** (Lilly, Sanofi, Novo Nordisk, Medicare Part D)
- **GoodRx**, **SingleCare**, and **Amazon Pharmacy** coupon links shown inline per pen
- Expandable summary of all manufacturer savings programs

### Clinical Guidance
Context-aware notes for Lantus ↔ Toujeo switching when daily dose ≥ 60 units.

---

## Quick Start

### Install as a PWA (recommended)
1. Open the app URL in your mobile browser.
2. **iOS** — tap **Share → Add to Home Screen**.
3. **Android** — tap the install banner or **⋮ → Install app**.

### Run locally
```bash
git clone https://github.com/ParnoldAlmer/insulinclac.git
cd insulinclac

# any static server works
npx serve .            # or python -m http.server 8000
```
Open `http://localhost:8000`. HTTPS is required for service-worker / PWA features.

---

## Project Structure

```
index.html               Main UI (single-page app)
script.js                InsulinCalculator class — all logic & DOM interaction
final_insulin_pens.json  Pen database (brand, generic, concentration, volume, NDC, priming units)
manifest.json            PWA web-app manifest
service-worker.js        Cache-first offline support
```

## Tech Stack

| Layer | Choice |
|---|---|
| Language | Vanilla ES6+ JavaScript (single class, no build step) |
| Styling | Tailwind CSS via CDN |
| PWA | Service Worker + Web App Manifest |
| Data | Static JSON pen database |

---

## Deployment

Any static-file host works — GitHub Pages, Netlify, Vercel, S3 + CloudFront, etc.

**Requirements:** HTTPS, correct MIME types for `.json` / `.js`, service worker served from `/`.

**Browser support:** Safari 12+, Chrome 80+, Firefox 75+, Edge 80+.

---

## License

MIT — see [LICENSE](LICENSE).
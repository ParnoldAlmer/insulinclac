# Insulin Pen Prescription Calculator

A mobile-first Progressive Web App (PWA) for calculating insulin pen prescriptions with weight-based dosing and pricing information.

![PWA](https://img.shields.io/badge/PWA-enabled-blue)
![Mobile](https://img.shields.io/badge/Mobile-first-green)
![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-CDN-06B6D4)

## 🏥 For Medical Professionals Only

**⚠️ MEDICAL DISCLAIMER**: This tool is designed for licensed medical professionals only. Always verify calculations and use clinical judgment. This calculator is not a replacement for professional medical expertise.

## ✨ Features

### 📱 Mobile-Optimized PWA
- **Installable** on iOS and Android devices
- **Offline functionality** once loaded
- **Touch-friendly** interface with optimized controls
- **iOS Safari** zoom prevention and smooth slider interactions

### 💊 Comprehensive Insulin Calculator
- **Pen Selection** from comprehensive database (Lantus, Novolog, Humalog, etc.)
- **Weight-Based Dosing** with 0.1, 0.2, 0.3 u/kg/day slider
- **Automatic Calculations** for total units, mL needed, and pens to order
- **Pricing Information** (GoodRx pricing for select pens)

### 🛡️ Safety Controls
- **Weight Conversion Protection** - confirmation dialog when switching kg/lbs
- **Input Validation** with bounds checking and warnings
- **Calculation Validation** prevents dangerous dosing errors
- **Visual Feedback** with color-coded validation states

### 🎯 Smart Features
- **Auto-fill** units per dose from weight-based calculation
- **Live Updates** as you adjust inputs
- **One-Click Copy** prescription notes
- **Responsive Design** works on all screen sizes

## 🚀 Getting Started

### Installation

**Option 1: Install as PWA**
1. Visit the app in your mobile browser
2. **iOS**: Tap Share → "Add to Home Screen"
3. **Android**: Tap Install prompt or browser menu → "Install app"

**Option 2: Use in Browser**
Simply navigate to the app URL and use directly in any modern browser.

### Local Development

```bash
# Clone the repository
git clone https://github.com/ParnoldAlmer/insulinclac.git
cd insulinclac

# Serve locally (any HTTP server)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000

# Open http://localhost:8000
```

## 🏗️ Technical Architecture

### Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: TailwindCSS via CDN
- **PWA**: Service Worker + Web App Manifest
- **Data**: JSON-driven insulin pen database

### File Structure
```
├── index.html              # Main application
├── script.js               # InsulinCalculator class
├── final_insulin_pens.json  # Insulin pen database
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline functionality
└── README.md               # This file
```

### Key Components

**InsulinCalculator Class**
- Input validation and bounds checking
- Weight-based dosing calculations
- Pen database management
- PWA-optimized UI interactions

**Safety Systems**
- Conversion confirmation dialogs
- Real-time input validation
- Calculation result verification
- Visual feedback mechanisms

## 📊 Insulin Pen Database

Includes comprehensive pen information:
- **Basal Insulins**: Lantus, Toujeo, Levemir, Tresiba, Basaglar
- **Rapid-Acting**: Humalog, Novolog, Admelog, Apidra
- **Ultra-Rapid**: Fiasp

Each entry contains:
- Brand and generic names
- Concentration (units/mL)
- Volume per pen (mL)
- Pens per box
- NDC codes
- Pricing information (where available)

## 🔧 Configuration

### Dosing Parameters
- **Weight-based dosing**: 0.1, 0.2, 0.3 u/kg/day
- **Default concentration**: 100 units/mL
- **Default volume**: 3 mL per pen
- **Default day supply**: 30 days

### Validation Bounds
- **Units per dose**: 0.1-200 units (warning >100)
- **Day supply**: 1-365 days
- **Total units**: Warning >3,000, error >10,000
- **Pen count**: Warning >20, error >50

## 📱 Mobile Optimizations

### iOS Safari
- **16px minimum font** sizes prevent auto-zoom
- **Touch-friendly** 28px slider thumb
- **Smooth dragging** with `touch-action: manipulation`
- **Proper meta tags** for PWA installation

### Android
- **Install prompts** via Web App Manifest
- **Service Worker** for offline functionality
- **Responsive breakpoints** for all screen sizes

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- AWS S3 + CloudFront

### Requirements
- HTTPS (required for PWA features)
- Proper MIME types for `.json` and `.js` files
- Service Worker must be served from root path

## 🛠️ Development

### Browser Support
- **iOS Safari** 12+
- **Chrome** 80+
- **Firefox** 75+
- **Edge** 80+

### Testing PWA Features
```bash
# Check PWA compliance
npm install -g lighthouse
lighthouse --view https://your-app-url

# Test offline functionality
# 1. Load app
# 2. Disconnect internet
# 3. Refresh page - should still work
```

## 📋 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Maintain mobile-first approach
- Preserve accessibility features
- Add comprehensive input validation
- Include safety checks for medical calculations
- Test PWA functionality thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Medical Disclaimer

**This tool is for use by medical professionals only.**

You went to medical school for a reason. Double-check your work, and trust your clinical judgment over any calculator result.

This calculator is not a replacement for experienced clinical judgment. We cannot and will not be held legally, financially, or medically responsible for decisions made using its calculators, equations, content, and algorithms.

## 🤝 Acknowledgments

- Insulin pen database compiled from manufacturer specifications
- PWA implementation follows modern web standards
- UI/UX optimized for medical workflow efficiency
- Safety features designed with patient care in mind

---

**Made with ❤️ for healthcare professionals**
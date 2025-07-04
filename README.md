# Insulin Pen Prescription Calculator

A clean, responsive web application that helps physicians calculate insulin pen prescriptions accurately.

## Features

- **Input Validation**: Real-time validation with clear error messages
- **Live Calculations**: Results update automatically as you type
- **Prescription Note Generation**: Automatically generates a formatted prescription note
- **Copy to Clipboard**: One-click copy functionality for the prescription note
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## How to Use

1. Open `index.html` in your web browser
2. Fill in the required fields:
   - **Units per Dose**: The insulin units per individual dose
   - **Insulin Concentration**: Usually 100 units/mL
   - **Volume per Pen**: Typically 3 mL per pen
3. Optionally adjust:
   - **Day Supply**: Defaults to 30 days
   - **Dose Frequency**: Defaults to 1 dose per day
4. Results will calculate automatically and show:
   - Total units needed for the prescription period
   - Total mL of insulin required
   - Number of pens to order
   - Formatted prescription note

## Calculation Formula

- **Total Units Needed** = Units per Dose × Doses per Day × Day Supply
- **Total mL Needed** = Total Units ÷ Insulin Concentration
- **Pens to Order** = ⌈Total mL ÷ Volume per Pen⌉ (rounded up)

## Files

- `index.html` - Main HTML structure with Tailwind CSS styling
- `script.js` - JavaScript calculator logic with live validation
- `README.md` - This documentation file

## Browser Compatibility

Works in all modern browsers that support:
- ES6 Classes
- Async/Await
- Clipboard API (for copy functionality)

## Example

For a patient needing:
- 20 units per dose
- Once daily (1 dose/day)
- 30 day supply
- Using 100 units/mL concentration
- 3 mL pens

Results:
- Total units: 600 units
- Total mL: 6 mL
- Pens to order: 2 pens

Generated note: "Order 2 pens of insulin 100 units/mL, use 20 units daily, 30 day supply"
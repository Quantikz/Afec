# Scout

Browser-first personal sourcing agent for Nigeria.

## Current MVP
- Natural-language product request
- Photo upload entry point
- Five supplier options
- Landed-price estimate in NGN
- Supplier/QC/shipping trust UI
- WebGPU capability detection with graceful fallback
- Responsive mobile-first interface

## Architecture direction
DOM/CSS handles the product experience. WebGPU is used only where browser GPU acceleration is useful, with feature detection and fallback. Supplier integrations, FX, freight, customs, payments and order tracking should live behind a backend/API rather than in the browser.

The product cards in this first commit are demonstration records, not live supplier inventory. Do not present them as live quotes.

## Run
```bash
cd scout
npm install
npm run dev
```

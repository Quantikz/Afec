# Scout

Browser-first personal sourcing agent for Nigeria.

## Live sourcing layer

Scout now has a server-side supplier adapter architecture.

### Connected
- Made-in-China public product search: live search adapter.
- Supplier results are ranked by the selected Top / Cheap / Cheaper / Cheapest mode.

### Planned
- 1688 adapter: intentionally disabled until approved/API access is configured.
- Alibaba adapter: intentionally disabled until approved/API access is configured.

Scout must never label demo records as live supplier data or pretend to have an API connection it does not have.

## Run locally

Terminal 1:
```bash
cd ~/Afec/scout/api
npm install
npm run dev
```

Terminal 2:
```bash
cd ~/Afec/scout
npm install
npm run dev -- --host 0.0.0.0
```

Open:
`http://localhost:5173`

The Vite development server proxies `/api` requests to `http://localhost:8787`.

## Search API

`POST /api/search`

Example body:
```json
{"query":"leather sneakers","mode":"cheapest"}
```

The API returns live candidates from Made-in-China when its public search is reachable.

## Important

Live marketplace listings can change, and supplier price/freight/customs are not final until confirmed. Scout should verify supplier details and landed costs before taking payment.

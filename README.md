# ZECAR showroom

A premium, photo-led dealership showroom built with Next.js 16 App Router, TypeScript, Tailwind CSS 4, and Vitest. This is a browsing and inquiry experience—not an ecommerce or online purchasing flow.

> The included inventory, address, contact details, prices, and availability are replaceable sample content for demonstration only. They do not represent live stock or a real operating location.

## Local commands

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
npm start
```

The development server is available at `http://localhost:3000`. Run `npm run build` before `npm start`.

## Content replacement

Brand and showroom details live in `src/data/dealership.ts`. Replace the placeholder phone, WhatsApp number, email, address, hours, and `siteUrl` there before launch. The same values feed the header, footer, contact page, inquiry links, metadata, sitemap, and AutoDealer structured data.

All inventory lives in `src/data/vehicles.ts` and follows the typed model in `src/types/vehicle.ts`. The first four supplied listings remain replaceable/demo content until the owner provides exact facts. Update their `year`, `price`, `mileage`, `fuelType`, `transmission`, `engine`, `drivetrain`, and `interiorColor` in `src/data/vehicles.ts`; update localized descriptions and equipment in `src/lib/i18n.ts`. Do not infer these values from photos. Keep slugs unique and use ISO `YYYY-MM-DD` dates.

## Images

The supplied galleries for zec-001 through zec-004 are local under `public/vehicles/` and use root-relative URLs. The supplied brand mark is `public/brand/zecar-mark.png`; app icons are `src/app/icon.png` and `src/app/apple-icon.png`. The two untouched demo listings still use `images.unsplash.com` through the restricted Next Image `remotePatterns` rule in `next.config.ts`. Cards and galleries provide fixed aspect ratios and neutral loading/failure backgrounds, but a production CMS should validate image availability during publishing.

## Inquiry behavior

WhatsApp links include the exact vehicle title and canonical listing URL. Forms intentionally use a transparent `mailto:` flow: submitting opens the visitor’s configured email app with a prepared message, and nothing is claimed as delivered. Replace this with a validated server-side form endpoint only when real backend and email credentials are available.

## Localization

Georgian (`ka`) is the server-rendered default. Russian (`ru`) and English (`en`) can be selected from the compact header control; the choice is stored under `zecar-locale` in `localStorage` and never inferred from the browser language. Changing language updates the current view without navigation, so inventory filters and gallery state are preserved.

UI dictionaries and localized vehicle descriptions/features live in `src/lib/i18n.ts`. Keep the `ka`, `ru`, and `en` dictionaries structurally identical, add localized content for every vehicle ID, and keep canonical enum values in `src/data/vehicles.ts` unchanged. Run `npm test -- --run` after any copy or inventory update; the localization contract checks dictionary parity, vehicle coverage, inquiry output, and enum coverage.

## Future CMS migration

The typed data boundary makes a CMS migration straightforward: replace exports from `src/data/vehicles.ts` and `src/data/dealership.ts` with validated server-side fetchers while keeping the `Vehicle` contract stable. Recommended follow-up work includes schema validation, preview support, image asset validation, availability synchronization, caching/revalidation, and a real inquiry endpoint with spam protection and consent handling.

## Routes

- `/` — photo-led showroom home
- `/cars` — searchable, filterable, sortable inventory
- `/cars/[slug]` — vehicle gallery, specifications, features, and exact-car inquiry
- `/about` — restrained showroom approach
- `/contact` — centralized contact information and mailto form
- `/sitemap.xml` and `/robots.txt` — crawl metadata

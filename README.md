# Backend Integration & Data Mapping Guide

### Developer Support

For backend collaboration or technical queries:

- Telegram: @kenny_sudi_vn

---

Quick walkthrough for wiring up the backend APIs to the existing frontend templates.

All catalog data currently runs off static mocks in assets/js/products-data.js (HVAC_PRODUCTS). The DOM rendering and client-side filtering are handled in assets/js/products.js (catalog) and assets/js/product-detail.js (single product view).

---

## 1. Product Data Schema

Here is the JSON shape the frontend expects. Keep field names consistent so the dynamic filters, specs tables, and gallery thumbnails do not break:

```json
{
  "id": "a45938e7-76b6-4ef1-be4a-9409f55fcd5f",
  "name": "14x25x1 MERV 13 Premium Filter",
  "brand": "Ameristar",
  "category": "filters",
  "originalCategory": "HVAC Equipment Residential - Furnace and Coil",
  "tag": "Bundle Deal Available",
  "tagClass": "tag-pink",
  "efficiency": "92% AFUE",
  "btu": "30,000 BTU",
  "series": "M96V",
  "primaryImage": "https://your-storage-bucket.com/products/filter-primary.jpg",
  "primaryCaption": "Premium high-efficiency residential filter",
  "thumbnails": [
    {
      "img": "https://your-storage-bucket.com/products/filter-primary.jpg",
      "label": "Primary",
      "caption": "Front view"
    },
    {
      "img": "https://your-storage-bucket.com/products/filter-detail.jpg",
      "label": "Detail",
      "caption": "Media close-up"
    }
  ],
  "spot_text": "High-efficiency pleated filter for residential air handlers and furnaces.",
  "status": "active_showing",
  "is_part": false,
  "price_from": 149.99,

  "isDiscontinued": true,
  "discontinuedType": "alternative",
  "alternativeItemNumber": "123ABC456",
  "alternativeProductId": "amana-furnace-14-30k",

  "installedPrice": 505.00,
  "specialOrder": true,
  "vendors": [
    {
      "name": "Ferguson",
      "location": "Naperville",
      "hasLink": true,
      "url": "https://www.ferguson.com",
      "stock": "4 Avail",
      "phone": "(630) 555-0199"
    },
    {
      "name": "Johnstone Supply",
      "location": "Naperville",
      "hasLink": false,
      "stock": "2 Avail",
      "phone": "(815) 555-0144"
    }
  ],

  "variants": [
    {
      "sku": "FLT-1425-M13",
      "name": "14x25x1 Single Pack",
      "price": 149.99,
      "stock_status": "In Stock"
    }
  ],
  "promo_title": "Spring Sale 15% Off",
  "promo_description": "Instant discount applied on diagnostic dispatch calls.",
  "placeholders": {
    "TextPlaceHolder1": "MERV 13 filtration rating",
    "TextPlaceHolder2": "Traps over 98% of airborne dust & pollen",
    "TextPlaceHolder3": "10-Year Heat Exchanger / 1-Year Labor Warranty",
    "TextPlaceHolder4": "ComEd & Nicor Clean Energy Rebate Eligible"
  },
  "specs": {
    "airflow": "Upflow Airflow Orientation",
    "soundLevel": "Whisper-Quiet Low Decibel",
    "stages": "Single Stage",
    "dimensions": "17.5\" Width Housing"
  },
  "avgRating": 4.8,
  "reviewCount": 14,
  "reviews": [
    {
      "id": "rev-101",
      "reviewer_name": "Dave M. (Naperville)",
      "rating": 5,
      "title": "Clean installation and quiet run",
      "review_text": "Tech showed up on time, replaced the old blower assembly and set up the thermostat.",
      "is_verified_purchase": true,
      "created_at": "2026-03-02T10:15:00Z",
      "helpful_votes": 4
    }
  ]
}
```

Key Business Flags to Note:
- isDiscontinued: When true, the card drops the red diagonal "Discontinued" stamp over the thumbnail.
- discontinuedType: Set to alternative to show the green "SEE Alternative Replacement" stamp along with the dark Alternative ITEM NUMBER banner. Set to no_longer_available for permanent legacy items.
- installedPrice: Turnkey cost (part + labor + warranty) used inside the Field Tech control card.
- vendors: Local wholesale depot availability (Ferguson, Johnstone Supply) displayed in technician mode.

---

## 2. API Endpoints to Hook Up

GET /api/v1/products (Catalog listing)
Needs to support multi-faceted filtering matching the sidebar tree:
- Filters: brand, category, stage (single/two/variable), airflow (upflow/downflow/multipoise), width (14.5", 17.5", 21", 24.5"), btu, efficiency (80% / high-afue).
- Search & Sort: q, sort (price-asc, price-desc, rating-desc, name-asc), page, limit (default UI renders 6 items/page).

Quickest hookup in assets/js/products.js:
Replace direct iterations over HVAC_PRODUCTS by populating the global variable from your API on initial page load:

```js
async function loadCatalog() {
  try {
    const res = await fetch('/api/v1/products');
    window.HVAC_PRODUCTS = await res.json();
    initRockAutoTree();
    renderCatalog();
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}
```

(Or switch filterProducts() to call the server directly if you want full server-side pagination).

---

GET /api/v1/products/:id (Detail view)
In assets/js/product-detail.js, swap out the synchronous array lookup around lines 90-95:

```js
// Before:
// const product = HVAC_PRODUCTS.find(p => p.id === productId) || HVAC_PRODUCTS[0];

// Hookup:
fetch(`/api/v1/products/${encodeURIComponent(productId)}`)
  .then(res => res.json())
  .then(product => {
    initRoleSwitcher(product);
    renderProductDetail(product);
    renderRelatedProducts(product);
    initReviewSubmission(product);
  })
  .catch(err => console.error('Product not found:', err));
```

---

POST /api/v1/quotes (Lead capture & dispatch)
Two forms send customer estimate requests:
1. Modal Quote Form (#modalQuoteForm in products.html and product-detail.html)
2. Hero Quick Estimate (#quickEstimateForm in index.html / assets/js/main.js)

Payload:
```json
{
  "full_name": "Mark Johnson",
  "phone": "(815) 556-0660",
  "email": "customer@gmail.com",
  "service_type": "Furnace Replacement",
  "home_sqft": "2200",
  "product_name": "Ameristar - M96V 30k BTU",
  "zip_code": "60540",
  "notes": "Need Saturday morning dispatch if possible"
}
```

Currently both forms just run a dummy setTimeout() to show the success banner. Simply update the submit handlers to POST JSON to this endpoint and toggle the alert based on the HTTP status.

---

POST /api/v1/products/:id/reviews (Customer ratings)
Handled inside initReviewSubmission(product) in assets/js/product-detail.js. Right now it pushes the new review into the local array in memory. Point it to your review moderation/database endpoint on submit.

---

## 3. Dual-View Mode (Consumer vs. Employee)

The site includes a sticky top role bar to preview how pages look to homeowners versus field service technicians.

The active state is stored in:
localStorage.getItem('hvac_user_role'); // 'consumer' | 'employee'

- Consumer View: Equipment loose parts have prices crossed out or replaced with service notices (preventing DIY ordering without certified installation).
- Employee View: Displays trade net pricing, installed job price, supplier warehouse links, live pricing adjustment inputs, and truck stock requisition actions.

When backend authentication is ready, simply set localStorage.setItem('hvac_user_role', 'employee') upon technician login, or default to consumer for anonymous public sessions.

---

## 4. Assets & CORS

- Image URLs currently point to a public Supabase Storage bucket. When migrating images to your own S3/GCS bucket or local media server, make sure URLs are absolute or properly resolved relative to root.
- If your API runs on a separate port or domain during staging (e.g., localhost:3000 vs frontend on localhost:8080), do not forget standard CORS headers:

Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization

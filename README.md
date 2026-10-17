# Artech Design Website
### Aspirations Architects Engineers — Official Corporate Web Platform

---

## 1. Project Overview
The **Artech Design Website** is the bespoke digital platform for **Aspirations Architects Engineers**, an established architectural and engineering consultancy founded in 1990 in Chennai, India. The web platform showcases the firm's architectural portfolio, corporate ethos, and six core service sectors with a premium minimalist aesthetic.

### Official Company Information
- **Company Name:** Aspirations Architects Engineers
- **Established:** 1990
- **Email:** [aspirations@arkitect.in](mailto:aspirations@arkitect.in)
- **Contact Number:** 044 2481 8999
- **Address:** New No. 17, Old No. 5, 1st Floor, Aryagowder Road, West Mambalam, Chennai – 600 033, Tamil Nadu, India.
- **Core Practice Sectors:**
  1. Healthcare
  2. Residential
  3. Commercial
  4. Hospitality
  5. Industrial
  6. Institutional

---

## 2. Technology Stack & Prohibitions

### Permitted Technologies (Zero-Dependency Architecture)
- **Frontend:**
  - Semantic HTML5
  - Modern Vanilla CSS3 (Custom properties, Grid, Flexbox)
  - Vanilla JavaScript (ES6+ modular, asynchronous fetch component system)
- **Backend (When activated for form processing/database):**
  - Native Core PHP (No frameworks)
  - MySQL via PDO (Only when structured data storage is required)
  - Environment variable configuration via `.env`

### Strictly Prohibited Technologies
To ensure maximum speed, extreme maintainability, zero build friction, and lifetime longevity:
- **No Frontend Frameworks:** React, Vue, Next.js, Angular, Svelte.
- **No CSS Frameworks:** Tailwind CSS, Bootstrap, Bulma, Foundation.
- **No Transpiled Languages:** TypeScript, JSX, TSX.
- **No JavaScript Libraries:** jQuery, Lodash, Axios (use native `fetch()`).
- **No Build / Bundler Tools:** Vite, Webpack, Parcel, Rollup, Gulp.
- **No Node.js Runtime Backend:** Express, Koa, NestJS.
- **No PHP Frameworks:** Laravel, Symfony, CodeIgniter.
- **No npm / Composer Dependencies:** Zero `node_modules` or runtime package baggage.

---

## 3. Project Directory Architecture

```
arkitect/
│
├── index.html                  # Homepage (Implemented in Stage 3)
├── about.html                  # About Us (Stage 5)
├── services.html               # Services Overview (Stage 6)
├── projects.html               # Projects Gallery (Stage 8)
├── contact.html                # Contact Us (Stage 9)
│
├── services/                   # Service Detail Pages (Stage 7)
│   ├── healthcare.html
│   ├── residential.html
│   ├── commercial.html
│   ├── hospitality.html
│   ├── industrial.html
│   └── institutional.html
│
├── components/                 # Reusable HTML Component Fragments
│   ├── navbar.html             # Global Navigation Bar
│   ├── footer.html             # Global Site Footer
│   └── page-banner.html        # Reusable Inner Page Banner
│
├── css/                        # Global & Scoped Stylesheets
│   ├── root.css                # CSS Variables / Design Tokens
│   ├── global.css              # Reset, typography, utility classes
│   ├── components.css          # Shared component styles
│   ├── responsive.css          # ALL Media Queries (Centralized)
│   └── pages/                  # Page-Specific Stylesheets
│       ├── home.css
│       ├── about.css
│       ├── services.css
│       ├── service-detail.css
│       ├── projects.css
│       └── contact.css
│
├── js/                         # Vanilla JavaScript Modules
│   ├── components.js           # Async HTML component loader
│   ├── navbar.js               # Navigation & mobile drawer interaction
│   ├── main.js                 # Global application orchestration
│   ├── carousel.js             # Hero carousel logic
│   ├── logo-carousel.js        # Client/partner logo ticker
│   ├── testimonial.js          # Testimonials carousel
│   ├── projects.js             # Project filtering & gallery interaction
│   └── contact.js              # Form validation & AJAX submission
│
├── assets/                     # Static Digital Assets
│   ├── images/
│   │   ├── logo/               # Vector and raster logo marks
│   │   ├── hero/               # Hero carousel imagery
│   │   ├── services/           # Sector feature graphics
│   │   ├── projects/           # Architectural portfolio images
│   │   ├── clients/            # Client logos
│   │   ├── testimonials/       # Reviewer portraits / quotes
│   │   └── company/            # Studio, leadership & office imagery
│   ├── icons/                  # SVG icons
│   └── fonts/                  # Self-hosted web fonts
│
├── backend/                    # Server-Side Logic (Core PHP)
│   ├── config/                 # DB & environment initialization
│   ├── api/                    # Secure form processing endpoints
│   ├── services/               # Mailer & database handlers
│   ├── utils/                  # Sanitization, CSRF & rate limiters
│   ├── logs/                   # Protected private server logs
│   └── .htaccess               # Directory access control
│
├── .gitignore                  # Git tracking exclusion rules
├── .env.example                # Safe environment variable template
├── README.md                   # Project overview & developer guide
└── PROJECT_RULES.md            # Master development governance document
```

---

## 4. Design System & Colour Governance

### Approved Colour Palette
- **Warm Off-White:** `#F6F4F5` (Base canvas surface)
- **Pure White:** `#FFFFFF` (Elevated cards and stark accents)
- **Charcoal:** `#2C2C2A` (Primary headers, dark contrasts)
- **Primary Text:** `#242424` (High-contrast, accessible body text)
- **Muted Text:** `#77736F` (Subtitles, metadata, captions)
- **Warm Architectural Brown:** `#6C4E36` (Brand accent, active states, key CTAs)
- **Warm Stone:** `#DCD7D2` (Neutral structural containers)
- **Subtle Border:** `#E4E0DC` (Fine structural dividing lines)

> **CRITICAL RULE:** The colour `#BCCED2` is **strictly forbidden** throughout the entire codebase (stylesheets, markup, SVGs, gradients, and scripts).

### CSS Loading Sequence
Every HTML document must include stylesheets in this exact sequence:
```html
<link rel="stylesheet" href="css/root.css">
<link rel="stylesheet" href="css/global.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/pages/<page-name>.css">
<link rel="stylesheet" href="css/responsive.css">
```

---

## 5. Development Workflow (10-Stage Roadmap)

| Stage | Scope | Status |
| :---: | :--- | :---: |
| **Stage 1** | **Master Rules & Project Structure** | **Completed** |
| **Stage 2** | Reference-Image Analysis & Global Design System | Next |
| **Stage 3** | Homepage Implementation (`index.html` & Hero) | Pending |
| **Stage 4** | Homepage Audit (Accessibility, Performance, Responsiveness) | Pending |
| **Stage 5** | About Us Page Implementation (`about.html`) | Pending |
| **Stage 6** | Services Overview Page Implementation (`services.html`) | Pending |
| **Stage 7** | Individual Service Detail Pages (6 Sectors) | Pending |
| **Stage 8** | Projects Gallery Implementation (`projects.html`) | Pending |
| **Stage 9** | Contact Page & PHP Backend (`contact.html` & `backend/`) | Pending |
| **Stage 10** | Final Website-Wide Production Audit | Pending |

---

## 6. Local Server Setup (XAMPP)

1. Verify XAMPP Apache is running:
   - Web root path: `A:\xampp\htdocs\arkitect`
   - Local URL: `http://localhost/arkitect/`
2. Shared components are loaded via native `fetch()`, which requires an HTTP/HTTPS protocol. Do not open files directly using the `file://` protocol.
3. When configuring environment variables in Stage 9:
   - Copy `.env.example` to `.env`.
   - Populate local SMTP or database parameters in `.env`.
   - Never commit `.env` to version control.
#   a r k i t e c t  
 
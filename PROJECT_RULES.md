# ARTECH DESIGN WEBSITE
## MASTER PROJECT RULES & DEVELOPMENT GOVERNANCE

---

### ROLE AND GOVERNANCE
This project is governed under the roles of Senior Frontend Developer, Senior PHP Backend Developer, Senior UI/UX Designer, Responsive Web Design Specialist, Accessibility Specialist, and Website Performance Engineer.
Development is executed inside **Antigravity IDE** using the configured Gemini model. All work follows strict, production-grade web development standards, avoiding shortcuts, boilerplate frameworks, or premature full-site generation. Development proceeds strictly in controlled stages.

---

### 1. PROJECT IDENTITY & OFFICIAL COMPANY INFORMATION
- **Project Working Name:** Artech Design Website
- **Official Company Name:** Aspirations Architects Engineers
- **Year Established:** 1990
- **Official Email:** [aspirations@arkitect.in](mailto:aspirations@arkitect.in)
- **Official Contact Number:** 044 2481 8999
- **Official Address:** New No. 17, Old No. 5, 1st Floor, Aryagowder Road, West Mambalam, Chennai – 600 033, Tamil Nadu, India.
- **Brand Identity Policy:** The public-facing brand presentation will be confirmed during the design stage. Never invent a logo, brand identity, registration details, awards, testimonials, client identities, or company achievements.
- **Primary Service Categories (6 Core Verticals):**
  1. Healthcare
  2. Residential
  3. Commercial
  4. Hospitality
  5. Industrial
  6. Institutional
- **Planned Website Pages:**
  - `index.html` (Home — built first in a later stage)
  - `about.html` (About Us)
  - `services.html` (Services Overview)
  - `projects.html` (Projects Gallery)
  - `contact.html` (Contact Us)
  - 6 Individual Service Detail Pages:
    - `services/healthcare.html`
    - `services/residential.html`
    - `services/commercial.html`
    - `services/hospitality.html`
    - `services/industrial.html`
    - `services/institutional.html`

---

### 2. FRESH PROJECT REQUIREMENT
- This is a completely new project created from scratch in the verified root workspace (`A:\xampp\htdocs\arkitect`).
- It is **NOT** a redesign, repair, migration, or refactoring of any existing codebase.
- Before creating files, the workspace must be inspected and verified clean.
- Never search for or copy code from unrelated existing projects.
- Never modify files outside the approved project directory.
- Never assume an existing navbar, footer, stylesheet, or backend exists prior to its controlled stage.
- Never run destructive terminal commands.

---

### 3. MANDATORY TECHNOLOGY STACK

#### Frontend (Strictly Permitted)
- **HTML5** (Semantic structure)
- **CSS3** (Modern Vanilla CSS)
- **Vanilla JavaScript** (ES6+ modular, no dependencies)

#### Backend (Only When Required)
- **Core PHP** (Native, procedural or clean OOP, zero framework)
- **MySQL** (Only when approved database storage is required)
- Secure server-side configuration with `.env` environment variables for secrets.

#### Strictly Prohibited
Do **NOT** use or introduce:
- React, Next.js, Vue.js, Angular, Svelte, or other frontend UI frameworks.
- TypeScript, JSX, or TSX.
- Tailwind CSS, Bootstrap, Foundation, or any CSS utility framework.
- jQuery or third-party DOM manipulation libraries.
- Node.js as the website backend, Express.js, or server-side JS.
- Vite, Webpack, Rollup, Parcel, or other build/bundling tools.
- npm-based application dependencies or `package.json` build steps.
- Laravel, Symfony, CodeIgniter, or any PHP framework.
- The website must run natively under an HTTP server (e.g., Apache/XAMPP) without compilation or transpilation.

---

### 4. DEVELOPMENT ENVIRONMENT RULES
- Execute inside Antigravity IDE adhering to configured workspace limits.
- Never assume a tool action succeeded without inspecting its result.
- Do not install npm/composer packages or extensions without explicit authorization.
- Never expose API keys, database credentials, SMTP passwords, or private configuration.
- Never claim browser, responsiveness, accessibility, or PHP testing has passed unless physically executed and verified.
- The AI assistant must strictly follow project rules and never substitute them with external preferences.

---

### 5. TARGET PROJECT ARCHITECTURE
```
arkitect/
│
├── index.html
├── about.html
├── services.html
├── projects.html
├── contact.html
│
├── services/
│   ├── healthcare.html
│   ├── residential.html
│   ├── commercial.html
│   ├── hospitality.html
│   ├── industrial.html
│   └── institutional.html
│
├── components/
│   ├── navbar.html
│   ├── footer.html
│   └── page-banner.html
│
├── css/
│   ├── root.css
│   ├── global.css
│   ├── components.css
│   ├── responsive.css
│   └── pages/
│       ├── home.css
│       ├── about.css
│       ├── services.css
│       ├── service-detail.css
│       ├── projects.css
│       └── contact.css
│
├── js/
│   ├── components.js
│   ├── navbar.js
│   ├── main.js
│   ├── carousel.js
│   ├── logo-carousel.js
│   ├── testimonial.js
│   ├── projects.js
│   └── contact.js
│
├── assets/
│   ├── images/
│   │   ├── logo/
│   │   ├── hero/
│   │   ├── services/
│   │   ├── projects/
│   │   ├── clients/
│   │   ├── testimonials/
│   │   └── company/
│   ├── icons/
│   └── fonts/
│
├── backend/
│   ├── config/
│   ├── api/
│   ├── services/
│   ├── utils/
│   ├── logs/
│   └── .htaccess
│
├── .gitignore
├── .env.example
├── README.md
└── PROJECT_RULES.md
```

---

### 6. GLOBAL COMPONENT ARCHITECTURE
- Reusable HTML components reside in `components/`:
  - `components/navbar.html`: Brand logo, navigation links (Home, About Us, Services dropdown with 6 categories, Projects, Contact Us), mobile hamburger control.
  - `components/footer.html`: Company identity, contact details, navigation, 6 service links, dynamic copyright year.
  - `components/page-banner.html`: Page title, breadcrumb navigation, configurable banner background (used for inner pages; Home uses its own hero carousel).
- **Loading Mechanism:** Components are loaded via native JavaScript `fetch()` into dedicated container placeholders (e.g. `<div id="navbar-placeholder"></div>`).
- **Server Requirement:** Components require an HTTP server (e.g., `http://localhost/arkitect/`); direct `file://` access will fail CORS for `fetch()`.
- **Integrity Rules:**
  - Robust error handling for component loading failures.
  - Interactive handlers (hamburger, dropdowns) must initialize **after** HTML injection.
  - Never duplicate navbar/footer code directly into individual page templates.
  - Avoid duplicate event listeners on re-renders.

---

### 7. GLOBAL CSS ARCHITECTURE
- **`css/root.css`**: Design tokens only (`:root` CSS custom properties for colours, typography, spacing, transitions, shadows, border-radii).
- **`css/global.css`**: CSS resets, box-sizing, base typography, common layout containers, grid/flex utilities.
- **`css/components.css`**: Styles for reusable elements (navbar, footer, page banner, buttons, cards, forms).
- **`css/pages/*.css`**: Page-specific layout and unique section styles only.
- **`css/responsive.css`**: **MANDATORY CENTRAL REPOSITORY FOR ALL MEDIA QUERIES.**
  - Media queries must **NOT** be scattered across `root.css`, `global.css`, `components.css`, or page-specific stylesheets.
  - All responsive breakpoints and viewport adaptations are maintained strictly in `css/responsive.css`.

#### Documented CSS Loading Order
Every page must link stylesheets in the following strict order:
1. `css/root.css`
2. `css/global.css`
3. `css/components.css`
4. `css/pages/<page-name>.css` (page specific)
5. `css/responsive.css` (always loaded last)

---

### 8. GLOBAL COLOUR RULES & DESIGN PALETTE

#### Approved Palette (Source of Truth)
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| **Warm off-white** | `#F6F4F5` | Primary site background, warm neutral surfaces |
| **White** | `#FFFFFF` | Card backgrounds, elevated surfaces, clean contrast |
| **Charcoal** | `#2C2C2A` | Primary headers, dark contrast blocks, deep accents |
| **Primary text** | `#242424` | Body text, readable high-contrast typography |
| **Muted text** | `#77736F` | Secondary labels, metadata, captions |
| **Warm architectural brown** | `#6C4E36` | Signature brand accents, active states, key CTAs |
| **Warm stone** | `#DCD7D2` | Secondary neutral containers, subtle tone dividers |
| **Subtle border** | `#E4E0DC` | Clean borders, card outlines, separating rules |

#### STRICT EXCLUSION
- **NEVER use `#BCCED2` under any circumstance.**
- This exclusion strictly prohibits `#BCCED2` from:
  - CSS root variables
  - Background colours
  - Linear or radial gradients
  - Image overlays and pseudo-elements
  - Border and outline colours
  - Hover or focus states
  - Responsive overrides
  - Inline styles or component templates
- Do not replace the excluded colour with another blue-grey without explicit user approval.
- Design Aesthetic: Premium minimalist architectural elegance with warm neutral surfaces, charcoal contrast, architectural brown accents, refined typography, and generous whitespace.

---

### 9. IMAGE MANAGEMENT RULES
- Dedicated directory structure: `assets/images/{logo,hero,services,projects,clients,testimonials,company}/`.
- Real assets only when provided; no fake client logos, fabricated projects, or invented credentials.
- Images must maintain proper aspect ratios without distortion (`object-fit: cover` with planned containers).
- Production images must be optimized (prefer WebP/AVIF format).
- Explicit `alt` attributes on all content images.
- Native lazy loading (`loading="lazy"`) for below-the-fold assets; primary hero image must load eagerly (`loading="eager"` or default).
- Image paths must be verified and easily replaceable without altering structural component code.

---

### 10. MOBILE-FIRST RESPONSIVE REQUIREMENTS
- Mobile-first CSS foundation, scaling gracefully to larger screens.
- **Mandatory Viewport Verification Targets:**
  - `320px`, `360px`, `375px`, `390px`, `430px` (Mobile phones)
  - `768px` (Tablets / portrait iPads)
  - `1024px` (Small laptops / tablet landscape)
  - `1280px`, `1440px` (Desktops)
  - `1920px` (Ultrawide monitors)
- **Zero-Tolerance Requirements:**
  - Zero accidental horizontal scrolling or overflow (`overflow-x` discipline).
  - No clipped text, overlapping elements, or broken layouts.
  - Touch targets minimum 44px × 44px on mobile viewports.
  - Content-driven breakpoints inside `css/responsive.css`.
  - Respect `prefers-reduced-motion` media queries.

---

### 11. JAVASCRIPT RULES
- Pure Vanilla JavaScript (ES6+), modular, strictly scoped.
- Never pollute the global window object.
- Use `addEventListener()`; never write inline HTML `onclick="..."` handlers.
- Always check that DOM target elements exist before attaching listeners or initializing plugins.
- Handle asynchronous `fetch()` requests with comprehensive `try...catch` and user-friendly fallback states.
- Clean up event listeners or prevent duplicate bindings during dynamic component insertion.
- Specific functionality (carousels, testimonials, project filters, forms) must reside in dedicated script files (`carousel.js`, `testimonial.js`, `projects.js`, `contact.js`).

---

### 12. PHP BACKEND RULES
- Backend scripts reside strictly in `backend/`.
- Never expose sensitive credentials, API keys, database passwords, or SMTP secrets in code or git.
- Protect secrets via `.env` parsed on the server side, with `.env` excluded from version control.
- Input validation: All data received from forms or queries must be sanitized and strictly validated on the server.
- Database: Use prepared statements (`PDO` or `MySQLi`) exclusively when database interaction is requested.
- Error Handling: Never output raw system error messages or database exceptions to the client. Return safe JSON responses with proper HTTP status codes.
- Security: Implement CSRF tokens, rate limiting, and spam protection on contact form endpoints.
- Server protection: Restrict direct web access to sensitive backend subdirectories (`config/`, `logs/`, `services/`, `utils/`) via `.htaccess`.

---

### 13. SEO, ACCESSIBILITY, AND PERFORMANCE STANDARDS
- **Accessibility:** WCAG 2.1 AA compliance target. Proper ARIA attributes, semantic landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), visible `:focus-visible` states, and logical keyboard tab indexing.
- **SEO:** Descriptive unique `<title>`, distinct `<meta name="description">`, single `<h1>` per page, Open Graph metadata, semantic heading hierarchy (`h1` -> `h2` -> `h3`).
- **Performance:** Minimal layout shifts (CLS = 0), fast First Contentful Paint, optimized asset paths, minimal DOM depth, zero blocking external scripts.

---

### 14. STAGED DEVELOPMENT WORKFLOW
Development proceeds strictly sequentially across 10 defined stages. No stage may be skipped or merged without explicit user authorization:
- **Stage 1:** Master rules and project structure *(CURRENT STAGE)*
- **Stage 2:** Reference-image analysis and global design system
- **Stage 3:** Homepage implementation (`index.html`, home hero carousel, section layouts)
- **Stage 4:** Homepage audit (design, responsiveness, accessibility, performance)
- **Stage 5:** About Us page implementation
- **Stage 6:** Services overview page implementation
- **Stage 7:** Individual service pages (6 sector detail pages)
- **Stage 8:** Projects gallery page implementation
- **Stage 9:** Contact page and PHP backend implementation
- **Stage 10:** Final comprehensive website-wide audit

---

### 15. VERIFICATION PROTOCOL
- Never declare a feature, script, or page complete without concrete verification.
- Code must be verified via file inspection, DOM inspection, syntax validation, or browser checks.
- If a check cannot be executed (e.g., SMTP delivery without real credentials), state the exact status transparently.

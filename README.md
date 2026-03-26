# 🧭 Konkan Navigator
### *Guiding Your Konkan Journey*

A premium-quality, fully responsive multi-page travel website for exploring the Konkan Coast of India. Built as a hackathon-ready, portfolio-level project with a modern startup UI.

---

## 🚀 Project Overview

**Konkan Navigator** is a static travel platform that helps users discover destinations, find local guides, and plan personalized trips along India's scenic Konkan coastline (Ratnagiri & Sindhudurg districts, Maharashtra).

---

## 📄 Pages & File Structure

```
konkan-navigator/
│
├── index.html           → Home page
├── signin.html          → Sign In / Auth page
├── explore.html         → Explore destinations with filters
├── guides.html          → Browse & book local guides
├── trip-planner.html    → AI-style personalized trip planner
├── about.html           → About the platform & team
├── contact.html         → Contact form + FAQ
├── feedback.html        → User feedback form with analytics
│
├── css/
│   └── style.css        → All global styles (design system)
│
└── js/
    └── script.js        → All JavaScript functionality
```

---

## ✅ Completed Features

### 🎨 Design System
- Premium gradient design: `#1a6b6b → #2d7a4a`
- Glassmorphism cards with blur + transparency
- Smooth hover effects (translateY, scale, glow)
- Ripple effect on all buttons
- Responsive across Mobile / Tablet / Desktop
- Google Fonts: **Poppins** + **Inter**
- Custom scrollbar, selection highlight

### 🧭 Navigation
- Sticky navbar with glassmorphism
- Active page highlighting with teal underline
- Mobile hamburger menu with animation
- Scroll-aware shadow enhancement

### 🏠 Home Page (`index.html`)
- Full-screen hero with gradient + dot pattern
- Search bar with category dropdown
- Featured destinations (4 cards)
- Category filter (All/Beach/Fort/Temple/Mountain/Food)
- Quick categories grid (5 items with icons)
- Why Konkan section with animated stat counters
- Testimonials section
- CTA banner

### 🔐 Sign In (`signin.html`)
- Full gradient background with floating decorative cards
- Social login buttons (Google/Facebook)
- Name + Email + Password fields
- Password visibility toggle
- Remember Me + Forgot Password
- "Skip to Home" guest link
- Form validation with error messages

### 🌍 Explore (`explore.html`)
- Live search bar (filters destinations in real time)
- Category filter pills + dropdown
- Sort by Rating / Name
- 13+ destination cards (Beach/Fort/Temple/Mountain/Food/Waterfall)
- Results count display
- Destination detail modal (popup with full info)
- Category URL parameter support (`?cat=beach`)

### 🧑‍🤝‍🧑 Guides (`guides.html`)
- 6 initial guide cards + 3 hidden (Load More)
- Filter by: Rating | Language | Max Price (range slider)
- Guide profile modal with stats
- Book Guide with toast confirmation
- **Become a Guide** application form
- Benefits list + success message on submit

### 🧳 Trip Planner (`trip-planner.html`)
- Budget input with quick-set buttons (₹5K/10K/20K/50K)
- Days dropdown (1–10 days)
- Interest checkboxes (Beach/Heritage/Food/Adventure/Nature)
- Travel style & group type selectors
- Dynamic itinerary generator with day-by-day plan
- Destination suggestions per interest category
- Budget breakdown per day
- Travel tips sidebar

### ℹ️ About (`about.html`)
- Company story with image + badge
- 8-feature grid (Hidden Places, Verified Guides, Smart Planning, Safety Alerts, Eco Tourism, Offline, Budget, Community)
- Milestone timeline (2020–2025)
- Team section with avatars

### 📞 Contact (`contact.html`)
- 4 contact info cards (Email, Phone, Address, Hours)
- Social media icon buttons (5 platforms)
- Contact form: First/Last Name, Email, Phone, Subject dropdown, Message, Consent checkbox
- Toast notification on submission
- FAQ accordion (5 questions)

### 📝 Feedback (`feedback.html`)
- Q1: Yes/No/Maybe radio with visual option highlighting
- Q2: Multi-select feature checkboxes (6 options, 2-column grid)
- Q3: Free text — "What did you enjoy most?"
- Q4: Interactive 5-star rating with hover labels
- Q5: Suggestions textarea
- **After submit:**
  - ✅ Summary tab with progress bars
  - ✅ All Responses list tab
  - ✅ Individual response tab
- Sidebar: Overall 4.8★ rating + breakdown bars + recent reviews + most-used features

### ⚙️ JavaScript Functionality (`js/script.js`)
- ✅ Category filtering (Explore + Home)
- ✅ Guide filtering (Rating + Language + Price)
- ✅ Load More guides
- ✅ Trip planner dynamic itinerary output
- ✅ Form validation (all forms, required fields + email)
- ✅ Toast notifications system (4 types: success/error/info/warning)
- ✅ Feedback summary rendering with tabs
- ✅ Smooth scrolling for anchor links
- ✅ Hover animations + ripple button effects
- ✅ Active navbar page highlighting
- ✅ Intersection Observer (scroll reveal animations)
- ✅ Counter animation (stat numbers count up)
- ✅ URL parameter reading (explore page pre-filter)
- ✅ Destination modals (Explore page)
- ✅ Guide profile modals

---

## 🎨 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary Start | `#1a6b6b` | Gradient, accent |
| Primary End | `#2d7a4a` | Gradient |
| Background | `#f5f0e8` | Page bg |
| CTA Gold | `#d4a017` | CTA buttons |
| Heading | `#1a1a2e` | All headings |
| Text | `#555555` | Body text |
| Star | `#f5a623` | Ratings |

---

## 🖼️ Images Used

All images sourced from **Unsplash** (free, high-quality):
- Beach images: Tarkarli, Murud, Dapoli, Velneshwar
- Fort images: Sindhudurg, Vijaydurg, Ratnadurg
- Temple images: Ganpatipule
- Mountain images: Amboli Ghats, Western Ghats
- Food images: Malvani cuisine
- Team/Guide avatars: Portrait photos

---

## 🔧 Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Flexbox + Grid, Custom Properties, Animations
- **Vanilla JavaScript** — No frameworks, ES6+
- **Google Fonts** — Poppins + Inter (via CDN)
- **Unsplash** — High-quality travel images (via CDN)

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| Desktop (>1024px) | Full multi-column |
| Tablet (768–1024px) | Adapted grids |
| Mobile (<768px) | Single column, hamburger menu |
| Small (<480px) | Compact spacing |

---

## 🚀 Getting Started

1. **Download / clone** the project
2. Open `index.html` in any modern browser
3. No build tools, no npm, no dependencies needed!

```bash
# Simply open in browser
open index.html
```

---

## 📦 Future Improvements

- [ ] Backend API for real guide booking
- [ ] User accounts and saved trips
- [ ] Real-time weather integration
- [ ] Google Maps integration for destinations
- [ ] Android/iOS app
- [ ] Offline PWA mode
- [ ] Multi-language support (Marathi, Konkani)
- [ ] Payment gateway for guide bookings
- [ ] User-generated reviews system

---

## 👥 Credits

Built with ❤️ for the **Konkan Coast** — India's most beautiful and underrated destination.

**© 2025 Konkan Navigator** — *Guiding Your Konkan Journey*

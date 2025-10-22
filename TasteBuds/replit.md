# Kitchen & Billing Management System

## Overview
This project is a modern React + TypeScript + Vite application designed to streamline restaurant operations by providing robust kitchen order tracking and billing management functionalities. It aims to offer an intuitive and efficient system for managing menu items, processing orders, handling payments, and facilitating real-time communication between billing and kitchen staff. The system supports offline operations with automatic synchronization, ensuring continuous service even without an internet connection.

## User Preferences
I prefer iterative development, where we focus on one feature or section at a time. Please ask before making major changes or architectural decisions. I appreciate detailed explanations for complex implementations.

## System Architecture

### UI/UX Decisions
- **Color Scheme**: Primary Orange (`#FF6B35`) for CTAs and highlights, Secondary Blue (`#004E89`) for accents, with specific colors for success, warning, and error states.
- **Typography**: Inter for UI, JetBrains Mono for code/numbers.
- **Spacing**: Consistent units (1, 2, 4, 6, 8, 12, 16, 24) for padding and gaps.
- **Components**: Elevated cards with subtle shadows, distinct button styles (Primary, Secondary, Ghost, Outline), rounded and color-coded badges, and zebra-striped tables with hover states.
- **Animations**: Smooth transitions and animations using Framer Motion.
- **Responsive Design**: Optimized for both mobile and desktop experiences.

### Technical Implementations & Feature Specifications
- **Home Page**: Dashboard with quick stats (Revenue, Orders, Tables, Prep Time) and quick navigation links.
- **Billing View (POS System)**:
    - Category-based menu organization.
    - Touch-friendly menu item cards.
    - **Modifier Selection Modal**: Dynamic options for sugar, size, and add-ons for drinks, and quantity-only for snacks/combos.
    - Real-time order summary with quantity controls, modifier badges, and support for multiple configurations of the same item.
    - **Discount Feature**: Percentage-based discount input field with automatic calculation before GST.
    - Automatic calculation of subtotal, discount, GST (5%), and total.
- **Payment View**:
    - Detailed price breakdown (subtotal, discount, GST, total).
    - Multiple payment methods: Cash (with change calculator), UPI (QR code), Card.
    - Success animation on order completion.
    - Order persistence and clearing post-payment.
- **Kitchen View**:
    - Real-time display of orders as cards.
    - Order cards show details including order number, time, items with modifiers, and full price breakdown.
    - Color-coded order statuses (Yellow: New, Blue: Preparing, Green: Ready).
    - Status workflow: New → Preparing → Ready.
    - Real-time updates via Firebase Realtime Database.
- **Admin Menu Management**:
    - PIN-based authentication for secure access.
    - CRUD operations for menu items (add, edit, delete) with name, category, price, and GST rate.
    - Real-time sync of menu changes with Firebase.
    - Dynamic loading of menu on billing page.

### System Design Choices
- **Frontend Framework**: React 18 with TypeScript for type safety.
- **Build Tool**: Vite for fast development.
- **Routing**: Wouter for lightweight client-side routing.
- **Styling**: Tailwind CSS for utility-first styling, complemented by shadcn/ui for components.
- **State Management**: Zustand for global and local state, including complex order management (modifiers, discounts), kitchen order queues, and authentication.
- **Data Fetching**: TanStack Query for server state management.
- **Offline-First Architecture**:
    - **IndexedDB**: Utilizes Dexie.js for local data persistence (orders, sync queue).
    - **Sync Queue System**: Manages pending operations (create, update, delete) with local IDs, retries, and error handling.
    - **Automatic Sync Service**: Background synchronization with Firebase when online, including online/offline detection.
    - **User Feedback**: Visual indicators for connection status and pending sync count.

## External Dependencies
- **Firebase**:
    - **Realtime Database**: For real-time order synchronization, order persistence (items, modifiers, discount, pricing breakdown), and menu item storage.
    - **Authentication**: For admin login (though PIN-based, Firebase Auth is configured).
    - **Firestore**: Configured but not actively used in the provided details.
    - **Storage**: Configured but not actively used in the provided details.
- **Dexie.js**: Wrapper for IndexedDB, enabling offline data persistence.
- **Wouter**: Client-side routing library.
- **Framer Motion**: Animation library.
- **Lucide React**: Icon library.
- **shadcn/ui**: UI component library.
- **Zustand**: State management library.
- **TanStack Query**: Server state management library.
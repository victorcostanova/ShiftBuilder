# ShiftBuilder Angular Application

This is the Angular version of the ShiftBuilder application, migrated from the original HTML/JavaScript/CSS structure.

## Project Structure

```
angular-app/
├── src/
│   ├── app/
│   │   ├── components/          # Angular components for each page
│   │   │   ├── login/          # Login page component
│   │   │   ├── register/       # Registration page component
│   │   │   ├── worker-home/    # Worker dashboard component
│   │   │   ├── admin-home/     # Admin dashboard component
│   │   │   ├── add-shift/      # Add shift form component
│   │   │   ├── edit-profile/   # Edit profile component
│   │   │   ├── all-shifts/     # All shifts view component
│   │   │   ├── all-workers/    # All workers view component
│   │   │   ├── edit-worker-profile/ # Edit worker profile component
│   │   │   └── filtershifts-worker/ # Filter shifts component
│   │   ├── services/           # Angular services
│   │   │   ├── auth.ts         # Authentication service
│   │   │   ├── utils.ts        # Utility functions service
│   │   │   └── shift.ts        # Shift management service
│   │   ├── app.routes.ts       # Application routing
│   │   ├── app.config.ts       # App configuration
│   │   └── app.ts              # Main app component
│   ├── styles.css              # Global styles (migrated from original CSS)
│   └── index.html              # Main HTML file
├── package.json
└── angular.json
```

## Features Migrated

✅ **Completed:**

- Angular project setup with routing
- CSS styles migrated to global styles
- Login component with authentication service
- Register component with validation service
- Authentication service (migrated from auth.js)
- Utils service (migrated from utils.js)
- Component structure for all pages

🔄 **In Progress:**

- Remaining component implementations
- Shift management service
- Complete component functionality

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
cd angular-app
npm install
```

### Development Server

```bash
npm start
# or
ng serve
```

### Build

```bash
npm run build
# or
ng build
```

## Migration Notes

The application maintains the same functionality as the original HTML/JavaScript version but now uses:

- **Angular Components** instead of separate HTML files
- **Angular Services** instead of JavaScript modules
- **Angular Routing** instead of manual page navigation
- **TypeScript** for type safety
- **Angular Forms** for form handling
- **Dependency Injection** for service management

All original CSS styles have been preserved and are now in the global `styles.css` file.

## Original Structure Preserved

The original HTML, JavaScript, and CSS files remain in the parent directory for reference:

- `html/` - Original HTML files
- `javascript/` - Original JavaScript files
- `styles/` - Original CSS files

This Angular version provides the same user experience with improved maintainability and modern Angular practices.

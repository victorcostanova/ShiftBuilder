# Manage My Shifts - Separated Branches

This project has been divided into 5 independent branches, each containing a specific functionality of the system.

## 📁 Branch Structure

### SBJV-1: Registration Page

- `register.html` - Registration page
- `register.js` - Registration logic
- `utils.js` - Utility functions for registration
- `styles.css` - Styles for registration

### SBJV-2: Login Page

- `index.html` - Login page
- `auth.js` - Authentication logic
- `utils.js` - Utility functions for login
- `styles.css` - Styles for login

### SBJV-3: Home Page

- `home.html` - Main page
- `home.js` - Home page logic
- `utils.js` - Utility functions for home
- `styles.css` - Complete styles

### SBJV-4: Add Shift Page

- `add-shift.html` - Add/edit shift page
- `shift-form.js` - Form logic
- `utils.js` - Utility functions for shifts
- `styles.css` - Styles for forms

### SBJV-5: Edit Profile Page

- `edit-profile.html` - Edit profile page
- `edit-profile.js` - Editing logic
- `utils.js` - Utility functions for profile
- `styles.css` - Styles for forms

## 🔄 How to Combine All Branches

To rebuild the complete project, follow these steps:

### 1. Copy HTML Files

```bash
# Copy all HTML files to main directory
cp branches/SBJV-1/register.html .
cp branches/SBJV-2/index.html .
cp branches/SBJV-3/home.html .
cp branches/SBJV-4/add-shift.html .
cp branches/SBJV-5/edit-profile.html .
```

### 2. Copy JavaScript Files

```bash
# Copy all JS files to main directory
cp branches/SBJV-1/register.js .
cp branches/SBJV-2/auth.js .
cp branches/SBJV-3/home.js .
cp branches/SBJV-4/shift-form.js .
cp branches/SBJV-5/edit-profile.js .
```

### 3. Create Complete utils.js

```bash
# The complete utils.js should contain all functions from all branches
# Combine all utility functions into a single file
```

### 4. Copy Complete styles.css

```bash
# Use the styles.css from SBJV-3 branch (most complete)
cp branches/SBJV-3/styles.css .
```

## 📋 Verification Checklist

After combining all branches, verify that:

- [ ] All HTML files are in main directory
- [ ] All JavaScript files are in main directory
- [ ] `utils.js` contains all necessary functions
- [ ] `styles.css` contains all styles
- [ ] Links between pages work correctly
- [ ] Each page's functionalities are operational

## 🚀 Complete Features

When all branches are combined, the system will have:

1. **User Registration** - Complete validation and saving
2. **Login/Authentication** - Sessions and security
3. **Home Page** - Listing, search and statistics
4. **Shift Management** - Add, edit and delete
5. **Profile Editing** - User data updates

## 🔧 Dependencies

- Modern browser with localStorage support
- JavaScript enabled
- No external dependencies

## 📱 Responsiveness

All pages are responsive and work on:

- Desktop
- Tablet
- Smartphone

## 🎯 Objective

This separation allows:

- Independent development of each functionality
- Isolated testing of each module
- Easier maintenance
- Code reusability
- Better project organization

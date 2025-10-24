# Manage My Shifts - Shift Tracking Application

A full-stack client-side application for tracking work shifts and calculating earnings. Built with HTML, CSS, and JavaScript using localStorage for data persistence.

## Features

### User Management

- **User Registration** with comprehensive validation

  - Email validation
  - Username requirements (min 6 chars, letters, numbers, special character)
  - Password requirements (min 6 chars)
  - Name validation (min 2 letters)
  - Age restriction (18-65 years)

- **User Authentication**

  - Secure login system
  - 60-minute session management
  - Password reset (deletes all user data)

- **Profile Management**
  - Edit user information
  - Update credentials
  - Username change support with data migration

### Shift Management

- **Add Shifts**

  - Date, start time, end time
  - Hourly wage tracking
  - Workplace selection
  - Unique shift names (slugs)
  - Optional comments/notes
  - Loading spinner during save

- **Edit Shifts**

  - Modify existing shift details
  - Prevent duplicate shift names
  - Preserve shift history

- **Delete Shifts**

  - Confirmation before deletion
  - Permanent removal from records

- **View Shifts**
  - Sortable table display
  - Automatic profit calculation
  - Date-based organization

### Search & Filter

- **Search by shift name** - Find shifts by name, workplace, or comments
- **Date range filtering** - Filter shifts between specific dates
- **Clear filters** - Reset all search criteria

### Statistics

- **Highest Earning Month** - Automatically calculated and displayed
- **Total Profit per Shift** - Real-time calculation based on hours worked and wage

### Responsive Design

- Mobile-friendly interface
- Tablet and desktop support
- Touch-optimized interactions

## File Structure

```
capstone_1/
├── index.html              # Login page (entry point)
├── register.html           # User registration
├── worker-home.html         # Main dashboard with shifts table
├── add-shift.html         # Add/edit shift form
├── edit-profile.html      # User profile editor
├── styles.css             # Main stylesheet (responsive)
├── utils.js               # Utility functions and validation
├── auth.js                # Login functionality
├── register.js            # Registration functionality
├── worker-home.js          # Home page and shift display
├── shift-form.js          # Shift creation/editing
├── edit-profile.js        # Profile editing
└── README.md              # Documentation
```

## How to Use

### Getting Started

1. **Open the Application**

   - Open `index.html` in a web browser
   - No server required - runs entirely in the browser

2. **Register a New Account**

   - Click "Register here" on the login page
   - Fill in all required fields:
     - Valid email address
     - Username (min 6 chars with letters, numbers, and special char)
     - Password (min 6 chars) and confirmation
     - First and last name (min 2 letters each)
     - Birth date (age must be 18-65)
   - Click "Register" button

3. **Login**
   - Enter your username and password
   - Click "Login" button
   - Session lasts 60 minutes

### Managing Shifts

1. **Add a Shift**

   - Click the "+ Add Shift" button on the home page
   - Fill in shift details:
     - Date of the shift
     - Start and end times
     - Hourly wage
     - Workplace (dropdown)
     - Unique shift name
     - Optional comments
   - Click "Save Shift"

2. **Edit a Shift**

   - Click the "Edit" button on any shift in the table
   - Modify the shift details
   - Click "Update Shift"

3. **Delete a Shift**

   - Click the "Delete" button on any shift
   - Confirm the deletion

4. **Search Shifts**
   - Use the search box to find shifts by name
   - Select date range using "From Date" and "To Date"
   - Click "Search" to apply filters
   - Click "Clear" to reset filters

### Viewing Statistics

- The "Highest Earning Month" card displays:
  - Month with the highest total earnings
  - Total amount earned in that month

### Updating Profile

1. Click "Edit Profile" in the navigation menu
2. Modify your information (same validation as registration)
3. Click "Update Profile"
4. Changes are saved immediately

### Logging Out

- Click "Logout" in the top menu or footer
- Confirms logout action
- Clears session and returns to login page

### Password Reset

- On login page, click "Forgot password?"
- **WARNING**: This will delete all your data
- Enter username and confirm
- Register again with new password

## Technical Details

### Data Storage

All data is stored in **browser localStorage**:

- `users`: User account information
- `shifts_{username}`: User-specific shift records
- `userSession`: Active session data (expires after 60 minutes)

### Validation Rules

**Username**:

- Minimum 6 characters
- Must contain letters, numbers, and special characters

**Password**:

- Minimum 6 characters
- No complexity requirements beyond length

**Names**:

- Minimum 2 letters
- Letters only (no numbers or special characters)

**Age**:

- Must be between 18 and 65 years old

**Email**:

- Must be valid email format

**Shift Times**:

- End time must be after start time
- Hours and profit calculated automatically

**Shift Name (Slug)**:

- Must be unique per user
- Can contain any characters
- Used as identifier for editing/deleting

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires localStorage support

## Development Timeline

As per specification:

- Register page: 1 day ✅
- Login page: 0.5 day ✅
- Edit profile page: 0.5 day ✅
- Add Shift page: 1 day ✅
- Home page: 2 days ✅
- **Total: 5 days** ✅

## Security Notes

⚠️ **Important**: This is a client-side only application using localStorage:

- Data is stored locally in the browser
- No server-side validation or encryption
- Data can be cleared by browser cache clearing
- Not suitable for production use without backend integration
- Session expires after 60 minutes of inactivity

## Future Enhancements

Potential improvements for production:

- Backend API integration
- Encrypted password storage
- Database persistence
- Export shifts to CSV/PDF
- Multiple workplace management
- Salary projections
- Tax calculations
- Data backup/restore
- Multi-language support

## Support

For issues or questions, refer to the project specification document or contact your instructor.

---

**Good Luck with your project submission!** 🚀

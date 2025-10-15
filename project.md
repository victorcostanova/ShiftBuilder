FIRST PROJECT: FULL STACK SHIFT BUILDER EXERCISE
SPECIFICATION DOCUMENT
Introduction:
Application Name: "Manage My Shifts"
Case Study
A client approached you with a request to build an app to track the employees’
work hours. The workplace is required to keep track of an employee's monthly
working hours for the purpose of calculating wages, collecting fees, calculating
expenses, etc. The main request is to develop an app that would allow an
employee to keep track of his/her work hours and calculate how much money
they should receive each month, according to the amount of work hours they
worked.
The purpose of the app is to provide a clear and simple solution for employees
who need to submit their hourly report for their monthly salary.
Main goals of the Manage My Shifts app
● Managing my shifts in my various jobs.
● Management of hours by workplace.
● Generate reports and statistics according to various filters.
● Create a responsive page suitable for desktop and cell phones screens.
The app will work in the following environments
● Internet environment.
● Suitable for tablets and smartphones.
Architecture and Technological Requirements
integrate Manage My Shifts - Client only without server side data.
● Infrastructures: html, css, js
● Database: localStorage
● Internationalisation: English
● Security: local storage - the data will be saved to localstorage
Flowchart Application usage
Login screen (1 day)
When the user opens the app, he enters the login page with a link to a password
registration screen that will be saved to local storage. The user will be asked to
put user information that will be saved to local storage for 60 minutes.
Login page content
● User name input - at least 6 characters - will be saved in local storage.
● A password (at least 6 characters long) will be saved to local storage.
● Login button - after clicking the login button, the data will be saved to
local storage. If no appropriate message is displayed.
● There should be a button to confirm registration.
Error message types
● Username and password are too short.
● A username must contain letters, numbers and a character that is neither
a letter nor a number.
● If the input passes successfully then the data will be saved to local
storage.
Contents of a registration page (1 day)
● Email - An email field for an email format.
● Username - (at least 6 characters long) will be saved to local storage.
● Password - (at least 6 characters long) will be saved to local storage.
● Password Confirmation - must be the same as the first inserted password.
● First name - including at least 2 letters.
● Last name - including at least 2 letters.
● Birth Date - the derived age must be between 18 and 65.
● Register button - Clicking on the register checks that all conditions are
true and the data will be saved to local storage.
● After a successful registration, the user will go to the home page, which
includes a top bar menu.
If the user forgets the password, he can reset it. But resetting the password at
this point will delete all user data.
Home Page Contents (2 days)
A header that includes the company logo.
● Top bar menu that will contain
○ My Shifts - Displays a list of all shifts and a + button to add a shift.
○ A table with all the shifts will be displayed. Clicking on a shift will
give you the. option to edit the shift details.
○ Editing a profile - Ability to edit the profile.
○ The right part of the item will display Hello - Username.
○ Log out.
● Footer contain
○ Menu bar
● The body of the homepage will contain
○ Search options according to two parameters
i. shift
ii. from date to date
○ A table that shows all the shifts with the following column names
i. date
ii. start time
iii. end time
iv. hourly wage
v. shift place
vi. total profit per shift
○ At the bottom of the table will be a presentation of the month in
which you earned the highest earnings.
Page Content Adding a Shift (1 days)
● Page Content Adding a Date Shift - Date Selection Button.
● Start time - Start time selection button.
● End time - End time selection button.
● Hourly wage - textbox.
● Workplace - dropdown list.
● Shift slug (unique name) - Each shift has a unique name. The user will be
notified if the name already exists, and the user will have to choose a new
name.
● Comments - text area
● Save button - After pressing the save button there will be a rotating
progress bar. The data is saved to local storage.
Profile Editing Page (1 day)
On this page the user will be able to edit his details
The page will include the following
● The following fields with the same validation as the registration page:
○ email
○ username
○ password
○ password Confirmation
○ first name
○ last name
○ birth date
● Update button - Clicking on the update checks that all conditions are true
and the data will be saved to localstorage.
● After a successful update, the user will go to the home page.
The development will be done in the following order:
● Register page (1 day)
● Login page (1/2 day)
● Edit profile page (1/2 day)
● add Shift page 1 day
● Home page 2 days
● Total: 5 days
Upon completion please submit the project in the LMS for us to review.
Good Luck!
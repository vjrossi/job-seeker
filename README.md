# Job Seeker Helper

Job Seeker Helper is a React-based web application designed to assist job seekers in tracking and managing their job applications. It provides a user-friendly interface for adding, viewing, and updating job application statuses, as well as generating simple reports.

## Features

- Add new job applications
- View and edit existing applications
- Update application statuses
- Filter and sort applications
- Generate basic reports
- Data persistence using IndexedDB
- Responsive design for desktop and mobile use

## Technologies Used

- React
- TypeScript
- Bootstrap
- IndexedDB for local storage

## Getting Started

### Prerequisites

- Node.js (version 12 or higher)
- npm (usually comes with Node.js)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/job-seeker-helper.git
   ```

2. Navigate to the project directory:
   ```
   cd job-seeker-helper
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

1. Add a new job application by clicking the "Add New Application" button.
2. View all your applications on the main dashboard.
3. Update application statuses by clicking the "Progress" button next to each application.
4. Use the filter and sort options to organize your applications.
5. View basic reports in the Reports section.

## Deployment

This app is deployed using GitHub Pages. To deploy your own version:

1. Update the `homepage` field in `package.json` with your GitHub Pages URL.
2. Run `npm run deploy` to build and deploy the app.

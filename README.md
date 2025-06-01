# ENTNT Equipment Rental Management Dashboard

A comprehensive web application for managing equipment rentals, inventory, and maintenance.

## Live Demo
[https://incandescent-squirrel-48fe8e.netlify.app/login/]

## Features

### User Authentication
- Role-based authentication (Admin, Staff, Customer)
- Login functionality with session persistence via localStorage
- Role-based access control throughout the application

### Equipment Inventory Management
- Complete CRUD operations for equipment items
- Detailed view pages for each equipment
- Equipment status tracking (Available, Rented, Maintenance, Retired)

### Rental Orders Management
- Create and manage rental orders
- Filter rentals by status, equipment, and customer
- Update rental order status with role-based permissions

### Maintenance Records Management
- Schedule and track equipment maintenance
- View maintenance history per equipment
- Update maintenance status through the lifecycle

### Calendar View
- Monthly and weekly views of scheduled rentals
- Interactive interface to view rentals on specific days
- Visual indicators for days with scheduled rentals

### Notification Center
- Real-time notifications for system events
- Dismissable notifications with read/unread status
- Categorized notifications by type

### KPI Dashboard
- Equipment status metrics
- Rental trends visualization
- Upcoming maintenance tracking
- Overdue rentals monitoring

### Responsive Design
- Fully responsive across all device sizes
- Optimized mobile layout for on-the-go access
- Clean, modern interface with subtle animations

## Tech Stack

- React (functional components)
- TypeScript
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Chart.js for data visualization
- localStorage for data persistence

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/heyrajveer/equipment-rental-dashboard.git
   ```

2. Navigate to the project directory
   ```
   cd entnt-equipment-rental
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to http://localhost:5173

### Demo Credentials

The application comes with pre-configured demo accounts:

| Role     | Email                | Password  |
|----------|----------------------|-----------|
| Admin    | admin@entnt.in       | admin123  |
| Staff    | staff@entnt.in       | staff123  |
| Customer | customer@entnt.in    | cust123   |

## Project Structure

```
src/
├── components/            # Reusable UI components
│   ├── Authentication/    # Login, authentication components
│   ├── Dashboard/         # KPIs, charts, statistics
│   ├── Equipment/         # Equipment management components
│   ├── Layout/            # Page layout and navigation
│   ├── Maintenance/       # Maintenance record components
│   ├── Notifications/     # Notification components
│   └── Rentals/           # Rental management components
├── contexts/              # React Context providers
├── pages/                 # Top-level page components
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── App.tsx                # Main application component
└── main.tsx               # Application entry point
```

## Local Storage Schema

The application uses the following localStorage structure:

- `users` - User accounts with roles
- `equipment` - Equipment inventory
- `rentals` - Rental orders
- `maintenance` - Maintenance records
- `notifications` - System notifications
- `currentUser` - Current logged-in user session

## Architecture Decisions

1. **Frontend-Only Approach**:
   - All data is simulated using localStorage
   - CRUD operations are handled through utility functions

2. **State Management**:
   - Context API for global state
   - Separate contexts for different data domains

3. **Responsive Design**:
   - Mobile-first approach with Tailwind CSS
   - Adaptive layout based on viewport size

4. **Role-Based Access**:
   - Component-level permission checks
   - Conditional rendering based on user role

## Known Limitations

1. **Data Persistence**: 
   - Data is only stored in the browser's localStorage
   - Clearing browser data will reset the application

2. **Performance**:
   - Large datasets may impact performance due to localStorage limitations

3. **Authentication**:
   - Authentication is simulated and not secure for production use

## Future Enhancements

1. Integration with a real backend API
2. Advanced reporting and analytics features
3. User registration and profile management
4. File upload for equipment images and documents
5. Payment processing integration
6. Email notifications for rental events
7. Dark mode theme option


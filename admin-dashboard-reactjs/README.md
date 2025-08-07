# Volcanion Admin Dashboard

A modern ReactJS admin dashboard for managing Volcanion microservices ecosystem.

## Features

- 🎯 **Dashboard Overview** - System metrics and quick insights
- 👥 **User Management** - Manage users, roles, and permissions
- 🚀 **Service Management** - Monitor and control microservices
- 📊 **Analytics** - Performance monitoring and analytics
- ⚙️ **Settings** - System configuration and preferences

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Chart.js** for data visualization
- **Axios** for API calls

## Prerequisites

Before running this application, make sure you have:

- Node.js (version 14 or higher)
- npm or yarn package manager

## Installation

1. Install Node.js from [nodejs.org](https://nodejs.org/)

2. Clone the repository and navigate to the project directory:
   ```bash
   cd admin-dashboard-reactjs
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Usage

1. Start the development server:
   ```bash
   npm start
   ```

2. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

3. The page will reload if you make edits and you will see any lint errors in the console.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Main layout component
├── pages/              # Page components
│   ├── Dashboard/      # Dashboard overview
│   ├── Users/          # User management
│   ├── Services/       # Service management
│   ├── Analytics/      # Analytics and monitoring
│   └── Settings/       # System settings
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles
```

## Features Overview

### Dashboard
- System overview with key metrics
- Quick access to important functions
- Real-time status indicators

### User Management
- View and manage user accounts
- Role-based access control
- User activity monitoring

### Service Management
- Monitor microservice status
- Start/stop/restart services
- View service logs and metrics

### Analytics
- Performance monitoring dashboards
- System resource usage
- API analytics and metrics

### Settings
- System configuration
- Database settings
- Security preferences

## Development

This project was created using Create React App with TypeScript template.

### Adding New Features

1. Create new components in the `src/components` directory
2. Add new pages in the `src/pages` directory
3. Update routing in `App.tsx`
4. Add navigation items in `Layout.tsx`

### Styling

The project uses Material-UI for consistent styling. Custom themes can be configured in `App.tsx`.

## Deployment

To deploy the application:

1. Build the production version:
   ```bash
   npm run build
   ```

2. The `build` folder contains the optimized production build ready for deployment.

## API Integration

The dashboard is designed to work with the Volcanion microservices backend. Update the API endpoints in the service files to connect to your backend services.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is part of the Volcanion microservices ecosystem.

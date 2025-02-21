# Production-Ready Node.js Backend Setup

This repository provides a robust and scalable **Node.js backend setup** for production deployment. It integrates **TypeScript**, **Docker**, and **best practices** for code quality, security, and maintainability.

## Features

- ✅ **TypeScript Support** - Ensures type safety and better development experience.
- ✅ **Dockerized Deployment** - Pre-configured for containerized environments.
- ✅ **Environment Configuration** - Uses `.env` for secure environment variable management.
- ✅ **Code Quality Tools** - Includes ESLint, Prettier, and Husky for consistent coding standards.
- ✅ **Git Hooks** - Enforces commit messages and pre-commit checks with Husky.
- ✅ **Hot Reloading** - Uses Nodemon for automatic server restarts in development.
- ✅ **Testing Ready** - Structured test setup to ensure code reliability.
- ✅ **PM2 Support** - Process management for scalable deployment.
- ✅ **Security Enhancements** - Uses `helmet` for security headers and `rate-limiter-flexible` for DDoS protection.
- ✅ **Logging** - Implements `winston` for structured logging with daily log rotation.
- ✅ **Database & Migrations** - Uses `Mongoose` for MongoDB and `ts-migrate-mongoose` for schema migrations.
- ✅ **Time & Localization** - Includes `dayjs`, `countries-and-timezones`, and `libphonenumber-js` for date/time handling and phone number validation.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (>= 16.x)
- **Docker** (optional, for containerized deployment)
- **PM2** (optional, for production process management)
- **MongoDB** (if using a local database)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/production-backend.git
   cd production-backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Copy environment variables:
   ```sh
   cp .env.example .env
   ```
   Configure the `.env` file as needed.

### Running the Server

#### Development Mode

Start the server with Nodemon:
```sh
npm run dev
```

#### Production Mode (Without Docker)

Start the server using PM2:
```sh
npm run start
```

#### Running with Docker

Build and run the container:
```sh
docker-compose up --build
```

### Database Migrations

#### Run Migrations in Development Mode
```sh
npm run migrate:dev
```

#### Run Migrations in Production Mode
```sh
npm run migrate:prod
```

### Testing

Run unit tests:
```sh
npm test
```

## Project Structure

```
├── src/                # Application source code
│   ├── controllers/    # API controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── index.ts        # Entry point
├── test/               # Unit and integration tests
├── config/             # Configuration files
├── public/             # Public assets
├── docker/             # Docker configuration
├── script/             # Migration and setup scripts
├── .env.example        # Environment variables example
├── package.json        # Project dependencies and scripts
└── README.md           # Documentation
```

## Contributing

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the ISC License. See `LICENSE` for details.

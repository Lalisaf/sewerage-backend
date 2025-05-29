# Sewerage Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your environment variables.

2. Install dependencies:

```bash
npm install
```

3. Run the development server with hot reload:

```bash
npm run dev
```

4. The server will start on the port specified in `.env` (default 5000).

## Environment Variables

- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port (default 5432)
- `DB_SSL`: Use SSL for DB connection (`true` or `false`)
- `EMAIL_HOST`: SMTP host for email service
- `EMAIL_PORT`: SMTP port
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password
- `PORT`: Server port
- `NODE_ENV`: Environment (development, production, etc.)

## Notes

- The `config/config.json` file has been renamed to avoid conflicts with environment variable usage.
- The backend uses Sequelize ORM with PostgreSQL.
- Socket.io is configured for real-time communication.

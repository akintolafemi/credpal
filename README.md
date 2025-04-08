# CredPal Wallet Operations Project

This project is built using NestJS, TypeORM, MySQL, Redis for caching, and BullMQ for queuing wallet operations.

## Technologies Used

- **NestJS:** A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeORM:** An ORM that can run in NodeJS and browser and can be used with TypeScript and JavaScript (ES5/ES6/ES7/ES8).
- **MySQL:** A widely used open-source relational database management system.
- **Redis:** An open-source, in-memory data structure store, used as a database, cache and message broker.
- **BullMQ:** A robust queue system for Node.js backed by Redis.
- **Swagger:** For API documentation.

## Setup Instructions

To set up the project, follow these steps:

1.  **Create MySQL Database:**

    - Create a MySQL database named `credpal_db`.

2.  **Configure Environment Variables:**

    - Copy the `env.sample` file to youur `.env` in the root directory of the project.
    - Update the `.env` file with your specific configurations, including:
      - MySQL database connection details.
      - Redis connection details.
      - Any other required environment variables.

3.  **Install Redis:**

    - Install and configure a Redis server on your local machine or server.

4.  **Get Exchange Rate API Key:**

    - Create an account on [https://www.exchangerate-api.com/](https://www.exchangerate-api.com/) to obtain an API key.
    - Add the API key to your `.env` file.

5.  **Documentation:**
    - Api documentation is available at [http://localhost:${PORT}/documentation] when project is started

## Running the Project

To run the project in development mode, execute the following command:

```bash
npm run start:dev
```
# credpal

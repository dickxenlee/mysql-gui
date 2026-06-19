<img src="assets/mysql-gui-logo.png" width=75 height=75 align=left />

# MySQL GUI

[![npm version](https://img.shields.io/npm/v/mysql-gui.svg?color=success)](https://www.npmjs.com/package/mysql-gui)
[![Known Vulnerabilities](https://snyk.io/test/github/kshashikumar/mysql-gui/badge.svg)](https://snyk.io/test/github/kshashikumar/mysql-gui)
[![GitHub stars](https://img.shields.io/github/stars/kshashikumar/mysql-gui.svg?style=social)](https://github.com/kshashikumar/mysql-gui/stargazers)


**MySQL GUI** is a web-based Graphical User Interface designed to streamline database management and accelerate development workflows for MySQL, with planned future support for all major relational databases. This tool enhances user interaction with databases, allowing developers to manage data more efficiently.

## Features

- **Connect to Local/Remote Databases**  
  Easily connect to databases on your local machine or remote servers.
- **CRUD Operations**  
  Perform Create, Read, Update, and Delete actions on databases and tables.

- **Multi-Tab Support**  
  Work across multiple databases or queries simultaneously, with a smooth and responsive interface.

- **Query Editor with Autocompletion**  
  Write queries faster with intelligent autocompletion and syntax highlighting.

- **Improved Pagination**  
  Navigate large datasets with optimized pagination.

- **Rich User Interface**  
  A dynamic and user-friendly interface designed to enhance productivity.

- **Dynamic Result Grid**  
  Visualize query results with a responsive, grid-based layout.

- **Basic Authentication**  
  Optional authentication for added security when running on remote servers.

- **Clipboard Copy**  
  Quickly copy cell data with a single click.

- **Query History**  
  Every executed query is recorded with its database, status, row count, and execution time, accessible through a dedicated History API and panel.

- **Data Export (CSV/JSON)**  
  Export the currently displayed result rows to a CSV or JSON file directly from the result grid, entirely on the client side.

- **AI Integration**  
  Leverage OpenAI and Google Gemini for generating intelligent SQL queries. Talk to your selected Database

## Prerequisites

- **Node.js 16.0.0 or above**  
  Install Node.js from the [official downloads page](https://nodejs.org/). Alternatively, manage versions dynamically with tools like nvm on macOS, Linux, or WSL.

- **npm 8.0.0 or above**  
  npm is bundled with Node.js. To upgrade, use:
  ```bash
  npm i -g npm
  ```
- **MYSQL Server**
  A running MySQL server instance

## Installation

MYSQL GUI can be installed in multiple ways:

### From npm

1. Install globally:
   ```bash
   npm install -g mysql-gui
   ```
2. Run the application:
   ```bash
   mysql-gui
   ```

### From npm

1. Clone the repository:
   ```bash
   git clone https://github.com/kshashikumar/mysql-gui.git
   ```
2. Navigate into the directory:
   ```bash
   cd mysql-gui
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm run start
   ```

### From Docker Hub

You can run MYSQL GUI using Docker for easy setup and deployment. Follow the steps below to get started:

### Running with Docker Compose

To run MYSQL GUI with Docker Compose, use the following `docker-compose.yml` file:

```yaml
version: "3"

services:
  mysql-gui:
    container_name: "mysql-gui"
    image: shashikumarkasturi/mysql-gui
    restart: always
    ports:
      - "5000:5000"
    environment:
      - MYSQL_URL=mysql://root:root@host.docker.internal:3306
      - AI_MODEL=<Model Name> #gpt-4, gpt-3.5-turbo, text-davinci-003, gemini-1.5-flash, gemini-pro, gemini-lite
      - AI_API_KEY=<API Key>
```

### Steps to Run

1. Create a `docker-compose.yml` file in your project directory and paste the configuration above.
2. Start the container using the following command:

```bash
docker-compose up -d
```

This command will start MYSQL GUI in detached mode, running in the background. 3. Once the container is running, open your browser and navigate to <http://localhost:5000> to use MYSQL GUI. 4. To stop the container, run:

```bash
docker-compose down
```

## AI Integration

MYSQL GUI integrates OpenAI and Google Gemini to generate intelligent SQL queries with the following features:

### Setting Up AI Integration

To enable AI-powered prompt querying, you need to set up the API keys for OpenAI or Google Gemini:

1. **Obtain an API Key**
   - For OpenAI: Visit OpenAI's platform and generate an API key.
   - For Google Gemini: Follow Google's platform to obtain an API key (free tier provides 15 requests per minute).
2. **Add the API Key to Your Environment Variables**
   In the root directory of your project, create a .env file (or update it if it exists) and add the following lines:

```bash
AI_MODEL=<MODEL_NAME>  # e.g., gpt-4 or gemini-1.5-flash
AI_API_KEY=<YOUR_API_KEY>
```

3. **Restart MYSQL GUI**
   Restart the application to activate AI integration.

### Using AI Prompt Querying

- Enable AI from the user interface using the AI toggle button.
- Write a natural language query in the input box and click on AI Prompt button, AI will generate the corresponding SQL query.
- The AI can join tables, generate aggregated queries, and suggest optimal SQL syntax based on the database you selected.

**Example Workflow:**

1. Write a query prompt:
   `Find the average salary of employees in each department.`
2. The AI generates the SQL:

```bash
SELECT Department, AVG(Salary) AS AvgSalary FROM employeerecords GROUP BY Department;
```

## Query History & Export

MySQL GUI records every executed query in an in-memory history store and exposes it through a REST API. Each record captures the database, the query text, status (success/error), affected/returned row count, execution time in milliseconds, and the source (`manual` or `ai`).

> **Note:** The history store is held in server memory and is capped at the **100 most recent** queries. The oldest entry is dropped automatically when a new one is added, and the history is cleared when the server restarts.

### History API

| Method   | Endpoint              | Description                          |
| -------- | --------------------- | ------------------------------------ |
| `GET`    | `/api/mysql/history`  | Retrieve all recorded query records. |
| `DELETE` | `/api/mysql/history`  | Clear all recorded query records.    |

**Retrieve history:**

```bash
curl http://localhost:5000/api/mysql/history
```

```json
{
  "history": [
    {
      "id": "uuid-v4",
      "timestamp": "2025-04-25T10:30:00.000Z",
      "database": "mydb",
      "query": "SELECT * FROM users WHERE id = 1",
      "status": "success",
      "affectedRows": null,
      "totalRows": 42,
      "executionTimeMs": 18,
      "source": "manual"
    }
  ]
}
```

Records are returned in reverse-chronological order (newest first).

**Clear history:**

```bash
curl -X DELETE http://localhost:5000/api/mysql/history
```

```json
{ "message": "Query history cleared successfully" }
```

### Exporting Results

When a query returns rows, the result grid toolbar shows **Export CSV** and **Export JSON** buttons. Clicking either downloads the currently displayed rows as a file. Exporting runs entirely in the browser — no extra request is sent to the server. CSV values are safely quoted so commas, quotes, and line breaks in the data do not corrupt the file.

## Security Note

- Confidentiality: Never expose your .env file containing the API key.
- **Secure Connections**: Ensure your MySQL connections and API keys are used securely, especially in production.

### Environment Variables

- **MYSQL_URL**: Replace `mysql://root:root@host.docker.internal:3306` with the URL of your MySQL database if it's hosted elsewhere or has different credentials.

## Usage

By default, MYSQL GUI launches with the following configuration:

- **Database URL (-u)**: `mysql://root:root@localhost:3306`
- **Port (-p)**: `5000`

The app will be accessible at `http://localhost:5000`.

To connect to a different MySQL server, specify the database URL as follows:

```bash
mysql-gui -u mysql://<username>:<password>@<host>:<dbport>
```

### Options

- **-u**: Specify the database URL to connect to a MySQL instance.
- **-p**: Port number for MYSQL GUI to listen on
- **--model**: Specify the AI model to be used
  `(supporting model: gpt-4, gpt-3.5-turbo, text-davinci-003, gemini-1.5-flash, gemini-pro, gemini-lite)`
- **--apikey**: Specify the API key for the chosen AI model.

## Basic Authentication (Optional)

Protect data with basic authentication when running on remote servers.

1. Create a `.env` file in the root directory.
2. Add the following variables

```bash
USERNAME=<your_username>
PASSWORD=<your_password>
```

3. Restart the server.

To disable authentication, comment out or remove these variables from `.env` and restart the server.

## Upcoming Features

- **Multi-Relational DB Support**: PostgreSQL, MariaDB, SQLite3, Oracle, Amazon Redshift, and more.
- **Dynamic Filtering**: Filter data directly within result grids.
- **Result Limit Options**: Control the number of records displayed.
- **Enhanced AI Integration**: Leverage AI for complex query generation and analysis.

## Contributions

MYSQL GUI is open for **contributions**! If you have ideas for features, improvements, or bug fixes, feel free to submit a pull request or open an issue.

## Demo

![MYSQL-GUI](assets/mysql-gui-gif.gif)
![MYSQL-GUI-AI](assets/mysql-gui-ai-gif.gif)

## License

MYSQL GUI is distributed under the [MIT License](LICENSE). This license permits commercial use, modification, distribution, and private use, with the requirement to include the original copyright and license notice.

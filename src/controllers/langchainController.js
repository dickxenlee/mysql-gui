const { getAIModel } = require("../models/model");
const argv = require("minimist")(process.argv.slice(2));
const queryHistory = require("../store/queryHistory");

const initializeLLM = () => {
  const aiModel = argv.model || process.env.AI_MODEL || "GPT-4";
  const apiKey = argv.apikey || process.env.AI_API_KEY || "";
  if (!apiKey) {
    throw new Error(
      "OpenAI API key is missing. Please provide a valid API key"
    );
  }

  return getAIModel(aiModel, apiKey);
};

const generateMySQLQuery = async (dbMeta, databaseName, prompt, llm) => {
  const selectedDatabase = dbMeta.find((db) => db.name === databaseName);
  if (!selectedDatabase) {
    throw new Error(`Database "${databaseName}" not found.`);
  }

  // Extract table name from the prompt
  const promptMatch = prompt.match(/for (\w+) table/i);
  const requestedTable = promptMatch ? promptMatch[1] : null;

  let systemPrompt;

  if (requestedTable) {
    // Handle prompts with a specific table name
    const selectedTable = selectedDatabase.tables.find(
      (table) => table.name === requestedTable
    );

    if (!selectedTable) {
      throw new Error(
        `Table "${requestedTable}" does not exist in database "${databaseName}".`
      );
    }

    const tableColumns = selectedTable.columns
      .map((col) => col.column_name)
      .join(", ");

    systemPrompt = `
      You are an AI expert in generating MySQL queries. Here is the database schema:
    
      Database: ${databaseName}
      Table: ${requestedTable}
      Columns: ${tableColumns}
    
      Generate a valid single-line SQL query based on the user's request. Ensure:
        - Use table aliases for joins and subqueries.
        - Avoid duplicate column names by using unique aliases with AS.
        - Handle joins, subqueries, conditional logic, nulls, and aggregation as needed.
        - The query must support use as a subquery for paginated results, with uniquely named columns using AS.
        - Strictly follow valid SQL syntax with no double quotes, natural language, or line breaks. Output must be plain text.
    
      Example:
      Database: test
      Table: employee_records
      Columns: id, name, age, position
      Prompt: Select all employees whose age is greater than 30.
      Output: SELECT * FROM employee_records WHERE age > 30;
    
      User Request: ${prompt}
      Please provide only the query as output.
    `;
  } else {
    // Handle prompts without a specific table name (e.g., joining all tables)
    const schemaString = selectedDatabase.tables
      .filter((table) => table.columns && table.columns.length > 0) // Ensure valid tables
      .map((table) => {
        const columns = table.columns.map((col) => col.column_name).join(", ");
        return `Table: ${table.name}, Columns: [${columns}]`;
      })
      .join("\n");

    if (!schemaString) {
      throw new Error(
        `No tables with valid columns found in database "${databaseName}".`
      );
    }

    systemPrompt = `
        You are an AI expert in generating MySQL queries. Here is the database schema:
    
        Database: ${databaseName}
        ${schemaString}
    
        Generate a valid single-line SQL query based on the user's request. Ensure:
        - Use table aliases for joins and subqueries.
        - Avoid duplicate column names by using unique aliases with AS.
        - Handle joins, subqueries, conditional logic, nulls, and aggregation as needed.
        - The query must support use as a subquery for paginated results, with uniquely named columns using AS.
        - Strictly follow valid SQL syntax with no double quotes, natural language, or line breaks. Output must be plain text.
    
        Example:
        Database: test
        Tables and Columns:
          Table: employee_records, Columns: [id, name, age, position]
          Table: departments, Columns: [dept_id, dept_name]
        Prompt: Generate a query to join all tables.
        Output: "SELECT employee_records.id, employee_records.name, departments.dept_name FROM employee_records JOIN departments ON employee_records.dept_id = departments.dept_id;"
        
        User Request: ${prompt}
        Please provide only the query as output.
        `;
  }

  // Call the LLM with the system prompt
  const result = await llm.call([
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ]);

  const cleanedQuery = result.text.trim().replace(/^"|"$/g, "");

  return cleanedQuery; // Ensure output is clean
};

const executePrompt = async (req, res) => {
  const startTime = Date.now();
  try {
    const { dbMeta, databaseName, prompt } = req.body;

    if (!dbMeta || !databaseName || !prompt) {
      return res
        .status(400)
        .json({ error: "Database metadata, name, and prompt are required" });
    }

    const llm = initializeLLM();

    // Generate the SQL query
    const query = await generateMySQLQuery(dbMeta, databaseName, prompt, llm);

    try {
      queryHistory.addRecord({
        database: databaseName,
        query,
        status: "generated",
        executionTimeMs: Date.now() - startTime,
        source: "ai",
        prompt,
      });
    } catch (historyErr) {
      console.error("Failed to record AI query history:", historyErr);
    }

    res.status(200).json({ query });
  } catch (err) {
    console.error("Error generating query:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  executePrompt,
};

const express = require("express"); //importing express module
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3").verbose();

const moment = require("moment");

const formattedDate = moment(new Date()).format("DD-MM-YYYY"); // Format as YYYY-MM-DD
console.log(formattedDate);

const app = express(); //creating app instance
app.use(express.json()); // for parsing application/json

const dbPath = path.join(__dirname, "finance.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//categories APIs

app.post("/cat/", async (req, res) => {
  const { name, type } = req.body;
  const query = `INSERT INTO categories(name, type) 
   VALUES('${name}', '${type}');`;
  try {
    const dbResponse = await db.run(query);
    // res.send("category added successfully");
    const newCatId = dbResponse.lastID;
    res.send(`Created catagorie with id:${newCatId}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get("/categories/", async (req, res) => {
  const query = `SELECT * FROM categories;`;
  const dbResponse = await db.all(query);
  res.send(dbResponse);
});
//

//POST TRANSACTION API 1

app.post("/transaction/", async (req, res) => {
  const { type, category, amount, description } = req.body;

  const postTransactionsQuery = `INSERT INTO transactions (type, category, amount, date, description) 
  VALUES ('${type}', '${category}', ${amount}, '${formattedDate}', '${description}');`;

  try {
    const dbResponse = await db.run(postTransactionsQuery);
    const newId = dbResponse.lastID;
    res.status(201);
    res.send(`Transaction added successfully with id: ${newId}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Retrive all transaction API 2
app.get("/transactions", async (req, res) => {
  const allTransactionsQuery = `SELECT * FROM transactions;`;

  try {
    const dbResponse = await db.all(allTransactionsQuery);
    res.status(200);
    res.send(dbResponse);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving transactions" });
  }
});

//Retrieves a transaction by ID API 3
app.get("/transactions/:id", async (req, res) => {
  const id = req.params.id;

  const specificTransactionsQuery = `SELECT * FROM transactions WHERE id = ${id};`;

  try {
    const dbResponse = await db.get(specificTransactionsQuery);
    res.status(200);
    res.send(dbResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Updates a transaction by ID. API 4
app.put("/transactions/:id", async (req, res) => {
  const id = req.params.id;
  const { type, category, amount, description } = req.body;

  const updateTransactionsQuery = `UPDATE transactions SET 
  type = '${type}', 
  category  ='${category}', 
  amount = ${amount}, 
  date = '${formattedDate}', 
  description = '${description}'
  
  WHERE
      id = ${id};`;

  try {
    await db.run(updateTransactionsQuery);
    res.status(200);
    res.send("Transaction updated successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Deletes a transaction by ID. API 5
app.delete("/transactions/:id", async (req, res) => {
  const id = req.params.id;

  const specificTransactionsQuery = `SELECT * FROM transactions WHERE id = ${id};`;
  const getResponse = await db.get(specificTransactionsQuery);

  const deleteSpecificTransQuery = `
  DELETE FROM
    transactions
  WHERE
  id = ${id};
  `;

  try {
    if (getResponse !== undefined) {
      await db.run(deleteSpecificTransQuery);
      res.status(200);
      res.send("Transaction Deleted Successfully");
    } else {
      res.status(404).send("Your requested id doesn't exists");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get summary API 6

app.get("/summary", async (req, res) => {
  const summaryQuery = `SELECT
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
     (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
     SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) AS balance
    FROM transactions
    ;`;

  const dbResponse = await db.all(summaryQuery);
  res.send(dbResponse);
});

//get summary based on categoryAPI 7

app.get("/summarycategory/", async (req, res) => {
  const { category } = req.query;
  // console.log(category);

  const summaryQuery = `SELECT
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses
    FROM transactions
    WHERE category = '${category}'
    ;`;

  const dbResponse = await db.all(summaryQuery);
  res.send(dbResponse);
});

//get summary based on dates API 8
app.get("/filtersummary/", async (req, res) => {
  const { startDate, endDate } = req.query;

  const summaryQuery = `SELECT
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
     (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
     SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) AS balance
    FROM transactions
    WHERE date BETWEEN '${startDate}' AND '${endDate}'
    ;`;

  const dbResponse = await db.all(summaryQuery);
  res.send(dbResponse);
});

module.exports = app;

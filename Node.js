const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection URI
const uri = "your_mongodb_connection_string";
const client = new MongoClient(uri);

app.get("/process", async (req, res) => {
    const { query, searchType } = req.query;

    if (!query || !searchType) {
        return res.send("Invalid input.");
    }

    try {
        await client.connect();
        const db = client.db("Stock");
        const collection = db.collection("PublicCompanies");

        const filter =
            searchType === "ticker"
                ? { tickerSymbol: query.toUpperCase() }
                : { companyName: new RegExp(query, "i") };

        const results = await collection.find(filter).toArray();

        if (results.length === 0) {
            res.send("No results found.");
        } else {
            // Console output for debugging
            console.log("Search Results:", results);

            // Display results on a webpage (Extra credit)
            let html = "<h1>Search Results</h1><ul>";
            results.forEach(({ companyName, tickerSymbol, stockPrice }) => {
                html += `<li>${companyName} (${tickerSymbol}): $${stockPrice}</li>`;
            });
            html += "</ul>";
            res.send(html);
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred.");
    } finally {
        client.close();
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

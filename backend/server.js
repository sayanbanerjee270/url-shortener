const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
require("dotenv").config();

const Url = require("./models/Url");

const app = express();

app.use(cors());
app.use(express.json());


// Test route
app.get("/", (req, res) => {
    res.send("URL Shortener Backend is Running!");
});


// Create short URL
app.post("/shorten", async (req, res) => {

    try {

        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                message: "URL is required"
            });
        }

        // Generate unique short code
        const shortCode = nanoid(6);

        // Save URL in MongoDB
        const newUrl = new Url({
            originalUrl: url,
            shortCode: shortCode
        });

        await newUrl.save();

        const shortUrl = `http://localhost:${process.env.PORT}/${shortCode}`;

        res.json({
            originalUrl: url,
            shortUrl: shortUrl
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// Get all shortened URLs
app.get("/urls", async (req, res) => {

    try {

        const urls = await Url.find().sort({ createdAt: -1 });

        res.json(urls);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Could not fetch URLs"
        });
    }
});

// Redirect short URL
app.get("/:shortCode", async (req, res) => {

    try {
        const { shortCode } = req.params;

        const urlData = await Url.findOne({ shortCode });

        if (!urlData) {
            return res.status(404).send("Short URL not found");
        }

        // Increase click count
        urlData.clicks += 1;
        await urlData.save();

        // Redirect to original URL
        res.redirect(urlData.originalUrl);

    } catch (error) {

        console.error(error);

        res.status(500).send("Server error");
    }
});


// Start server after connecting to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB connected successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    })
    .catch((error) => {

        console.error("MongoDB connection failed:");
        console.error(error);

    });
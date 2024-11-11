// Import packages
const express = require("express");
const home = require("./routes/home");
const newsRoutes = require("./routes/news");
const cropRoutes = require("./routes/cropRoutes");
const MarketPriceRoutes = require("./routes/marketPriceRoutes");
const cors = require("cors");
require("dotenv").config();

// Middlewares
const app = express();
app.use(express.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply CORS for a specific origin
app.use(
    cors({
        origin: "http://localhost:8081", // The client origin that is allowed to access the resource
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
        credentials: true, // Allow credentials (cookies, auth headers)
    })
);

// Explicitly handle OPTIONS requests for preflight
app.options(
    "*",
    cors({
        origin: "http://localhost:8081", // Allow the client origin for preflight
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods for the preflight response
        credentials: true,
    })
);

app.get('/', (req, res) => res.send('Server is running'));

const myCropRoutes = require("./routes/UserCrop.routes");
app.use("/api/auth", myCropRoutes);

//problem in hosting
const userRoutes = require("./routes/userAutth.routes");
app.use("/api/auth", userRoutes);

const userFixedAssetsRoutes = require("./routes/fixedAsset.routes");
app.use("/api/auth", userFixedAssetsRoutes);

const userCurrentAssetsRoutes = require("./routes/currentAssets.routes");
app.use("/api/auth", userCurrentAssetsRoutes);

const publicforumRoutes = require("./routes/publicforum.routes");
app.use("/api/auth", publicforumRoutes);

// Routes
app.use("/home", home);
app.use("/api/news", newsRoutes);
app.use("/api/crop", cropRoutes);
app.use("/api/market-price", MarketPriceRoutes);

// connection
const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));



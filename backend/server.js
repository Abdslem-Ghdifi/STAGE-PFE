const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const colors = require("colors");
const morgan = require("morgan");
const QuestionRoute = require("./routes/QuestionRoute.js");
const userRoute = require("./routes/userRoute.js")
const demandeRoute = require('./routes/demandeRoute');
const contactRoute =require ("./routes/contactRoute");
dotenv.config();
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/question", QuestionRoute); 
app.use("/api/users",userRoute);
app.use("/api/contact",contactRoute);
// Utiliser les routes
app.use('/api/demandes', demandeRoute);
// Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected".bgGreen.white))
  .catch((err) => console.error(err));

// Démarrer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`.bgCyan.white));

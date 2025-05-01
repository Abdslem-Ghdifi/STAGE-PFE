// server.js (Complet avec gestion des fichiers statiques)
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const colors = require("colors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

// Routes

const QuestionRoute = require("./routes/QuestionRoute.js");
const userRoute = require("./routes/userRoute.js");
const demandeRoute = require("./routes/demandeRoute");
const contactRoute = require("./routes/contactRoute");
const adminRoute = require('./routes/adminRoute');
const formateurRoute = require('./routes/formateurRouter');
const expertRoute = require("./routes/expertRoute.js");
const formationRoute = require('./routes/formationRoute');
const categorieRoute = require("./routes/categorieRoute.js");
const suiviRoute = require("./routes/suiviRoute.js");



dotenv.config();
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,
  })
);

// ✅ Middleware pour servir les fichiers PDF, vidéos, etc. depuis /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/question", QuestionRoute);
app.use("/api/users", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/contact", contactRoute);
app.use("/api/demandes", demandeRoute);
app.use("/api/formateur", formateurRoute);
app.use("/api/expert", expertRoute);
app.use("/api/formation", formationRoute);
app.use("/api/categorie", categorieRoute);
app.use("/api/suivi", suiviRoute);



//attestation
app.use('/attestations', express.static(path.join(__dirname, 'public', 'attestations')));

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

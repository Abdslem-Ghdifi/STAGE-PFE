// server.js (Mise à jour avec JWT et cookies)
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const colors = require("colors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const QuestionRoute = require("./routes/QuestionRoute.js");
const userRoute = require("./routes/userRoute.js");
const demandeRoute = require("./routes/demandeRoute");
const contactRoute = require("./routes/contactRoute");
const adminRoute = require('./routes/adminRoute');
const formateurRoute = require('./routes/formateurRouter')
const expertRoute = require("./routes/expertRoute.js");
const formationRoute = require('./routes/formationRoute');
const categorieRoute = require("./routes/categorieRoute.js")

dotenv.config();
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // Assure-toi que l'URL correspond à ton frontend
    credentials: true,
  })
);

// Routes
app.use("/api/question", QuestionRoute);
app.use("/api/users", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/contact", contactRoute);
app.use("/api/demandes", demandeRoute);
app.use("/api/formateur",formateurRoute); 
app.use("/api/expert",expertRoute);
app.use('/api/formation', formationRoute);
app.use('/api/categorie', categorieRoute);


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

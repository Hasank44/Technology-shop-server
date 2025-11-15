import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/connectDB.js'; // import database
import setRoute from './routes/routes.js';

const app = express();
const port = process.env.PORT || 3000;

// middlewares
const middlewares = [
    cors({
        origin: [process.env.FRONT_URL],
        credentials: true
    }),
    express.json(),
    express.urlencoded(),
    morgan("dev"),
    helmet(),
];
app.use(middlewares);

// routes
setRoute(app);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Page not found" });
});
// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(port, () => {
    connectDB();
    console.log(`Server is Running on port ${port}!`);
});
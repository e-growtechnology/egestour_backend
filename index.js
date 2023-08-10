import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect.js";
import userRouter from "./routes/user.routes.js";
import tourRouter from "./routes/tour.routes.js";
import clientRouter from "./routes/client.routes.js";
import guideRouter from "./routes/guide.routes.js";
import agencyRouter from "./routes/agency.routes.js";
import reservationRouter from "./routes/reservation.routes.js"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
    res.send({ message: "Hello World!" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/guides", guideRouter);
app.use("/api/v1/agencies", agencyRouter);
app.use("/api/v1", reservationRouter); 

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL);

        app.listen(8080, () =>
            console.log("Server started on port http://localhost:8080"),
        );
    } catch (error) {
        console.log(error);
    }
};

startServer();

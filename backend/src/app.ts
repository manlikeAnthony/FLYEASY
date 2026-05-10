
import express , {Request , Response} from 'express'
import { notFound } from "./middlewares/not-found";
import { errorHandlerMiddleware } from "./middlewares/error-handler"; 
import cookieParser from "cookie-parser";
import morgan from 'morgan'
// Routes
import authRouter from "./auth/auth.route";
import userRouter from "./users/user.route";
import requestRouter from "./request/request.route";

import cors from 'cors';
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"))

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.get('/api/v1' , (_req:Request , res:Response)=>{
    res.send('Property Management System')
})
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/requests", requestRouter);


app.use(notFound);
app.use(errorHandlerMiddleware); 

export default app
import { connect, ConnectOptions } from "mongoose";

export const dbConnect = () => {
 // Add this line

    connect(process.env.MONGO_URI!, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions)
    .then(
        () => console.log("Connected successfully"),
        (error) => console.log(error)
    );
}

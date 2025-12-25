import { app } from "./app"

const port = process.env.PORT || 5000;

(async () => {
    // await connectPostgres();
    // await connectMongo();

    app.listen(port, () => console.log(`Server is running and listning to Port ${port}`))
})();
import { app } from "./app"
import { connectMongo, connectPostgres } from "./database";
import config from "./config/index"
const port = config.PORT || 5000;

(async () => {
    await connectPostgres();
    await connectMongo();

    app.listen(port, () => console.log(`Server is running and listning to Port ${port}`))
})();
import { app } from "./app"
import { connectMongo, connectPostgres } from "./database";
import config from "./config/index"
const port = config.PORT || 5000;

(async () => {
    await connectPostgres();
    await connectMongo();

    const server = app.listen(port, () => console.log(`Server is running and listening on port ${port}`))

    server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Update PORT in .env or stop the process using that port.`)
            process.exit(1)
        }

        console.error('Failed to start server:', error.message)
        process.exit(1)
    })
})();

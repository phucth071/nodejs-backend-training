const app = require("./src/app");

const {app: {port}} = require('./src/configs/mongodb.config');
const PORT = port || 3056;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", () => {
    server.close(() => {
        console.log("Server Express closed");
    });
});
const app = require("./src/app");

const PORT = 3000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port 3000`);
});

process.on("SIGINT", () => {
    server.close(() => {
        console.log("Server Express closed");
    });
});
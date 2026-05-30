import app from "./src/app";
import "dotenv/config";

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

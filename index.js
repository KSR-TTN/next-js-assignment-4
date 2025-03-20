import connectDb from "./api/db/index.js";
import app from "./app.js";

connectDb().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Listning on PORT ", process.env.PORT);
  });
});

app.on("error", (err) => {
  console.error("Server Error:", err);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("Unhandled Rejection, shutting down ..............");
  console.log(err.name, err.message);
  process.exit(1);
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

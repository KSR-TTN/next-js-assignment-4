import pg from "pg";
import dbConfig from "../../config/db.config.js";

const pool = new pg.Pool({
  user: dbConfig.DB_USER,
  host: dbConfig.DB_HOST,
  database: dbConfig.DATABASE_NAME,
  password: dbConfig.DB_PASSWORD,
  port: dbConfig.DB_PORT,
});

const connectDb = async () => {
  try {
    const connectionInstance = await pool.connect();
    console.log(`Database connected ${connectionInstance.database}`);
  } catch (error) {
    console.log("Error =>", error);
  }
};

export { pool };
export default connectDb;

import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  host: "localhost",
  port: 5433,
  user: "postgres",
  password: "asdqwe-hgfyrt-zxcvbn",
  database: "auth-system",
});

console.log("⏳ Conectando a PostgreSQL...");
try {
  await client.connect();
  const res = await client.query("SELECT current_database(), current_user;");
  console.log("✅ Conexión OK:", res.rows);
} catch (err) {
  console.error("❌ Error:", err.message);
} finally {
  await client.end();
}

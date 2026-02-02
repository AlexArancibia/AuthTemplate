import pkg from "pg";
const { Client } = pkg;

console.log("⏳ Test PostgreSQL → localhost:5433");

const client = new Client({
  host: "127.0.0.1",
  port: 5433,
  user: "postgres",
  password: "asdqwe-hgfyrt-zxcvbn",
  database: "ecommerce",
});

try {
  await client.connect();
  console.log("✅ Conectado a PostgreSQL");

  const res = await client.query("SELECT current_database(), current_schema()");
  console.log("📦 Resultado:", res.rows);

  await client.end();
} catch (err) {
  console.error("❌ ERROR PostgreSQL:", err.message);
}

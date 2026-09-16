const { PrismaPg } = require("@prisma/adapter-pg");
try {
  const p = new PrismaPg({ connectionString: "postgres://a:b@localhost:5432/db" });
  console.log("Success?", typeof p.query);
} catch (e) {
  console.error("Error:", e.message);
}

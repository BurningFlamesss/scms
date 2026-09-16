const { PrismaPg } = require("@prisma/adapter-pg");
const adapter = new PrismaPg({
  connectionString: "postgres://a:b@unreachable.localhost:5432/db",
  connectionTimeoutMillis: 2000,
  query_timeout: 2000
});
console.log(adapter.config.query_timeout);

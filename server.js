const fastify = require("fastify")({ logger: true });
const pool = require("./db");
require("dotenv").config();
const bcrypt = require("bcrypt");

fastify.register(require("@fastify/jwt"), {
  secret: process.env.JWT_SECRET // move to env in real apps
//   secret:"supersecretkey" // move to env in real apps
});

fastify.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ message: "Unauthorized" });
  }
});

// fastify.post("/login", async (request, reply) => {
//   const { username, password } = request.body;

//   if (username !== "admin" || password !== "admin123") {
//     return reply.code(401).send({ message: "Invalid credentials" });
//   }

//   const token = fastify.jwt.sign(
//     { username },
//     { expiresIn: "1h" }
//   );

//   reply.send({ token });
// });


fastify.post("/login", async (request, reply) => {
  const { username, password } = request.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );

  if (result.rowCount === 0) {
    return reply.code(401).send({ message: "User not Found" });
  }

  const user = result.rows[0];

  // 2. Compare password with hash
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return reply.code(401).send({ message: "Invalid credentials" });
  }

  // 3. Generate JWT
  const token = fastify.jwt.sign(
    { userId: user.id, username: user.username },
    { expiresIn: "1h" }
  );

  reply.send({ token });
});

fastify.post("/register", async (request, reply) => {
  const { username, password } = request.body;

  // 1. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  // 10 = salt rounds

  try {
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword]
    );

    reply.code(201).send(result.rows[0]);
  } catch (err) {
    reply.code(400).send({ message: "User already exists" });
  }
});



const employeeSchema = {
  body: {
    type: "object",
    required: ["name", "role", "salary", "address", "skills"],
    properties: {
      name: { type: "string", minLength: 2 },
      role: { type: "string" },
      salary: { type: "number", minimum: 0 },

      address: {
        type: "object",
        required: ["street", "city", "state", "pincode"],
        properties: {
          street: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          pincode: { type: "number" }
        }
      },

      skills: {
        type: "object",
        properties: {
          languages: {
            type: "array",
            items: { type: "string" }
          },
          experience: { type: "number" }
        }
      }
    }
  }
};
const employeeResponseSchema = {
  201: {
    type: "object",
    properties: {
      id: { type: "number" },
      name: { type: "string" },
      role: { type: "string" },
      salary: { type: "number" }
    }
  }
};

const deleteEmployeeSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "number" }
    }
  }
};

const updateEmployeeSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "number" }
    }
  },
  body: {
    type: "object",
    properties: {
      role: { type: "string" },
      salary: { type: "number" }
    }
  }
};

fastify.get("/employees",  { preHandler: [fastify.authenticate] }, async (request, reply) => {
  try {
    const result = await pool.query("SELECT * FROM employees");
    return result.rows;
  } catch (err) {
     console.error(err);
    reply.code(500).send({ error: err.message });
  }
});

fastify.post("/insertemployee",   {
  schema: {
    body: employeeSchema.body,
    response: employeeResponseSchema
  }
}, async (request, reply) => {
  const { name, role, salary, address, skills } = request.body;

  try {
    const query = `
      INSERT INTO employees (name, role, salary, address, skills)
      VALUES ($1, $2, $3, ROW($4,$5,$6,$7), $8)
      RETURNING *;
    `;

    const values = [
      name,
      role,
      salary,
      address.street,
      address.city,
      address.state,
      address.pincode,
      skills
    ];

    const result = await pool.query(query, values);
    reply.code(201).send(result.rows[0]);
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});

fastify.get("/selectbyname", async (request, reply) => {
  const { name } = request.query;

  try {
    const query = `
     SELECT * FROM employees WHERE name = '${name}'
    `;

    const result = await pool.query(query);
    reply.code(201).send(result.rows);
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});

fastify.put("/employees/:id", { schema: updateEmployeeSchema,preHandler: [fastify.authenticate] } , async (request, reply) => {
    const { id } = request.params;
    const { role, salary } = request.body;

    const result = await pool.query(
      `
      UPDATE employees
      SET
        role = COALESCE($1, role),
        salary = COALESCE($2, salary)
      WHERE id = $3
      RETURNING *;
      `,
      [role, salary, id]
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({ message: "Employee not found" });
    }

    reply.send(result.rows[0]);
  }
);

fastify.delete("/employees/:id", { schema: deleteEmployeeSchema }, async (request, reply) => {
    const { id } = request.params;

    const result = await pool.query(
      "DELETE FROM employees WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({ message: "Employee not found" });
    }

    reply.code(204).send();
  }
);





const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("🚀 Fastify running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

start();

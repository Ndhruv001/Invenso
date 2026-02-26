import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || 12);

async function seedUser() {
  const username = "253648936";
  const plainPassword = "121295..MONEY";
  const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  await prisma.user.create({
    data: {
      username,
      role: "ADMIN",
      password: hashedPassword
    }
  });

  console.log("Admin user created with username:", username);
}

seedUser()
  .catch(err => console.error(err))
  .finally(() => process.exit());

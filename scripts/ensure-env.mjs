import { copyFileSync, existsSync } from "node:fs";

if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  console.log("Created .env from .env.example — review AUTH_SECRET before production.");
} else {
  console.log(".env already exists.");
}

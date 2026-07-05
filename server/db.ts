import fs from "fs";
import path from "path";
import crypto from "crypto";
import { UserProfile } from "../src/types";

export interface UserRecord {
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  phone: string;
  location: string;
  language: "en" | "te" | "hi";
  createdAt: string;
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "users.json");

// Generate salt and hash password
export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

// Ensure the database file exists and is initialized
function initDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(DB_FILE)) {
      // Seed with the default demo user: yegraddytharun@gmail.com / admin123
      const defaultSalt = "agri_demo_salt_9988";
      const defaultHash = hashPassword("admin123", defaultSalt);
      
      const seedUsers: Record<string, UserRecord> = {
        "yegraddytharun@gmail.com": {
          email: "yegraddytharun@gmail.com",
          passwordHash: defaultHash,
          salt: defaultSalt,
          name: "Tharun G",
          phone: "+91 98765 43210",
          location: "Anantapur, Andhra Pradesh",
          language: "en",
          createdAt: new Date().toISOString()
        }
      };
      
      fs.writeFileSync(DB_FILE, JSON.stringify(seedUsers, null, 2), "utf-8");
      console.log("Database initialized and pre-seeded with demo user.");
    }
  } catch (error) {
    console.error("Error initializing users database:", error);
  }
}

// Load all users from DB
function loadUsers(): Record<string, UserRecord> {
  initDb();
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading users database:", error);
  }
  return {};
}

// Save all users to DB
function saveUsers(users: Record<string, UserRecord>) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing users database:", error);
  }
}

// DB Operations
export function getUserByEmail(email: string): UserRecord | null {
  const users = loadUsers();
  const normalizedEmail = email.toLowerCase().trim();
  return users[normalizedEmail] || null;
}

export function registerUser(
  email: string,
  password: string,
  name: string,
  phone: string,
  location: string,
  language: "en" | "te" | "hi"
): UserRecord {
  const users = loadUsers();
  const normalizedEmail = email.toLowerCase().trim();
  
  if (users[normalizedEmail]) {
    throw new Error("User already exists.");
  }
  
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  
  const newUser: UserRecord = {
    email: normalizedEmail,
    passwordHash,
    salt,
    name: name.trim(),
    phone: phone.trim(),
    location: location.trim(),
    language,
    createdAt: new Date().toISOString()
  };
  
  users[normalizedEmail] = newUser;
  saveUsers(users);
  return newUser;
}

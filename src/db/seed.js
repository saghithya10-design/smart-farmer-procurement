 
require("dotenv").config();

const bcrypt = require("bcrypt");
const { db } = require("./database");

const STAFF_NAME = "admin";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD;

async function seedStaff() {
    try {
        if (!STAFF_PASSWORD) {
            throw new Error("STAFF_PASSWORD is not set in .env");
        }

        const existingStaff = db
            .prepare("SELECT id FROM staff WHERE name = ?")
            .get(STAFF_NAME);

        if (existingStaff) {
            console.log("Seed staff account already exists.");
            return;
        }

        const passwordHash = await bcrypt.hash(STAFF_PASSWORD, 10);

        const insertStaff = db.prepare(`
            INSERT INTO staff (name, password_hash)
            VALUES (?, ?)
        `);

        insertStaff.run(STAFF_NAME, passwordHash);

        console.log("Seed staff account created successfully.");
        console.log(`Staff username: ${STAFF_NAME}`);
        console.log("Password stored as bcrypt hash.");
    } catch (error) {
        console.error("Error seeding staff account:", error);
        process.exitCode = 1;
    } finally {
        db.close();
    }
}

seedStaff();
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function createUser(username, password) {
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const usersFile = path_1.default.join(__dirname, 'users.json');
        console.log('Creating user with file:', usersFile);
        let userData = {
            users: []
        };
        try {
            const data = await promises_1.default.readFile(usersFile, 'utf-8');
            console.log('Existing users file found:', data);
            userData = JSON.parse(data);
            // Ensure users array exists
            if (!userData.users) {
                userData.users = [];
            }
        }
        catch (error) {
            console.log('No existing users file, creating new one');
        }
        console.log('Current userData:', userData);
        userData.users.push({
            username,
            password: hashedPassword
        });
        await promises_1.default.writeFile(usersFile, JSON.stringify(userData, null, 2));
        console.log(`User ${username} created successfully`);
    }
    catch (error) {
        console.error('Error creating user:', error);
    }
}
// Create test user
createUser('testuser', 'password123');

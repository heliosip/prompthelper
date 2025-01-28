"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const USERS_FILE = path_1.default.join(__dirname, 'users.json');
async function hashPasswords() {
    const users = JSON.parse(await promises_1.default.readFile(USERS_FILE, 'utf-8'));
    const updatedUsers = await Promise.all(users.map(async (user) => {
        if (!user.password.startsWith('$2b$')) { // Skip if already hashed
            user.password = await bcrypt_1.default.hash(user.password, 10);
        }
        return user;
    }));
    await promises_1.default.writeFile(USERS_FILE, JSON.stringify(updatedUsers, null, 2));
    console.log('User passwords have been hashed and updated.');
}
hashPasswords().catch(console.error);

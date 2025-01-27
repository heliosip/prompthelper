"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const USERS_FILE = path_1.default.join(__dirname, 'users.json');
function hashPasswords() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = JSON.parse(yield promises_1.default.readFile(USERS_FILE, 'utf-8'));
        const updatedUsers = yield Promise.all(users.map((user) => __awaiter(this, void 0, void 0, function* () {
            if (!user.password.startsWith('$2b$')) { // Skip if already hashed
                user.password = yield bcrypt_1.default.hash(user.password, 10);
            }
            return user;
        })));
        yield promises_1.default.writeFile(USERS_FILE, JSON.stringify(updatedUsers, null, 2));
        console.log('User passwords have been hashed and updated.');
    });
}
hashPasswords().catch(console.error);

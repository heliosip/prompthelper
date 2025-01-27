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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const joi_1 = __importDefault(require("joi"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const USERS_FILE = path_1.default.join(__dirname, 'users.json');
const TEMPLATES_DIR = path_1.default.join(__dirname, '..', 'usertemplates');
// Validation schemas using Joi
const authSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default.string().required(),
});
const templatesSchema = joi_1.default.object().pattern(joi_1.default.string(), // Template name
joi_1.default.string() // Template content
);
// Debug logging helper
function logError(message, error) {
    console.error(`[ERROR] ${message}:`, error);
}
// POST /auth - Authenticate user
app.post('/auth', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = authSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { username, password } = req.body;
        const users = JSON.parse(yield promises_1.default.readFile(USERS_FILE, 'utf-8'));
        const user = users.find((u) => u.username === username);
        if (user && (yield bcrypt_1.default.compare(password, user.password))) {
            res.status(200).json({ success: true });
        }
        else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    }
    catch (error) {
        logError('Failed to authenticate user', error);
        next(error);
    }
}));
// GET /templates/:username - Fetch user templates
app.get('/templates/:username', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDir = path_1.default.join(TEMPLATES_DIR, req.params.username);
        const templatesPath = path_1.default.join(userDir, 'templates.json');
        // Check if the file exists
        yield promises_1.default.access(templatesPath);
        const templates = yield promises_1.default.readFile(templatesPath, 'utf-8');
        res.status(200).json(JSON.parse(templates));
    }
    catch (error) {
        logError('Failed to fetch templates', error);
        res.status(404).json({ error: 'Templates not found' });
    }
}));
// PUT /templates/:username - Save user templates
app.put('/templates/:username', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the request body against the Joi schema
        const { error } = templatesSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        // Resolve the directory path for the user
        const userDir = path_1.default.join(TEMPLATES_DIR, req.params.username);
        // Ensure the directory exists
        yield promises_1.default.mkdir(userDir, { recursive: true });
        // Save the templates to templates.json
        const templatesFilePath = path_1.default.join(userDir, 'templates.json');
        yield promises_1.default.writeFile(templatesFilePath, JSON.stringify(req.body, null, 2));
        // Respond with success
        res.status(200).json({ message: 'Templates saved successfully' });
    }
    catch (error) {
        logError('Failed to save templates', error);
        next(error);
    }
}));
// Default 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

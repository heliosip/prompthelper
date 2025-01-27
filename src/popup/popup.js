"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const Popup = () => {
    const [templates, setTemplates] = (0, react_1.useState)([]);
    const [userTemplates, setUserTemplates] = (0, react_1.useState)([]);
    const [currentAI, setCurrentAI] = (0, react_1.useState)('');
    const [showNewForm, setShowNewForm] = (0, react_1.useState)(false);
    const [showLogin, setShowLogin] = (0, react_1.useState)(false);
    const [user, setUser] = (0, react_1.useState)(null);
    const [loginForm, setLoginForm] = (0, react_1.useState)({ username: '', password: '' });
    const [newTemplate, setNewTemplate] = (0, react_1.useState)({
        name: '',
        content: '',
        category: 'General'
    });
    (0, react_1.useEffect)(() => {
        loadUser();
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            const url = tab.url || '';
            const ai = url.includes('chat.openai.com') ? 'chatgpt' :
                url.includes('claude.ai') ? 'claude' : 'unknown';
            setCurrentAI(ai);
            loadTemplates(ai);
            if (user) {
                loadUserTemplates(ai);
            }
        });
    }, [user]);
    const loadUser = () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield chrome.storage.local.get(['user']);
        if (data.user) {
            setUser(data.user);
        }
    });
    const loadTemplates = (ai) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const data = yield chrome.storage.local.get(['templates']);
        setTemplates(((_a = data.templates) === null || _a === void 0 ? void 0 : _a.filter((t) => t.aiTool === ai)) || []);
    });
    const loadUserTemplates = (ai) => __awaiter(void 0, void 0, void 0, function* () {
        if (!user)
            return;
        try {
            const response = yield fetch(`YOUR_API_ENDPOINT/usertemplates/${user.username}/templates.json`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`
                }
            });
            if (response.ok) {
                const userTemplates = yield response.json();
                setUserTemplates(userTemplates.filter((t) => t.aiTool === ai));
            }
        }
        catch (error) {
            console.error('Failed to load user templates:', error);
        }
    });
    const handleLogin = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield fetch('YOUR_AUTH_ENDPOINT', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm)
            });
            if (response.ok) {
                const user = { username: loginForm.username, password: loginForm.password };
                yield chrome.storage.local.set({ user });
                setUser(user);
                setShowLogin(false);
            }
        }
        catch (error) {
            console.error('Login failed:', error);
        }
    });
    const saveTemplate = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!user) {
            setShowLogin(true);
            return;
        }
        const newTemplateData = Object.assign(Object.assign({ id: Date.now().toString() }, newTemplate), { aiTool: currentAI, isUserTemplate: true, userId: user.username });
        try {
            const updatedTemplates = [...userTemplates, newTemplateData];
            const response = yield fetch(`YOUR_API_ENDPOINT/usertemplates/${user.username}/templates.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`
                },
                body: JSON.stringify(updatedTemplates)
            });
            if (response.ok) {
                setUserTemplates(updatedTemplates);
                setShowNewForm(false);
                setNewTemplate({ name: '', content: '', category: 'General' });
            }
        }
        catch (error) {
            console.error('Failed to save template:', error);
        }
    });
    const categories = Array.from(new Set([...templates, ...userTemplates].map(t => t.category)));
    return (react_1.default.createElement("div", { className: "w-96 p-4" },
        !user && !showLogin && (react_1.default.createElement("button", { onClick: () => setShowLogin(true), className: "w-full mb-4 px-4 py-2 bg-gray-800 text-white rounded" }, "Login")),
        showLogin && (react_1.default.createElement("div", { className: "mb-4 p-4 border rounded" },
            react_1.default.createElement("input", { type: "text", placeholder: "Username", className: "w-full p-2 mb-2 border rounded", value: loginForm.username, onChange: e => setLoginForm(Object.assign(Object.assign({}, loginForm), { username: e.target.value })) }),
            react_1.default.createElement("input", { type: "password", placeholder: "Password", className: "w-full p-2 mb-2 border rounded", value: loginForm.password, onChange: e => setLoginForm(Object.assign(Object.assign({}, loginForm), { password: e.target.value })) }),
            react_1.default.createElement("div", { className: "flex justify-end gap-2" },
                react_1.default.createElement("button", { onClick: () => setShowLogin(false), className: "px-2 py-1 border rounded" }, "Cancel"),
                react_1.default.createElement("button", { onClick: handleLogin, className: "px-2 py-1 bg-blue-500 text-white rounded" }, "Login")))),
        react_1.default.createElement("div", { className: "flex justify-between items-center mb-4" },
            react_1.default.createElement("h2", { className: "text-xl font-bold" },
                "Templates - ",
                currentAI),
            react_1.default.createElement("button", { onClick: () => setShowNewForm(true), className: "px-2 py-1 bg-blue-500 text-white rounded" }, "New Template")),
        showNewForm && (react_1.default.createElement("div", { className: "mb-4 p-4 border rounded" },
            react_1.default.createElement("input", { type: "text", placeholder: "Template Name", className: "w-full p-2 mb-2 border rounded", value: newTemplate.name, onChange: e => setNewTemplate(Object.assign(Object.assign({}, newTemplate), { name: e.target.value })) }),
            react_1.default.createElement("textarea", { placeholder: "Template Content", className: "w-full p-2 mb-2 border rounded", rows: 4, value: newTemplate.content, onChange: e => setNewTemplate(Object.assign(Object.assign({}, newTemplate), { content: e.target.value })) }),
            react_1.default.createElement("div", { className: "flex justify-end gap-2" },
                react_1.default.createElement("button", { onClick: () => setShowNewForm(false), className: "px-2 py-1 border rounded" }, "Cancel"),
                react_1.default.createElement("button", { onClick: saveTemplate, className: "px-2 py-1 bg-blue-500 text-white rounded" }, "Save")))),
        categories.map(category => (react_1.default.createElement("div", { key: category, className: "mb-4" },
            react_1.default.createElement("h3", { className: "font-semibold mb-2" }, category),
            react_1.default.createElement("div", { className: "space-y-2" }, [...templates, ...userTemplates]
                .filter(t => t.category === category)
                .map((template) => (react_1.default.createElement("div", { key: template.id, className: "p-2 border rounded hover:bg-gray-50" },
                react_1.default.createElement("div", { className: "font-medium" }, template.name),
                template.isUserTemplate && (react_1.default.createElement("div", { className: "text-xs text-gray-500" }, "Custom template")),
                react_1.default.createElement("button", { onClick: () => {
                        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                            if (tab.id) {
                                chrome.tabs.sendMessage(tab.id, {
                                    action: 'insertPrompt',
                                    prompt: template.content
                                });
                            }
                        });
                    }, className: "mt-1 px-2 py-1 text-sm bg-blue-500 text-white rounded" }, "Use Template"))))))))));
};
exports.default = Popup;

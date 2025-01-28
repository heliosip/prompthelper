# AI Prompt Helper Project Transfer Document

## Project Overview
Chrome extension for managing and inserting templates into AI chat interfaces (Claude, ChatGPT).

## Directory Structure
```
/prompthelper
├── /server
│   ├── index.ts              # Main server file with CORS and endpoints
│   ├── createUser.ts         # User creation utility
│   ├── hashPasswords.ts      # Password hashing utility
│   ├── users.json            # User credentials store
│   ├── package.json          # Server dependencies
│   └── tsconfig.json         # Server TypeScript config
├── /src
│   ├── /popup
│   │   ├── index.tsx         # React entry point
│   │   ├── popup.tsx         # Main React component
│   │   └── popup.html        # HTML template
│   ├── /content
│   │   └── content.ts        # Content script for injection
│   ├── /background
│   │   └── background.ts     # Service worker
│   └── manifest.json         # Extension manifest
├── /usertemplates
│   └── /testuser
│       └── templates.json    # User template storage
├── package.json              # Root dependencies and scripts
├── tsconfig.json            # Root TypeScript config
└── webpack.config.js        # Build configuration
```

## Current Working Configuration
- Server running on port 3001
- Authentication working with testuser/password123
- Template CRUD operations functional
- Chrome extension successfully loading and communicating with server

## Development Environment
### Server Dependencies
- express
- cors
- bcrypt
- typescript

### Client Dependencies
- react (18.3.1)
- react-dom (18.3.1)
- typescript
- webpack

## Build Scripts
```json
{
  "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
  "dev:server": "cd server && npm run dev",
  "dev:client": "webpack --watch --config webpack.config.js"
}
```

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /auth | POST | Authentication |
| /templates/:username | GET | Get templates |
| /templates/:username | POST | Create template |
| /templates/:username/:templateId | PUT | Update template |
| /templates/:username/:templateId | DELETE | Delete template |

## Recent Fixes Implemented
- CORS configuration added
- React hooks error resolved
- Template saving functionality fixed
- Infinite loop in template loading fixed

## Testing Credentials
```
Username: testuser
Password: password123
```

## Current Working Features
- User authentication
- Template management (CRUD)
- Template categorization
- Prompt insertion into Claude
- Error handling
- User feedback

## Extension Permissions
```json
{
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": [
    "https://chat.openai.com/*",
    "https://claude.ai/*",
    "http://localhost:3001/*"
  ]
}
```

## Files Needed for Template Implementation
Key files needed when implementing prompt templates:

1. `/src/content/content.ts` - For content script modifications
2. `/src/popup/popup.tsx` - For template interface updates
3. `/usertemplates/testuser/templates.json` - For template structure reference

## Development Server Setup
1. Install dependencies:
```bash
npm install
cd server
npm install
```

2. Start development:
```bash
npm run dev
```

3. Load extension:
- Open Chrome Extensions (chrome://extensions/)
- Enable Developer Mode
- Load unpacked from `/dist` directory

## Next Steps
1. Implement template categories for different use cases
2. Add template insertion logic for different AI platforms
3. Enhance template management interface
4. Add template sharing capabilities
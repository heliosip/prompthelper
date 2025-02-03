(function(){"use strict";const a=[{id:"1",name:"Task Analysis",content:`Please analyze this task:
[INSERT DETAILS]

Consider:
1. Requirements
2. Potential challenges
3. Implementation steps`,category:"Planning",aiTool:"claude"},{id:"2",name:"Code Review",content:`Please review this code:
[INSERT CODE]

Focus on:
1. Performance
2. Security
3. Best practices`,category:"Development",aiTool:"claude"},{id:"3",name:"Code Generation",content:`Please write code for:
[INSERT REQUIREMENT]

Requirements:
1. Language: [SPECIFY]
2. Features: [LIST]
3. Error handling needed: [YES/NO]`,category:"Development",aiTool:"claude"},{id:"4",name:"Data Analysis",content:`Please analyze this data:
[INSERT DATA]

Provide:
1. Key patterns
2. Statistical insights
3. Recommendations`,category:"Analysis",aiTool:"claude"}];chrome.runtime.onInstalled.addListener(()=>{chrome.storage.local.set({templates:a})}),chrome.storage.onChanged.addListener((e,n)=>{n==="local"&&e.templates&&console.log("Templates updated:",e.templates.newValue)}),chrome.runtime.onMessage.addListener((e,n,t)=>(console.log("Message received",e),t({received:!0}),!0))})();

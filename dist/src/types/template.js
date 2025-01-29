// Utility function to generate unique IDs
export const generateId = () => {
    return Math.random().toString(36).substring(2, 11);
};
// Utility function to create a new prompt instance from a template
export const createPromptInstance = (template, modifiedContent, saveToHistory) => {
    return {
        templateId: template.id,
        content: modifiedContent,
        saveToHistory
    };
};
// Function to save a prompt to history
export const createHistoryEntry = (template, promptInstance) => {
    return {
        id: generateId(),
        templateId: template.id,
        content: promptInstance.content,
        timestamp: new Date().toISOString(),
        metadata: {
            templateName: template.name,
            category: template.category,
            aiTool: template.aiTool,
            outputType: template.outputType,
            promptType: template.promptType
        }
    };
};

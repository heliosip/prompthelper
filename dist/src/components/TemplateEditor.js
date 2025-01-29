import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createPromptInstance } from '../types/template'; // Fixed import path
const TemplateEditor = ({ template, onSubmit, onCancel }) => {
    const [content, setContent] = useState(template.content);
    const [saveToHistory, setSaveToHistory] = useState(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        const promptInstance = createPromptInstance(template, content, saveToHistory);
        onSubmit(promptInstance);
    };
    return (_jsxs("div", { className: "p-4 border rounded", children: [_jsxs("div", { className: "mb-4 p-3 bg-gray-50 rounded", children: [_jsx("h3", { className: "text-lg font-semibold", children: template.name }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm mt-2", children: [_jsxs("div", { children: ["Category: ", template.category] }), _jsxs("div", { children: ["AI Tool: ", template.aiTool] }), _jsxs("div", { children: ["Output Type: ", template.outputType] }), _jsxs("div", { children: ["Prompt Type: ", template.promptType] })] }), template.description && (_jsx("div", { className: "mt-2 text-gray-600", children: template.description }))] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-2 font-medium", children: "Prompt Content" }), _jsx("textarea", { className: "w-full h-64 p-3 border rounded font-mono", value: content, onChange: (e) => setContent(e.target.value), placeholder: "Edit your prompt here..." })] }), _jsx("div", { className: "mb-4", children: _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: saveToHistory, onChange: (e) => setSaveToHistory(e.target.checked), className: "form-checkbox" }), _jsx("span", { children: "Save this prompt to history" })] }) }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx("button", { type: "button", onClick: onCancel, className: "px-4 py-2 border rounded", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-500 text-white rounded", children: "Send to Chat" })] })] })] }));
};
export default TemplateEditor;

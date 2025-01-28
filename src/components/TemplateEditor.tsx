import React, { useState } from 'react';
import { Template, PromptInstance, createPromptInstance } from '../types/template';  // Fixed import path

// Rest of the component remains the same
interface TemplateEditorProps {
  template: Template;
  onSubmit: (promptInstance: PromptInstance) => void;
  onCancel: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSubmit,
  onCancel
}) => {
  const [content, setContent] = useState(template.content);
  const [saveToHistory, setSaveToHistory] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const promptInstance = createPromptInstance(
      template,
      content,
      saveToHistory
    );
    onSubmit(promptInstance);
  };

  return (
    <div className="p-4 border rounded">
      {/* Template Metadata Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold">{template.name}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          <div>Category: {template.category}</div>
          <div>AI Tool: {template.aiTool}</div>
          <div>Output Type: {template.outputType}</div>
          <div>Prompt Type: {template.promptType}</div>
        </div>
        {template.description && (
          <div className="mt-2 text-gray-600">{template.description}</div>
        )}
      </div>

      {/* Prompt Content Editor */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Prompt Content
          </label>
          <textarea
            className="w-full h-64 p-3 border rounded font-mono"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit your prompt here..."
          />
        </div>

        {/* Save to History Option */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={saveToHistory}
              onChange={(e) => setSaveToHistory(e.target.checked)}
              className="form-checkbox"
            />
            <span>Save this prompt to history</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send to Chat
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateEditor;
// src/hooks/useTemplateActions.ts

import { useState } from 'react';
import * as templateAPI from '../api/templates';
import type { Template } from '../database.types';

export const useTemplateActions = () => {
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const create = async (template: Partial<Template>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const newTemplate = await templateAPI.createTemplate(template);
      return newTemplate;
    } catch (error: any) {
      setActionError(error.message);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const update = async (templateId: string, template: Partial<Template>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const updatedTemplate = await templateAPI.updateTemplate(templateId, template);
      return updatedTemplate;
    } catch (error: any) {
      setActionError(error.message);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const remove = async (templateId: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const deletedTemplate = await templateAPI.deleteTemplate(templateId);
      return deletedTemplate;
    } catch (error: any) {
      setActionError(error.message);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    create,
    update,
    remove,
    actionError,
    actionLoading,
  };
};

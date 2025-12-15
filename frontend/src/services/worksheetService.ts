import { apiClient } from './api';
import type { WorksheetConfig, WorksheetViewModel, BoxSize } from '../types';

/**
 * Service for interacting with Worksheet Builder APIs.
 */
export const worksheetService = {
  /**
   * Generate worksheet from configuration.
   * @param config - Worksheet configuration
   */
  async generateWorksheet(config: WorksheetConfig): Promise<WorksheetViewModel> {
    const response = await apiClient.post<WorksheetViewModel>('/worksheet/api/generate', config);

    return response.data;
  },

  /**
   * Get available box sizes.
   */
  async getBoxSizes(): Promise<BoxSize[]> {
    const response = await apiClient.get<BoxSize[]>('/worksheet/api/box-sizes');

    return response.data;
  },
};

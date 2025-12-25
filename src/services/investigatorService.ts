import api from './api';

export const investigatorService = {
  /**
   * Upload call records PDF for analysis
   * @param file PDF file
   * @returns Analysis response with ID
   */
  async uploadCallRecords(file: File): Promise<{ analysis_id: string; status: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    // Don't set Content-Type header - let Axios automatically handle multipart/form-data
    const response = await api.post('/investigator/call-analysis/upload', formData);

    return response.data;
  },

  /**
   * Get call analysis results by ID
   * @param analysisId Analysis ID
   * @returns Analysis results
   */
  async getCallAnalysisResults(analysisId: string): Promise<any> {
    const response = await api.get(`/investigator/call-analysis/results/${analysisId}`);
    return response.data;
  },

  /**
   * Get all call analysis history
   * @returns List of all analyses
   */
  async getCallAnalysisHistory(): Promise<any> {
    const response = await api.get('/investigator/call-analysis/history');
    return response.data;
  },

  /**
   * Check call analysis service health
   * @returns Health status
   */
  async checkCallAnalysisHealth(): Promise<any> {
    const response = await api.get('/investigator/call-analysis/health');
    return response.data;
  },
};

// This file is kept for backward compatibility
// All new code should use the API manager from '../api'
import apiManager from '../api';

// Export the API client instance for legacy code
const api = apiManager.getClient().getAxiosInstance();

export default api;

// Re-export the new API manager for migration
export { apiManager };

/**
 * Interface for paginated response data
 */
export interface PaginatedResponse<T> {
  /**
   * Array of items for the current page
   */
  data: T[];
  
  /**
   * Pagination metadata
   */
  meta: {
    /**
     * Total number of items across all pages
     */
    totalItems: number;
    
    /**
     * Number of items per page
     */
    itemsPerPage: number;
    
    /**
     * Current page number (1-based)
     */
    currentPage: number;
    
    /**
     * Total number of pages
     */
    totalPages: number;
    
    /**
     * Whether there is a next page available
     */
    hasNextPage: boolean;
    
    /**
     * Whether there is a previous page available
     */
    hasPreviousPage: boolean;
  };
  
  /**
   * Response message
   */
  message: string;
}
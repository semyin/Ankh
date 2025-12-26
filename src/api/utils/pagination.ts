export interface PaginationParams {
  page: string | number
  pageSize: string | number
  maxPageSize?: number
}
export interface PaginationResult {
  page: number
  limit: number
  offset: number
}
export function calculatePagination(params: PaginationParams): PaginationResult {
  const pageNum = Math.max(1, Number(params.page) || 1)
  const pageSizeNum = Math.max(1, Number(params.pageSize) || 10)
  const maxPageSize = params.maxPageSize || 50
  
  const limit = Math.min(maxPageSize, pageSizeNum)
  const offset = (pageNum - 1) * limit
  
  return {
    page: pageNum,
    limit,
    offset
  }
}
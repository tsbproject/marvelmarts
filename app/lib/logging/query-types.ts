export interface LogPagination {
  page: number;
  pageSize: number;
}

export interface LogDateRange {
  dateFrom?: Date;
  dateTo?: Date;
}

export interface LogQueryResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
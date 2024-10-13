export interface PaginationParameters {
    PageNumber: number;
    PageSize: number;
    SortBy?: string;
    SortDescending: boolean;
    SearchTerm?: string;
  }
  
  // export interface ApiResponse<T> {
  //   value: {
  //     totalCount: number;
  //     pageNumber: number;
  //     pageSize: number;
  //     data: T[];
  //   };
  //   isSuccess: boolean;
  //   statusCode: number;
  //   message: string;
  //   errorMessages: string[]
  // }

  export interface ApiPaginatedResponse<T> {
    value: {
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      data: T;
    };
    isSuccess: boolean;
    statusCode: number;
    message: string;
    errorMessages: string[]
  }

  export interface ApiResponse<T> {
    value: T;
    isSuccess: boolean;
    statusCode: number;
    message: string;
    errorMessages: string[]
  }
  
  export interface TableColumn<T> {
    align?: "center" | "left" | "right" | "inherit" | "justify" | undefined;
    id: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
  }

  export interface SelectOption {
    value: string;
    label: string;
  }
  
  export interface AttributeSelectOption extends SelectOption{
    values: SelectOption[]
  }

  export interface AttributeValue {
    attributeId: string;
    attributeValueId: string;
  }
  
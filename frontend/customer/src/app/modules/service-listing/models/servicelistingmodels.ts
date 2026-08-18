// ── ServiceTypeWithCategories (GET /api/service-list/service-type?serviceTypeId=) ──
export interface SubCategorySlim {
  subCategoryId: number;
  subCategoryName: string;
}

export interface CategoryWithSubCategories {
  categoryId: number;
  categoryName: string;
  subCategories: SubCategorySlim[];
}

export interface ServiceTypeWithCategories {
  serviceName: string;
  totalServiceCount: number;
  categories: CategoryWithSubCategories[];
}

// ── ServiceList (GET /api/service-list/subcategory?subCategoryId=) ──
export interface ServiceListItem {
  id: number;
  name: string;
  duration: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  image: string | null;
}

export interface ServiceListResponse {
  subCategoryName: string;
  totalCount: number;
  services: ServiceListItem[];
}

// ── SearchServices (GET /api/service-list/services?serviceTypeId=&term=) ──
export interface ServiceSearchResult {
  id: number;
  name: string;
  price: number;
  duration: string;
  description: string | null;
  image: string | null;
}
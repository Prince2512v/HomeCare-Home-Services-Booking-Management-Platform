export interface GetServicePartnerResponseModel {
  id: number;
  name: string;
  mobileNumber: string;
  email: string;
  address: string;
  job: string;
  jobsCompleted: number;
  status: string;
}

export interface FilterServicePartnerRequestModel {
  serviceTypeName?: string | null;
  jobsCompletedMin?: number | null;
  jobsCompletedMax?: number | null;
  status?: number | null;
  pageNumber: number;
  pageSize: number;
  sortField?: string | null;
  sortDirection?: string | null;
}

export interface DataQueryResponseModel<T> {
  records: T[];
  totalRecords: number;
  filterMeta?: FilterRangeMeta | null;
}
export interface FilterRangeMeta {
  maxAmount?: number | null;
  maxBookedServices?: number | null;
  maxBookingCount?: number | null;
}
export interface ServicePartnerSkillResponse {
  categoryId: number;
  categoryName: string;
}

export interface ServicePartnerServiceOfferedResponse {
  subCategoryId: number;
  subCategoryName: string;
}

export interface ServicePartnerLanguageResponse {
  languageId: number;
  languageName: string;
  proficiency: string;
}

export interface ServicePartnerExperienceResponse {
  id: number;
  companyName: string;
  role: string;
  fromDate: string;
  toDate?: string | null;
  durationYears: number;
}

export interface ServicePartnerAttachmentResponse {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType?: string | null;
  fileSizeKb?: number | null;
  documentLabel?: string | null;
}

export interface ServicePartnerDetailResponse {
  id: number;
  fullName: string;
  mobileNumber: string;
  email: string;
  residentialAddress: string;
  jobTitle: string;
  totalWorkExperienceYears: number;
  verificationStatus: string;
  status: string;
  profileImageUrl?: string | null;
  skills: ServicePartnerSkillResponse[];
  servicesOffered: ServicePartnerServiceOfferedResponse[];
  languagesSpoken: ServicePartnerLanguageResponse[];
  previousExperiences: ServicePartnerExperienceResponse[];
  attachments: ServicePartnerAttachmentResponse[];
}

export interface ServicePartnerActionResponse {
  id: number;
  verificationStatus: string;
  status: string;
  message: string;
}

export interface AssignedServiceResponse {
  bookingId: number;
  serviceId: number;
  serviceName: string;
  customerName: string;
  dateAndTime: string;
  serviceAddress: string;
  serviceStatus: string;
}
export interface FilterAssignedServicesRequestModel {
  pageNumber: number;
  pageSize: number;
  date?: string | null;
  time?: string | null;
  serviceStatus?: string | null;
}
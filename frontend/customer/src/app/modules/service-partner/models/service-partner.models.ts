import { Gender, Proficiency } from '../enums/service-partner.enums';

export interface EducationRequest {
  schoolCollege: string;
  passingYear: number;
  marks: number | null;
}

export interface ExperienceRequest {
  companyName: string;
  role: string;
  fromDate: string;
  toDate: string | null;
}

export interface LanguageRequest {
  languageId: number;
  proficiency: Proficiency;
}

export interface AttachmentRequest {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  documentLabel: string;
}

export interface ApplyServicePartnerRequest {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  mobileNumber: string;
  email: string;
  applyingForTypeId: number;
  permanentAddress: string;
  residentialAddress: string;
  profileImageUrl: string | null;
  educations: EducationRequest[];
  experiences: ExperienceRequest[];
  skillCategoryIds: number[];
  serviceSubCategoryIds: number[];
  languages: LanguageRequest[];
  attachments: AttachmentRequest[];
}

export interface ApplyServicePartnerResponse {
  id: number;
  fullName: string;
  email: string;
  status: string;
  verificationStatus: string;
  createdAt: string;
}

export interface UploadAttachmentResponse {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
}

export interface UploadProfileImageResponse {
  imageName: string;
}

export interface ServiceType {
  id: number;
  serviceName: string;
}

export interface Category {
  id: number;
  categoryName: string;
}

export interface SubCategory {
  id: number;
  categoryId: number;
  subCategoryName: string;
}

export interface Language {
  id: number;
  name: string;
}

export interface PaginatedRecords<T> {
  records: T[];
  totalCount: number;
}
export interface GetContactUsResponseModel {
  id: number;
  userName: string;
  email: string;
  contactNumber: string;
  description: string;
  submittedAt: string;
}

export interface FilterContactUsRequestModel {
  userName?: string | null;
  submittedAt?: string | null;
}

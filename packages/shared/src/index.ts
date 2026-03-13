export enum Role {
  ADMIN = 'ADMIN',
  ORTAK = 'ORTAK',
  KULLANICI = 'KULLANICI',
}

export enum TransactionType {
  GELIR = 'GELIR',
  GIDER = 'GIDER',
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CompanyDto {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface BranchDto {
  id: string;
  companyId: string;
  name: string;
  createdAt: string;
}

export interface BranchPartnerDto {
  id: string;
  branchId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  percentage: number;
}

export interface TransactionDto {
  id: string;
  branchId: string;
  amount: number;
  description?: string;
  date: string;
  type: TransactionType;
}

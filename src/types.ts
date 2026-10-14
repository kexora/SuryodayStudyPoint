export type UserRole = '__kx_0x4' | '__kx_0x3' | '__kx_0x2' | '__kx_0x1' | '__kx_0x5';

export interface UserData {
  uid?: string;
  role: UserRole;
  email: string | null;
  name?: string | null;
  fullName?: string;
  mobileNumber?: string;
  fatherName?: string;
  motherName?: string;
  villageTown?: string;
  block?: string;
  district?: string;
  state?: string;
  pincode?: string;
  crhsId?: string;
  createdAt?: string;
}

export interface RegistrationFormData {
  fullName: string;
  mobileNumber: string;
  fatherName: string;
  motherName: string;
  villageTown: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  email: string;
  password: string;
}

export interface RegistrationValidationErrors {
  fullName?: string;
  mobileNumber?: string;
  fatherName?: string;
  motherName?: string;
  villageTown?: string;
  block?: string;
  district?: string;
  state?: string;
  pincode?: string;
  email?: string;
  password?: string;
}

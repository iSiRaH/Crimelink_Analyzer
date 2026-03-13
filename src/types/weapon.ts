export interface OfficerDTO {
  id: number;
  name: string;
  serviceId?: string;
  badge?: string;
  role?: string;
  rank?: string;
  status?: string;
}

export interface WeaponResponseDTO {
  serialNumber: string;
  weaponType: string;
  status: string;
  remarks?: string;
  issuedTo?: OfficerDTO;
  handedOverBy?: OfficerDTO;
  issuedDate?: string;
  dueDate?: string;
  issueNote?: string;
  // Bullet tracking fields
  issuedBulletType?: string;
  issuedMagazines?: number;
}

export interface WeaponAddDTO {
  weaponType: string;
  serialNumber: string;
  remarks?: string;
}

export interface WeaponUpdateDTO {
  weaponType: string;
  status: string;
  remarks?: string;
}

export interface IssueWeaponRequest {
  weaponSerial: string;
  issuedToId: number;
  handedOverById: number;
  dueDate: string;
  issueNote?: string;
  // Bullet fields (optional)
  bulletType?: string;
  numberOfMagazines?: number;
  bulletRemarks?: string;
}

export interface ReturnWeaponRequest {
  weaponSerial: string;
  receivedByUserId: number;
  returnNote?: string;
  // Bullet return fields (optional)
  returnedMagazines?: number;
  usedBullets?: number;
  bulletCondition?: string;
  bulletRemarks?: string;
}

export type WeaponStatus = "Available" | "Issued" | "Maintenance" | "Retired";
export interface BulletResponseDTO {
  bulletId: number;
  bulletType: string;
  numberOfMagazines: number;
  remarks?: string;
  registerDate?: string;
}

export interface BulletAddDTO {
  bulletType: string;
  numberOfMagazines: number;
  remarks?: string;
}

export interface BulletUpdateDTO {
  bulletType: string;
  numberOfMagazines: number;
  remarks?: string;
}
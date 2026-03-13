export type weaponRequestType = {
  requestId: number;
  weaponSerial: string;
  ammoCount: number;
  requestedById: number;
  requestNote: string;
  status: string;
  requestedAt: string;
  resolvedAt: string | null;
};

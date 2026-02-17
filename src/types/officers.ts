export type FieldOfficerCardProps = {
  id: string;
  name: string;
  status?: string;
  onPress?: () => void;
};

export type OfficerInfo = {
  userId: number;
  name: string;
  dob: Date;
  gender: string;
  address: string;
  role: string;
  badgeNo: string;
  email: string;
  status: string;
};

export type OfficerLocationPopupProps = {
  open: boolean;
  onClose: () => void;
  officer?: OfficerInfo;
};

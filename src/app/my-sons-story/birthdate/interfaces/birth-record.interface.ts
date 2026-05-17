export interface BirthRecord {
  id: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string;
  lastName: string; // derivado: paternalLastName + maternalLastName
  birthDate: string;
  birthTime: string;
  birthDateTimeIso: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  profilePhotoKey?: string | null;
  profilePhotoUrl?: string | null; // URL presignada, no se persiste en DB
}

export interface CreateBirthPayload {
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string;
  birthDate: string;
  birthTime: string;
  birthDateTimeIso?: string;
  profilePhotoKey?: string | null;
}

export interface AgeBreakdownResponse {
  record: Pick<BirthRecord, 'id' | 'firstName' | 'lastName' | 'birthDateTimeIso'>;
  breakdown: {
    years: number;
    months: number;
    days: number;
    hours: number;
    birthIso: string;
    asOfIso: string;
  };
}

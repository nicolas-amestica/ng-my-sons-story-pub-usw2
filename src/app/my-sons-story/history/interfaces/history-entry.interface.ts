export interface HistoryAttachment {
  key: string;
  fileName: string;
  contentType: string;
  registeredAt?: string;
  viewUrl?: string;
}

export interface HistoryEntry {
  id: string;
  story: string;
  journalDate: string;
  attachments: HistoryAttachment[];
  birthdateId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface PresignFileReq {
  fileName: string;
  contentType: string;
}

export interface PresignUploadItem {
  uploadUrl: string;
  key: string;
  fileName: string;
  contentType: string;
}

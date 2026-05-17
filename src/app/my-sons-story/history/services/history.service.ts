import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, switchMap, type Observable } from 'rxjs';
import type { ApiResponseWrapper } from '@shared/interfaces/api-response.interface';
import type {
  HistoryEntry,
  PresignFileReq,
  PresignUploadItem,
} from '@my-sons-story/history/interfaces/history-entry.interface';

const base = environment.baseApi;

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly http = inject(HttpClient);

  list(birthdateId?: string): Observable<HistoryEntry[]> {
    const url = birthdateId
      ? `${base}/v1/historias?birthdateId=${encodeURIComponent(birthdateId)}`
      : `${base}/v1/historias`;
    return this.http.get<ApiResponseWrapper<HistoryEntry[]>>(url).pipe(
      map((r) => (Array.isArray(r.data) ? r.data : [])),
    );
  }

  getById(id: string): Observable<HistoryEntry> {
    return this.http
      .get<ApiResponseWrapper<HistoryEntry>>(`${base}/v1/historias/${encodeURIComponent(id)}`)
      .pipe(map((r) => r.data));
  }

  create(body: Pick<HistoryEntry, 'story' | 'journalDate'> & { birthdateId?: string | null }): Observable<HistoryEntry> {
    return this.http
      .post<ApiResponseWrapper<HistoryEntry>>(`${base}/v1/historias`, body)
      .pipe(map((r) => r.data));
  }

  update(id: string, body: Partial<Pick<HistoryEntry, 'story' | 'journalDate'>>): Observable<HistoryEntry> {
    return this.http
      .put<ApiResponseWrapper<HistoryEntry>>(`${base}/v1/historias/${encodeURIComponent(id)}`, body)
      .pipe(map((r) => r.data));
  }

  delete(id: string): Observable<{ id: string; deletedAt?: string }> {
    return this.http
      .delete<ApiResponseWrapper<{ id: string; deletedAt?: string }>>(
        `${base}/v1/historias/${encodeURIComponent(id)}`,
      )
      .pipe(map((r) => r.data));
  }

  presign(id: string, files: PresignFileReq[]): Observable<PresignUploadItem[]> {
    return this.http
      .post<ApiResponseWrapper<{ uploads: PresignUploadItem[] }>>(
        `${base}/v1/historias/${encodeURIComponent(id)}/adjuntos/presign`,
        { files },
      )
      .pipe(map((r) => r.data.uploads ?? []));
  }

  registerAttachment(id: string, key: string, fileName: string, contentType: string): Observable<HistoryEntry> {
    return this.http
      .post<ApiResponseWrapper<{ record: HistoryEntry }>>(
        `${base}/v1/historias/${encodeURIComponent(id)}/adjuntos`,
        { key, fileName, contentType },
      )
      .pipe(map((r) => r.data.record));
  }

  putToPresignedUrl(uploadUrl: string, body: Blob, contentType: string): Observable<void> {
    return from(
      fetch(uploadUrl, {
        method: 'PUT',
        body,
        headers: { 'Content-Type': contentType },
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Error al subir archivo (${res.status})`);
        }
      }),
    );
  }

  uploadAndRegister(id: string, file: File): Observable<HistoryEntry> {
    return this.presign(id, [{ fileName: file.name, contentType: file.type || 'application/octet-stream' }]).pipe(
      switchMap((uploads) => {
        const u = uploads[0];
        if (!u) throw new Error('Sin URL de subida');
        return this.putToPresignedUrl(u.uploadUrl, file, u.contentType).pipe(
          switchMap(() => this.registerAttachment(id, u.key, u.fileName, u.contentType)),
        );
      }),
    );
  }
}

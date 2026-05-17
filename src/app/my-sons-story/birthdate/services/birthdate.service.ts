import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, type Observable } from 'rxjs';
import type { ApiResponseWrapper } from '@shared/interfaces/api-response.interface';
import type { AgeBreakdownResponse, BirthRecord, CreateBirthPayload } from '@my-sons-story/birthdate/interfaces/birth-record.interface';

const base = environment.baseApi;

@Injectable({ providedIn: 'root' })
export class BirthdateService {
  private readonly http = inject(HttpClient);

  list(): Observable<BirthRecord[]> {
    return this.http.get<ApiResponseWrapper<BirthRecord[]>>(`${base}/v1/nacimientos`).pipe(
      map((r) => (Array.isArray(r.data) ? r.data : [])),
    );
  }

  getById(id: string): Observable<BirthRecord> {
    return this.http
      .get<ApiResponseWrapper<BirthRecord>>(`${base}/v1/nacimientos/${encodeURIComponent(id)}`)
      .pipe(map((r) => r.data));
  }

  getAge(id: string): Observable<AgeBreakdownResponse> {
    return this.http
      .get<ApiResponseWrapper<AgeBreakdownResponse>>(
        `${base}/v1/nacimientos/${encodeURIComponent(id)}/edad`,
      )
      .pipe(map((r) => r.data));
  }

  create(body: CreateBirthPayload): Observable<BirthRecord> {
    return this.http
      .post<ApiResponseWrapper<BirthRecord>>(`${base}/v1/nacimientos`, body)
      .pipe(map((r) => r.data));
  }

  update(id: string, body: Partial<CreateBirthPayload>): Observable<BirthRecord> {
    return this.http
      .put<ApiResponseWrapper<BirthRecord>>(`${base}/v1/nacimientos/${encodeURIComponent(id)}`, body)
      .pipe(map((r) => r.data));
  }

  delete(id: string): Observable<{ id: string; deletedAt?: string }> {
    return this.http
      .delete<ApiResponseWrapper<{ id: string; deletedAt?: string }>>(
        `${base}/v1/nacimientos/${encodeURIComponent(id)}`,
      )
      .pipe(map((r) => r.data));
  }

  presignProfilePhoto(
    id: string,
    fileName: string,
    contentType: string,
  ): Observable<{ uploadUrl: string; key: string; fileName: string; contentType: string }> {
    return this.http
      .post<ApiResponseWrapper<{ uploadUrl: string; key: string; fileName: string; contentType: string }>>(
        `${base}/v1/nacimientos/${encodeURIComponent(id)}/foto-perfil/presign`,
        { fileName, contentType },
      )
      .pipe(map((r) => r.data));
  }

  putToPresignedUrl(uploadUrl: string, body: Blob, contentType: string): Observable<void> {
    return from(
      fetch(uploadUrl, {
        method: 'PUT',
        body,
        headers: { 'Content-Type': contentType },
      }).then((res) => {
        if (!res.ok) throw new Error(`Error al subir foto (${res.status})`);
      }),
    );
  }
}

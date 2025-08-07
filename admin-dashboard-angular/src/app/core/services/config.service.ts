import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  SystemConfig, 
  CreateConfigRequest, 
  UpdateConfigRequest 
} from '../models/config.model';
import { PageRequest, PageResponse, ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly API_URL = '/api/configs';

  constructor(private http: HttpClient) { }

  getConfigs(pageRequest: PageRequest, filters?: any): Observable<PageResponse<SystemConfig>> {
    let params = new HttpParams()
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());

    if (pageRequest.sort) {
      params = params.set('sort', pageRequest.sort);
    }
    if (pageRequest.direction) {
      params = params.set('direction', pageRequest.direction);
    }

    // Add filters
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get<PageResponse<SystemConfig>>(this.API_URL, { params });
  }

  getConfigByKey(key: string): Observable<SystemConfig> {
    return this.http.get<SystemConfig>(`${this.API_URL}/key/${key}`);
  }

  getConfigById(id: string): Observable<SystemConfig> {
    return this.http.get<SystemConfig>(`${this.API_URL}/${id}`);
  }

  createConfig(configData: CreateConfigRequest): Observable<ApiResponse<SystemConfig>> {
    return this.http.post<ApiResponse<SystemConfig>>(this.API_URL, configData);
  }

  updateConfig(id: string, configData: UpdateConfigRequest): Observable<ApiResponse<SystemConfig>> {
    return this.http.put<ApiResponse<SystemConfig>>(`${this.API_URL}/${id}`, configData);
  }

  deleteConfig(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  getConfigsByCategory(category: string): Observable<SystemConfig[]> {
    return this.http.get<SystemConfig[]>(`${this.API_URL}/category/${category}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/categories`);
  }

  bulkUpdateConfigs(configs: { id: string; value: string }[]): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.API_URL}/bulk`, { configs });
  }
}

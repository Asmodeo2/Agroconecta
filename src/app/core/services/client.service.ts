import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  ClientSearchRequest,
  ClientSummary,
  ClientStatistics,
  ActivityMetrics
} from '../../shared/models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = `${environment.apiUrl}/api/clients`;

  constructor(private http: HttpClient) {}

  createClient(request: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, request);
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  getClientByWhatsApp(phoneNumber: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/whatsapp/${phoneNumber}`);
  }

  updateClient(id: number, request: UpdateClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, request);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ===============================
  // GESTIÓN DE ESTADO
  // ===============================

  activateClient(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/activate`, {}, { responseType: 'text' });
  }

  deactivateClient(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/deactivate`, {}, { responseType: 'text' });
  }

  // ===============================
  // GESTIÓN DE INTERACCIONES
  // ===============================

  recordInteraction(id: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${id}/interaction`, {}, { responseType: 'text' });
  }

  recordInteractionByWhatsApp(phoneNumber: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/whatsapp/${phoneNumber}/interaction`, {}, { responseType: 'text' });
  }

  // ===============================
  // CONSULTAS Y BÚSQUEDAS
  // ===============================

  getActiveClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  searchClients(request: ClientSearchRequest): Observable<Client[]> {
    let params = new HttpParams();

    if (request.nombre) {
      params = params.set('nombre', request.nombre);
    }
    if (request.mercadoZona) {
      params = params.set('mercadoZona', request.mercadoZona);
    }
    if (request.tipoCliente) {
      params = params.set('tipoCliente', request.tipoCliente);
    }
    if (request.soloActivos !== undefined) {
      params = params.set('soloActivos', request.soloActivos.toString());
    }
    if (request.diasSinActividad) {
      params = params.set('diasSinActividad', request.diasSinActividad.toString());
    }

    return this.http.get<Client[]>(`${this.apiUrl}/search`, { params });
  }

  searchClientsByName(name: string): Observable<Client[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Client[]>(`${this.apiUrl}/search/name`, { params });
  }

  getClientsByMercado(mercado: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/mercado/${mercado}`);
  }

  getClientsByTipo(tipo: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  // ===============================
  // ANÁLISIS DE ACTIVIDAD
  // ===============================

  getClientsWithRecentActivity(days: number = 30): Observable<Client[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<Client[]>(`${this.apiUrl}/recent-activity`, { params });
  }

  getInactiveClients(daysWithoutActivity: number = 60): Observable<Client[]> {
    const params = new HttpParams().set('daysWithoutActivity', daysWithoutActivity.toString());
    return this.http.get<Client[]>(`${this.apiUrl}/inactive`, { params });
  }

  getRecentClients(days: number = 30): Observable<Client[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<Client[]>(`${this.apiUrl}/recent`, { params });
  }

  getClientsNeedingFollowUp(daysWithoutActivity: number = 45): Observable<Client[]> {
    const params = new HttpParams().set('daysWithoutActivity', daysWithoutActivity.toString());
    return this.http.get<Client[]>(`${this.apiUrl}/need-followup`, { params });
  }

  // ===============================
  // RESÚMENES Y ESTADÍSTICAS
  // ===============================

  getClientSummary(id: number): Observable<ClientSummary> {
    return this.http.get<ClientSummary>(`${this.apiUrl}/${id}/summary`);
  }

  getClientStatistics(): Observable<ClientStatistics> {
    return this.http.get<ClientStatistics>(`${this.apiUrl}/statistics`);
  }

  getActivityMetrics(days: number = 30): Observable<ActivityMetrics> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ActivityMetrics>(`${this.apiUrl}/metrics/activity`, { params });
  }

  // ===============================
  // UTILIDADES
  // ===============================

  getAvailableMercados(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/mercados`);
  }

  getAvailableClientTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tipos`);
  }

  validateWhatsApp(phoneNumber: string): Observable<boolean> {
    const params = new HttpParams().set('phoneNumber', phoneNumber);
    return this.http.get<boolean>(`${this.apiUrl}/whatsapp/validate`, { params });
  }

  // ===============================
  // MÉTODOS DE UTILIDAD LOCALES
  // ===============================

  formatWhatsAppNumber(phone: string): string {
    // Remover espacios y caracteres especiales
    const cleaned = phone.replace(/\D/g, '');

    // Formatear según el patrón peruano
    if (cleaned.startsWith('51') && cleaned.length === 11) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }

    // Formato genérico
    return phone;
  }

  validateWhatsAppFormat(phone: string): boolean {
    // Validación básica de formato de WhatsApp
    const pattern = /^\+?[1-9]\d{1,14}$/;
    return pattern.test(phone.replace(/\s/g, ''));
  }

  getActivityStatusColor(daysSinceLastInteraction: number): string {
    if (daysSinceLastInteraction <= 7) return 'success';
    if (daysSinceLastInteraction <= 30) return 'warning';
    return 'danger';
  }

  getActivityStatusText(daysSinceLastInteraction: number): string {
    if (daysSinceLastInteraction === 0) return 'Activo hoy';
    if (daysSinceLastInteraction <= 7) return 'Activo';
    if (daysSinceLastInteraction <= 30) return 'Poco activo';
    return 'Inactivo';
  }
}
export interface Client {
  id?: number;
  nombre: string;
  telefonoWhatsapp: string;
  mercadoZona: string;
  tipoCliente: string;
  direccion?: string;
  contactoAdicional?: string;
  activo: boolean;
  fechaRegistro?: Date;
  fechaUltimaInteraccion?: Date;
  fechaActualizacion?: Date;
  diasSinInteraccion?: number;
}

export interface CreateClientRequest {
  nombre: string;
  telefonoWhatsapp: string;
  mercadoZona: string;
  tipoCliente: string;
  direccion?: string;
  contactoAdicional?: string;
}

export interface UpdateClientRequest {
  nombre: string;
  mercadoZona: string;
  direccion?: string;
  contactoAdicional?: string;
}

export interface ClientSearchRequest {
  nombre?: string;
  mercadoZona?: string;
  tipoCliente?: string;
  soloActivos?: boolean;
  diasSinActividad?: number;
}

export interface ClientSummary {
  cliente: Client;
  diasDesdeRegistro: number;
  diasSinInteraccion: number;
  estadoActividad: string;
  totalPedidos: number;
}

export interface ClientStatistics {
  totalClientes: number;
  clientesActivos: number;
  clientesInactivos: number;
  clientesRecientes: number;
  clientesConActividadReciente: number;
  clientesNecesitanSeguimiento: number;
  tasaActividad: number;
}

export interface ActivityMetrics {
  periodoDias: number;
  totalInteracciones: number;
  clientesUnicos: number;
  nuevosClientes: number;
  promedioInteraccionesPorCliente: number;
  interaccionesPorMercado: { [key: string]: number };
  interaccionesPorTipoCliente: { [key: string]: number };
}
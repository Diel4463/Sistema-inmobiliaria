export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';
export type PropertyStatus = 'ACTIVE' | 'SOLD' | 'PENDING' | 'INACTIVE';
export type FileType = 'PDF' | 'WORD' | 'IMAGE' | 'OTHER';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  createdBy?: { fullName: string };
}

export interface Property {
  id: string;
  internalCode: string;
  status: PropertyStatus;
  isPublic: boolean;
  propietarioNombre?: string;
  ubicacionMigrada?: string;
  denominado?: string;
  viasDeAcceso?: string;
  usoActual?: string;
  superficieTerreno?: string;
  superficieConstruccion?: string;
  noContaAgua: boolean;
  noContaPredial: boolean;
  observaciones?: string;
  propertyType?: string;
  category?: string;
  libros?: string;
  numeroExpediente?: string;
  tipoCredito?: string;
  rfcDeudor?: string;
  soporteGravamen?: string;
  fechaRegistro?: string;
  importeAdjudicacion?: string | number;
  importeAdeudo?: string | number;
  fechaAperturaCredito?: string;
  importeAperturaCredito?: string | number;
  fechaAvaluo?: string;
  importeAvaluo?: string | number;
  fechaUltimoAvaluo?: string;
  importeUltimoAvaluo?: string | number;
  fechaAdjudicacion?: string;
  valorLibros?: string | number;
  calle?: string;
  colonia?: string;
  municipio?: string;
  estado?: string;
  cp?: string;
  pais?: string;
  numeroBienes?: number;
  centroCostos?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { fullName: string; username: string };
  files?: FileRecord[];
  expedientes?: Expediente[];
  _count?: { files: number; expedientes: number };
}

export interface Expediente {
  id: string;
  numero: number;
  titulo: string;
  descripcion?: string;
  adjudicadoPor?: string;
  fechaIngreso: string;
  propertyId: string;
  files?: FileRecord[];
  createdAt: string;
}

export interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  fileType: FileType;
  propertyId?: string;
  expedienteId?: string;
  uploadedBy?: { fullName: string };
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  ACTIVE: 'Activo',
  SOLD: 'Vendido',
  PENDING: 'Pendiente',
  INACTIVE: 'Inactivo',
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
};

export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  description: string;
  changes?: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    role?: Role;
  };
  propertyId?: string;
  property?: {
    id: string;
    internalCode: string;
    propietarioNombre?: string;
  };
  createdAt: string;
}

export const ACTION_LABELS: Record<ActivityAction, string> = {
  CREATE: 'Creación',
  UPDATE: 'Modificación',
  DELETE: 'Eliminación',
};

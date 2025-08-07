export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  type: ConfigType;
  category: string;
  isReadOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ConfigType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON'
}

export interface CreateConfigRequest {
  key: string;
  value: string;
  description: string;
  type: ConfigType;
  category: string;
}

export interface UpdateConfigRequest {
  value: string;
  description?: string;
}


export interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  congestionLevel: number; // 0 to 100
  status: 'normal' | 'congested' | 'critical';
  lightDuration: number; // seconds
  policeDispatched: boolean; // New field for police feature
}

export interface Link {
  source: string;
  target: string;
  flowRate: number; // cars per minute
  distance: number;
}

export interface TrafficData {
  nodes: Node[];
  links: Link[];
  timestamp: number;
  overallHealth: number; // 0-100
}

export interface OptimizationSuggestion {
  nodeId: string;
  currentDuration: number;
  suggestedDuration: number;
  reasoning: string;
}

export interface SimulationMetrics {
  averageSpeed: number;
  totalCars: number;
  incidents: number;
  co2Emission: number;
}

export enum SimScenario {
  NORMAL = 'Normal Flow',
  RUSH_HOUR = 'Rush Hour',
  ACCIDENT = 'Accident on Main',
  EVENT = 'Stadium Event'
}

export interface User {
  username: string;
  role: 'ADMIN' | 'OFFICER' | 'VIEWER';
  lastLogin: string;
}

export interface VehicleRecord {
  id: string;
  plate: string;
  owner: string;
  vehicle: string;
  status: 'CLEAR' | 'WANTED' | 'EXPIRED';
  challans: number;
  registered: string;
}

export interface IncidentRecord {
  id: string;
  type: 'ACCIDENT' | 'BREAKDOWN' | 'VIP_MOVEMENT' | 'PROTEST' | 'ROAD_WORK';
  location: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  reportedBy: string;
  timestamp: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
}


import { VehicleRecord, IncidentRecord, AuditLog } from '../types';

const DB_KEY_VEHICLES = 'trafficnet_vehicles_db_v1';
const DB_KEY_INCIDENTS = 'trafficnet_incidents_db_v1';
const DB_KEY_LOGS = 'trafficnet_logs_db_v1';

// --- SEED DATA ---

const INITIAL_VEHICLES: VehicleRecord[] = [
  { id: 'REC-1001', plate: 'KA-01 AB 1234', owner: 'Rajesh Kumar', vehicle: 'Maruti Swift', status: 'CLEAR', challans: 0, registered: '2023-01-15' },
  { id: 'REC-1002', plate: 'DL-3C XY 9876', owner: 'Priya Sharma', vehicle: 'Hyundai Creta', status: 'WANTED', challans: 3, registered: '2022-11-20' },
  { id: 'REC-1003', plate: 'MH-02 CD 4567', owner: 'Amit Patel', vehicle: 'Tata Nexon', status: 'CLEAR', challans: 1, registered: '2024-02-10' },
  { id: 'REC-1004', plate: 'TN-09 EF 3210', owner: 'Sneha Reddy', vehicle: 'Mahindra Thar', status: 'EXPIRED', challans: 0, registered: '2019-05-05' },
  { id: 'REC-1005', plate: 'UP-16 GH 7890', owner: 'Vikram Singh', vehicle: 'Toyota Innova', status: 'CLEAR', challans: 0, registered: '2021-08-12' },
];

const INITIAL_INCIDENTS: IncidentRecord[] = [
  { id: 'INC-501', type: 'ACCIDENT', location: 'Silk Board Junction', description: 'Two car collision, minor injuries.', status: 'RESOLVED', reportedBy: 'Auto-Detect', timestamp: '2024-05-20 08:30 AM', priority: 'HIGH' },
  { id: 'INC-502', type: 'VIP_MOVEMENT', location: 'Connaught Place', description: 'PM Convoy route sanitation.', status: 'OPEN', reportedBy: 'Admin Officer', timestamp: '2024-05-20 10:15 AM', priority: 'HIGH' },
];

const INITIAL_LOGS: AuditLog[] = [
  { id: 'LOG-001', action: 'SYSTEM_BOOT', user: 'SYSTEM', details: 'TrafficNet Server initialized.', timestamp: '2024-05-20 08:00 AM' }
];

// --- VEHICLE METHODS ---

export const getVehicles = (): VehicleRecord[] => {
  try {
    const stored = localStorage.getItem(DB_KEY_VEHICLES);
    if (!stored) {
      localStorage.setItem(DB_KEY_VEHICLES, JSON.stringify(INITIAL_VEHICLES));
      return INITIAL_VEHICLES;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("DB Error", e);
    return INITIAL_VEHICLES;
  }
};

export const addVehicle = (vehicle: Omit<VehicleRecord, 'id'>): VehicleRecord[] => {
  const current = getVehicles();
  const newRecord: VehicleRecord = {
    ...vehicle,
    id: `REC-${Math.floor(Math.random() * 9000 + 1000)}`
  };
  const updated = [newRecord, ...current];
  localStorage.setItem(DB_KEY_VEHICLES, JSON.stringify(updated));
  logAction('ADD_VEHICLE', 'Admin', `Added record for ${vehicle.plate}`);
  return updated;
};

export const deleteVehicle = (id: string): VehicleRecord[] => {
  const current = getVehicles();
  const updated = current.filter(v => v.id !== id);
  localStorage.setItem(DB_KEY_VEHICLES, JSON.stringify(updated));
  logAction('DELETE_VEHICLE', 'Admin', `Deleted record ${id}`);
  return updated;
};

export const issueChallan = (id: string, amount: number, reason: string): VehicleRecord[] => {
    const current = getVehicles();
    const updated = current.map(v => {
        if (v.id === id) {
            return { ...v, challans: v.challans + 1, status: v.challans + 1 > 5 ? 'WANTED' as const : v.status };
        }
        return v;
    });
    localStorage.setItem(DB_KEY_VEHICLES, JSON.stringify(updated));
    logAction('ISSUE_CHALLAN', 'Officer', `Fined ${id} ₹${amount} for ${reason}`);
    return updated;
}

// --- INCIDENT METHODS ---

export const getIncidents = (): IncidentRecord[] => {
    try {
        const stored = localStorage.getItem(DB_KEY_INCIDENTS);
        if (!stored) {
            localStorage.setItem(DB_KEY_INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
            return INITIAL_INCIDENTS;
        }
        return JSON.parse(stored);
    } catch (e) {
        return INITIAL_INCIDENTS;
    }
};

export const addIncident = (incident: Omit<IncidentRecord, 'id' | 'timestamp'>): IncidentRecord[] => {
    const current = getIncidents();
    const newRecord: IncidentRecord = {
        ...incident,
        id: `INC-${Math.floor(Math.random() * 900 + 100)}`,
        timestamp: new Date().toLocaleString()
    };
    const updated = [newRecord, ...current];
    localStorage.setItem(DB_KEY_INCIDENTS, JSON.stringify(updated));
    logAction('REPORT_INCIDENT', incident.reportedBy, `Reported ${incident.type} at ${incident.location}`);
    return updated;
};

export const resolveIncident = (id: string): IncidentRecord[] => {
    const current = getIncidents();
    const updated = current.map(inc => inc.id === id ? { ...inc, status: 'RESOLVED' as const } : inc);
    localStorage.setItem(DB_KEY_INCIDENTS, JSON.stringify(updated));
    logAction('RESOLVE_INCIDENT', 'Admin', `Resolved incident ${id}`);
    return updated;
};

// --- LOG METHODS ---

export const getLogs = (): AuditLog[] => {
    try {
        const stored = localStorage.getItem(DB_KEY_LOGS);
        if (!stored) return INITIAL_LOGS;
        return JSON.parse(stored);
    } catch { return INITIAL_LOGS; }
};

export const logAction = (action: string, user: string, details: string) => {
    const current = getLogs();
    const newLog: AuditLog = {
        id: `LOG-${Date.now()}`,
        action,
        user,
        details,
        timestamp: new Date().toLocaleString()
    };
    // Keep last 100 logs
    const updated = [newLog, ...current].slice(0, 100);
    localStorage.setItem(DB_KEY_LOGS, JSON.stringify(updated));
};

export const resetDatabase = (): void => {
    console.log("System Reset Initiated");
    localStorage.clear();
    sessionStorage.clear();
    location.reload(); 
}

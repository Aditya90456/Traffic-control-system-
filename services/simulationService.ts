import { TrafficData, Node, Link, SimScenario } from '../types';

// Indian Traffic Hotspots Configuration
const INDIAN_LOCATIONS = [
  "Silk Board Junction", "Teen Hath Naka", "Connaught Place", "Hebbal Flyover",
  "Cyber Hub", "Ashram Chowk", "Koramangala 80ft", "MG Road",
  "Hitec City Main", "Electronic City Toll", "Chandni Chowk", "Marine Drive",
  "Brigade Road", "Outer Ring Road", "Indiranagar", "Rajiv Chowk",
  "Tin Factory", "Marathahalli Bridge", "Powai Lake Rd", "Sector 18 Noida"
];

const GRID_ROWS = 4;
const GRID_COLS = 5;

const generateInitialNodes = (): Node[] => {
  const nodes: Node[] = [];
  let labelIndex = 0;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      nodes.push({
        id: `n-${r}-${c}`,
        x: c * 200 + 100,
        y: r * 150 + 100,
        label: INDIAN_LOCATIONS[labelIndex++ % INDIAN_LOCATIONS.length],
        congestionLevel: Math.floor(Math.random() * 40) + 10,
        status: 'normal',
        lightDuration: 60, // Longer signal times for Indian traffic
        policeDispatched: false
      });
    }
  }
  return nodes;
};

const generateInitialLinks = (nodes: Node[]): Link[] => {
  const links: Link[] = [];
  nodes.forEach(node => {
    const [_, rStr, cStr] = node.id.split('-');
    const r = parseInt(rStr);
    const c = parseInt(cStr);

    // Connect right
    if (c < GRID_COLS - 1) {
      links.push({
        source: node.id,
        target: `n-${r}-${c + 1}`,
        flowRate: Math.floor(Math.random() * 20) + 5,
        distance: 1
      });
    }
    // Connect down
    if (r < GRID_ROWS - 1) {
      links.push({
        source: node.id,
        target: `n-${r + 1}-${c}`,
        flowRate: Math.floor(Math.random() * 20) + 5,
        distance: 1
      });
    }
  });
  return links;
};

let nodes = generateInitialNodes();
let links = generateInitialLinks(nodes);

export const getSimulationState = (scenario: SimScenario): TrafficData => {
  // Scenario Multipliers
  const multiplier = scenario === SimScenario.RUSH_HOUR ? 1.8 : 
                     scenario === SimScenario.ACCIDENT ? 1.3 : 
                     scenario === SimScenario.EVENT ? 1.5 : 1;
  
  // Update Nodes
  nodes = nodes.map(node => {
    let change = (Math.random() - 0.5) * 8;
    
    // Scenario specific logic
    if (scenario === SimScenario.RUSH_HOUR) {
        // Indian Rush hour is intense
        change += 2; 
    }
    
    // Simulate chaos at specific nodes based on names
    if (node.label.includes("Silk Board") || node.label.includes("Teen Hath")) {
        change += 3;
    }

    if (scenario === SimScenario.ACCIDENT && node.label === 'Ashram Chowk') {
        return { ...node, congestionLevel: 98, status: 'critical' };
    }

    // Police Effect: If police are dispatched, reduce congestion drastically over time
    if (node.policeDispatched) {
        change -= 15; 
    }

    let newCongestion = Math.max(0, Math.min(100, node.congestionLevel + change * multiplier));
    
    let status: Node['status'] = 'normal';
    if (newCongestion > 65) status = 'congested';
    if (newCongestion > 85) status = 'critical';

    // Auto-remove police if congestion clears
    let policeState = node.policeDispatched;
    if (policeState && newCongestion < 30) {
        policeState = false;
    }

    return {
      ...node,
      congestionLevel: newCongestion,
      status,
      policeDispatched: policeState
    };
  });

  const healthSum = nodes.reduce((acc, n) => acc + (100 - n.congestionLevel), 0);

  return {
    nodes,
    links,
    timestamp: Date.now(),
    overallHealth: Math.round(healthSum / nodes.length)
  };
};

export const dispatchPoliceToNode = (nodeId: string) => {
    nodes = nodes.map(n => n.id === nodeId ? { ...n, policeDispatched: true } : n);
};
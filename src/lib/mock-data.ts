
import type { UserProfile, GameState, CompetitorLogEntry, PeerData, RoleActionItems } from "@/types";

export const USER_PROFILES: UserProfile[] = [
  { id: 'procurement', name: 'Procurement Manager', avatarUrl: 'https://picsum.photos/seed/procurement/100/100' },
  { id: 'production', name: 'Production Manager', avatarUrl: 'https://picsum.photos/seed/production/100/100' },
  { id: 'logistics', name: 'Logistics Manager', avatarUrl: 'https://picsum.photos/seed/logistics/100/100' },
  { id: 'sales', name: 'Sales Manager', avatarUrl: 'https://picsum.photos/seed/sales/100/100' },
];

export const INITIAL_GAME_STATE: GameState = {
  companyValuation: 50000000,
  netIncome: 2500000,
  inventoryValue: 750000,
  totalEmissions: 1200,
  teamStrategy: "Focus on high-margin products and expand market share in Europe.",
  kpiHistory: [
    { round: 1, companyValuation: 45000000, netIncome: 1800000, inventoryValue: 600000, totalEmissions: 1100 },
    { round: 2, companyValuation: 48000000, netIncome: 2200000, inventoryValue: 700000, totalEmissions: 1150 },
    { round: 3, companyValuation: 50000000, netIncome: 2500000, inventoryValue: 750000, totalEmissions: 1200 },
  ],
};

export const ROLE_ACTION_ITEMS: RoleActionItems = {
    procurement: [
        "Review supplier contracts and negotiate better terms.",
        "Analyze raw material inventory levels and place new orders.",
        "Monitor purchase order status and resolve any delays.",
    ],
    production: [
        "Check the production schedule and adjust for demand changes.",
        "Monitor manufacturing capacity and efficiency.",
        "Ensure quality control standards are being met.",
    ],
    logistics: [
        "Analyze shipping costs and optimize delivery routes.",
        "Manage warehouse inventory and stock transfers.",
        "Coordinate with sales on finished goods availability.",
    ],
    sales: [
        "Update sales forecasts based on market trends.",
        "Analyze pricing strategies against competitors.",
        "Engage with key customers and gather feedback.",
    ],
    team_leader: [
        "Review overall team performance against KPIs.",
        "Coordinate with all managers to ensure strategy alignment.",
        "Prepare the summary report for the next round debriefing.",
    ]
};

export const MOCK_COMPETITOR_LOG: CompetitorLogEntry[] = [
    { id: '1', text: 'Team Alpha is heavily investing in marketing in North America.', author: 'Sales Manager', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: '2', text: 'Team Bravo seems to be struggling with their supply chain.', author: 'Procurement Manager', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: '3', text: 'Keep an eye on Team Charlie\'s new product launch.', author: 'Sales Manager', createdAt: new Date(Date.now() - 15 * 60 * 1000) },
];

export const MOCK_PEER_DATA: PeerData[] = [
    { name: 'Team Alpha', companyValuation: 55000000, netIncome: 2800000, totalEmissions: 1300 },
    { name: 'Team Bravo', companyValuation: 48000000, netIncome: 2100000, totalEmissions: 1050 },
    { name: 'Team Charlie', companyValuation: 62000000, netIncome: 3500000, totalEmissions: 1500 },
];

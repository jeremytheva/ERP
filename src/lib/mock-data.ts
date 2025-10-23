import type { UserProfile, GameState, ActionItem, CompetitorLogEntry, PeerData } from "@/types";

export const USER_PROFILES: UserProfile[] = [
  { id: 'ceo', name: 'CEO', avatarUrl: 'https://picsum.photos/seed/ceo/100/100' },
  { id: 'cfo', name: 'CFO', avatarUrl: 'https://picsum.photos/seed/cfo/100/100' },
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

export const MOCK_ACTION_ITEMS: ActionItem[] = [
    { id: '1', text: 'Analyze competitor pricing for Q3.', completed: false },
    { id: '2', text: 'Review marketing spend effectiveness.', completed: true },
    { id: '3', text: 'Prepare presentation for next round.', completed: false },
];

export const MOCK_COMPETITOR_LOG: CompetitorLogEntry[] = [
    { id: '1', text: 'Team Alpha is heavily investing in marketing in North America.', author: 'CEO', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: '2', text: 'Team Bravo seems to be struggling with their supply chain.', author: 'CFO', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: '3', text: 'Keep an eye on Team Charlie\'s new product launch.', author: 'CEO', createdAt: new Date(Date.now() - 15 * 60 * 1000) },
];

export const MOCK_PEER_DATA: PeerData[] = [
    { name: 'Team Alpha', companyValuation: 55000000, netIncome: 2800000, totalEmissions: 1300 },
    { name: 'Team Bravo', companyValuation: 48000000, netIncome: 2100000, totalEmissions: 1050 },
    { name: 'Team Charlie', companyValuation: 62000000, netIncome: 3500000, totalEmissions: 1500 },
];

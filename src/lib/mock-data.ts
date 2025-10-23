

import type { UserProfile, GameState, CompetitorLogEntry, PeerData, RoleActionItems, Task } from "@/types";

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


export const ALL_TASKS: Task[] = [
  // --- ROUND 1 SETUP TASKS ---
  {
    id: "T0.1",
    title: "Confirm Initial Finished Goods Stock",
    description: "Verify and adjust the starting inventory levels for all finished products. This is a one-time setup for Round 1.",
    role: "Logistics",
    transactionCode: "ZMB52",
    priority: "Critical",
    estimatedTime: 5,
    roundRecurrence: "Once",
    startRound: 1,
    timeframeConstraint: "StartPhase",
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    dataFields: [
      { fieldName: "Yogurt_Initial_Stock", dataType: "Integer", suggestedValue: 50000 },
      { fieldName: "Muesli_Initial_Stock", dataType: "Integer", suggestedValue: 50000 },
    ]
  },
  {
    id: "T0.2",
    title: "Confirm Initial Raw Material Stock",
    description: "Verify and adjust the starting inventory for all raw materials. This is a one-time setup for Round 1.",
    role: "Procurement",
    transactionCode: "ZMB52",
    priority: "Critical",
    estimatedTime: 5,
    roundRecurrence: "Once",
    startRound: 1,
    timeframeConstraint: "StartPhase",
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    dataFields: [
      { fieldName: "Milk_Initial_Stock", dataType: "Integer", suggestedValue: 60000 },
      { fieldName: "Packaging_Initial_Stock", dataType: "Integer", suggestedValue: 100000 },
    ]
  },
  {
    id: "T0.3",
    title: "Validate & Confirm Bill of Materials (BOM)",
    description: "Check the recipes for all products to ensure they are correct before starting production. This is a one-time setup for Round 1.",
    role: "Production",
    transactionCode: "CS03",
    priority: "Critical",
    estimatedTime: 10,
    roundRecurrence: "Once",
    startRound: 1,
    timeframeConstraint: "StartPhase",
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard"
  },
  // --- REGULAR TASKS ---
  {
    id: "T1",
    title: "Forecast Sales",
    description: "Create the sales forecast for all products for the upcoming period.",
    role: "Sales",
    transactionCode: "MD61",
    priority: "Critical",
    estimatedTime: 10,
    roundRecurrence: "RoundStart",
    timeframeConstraint: "StartPhase",
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    dataFields: [
      { fieldName: "Yogurt_Forecast", dataType: "Integer", suggestedValue: 120000 },
      { fieldName: "Muesli_Forecast", dataType: "Integer", suggestedValue: 250000 },
    ]
  },
  {
    id: "T2",
    title: "Plan Production",
    description: "Run MRP and convert planned orders to production orders.",
    role: "Production",
    transactionCode: "MD01, CO41",
    priority: "Critical",
    estimatedTime: 15,
    roundRecurrence: "RoundStart",
    timeframeConstraint: "StartPhase",
    dependencyIDs: ["T1"],
    completionType: "Manual-Tick",
    taskType: "Standard"
  },
  {
    id: "T3",
    title: "Procure Raw Materials",
    description: "Order raw materials needed for the production plan.",
    role: "Procurement",
    transactionCode: "ZME21N",
    priority: "Critical",
    estimatedTime: 10,
    roundRecurrence: "RoundStart",
    timeframeConstraint: "StartPhase",
    dependencyIDs: ["T2"],
    completionType: "Manual-Tick",
    taskType: "Standard"
  },
  {
    id: "T4",
    title: "Check Inventory Report",
    description: "Continuously monitor inventory levels of raw materials and finished goods.",
    role: "Logistics",
    transactionCode: "ZMB52",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "Continuous",
    timeframeConstraint: "None",
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard"
  },
  {
    id: "T5",
    title: "Review Market Reports",
    description: "Analyze market reports to understand competitor pricing and market share.",
    role: "Sales",
    transactionCode: "ZMARKET",
    priority: "High",
    estimatedTime: 10,
    roundRecurrence: "Continuous",
    timeframeConstraint: "None",
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    dataFields: [{ fieldName: "Competitor_Avg_Price", dataType: "Currency" }]
  },
  {
    id: "T6",
    title: "Set Product Prices",
    description: "Adjust the selling price for all finished products based on strategy and market data.",
    role: "Sales",
    transactionCode: "VK32",
    priority: "High",
    estimatedTime: 8,
    roundRecurrence: "RoundStart",
    timeframeConstraint: "StartPhase",
    dependencyIDs: ["T5"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    dataFields: [
      {
        fieldName: "Yogurt_Selling_Price",
        dataType: "Currency",
        suggestedValue: 3.85,
        aiRationale: "Suggested by Strategic Advisor based on competitor's historical low margin of 15%."
      }
    ]
  },
  {
    id: "T7",
    title: "Run Marketing Campaign",
    description: "Set the marketing budget for each product.",
    role: "Sales",
    transactionCode: "ZADS",
    priority: "Medium",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    timeframeConstraint: "StartPhase",
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    dataFields: [{ fieldName: "Total_Marketing_Spend", dataType: "Currency", suggestedValue: 50000 }]
  },
  {
    id: "T8",
    title: "Review Financial Statements",
    description: "Analyze the company's financial performance to track profitability.",
    role: "Team Leader",
    transactionCode: "F.01",
    priority: "High",
    estimatedTime: 10,
    roundRecurrence: "Continuous",
    timeframeConstraint: "None",
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard"
  }
];

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

    
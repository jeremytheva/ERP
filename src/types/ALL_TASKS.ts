import type { Task } from "./index";
import { AlertsEnum } from "./index";

export const ALL_TASKS: Task[] = [
  // =========================
  // TEAM LEADER — Rounds 1–2
  // =========================

  // Original TL-1 → TL-1.2
  {
    id: "TL-1.2",
    version: 2,
    round: 2,
    title: "Round Start Review & Strategic Alignment",
    description: "Check Gross Margin target ≥ 20%. Ensure all roles align decisions to this target.",
    role: "Team Leader",
    transactionCode: "F.01 / ZVC2",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 2,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Revenue",
    dataFields: [
      {
        fieldName: "Gross_Margin_Pct",
        dataType: "Percent",
        calculatedFrom: ["GMPercent"],
        formula: ({ GMPercent }) => Number(GMPercent ?? 0),
        aiHelp: "Ensure ≥ 20%. If lower, coordinate Sales pricing and Procurement costs."
      }
    ]
  },

  // Original TL-2 → TL-2.2
  {
    id: "TL-2.2",
    version: 2,
    round: 2,
    title: "Cash Runway & Loan Management",
    description: "Minimize interest while avoiding liquidity crisis. Consider loan payments after profitable rounds with cash > €200k.",
    role: "Team Leader",
    transactionCode: "Dashboard / ZFF7B",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "Continuous",
    startRound: 2,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Risk",
    visibility: "OnAlert",
    alertKey: AlertsEnum.CASH_LOW,
    dataFields: [
      {
        fieldName: "Cash_Balance",
        dataType: "Currency",
        calculatedFrom: ["CashBalance"],
        formula: ({ CashBalance }) => Number(CashBalance ?? 0),
        aiHelp: "Freeze non-essential spend if cash dips below €100k."
      }
    ]
  },

  // Original TL-3 → TL-3.2
  {
    id: "TL-3.2",
    version: 2,
    round: 2,
    title: "Strategy & Contingency Check",
    description: "If cash alert or RM shortage, instruct Procurement to switch to fast vendor and Logistics to hold non-critical transfers.",
    role: "Team Leader",
    transactionCode: "N/A",
    priority: "Medium",
    estimatedTime: 5,
    roundRecurrence: "Continuous",
    startRound: 2,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Risk",
    visibility: "OnAlert",
    alertKey: AlertsEnum.RM_SHORTAGE
  },

  // Original TL-4 → TL-4.2
  {
    id: "TL-4.2",
    version: 2,
    round: 2,
    title: "Final Strategic & Financial Lock-Down",
    description: "Confirm Net Income is positive; verify sustainability investment posting before round end.",
    role: "Team Leader",
    transactionCode: "Dashboard / ZFB50",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 2,
    dependencyIDs: ["P-4.2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Sustainability"
  },

  // Original TL-5 → TL-5.2
  {
    id: "TL-5.2",
    version: 2,
    round: 3,
    title: "Strategic Investment: Setup Time Reduction",
    description: "Early setup-reduction investment improves capacity & COGS. Highest ROI when done early (R3/R4).",
    role: "Team Leader",
    transactionCode: "ZFB50",
    priority: "Medium",
    estimatedTime: 10,
    roundRecurrence: "Once",
    startRound: 3,
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "Standard",
    completed: false,
    impact: "Capacity",
    dataFields: [
      {
        fieldName: "Setup_Time_Reduction_Investment",
        dataType: "Currency",
        suggestedValue: 50000,
        calculatedFrom: ["OldSetupTimeHrs", "NewSetupTimeHrs", "CostPerHour", "ProjectedSetups"],
        formula: ({ OldSetupTimeHrs, NewSetupTimeHrs, CostPerHour, ProjectedSetups }) => {
          const dt = Math.max(0, Number(OldSetupTimeHrs ?? 0) - Number(NewSetupTimeHrs ?? 0));
          return dt * Number(CostPerHour ?? 0) * Number(ProjectedSetups ?? 0);
        },
        aiHelp: "Invest when savings across remaining rounds are clearly positive."
      }
    ]
  },

  // NEW (Stage 1) — TL liquidity and competitive review
  {
    id: "TL-R1-1.2",
    version: 2,
    round: 1,
    title: "Liquidity Check",
    description: "Ensure cash ≥ €200k. If below threshold, freeze non-essential spending.",
    role: "Team Leader",
    transactionCode: "ZFF7B",
    priority: "High",
    estimatedTime: 3,
    roundRecurrence: "Continuous",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Ongoing",
    taskType: "Standard",
    completed: false,
    impact: "Risk",
    visibility: "OnAlert",
    alertKey: AlertsEnum.CASH_LOW,
    dataFields: [
      {
        fieldName: "Cash_Balance",
        dataType: "Currency",
        calculatedFrom: ["CashBalance"],
        formula: ({ CashBalance }) => Number(CashBalance ?? 0)
      }
    ]
  },
  {
    id: "TL-R2-1.2",
    version: 2,
    round: 2,
    title: "Early Competitive Review",
    description: "Review competitors' price/ad moves. Adjust price gaps or ad spend if needed.",
    role: "Team Leader",
    transactionCode: "Dashboard",
    priority: "Medium",
    estimatedTime: 2,
    roundRecurrence: "RoundStart",
    startRound: 2,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false,
    impact: "Revenue"
  },

  // ======================
  // SALES — Rounds 1–2
  // ======================

  // Original S-1 → S-1.2
  {
    id: "S-1.2",
    version: 2,
    round: 1,
    title: "Market Analysis & Price Strategy",
    description: "Model PED by DC; target optimal price while keeping GM% ≥ 20%.",
    role: "Sales",
    transactionCode: "ZMARKET / VK32",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false,
    impact: "Revenue",
    dataFields: [
      {
        fieldName: "Target_GM_Pct",
        dataType: "Percent",
        suggestedValue: 20,
        calculatedFrom: ["GMPercent"],
        formula: ({ GMPercent }) => Number(GMPercent ?? 0)
      }
    ]
  },

  // Original S-2 → S-2.2
  {
    id: "S-2.2",
    version: 2,
    round: 1,
    title: "Capacity & Inventory Constraint Check",
    description: "Ensure R-N Forecast ≤ Production Capacity + FG Stock.",
    role: "Sales",
    transactionCode: "ZMB52 / Dashboard",
    priority: "High",
    estimatedTime: 3,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false,
    impact: "Capacity",
    dataFields: [
      {
        fieldName: "Forecast_Units",
        dataType: "Integer",
        suggestedValue: 48000,
        calculatedFrom: ["TotalForecast", "ProductionCapacity", "FGStock"],
        formula: ({ TotalForecast, ProductionCapacity, FGStock }) =>
          Math.min(Number(TotalForecast ?? 0), Number(ProductionCapacity ?? 0) + Number(FGStock ?? 0))
      }
    ]
  },

  // Original S-3 → S-3.2
  {
    id: "S-3.2",
    version: 2,
    round: 1,
    title: "Set Viable Forecast (MD61)",
    description: "Set forecast ≥ 48,000 units for core products to run efficiently.",
    role: "Sales",
    transactionCode: "MD61",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["S-2.2"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    impact: "Capacity",
    dataFields: [
      { fieldName: "Forecast_Units", dataType: "Integer", suggestedValue: 48000 }
    ]
  },

  // Original S-4 → S-4.2
  {
    id: "S-4.2",
    version: 2,
    round: 1,
    title: "Set Marketing Budget & Channel Allocation",
    description: "Allocate majority of ZADS to highest ROI DCs.",
    role: "Sales",
    transactionCode: "ZADS",
    priority: "Medium",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["S-3.2"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    impact: "Revenue",
    dataFields: [
      { fieldName: "Marketing_Budget", dataType: "Currency", suggestedValue: 50000 },
      { fieldName: "Channel_Focus_Note", dataType: "String", suggestedValue: "Focus on DC12 and DC14" }
    ]
  },

  // NEW (Stage 1)
  {
    id: "S-R1-5.2",
    version: 2,
    round: 1,
    title: "Price Elasticity Test",
    description: "Test price variations at DC10 vs DC12 to identify early elasticity differences.",
    role: "Sales",
    transactionCode: "VK32 / ZMARKET",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["S-3.2"],
    completionType: "Manual-Tick",
    taskType: "ERPsim Input Data",
    completed: false,
    impact: "Revenue"
  },
  {
    id: "S-C2.2",
    version: 2,
    round: 1,
    title: "Sales Backlog Reaction",
    description: "If backlog > 1 day in any DC, adjust price or distribution to prevent lost sales.",
    role: "Sales",
    transactionCode: "ZMARKET",
    priority: "High",
    estimatedTime: 2,
    roundRecurrence: "Continuous",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false,
    impact: "Revenue",
    visibility: "OnAlert",
    alertKey: AlertsEnum.BACKLOG
  },
  {
    id: "S-R2-2.2",
    version: 2,
    round: 2,
    title: "Marketing ROI Check-in",
    description: "Increase spend on strongest DC response; reduce low ROI DCs.",
    role: "Sales",
    transactionCode: "ZADS",
    priority: "Medium",
    estimatedTime: 3,
    roundRecurrence: "RoundStart",
    startRound: 2,
    dependencyIDs: ["S-4.2"],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false,
    impact: "Revenue"
  },

  // =========================
  // PRODUCTION — Rounds 1–2
  // =========================

  // Original PM-1 → PM-1.2
  {
    id: "PM-1.2",
    version: 2,
    round: 1,
    title: "Lot Size Strategy & BOM Alignment",
    description: "Lock 48k when viable; ensure BOMs match SKU plan.",
    role: "Production",
    transactionCode: "ZCS02 / Dashboard",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Capacity",
    dataFields: [
      {
        fieldName: "Production_Lot_Size",
        dataType: "Integer",
        suggestedValue: 48000
      }
    ]
  },

  // Original PM-2 → PM-2.2
  {
    id: "PM-2.2",
    version: 2,
    round: 1,
    title: "Confirm RM Availability & Run MRP",
    description: "Before MD01, confirm RM availability or incoming POs (check ZME2N).",
    role: "Production",
    transactionCode: "LIT / MD01",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["S-3.2", "P-1.2"],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false,
    impact: "Capacity"
  },

  // Original PM-3 → PM-3.2
  {
    id: "PM-3.2",
    version: 2,
    round: 1,
    title: "Quantify Setup Cost Penalty",
    description: "If lot size < 48k, quantify setup penalty to justify COGS.",
    role: "Production",
    transactionCode: "CO41 / Dashboard",
    priority: "High",
    estimatedTime: 3,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["PM-2.2"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    impact: "Cost",
    dataFields: [
      { fieldName: "Production_Lot_Size", dataType: "Integer", suggestedValue: 48000 },
      {
        fieldName: "Setup_Cost_Per_Unit",
        dataType: "Currency",
        calculatedFrom: ["SetupCost", "LotSize"],
        formula: ({ SetupCost, LotSize }) => {
          const ls = Math.max(1, Number(LotSize ?? 1));
          return Number(SetupCost ?? 0) / ls;
        }
      }
    ]
  },

  // Original PM-4 → PM-4.2
  {
    id: "PM-4.2",
    version: 2,
    round: 1,
    title: "Release Production Order",
    description: "Release only where RM is confirmed; avoid blocking with unfulfillable orders.",
    role: "Production",
    transactionCode: "CO41",
    priority: "High",
    estimatedTime: 3,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["PM-3.2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Capacity"
  },

  // NEW (Stage 1)
  {
    id: "PM-R1-5.2",
    version: 2,
    round: 1,
    title: "Initial Lot Release (Original + Mixed)",
    description: "Release small lots for both SKUs to validate demand; minimize early setup loss.",
    role: "Production",
    transactionCode: "CO41",
    priority: "High",
    estimatedTime: 4,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["PM-2.2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Capacity"
  },
  {
    id: "PM-C2.2",
    version: 2,
    round: 1,
    title: "MRP Exception Handling",
    description: "If exception messages exist, rerun MRP and notify Procurement.",
    role: "Production",
    transactionCode: "MD01",
    priority: "High",
    estimatedTime: 2,
    roundRecurrence: "Continuous",
    startRound: 1,
    dependencyIDs: ["PM-2.2"],
    completionType: "Ongoing",
    taskType: "ERPsim Gather Data",
    completed: false,
    impact: "Capacity",
    visibility: "OnAlert",
    alertKey: AlertsEnum.MRP_ISSUES
  },
  {
    id: "PM-R2-2.2",
    version: 2,
    round: 2,
    title: "Remove Waiting Orders",
    description: "Review ZCOOIS and fix orders waiting for RM to improve flow.",
    role: "Production",
    transactionCode: "ZCOOIS",
    priority: "Medium",
    estimatedTime: 4,
    roundRecurrence: "RoundStart",
    startRound: 2,
    dependencyIDs: ["PM-3.2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Risk"
  },

  // ===========================
  // PROCUREMENT — Rounds 1–2
  // ===========================

  // Original P-1 → P-1.2
  {
    id: "P-1.2",
    version: 2,
    round: 1,
    title: "Set Target Days of Supply (DOS)",
    description: "Input desired DOS per RM to drive PO calc. DOS ≥ Lead time + safety days.",
    role: "Procurement",
    transactionCode: "Dashboard Input / ZMB52",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    impact: "Capacity",
    dataFields: [
      { fieldName: "Target_DOS", dataType: "Integer", suggestedValue: 7 },
      { fieldName: "Lead_Time_Days", dataType: "Integer", suggestedValue: 4, aiHelp: "Change to 2 for fast vendor." }
    ]
  },

  // Original P-2 → P-2.2
  {
    id: "P-2.2",
    version: 2,
    round: 1,
    title: "Sourcing Decision & Sustainability Check",
    description: "Use slow/low-CO₂ vendor if stock sufficient; switch fast vendor if OUT/LOW.",
    role: "Procurement",
    transactionCode: "ZME12",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["P-1.2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Sustainability"
  },

  // Original P-3 → P-3.2
  {
    id: "P-3.2",
    version: 2,
    round: 1,
    title: "PO Viability Check & Create PO",
    description: "Do not release PO unless it supports at least 2×48k production. Consolidate small orders.",
    role: "Procurement",
    transactionCode: "ME59N",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["PM-2.2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Cost"
  },

  // Original P-4 → P-4.2
  {
    id: "P-4.2",
    version: 2,
    round: 1,
    title: "Sustainability Investment Post",
    description: "Model ROI of sustainability investments to keep CO₂e under target; post ZFB50.",
    role: "Procurement",
    transactionCode: "ZFB50",
    priority: "Medium",
    estimatedTime: 3,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    impact: "Sustainability",
    dataFields: [
      { fieldName: "Sustainability_Investment_Amount", dataType: "Currency", suggestedValue: 50000 }
    ]
  },

  // NEW (Stage 1)
  {
    id: "P-R1-5.2",
    version: 2,
    round: 1,
    title: "Small Frequent POs",
    description: "Issue small lots first to avoid RM storage cost; scale with observed consumption.",
    role: "Procurement",
    transactionCode: "ME59N",
    priority: "High",
    estimatedTime: 3,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["P-1.2"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    impact: "Cost",
    dataFields: [
      {
        fieldName: "PO_Quantity",
        dataType: "Integer",
        suggestedValue: 48000,
        calculatedFrom: ["DC12_Forecast", "Production_Capacity"],
        formula: ({ DC12_Forecast, Production_Capacity }) =>
          Math.min(Number(DC12_Forecast ?? 0), Number(Production_Capacity ?? 0)),
        aiHelp: "Use DC12 projection to size early PO correctly."
      }
    ]
  },
  {
    id: "P-C2.2",
    version: 2,
    round: 1,
    title: "RM Shortage Response",
    description: "If RM shortfall, switch to fast vendor for constrained RM and consolidate POs.",
    role: "Procurement",
    transactionCode: "ZME2N / ME59N",
    priority: "Medium",
    estimatedTime: 2,
    roundRecurrence: "Continuous",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Ongoing",
    taskType: "Standard",
    completed: false,
    impact: "Capacity",
    visibility: "OnAlert",
    alertKey: AlertsEnum.RM_SHORTAGE
  },
  {
    id: "P-R2-2.2",
    version: 2,
    round: 2,
    title: "Consolidate Minor POs",
    description: "Combine small orders into efficient batches balancing RM cost vs inventory.",
    role: "Procurement",
    transactionCode: "ME59N",
    priority: "Medium",
    estimatedTime: 3,
    roundRecurrence: "RoundStart",
    startRound: 2,
    dependencyIDs: ["P-3.2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Cost"
  },

  // ==========================
  // LOGISTICS — Rounds 1–2
  // ==========================

  // Original L-1 → L-1.2
  {
    id: "L-1.2",
    version: 2,
    round: 1,
    title: "DC Target DOS Strategy",
    description: "Set DC Target DOS (e.g., 7 days). Ensure DC Stock ≥ 5,000 to prevent stockouts.",
    role: "Logistics",
    transactionCode: "Dashboard Input / ZMB1B",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    impact: "Revenue",
    dataFields: [{ fieldName: "Target_DC_DOS", dataType: "Integer", suggestedValue: 7 }]
  },

  // Original L-2 → L-2.2
  {
    id: "L-2.2",
    version: 2,
    round: 1,
    title: "Transfer Consolidation & Execution",
    description: "Calculate required transfer qty; execute 1 posting if possible to save cost/CO₂.",
    role: "Logistics",
    transactionCode: "ZMB1B",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["L-1.2"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    impact: "Sustainability",
    dataFields: [
      { fieldName: "Total_Transfer_Quantity", dataType: "Integer" }
    ]
  },

  // Original L-3 → L-3.2
  {
    id: "L-3.2",
    version: 2,
    round: 1,
    title: "Monitor Cash Flow & Delivery Status",
    description: "If cash < €100k, alert TL + Procurement; hold non-essential transfers.",
    role: "Logistics",
    transactionCode: "ZFF7B / ZME2N",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "Continuous",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false,
    impact: "Risk",
    visibility: "OnAlert",
    alertKey: AlertsEnum.CASH_LOW
  },

  // Original L-4 → L-4.2
  {
    id: "L-4.2",
    version: 2,
    round: 2,
    title: "Final Transfer Save Confirmation",
    description: "Confirm ZMB1B transfers saved in system.",
    role: "Logistics",
    transactionCode: "ZMB1B",
    priority: "Low",
    estimatedTime: 2,
    roundRecurrence: "RoundStart",
    startRound: 2,
    dependencyIDs: ["L-2.2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
    impact: "Risk"
  },

  // NEW (Stage 1)
  {
    id: "L-R1-5.2",
    version: 2,
    round: 1,
    title: "Transfer Readiness Check",
    description: "Monitor DC stock; avoid transfers until flow stabilizes in Round 2.",
    role: "Logistics",
    transactionCode: "ZMB52",
    priority: "Low",
    estimatedTime: 2,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false,
    impact: "Risk"
  },
  {
    id: "L-C2.2",
    version: 2,
    round: 2,
    title: "DC Stockout Prevention",
    description: "If any DC is trending to stockout, consolidate transfer to highest ROI DCs.",
    role: "Logistics",
    transactionCode: "ZMB1B",
    priority: "High",
    estimatedTime: 2,
    roundRecurrence: "Continuous",
    startRound: 2,
    dependencyIDs: ["L-1.2"],
    completionType: "Manual-Tick",
    taskType: "ERPsim Input Data",
    completed: false,
    impact: "Revenue",
    visibility: "OnAlert",
    alertKey: AlertsEnum.DC_STOCKOUT
  }
];

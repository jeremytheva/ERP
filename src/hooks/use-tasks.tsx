
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { collection, doc, onSnapshot, writeBatch, FirestoreError, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { useAuth } from "./use-auth";
import type { Task, Role, TaskPriority, RoundRecurrence, CompletionType, TaskType } from "@/types";

const ALL_TASKS: Task[] = [
  // --- PROCUREMENT TASKS ---
  {
    id: "P-1-1",
    title: "Set Target Days of Supply (DOS) & Vendor Strategy",
    description: "Proactively decide your inventory buffer (e.g., 7 days of supply) and strategic vendor choice (e.g., Fast/High-Carbon V01/V02 for speed, or Slow/Low-Carbon V11/V12 for cost/carbon). This will drive your ordering quantities.",
    role: "Procurement",
    transactionCode: "Dashboard Input",
    priority: "High",
    estimatedTime: 3,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [
        { fieldName: "Target_Days_of_Supply", dataType: "Integer", suggestedValue: 7 },
        { fieldName: "Vendor_Strategy_Note", dataType: "String", suggestedValue: "Focus on low-cost vendors initially." }
    ]
  },
  {
    id: "P-1-2",
    title: "Create Purchase Order",
    description: "Based on the MRP run, convert the generated purchase requisitions into firm purchase orders.",
    role: "Procurement",
    transactionCode: "ME59N",
    priority: "High",
    estimatedTime: 2,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: ["PM-1-2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  {
    id: "P-1-3",
    title: "Sustainability Investment",
    description: "Make an initial investment in sustainability initiatives. This is a strategic decision to start reducing your carbon footprint.",
    role: "Procurement",
    transactionCode: "ZFB50",
    priority: "Medium",
    estimatedTime: 2,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [{ fieldName: "Investment_Cost", dataType: "Currency" }]
  },
  ...Array.from({ length: 7 }, (_, i) => i + 2).flatMap(round => [
    {
      id: `P-${round}-0`,
      title: "Set Target Days of Supply (DOS) & Vendor Strategy",
      description: "Proactively decide your inventory buffer (e.g., 7 days of supply) and strategic vendor choice (e.g., Fast/High-Carbon V01/V02 for speed, or Slow/Low-Carbon V11/V12 for cost/carbon). This will drive your ordering quantities.",
      role: "Procurement" as Role,
      transactionCode: "Dashboard Input",
      priority: "High" as TaskPriority,
      estimatedTime: 3,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Data-Confirmed" as CompletionType,
      taskType: "ERPsim Input Data" as TaskType,
      completed: false,
      dataFields: [
          { fieldName: "Target_Days_of_Supply", dataType: "Integer", suggestedValue: 7 },
          { fieldName: "Vendor_Strategy_Note", dataType: "String", suggestedValue: "Focus on low-cost vendors initially." }
      ]
    },
    {
      id: `P-${round}-1`,
      title: "Supply, Carbon, & Vendor Check",
      description: "Review supply levels, carbon impact, and vendor contracts. Vendor Carbon Alert: Flags if using high-carbon vendors (V01/V02) while missing CO2e targets.",
      role: "Procurement" as Role,
      transactionCode: "ZME2N/ZMB52",
      priority: "High" as TaskPriority,
      estimatedTime: 5,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    },
    {
        id: `P-${round}-2`,
        title: "Create Purchase Order",
        description: "Create purchase orders based on MRP.",
        role: "Procurement" as Role,
        transactionCode: "ME59N",
        priority: "High" as TaskPriority,
        estimatedTime: 2,
        roundRecurrence: "RoundStart" as RoundRecurrence,
        startRound: round,
        dependencyIDs: [`PM-${round}-2`],
        completionType: "Manual-Tick" as CompletionType,
        taskType: "Standard" as TaskType,
        completed: false
    },
    {
      id: `P-${round}-3`,
      title: "Contingency: Stock Alert Action",
      description: "Take action on stock alerts, e.g., create urgent POs.",
      role: "Procurement" as Role,
      transactionCode: "ZME12",
      priority: "Medium" as TaskPriority,
      estimatedTime: 5,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    },
    {
      id: `P-${round}-4`,
      title: "Sustainability Investment",
      description: "Post investments for sustainability initiatives.",
      role: "Procurement" as Role,
      transactionCode: "ZFB50 (Financial Postings)",
      priority: "Medium" as TaskPriority,
      estimatedTime: 3,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Data-Confirmed" as CompletionType,
      taskType: "ERPsim Input Data" as TaskType,
      completed: false,
      dataFields: [{ fieldName: "Investment_Cost", dataType: "Currency" }]
    },
    {
      id: `P-${round}-5`,
      title: "Final Lock Confirm: Vendor & POs",
      description: "Finalize and save vendor selections and confirm all purchase orders have been created for the round.",
      role: "Procurement" as Role,
      transactionCode: "ZME12/ME59N",
      priority: "High" as TaskPriority,
      estimatedTime: 2,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    },
  ]),

  // --- PRODUCTION MANAGER TASKS ---
  {
    id: "PM-1-1",
    title: "Review Initial BOM",
    description: "Review the Bill of Materials for the starting products. In later rounds, this task becomes 'Introduce New Product BOM'.",
    role: "Production",
    transactionCode: "ZCS02",
    priority: "Medium",
    estimatedTime: 2,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  {
    id: "PM-1-2",
    title: "Run MRP",
    description: "Execute the Material Requirements Planning run. This is dependent on Procurement's initial supply strategy.",
    role: "Production",
    transactionCode: "MD01",
    priority: "High",
    estimatedTime: 2,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: ["P-1-1"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  {
    id: "PM-1-3",
    title: "Calculate Lot Size & Release Production",
    description: "Calculate the financial and carbon penalty for a small lot size (Setup Time × Operating Cost/Carbon Emission). A lot size under 48,000 units incurs significant penalties.",
    role: "Production",
    transactionCode: "CO41 (Production Release)",
    priority: "High",
    estimatedTime: 3,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: ["PM-1-2"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [{ fieldName: "Production_Lot_Size", dataType: "Integer" }]
  },
  ...Array.from({ length: 7 }, (_, i) => i + 2).flatMap(round => [
    {
        id: `PM-${round}-1`,
        title: "Introduce New Product BOM",
        description: "Introduce a new product by changing the Bill of Materials. This is a major strategic action if Sales has identified a market gap.",
        role: "Production" as Role,
        transactionCode: "ZCS02",
        priority: "Medium" as TaskPriority,
        estimatedTime: 2,
        roundRecurrence: "RoundStart" as RoundRecurrence,
        startRound: round,
        dependencyIDs: [],
        completionType: "Manual-Tick" as CompletionType,
        taskType: "Standard" as TaskType,
        completed: false
    },
    {
        id: `PM-${round}-2`,
        title: "Run MRP",
        description: "Execute the Material Requirements Planning run. This is dependent on Procurement's supply strategy for the round.",
        role: "Production" as Role,
        transactionCode: "MD01",
        priority: "High" as TaskPriority,
        estimatedTime: 2,
        roundRecurrence: "RoundStart" as RoundRecurrence,
        startRound: round,
        dependencyIDs: [`P-${round}-0`],
        completionType: "Manual-Tick" as CompletionType,
        taskType: "Standard" as TaskType,
        completed: false
    },
    {
        id: `PM-${round}-3`,
        title: "Calculate Lot Size & Release Production",
        description: "Calculate the financial and carbon penalty for a small lot size (Setup Time × Operating Cost/Carbon Emission). A lot size under 48,000 units incurs significant penalties.",
        role: "Production" as Role,
        transactionCode: "CO41 (Production Release)",
        priority: "High" as TaskPriority,
        estimatedTime: 3,
        roundRecurrence: "RoundStart" as RoundRecurrence,
        startRound: round,
        dependencyIDs: [`PM-${round}-2`],
        completionType: "Data-Confirmed" as CompletionType,
        taskType: "ERPsim Input Data" as TaskType,
        completed: false,
        dataFields: [{ fieldName: "Production_Lot_Size", dataType: "Integer" }]
    },
    {
        id: `PM-${round}-4`,
        title: "Final Lock Confirm: Production Release",
        description: "Confirm production release was successful and no planned orders remain unconverted. Verify no remaining Planned Orders are pending.",
        role: "Production" as Role,
        transactionCode: "CO41 (Production Release)",
        priority: "Low" as TaskPriority,
        estimatedTime: 1,
        roundRecurrence: "RoundStart" as RoundRecurrence,
        startRound: round,
        dependencyIDs: [`PM-${round}-3`],
        completionType: "Manual-Tick" as CompletionType,
        taskType: "Standard" as TaskType,
        completed: false
    },
  ]),

  // --- SALES TASKS ---
  {
    id: "S-1-0",
    title: "Capacity & Inventory Constraint Check",
    description: "Before forecasting, confirm that Production Capacity (max units) and Finished Goods Stock (overstock risk) support your proposed sales numbers.",
    role: "Sales",
    transactionCode: "ZMB52/Dashboard",
    priority: "High",
    estimatedTime: 2,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  {
    id: "S-1-1",
    title: "Set Forecast & Pricing",
    description: "Input: Forecast Units & Prices. Price Alert if price > Comp. Avg. + 10%. Your forecast is the most critical input for the team.",
    role: "Sales",
    transactionCode: "MD61/VK32",
    priority: "High",
    estimatedTime: 2,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: ["S-1-0"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [{ fieldName: "Forecast_Units", dataType: "Integer" }, { fieldName: "Product_Price", dataType: "Currency" }]
  },
  {
    id: "S-1-2",
    title: "Set Marketing Budget & Channel Allocation Strategy",
    description: "Input the total marketing budget and provide a note on your channel allocation strategy (e.g., 'Shifting 80% of spend to DC14 due to high market effectiveness').",
    role: "Sales",
    transactionCode: "ZADS",
    priority: "Medium",
    estimatedTime: 2,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: ["S-1-1"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [
        { fieldName: "Marketing_Budget", dataType: "Currency" },
        { fieldName: "Channel_Focus_Note", dataType: "String" }
    ]
  },
  ...Array.from({ length: 7 }, (_, i) => i + 2).flatMap(round => [
    {
      id: `S-${round}-0`,
      title: "Capacity & Inventory Constraint Check",
      description: "Before forecasting, confirm that Production Capacity (max units) and Finished Goods Stock (overstock risk) support your proposed sales numbers.",
      role: "Sales" as Role,
      transactionCode: "ZMB52/Dashboard",
      priority: "High" as TaskPriority,
      estimatedTime: 2,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    },
    {
      id: `S-${round}-1`,
      title: "Set Forecast & Pricing",
      description: "Input: Forecast Units & Prices. Price Alert if price > Comp. Avg. + 10%. Your forecast is the most critical input for the team.",
      role: "Sales" as Role,
      transactionCode: "MD61/VK32",
      priority: "High" as TaskPriority,
      estimatedTime: 2,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [`S-${round}-0`],
      completionType: "Data-Confirmed" as CompletionType,
      taskType: "ERPsim Input Data" as TaskType,
      completed: false,
      dataFields: [{ fieldName: "Forecast_Units", dataType: "Integer" }, { fieldName: "Product_Price", dataType: "Currency" }]
    },
    {
      id: `S-${round}-2`,
      title: "Set Marketing Budget & Channel Allocation Strategy",
      description: "Input the total marketing budget and provide a note on your channel allocation strategy (e.g., 'Shifting 80% of spend to DC14 due to high market effectiveness').",
      role: "Sales" as Role,
      transactionCode: "ZADS",
      priority: "Medium" as TaskPriority,
      estimatedTime: 2,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [`S-${round}-1`],
      completionType: "Data-Confirmed" as CompletionType,
      taskType: "ERPsim Input Data" as TaskType,
      completed: false,
      dataFields: [
          { fieldName: "Marketing_Budget", dataType: "Currency" },
          { fieldName: "Channel_Focus_Note", dataType: "String" }
      ]
    },
    {
      id: `S-${round}-3`,
      title: "Final Input Confirmation: ZADS, MD61, VK32",
      description: "Confirm that Marketing (ZADS), Forecast (MD61), and Pricing (VK32) were saved correctly in SAP and match the spreadsheet.",
      role: "Sales" as Role,
      transactionCode: "ZADS/MD61/VK32",
      priority: "Low" as TaskPriority,
      estimatedTime: 2,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [`S-${round}-2`],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    },
  ]),

  // --- LOGISTICS TASKS ---
  {
    id: "L-1-0",
    title: "Set DC Target Days of Supply (DOS) Strategy",
    description: "Formalize the buffer stock decision for each Distribution Center (DC) by setting a target Days of Supply (e.g., 5, 7, or 10 days).",
    role: "Logistics",
    transactionCode: "Dashboard Input",
    priority: "High",
    estimatedTime: 2,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [{ fieldName: "Target_DC_DOS", dataType: "Integer", suggestedValue: 7 }]
  },
  {
    id: "L-1-1",
    title: "Plan Stock Transfer to DCs",
    description: "Input: Qty to Transfer. Each transfer costs €500 and 750 kg CO2e. Batch transfers to be efficient. Stock-Out Risk if DC Stock < 5,000 units.",
    role: "Logistics",
    transactionCode: "ZMB1B",
    priority: "High",
    estimatedTime: 2,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: ["PM-1-3"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [{ fieldName: "Quantity_to_Transfer", dataType: "Integer" }]
  },
  {
    id: "L-1-2",
    title: "Monitor Cash Flow & Deliveries",
    description: "CF: Cash Alert if Cash Balance < €100,000. CF: Delivery Alert if PO delivery is late.",
    role: "Logistics",
    transactionCode: "ZFF7B/ZME2N",
    priority: "High",
    estimatedTime: 6,
    roundRecurrence: "Once",
    startRound: 1,
    dependencyIDs: ["L-1-1"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  ...Array.from({ length: 7 }, (_, i) => i + 2).flatMap(round => [
    {
      id: `L-${round}-0`,
      title: "Set DC Target Days of Supply (DOS) Strategy",
      description: "Formalize the buffer stock decision for each Distribution Center (DC) by setting a target Days of Supply (e.g., 5, 7, or 10 days).",
      role: "Logistics" as Role,
      transactionCode: "Dashboard Input",
      priority: "High" as TaskPriority,
      estimatedTime: 2,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Data-Confirmed" as CompletionType,
      taskType: "ERPsim Input Data" as TaskType,
      completed: false,
      dataFields: [{ fieldName: "Target_DC_DOS", dataType: "Integer", suggestedValue: 7 }]
    },
    {
      id: `L-${round}-1`,
      title: "Plan Stock Transfer to DCs",
      description: "Input: Qty to Transfer. Each transfer costs €500 and 750 kg CO2e. Batch transfers to be efficient. Stock-Out Risk if DC Stock < 5,000 units.",
      role: "Logistics" as Role,
      transactionCode: "ZMB1B (Stock Transfer)",
      priority: "High" as TaskPriority,
      estimatedTime: 3,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [`PM-${round}-3`],
      completionType: "Data-Confirmed" as CompletionType,
      taskType: "ERPsim Input Data" as TaskType,
      completed: false,
      dataFields: [{ fieldName: "Quantity_to_Transfer", dataType: "Integer" }]
    },
    {
      id: `L-${round}-2`,
      title: "Monitor Cash, Deliveries, & Stock",
      description: "Monitor cash flow (ZFF7B), purchase order delivery status (ZME2N), and DC stock levels.",
      role: "Logistics" as Role,
      transactionCode: "ZFF7B/ZME2N",
      priority: "High" as TaskPriority,
      estimatedTime: 2,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    },
    {
      id: `L-${round}-3`,
      title: "Contingency: PO Hold for Cash",
      description: "If Cash Alert is Active: Immediately alert Procurement to hold or cancel any large pending Purchase Orders (POs) to prevent a bank overdraft.",
      role: "Logistics" as Role,
      transactionCode: "N/A",
      priority: "Medium" as TaskPriority,
      estimatedTime: 2,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    },
    {
      id: `L-${round}-4`,
      title: "Final Lock Confirm: Transfer & Cash",
      description: "Finalize and save the stock transfer and review final cash balance (ZFF7B) to ensure it's positive.",
      role: "Logistics" as Role,
      transactionCode: "ZMB1B/ZFF7B",
      priority: "High" as TaskPriority,
      estimatedTime: 1,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [`L-${round}-1`],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    },
  ]),

  // --- TEAM LEADER TASKS ---
  {
      id: "T-1-1",
      title: "Establish and Document Round 1 Strategic Alignment",
      description: "Document the team's initial consensus (e.g., 'R1 Goal: Maximize Revenue. Procurement will use Fast Vendors, Sales will price high.') to ensure all roles are aligned from the start.",
      role: "Team Leader",
      transactionCode: "Dashboard Input",
      priority: "Critical",
      estimatedTime: 5,
      roundRecurrence: "Once",
      startRound: 1,
      dependencyIDs: [],
      completionType: "Data-Confirmed",
      taskType: "ERPsim Input Data",
      completed: false,
      dataFields: [{ fieldName: "Round_1_Strategy_Statement", dataType: "String" }]
  },
  ...Array.from({ length: 7 }, (_, i) => i + 2).flatMap(round => [
    {
      id: `T-${round}-1`,
      title: "Round Start Review & KPI Check",
      description: "Guidance: Review Profit, Cash, Carbon Trends. CF: Red if Cash Balance < €100,000.",
      role: "Team Leader" as Role,
      transactionCode: "F.01/ZVC2 (Financial/Sales Reports)",
      priority: "High" as TaskPriority,
      estimatedTime: 2,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    },
    {
      id: `T-${round}-2`,
      title: "Strategy & Contingency Check",
      description: "Guidance: Use this time to address any Red alerts or unexpected market shifts.",
      role: "Team Leader" as Role,
      transactionCode: "N/A",
      priority: "Medium" as TaskPriority,
      estimatedTime: 3,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    },
    {
      id: `T-${round}-3`,
      title: "Final Strategic & Financial Lock-Down",
      description: "This is the final gate check. Ensure all departmental 'Final Lock Confirm' steps are done. Review final Cash Balance, Net Income, and Carbon Score before the round ends.",
      role: "Team Leader" as Role,
      transactionCode: "F.01/Dashboard",
      priority: "Critical" as TaskPriority,
      estimatedTime: 3,
      roundRecurrence: "RoundStart" as RoundRecurrence,
      startRound: round,
      dependencyIDs: [`P-${round}-5`, `S-${round}-3`, `L-${round}-4`, `PM-${round}-4`],
      completionType: "Manual-Tick" as CompletionType,
      taskType: "Standard" as TaskType,
      completed: false
    }
  ])
];

interface TasksContextType {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
      setTasks([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const tasksColRef = collection(firestore, "tasks");

    const unsubscribe = onSnapshot(tasksColRef, async (querySnapshot) => {
      if (querySnapshot.empty) {
        // Seed the database if it's empty
        console.log("No tasks found, seeding database...");
        const batch = writeBatch(firestore);
        ALL_TASKS.forEach((task) => {
          const taskDocRef = doc(firestore, "tasks", task.id);
          batch.set(taskDocRef, task);
        });
        await batch.commit().then(() => {
            setTasks(ALL_TASKS);
            setIsLoading(false);
        }).catch(error => {
          const contextualError = new FirestorePermissionError({
            path: 'tasks',
            operation: 'write',
          });
          errorEmitter.emit('permission-error', contextualError);
          setIsLoading(false);
        });
      } else {
        const dbTasks = querySnapshot.docs.map(doc => doc.data() as Task);
        setTasks(dbTasks);
        setIsLoading(false);
      }
    },
    (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
            path: 'tasks',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
        setTasks([]); // Fallback to empty array on error
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const addTask = async (task: Task) => {
    if (!firestore) return;
    const taskDocRef = doc(firestore, "tasks", task.id);
    await setDoc(taskDocRef, task).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `tasks/${task.id}`, operation: 'create', requestResourceData: task }));
    });
  };

  const updateTask = async (updatedTask: Task) => {
    if (!firestore) return;
    const taskDocRef = doc(firestore, "tasks", updatedTask.id);
    await setDoc(taskDocRef, updatedTask, { merge: true }).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `tasks/${updatedTask.id}`, operation: 'update', requestResourceData: updatedTask }));
    });
  };

  const deleteTask = async (taskId: string) => {
    if (!firestore) return;
    const taskDocRef = doc(firestore, "tasks", taskId);
    await deleteDoc(taskDocRef).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `tasks/${taskId}`, operation: 'delete' }));
    });
  };
  
  const value = { tasks, addTask, updateTask, deleteTask };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};

    
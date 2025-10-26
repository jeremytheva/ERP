
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { collection, doc, onSnapshot, writeBatch, FirestoreError, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { useAuth } from "./use-auth";
import type { Task, Role, TaskPriority, RoundRecurrence, CompletionType, TaskType } from "@/types";

const ALL_TASKS: Task[] = [
  // --- TEAM LEADER TASKS ---
  {
    id: "TL-1",
    title: "Round Start Review & Strategic Alignment",
    description: "Check: Gross Margin (%) must exceed 20%. Ensure all roles align their decisions to this target (e.g., Sales pricing, Procurement costs).",
    role: "Team Leader",
    transactionCode: "F.01 / ZVC2 (Reports)",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 2,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  {
    id: "TL-2",
    title: "Cash Runway & Loan Management",
    description: "Calculation: Determine Cash Runway (Days): Current Cash Balance / Avg. Daily Outflow. If < 5 days, instruct Logistics/Procurement to hold spending.",
    role: "Team Leader",
    transactionCode: "Dashboard / ZFF7B",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "Continuous",
    startRound: 2,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  {
    id: "TL-3",
    title: "Strategy & Contingency Check",
    description: "Action: If Cash Alert or Critical RM Shortage is active, instruct Procurement to switch to Fast Vendor (V01/V02) and Logistics to hold non-critical transfers.",
    role: "Team Leader",
    transactionCode: "N/A (Team Coordination)",
    priority: "Medium",
    estimatedTime: 5,
    roundRecurrence: "Continuous",
    startRound: 2,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  {
    id: "TL-4",
    title: "Final Strategic & Financial Lock-Down",
    description: "Final Check: Confirm Net Income is positive, and the planned Sustainability Investment (ZFB50) was successfully posted before the round ends.",
    role: "Team Leader",
    transactionCode: "Dashboard / ZFB50",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 2,
    dependencyIDs: ["P-4", "S-4", "L-4", "PM-4"], // Dependency on final confirmation tasks of other roles
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },

  // --- SALES MANAGER TASKS ---
  {
    id: "S-1",
    title: "Market Analysis & Price Strategy",
    description: "Focus: Prioritize products with the highest Product Gross Margin Rate for marketing and aggressive pricing. Use Price Alert to stay competitive.",
    role: "Sales",
    transactionCode: "ZMARKET / VK32",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false
  },
  {
    id: "S-2",
    title: "Capacity & Inventory Constraint Check",
    description: "Critical Check: Compare R-N Total Forecast (Units) against Production Capacity (Max 250,000 units) and current Finished Goods Stock (FG).",
    role: "Sales",
    transactionCode: "ZMB52 / Dashboard",
    priority: "High",
    estimatedTime: 3,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false
  },
  {
    id: "S-3",
    title: "Set Viable Forecast (MD61)",
    description: "Input: Ensure the Forecast is a minimum of 48,000 units for the main product lines to allow Production to run at maximum efficiency.",
    role: "Sales",
    transactionCode: "MD61",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["S-2"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [{ fieldName: "Forecast_Units", dataType: "Integer", suggestedValue: 48000 }]
  },
  {
    id: "S-4",
    title: "Set Budget & Channel Allocation",
    description: "Action: Instead of just entering total budget, strategically allocate the majority of the ZADS spend to the DCs with the highest historical ROI.",
    role: "Sales",
    transactionCode: "ZADS",
    priority: "Medium",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["S-3"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [
      { fieldName: "Marketing_Budget", dataType: "Currency", suggestedValue: 50000 },
      { fieldName: "Channel_Allocation_Note", dataType: "String", suggestedValue: "Focus on DC12 and DC14" }
    ]
  },

  // --- PRODUCTION MANAGER TASKS ---
  {
    id: "PM-1",
    title: "Lot Size Strategy & BOM Alignment",
    description: "Goal: Lock in a 48,000 Unit Lot Size for all planned products (or multiples thereof) to minimize Setup Cost per Unit.",
    role: "Production",
    transactionCode: "ZCS02 (BOM) / Dashboard",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  {
    id: "PM-2",
    title: "Confirm RM Availability & Run MRP",
    description: "Dependency Check: Before running MD01, confirm with Procurement that all Raw Materials required for the 48,000 unit run are either in stock or have confirmed incoming POs (check ZME2N).",
    role: "Production",
    transactionCode: "LIT / MD01",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["S-3", "P-1"],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false
  },
  {
    id: "PM-3",
    title: "Quantify Setup Cost Penalty",
    description: "Calculation: If the lot size is forced below 48,000 units, calculate the Setup Cost per Unit to justify the resulting high COGS.",
    role: "Production",
    transactionCode: "CO41 (Output) / Dashboard",
    priority: "High",
    estimatedTime: 3,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["PM-2"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [{ fieldName: "Production_Lot_Size", dataType: "Integer", suggestedValue: 48000 }]
  },
  {
    id: "PM-4",
    title: "Release Production Order",
    description: "Action: Release the Production Order only for products where the RM are confirmed available to avoid blocking the line with unfulfillable orders.",
    role: "Production",
    transactionCode: "CO41",
    priority: "High",
    estimatedTime: 3,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["PM-3"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },

  // --- PROCUREMENT MANAGER TASKS ---
  {
    id: "P-1",
    title: "Set Target Days of Supply (DOS) Strategy",
    description: "Input: Input the desired DOS (e.g., 7 Days) for each RM to drive the PO calculation, ensuring a buffer against the vendor Lead Time.",
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
    dataFields: [{ fieldName: "Target_Days_of_Supply", dataType: "Integer", suggestedValue: 7 }]
  },
  {
    id: "P-2",
    title: "Sourcing Decision & Sustainability Check",
    description: "Action: If the RM Stock Status (LIT) is 'Sufficient', select the Slow/Low-Carbon Vendor (V11/V12). Only use Fast Vendor (V01/V02) if Stock Status is 'OUT' or 'LOW'.",
    role: "Procurement",
    transactionCode: "ZME12",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["P-1"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  {
    id: "P-3",
    title: "PO Viability Check & Create PO",
    description: "Check: DO NOT release a PO (ME59N) for an RM if the quantity ordered is insufficient to support at least 2 x 48,000 units of production. Consolidate small orders.",
    role: "Procurement",
    transactionCode: "ME59N",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["PM-2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  },
  {
    id: "P-4",
    title: "Sustainability Investment Post",
    description: "Action: Post the pre-determined, required investment amount (set by TL or formula) into ZFB50 to manage the Cumulative CO2e Emissions.",
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
    dataFields: [{ fieldName: "Sustainability_Investment_Amount", dataType: "Currency" }]
  },

  // --- LOGISTICS MANAGER TASKS ---
  {
    id: "L-1",
    title: "DC Target Days of Supply (DOS) Strategy",
    description: "Input: Set the Target DOS for each DC (e.g., 7 days) based on their demand volatility. Critical: Ensure DC Stock >= 5,000 units to prevent stock-outs.",
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
    dataFields: [{ fieldName: "Target_DC_DOS", dataType: "Integer", suggestedValue: 7 }]
  },
  {
    id: "L-2",
    title: "Transfer Consolidation & Execution",
    description: "Action: Calculate Required Transfer Qty for all DCs. Execute only 1 ZMB1B posting (if possible) to save €500 in Transfer Cost and 750 kg CO2e per transfer.",
    role: "Logistics",
    transactionCode: "ZMB1B",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["L-1"],
    completionType: "Data-Confirmed",
    taskType: "ERPsim Input Data",
    completed: false,
    dataFields: [{ fieldName: "Total_Transfer_Quantity", dataType: "Integer" }]
  },
  {
    id: "L-3",
    title: "Monitor Cash Flow & Delivery Status",
    description: "Action: Check for the Cash Alert (Cash Balance < €100,000). If active, immediately contact the TL and P to place a hold on all non-essential spending.",
    role: "Logistics",
    transactionCode: "ZFF7B / ZME2N",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "Continuous",
    startRound: 1,
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "ERPsim Gather Data",
    completed: false
  },
  {
    id: "L-4",
    title: "Final Transfer Save Confirmation",
    description: "Action: Manually confirm that the final DC transfers were successfully executed and saved in the system.",
    role: "Logistics",
    transactionCode: "ZMB1B",
    priority: "Low",
    estimatedTime: 2,
    roundRecurrence: "RoundStart",
    startRound: 1,
    dependencyIDs: ["L-2"],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false
  }
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
        console.log("No tasks found, seeding database with new strategic tasks...");
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
        // Basic reconciliation: if the number of tasks differs, re-seed.
        // A more robust solution would be to diff the tasks.
        if (dbTasks.length !== ALL_TASKS.length) {
            console.log("Task mismatch detected, re-seeding database...");
             const batch = writeBatch(firestore);
            ALL_TASKS.forEach((task) => {
              const taskDocRef = doc(firestore, "tasks", task.id);
              batch.set(taskDocRef, task);
            });
            await batch.commit();
            setTasks(ALL_TASKS);
        } else {
             setTasks(dbTasks);
        }
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

    
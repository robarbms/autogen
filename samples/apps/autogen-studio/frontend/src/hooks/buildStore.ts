import { create } from "zustand";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../components/types";
import { NodeSelection } from "../components/views/new_builder/canvas/Canvas";
import { API } from "../components/views/new_builder/utilities/API";

export type BuildSections = "agent" | "model" | "skill" | "workflow";

/**
 * Build state type
 */
export interface IBuildState {
    api: API | null;
    setApi: (api: API) => void;
    agents: IAgent[];
    setAgents: (agents: IAgent[]) => void;
    models: IModelConfig[];
    setModels: (models: IModelConfig[]) => void;
    skills: ISkill[];
    setSkills: (skills: ISkill[]) => void;
    workflows: IWorkflow[];
    setWorkflows: (workflows: IWorkflow[]) => void;
    editScreen: BuildSections | null;
    setEditScreen: (editScreen: BuildSections | null) => void;
    editId: number | null;
    setEditId: (editId: number | null) => void;
    workflowId: number | null;
    setWorkflowId: (workflowId: number | null) => void;
    libraryOpen: boolean;
    setLibraryOpen: (libraryOpen: boolean) => void;
    nodePropertiesOpen: boolean;
    setNodePropertiesOpen: (nodePropertiesOpen: boolean) => void;
    chatProperties: boolean;
    selectedNode: NodeSelection;
    setSelectedNode: (selectedNode: NodeSelection) => void;
}

/**
 * Store used to manage the state for the build page
 */
export const useBuildStore = create<IBuildState>()((set) => ({
    api: null,
    setApi: (api: API) => set({api}),
    agents: [],
    setAgents: (agents: IAgent[]) => set({agents}),
    models: [],
    setModels: (models: IModelConfig[]) => set({models}),
    skills: [],
    setSkills: (skills: ISkill[]) => set({skills}),
    workflows: [],
    setWorkflows: (workflows: IWorkflow[]) => set({workflows}),
    editScreen: null,
    setEditScreen: (editScreen: BuildSections | null) => set({editScreen}),
    editId: null,
    setEditId: (editId: number | null) => set({editId}),
    workflowId: null,
    setWorkflowId: (workflowId: number | null) => set({workflowId}),
    libraryOpen: true,
    setLibraryOpen: (libraryOpen: boolean) => set({libraryOpen}),
    nodePropertiesOpen: false,
    setNodePropertiesOpen: (nodePropertiesOpen: boolean) => set({nodePropertiesOpen}),
    chatProperties: false,
    selectedNode: null,
    setSelectedNode: (selectedNode: NodeSelection) => set({selectedNode}),
}));

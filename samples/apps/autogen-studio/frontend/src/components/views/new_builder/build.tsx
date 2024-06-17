import React, { useState, useEffect } from "react";
import Workflow from "./canvas/Workflow";
import Home from "./Home";
import {API} from "./API";
import EditWorkflow from "./EditWorkflow";
import EditAgent from "./EditAgent";
import EditModel from "./EditModel";
import EditSkill from "./EditSkill";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../types";
import { useBuildStore } from "../../../hooks/buildStore";

type Categories = "agents" | "models" | "skills" | "workflows";

// Properties for the BuildView component
type BuildViewProps = {
}

/**
 * Renders the workflow build page
 * @param props 
 * @returns 
 */
const BuildView = (props: BuildViewProps) => {
  const { setAgents, setModels, setSkills, setWorkflows, editScreen, editId, workflowId, agents, workflows, skills, models } = useBuildStore(({setAgents, setModels, setSkills, setWorkflows, editScreen, editId, workflowId, agents, workflows, skills, models}) => ({
    setAgents,
    setModels,
    setSkills,
    setWorkflows,
    editScreen,
    editId,
    workflowId,
    agents,
    workflows,
    skills,
    models
  }));
  const [previousWork, setPreviousWork] = useState(false);
  const api = new API();

  // Load agents, models, skills and workflows on component mount
  useEffect(() => {
    // Load workflows, agents, models and skills and push them to the store
    api.getWorkflows(setWorkflows);
    api.getAgents(setAgents);
    api.getModels(setModels);
    api.getItems("skills", setSkills);
  }, []);

  // If there are any workflows, agents, models or skill, set the previousWork to true
  useEffect(() => {
    if (
      (workflows && workflows.length > 0) ||
      (agents && agents.length > 0) ||
      (models && models.length > 0) ||
      (skills && skills.length > 0)
    ) {
        setPreviousWork(true);
    }
    else {
      setPreviousWork(false);
    }
  }, [workflows, agents, models, skills]);

  return (
    <div className="build h-full">
      {workflowId === null && editScreen === null &&
        <Home hasPreviousWork={previousWork} api={api} />
      }
      {editScreen === "workflow" &&
        <EditWorkflow api={api} />
      }
      {editScreen === "agent" &&
        <EditAgent agentId={editId || 0} api={api} />
      }
      {editScreen === "model" &&
        <EditModel api={api} />
      }
      {editScreen === "skill" &&
        <EditSkill api={api} />
      }
      {editScreen === null && workflowId !== null && workflowId >= 0 &&
        <Workflow api={api} />
      }
    </div>
  );
}

export default BuildView;
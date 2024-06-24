import React, { useState, useEffect } from "react";
import EditWorkflow from "./edit/EditWorkflow";
import Home from "./home/Home";
import {API} from "./utilities/API";
import CreateWorkflow from "./edit/CreateWorkflow";
import EditAgent from "./edit/EditAgent";
import EditModel from "./edit/EditModel";
import EditSkill from "./edit/EditSkill";
import { useBuildStore } from "../../../hooks/buildStore";

export type Categories = "agents" | "models" | "skills" | "workflows";

// Properties for the BuildView component
type BuildViewProps = {
  createNav: "agent" | "model" | "skill" | "workflow" | null
}

/**
 * Renders the workflow build page
 * @param props 
 * @returns 
 */
const BuildView = (props: BuildViewProps) => {
  const { setApi, setAgents, setModels, setSkills, setWorkflows, editScreen, editId, workflowId, agents, workflows, skills, models } = useBuildStore(({ setApi, setAgents, setModels, setSkills, setWorkflows, editScreen, editId, workflowId, agents, workflows, skills, models}) => ({
    setApi,
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
  const api = new API();
  const [previousWork, setPreviousWork] = useState(false);

  // Load agents, models, skills and workflows on component mount
  useEffect(() => {
    setApi(api);
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
        <Home hasPreviousWork={previousWork} />
      }
      {editScreen === "workflow" &&
        <CreateWorkflow />
      }
      {editScreen === "agent" &&
        <EditAgent agentId={editId || 0} />
      }
      {editScreen === "model" &&
        <EditModel />
      }
      {editScreen === "skill" &&
        <EditSkill />
      }
      {editScreen === null && workflowId !== null && workflowId >= 0 &&
        <EditWorkflow />
      }
    </div>
  );
}

export default BuildView;
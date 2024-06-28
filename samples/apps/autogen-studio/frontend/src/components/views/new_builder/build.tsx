import React, { useState, useEffect, useRef } from "react";
import EditWorkflow from "./edit/EditWorkflow";
import Home from "./home/Home";
import {API} from "./utilities/API";
import CreateWorkflow from "./edit/CreateWorkflow";
import EditAgent from "./edit/EditAgent";
import EditModel from "./edit/EditModel";
import EditSkill from "./edit/EditSkill";
import { useBuildStore } from "../../../hooks/buildStore";
import { message } from 'antd';
import { IStatus } from "../../types";

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
  const isInitialized = useRef(false); // Used to prevent unnecissary reloading

  // API for DB calls
  const api = new API();

  // API error handling
  api.error = (error: IStatus) => {
    if (!error.status) message.error(error.message)
  }

  // API success message handling
  api.success = (success: IStatus) => {
    message.success(success.message);
  }  

  // Load agents, models, skills and workflows on component mount
  useEffect(() => {
    if (!isInitialized.current) {
      // Push the api to the builder store
      setApi(api);

      // Load workflows, agents, models and skills and push them to the builder store
      api.getWorkflows(setWorkflows);
      api.getAgents(setAgents);
      api.getModels(setModels);
      api.getSkills(setSkills);
      isInitialized.current = true;
    }
  }, []);

  return (
    <div className="build h-full">
      {workflowId === null && editScreen === null &&
        <Home />
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
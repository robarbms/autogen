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
  const { setAgents, setModels, setSkills, setWorkflows, editScreen, editId, workflowId } = useBuildStore(({setAgents, setModels, setSkills, setWorkflows, editScreen, editId, workflowId}) => ({
    setAgents,
    setModels,
    setSkills,
    setWorkflows,
    editScreen,
    editId,
    workflowId
  }));
  const [workflow, setWorkflow] = useState<null | number>(null);
  const api = new API();

  // Load agents, models, skills and workflows on component mount
  useEffect(() => {
    api.getItems("workflows", setWorkflows);
    api.getItems("agents", setAgents);
    api.getItems("models", setModels);
    api.getItems("skills", setSkills);
  }, []);

  // Handles edits to the workflow linked agents
  const handleWorkflowEdit = (wid: number) => {
    setEditMode(null);
    // Make sure the new workflow has an initiator
    api.getWorkflowLinks(wid, (sender: IAgent, receiver: IAgent) => {
      if (!sender) {
        // if there isn't a sender, find the initiator and link it to the workflow
        const initiator: IAgent | undefined = agents.find(agent => agent?.type === "userproxy");

        if (initiator && initiator.id !== undefined) {
          api.linkWorkflow(wid, "sender", initiator.id);
        }
        setWorkflow(wid);
      }
    })
  }


  return (
    <div className="build h-full">
      {workflowId === null && editScreen === null &&
        <Home />
      }
      {editScreen === "workflow" &&
        <EditWorkflow api={api} />
      }
      {editScreen === "agent" &&
        <EditAgent api={api} />
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
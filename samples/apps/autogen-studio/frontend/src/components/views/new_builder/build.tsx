import React, { useState, useEffect } from "react";
import Workflow from "./canvas/Workflow";
import Home from "./Home";
import {API} from "./API";
import EditWorkflow from "./EditWorkflow";
import EditAgent from "./EditAgent";
import EditModel from "./EditModel";
import EditSkill from "./EditSkill";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../types";

type Categories = "agents" | "models" | "skills" | "workflows";

// Properties for the BuildView component
type BuildViewProps = {
  createNav: "workflow" | "agent" | "skill" | "model" | null;
  setNavExpand: (expand: boolean) => void;
}

/**
 * Renders the workflow build page
 * @param props 
 * @returns 
 */
const BuildView = (props: BuildViewProps) => {
  const { createNav } = props;
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [agents, setAgents] = useState<IAgent[]>([]);
  const [models, setModels] = useState<IModelConfig[]>([]);
  const [skills, setSkills] = useState<ISkill[]>([]);
  const [workflow, setWorkflow] = useState<null | number>(null);
  const api = new API();
  const [editMode, setEditMode] = useState<null | "workflow" | "agent" | "model" | "skill">(null);
  const [editId, setEditId] = useState<number | null>();

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

  const handleEdit = (category: "agent" | "model" | "skill" | "workflow" | null, id: number | null, workflow_id?: number | null) => {
    setEditId(id);
    setEditMode(category);
    if (workflow_id !== undefined) {
      setWorkflow(null);
    }
  }

  // Closes edit mode
  const closeEdit =  (category: Categories ) => () => {
    update(category);
    handleEdit(null, null);
  }

  // Adds a new skill
  const addSkill = (skill: ISkill) => {
    api.addSkill(skill, setSkills);
  }

  const update = (category: Categories) => {
    const setters: {[key: Categories]: (itms: any) => void} = {
      "workflows": setWorkflows,
      "agents": setAgents,
      "models": setModels,
      "skills": setSkills
    };
    if (category) {
      api.getItems(category, setters[category], true);
    }
    else {
      for(let cat in setters) {
        api.getItems(cat, setters[cat], true);
      }
    }
  }

  useEffect(() => {
    console.log({editMode, workflow});
    if (editMode === "agent" || workflow) {
      props.setNavExpand(false);
    }
  }, [editMode, workflow]);

  useEffect(() => {
    if (createNav) {
      handleEdit(createNav, null);
    }
  }, [ createNav ]);

  return (
    <div className="build h-full">
      {workflow === null && editMode === null &&
        <Home
          editMode={setEditMode}
          handleEdit={handleEdit}
          openWorkflow={setWorkflow}
          agents={agents}
          models={models}
          skills={skills}
          workflows={workflows}
          user={api.user?.email || ""}
        />
      }
      {editMode === "workflow" &&
        <EditWorkflow close={closeEdit("workflows")} updateWorkflow={handleWorkflowEdit} />
      }
      {editMode === "agent" &&
        <EditAgent close={closeEdit("agents")} agents={agents} skills={skills} models={models} user={api.user?.email} />
      }
      {editMode === "model" &&
        <EditModel id={editId} close={closeEdit("models")} models={models} user={api.user?.email} handleEdit={handleEdit} />
      }
      {editMode === "skill" &&
        <EditSkill id={editId} skills={skills} handleEdit={handleEdit} addSkill={addSkill} user={api.user?.email} addNode={() => {}} />
      }
      {editMode === null && workflow && workflow >= 0 &&
        <Workflow api={api} workflow_id={workflow} agents={agents} workflows={workflows} {...props} handleEdit={handleEdit} />
      }
    </div>
  );
}

export default BuildView;
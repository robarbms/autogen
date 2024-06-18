import React, {ReactNode, MouseEventHandler, useEffect, useState } from "react";
import { AgentConfigView, AgentViewer } from "../../builder/utils/agentconfig";
import { AgentTypeSelector, SkillSelector, AgentSelector, ModelSelector } from "../../builder/utils/selectors";
import { BugAntIcon, CpuChipIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Collapse } from "antd";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../../types";
import { ItemType } from "../../../../../node_modules/rc-collapse/es/interface";
import { Node } from "reactflow";
import { IAgentNode, AgentProperty, NodeSelection } from "./Canvas";
import AgentProperties from "./AgentProperties";
import ModelProperties from "./ModelProperties";
import SkillProperties from "./SkillProperties";
import WorkflowProperties from "./WorkflowProperties";
import { useBuildStore } from "../../../../hooks/buildStore";
import { API } from "../API";
import { XMarkIcon } from "@heroicons/react/24/solid";

// Properties for the NodeProperties panel
type NodePropertiesProps = {
  api: API,
  selected: Node & IAgentNode | AgentProperty | IWorkflow | null;
  handleInteract: MouseEventHandler<HTMLDivElement>;
  setSelectedNode: (selected: NodeSelection)  => void;
  setNodes: (nodes: Array<Node & IAgentNode>) => void;
  nodes: Array<Node & IAgentNode>;
  addEdge?: (id: string) => void;
}

/**
 * Panel for displaying an agent node's properties
 * @param props 
 * @returns 
 */
const NodeProperties = (props: NodePropertiesProps) => {
  const { api, selected, handleInteract, setSelectedNode, setNodes, nodes, addEdge } = props;
  let type = selected ? "agent" : null;
  if (selected && "parent" in selected && (selected.type === "model" || selected.type === "skill")) {
    type = selected.type;
  }
  if (selected && "summary_method" in selected) {
    type = "workflow";
  }
  const { models, skills, agents, setAgents } = useBuildStore(({ models, skills, agents, setAgents }) => ({models, skills, agents, setAgents}));
  const config: Object = selected && "config" in selected ? selected.config as Object : {};
  const cleanAgent = () => (selected ? {
    config: {...config},
    id: selected ? selected?.id : -1,
    type: selected.type,
    updated_at: "updated_at" in selected ? selected.updated_at : "",
    created_at: "created_at" in selected ? selected.created_at : "",
    user_id: "user_id" in selected ? selected.user_id : ""
  } as IAgent: null);

  // Looks up the data based on the id provided to the panel
  const getData = (props: AgentProperty) => {
    if (props.type === "model") {
      return models.find(model => model.id === props.id);
    }
    return skills.find(skill => skill.id === props.id);
  }

  // Closes the nodes property panel
  const close = () => {
    setSelectedNode(null);
  };

  return (
      <div className="node-properties h-full" onMouseUp={handleInteract}>
        <div className="properties-close" onClick={close}><XMarkIcon /></div>
        {type === "agent" && 
          <AgentProperties api={api} agent={cleanAgent()} setSelectedNode={setSelectedNode} setNodes={setNodes} agents={agents} nodes={nodes} addEdge={addEdge} />
        }
        {type === "model" &&
          <ModelProperties api={api} model={getData(selected as AgentProperty) as IModelConfig} setSelectedNode={setSelectedNode} />
        }
        {type === "skill" &&
          <SkillProperties api={api} skill={getData(selected as AgentProperty) as ISkill} setSelectedNode={setSelectedNode} />
        }
        {type === "workflow" &&
          <WorkflowProperties api={api} workflow={selected as IWorkflow} setSelectedNode={setSelectedNode} />
        }
      </div>
  )
}

export default NodeProperties;

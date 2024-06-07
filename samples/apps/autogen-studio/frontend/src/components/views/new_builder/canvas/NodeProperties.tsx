import React, {ReactNode, MouseEventHandler, useEffect, useState } from "react";
import { AgentConfigView, AgentViewer } from "../../builder/utils/agentconfig";
import { AgentTypeSelector, SkillSelector, AgentSelector, ModelSelector } from "../../builder/utils/selectors";
import { BugAntIcon, CpuChipIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Collapse } from "antd";
import { IAgent } from "../../../types";
import { ItemType } from "../../../../../node_modules/rc-collapse/es/interface";
import { Node } from "reactflow";
import { IAgentNode, AgentProperty } from "./Canvas";
import AgentProperties from "./AgentProperties";
import ModelProperties from "./ModelProperties";
import SkillProperties from "./SkillProperties";
import { useBuildStore } from "../../../../hooks/buildStore";
import { API } from "../API";

// Properties for the NodeProperties panel
type NodePropertiesProps = {
  api: API,
  selected: Node & IAgentNode | AgentProperty;
  handleInteract: MouseEventHandler<HTMLDivElement>;
  setSelectedNode: (node: Node & IAgentNode | AgentProperty | null) => void;
}

/**
 * Panel for displaying an agent node's properties
 * @param props 
 * @returns 
 */
const NodeProperties = (props: NodePropertiesProps) => {
  const { api, selected, handleInteract, setSelectedNode } = props;
  let type = selected ? "agent" : null;
  if (selected?.parent && selected.type) {
    type = selected.type;
  } 
  const { models, skills } = useBuildStore(({ models, skills}) => ({models, skills}));

  const cleanAgent = () => (selected ? {
    config: {...selected.config},
    id: selected.id,
    type: selected.type,
    updated_at: selected.updated_at,
    created_at: selected.created_at,
    user_id: selected.user_id
  }: null);

  const getData = (props: AgentProperty) => {
    if (props.type === "model") {
      return models.find(model => model.id === props.id);
    }
    return skills.find(skill => skill.id === props.id);
  }
    
    return (
        <div className="node-properties h-full" onMouseUp={handleInteract}>
          {type === "agent" && 
            <AgentProperties api={api} agent={cleanAgent()} handleInteract={handleInteract} setSelectedNode={setSelectedNode} />
          }
          {type === "model" &&
            <ModelProperties api={api} model={getData(selected)} handleInteract={handleInteract} setSelectedNode={setSelectedNode} />
          }
          {type === "skill" &&
            <SkillProperties api={api} skill={getData(selected)} handleInteract={handleInteract} setSelectedNode={setSelectedNode} />
          }
        </div>
    )
}

export default NodeProperties;

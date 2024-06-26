import React, { MouseEventHandler } from "react";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../../types";
import { Node } from "reactflow";
import { IAgentNode, AgentProperty, NodeSelection } from "../canvas/Canvas";
import AgentProperties from "./AgentProperties";
import ModelProperties from "./ModelProperties";
import SkillProperties from "./SkillProperties";
import WorkflowProperties from "./WorkflowProperties";
import { useBuildStore } from "../../../../hooks/buildStore";
import { XMarkIcon } from "@heroicons/react/24/solid";

// Properties for the NodeProperties panel
type NodePropertiesProps = {
  handleInteract: MouseEventHandler<HTMLDivElement>;
  setSelectedNode: (selected: NodeSelection)  => void;
  addEdge?: (id: string) => void;
}

/**
 * Panel for displaying an agent node's properties
 * @param props 
 * @returns 
 */
const NodeProperties = (props: NodePropertiesProps) => {
  const { handleInteract, setSelectedNode, addEdge } = props;
  const { models, skills, selectedNode } = useBuildStore(({ models, skills, selectedNode }) => ({models, skills, selectedNode}));
  let type = selectedNode ? "agent" : null;
  if (selectedNode && "parent" in selectedNode && (selectedNode.type === "model" || selectedNode.type === "skill")) {
    type = selectedNode.type;
  }
  if (selectedNode && "summary_method" in selectedNode) {
    type = "workflow";
  }

  // Gets the IAgent properties from an IAgentNode instance
  const cleanAgent = (agent: IAgent) => {
    return {
      config: {
        ...agent.config
      },
      id: agent.id,
      type: agent.type,
      updated_at: agent.updated_at,
      created_at: agent.created_at,
      user_id: agent.user_id
    }
  }
    
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
          <AgentProperties agent={cleanAgent((selectedNode as IAgentNode)?.data)} setSelectedNode={setSelectedNode} addEdge={addEdge} />
        }
        {type === "model" &&
          <ModelProperties model={getData(selectedNode as AgentProperty) as IModelConfig} setSelectedNode={setSelectedNode} />
        }
        {type === "skill" &&
          <SkillProperties skill={getData(selectedNode as AgentProperty) as ISkill} setSelectedNode={setSelectedNode} />
        }
        {type === "workflow" &&
          <WorkflowProperties workflow={selectedNode as IWorkflow} setSelectedNode={setSelectedNode} />
        }
      </div>
  )
}

export default NodeProperties;

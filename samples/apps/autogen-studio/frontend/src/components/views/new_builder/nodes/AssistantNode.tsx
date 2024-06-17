import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { AgentIcon } from '../Icons';
import { AgentProperty, IAgentNode, NodeSelection } from '../canvas/Canvas';
import { Node } from 'reactflow';
import AgentProperties from './AgentProperties';
import { IAgent, IModelConfig, ISkill } from '../../../types';

/**
 * Node for rendering assistant agents
 */
const AssistantNode = memo(
  (data: ((Node & IAgentNode | {data: IAgent, selected?: boolean, isConnectable?: boolean, id: string}) & { setSelection: (node: NodeSelection) => void, parent: string}),
  isConnectable: boolean | undefined
) => {
  const {
    models,
    skills,
    groupAgent,
    selectedProp,
  }: { 
    models: IModelConfig[],
    skills: ISkill[],
    groupAgent: boolean,
    selectedProp: AgentProperty
  } = data.data;
  const { name, description }:
    { name: string, description: string } = data.data.config;
  const dragStart = data.data.dragHandle ? (event: DragEvent) => {
    const transferData = event.dataTransfer?.getData('text/plain');
    // Only add drag data if not dragging a model or skill
    if (!transferData) {
      data.data.dragHandle(event);
    }
  } : () => {};

  const click = groupAgent ? (event: MouseEvent) => {
    event.preventDefault();
    const selected = [{
      ...data,
      data: {
        ...data.data,
        parent: data.parent
      }
    }] as NodeSelection;
    data.setSelection(selected);
  } : () => {};

  return (
    <div data-id={data.data.id} draggable={groupAgent} onDragStart={dragStart as any} className={`node group_agent node-has-content drop-models drop-skills ${data.selected ? "selected" : ""} ${data.data.deselected === true ? "deselected" : ""}`}>
      <div className={`node_title ${groupAgent ? "" : "drag-handle"}`} onClick={click as any}>
        <h2><AgentIcon />{name}</h2>
        {description}
      </div>
      <AgentProperties setSelection={data.setSelection} models={models} skills={skills} group={groupAgent ? data.parent : undefined} parent={data.data.id} instance={data.id} selectedProp={selectedProp} />
      {data.isConnectable && !data.data.hideConnector &&
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
        />
      }
    </div>
  );
});

export default AssistantNode;
import React, { memo, MouseEvent } from 'react';
import { Handle, Position } from 'reactflow';
import { AgentIcon } from '../Icons';
import { AgentProperty, IAgentNode, NodeSelection } from '../canvas/Canvas';
import { Node } from 'reactflow';
import AgentProperties from './AgentProperties';
import { IAgent, IModelConfig, ISkill } from '../../../types';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { Popover } from 'antd';

/**
 * Node for rendering assistant agents
 */
const AssistantNode = memo(
  (data: ((Node & IAgentNode | {data: IAgent, selected?: boolean, isConnectable?: boolean, id: string, removeNode: (id: number | string, parent?: string) => void}) & { setSelection: (node: NodeSelection) => void, parent: string}),
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

  // Handles selecting node if it is a linked agent to a group agent
  const click = groupAgent ? (event: MouseEvent) => {
    event.stopPropagation();
    const selected = [{
      ...data,
      data: {
        ...data.data,
        parent: data.parent
      }
    }] as NodeSelection;
    data.setSelection(selected);
  } : () => {};

  const deleteHandler = (event: MouseEvent) => {
    event.stopPropagation();
    if (data.removeNode) {
      data.removeNode(data.parent ? data.data.id : data.id, data.parent);
    }
  }

  // Actions flyout for an agent
  const actions = (
    <>
      <button onClick={deleteHandler}>{groupAgent ? "Delete from group agent" : "Delete from canvas"}</button>
    </>
  )

  return (
    <div data-id={data.data.id} draggable={groupAgent} onDragStart={dragStart as any} className={`node group_agent node-has-content drop-models drop-skills ${data.selected ? "selected" : ""} ${data.data.deselected === true ? "deselected" : ""}`}>
      <div className={`node_title ${groupAgent ? "" : "drag-handle"}`} onClick={click as any}>
        <Popover placement="bottom" content={actions} arrow={false}>
          <div className="agent-actions" onClick={(event: MouseEvent) => event.stopPropagation()}><EllipsisHorizontalIcon /></div>
        </Popover>
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

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { AgentIcon } from '../Icons';
import { IAgentNode } from '../canvas/Workflow';
import { Node } from 'reactflow';
import AgentProperties from './AgentProperties';
import { IModelConfig, ISkill } from '../../../types';

/**
 * Node for rendering assistant agents
 */
const AssistantNode = memo((data: Node & IAgentNode, isConnectable: boolean | undefined) => {
  const { models, skills, groupAgent }: { models: IModelConfig[], skills: ISkill[], groupAgent: boolean } = data.data;
  const { name, description }: { name: string, description: string } = data.data.config;
  const dragStart = data.data.dragHandle ? (event: DragEvent) => {
    const transferData = event.dataTransfer?.getData('text/plain');
    // Only add drag data if not dragging a model or skill
    if (!transferData) {
      data.data.dragHandle(event);
    }
  } : () => {};

  return (
    <div data-id={data.data.id} draggable={groupAgent} onDragStart={dragStart} className="node group_agent node-has-content drop-models drop-skills">
      <div className={`node_title ${groupAgent ? "" : "drag-handle"}`}>
        <h2><AgentIcon />{name}</h2>
        {description}
      </div>
      <AgentProperties models={models} skills={skills} parent={data.data.id} />
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

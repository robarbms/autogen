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
  const { id }: { id: string } = data;
  const { models, skills }: { models: IModelConfig[], skills: ISkill[] } = data.data;
  const { name, description }: { name: string, description: string } = data.data.config;

  return (
    <div data-id={data.data.id} className="node group_agent node-has-content drop-models drop-skills">
      <div className="node_title drag-handle">
        <h2><AgentIcon />{name}</h2>
        {description}
      </div>
      <AgentProperties models={models} skills={skills} parent={data.data.id} />
      {data.isConnectable &&
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

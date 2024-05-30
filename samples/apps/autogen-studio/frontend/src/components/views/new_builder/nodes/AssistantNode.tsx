import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { AgentIcon } from '../Icons';
import { IAgentNode } from '../canvas/Workflow';
import { Node } from 'reactflow';
import { IModelConfig, ISkill } from '../../../types';
import Model from './ModelNode';
import Skill from './SkillNode';
import AgentProperties from './AgentProperties';

/**
 * Node for rendering assistant agents
 */
const AssistantNode = memo((data: Node & IAgentNode, isConnectable: boolean | undefined) => {

  return (
    <div data-id={data.data.id} className="node group_agent node-has-content drop-models drop-skills">
      <div className="node_title">
        <h2><AgentIcon />{data.data.config.name}</h2>
        {data.data.config.description}
      </div>
      <AgentProperties data={data.data} />
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

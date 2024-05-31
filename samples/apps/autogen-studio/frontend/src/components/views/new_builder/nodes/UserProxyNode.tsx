import { Card } from 'antd';
import React, { memo, useEffect, createRef } from 'react';
import { Handle, Position, Node } from 'reactflow';
import { AgentIcon } from '../Icons';
import AgentProperties from './AgentProperties';
import { IAgentNode } from '../canvas/Workflow';
import { IModelConfig, ISkill } from '../../../types';

/**
 * A node representing a userproxy agent
 */
const UserproxyNode = memo((data: Node & IAgentNode, isConnectable) => {
  const { id }: { id: string } = data;
  const { isInitiator, models, skills }: { isInitiator: boolean, models: IModelConfig[], skills: ISkill[] } = data.data;
  const { description, name }: { description: string, name: string } = data.data.config;

  return (
    <div data-id={id} className="node group_agent node-has-content drop-models drop-skills">
      {isInitiator &&
        <div className="node_tag">Initiator &gt;</div>
      }
      <div className="node_title">
        <h2><AgentIcon />{name}</h2>
        {description}
      </div>
      <AgentProperties {...{ models, skills }} />
      {data.isConnectable &&
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
        />
      }
    </div>
  );
});

export default UserproxyNode;

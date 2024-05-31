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
  const { isInitiator, models, skills, groupAgent }: { isInitiator: boolean, models: IModelConfig[], skills: ISkill[], groupAgent: boolean } = data.data;
  const { description, name }: { description: string, name: string } = data.data.config;

  return (
    <div data-id={data.data.id} draggable={groupAgent} className="node group_agent node-has-content drop-models drop-skills">
      {isInitiator &&
        <div className="node_tag">Initiator &gt;</div>
      }
      <div className={`node_title ${groupAgent ? "" : "drag-handle"}`}>
        <h2><AgentIcon />{name}</h2>
        {description}
      </div>
      <AgentProperties {...{ models, skills }} parent={data.data.id} />
      {data.isConnectable && !data.data.hideConnector &&
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

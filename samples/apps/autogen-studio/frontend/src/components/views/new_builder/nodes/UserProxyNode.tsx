import { Card } from 'antd';
import React, { memo, useEffect, createRef, MouseEvent } from 'react';
import { Handle, Position, Node } from 'reactflow';
import { AgentIcon } from '../Icons';
import AgentProperties from './AgentProperties';
import { IModelConfig, ISkill } from '../../../types';
import { IAgentNode, AgentProperty } from "../canvas/Canvas";

/**
 * A node representing a userproxy agent
 */
const UserproxyNode = memo((data: Node & IAgentNode & { setSelection: (event: MouseEvent) => void}, isConnectable) => {
  const { id }: { id: string } = data;
  const { isInitiator, models, skills, groupAgent, selectedProp }: { isInitiator: boolean, models: IModelConfig[], skills: ISkill[], groupAgent: boolean, selectedProp: AgentProperty } = data.data;
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
      <AgentProperties setSelection={data.setSelection} {...{ models, skills }} parent={data.data.id} instance={data.id} selectedProp={selectedProp} />
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

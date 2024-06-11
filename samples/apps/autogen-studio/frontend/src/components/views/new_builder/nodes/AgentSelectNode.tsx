import React, { memo, MouseEvent } from 'react';
import { Handle, Position, Node } from 'reactflow';
import { AgentIcon } from '../Icons';
import AgentProperties from './AgentProperties';
import { IModelConfig, ISkill } from '../../../types';
import { IAgentNode, AgentProperty } from "../canvas/Canvas";

/**
 * A node representing an empty agent
 */
const AgentSelectNode = memo((data: Node & IAgentNode & { setSelection: (event: MouseEvent) => void}, isConnectable) => {
    const { id }: { id: string } = data;
    const { name, description } = data.data.config;
  
    return (
      <div data-id={data.data.id} className="node group_agent">
        <div className={`node_title`}>
          <h2><AgentIcon />{name}</h2>
          {description}
        </div>
      </div>
    );
  });
  
  export default AgentSelectNode;
  
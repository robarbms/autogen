import React, { memo, MouseEvent } from 'react';
import { Node } from 'reactflow';
import { AgentIcon } from '../../utilities/Icons';
import { IAgentNode, AgentProperty } from "../Canvas";

/**
 * A node representing an empty agent
 */
const AgentSelectNode = memo((data: Node & IAgentNode & { setSelection: (event: MouseEvent) => void}, isConnectable) => {
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
  
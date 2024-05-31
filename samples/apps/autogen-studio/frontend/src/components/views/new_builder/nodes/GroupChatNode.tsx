import React, { createRef, memo } from 'react';
import { Handle, Position, Node } from 'reactflow';
import AssistantNode from './AssistantNode';
import UserproxyNode from './UserProxyNode';
import { AgentIcon } from '../Icons';
import { IAgentNode } from '../canvas/Workflow';

/**
 * Node for rendering group chat manager
 */
const GroupChatNode = memo((data: Node & IAgentNode, isConnectable) => {
  const { id }: { id: string} = data;
  const { linkedAgents }: { linkedAgents: IAgentNode[] }  = data.data;
  const { name, description }: { name: string, description: string} = data.data.config;
  const container = createRef();

  return (
    <div data-id={id} className="node group_agent node-has-content drop-agents" ref={container}>
        <div className="node_title">
          <h2><AgentIcon />{name}</h2>
          {description}
        </div>
        <div className="nodes_area">{linkedAgents && 
            linkedAgents.map((node, idx) => node.type === "assistant" ? 
              <AssistantNode groupAgent={true} key={idx + 10} data={node} isConnectable={false} /> :
              <UserproxyNode groupAgent={true} key={idx + 10} data={node} isConnectable={false} />
            )
        }</div>
        <Handle
            type="target"
            position={Position.Left}
            isConnectable={isConnectable}
        />
    </div>
  );
});

export default GroupChatNode;
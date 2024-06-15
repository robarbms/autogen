import React, { createRef, memo } from 'react';
import { Handle, Position, Node } from 'reactflow';
import AssistantNode from './AssistantNode';
import UserproxyNode from './UserProxyNode';
import { AgentIcon } from '../Icons';
import { IAgentNode } from '../canvas/Canvas';

/**
 * Node for rendering group chat manager
 */
const GroupChatNode = memo((data: Node & IAgentNode, isConnectable) => {
  const { id, setSelection }: { id: string, setSelection: (node: Node & IAgentNode) => void} = data;
  let { linkedAgents }: { linkedAgents: Array<IAgentNode & {dragHandle?: (event: DragEvent) => void }> }  = data.data;
  const { name, description }: { name: string, description: string} = data.data.config;
  const container = createRef();

  const dragHandle = (id: number, type: string) => {
    return (event: DragEvent) => {
        const position = (event.target as HTMLDivElement)?.getBoundingClientRect();
        const dataTransfer = {
            id,
            type,
            parent: data.data.id,
            group: "group-agent"
        };
        const nodeInfo = JSON.stringify(dataTransfer);
        event.dataTransfer?.setData('text/plain', nodeInfo);
    }
  }

  linkedAgents = linkedAgents ? linkedAgents.map((agent) => {
    agent.dragHandle = dragHandle(agent.id, agent.type);
    return agent;
  }) : linkedAgents;

  return (
    <div data-id={data.data.id} className={`node group_agent node-has-content drop-agents ${data.data.deselected ? "deselected" : ""}`} ref={container}>
        <div className="node_title drag-handle">
          <h2><AgentIcon />{name}</h2>
          {description}
        </div>
        <div className="nodes_area">
          {linkedAgents && 
            linkedAgents.map((node, idx) => node.type === "assistant" ? 
              <AssistantNode key={idx} data={node} isConnectable={false} selected={node.id === data.data.selectedProp?.id} setSelection={setSelection} id={`${idx}`} parent={id} /> :
              <UserproxyNode key={idx} data={node} isConnectable={false} selected={node.id === data.data.selectedProp?.id} setSelection={setSelection} id={`${idx}`} parent={id} />
            )
          }
          {!linkedAgents || linkedAgents.length < 1 &&
            <div className="node-property-empty">Drag &amp; drop to add an agent</div>
          }
        </div>
        {!data.data.hideConnector &&
          <Handle
            type="target"
            position={Position.Left}
            isConnectable={isConnectable}
          />
        }
    </div>
  );
});

export default GroupChatNode;
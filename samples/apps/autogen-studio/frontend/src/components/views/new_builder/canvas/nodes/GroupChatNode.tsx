import React, { createRef, memo, useMemo, MouseEvent } from 'react';
import { Handle, Position, Node } from 'reactflow';
import AssistantNode from './AssistantNode';
import UserproxyNode from './UserProxyNode';
import { AgentIcon } from '../../utilities/Icons';
import { IAgentNode, NodeSelection } from '../Canvas';
import { IAgent } from '../../../../types';
import { Popover } from 'antd';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';

/**
 * Node for rendering group chat manager
 */
const GroupChatNode = memo(
  (data: Node & IAgentNode & { setSelection: (node: NodeSelection) => void, parent: string, removeNode: (id: string | number, parent?: string) => void, setInitiator: (id: string) => void},
  isConnectable) => {
  const { id, setSelection }: { id: string, setSelection: (selected: NodeSelection) => void} = data;
  let { linkedAgents }: { linkedAgents: Array<IAgent & {dragHandle?: (event: DragEvent) => void }> | undefined }  = data.data;
  const { name, description }: { name: string, description: string} = data.data.config;
  const container = createRef<HTMLDivElement>();

  // Drag handle used by linked agents
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

  // Binds the drag handles to the linked agents data
  if (linkedAgents) {
    linkedAgents = linkedAgents.map((agent: IAgent & {dragHandle?: (event: DragEvent) => void}) => {
      agent.dragHandle = dragHandle(agent.id || -1, agent.type || "");
      return agent;
    });
  }

  // deletes the node from the canvas
  const deleteHandler = (event: MouseEvent) => {
    event.stopPropagation();
    if (data.removeNode) {
      data.removeNode(data.id);
    }
  }

  // Actions flyout for an agent
  const actions = (
    <>
      <button onClick={deleteHandler as any}>{"Delete from canvas"}</button>
    </>
  )

  return (
    <div data-id={data.data.id} className={`node group_agent node-has-content drop-agents ${data.data.deselected ? "deselected" : ""}`} ref={container}>
        <div className="node_title drag-handle">
          <Popover placement="bottom" content={actions} arrow={false}>
              <div className="agent-actions nodrag"><EllipsisHorizontalIcon /></div>
          </Popover>
          <h3><AgentIcon />{name}</h3>
          {description}
        </div>
        <div className="nodes_area">
          {linkedAgents && 
            linkedAgents.map((node: IAgent, idx: number) => node.type === "assistant" ? 
              <AssistantNode key={idx} data={node} isConnectable={false} selected={node.id === data.data.selectedProp?.id} setSelection={setSelection} id={`${idx}`} parent={id} removeNode={data.removeNode} /> :
              <UserproxyNode key={idx} data={node} isConnectable={false} selected={node.id === data.data.selectedProp?.id} setSelection={setSelection} id={`${idx}`} parent={id} removeNode={data.removeNode} setInitiator={data.setInitiator} />
            )
          }
          {(!linkedAgents || linkedAgents.length === 0) &&
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
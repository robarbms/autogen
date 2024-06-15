import React, { memo, MouseEvent } from 'react';
import { Handle, Position, Node } from 'reactflow';
import { AgentIcon } from '../Icons';
import AgentProperties from './AgentProperties';
import { IModelConfig, ISkill } from '../../../types';
import { IAgentNode, AgentProperty } from "../canvas/Canvas";

/**
 * A node representing a userproxy agent
 */
const UserproxyNode = memo((data: Node & IAgentNode & { setSelection: (event: MouseEvent) => void, parent: string}, isConnectable) => {
  const { id }: { id: string } = data;
  const { isInitiator, models, skills, groupAgent, selectedProp }: { isInitiator: boolean, models: IModelConfig[], skills: ISkill[], groupAgent: boolean, selectedProp: AgentProperty } = data.data;
  const { description, name }: { description: string, name: string } = data.data.config;
  const dragStart = data.data.dragHandle ? (event: DragEvent) => {
    const transferData = event.dataTransfer?.getData('text/plain');
    // Only add drag data if not dragging a model or skill
    if (!transferData) {
      data.data.dragHandle(event);
    }
    return true;
  } : () => {};


  const click = groupAgent ? (e) => {
    e.preventDefault();
    data.setSelection(
      [{
        ...data,
        data: {
          ...data.data,
          parent:  data.parent
        }
      }]);
  } : () => {};

  return (
    <div data-id={data.data.id} draggable={groupAgent} onDragStart={dragStart} className={`node group_agent node-has-content drop-models drop-skills ${data.selected ? "selected" : ""} ${data.data.deslected ? "deselected" : ""}`}>
      {isInitiator &&
        <div className="node_tag">Initiator &gt;</div>
      }
      <div className={`node_title ${groupAgent ? "" : "drag-handle"}`} onClick={click}>
        <h2><AgentIcon />{name}</h2>
        {description}
      </div>
      <AgentProperties setSelection={data.setSelection} {...{ models, skills }} group={groupAgent ? data.parent : undefined} parent={data.data.id} instance={data.id} selectedProp={selectedProp} />
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

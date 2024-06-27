import React, { memo, MouseEvent } from 'react';
import { Handle, Position, Node } from 'reactflow';
import { AgentIcon } from '../../utilities/Icons';
import AgentProperties from './AgentProperties';
import { IAgent, IModelConfig, ISkill } from '../../../../types';
import { IAgentNode, AgentProperty, NodeSelection } from "../Canvas";
import { Popover } from 'antd';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';

/**
 * A node representing a userproxy agent
 */
const UserproxyNode = memo(
  (data: ((Node & IAgentNode | {data: IAgent, selected?: boolean, isConnectable?: boolean, id: string, removeNode: (id: number | string, parent?: string) => void, setInitiator: (id: string) => void}) & { setSelection: (node: NodeSelection) => void, parent: string}),
  isConnectable) => {
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


  // Click handler for selecting the node instance
  const click = groupAgent ? (event: MouseEvent) => {
    event.stopPropagation();
    const selected = {
      ...data,
      data: {
        ...data.data,
        parent:  data.parent
      }
    } as NodeSelection & { parent?: string };
    delete selected?.parent;
    data.setSelection(selected);
  } : () => {};

  // deletes the node from the canvas or unlinks it from a group agent
  const deleteHandler = (event: MouseEvent) => {
    event.stopPropagation();
    if (data.removeNode) {
      data.removeNode(data.parent ? data.data.id : data.id, data.parent);
    }
  }

  // Sets the node as the initiator
  const initiatorHandler = (event: MouseEvent) => {
    event.stopPropagation();
    if (data.setInitiator) {
      data.setInitiator(data.id);
    }
  }

  // Actions flyout for an agent
  const actions = (
    <>
      {(!data.data.isInitiator || data.data.isInitiator === false) && !data.parent &&
        <div className="set-initiator">
          <button onClick={initiatorHandler}>Set as Initiator</button>
        </div>
      }
      <button onClick={deleteHandler}>{groupAgent ? "Delete from group agent" : "Delete from canvas"}</button>
    </>
  )

  return (
    <div data-id={data.data.id} draggable={groupAgent} onDragStart={dragStart as any} className={`node group_agent node-has-content drop-models drop-skills ${data.selected ? "selected" : ""} ${data.data.active === true ? "active" : ""}`}>
      {isInitiator &&
        <div className="node_tag">Initiator &gt;</div>
      }
      <div className={`node_title ${groupAgent ? "" : "drag-handle"}`} onClick={click}>
        <Popover placement="bottom" content={actions} arrow={false}>
            <div className="agent-actions nodrag"><EllipsisHorizontalIcon /></div>
        </Popover>
        <h3><AgentIcon />{name}</h3>
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

import { Card } from 'antd';
import React, { createRef, memo, useContext, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { message } from "antd";
import { fetchJSON, getServerUrl } from "../../../utils";
import { IAgent } from "../../../types";
import { appContext } from "../../../../hooks/provider";
import AssistantNode from './AssistantNode';
import UserproxyNode from './UserProxyNode';
import { AgentIcon } from '../Icons';
import { useBuildStore } from '../../../../hooks/buildStore';
import { API } from '../API';

/**
 * Node for rendering group chat manager
 */
const GroupChatNode = memo((data, isConnectable) => {
  const { id } = data;
  const { config, linkedAgents } = data.data;
  const { name, description } = config;
  const container = createRef();

  return (
    <div data-id={id} className="node group_agent node-has-content drop-agents" ref={container}>
        <div className="node_title">
          <h2><AgentIcon />{name}</h2>
          {description}
        </div>
        <div className="nodes_area">{linkedAgents && 
            linkedAgents.map((node, idx) => node.type === "assistant" ? <AssistantNode groupAgent={true} key={idx + 10} data={node} isConnectable={false} /> : <UserproxyNode groupAgent={true} key={idx + 10} data={node} isConnectable={false} />)
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
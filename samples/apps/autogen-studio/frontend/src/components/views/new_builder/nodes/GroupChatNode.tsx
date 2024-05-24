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

/**
 * Node for rendering group chat manager
 */
const GroupChatNode = memo((data, isConnectable) => {
  const container = createRef();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [agents, setAgents] = useState<IAgent[]>([]);
  const [targetAgents, setTargetAgents] = useState<IAgent[]>([]);
  const serverUrl = getServerUrl();
  const { user } = React.useContext(appContext);
  const listAgentsUrl = `${serverUrl}/agents?user_id=${user?.email}`;
  const agentId = data?.data?.id;
  const listTargetAgentsUrl = `${serverUrl}/agents/link/agent/${agentId}`;

  const fetchAgents = () => {
    setError(null);
    setLoading(true);
    const payLoad = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const onSuccess = (data: any) => {
      if (data && data.status) {
        setAgents(data.data);
      } else {
        message.error(data.message);
      }
      setLoading(false);
    };

    const onError = (err: any) => {
      setError(err);
      message.error(err.message);
      setLoading(false);
    };

    fetchJSON(listAgentsUrl, payLoad, onSuccess, onError);
  };

  const fetchTargetAgents = () => {
    setError(null);
    setLoading(true);
    const payLoad = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const onSuccess = (data: any) => {
      if (data && data.status) {
        setAgents(data.data);
      } else {
        message.error(data.message);
      }
      setLoading(false);
    };

    const onError = (err: any) => {
      setError(err);
      message.error(err.message);
      setLoading(false);
    };

    fetchJSON(listTargetAgentsUrl, payLoad, onSuccess, onError);
  };

  useEffect(() => {
    // setTimeout(() => (container?.current?.className += ' agent_load'), 300);
    fetchTargetAgents();
  }, []);

  const agentMap = {
    assistant: AssistantNode,
    userproxy: UserproxyNode
  }

  return (
    <div className="node group_agent node-has-content" ref={container}>
        <div className="node_title">
          <h2><AgentIcon />{data.data.config.name}</h2>
          {data.data.config.description}
        </div>
        <div className="nodes_area">{agents && 
            agents.map((node, idx) => node.type === "assistant" ? <AssistantNode groupAgent={true} key={idx + 10} data={node} isConnectable={false} /> : <UserproxyNode groupAgent={true} key={idx + 10} data={node} isConnectable={false} />)
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
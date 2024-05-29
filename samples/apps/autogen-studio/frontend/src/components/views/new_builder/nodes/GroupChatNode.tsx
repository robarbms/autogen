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
  const { agents, models, skills } = useBuildStore(({ agents, models, skills }) => ({
    agents,
    models,
    skills
  }));
  const api:API = data.data.api;
  const container = createRef();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [targetAgents, setTargetAgents] = useState<IAgent[]>([]);
  const serverUrl = getServerUrl();
  const { user } = React.useContext(appContext);
  const listAgentsUrl = `${serverUrl}/agents?user_id=${user?.email}`;
  const agentId = data?.data?.id;
  const listTargetAgentsUrl = `${serverUrl}/agents/link/agent/${agentId}`;
  const [agentList, setAgentList] = useState([]);

  const getLinkedAgents = () => {
    api.getLinkedAgents(agentId, (linkedAgents) => {
      let agentsLinked = [];
      const addAgent = () => {
        if (linkedAgents.length === 0) {
          setAgentList(agentsLinked);
        }
        else {
          const nextAgent = linkedAgents.pop();
          api.getAgentModels(nextAgent.id, (agentModels) => {
            api.getAgentSkills(nextAgent.id, (agentSkills) => {
              nextAgent.models = agentModels;
              nextAgent.skills = agentSkills;
              agentsLinked.push(nextAgent);
              addAgent();
            })
          })
        }
      }
      addAgent();
    });
  }


  useEffect(() => {
    getLinkedAgents();
  }, []);

  return (
    <div data-id={data.id} className="node group_agent node-has-content drop-agents" ref={container}>
        <div className="node_title">
          <h2><AgentIcon />{data.data.config.name}</h2>
          {data.data.config.description}
        </div>
        <div className="nodes_area">{agents && 
            agentList.map((node, idx) => node.type === "assistant" ? <AssistantNode groupAgent={true} key={idx + 10} data={node} isConnectable={false} /> : <UserproxyNode groupAgent={true} key={idx + 10} data={node} isConnectable={false} />)
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
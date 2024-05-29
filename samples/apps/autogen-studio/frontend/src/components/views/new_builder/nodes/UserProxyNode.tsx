import { Card } from 'antd';
import React, { memo, useEffect, createRef } from 'react';
import { Handle, Position } from 'reactflow';
import { AgentIcon } from '../Icons';
import { IAgent } from '../../../types';
import AgentProperties from './AgentProperties';
import { IAgentNode } from '../canvas/Workflow';

type dataType = IAgentNode;

const UserproxyNode = memo((data: IAgentNode, isConnectable) => {
  return (
    <div data-id={data.id} className="node group_agent node-has-content drop-models drop-skills">
      {data.data.isInitiator &&
        <div className="node_tag">Initiator &gt;</div>
      }
      <div className="node_title">
        <h2><AgentIcon />{data.data.config.name}</h2>
        {data.data.config.description}
      </div>
      <AgentProperties data={data.data} />
      {data.isConnectable &&
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

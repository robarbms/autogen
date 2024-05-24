import { Card } from 'antd';
import React, { memo, useEffect, createRef } from 'react';
import { Handle, Position } from 'reactflow';
import { AgentIcon } from '../Icons';
import { IAgent } from '../../../types';

type dataType = IAgent & {
  data: {}
}

const UserproxyNode = memo((data, isConnectable) => {
  return (
    <div className="node group_agent">
      {data.data.isInitiator &&
        <div className="node_tag">Initiator &gt;</div>
      }
      <div className="node_title">
        <h2><AgentIcon />{data.data.config.name}</h2>
        {data.data.config.description}
      </div>
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

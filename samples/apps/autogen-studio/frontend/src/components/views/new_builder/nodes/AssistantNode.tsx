import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { AgentIcon, ModelIcon, SkillIcon } from '../Icons';
import { IAgentNode } from '../canvas/Workflow';
import { Node } from 'reactflow';
import { IModelConfig, ISkill } from '../../../types';

// Rendering for an agent model
const Model = (props: IModelConfig) => (
  <div className="node-model"><ModelIcon />{props.model}</div>
)

// Rendering for an agent skill
const Skill = (props: ISkill) => <div className="node-skill"><SkillIcon />{props.name}</div>

/**
 * Node for rendering assistant agents
 */
const AssistantNode = memo((data: Node & IAgentNode, isConnectable: boolean | undefined) => {
  return (
    <div className={`node group_agent ${data.data.models?.length > 0 || data.data.skills?.length > 0 ? "node-has-content" : ""}`}>
      <div className="node_title">
        <h2><AgentIcon />{data.data.config.name}</h2>
        {data.data.config.description}
      </div>
      <div className="node_properties">
        {data.data.models &&
          data.data.models.map((model: IModelConfig, idx: number) => <Model {...model} key={idx} />)
        }
        {data.data.skills &&
          data.data.skills.map((skill: ISkill, idx: number) => <Skill {...skill} key={idx} />)
        }
      </div>
      {data.isConnectable &&
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
        />
      }
    </div>
  );
});

export default AssistantNode;

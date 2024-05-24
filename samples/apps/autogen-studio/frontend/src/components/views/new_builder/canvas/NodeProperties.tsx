import React, {ReactNode} from "react";
import { AgentConfigView, AgentViewer } from "../../builder/utils/agentconfig";
import { AgentTypeSelector, SkillSelector, AgentSelector, ModelSelector } from "../../builder/utils/selectors";
import { BugAntIcon, CpuChipIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Collapse } from "antd";
import { IAgent } from "../../../types";
import { ItemType } from "antd/es/menu/hooks/useItems";

// Properties for the NodeProperties panel
type NodePropertiesProps = {
  agent: IAgent;
  setAgent: (agents: IAgent) => void;
}

type CollapsePanel = {
  label: ReactNode;
  key: string;
  children: ReactNode | Element | Array<ReactNode | Element>;
}

/**
 * Panel for displaying an agent node's properties
 * @param props 
 * @returns 
 */
const NodeProperties = (props: NodePropertiesProps) => {
    const { agent, setAgent } = props;
    let items: ItemType[] = [
        {
          label: (
            <div className="w-full  ">
              {" "}
              <BugAntIcon className="h-4 w-4 inline-block mr-1" />
              Agent Configuration
            </div>
          ),
          key: "0",
          children: (
            <div>
              {!agent?.type && (
                <AgentTypeSelector agent={agent} setAgent={setAgent} />
              )}
    
              {agent?.type && agent && (
                <AgentConfigView agent={agent} setAgent={setAgent} close={()=>{alert('hi')}} />
              )}
            </div>
          ),
        },
      ];
      if (agent) {
        if (agent?.id) {
          if (agent.type && agent.type === "groupchat") {
            items.push({
              label: (
                <div className="w-full  ">
                  {" "}
                  <UserGroupIcon className="h-4 w-4 inline-block mr-1" />
                  Agents
                </div>
              ),
              key: "1",
              children: <AgentSelector agentId={agent?.id} />,
            });
          }
    
          items.push({
            label: (
              <div className="w-full  ">
                {" "}
                <CpuChipIcon className="h-4 w-4 inline-block mr-1" />
                Models
              </div>
            ),
            key: "2",
            children: <ModelSelector agentId={agent?.id} />,
          });
    
          items.push({
            label: (
              <>
                <BugAntIcon className="h-4 w-4 inline-block mr-1" />
                Skills
              </>
            ),
            key: "3",
            children: <SkillSelector agentId={agent?.id} />,
          });
        }
      }
    
    return (
        <div className="node-properties h-full">
            <h2>Agent: {agent.config.name}</h2>
            <Collapse
                className="node-prop-collapse"
                bordered={false}
                items={items}
                defaultActiveKey={["0", "1"]}
            />
        </div>
    )
}

export default NodeProperties;

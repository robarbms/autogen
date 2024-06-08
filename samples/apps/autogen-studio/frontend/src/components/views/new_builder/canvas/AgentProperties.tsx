import React, { useEffect, useState } from "react";
import { Node } from "reactflow";
import { AgentProperty, IAgentNode } from "./Canvas";
import { IAgent } from "../../../types";
import { ItemType } from "../../../../../node_modules/rc-collapse/es/interface";
import { BugAntIcon, CpuChipIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { AgentConfigView } from "../../builder/utils/agentconfig";
import { AgentTypeSelector, SkillSelector, AgentSelector, ModelSelector } from "../../builder/utils/selectors";
import { Collapse } from "antd";
import { API } from "../API";
import { useBuildStore } from "../../../../hooks/buildStore";

type AgentPropertiesProps = {
    agent: IAgent;
    api: API;
    setSelectedNode: (node: Node & IAgentNode | AgentProperty | null) => void;
}

const AgentProperties = (props: AgentPropertiesProps) => {
    const { agent, api, setSelectedNode } = props;
    const [ agentEdit, setAgentEdit ] = useState<IAgent | null>(null);
    const { setAgents } = useBuildStore(({setAgents}) => ({setAgents}));

    useEffect(() => {
        setAgentEdit(JSON.parse(JSON.stringify(agent)));
    }, [agent]);

    const updateAgent = (agent) => {
        setAgentEdit(JSON.parse(JSON.stringify(agent)));
    }

    const close = () => {
        setSelectedNode(null);
    }

    // Items to show in the collapse menu for agent edit
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
              {!agentEdit?.type && (
                <AgentTypeSelector agent={agentEdit} setAgent={updateAgent} />
              )}
    
              {agentEdit?.type && agent && (
                <AgentConfigView agent={agentEdit} setAgent={updateAgent} close={close} />
              )}
            </div>
          ),
        },
      ];
      if (agentEdit) {
        if (agentEdit.id) {
          if (agentEdit.type && agentEdit.type === "groupchat") {
            items.push({
              label: (
                <div className="w-full  ">
                  {" "}
                  <UserGroupIcon className="h-4 w-4 inline-block mr-1" />
                  Agents
                </div>
              ),
              key: "1",
              children: <AgentSelector agentId={agentEdit.id} />,
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
            children: <ModelSelector agentId={agentEdit.id} />,
          });
    
          items.push({
            label: (
              <>
                <BugAntIcon className="h-4 w-4 inline-block mr-1" />
                Skills
              </>
            ),
            key: "3",
            children: <SkillSelector agentId={agentEdit.id} />,
          });
        }
      }
      
      return (
        <>
            <h2>Agent: {agentEdit?.config.name}</h2>
            <Collapse
                className="node-prop-collapse"
                bordered={false}
                items={items}
                defaultActiveKey={["0", "1"]}
            />
        </>
    );
}

export default AgentProperties;

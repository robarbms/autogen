import React, { useEffect, useState } from "react";
import { Node } from "reactflow";
import { AgentProperty, IAgentNode, NodeSelection } from "./Canvas";
import { IAgent } from "../../../types";
import { ItemType } from "../../../../../node_modules/rc-collapse/es/interface";
import { BugAntIcon, CpuChipIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { AgentConfigView } from "../../builder/utils/agentconfig";
import { AgentTypeSelector, SkillSelector, AgentSelector, ModelSelector } from "../../builder/utils/selectors";
import { Collapse } from "antd";
import { API } from "../API";
import { useBuildStore } from "../../../../hooks/buildStore";

// properties for the AgentProperties component
type AgentPropertiesProps = {
    agent: IAgent | null;
    api: API;
    setSelectedNode: (node: NodeSelection) => void;
    agents: Array<IAgent>;
    nodes: Array<Node & IAgentNode>;
    setNodes: (nodes: Array<Node & IAgentNode>) => void;
    addEdge?: (id: string) => void;
}

/**
 * Component used for the edit agent panel on the workflow canvas
 * @param props 
 * @returns 
 */
const AgentProperties = (props: AgentPropertiesProps) => {
    let { agent, api, setSelectedNode, agents, nodes, setNodes, addEdge } = props;
    const [ agentEdit, setAgentEdit ] = useState<IAgent | null>(null);
    const { setAgents } = useBuildStore(({setAgents}) => ({setAgents}));

    useEffect(() => {
      // Create a copy of the agent details to an editable object
      setAgentEdit({...JSON.parse(JSON.stringify(agent)), ...{type: agent?.type}});
    }, [agent]);

    // Updates agent edits locally
    const updateAgent = (agent: IAgent) => {
      setAgentEdit(JSON.parse(JSON.stringify(agent)));
    }

    // Closes the agent properties panel
    const close = () => {
        setSelectedNode(null);
    }

    // Adds a new agent
    const addAgent = (data: IAgent) => {
      const maxId = agents && agents.length > 0 ? Math.max(...agents.map(agent => agent.id || 0)) : 0;
      const id = maxId + 1;
      const agentData = {
        ...agent,
        config: {
          ...data.config,
        },
        id,
        type: data.type
      }

      api.addAgent(agentData, (resp) => {
        // Update agents when new agent is added
        const updatedAgents = agents.concat([agentData]);
        setAgents(updatedAgents);
        // get selected node and update it
        const tempNodeIndex = nodes.findIndex(node => node.data.id === -1);
        const tempNode = nodes[tempNodeIndex];
        if (tempNode) {
          // create a new node
          const newNode = {
            ...tempNode,
            data: {
              ...agentData,
              models: [],
              skills: [],
              isInitiator: nodes.length === 1
            },
            type: agentData.type,
          } as Node & IAgentNode;
          const updatedNodes = nodes;
          updatedNodes[tempNodeIndex] = newNode;
          setNodes(updatedNodes);
          if (newNode.type !== "userproxy" && addEdge) {
            addEdge(newNode.id);
          }
          setSelectedNode([newNode]);
        }
      });
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
              {(!agentEdit || !agentEdit.type || agentEdit.type === undefined) && (
                <AgentTypeSelector agent={agentEdit} setAgent={addAgent} />
              )}
    
              {agentEdit?.type && agentEdit?.type !== undefined && agent && (
                <AgentConfigView agent={agentEdit} setAgent={updateAgent} close={close} />
              )}
            </div>
          ),
        },
      ];
      if (agentEdit) {
        if (agentEdit.id && agentEdit.id >= 0) {
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
                className="node-prop-collapse vertical-flex"
                bordered={false}
                items={items}
                defaultActiveKey={["0", "1"]}
            />
        </>
    );
}

export default AgentProperties;

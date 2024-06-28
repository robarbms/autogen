import React, { useEffect, useState } from "react";
import { Node, useNodes, useReactFlow } from "reactflow";
import { IAgentNode, NodeSelection } from "../Canvas";
import { IAgent } from "../../../../types";
import { ItemType } from "rc-collapse/es/interface";
import { BugAntIcon, CpuChipIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { AgentConfigView } from "../../../builder/utils/agentconfig";
import { AgentTypeSelector, SkillSelector, AgentSelector, ModelSelector } from "../../../builder/utils/selectors";
import { Collapse } from "antd";
import { useBuildStore } from "../../../../../hooks/buildStore";

// properties for the AgentProperties component
type AgentPropertiesProps = {
    agent: IAgent | null;
    setSelectedNode: (node: NodeSelection) => void;
    addEdge?: (id: string) => void;
}

/**
 * Component used for the edit agent panel on the workflow canvas
 * @param props 
 * @returns 
 */
const AgentProperties = (props: AgentPropertiesProps) => {
    let { agent, setSelectedNode, addEdge } = props;
    const [ agentEdit, setAgentEdit ] = useState<IAgent | null>(null);
    const { api, setAgents, agents } = useBuildStore(({ api, setAgents, agents }) => ({ api, setAgents, agents }));
    const nodes = useNodes() as Array<Node & IAgentNode>;
    const { setNodes } = useReactFlow();

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
      if (api) {
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

        api.setAgent(agentData, (resp) => {
          // Update agents when new agent is added
          const updatedAgents = [...agents, agentData];
          setAgents(updatedAgents);
          // get selected node and update it
          let tempNodeIndex = nodes.findIndex(node => node.data.id === -1);
          let tempNode: Node & IAgentNode | IAgent = nodes[tempNodeIndex];
          let parent = null;

          // doesn't exist on the canvas
          // Search for node in groupchat nodes
          if (!tempNode) {
            nodes.forEach((node: Node & IAgentNode, parentIndex: number) => {
              if (node.type === "groupchat") {
                node.data.linkedAgents?.map((agent: IAgent, index: number) => {
                  if (agent.id === -1) {
                    tempNode = {
                      id: "0",
                      isConnectable: false,
                      position: {
                        x: 0,
                        y: 0
                      }
                    } as any;
                    tempNodeIndex = index;
                    parent = parentIndex;
                  }
                })
              }
            })
          }

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
              selected: true,
            } as Node & IAgentNode;
            const updatedNodes = JSON.parse(JSON.stringify(nodes));
            let selected: NodeSelection = newNode;

            // If the node is a child of a groupchat agent
            if (parent !== null) {
              updatedNodes[parent].data.linkedAgents[tempNodeIndex] = agentData;
              selected = {
                data: {
                  ...agentData,
                  parent: nodes[parent].id
                },
                id: tempNodeIndex,
                isConnectable: false,
                selected: true,
              } as any;
            }
            // Othewise, replace agent found on canvas
            else {
              updatedNodes[tempNodeIndex] = newNode;
            }

            setSelectedNode(selected);
            setNodes(updatedNodes);
            if (newNode.type !== "userproxy" && addEdge) {
              addEdge(newNode.id)
            }
          }
        });
      }
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

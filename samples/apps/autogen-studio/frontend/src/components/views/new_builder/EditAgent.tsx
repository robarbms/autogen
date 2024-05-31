import React, { useEffect, useState } from "react";
import BuildLayout from "./canvas/BuildLayout";
import Library from "./library/Library";
import { IAgent, IModelConfig, ISkill } from "../../types";
import { LibraryGroup } from "./library/Library";
import AgentCanvas from "./AgentCanvas";
import { Edge, Node, ReactFlowProvider, useNodesState, useEdgesState } from "reactflow";
import { useBuildStore } from "../../../hooks/buildStore";
import { API } from "./API";
import BuildNavigation from "./BuildNavigation";
import { IAgentNode, NodePosition } from "./canvas/Workflow";

// Properties for EditAgent component
type EditAgentProps = {
    api: API;
}

/**
 * Component for rendering a screen for creating new agents or editting existing agents
 * @param props 
 * @returns 
 */
const EditAgent = (props: EditAgentProps) => {
    const { agents, setAgents, models, skills } = useBuildStore(({ agents, setAgents, models, skills}) => ({
        agents,
        setAgents,
        models,
        skills
    }))
    const { api } = props;
    const [ libraryItems, setLibraryItems ] = useState<LibraryGroup[]>([]);
    const [ localAgent, setLocalAgent ] = useState<IAgent>();
    const [selectedNode, setSelectedNode] = useState<null | Object>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const user = api.user?.name || "Unknown";
    const [bounding, setBounding] = useState(null);

    // Gets a new node id based on existing nodes
    const getNodeId = (n: Array<Node & IAgentNode | undefined> | null): number => {
        n = n || nodes;
        if (!n || n.length === 0) {
        return 1;
        }
        const max: number = Math.max(...n.map(node => parseInt(node.id || "0")));
        return max + 1;
    }
  
  // method used to add new nodes and track node Id's
  const addNode = (
    agentId: number,
    position: NodePosition,
    onNodeAdded?: (nodes: Node & IAgentNode[]) => void,
    curr_nodes = nodes
  ) => {
    curr_nodes = curr_nodes || [];
    const agentData: IAgent | undefined = agents.find((agent:IAgent) => agent.id === agentId);
    const isInitiator: Boolean = curr_nodes?.length === 0;
    if (agentData) {
      api.getAgentModels(agentId, (models: IModelConfig[]) => {
        api.getAgentSkills(agentId, (skills: ISkill[]) => {
          const node_id: number = getNodeId(curr_nodes);
          const nodeData: Node & IAgentNode = {
            data: {...agentData,
              config: {...agentData.config},
              node_id,
              isInitiator,
              models: models,
              skills: skills,
              api,
              hideConnector: true
            },
            position,
            dragHandle: '.drag-handle',
            id: node_id.toString(),
            type: agentData.type || "assistant",
          };
          const newNodes: Array<Node & IAgent> = curr_nodes.concat([nodeData]);
          setNodes(newNodes);
          if (onNodeAdded) {
            onNodeAdded(newNodes);
          }
        });
      });
    }
  }

    useEffect(() => {
        const agentGroup: LibraryGroup = {
            label: "Agents",
            items: agents
        }
        const modelGroup: LibraryGroup = {
            label: "Models",
            items: models
        };
        const skillGroup: LibraryGroup = {
            label: "Skills",
            items: skills
        }
        setLibraryItems([ agentGroup, modelGroup, skillGroup]);
    }, [ agents, models, skills ]);

    const handleSelection = (nodes: Node[]) => {
        if (nodes.length > 0 && nodes[0] && nodes[0].data) {
          setSelectedNode(nodes[0].data);
        }
        else {
          setSelectedNode(null);
        }
      }

    const handleDrop = (e: MouseEvent & {
        dataTransfer: {
            getData: (type: string) => string
        }
    }) => {
        let data: string | { [key: string]: string | number} = e.dataTransfer.getData('text/plain');
        data = JSON.parse(data) as { [key: string]: string | number};
        const getTargetId = (type: string) => {
            let target = e.target as HTMLElement;
            while(target && target.parentNode && !target.classList.contains(`drop-${type}s`)) {
                target = target.parentNode;
            }

            // Gets the ID of the drop target or returns -1 if invalid drop
            const targetId: number = target.getAttribute && target.classList && target.classList.contains(`drop-${type}s`) ? 
                parseInt(target.getAttribute("data-id")) : -1;

            return targetId;
        }
        const { group } = data;
    
        switch (group) {
            case "agent":
                const agentTarget = getTargetId("agent");
                if (agentTarget > 0) {
                    console.log({agentTarget, data, agents});
                    api.linkAgent(agentTarget, data.id, updateNodes);
                }
                else {
                    const position = {
                        x: e.clientX + data.offsetX - bounding.left,
                        y: e.clientY + data.offsetY - bounding.top,
                      };
                    addNode(data.id, position, () => console.log({agents, nodes}));
                }

                break;
            case "agent-property":
                const targetId = getTargetId(data.type);

                if (targetId !== data.parent) {
                    if (data.type === "model") {
                        api.unLinkAgentModel(data.parent, data.id, updateNodes);
                        if (targetId >= 0) {
                            api.linkAgentModel(targetId, data.id, updateNodes);
                        }
                    }
                    else if (data.type === "skill") {
                        api.unLinkAgentSkill(data.parent, data.id, updateNodes);
                        if (targetId >= 0) {
                            api.linkAgentSkill(targetId, data.id, updateNodes);
                        }
                    }
                }
                break;
            case "skill":
                const skillTarget = getTargetId("skill");
                if(skillTarget >= 0) {
                    api.linkAgentSkill(skillTarget, data.id, updateNodes);
                }
                break;
            case "model":
                const modelTarget = getTargetId("model");
                if (modelTarget >= 0) {
                    api.linkAgentModel(modelTarget, data.id, updateNodes);
                }
                break;
            case "group-agent":
                const groupTarget = getTargetId("agent");

                if (groupTarget !== data.parent) {
                    api.unlinkAgent(data.parent, data.id, updateNodes);
                }

                break;
        }
    }

    // suppresses event bubbling for drag events
    const handleDrag = (e: MouseEvent) => {
        e.preventDefault();
    };

  // Refreshes agents from the database and 
  const updateNodes = () => {
    api.getAgents((agentsFromDB) => {
      setAgents(agentsFromDB);
      const updatedNodes = nodes.map(node => {
        const nodeCopy = JSON.parse(JSON.stringify(node));
        const updatedAgent = agentsFromDB.find((agent) => agent.id === node.data.id);
        const newNode = {
          ...nodeCopy,
          data: {
            ...nodeCopy.data,
            ...updatedAgent
          }
        }

        return newNode;
      });
      setNodes(updatedNodes);
    }, true);
  }

    return (
        <BuildLayout
            menu={<Library libraryItems={[{ label: "Agents", items: agents}, { label: "Models", items: models}, { label: "Skills", items: skills}]} addNode={addNode} />}>
            <BuildNavigation className="nav-over-canvas"  category="agent" handleEdit={() => {}} />
            <AgentCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onDrop={handleDrop}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                setBounding={setBounding}
                setEdges={setEdges}
                setNodes={setNodes}
                setSelection={handleSelection}
            />
            
        </BuildLayout>
    )
}

export default EditAgent;
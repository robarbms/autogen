import React, { MouseEvent, MouseEventHandler, useEffect, useState } from "react";
import BuildLayout from "../layout/BuildLayout";
import Library, { LibraryGroup } from "../layout/library/Library";
import AgentCanvas from "../canvas/AgentCanvas";
import { Node, useNodesState, ReactFlowProvider } from "reactflow";
import { useBuildStore } from "../../../../hooks/buildStore";
import { API } from "../utilities/API";
import { AgentProperty, getDropHandler, IAgentNode, NodeSelection, nodeUpdater } from "../canvas/Canvas";
import NodeProperties from "../layout/NodeProperties";
import { IAgent, IModelConfig, ISkill } from "../../../types";

// Properties for EditAgent component
type EditAgentProps = {
    agentId: number;
}

/**
 * Component for rendering a screen for creating new agents or editting existing agents
 * @param props 
 * @returns 
 */
const EditAgent = (props: EditAgentProps) => {
  const { agentId } = props;
    const { api, agents, setAgents, models, skills, setModels, setSkills } = useBuildStore(({ api, agents, setAgents, models, skills, setModels, setSkills}) => ({
      api,
      agents,
      setAgents,
      models,
      skills,
      setModels,
      setSkills
    }));
    const [selectedNode, setSelectedNode] = useState<Node & IAgentNode | AgentProperty | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Array<Node & IAgentNode>>([]);
    const [bounding, setBounding] = useState<DOMRect>();
    const [ showMenu, setShowMenu ] = useState(true);
    const [ initialized, setInitialized ] = useState<boolean>(false);

    // On clicking of a node sets it as selected
    const handleSelection = (selected: NodeSelection) => {
        if (selected) {
          if (Array.isArray(selected)) {
            setSelectedNode(selected.length > 0 ? selected[0].data : null);
          }
          else if ("parent" in selected) {
            const selectedData: AgentProperty = {
              id: selected.id || 0,
              parent: selected.parent,
              type: "model" in selected ? "model" : "skill"
            }
            setSelectedNode(selectedData);
          }
        }
        else {
          setSelectedNode(null);
        }
      }
    
    // suppresses event bubbling for drag events
    const handleDrag: MouseEventHandler = (event: MouseEvent) => {
        event.preventDefault();
    };

  const agentSetNodes = (nodes: Array<Node & IAgentNode> | undefined) => {
    if (nodes) {
      const noConnectorNodes = nodes.map(node => {
        node.data.hideConnector = true;
        return node;
      });
      setNodes(noConnectorNodes);
    }
  }

  // Drag and drop handler for items dragged onto the canvas or agents
  const handleDrop = getDropHandler(bounding, api, setNodes, nodes as Array<Node & IAgentNode>, [], () => {}, agents, setAgents, setModels, setSkills, handleSelection, true) as any;

  // Load a new node to the canvas if there is an agentId
  useEffect(() => {
    if (initialized === false && agentId !== undefined) {
      const agentNode = agents.find((agent: IAgent) => agent.id === agentId);
      if (agentNode) {
        const newAgent = {
          id: '1',
          position: {
            x: 100,
            y: 100
          },
          data: {
            ...agentNode,
            api,
            hideConnector: true,
          },
          selected: true,
          type: agentNode.type,
          setSelection: handleSelection
        } as Node & IAgentNode;
        console.log({agentId, agentNode, newAgent});
        setNodes([newAgent]);
        setInitialized(true);
      }
    }
  }, [])

  // Update selected agent properties when selectedNode changes
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const updatedNodes = JSON.parse(JSON.stringify(nodes)).map((node: Node & IAgentNode) => {
        node.data.selectedProp = selectedNode && "parent" in selectedNode && selectedNode.parent === node.id ? selectedNode : null;
        return node;
      });
      setNodes(updatedNodes);
    }
  }, [selectedNode]);

  // Updates nodes on the canvas when there are changes made
  const updateNodes = nodeUpdater.bind(this, api, setAgents, setNodes, nodes as Array<Node & IAgentNode>);

  // Handles on click for library item
  // TO DO: This should be similar to workflow.tsx.
  const addLibraryItem = (data: any) => {
    console.log(data);
  }
  
  // Items to show in the library
  const libraryItems: Array<LibraryGroup> = [
    { label: "Agents", items: [{
      id: 0,
      config: {
        name: "New Agent"
      }
    }, ...agents]} as LibraryGroup,
    { label: "Models", items: [{
      id: 0,
      model: "New Model"
    }, ...models]},
    { label: "Skills", items: [{
      id: 0,
      name: "New Skill",
      content: " ",
    }, ...skills]}
  ];

    return (
        <ReactFlowProvider>
            <BuildLayout
                menu={<Library setShowMenu={setShowMenu} libraryItems={libraryItems} addLibraryItem={addLibraryItem} />}
                properties={selectedNode !== null ? <NodeProperties handleInteract={updateNodes} setSelectedNode={setSelectedNode as any} setNodes={agentSetNodes} /> : null}
            >
                <AgentCanvas
                    nodes={nodes}
                    onNodesChange={onNodesChange}
                    onDrop={handleDrop}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    setBounding={setBounding}
                    setNodes={setNodes}
                    setSelection={handleSelection}
                />
            </BuildLayout>
        </ReactFlowProvider>
    )
}

export default EditAgent;
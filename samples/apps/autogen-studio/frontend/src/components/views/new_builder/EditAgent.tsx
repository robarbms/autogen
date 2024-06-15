import React, { MouseEvent, MouseEventHandler, useEffect, useState } from "react";
import BuildLayout from "./canvas/BuildLayout";
import Library, { LibraryGroup } from "./library/Library";
import AgentCanvas from "./AgentCanvas";
import { Node, useNodesState, ReactFlowProvider } from "reactflow";
import { useBuildStore } from "../../../hooks/buildStore";
import { API } from "./API";
import { AgentProperty, getDropHandler, IAgentNode, nodeUpdater } from "./canvas/Canvas";
import NodeProperties from "./canvas/NodeProperties";
import { IAgent, IModelConfig, ISkill } from "../../types";

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
    const { agents, setAgents, models, skills, setModels, setSkills } = useBuildStore(({ agents, setAgents, models, skills, setModels, setSkills}) => ({
        agents,
        setAgents,
        models,
        skills,
        setModels,
        setSkills
    }))
    const { api } = props;
    const [selectedNode, setSelectedNode] = useState<Node & IAgentNode | AgentProperty | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Array<Node & IAgentNode>>([]);
    const [bounding, setBounding] = useState<DOMRect>();
    const [ showMenu, setShowMenu ] = useState(true);

    // On clicking of a node sets it as selected
    const handleSelection = (selected: Array<Node & IAgentNode> | IModelConfig & { parent: string } | ISkill & { parent: string }) => {
        if (selected) {
          if (Array.isArray(selected)) {
            setSelectedNode(selected.length > 0 ? selected[0].data : null);
          }
          else {
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
  const updateNodes = nodeUpdater.bind(this, api, setAgents, setNodes, nodes as Array<Node & IAgentNode>)

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
                menu={<Library user={api.user?.email || ""} setShowMenu={setShowMenu} libraryItems={libraryItems} addLibraryItem={addLibraryItem} />}
                properties={selectedNode !== null ? <NodeProperties api={api} selected={selectedNode} handleInteract={updateNodes} setSelectedNode={setSelectedNode} setNodes={agentSetNodes} nodes={nodes as Array<Node & IAgentNode>} /> : null}
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
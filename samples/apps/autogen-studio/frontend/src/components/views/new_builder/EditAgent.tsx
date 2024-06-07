import React, { MouseEvent, MouseEventHandler, useEffect, useState } from "react";
import BuildLayout from "./canvas/BuildLayout";
import Library from "./library/Library";
import AgentCanvas from "./AgentCanvas";
import {  Node, useNodesState, ReactFlowProvider } from "reactflow";
import { useBuildStore } from "../../../hooks/buildStore";
import { API } from "./API";
import BuildNavigation from "./BuildNavigation";
import { addNode, AgentProperty, getDropHandler, IAgentNode, nodeUpdater } from "./canvas/Canvas";
import NodeProperties from "./canvas/NodeProperties";
import { IModelConfig, ISkill } from "../../types";

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
    const [selectedNode, setSelectedNode] = useState<Node & IAgentNode | AgentProperty | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<(Node & IAgentNode)[]>([]);
    const [bounding, setBounding] = useState<DOMRect>();

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

    // Refreshes agents from the database and 
    const handleDrop = getDropHandler(bounding, api, setNodes, nodes as Array<Node & IAgentNode>, agents, setAgents, true);

    const updateNodes = nodeUpdater.bind(this, api, setAgents, setNodes, nodes)

    useEffect(() => {
        console.log({selectedNode});
    }, [ selectedNode ]);

    return (
        <ReactFlowProvider>
            <BuildLayout
                menu={<Library libraryItems={[{ label: "Agents", items: agents}, { label: "Models", items: models}, { label: "Skills", items: skills}]} addNode={addNode} />}
                properties={selectedNode !== null ? <NodeProperties api={api} selected={selectedNode} handleInteract={updateNodes} setSelectedNode={setSelectedNode} /> : null}
            >
                <BuildNavigation className="nav-over-canvas"  category="agent" handleEdit={() => {}} />
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
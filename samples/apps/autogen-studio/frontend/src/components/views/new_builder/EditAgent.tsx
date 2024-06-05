import React, { MouseEvent, MouseEventHandler, useEffect, useState } from "react";
import BuildLayout from "./canvas/BuildLayout";
import Library from "./library/Library";
import AgentCanvas from "./AgentCanvas";
import {  Node, useNodesState, ReactFlowProvider } from "reactflow";
import { useBuildStore } from "../../../hooks/buildStore";
import { API } from "./API";
import BuildNavigation from "./BuildNavigation";
import { IAgentNode, NodePosition } from "./canvas/Workflow";
import { addNode, getDropHandler, nodeUpdater } from "./canvas/Canvas";
import NodeProperties from "./canvas/NodeProperties";

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
    const [selectedNode, setSelectedNode] = useState<null | Object>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<(Node & IAgentNode)[]>([]);
    const [bounding, setBounding] = useState<DOMRect>();

    // On clicking of a node sets it as selected
    const handleSelection = (nodes: Array<Node & IAgentNode>) => setSelectedNode(nodes && nodes.length > 0 ? nodes[0].data : null);

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
                properties={selectedNode !== null ? <NodeProperties agent={selectedNode} handleInteract={updateNodes} /> : null}
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
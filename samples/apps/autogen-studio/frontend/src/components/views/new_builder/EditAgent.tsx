import React, { useEffect, useState } from "react";
import BuildLayout from "./canvas/BuildLayout";
import Library from "./library/Library";
import { IAgent, IModelConfig, ISkill } from "../../types";
import { LibraryGroup } from "./library/Library";
import AgentCanvas from "./AgentCanvas";
import { Edge, Node, ReactFlowProvider, useNodesState, useEdgesState } from "reactflow";
import { useBuildStore } from "../../../hooks/buildStore";
import { API } from "./API";

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
    const { agents, models, skills } = useBuildStore(({ agents, models, skills}) => ({
        agents,
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
  
    const addNode = (data: any) => {

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

    const handleDrop = (e: MouseEvent) => {
        console.log(e);
    }

    // suppresses event bubbling for drag events
    const handleDrag = (e: MouseEvent) => {
        e.preventDefault();
    };

    return (
        <BuildLayout
            menu={<Library libraryItems={libraryItems} user={user} addNode={addNode} />}>
            <AgentCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onDrop={handleDrop}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                setBounding={() => {}}
                setEdges={setEdges}
                setNodes={setNodes}
                setSelection={handleSelection}
            />
            
        </BuildLayout>
    )
}

export default EditAgent;
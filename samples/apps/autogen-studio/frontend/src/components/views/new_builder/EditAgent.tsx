import React, { useEffect, useState } from "react";
import BuildLayout from "./canvas/BuildLayout";
import Library from "./library/Library";
import { IAgent, IModelConfig, ISkill } from "../../types";
import { LibraryGroup } from "./library/Library";
import BuildNavigation from "./BuildNavigation";
import AgentCanvas from "./AgentCanvas";
import { Edge, Node, ReactFlowProvider, useNodesState, useEdgesState } from "reactflow";

// Properties for EditAgent component
type EditAgentProps = {
    handleEdit: Function;
    agents: IAgent[];
    models: IModelConfig[];
    skills: ISkill[];
    user: string;
}

/**
 * Component for rendering a screen for creating new agents or editting existing agents
 * @param props 
 * @returns 
 */
const EditAgent = (props: EditAgentProps) => {
    const { agents, handleEdit, models, skills, user } = props;
    const [ libraryItems, setLibraryItems ] = useState<LibraryGroup[]>([]);
    const [ localAgent, setLocalAgent ] = useState<IAgent>();
    const [selectedNode, setSelectedNode] = useState<null | Object>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
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
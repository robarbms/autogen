import React, { createRef, MouseEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    Node,
    OnNodesChange,
    useKeyPress,
    useOnSelectionChange,
} from "reactflow";
import { IAgentNode, NodeTypes } from "./canvas/Canvas";
import { TypesWithProps } from "./canvas/Canvas";

// Properties used for the AgentCanvas component
type AgentCanvasProps = {
    nodes: Node[];
    onDragEnter: MouseEventHandler;
    onDragOver: MouseEventHandler;
    onDrop: MouseEventHandler;
    onNodesChange: OnNodesChange;
    setBounding: Function;
    setNodes: (nodes: Node[]) => void;
    setSelection: (node: Array<Node & IAgentNode>) => void;
}

/**
 * Renders a canvas for dragging nodes to and connecting with edges
 * @param props 
 * @returns 
 */
const AgentCanvas = (props: AgentCanvasProps) => {
    const {
        nodes,
        onDragEnter,
        onDragOver,
        onDrop,
        onNodesChange,
        setBounding,
        setNodes,
        setSelection
    } = props;
    const canvasWrap = createRef<HTMLDivElement>();

    // Callback for letting the wrapper know the canvas size
    useEffect(() => {
        setBounding(canvasWrap.current?.getBoundingClientRect());
    }, []);

    // Handles deleteing nodes and edges
    const deletePressed = useKeyPress('Delete');
    useEffect(() => {
      const removeNodes = nodes
        .filter((node) => 'selected' in node && node.selected === true)
        .map((node) => node.id);
      const updatedNodes = nodes.filter(({ id }) => !removeNodes.includes(id));
      setNodes(updatedNodes);
    }, [deletePressed]);

    
    // Adds node highlighting when selected
    useOnSelectionChange({
        onChange: ({nodes} : {nodes: Node[]}): void => {
            setSelection(nodes);
        }
    });

    
    // Inject node types with setSelection handler
    const nodeTypes = useMemo<typeof NodeTypes & { setSelection: (node: Node & IAgentNode | AgentProperty) => void}[]>(
        () => TypesWithProps({setSelection}),
        []
    )



    return (
        <ReactFlow
            ref={canvasWrap}
            className="workflow-canvas drop-agents"
            nodes={nodes}
            attributionPosition="bottom-right"
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
            elementsSelectable={true}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
        >
              <Controls />
            <Background />
        </ReactFlow>
    );
}

export default AgentCanvas;
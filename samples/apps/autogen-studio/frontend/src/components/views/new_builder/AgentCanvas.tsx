import React, { createRef, MouseEventHandler, useCallback, useEffect, useState } from "react";
import ReactFlow, {
    addEdge,
    Background,
    Connection,
    Controls,
    Edge,
    Node,
    OnEdgesChange,
    OnNodesChange,
    updateEdge,
    useKeyPress,
    useOnSelectionChange
} from "reactflow";
import { NodeTypes } from "./canvas/WorkflowCanvas";

// Properties used for the AgentCanvas component
type AgentCanvasProps = {
    edges: Edge[];
    nodes: Node[];
    onDragEnter: MouseEventHandler;
    onDragOver: MouseEventHandler;
    onDrop: MouseEventHandler;
    onEdgesChange: OnEdgesChange;
    onNodesChange: OnNodesChange;
    setBounding: Function;
    setEdges: (edges: Edge[]) => void;
    setNodes: (nodes: Node[]) => void;
    setSelection: (node: Node[]) => void;
}

/**
 * Renders a canvas for dragging nodes to and connecting with edges
 * @param props 
 * @returns 
 */
const AgentCanvas = (props: AgentCanvasProps) => {
    const {
        edges,
        nodes,
        onDragEnter,
        onDragOver,
        onDrop,
        onEdgesChange,
        onNodesChange,
        setBounding,
        setEdges,
        setNodes,
    } = props;
    const canvasWrap = createRef<HTMLDivElement>();

    // Call back for when edges have been changed
    const onEdgeUpdate = useCallback(
        (oldEdge: Edge, newConnection: Connection) => {
            setEdges((els: Edge[]) => updateEdge(oldEdge, newConnection, els))
        },
        []
    );
    
    // Callback when nodes are connected
    const onConnect = useCallback(
        (params) => setEdges((els) => addEdge(params, els)),
        []
    );

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


    return (
        <ReactFlow
            ref={canvasWrap}
            className="workflow-canvas drop-agents"
            nodes={nodes}
            edges={edges}
            attributionPosition="bottom-right"
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeUpdate={onEdgeUpdate}
            onConnect={onConnect}
            nodeTypes={NodeTypes}
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
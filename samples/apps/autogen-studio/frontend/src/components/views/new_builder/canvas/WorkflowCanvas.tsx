import React, { createRef, RefObject, useCallback, useEffect, useState, MouseEventHandler } from 'react';
import "../../../../styles/canvas.css";
import UserProxyNode from "../nodes/UserProxyNode";
import AssistantNode from "../nodes/AssistantNode";
import GroupChatNode from "../nodes/GroupChatNode";
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
import "reactflow/dist/style.css";

/**
 * Nodes used by the canvas
 */
const NodeTypes = {
    userproxy: UserProxyNode,
    assistant: AssistantNode,
    groupchat: GroupChatNode,
}

/**
 * WorkflowCanvas component properties
 */
type WorfkflowCanvasProps = {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onDrop: MouseEventHandler;
    onDragEnter: MouseEventHandler;
    onDragOver: MouseEventHandler;
    setBounding: Function;
    setEdges: (edges: Edge[]) => void;
    setNodes: (nodes: Node[]) => void;
    setSelection: (node: Node[]) => void;
}

/**
 * Component for displaying the flow diagram
 * @param props 
 * @returns 
 */
const WorkflowCanvas = (props: WorfkflowCanvasProps) => {
    const { 
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onDrop,
        onDragEnter,
        onDragOver,
        setBounding,
        setEdges,
        setNodes,
        setSelection,
    } = props;
    const canvasWrap: RefObject<HTMLDivElement> = createRef();

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
      const updatedEdges = edges.filter(
        ({ source, target, selected }) =>
          !selected &&
          !removeNodes.includes(source) &&
          !removeNodes.includes(target)
      );
      setNodes(updatedNodes);
      setEdges(updatedEdges);
    }, [deletePressed]);

    // Adds node highlighting when selected
    useOnSelectionChange({
        onChange: ({nodes, edges} : {nodes: Node[], edges: Edge[]}): void => {
            setSelection(nodes);
        }
    });

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
    )
};

  export default WorkflowCanvas
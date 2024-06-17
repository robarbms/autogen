import React, { createElement, createRef, RefObject, useCallback, useEffect, useMemo, useState, MouseEventHandler } from 'react';
import "../../../../styles/canvas.css";
import ReactFlow, {
    addEdge,
    Background,
    Connection,
    Controls,
    Edge,
    MarkerType,
    Node,
    OnEdgesChange,
    OnNodesChange,
    updateEdge,
    useKeyPress,
    useOnSelectionChange
} from "reactflow";
import "reactflow/dist/style.css";
import { IAgentNode, TypesWithProps, AgentProperty, NodeTypes, NodeSelection } from './Canvas';

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
    setEdges: (edges: Edge[] | ((els: Edge[]) => Edge[])) => void;
    setNodes: (nodes: Node[]) => void;
    setSelection: (node: NodeSelection) => void;
    selectedNode?: Array<Node & IAgentNode> | AgentProperty | null
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
        (params: Edge | Connection) => setEdges((els: Edge[]) => {
            return addEdge({
                ...params,
                markerStart: {
                    type: MarkerType.ArrowClosed,
                    color: "var(--agent-color)"
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: "var(--agent-color)"
                }
            }, els);
        }),
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
            setSelection(nodes as NodeSelection);
        }
    });

    // Inject node types with setSelection handler
    const nodeTypes = useMemo<typeof NodeTypes & { setSelection: (node: NodeSelection) => void}[]>(
        () => TypesWithProps({setSelection}) as any,
        []
    )

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
            nodeTypes={nodeTypes}
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
import React, { createElement, createRef, RefObject, useCallback, useEffect, useMemo, useRef, useState, MouseEventHandler } from 'react';
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
    useOnSelectionChange,
    useEdges,
    useNodes
} from "reactflow";
import "reactflow/dist/style.css";
import { IAgentNode, TypesWithProps, AgentProperty, NodeTypes, NodeSelection } from '../canvas/Canvas';
import { API } from '../utilities/API';
import { IAgent, IWorkflow } from '../../../types';
import { useBuildStore } from '../../../../hooks/buildStore';

/**
 * WorkflowCanvas component properties
 */
type WorfkflowCanvasProps = {
    nodes: Array<Node & IAgentNode>;
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onDrop: MouseEventHandler;
    onDragEnter: MouseEventHandler;
    onDragOver: MouseEventHandler;
    setBounding: Function;
    setEdges: (edges: Edge[] | ((els: Edge[]) => Edge[])) => void;
    setNodes: (nodes: Array<Node & IAgentNode>) => void;
    setSelection: (node: NodeSelection) => void;
    selectedNode?: Array<Node & IAgentNode> | AgentProperty | null;
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
    const { api, setAgents, workflowId, workflows, setWorkflows } = useBuildStore(({ api, setAgents, workflowId, workflows, setWorkflows }) => ({ api, setAgents, workflowId, workflows, setWorkflows }));
    const canvasWrap: RefObject<HTMLDivElement> = createRef();
    const nodeState = useRef<Array<Node & IAgentNode>>(nodes);
    const edgeState = useRef<Array<Edge>>(edges);

    const copy = (node: any) => JSON.parse(JSON.stringify(node));

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
            setSelection(nodes[nodes.length - 1] as NodeSelection);
        }
    });

    // method for removing a node from the canvas or from another agent
    const removeNode = (id: number | string, parent?: string) => {
        // if this is an agent linked to a group agent, unlink it
        if (api && parent !== undefined) {
            const parentNode = nodeState.current.find((node: Node & IAgentNode) => node.id === parent);
            const updatedNodes = copy(nodeState.current).map((node: Node & IAgentNode) => {
                if (node.data.id === parentNode?.data.id) {
                    // unlink agent
                    api.unlinkAgent(node.data.id, id as number, () => {});
                    node.data.linkedAgents = node.data.linkedAgents.filter((agent: IAgent) => agent.id !== id);
                }
                return node;
            });
            const updatedAgents = updatedNodes.map((node: Node & IAgentNode) => node.data);
            setNodes(updatedNodes);
            setAgents(updatedAgents);
        }
        // remove node from the canvas
        else {
            const updatedNodes = nodeState.current.filter((node) => node.id !== id);
            setNodes(updatedNodes);
        }
    }

    // method to set the workflows initiator to another node
    const setInitiator = (id: string) => {
        // find the details of the new initiator
        const currentInitiator = nodeState.current.find((node: Node & IAgentNode) => node.data.isInitiator);
        const newInitiator = nodeState.current.find((node: Node & IAgentNode) => node.id === id);
        // Update the nodes to the current node
        const updatedNodes = copy(nodeState.current).map((node: Node & IAgentNode) => {
            node.data.isInitiator = node.id === id;
            return node;
        });
        setNodes(updatedNodes);
        if (newInitiator && currentInitiator && edgeState.current[0].source === currentInitiator.id) {
            setEdges([{
                ...edgeState.current[0],
                source: newInitiator.id
            }]);
        }
        // If they are not the same base node, change the workflow sender
        if (api && currentInitiator?.data.id !== newInitiator?.data.id && workflowId) {
            // unlink the old sender
            api.unlinkWorkflow(workflowId, "sender", currentInitiator?.data.id);

            // Link the new sender
            api.linkWorkflow(workflowId, "sender", newInitiator?.data.id);
            // Update workflows to reflect this
            const updatedWorkflows = copy(workflows).map((workflow: IWorkflow) => {
                if (workflow.id === workflowId) {
                    workflow.sender = newInitiator?.data;
                }
                return workflow;
            });
            setWorkflows(updatedWorkflows);
        }
    }

    // Keeps nodeState ref in sync. Used by handlers
    useEffect(() => {
        nodeState.current = nodes;
    }, [nodes]);

    // Keeps edgeState ref in sync. Used by handlers
    useEffect(() => {
        edgeState.current = edges;
    }, [edges]);


    // Inject node types with setSelection handler
    const nodeTypes = useMemo<typeof NodeTypes & { setSelection: (node: NodeSelection) => void, removeNode: (id: number | string, parent?: string) => void, setInitiator: (id: string) => void}[]>(
        () => TypesWithProps({setSelection, removeNode, setInitiator}) as any,
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
import React, { createRef, useContext, useEffect, useState, MouseEvent } from "react";
import Library from "../library/Library";
import BuildLayout from "./BuildLayout";
import WorkflowCanvas from "./WorkflowCanvas";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../../types";
import ReactFlow, { Edge, Node, NodeChange, ReactFlowProvider, useNodesState, useEdgesState } from "reactflow";
import NodeProperties from "./NodeProperties";
import TestWorkflow from "./TestWorkflow";
import Chat from "./Chat";
import BuildNavigation from "../BuildNavigation";
import { IWorkItem, dataToWorkItem } from "../utils";
import { useBuildStore } from "../../../../hooks/buildStore";
import { useNavigationStore } from "../../../../hooks/navigationStore";
import { API } from "../API";
import { addNode, getDropHandler, nodeUpdater } from "./Canvas";

// Type for positioning of a node
export type NodePosition = {
  x: number;
  y: number;
}

/**
 * Encapsulating IAgent config and node information
 */
export interface IAgentNode {
  position: NodePosition;
  id: string;
  type: "userproxy" | "assistant" | "groupchat";
  isConnectable?: Boolean;
  data: IAgent & {
    isInitiator?: Boolean;
    node_id: number;
    models?: IModelConfig[];
    skills?: ISkill[];
    api: API,
  },
}

/**
 * Properties for the Workflow component
 */
type WorkflowProps = {
  api: API;
}

/**
 * The Workflow build page
 * @param props 
 * @returns 
 */
const Workflow = (props: WorkflowProps) => {
  const { api } = props;
  const { agents, setAgents, models, skills, workflowId, workflows } = useBuildStore(({ agents, setAgents, models, skills, workflowId, workflows}) => ({
    agents,
    setAgents,
    models,
    skills,
    workflowId,
    workflows
  }));
  const { setNavigationExpand } = useNavigationStore(({setNavigationExpand}) => ({
    setNavigationExpand
  }));
  const [bounding, setBounding] = useState<DOMRect>();
  const [nodes, setNodes, onNodesChange] = useNodesState<Array<Node & IAgentNode | IAgent>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showChat, setShowChat] = useState<Boolean>(false);
  const [selectedNode, setSelectedNode] = useState<null | Object>(null);
  const [ isValidWorkflow, setIsValidWorkflow ] = useState<Boolean>(false);
  const [ workflowLoaded, setWorkflowLoaded ] = useState<Boolean>(false);
  const [ editting, setEditting ] = useState<IWorkItem>();
  const [ initialized, setInitialized ] = useState<boolean>(false);

  // Load and set Agents and workflows
  // TODO: Load all first, then set all in a single object so there are fewer rerenders.
  useEffect(() => {
    // Collapse page left navigation
    setNavigationExpand(false);
      
    if (!initialized) {
      const curr_work = workflows.find(work => work.id == workflowId)
      if (curr_work) {
        const { sender, receiver } = curr_work;
        const workflowNodes: Array<Node & {data: IWorkflow} & {data: {sender: IAgent, receiver: IAgent}}> = [];
        const nodeToWorkflow = (node) => {
          const data = node[0];
          data.id = `${workflowNodes.length + 1}`
          workflowNodes.push(node[0]);
          if (!sender || !receiver || workflowNodes.length === 2) {
            setNodes(workflowNodes);
          }
        }
        // Add nodes for an existing workflow
        if (sender) {
          const sender_pos: NodePosition = { x: 100, y: 100};
          addNode(nodes, api, agents, nodeToWorkflow, sender.id, sender_pos);
        }
        if (receiver) {
          const receiver_pos: NodePosition = {x: 500, y: 100};
          addNode(nodes, api, agents, nodeToWorkflow, receiver.id, receiver_pos);
        }
        if (!sender || !receiver) {
          setInitialized(true);
        }

        const ed_work = dataToWorkItem(api.user?.email, curr_work);
        setEditting(ed_work);
      }
    }
  }, []);

  const getInitiator = (): Node & IAgentNode | undefined => (nodes as Array<Node & IAgentNode>).find((node) => node.data.isInitiator)

  useEffect(() => {
    // Should have an initiator
    const initiator: Node & IAgentNode | undefined = getInitiator();

    // Check if initialized and nodes loaded
    if (!initialized && initiator && nodes.length > 1) {
      // Add edges to sender and receiver once nodes have loaded
      const target = (nodes as Array<Node & IAgentNode>).find(node => node !== initiator);
      if (target) {
        setEdges([{
          source: initiator.id,
          id: "1",
          selected: false,
          target: target.id
        }]);
      }

      setInitialized(true);
    }

  }, [nodes]);

  useEffect(() => {
    // Make sure the work flow is valid.
    let isValid = false;

    // Should have an initiator
    const initiator: Node & IAgentNode | undefined = getInitiator();

    if (initiator) {
      // should be connected to an agent
      const edge: Edge | undefined = edges.find(edge => edge.source === initiator.id);
      if (edge) {
          const target: Node | undefined = nodes.find(node => node.id === edge.target);
          if (target) {
            isValid = true;
          }
      }
    }

    setIsValidWorkflow(isValid);

    // update the workflows sender and receiver
    api.getWorkflowLinks(workflowId, updateWorkflow, true);

    // Should only ever have 1 edge
    if (edges.length > 1) {
      // Use only the last added edge
      setEdges([edges[edges.length -1]]);
    }
  }, [nodes, edges]);


  // Updates workflow agents sender and receiver based on canvas nodes and edges
  const updateWorkflow = (sender: IAgent, receiver: IAgent) => {
    if (!workflowLoaded) return;
    // make sure the sender is correctly set or update it
    const initiator = nodes.find((node) => node.data.isInitiator);

    if (!initiator && sender) {
      // delete the existing sender
    }
    else if (!sender && initiator || (sender && initiator && initiator?.data.id !== sender.id)) {
      // update incorrect sender
      api.linkWorkflow(workflowId, "sender", initiator.data.id);
    }


    const edge: Edge | undefined = edges.find(edge => edge.source === initiator?.id);
    if (edge) {
      const target: Node | undefined = nodes.find(node => node.id === edge.target);
      if (target) {
        if (!receiver || receiver && target.data.id !== receiver.id) {
          if (receiver) {
            // delete previous receiver
            api.unlinkWorkflow(workflowId, "receiver", receiver.id);
          }
          // link the receiver
          api.linkWorkflow(workflowId, "receiver", target.data.id);
        }
      }
    }
    else if (receiver) {
      // delete receiver
      api.unlinkWorkflow(workflowId, "receiver", receiver.id);
    }
  }

    // suppresses event bubbling for drag events
    const handleDrag: MouseEventHandler = (event: MouseEvent) => {
      event.preventDefault();
  };

  const handleDragDrop = getDropHandler(bounding, api, setNodes, nodes, agents, setAgents);

  // Updates the selected node when it changes
  const handleSelection = (nodes: Array<Node & IAgent>) => setSelectedNode(nodes && nodes.length > 0 ? nodes[0].data : null);

  // Opens the chat pane to test the workflow if it is a valid workflow
  //  with a sender and receiver
  const testWorkflow = () => {
    setShowChat(true);
  }

  // Refreshes agents from the database and 
  const updateNodes = () => {
    api.getAgents((agentsFromDB) => {
      setAgents(agentsFromDB);
      const updatedNodes = nodes.map(node => {
        const nodeCopy = JSON.parse(JSON.stringify(node));
        const updatedAgent = agentsFromDB.find((agent) => agent.id === node.data.id);
        const newNode = {
          ...nodeCopy,
          data: {
            ...nodeCopy.data,
            ...updatedAgent
          }
        }

        return newNode;
      });
      setNodes(updatedNodes);
    }, true);
  }

  return (
    <ReactFlowProvider>
      <BuildLayout
        menu={<Library libraryItems={[{ label: "Agents", items: agents}, { label: "Models", items: models}, { label: "Skills", items: skills}]} addNode={addNode} user={api.user.email} />}
        properties={selectedNode !== null ? <NodeProperties agent={selectedNode} handleInteract={updateNodes} /> : null}
        chat={showChat && isValidWorkflow ? <Chat workflow_id={workflowId} close={() => setShowChat(false)} /> : null}
      >
        <BuildNavigation className="nav-over-canvas" id={workflowId} category="workflow" editting={editting} handleEdit={() => {}} />
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onDrop={handleDragDrop}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          setBounding={setBounding}
          setEdges={setEdges}
          setNodes={setNodes}
          setSelection={handleSelection}
        />
        {!showChat &&
          <TestWorkflow validWorkflow={isValidWorkflow} click={testWorkflow} />
        }
      </BuildLayout>
    </ReactFlowProvider>
  );
};

export default Workflow;

import React, { createRef, useContext, useEffect, useState } from "react";
import Library from "../library/Library";
import BuildLayout from "./BuildLayout";
import WorkflowCanvas from "./WorkflowCanvas";
import { IAgent, IChatSession, IStatus, IWorkflow, IModelConfig, ISkill } from "../../../types";
import { appContext } from "../../../../hooks/provider";
import { message } from "antd";
import { fetchJSON, getServerUrl } from "../../../utils";
import ReactFlow, { Edge, Node, ReactFlowProvider, useNodesState, useEdgesState } from "reactflow";
import { useConfigStore } from "../../../../hooks/store";
import NodeProperties from "./NodeProperties";
import TestWorkflow from "./TestWorkflow";
import Chat from "./Chat";
import BuildNavigation from "../BuildNavigation";
import { IWorkItem, dataToWorkItem } from "../utils";

// Type for positioning of a node
type NodePosition = {
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
  }
}

/**
 * Properties for the Workflow component
 */
type WorkflowProps = {
  // TODO: pass page config here
  workflow_id: number;
  workflows: IWorkflow[];
  agents: IAgent[];
  api: any;
  handleEdit: Function;
}

/**
 * The Workflow build page
 * @param props 
 * @returns 
 */
const Workflow = (props: WorkflowProps) => {
  const {workflows, agents, api, workflow_id, handleEdit } = props;
  const [bounding, setBounding] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Array<Node & IAgentNode | IAgent>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState<Boolean>(false);
  const [showChat, setShowChat] = useState<Boolean>(false);
  const [error, setError] = useState<IStatus | null>({
    status: true,
    message: "All good"
  });
  const { user } = api.user;
  const session: IChatSession | null = useConfigStore((state) => state.session);
  const [selectedNode, setSelectedNode] = useState<null | Object>(null);
  const [ isValidWorkflow, setIsValidWorkflow ] = useState<Boolean>(false);
  const [ workflowLoaded, setWorkflowLoaded ] = useState<Boolean>(false);
  const [ editting, setEditting ] = useState<IWorkItem>();
  const EDGE_ON_DROP = true;

  // Gets a new node id based on existing nodes
  const getNodeId = (n: Array<Node & IAgentNode> | undefined): number => {
    n = n || nodes;
    if (!n || n.length === 0) {
      return 1;
    }
    const max: number = Math.max(...n.map(node => parseInt(node.id || "0")));
    return max + 1;
  }

  // method used to add new nodes and track node Id's
  const addNode = (
    agentId: number,
    position: NodePosition,
    onNodeAdded?: (nodes: Node & IAgentNode[]) => void,
    curr_nodes = nodes
  ) => {
    curr_nodes = curr_nodes || [];
    const agentData: IAgent | undefined = agents.find((agent:IAgent) => agent.id === agentId);
    const isInitiator: Boolean = curr_nodes?.length === 0;
    if (agentData) {
      api.getAgentModels(agentId, (models: IModelConfig[]) => {
        api.getAgentSkills(agentId, (skills: ISkill[]) => {
          const node_id: number = getNodeId(curr_nodes);
          const nodeData: IAgentNode = {
            data: {...agentData,
              config: {...agentData.config},
              node_id,
              isInitiator,
              models: models,
              skills: skills
            },
            position,
            id: node_id.toString(),
            type: agentData.type || "assistant",
          };
          const newNodes: Array<Node & IAgent | IAgent> = curr_nodes.concat([nodeData]);
          setNodes(newNodes);
          if (EDGE_ON_DROP) {
            // Add an edge to the initiator
            if (!isInitiator && nodes.length > 1) {
              const initiator = nodes.find(node => node.data.isInitiator);
              if (initiator && initiator.data && initiator.data.id) {
                setTimeout(() => setEdges([{
                  target: node_id.toString(),
                  source: initiator.id,
                  selected: false,
                  id: initiator.id.toString(),
                }] as Edge[]), 100);
              }
            }
          }
          if (onNodeAdded) {
            onNodeAdded(newNodes);
          }
        });
      });
    }
  }

  // Load and set Agents and workflows
  // TODO: Load all first, then set all in a single object so there are fewer rerenders.
  useEffect(() => {
    // Load workflow
    api.getWorkflowLinks(workflow_id, (sender: IAgent, receiver: IAgent) => {
      const sender_pos: NodePosition = { x: 100, y: 100};
      const receiver_pos: NodePosition = {x: 500, y: 100};
      addNode(sender.id || 0, sender_pos, (ret_nodes: Array<Node & IAgentNode | IAgentNode>) => {
        if (receiver && receiver.id) {
          addNode(receiver.id, receiver_pos, (ret_nodes_2) => {
            const source: string = ret_nodes_2[0].id;
            const target: string = ret_nodes_2[1].id;
            setEdges([ { source, target, selected: false, id: source } ] as Edge[]);
            setWorkflowLoaded(true);
          }, ret_nodes);
        } else {
          setWorkflowLoaded(true);
        }
      });
    });
    const curr_work = workflows.find(work => work.id == workflow_id)
    if (curr_work) {
      const ed_work = dataToWorkItem(api.user?.email, curr_work);
      setEditting(ed_work);
    }
  }, []);

    useEffect(() => {
      // Make sure the work flow is valid.
      let isValid = false;

      // Should have an initiator
      const initiator: Node  | undefined = nodes.find(node => node.data.isInitiator);

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
      api.getWorkflowLinks(workflow_id, updateWorkflow, true);

      // Should only ever have 1 edge
      if (edges.length > 1) {
        // Use only the last added edge
        setEdges([edges[edges.length -1]]);
      }
    }, [agents, nodes, edges]);

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
      api.linkWorkflow(workflow_id, "sender", initiator.data.id);
    }


    const edge: Edge | undefined = edges.find(edge => edge.source === initiator?.id);
    if (edge) {
      const target: Node | undefined = nodes.find(node => node.id === edge.target);
      if (target) {
        if (!receiver || receiver && target.data.id !== receiver.id) {
          // link the receiver
          api.linkWorkflow(workflow_id, "receiver", target.data.id);
        }
      }
    }
    else {
      // delete receiver
      api.unlinkWorkflow(workflow_id, "receiver", receiver.id);
    }
  }

  // suppresses event bubbling for drag events
  const handleDrag = (e: MouseEvent) => {
    e.preventDefault();
  };

  // Gets data about the agent dropped on the canvas and adds a new node to the stack
  const handleDragDrop = (e: MouseEvent & {
    dataTransfer: {
      getData: (type: string) => string;
    }
  }) => {
    let data: string | { [key: string]: string | number} = e.dataTransfer.getData('text/plain');
    data = JSON.parse(data);
    const { id } = data;
    const position = {
      x: e.clientX + data.offsetX - bounding.left,
      y: e.clientY + data.offsetY - bounding.top,
    };
    let edge: Edge;
    // Get the initiator, check if it has an edge already
    const initiator = nodes.find(node => node.data.isInitiator);
    if (initiator) {
      if (edges.length === 0) {
        edge = {
          source: initiator.id,
          target: id.toString(),
          id: initiator.id,
          selected: false,
        } as Edge;
      }
    }

    addNode(id, position, () => {
      if (edge) {
        setEdges([edge]);
      }
    });
  };

  // Updates the selected node when it changes
  const handleSelection = (nodes: Array<Node & IAgent>) => {
    if (nodes.length > 0 && nodes[0] && nodes[0].data) {
      setSelectedNode(nodes[0].data);
    }
    else {
      setSelectedNode(null);
    }
  }

  // Opens the chat pane to test the workflow if it is a valid workflow
  //  with a sender and receiver
  const testWorkflow = () => {
    setShowChat(true);
  }

  return (
    <ReactFlowProvider>
      <BuildLayout
        menu={<Library libraryItems={[{ label: "Agents", items: agents}]} addNode={addNode} user={api.user.email} />}
        properties={selectedNode !== null ? <NodeProperties agent={selectedNode} /> : null}
        chat={showChat && isValidWorkflow ? <Chat workflow_id={workflow_id} close={() => setShowChat(false)} /> : null}
      >
        <BuildNavigation className="nav-over-canvas" id={workflow_id} category="workflow" editting={editting} handleEdit={handleEdit} />
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

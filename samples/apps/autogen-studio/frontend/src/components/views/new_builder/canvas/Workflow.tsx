import React, { createRef, useContext, useEffect, useState, MouseEvent } from "react";
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
import { useBuildStore } from "../../../../hooks/buildStore";
import { useNavigationStore } from "../../../../hooks/navigationStore";
import { API } from "../API";

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
    api: API,
  },
}

/**
 * Properties for the Workflow component
 */
type WorkflowProps = {
  api: any;
}

/**
 * The Workflow build page
 * @param props 
 * @returns 
 */
const Workflow = (props: WorkflowProps) => {
  const { api } = props;
  const { agents, models, skills, workflowId, workflows } = useBuildStore(({ agents, models, skills, workflowId, workflows}) => ({
    agents,
    models,
    skills,
    workflowId,
    workflows
  }));
  const { setNavigationExpand } = useNavigationStore(({setNavigationExpand}) => ({
    setNavigationExpand
  }));
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
  const getNodeId = (n: Array<Node & IAgentNode | undefined> | null): number => {
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
              skills: skills,
              api
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
    // Collapse page left navigation
    setNavigationExpand(false);
    
    // Load workflow
    api.getWorkflowLinks(workflowId, (sender: IAgent, receiver: IAgent) => {
      const sender_pos: NodePosition = { x: 100, y: 100};
      const receiver_pos: NodePosition = {x: 500, y: 100};

      if(sender && sender.id) {
        if (nodes.length === 0 || !nodes.find(node => node.data.id === sender.id)) { // Don't load workflow on re-renders
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
        }
      }
    });
    const curr_work = workflows.find(work => work.id == workflowId)
    if (curr_work) {
      const ed_work = dataToWorkItem(api.user?.email, curr_work);
      setEditting(ed_work);
    }

  }, []);

    useEffect(() => {
      // Make sure the work flow is valid.
      let isValid = false;

      // Should have an initiator
      const initiator: Node | undefined = nodes.find(node => node.data.isInitiator);

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
      api.linkWorkflow(workflowId, "sender", initiator.data.id);
    }


    const edge: Edge | undefined = edges.find(edge => edge.source === initiator?.id);
    if (edge) {
      const target: Node | undefined = nodes.find(node => node.id === edge.target);
      if (target) {
        if (!receiver || receiver && target.data.id !== receiver.id) {
          // link the receiver
          api.linkWorkflow(workflowId, "receiver", target.data.id);
        }
      }
    }
    else {
      // delete receiver
      api.unlinkWorkflow(workflowId, "receiver", receiver.id);
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
    const {group} = data;

    // handle dropping agents to the canvas
    if (group === "agent") {
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
    }
    // handle dropping models and skills to agents
    else {
      // get the target node
      let {target} = e;

      while(target && target.parentNode && !target.classList.contains(`drop-${group}s`)) {
        target = target.parentNode;
      }

      const targetId = parseInt(target.getAttribute("data-id"));

      // updates 
      const updateNodes = () => {
        let updateNodes = JSON.parse(JSON.stringify(nodes));
        updateNodes = updateNodes.map((node) => {
          if (parseInt(node.id) === targetId) {
            if (group === "model") {
              const modelAdd = models.find(model => model.id === data.id);
              if (modelAdd) {
                node.data.models = node.data.models.concat([modelAdd]);
              }
            }
            else if (group === "skill") {
              const skillAdd = skills.find(skill => skill.id === data.id);

              if (skillAdd) {
                node.data.skills = node.data.skills.concat([skillAdd]);
              }
            }
          }
          return node;
        });
        setNodes(updateNodes);
      }

      if (group === "model") {
        api.linkAgentModel(targetId, data.id, updateNodes);
      }
      else if (group === "skill") {
        api.linkAgentSkill(targetId, data.id, updateNodes);
      }
    }
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

  // When interacting with the node properties, updates the node view
  const handleInteract = (event: MouseEvent) => {
    const selectedNodeIndex = nodes.findIndex(node => node.selected);
    if (selectedNodeIndex) {
      const selectedNode: IAgentNode = nodes[selectedNodeIndex];
      const agentId = selectedNode.data.id;

      // get the models and agents for this node
      api.getAgentModels(agentId, (agentModels: IModelConfig[]) => {
        api.getAgentSkills(agentId, (agentSkills: ISkill[]) => {
          const newNodes: IAgentNode[] = JSON.parse(JSON.stringify(nodes));
          let agentUpdated = false;
          const compare = (existing: {id: number}, dbValues: {id: number}) => {
            const toSortedId = (itms) => JSON.stringify(itms.map(itm => itm.id).sort());
            return toSortedId(existing) === toSortedId(dbValues);
          }
          // Check length of agents and skills
          if ((agentModels.length > 0 && !selectedNode.data.models) ||
            (selectedNode.data.models && agentModels.length !== selectedNode.data.models.length) ||
            !compare(selectedNode.data.models, agentModels)) {
              newNodes[selectedNodeIndex].data.models = agentModels;
              agentUpdated = true;
          }
          if ((agentSkills.length > 0 && !selectedNode.data.models) ||
            (selectedNode.data.skills && agentSkills.length !== selectedNode.data.skills.length) ||
            !compare(selectedNode.data.skills, agentSkills)) {
              newNodes[selectedNodeIndex].data.skills = agentSkills;
              agentUpdated = true;
          }

          if (agentUpdated) {
            setNodes(newNodes);
          }
        });
      });
    }
  }

  return (
    <ReactFlowProvider>
      <BuildLayout
        menu={<Library libraryItems={[{ label: "Agents", items: agents}, { label: "Models", items: models}, { label: "Skills", items: skills}]} addNode={addNode} user={api.user.email} />}
        properties={selectedNode !== null ? <NodeProperties agent={selectedNode} handleInteract={handleInteract} /> : null}
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

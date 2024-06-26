import React, { useEffect, useState, MouseEvent, MouseEventHandler, createRef, useRef } from "react";
import Library, { EmptyLibraryItem, LibraryGroup } from "../layout/library/Library";
import BuildLayout from "../layout/BuildLayout";
import WorkflowCanvas from "../canvas/WorkflowCanvas";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../../types";
import ReactFlow, { Edge, Node, ReactFlowProvider, useNodesState, useEdgesState, MarkerType, useReactFlow } from "reactflow";
import NodeProperties from "../layout/NodeProperties";
import TestWorkflow from "../canvas/TestWorkflow";
import Chat from "../layout/Chat";
import BuildNavigation from "../../../BuildNavigation";
import { IWorkItem, dataToWorkItem } from "../utilities/utils";
import { useBuildStore } from "../../../../hooks/buildStore";
import { useNavigationStore } from "../../../../hooks/navigationStore";
import { addNode, getDropHandler, IAgentNode, AgentProperty, createModel, createSkill, NodePosition, NodeSelection } from "../canvas/Canvas";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "antd";

/**
 * Properties for the Workflow component
 */
type EditWorkflowProps = {
}

/**
 * The Workflow build page
 * @param props 
 * @returns 
 */
const EditWorkflow = (props: EditWorkflowProps) => {
  const { api, agents, setAgents, models, skills, workflowId, workflows, setSkills, setModels, setWorkflows, selectedNode, setSelectedNode } = useBuildStore(({ api, agents, setAgents, models, skills, workflowId, workflows, setSkills, setModels, setWorkflows, selectedNode, setSelectedNode}) => ({
    api,
    agents,
    setAgents,
    models,
    skills,
    workflowId,
    workflows,
    setSkills,
    setModels,
    setWorkflows,
    selectedNode,
    setSelectedNode
  }));
  const { setNavigationExpand } = useNavigationStore(({setNavigationExpand}) => ({
    setNavigationExpand
  }));
  const [ bounding, setBounding ] = useState<DOMRect>();
  const [ nodes, _setNodes, onNodesChange ] = useNodesState<Array<Node & IAgentNode>>([]);
  const [ edges, setEdges, onEdgesChange ] = useEdgesState<Edge>([]);
  const [ showChat, setShowChat ] = useState<boolean>(false);
  const [ isValidWorkflow, setIsValidWorkflow ] = useState<boolean>(false);
  const [ editting, setEditting ] = useState<IWorkItem>();
  const initialized = useRef(false);
  const [ showMenu, setShowMenu ] = useState(true);
  const getInitiator = (): Node & IAgentNode | undefined => nodes ? (nodes as Array<Node & IAgentNode>).find((node) => node.data.isInitiator) : undefined;

  // Adds selection properties to nodes
  const getNodesWithProps = (_nodes_: Array<Node & IAgentNode>) => {
    if (_nodes_ && _nodes_.length > 0) {
      const nodesCopy = JSON.parse(JSON.stringify(_nodes_)); 
      const nodesWithSelection = nodesCopy.map((node: Node & IAgentNode) => {
        if (selectedNode && "parent" in selectedNode && (!("group" in selectedNode) || !selectedNode.group) && selectedNode.parent === node.id) {
          node.data.selectedProp = selectedNode;
        }
        else {
          delete node.data.selectedProp;
        }
        if (node.type === "groupchat" && "linkedAgents" in node.data && node.data.linkedAgents.length > 0) {
          node.data.linkedAgents = node.data.linkedAgents.map((agent: IAgent & {selectedProp?: boolean}, idx: number) => {

            if (selectedNode && "group" in selectedNode && selectedNode.group === node.id) {
              if (idx === parseInt(selectedNode.parent)) {
                agent.selectedProp = !!selectedNode;
              }
              else if ("selectedProp" in agent) {
                delete agent.selectedProp;
              }
            }
            else if ("selectedProp" in agent) {
              delete agent.selectedProp;
            }
            return agent;
          })
        }
        return node;
      });
      return nodesWithSelection;
    }
    return _nodes_;
  }

  // Data processing before new nodes are pushed
  const setNodes = (newNodes: any) => {
    const noEmptyAgents = newNodes.filter((node: Node & IAgentNode) => node.selected || node.data.id !== -1);
    const nodesWithProps = getNodesWithProps(noEmptyAgents);
    _setNodes(nodesWithProps);
  }

  // Adds a new edge
  const addEdge = (id: string) => {
    const initiator = getInitiator();
    if (initiator) {
      setEdges([{
        source: initiator.id,
        id: "1",
        selected: false,
        target: id,
        markerStart: {
          type: MarkerType.ArrowClosed,
          color: "var(--agent-color)"
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--agent-color)"
        }
      }]);
    }
  }

  // Loads the current active workflows nodes to the canvas
  const loadWorkflow = () => {
    if (!initialized.current) {
      // Refresh workflows before rendering the current workflow
      api?.getWorkflows((updatedWorkflows) => {
        setWorkflows(updatedWorkflows);
        // Find the current active workflow data by it's id
        const curr_work = updatedWorkflows.find((work: IWorkflow) => work.id == workflowId)

        if (curr_work) {
          const { sender, receiver } = curr_work;
          const workflowNodes: Array<Node & IAgentNode> = [];
          const nodeToWorkflow = (nodes: Array<Node & IAgentNode>) => {
            const data = nodes[0];
            data.id = `${workflowNodes.length + 1}`
            workflowNodes.push(nodes[0]);
            if (!sender || !receiver || workflowNodes.length === 2) {
              setNodes(workflowNodes);
            }
          }
          // Add nodes for an existing workflow
          if (sender) {
            const sender_pos: NodePosition = { x: 100, y: 100};
            addNode(nodes as Array<Node & IAgentNode>, api, agents, nodeToWorkflow, edges, () => {}, sender.id as number, sender_pos);
          }
          if (receiver) {
            const receiver_pos: NodePosition = {x: 500, y: 100};
            addNode(nodes as Array<Node & IAgentNode>, api, agents, nodeToWorkflow, edges, () => {}, receiver.id as number, receiver_pos);
          }
          // If missing a sender or receiver, set initialized as there won't be any edges
          if (sender === null || receiver === null) {
            initialized.current = true;
          }

          const ed_work = dataToWorkItem(api?.user?.email || "", curr_work);
          setEditting(ed_work);
        }
      });
    }
  }

  const validateWorkflow = () => {
    // Make sure the work flow is valid.
    let isValid = false;

    // Should have an initiator
    const initiator: Node & IAgentNode | undefined = getInitiator();

    if (initiator && edges) {
      // should be connected to an agent
      const edge: Edge | undefined = edges.find(edge => edge.source === initiator.id);
      if (edge && nodes) {
          const target: Node | undefined = nodes.find(node => node.id === edge.target);
          if (target) {
            isValid = true;
          }
      }
    }

    setIsValidWorkflow(isValid);
  }

  // Load and set Agents and workflows
  // TODO: Load all first, then set all in a single object so there are fewer rerenders.
  useEffect(() => {
    // Collapse page left navigation
    setNavigationExpand(false);
    loadWorkflow();

    return () => {
      setSelectedNode(null);
    }
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      // Determine the current workflow and the number of nodes it should have
      const curr_work = workflows.find(workflow => workflow.id === workflowId);
      let nodeCount = 0;
      if (curr_work && curr_work.sender) nodeCount += 1;
      if (curr_work && curr_work.receiver) nodeCount += 1;

      // Once nodes are loaded, add edges and set initialized
      if (nodeCount === nodes.length) {
        // Should have an initiator
        const initiator: Node & IAgentNode | undefined = getInitiator();
        // Add edges to sender and receiver once nodes have loaded
        const target = (nodes as Array<Node & IAgentNode>).find(node => node !== initiator);

        if (target && initiator) {
          setEdges([{
            source: initiator.id,
            id: "1",
            selected: false,
            target: target.id,
            markerStart: {
              type: MarkerType.ArrowClosed,
              color: "var(--agent-color)"
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "var(--agent-color)"
            }
          }]);
        }
      }
    }
    else {
      if(workflowId) {
        api?.getWorkflowLinks(workflowId, updateWorkflow, true);
      }
      validateWorkflow();
    }
  }, [nodes]);

  useEffect(() => {
    // Should only ever have 1 edge
    if (edges && edges.length > 1) {
      // Use only the last added edge
      setEdges([edges[edges.length -1]]);
    }

    // update the workflows sender and receiver
    if(initialized.current){
      if(workflowId) {
        api?.getWorkflowLinks(workflowId, updateWorkflow, true);
      }
    }
    else if (edges.length > 0) {
      initialized.current = true;
    }


    validateWorkflow();
  }, [edges]);

  // Updates workflow agents sender and receiver based on canvas nodes and edges
  const updateWorkflow = (sender: IAgent, receiver: IAgent) => {
    if (!workflowId) return;
    // make sure the sender is correctly set or update it
    const initiator = getInitiator();


    if (!initiator && sender) {
      // delete the existing sender
    }
    else if (!sender && initiator || (sender && initiator && initiator?.data.id !== sender.id)) {
      // update incorrect sender
      api?.linkWorkflow(workflowId, "sender", initiator.data.id);
    }


    const edge: Edge | undefined = edges.find(edge => edge.source === initiator?.id);
    if (edge) {
      const target: Node | undefined = nodes.find(node => node.id === edge.target);
      if (api && target) {
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
    else if (api && receiver) {
      // delete receiver
      api.unlinkWorkflow(workflowId, "receiver", receiver.id);
    }
  }

    // suppresses event bubbling for drag events
    const handleDrag: MouseEventHandler = (event: MouseEvent) => {
      event.preventDefault();
  };

  // Updates the selected node when it changes
  const handleSelection = (selected: NodeSelection) => {
    if (Array.isArray(selected)) {
      selected = selected[selected.length - 1];
    }

    if (selected) {
      // A selected model or skill
      if ("parent" in selected && selected.parent) {
        const selectedData: AgentProperty = {
          id: selected.id || 0,
          parent: selected.parent,
          type: "model" in selected ? "model" : "skill",
        }
        if (selected && "group" in selected) {
          selectedData.group = selected.group as string;
        }
        setSelectedNode(selectedData);
      }
      // A selected workflow
      else {
        const workflow = selected;
        setSelectedNode(workflow as IWorkflow)
      }
    }
    else {
      setSelectedNode(null);
    }
  }

  useEffect(() => {
    if (!selectedNode || selectedNode.type === "model" || selectedNode.type === "skill") {
      setNodes(nodes);
    }
  }, [selectedNode]);

  // Drag and drop handler for items dragged onto the canvas or agents
  const handleDragDrop = getDropHandler(bounding, api, setNodes, nodes as Array<Node & IAgentNode>, edges, setEdges, agents, setAgents, setModels, setSkills, handleSelection);

  // Opens the chat pane to test the workflow if it is a valid workflow
  //  with a sender and receiver
  const testWorkflow = () => {
    setShowChat(true);
  }

  // Refreshes agents from the database and 
  const updateNodes = () => {
    if (selectedNode && "data" in selectedNode && selectedNode.data.id !== -1) {
      api?.getAgents((agentsFromDB: Array<IAgent>) => {
        // setAgents(agentsFromDB);
        const updatedNodes = (nodes as Array<Node & IAgentNode>).map((node: Node & IAgentNode) => {
          const nodeCopy = JSON.parse(JSON.stringify(node));
          const updatedAgent = agentsFromDB.find((agent: IAgent) => agent.id === node.data.id);
          const newNode = {
            ...nodeCopy,
            data: {
              ...nodeCopy.data,
              ...updatedAgent,
              deselected: !edges || edges.length < 1 || !edges.find(edge => edge.source === nodeCopy.id || edge.target === nodeCopy.id)
            }
          }
  
          return newNode;
        });
        setNodes(updatedNodes);
      });
    }
  }

  // New agent item for the library
  const newAgent: EmptyLibraryItem = {
    id: 0,
    config: {
      name: "New Agent"
    }
  };

  // Items to show in the library
  const libraryItems: Array<LibraryGroup> = [
    { label: "Agents", items: [ newAgent, ...agents]},
    { label: "Models", items: [{
      model: "New Model"
    }, ...models]},
    { label: "Skills", items: [{
      name: "New Skill",
      content: " ",
    }, ...skills]}
  ];

  // Click handler for the workflow setting icon
  const editWorkflow = () => {
    // click handler to edit the currently active workflow
    const workflow = workflows.find(workflow => workflow.id === workflowId);
    if (workflow) {
      handleSelection(workflow);
    }
  }

  // Creates or attaches Agents, models and skills
  const addLibraryItem = (data: (IAgent | IModelConfig | ISkill) & {
    type: "agent" | "model" | "skill"
  }) => {
    const rightPos = nodes && nodes.length > 0 ? Math.max(...nodes.map(node => node.position.x)) + 300 : 100;
    const addAgent = (id: number) => addNode(nodes as Array<Node & IAgentNode>, api, agents, setNodes, edges, setEdges, id, {
      x: rightPos,
      y: 100
    });
    const createEmptyAgent = () => {
      addNode(nodes as Array<Node & IAgentNode>, api, agents, (newNodes: Array<Node & IAgentNode>) => {
        const selected = newNodes.map(node => {
          if (node.data.id === -1) {
            node.selected = true;
          }
          else {
            node.selected = false;
          }
          return node;
        });
        setNodes(selected);
      }, edges, setEdges, -1, {x: rightPos, y: 100});
      const selectedNode = nodes[nodes.length - 1] as NodeSelection;
      setSelectedNode(selectedNode);
  }
    // Logic for attaching to a selected item
    if (selectedNode) {
      const id = typeof selectedNode.id === "string" ? parseInt(selectedNode.id) : selectedNode.id;
      switch (data.type) {
        case "model":
          // Link model to selected node
          if (id !== undefined) {
            if (data.id !== undefined && data.id > 0) {
              api?.linkAgentModel(id, data.id, (data) => {
                updateNodes();
              });
            }
            else {
              createModel(api, nodes as Array<Node & IAgentNode>, setModels, handleSelection, updateNodes, id);
            }
          }
          break;
        case "skill":
          // Link skill to selected node
          if (id !== undefined) {
            if ( data.id !== undefined && data.id > 0) {
              api?.linkAgentSkill(id, data.id, (data: Array<ISkill>) => {
                updateNodes();
              });
            }
            else {
              // create a new skill and link it to the model
              createSkill(api, nodes as Array<Node & IAgentNode>, setSkills, handleSelection, updateNodes, id);
            }
          }
          break;
        case "agent":
          if ("type" in selectedNode && selectedNode.type !== "groupchat") {
            if (data.id !== undefined && data.id > 0) {
              addNode(nodes as Array<Node & IAgentNode>, api, agents, (updatedNodes) => {
                const selected = updatedNodes.map((node, idx) => {
                  node.selected = idx === updatedNodes.length - 1;
                  return node;
                });
                setNodes(selected);
              }, edges, setEdges, data.id, {x: rightPos, y: 100});
            }
            else {
              createEmptyAgent();
            }
          }
          else {
            // link an agent to group chat agent
            if (id !== undefined && data.id !== undefined && data.id > 0) {
              api?.linkAgent(id, data.id, updateNodes);
            }
            else {
              // add an empty agent
            }
          }
      }
    }
    // Only agents can be added to the canvas when an agent isn't selected
    else {
      if (data.type === "agent") {
        // Adding an existing agent to the canvas
        if (data.id !== undefined && data.id > 0) {
          const newNode = agents.find(agent => agent.id === data.id);
          if (newNode) {
            addAgent(data.id);
          }
        }
        else {
          createEmptyAgent();
        }
      }
    }
  }
  
  return (
    <ReactFlowProvider>
      <BuildLayout
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        closeChat={() => setShowChat(false)}
        menu={<Library libraryItems={libraryItems} setShowMenu={setShowMenu} addLibraryItem={addLibraryItem} />}
        properties={selectedNode !== null ? 
          <NodeProperties
            handleInteract={updateNodes}
            setSelectedNode={handleSelection}
            setNodes={setNodes}
            addEdge={addEdge}
          /> :
          null}
        chat={showChat && isValidWorkflow && workflowId !== null ? <Chat workflow_id={workflowId} close={() => setShowChat(false)} /> : null}
        chatTitle={editting?.name}
      >
        <div className="canvas-actions">
          <BuildNavigation className="nav-over-canvas" category="workflow" />
          <Tooltip placement="bottom" title="Edit workflow">
            <div className="workflow-edit" onClick={editWorkflow}><Cog6ToothIcon /></div>
          </Tooltip>
        </div>
        <WorkflowCanvas
          nodes={nodes as Array<Node & IAgentNode>}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onDrop={handleDragDrop as any}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          setBounding={setBounding}
          setEdges={setEdges as (edges: Edge[] | ((els: Edge[]) => Edge[])) => void}
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

export default EditWorkflow;

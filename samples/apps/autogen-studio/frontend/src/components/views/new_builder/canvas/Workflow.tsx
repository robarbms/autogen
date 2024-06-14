import React, { createRef, useContext, useEffect, useState, MouseEvent } from "react";
import Library from "../library/Library";
import BuildLayout from "./BuildLayout";
import WorkflowCanvas from "./WorkflowCanvas";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../../types";
import ReactFlow, { Edge, Node, NodeChange, ReactFlowProvider, useNodesState, useEdgesState, MarkerType, useStoreApi } from "reactflow";
import NodeProperties from "./NodeProperties";
import TestWorkflow from "./TestWorkflow";
import Chat from "./Chat";
import BuildNavigation from "../BuildNavigation";
import { IWorkItem, dataToWorkItem } from "../utils";
import { useBuildStore } from "../../../../hooks/buildStore";
import { useNavigationStore } from "../../../../hooks/navigationStore";
import { API } from "../API";
import { addNode, getDropHandler, nodeUpdater, IAgentNode, AgentProperty, emptyAgent, createModel, createSkill } from "./Canvas";

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
  const { agents, setAgents, models, skills, workflowId, workflows, setSkills, setModels, setWorkflows } = useBuildStore(({ agents, setAgents, models, skills, workflowId, workflows, setSkills, setModels, setWorkflows}) => ({
    agents,
    setAgents,
    models,
    skills,
    workflowId,
    workflows,
    setSkills,
    setModels,
    setWorkflows
  }));
  const { setNavigationExpand } = useNavigationStore(({setNavigationExpand}) => ({
    setNavigationExpand
  }));
  const [ bounding, setBounding ] = useState<DOMRect>();
  const [ nodes, setNodes, onNodesChange ] = useNodesState<Array<Node & IAgentNode | IAgent>>([]);
  const [ edges, setEdges, onEdgesChange ] = useEdgesState<Edge>([]);
  const [ showChat, setShowChat ] = useState<Boolean>(false);
  const [ selectedNode, setSelectedNode ] = useState<null | Object>(null);
  const [ isValidWorkflow, setIsValidWorkflow ] = useState<Boolean>(false);
  const [ editting, setEditting ] = useState<IWorkItem>();
  const [ initialized, setInitialized ] = useState<boolean>(false);
  const [ showMenu, setShowMenu ] = useState(true);
  const getInitiator = (): Node & IAgentNode | undefined => (nodes as Array<Node & IAgentNode>).find((node) => node.data.isInitiator)
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


  const loadWorkflow = () => {
    if (!initialized) {
      // Refresh workflows before rendering the current workflow
      api.getWorkflows((updatedWorkflows) => {
        setWorkflows(updatedWorkflows);

        // Find the current active workflow data by it's id
        const curr_work = updatedWorkflows.find(work => work.id == workflowId)
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
            addNode(nodes, api, agents, nodeToWorkflow, edges, () => {}, sender.id, sender_pos);
          }
          if (receiver) {
            const receiver_pos: NodePosition = {x: 500, y: 100};
            addNode(nodes, api, agents, nodeToWorkflow, edges, () => {}, receiver.id, receiver_pos);
          }
          // If missing a sender or receiver, set initialized as there won't be any edges
          if (sender === null || receiver === null) {
            setInitialized(true);
          }

          const ed_work = dataToWorkItem(api.user?.email, curr_work);
          setEditting(ed_work);
        }
      });
    }
  }

  // Load and set Agents and workflows
  // TODO: Load all first, then set all in a single object so there are fewer rerenders.
  useEffect(() => {
    // Collapse page left navigation
    setNavigationExpand(false);
    loadWorkflow();
  }, []);

  /*
  useEffect(() => {
    setInitialized(false);
    setEdges([]);
    setNodes([]);
    setTimeout(loadWorkflow, 100);
  }, [workflowId]);
  */

  useEffect(() => {
    if (!initialized) {
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

        if (target) {
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

        setInitialized(true);
      }
    }

  }, [nodes]);

  useEffect(() => {
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

    // update the workflows sender and receiver
    if(initialized) api.getWorkflowLinks(workflowId, updateWorkflow, true);

    // Should only ever have 1 edge
    if (edges && edges.length > 1) {
      // Use only the last added edge
      setEdges([edges[edges.length -1]]);
    }
  }, [nodes, edges]);


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
      handleSelection(null);
      event.preventDefault();
  };

  // Updates the selected node when it changes
  const handleSelection = (selected: Array<Node & IAgentNode> | IModelConfig & { parent: string } | ISkill & { parent: string }) => {
    if (selected) {
      if (Array.isArray(selected)) {
        setSelectedNode(selected.length > 0 ? selected[selected.length - 1].data : null);
      }
      else {
        const selectedData: AgentProperty = {
          id: selected.id || 0,
          parent: selected.parent,
          type: "model" in selected ? "model" : "skill",
        }
        if (selected.group) {
          selectedData.group = selected.group;
        }
        setSelectedNode(selectedData);
      }
    }
    else {
      setSelectedNode(null);
    }
    // remove any empty agents that are not selected
    const removedEmpty = nodes.filter(node => node.data.id !== -1 || node.selected);
    if (nodes.length > removedEmpty.length) {
      setNodes(removedEmpty);
    }
  }

  // Drag and drop handler for items dragged onto the canvas or agents
  const handleDragDrop = getDropHandler(bounding, api, setNodes, nodes, edges, setEdges, agents, setAgents, setModels, setSkills, handleSelection);

  // Update selected agent properties when selectedNode changes
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const updatedNodes = JSON.parse(JSON.stringify(nodes)).map(node => {
        if (selectedNode && "parent" in selectedNode && !("group" in selectedNode) && selectedNode.parent === node.id) {
          node.data.selectedProp = selectedNode;
        }
        else {
          delete node.data.selectedProp;
        }
        if (node.type === "groupchat" && "linkedAgents" in node.data) {
          node.data.linkedAgents = node.data.linkedAgents.map((agent, idx) => {
            if (selectedNode && "group" in selectedNode && selectedNode.group === node.id) {
              if (idx === parseInt(selectedNode.parent)) {
                agent.selectedProp = selectedNode;
              }
              else {
                delete agent.selectedProp;
              }
            }
            else {
              delete agent.selectedProp;
            }
            return agent;
          })
        }
        return node;
      });
      setNodes(updatedNodes);
    }
  }, [selectedNode]);

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
  
  // Items to show in the library
  const libraryItems = [
    { label: "Agents", items: [{
      id: 0,
      config: {
        name: "New Agent"
      }
    }].concat(agents)},
    { label: "Models", items: [{
      id: 0,
      model: "New Model"
    }].concat(models)},
    { label: "Skills", items: [{
      id: 0,
      name: "New Skill",
      content: " ",
    }].concat(skills)}
  ];

  // Creates or attaches Agents, models and skills
  const addLibraryItem = (data) => {
    console.log(data);
    const rightPos = nodes && nodes.length > 0 ? Math.max(...nodes.map(node => node.position.x)) + 300 : 100;
    const addAgent = (id: number) => addNode(nodes, api, agents, setNodes, edges, setEdges, id, {
      x: rightPos,
      y: 100
    });
    const createEmptyAgent = () => {
      const agentsWithEmpty = agents.concat([emptyAgent(api.user?.email)]);
      addNode(nodes, api, agentsWithEmpty, (newNodes) => {
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
      setSelectedNode(nodes[nodes.length - 1]);
  }
    // Logic for attaching to a selected item
    if (selectedNode) {
      switch (data.type) {
        case "model":
          // Link model to selected node
          if (data.id > 0) {
            api.linkAgentModel(selectedNode.id, data.id, (data) => {
              updateNodes();
            });
          }
          else {
            createModel(api, nodes, setModels, handleSelection, updateNodes, selectedNode.id);
          }
          break;
        case "skill":
          // Link skill to selected node
          if (data.id > 0) {
            api.linkAgentSkill(selectedNode.id, data.id, (data) => {
              updateNodes();
            });
          }
          else {
            // create a new skill and link it to the model
            createSkill(api, nodes, setSkills, handleSelection, updateNodes, selectedNode.id);
          }
          break;
        case "agent":
          if (selectedNode.type !== "groupchat") {
            if (data.id > 0) {
              addNode(nodes, api, agents, (updatedNodes) => {
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
            if (data.id > 0) {
              api.linkAgent(selectedNode.id, data.id, updateNodes);
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
        if (data.id > 0) {
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
    console.log({data, selectedNode, nodes});
  }
  
  return (
    <ReactFlowProvider>
      <BuildLayout
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        closeChat={() => setShowChat(false)}
        menu={<Library libraryItems={libraryItems} addNode={addNode} user={api.user.email} setShowMenu={setShowMenu} addLibraryItem={addLibraryItem} />}
        properties={selectedNode !== null ? <NodeProperties api={api} selected={selectedNode} handleInteract={updateNodes} setSelectedNode={handleSelection} nodes={nodes} setNodes={setNodes} addEdge={addEdge} /> : null}
        chat={showChat && isValidWorkflow ? <Chat workflow_id={workflowId} close={() => setShowChat(false)} /> : null}
        chatTitle={editting?.name}
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

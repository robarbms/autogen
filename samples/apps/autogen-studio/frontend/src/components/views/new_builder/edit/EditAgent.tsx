import React, { MouseEvent, MouseEventHandler, useEffect, useRef, useState, useCallback } from "react";
import BuildLayout from "../layout/BuildLayout";
import Library, { LibraryGroup } from "../layout/library/Library";
import AgentCanvas from "../canvas/AgentCanvas";
import { Node, useNodesState, ReactFlowProvider, useNodes } from "reactflow";
import { useBuildStore } from "../../../../hooks/buildStore";
import { API } from "../utilities/API";
import { AgentProperty, getDropHandler, IAgentNode, NodeSelection, nodeUpdater } from "../canvas/Canvas";
import NodeProperties from "../canvas/panels/NodeProperties";
import { IAgent, IModelConfig, ISkill } from "../../../types";

// Properties for EditAgent component
type EditAgentProps = {
    agentId: number;
}

/**
 * Component for rendering a screen for creating new agents or editting existing agents
 * @param props 
 * @returns 
 */
const EditAgent = (props: EditAgentProps) => {
  const { agentId } = props;
    const { api, agents, setAgents, models, skills, setModels, setSkills, selectedNode, setSelectedNode } = useBuildStore(({ api, agents, setAgents, models, skills, setModels, setSkills, selectedNode, setSelectedNode}) => ({
      api,
      agents,
      setAgents,
      models,
      skills,
      setModels,
      setSkills,
      selectedNode,
      setSelectedNode
    }));
    const [nodes, _setNodes, onNodesChange] = useNodesState<Array<Node & IAgentNode>>([]);
    const [bounding, setBounding] = useState<DOMRect>();
    const [ showMenu, setShowMenu ] = useState<boolean>(true);
    const initialized = useRef<boolean>(false);

  // Adds selection properties to nodes
  const getNodesWithProps = (_nodes_: Array<Node & IAgentNode>) => {
    if (_nodes_ && _nodes_.length > 0) {
      const nodesWithSelection = _nodes_.map((node: Node & IAgentNode) => {
        if (selectedNode && "parent" in selectedNode && (!("group" in selectedNode) || !selectedNode.group) && selectedNode.parent === node.id) {
          node.data.selectedProp = selectedNode;
        }
        else {
          delete node.data.selectedProp;
        }
        if (node.type === "groupchat" && "linkedAgents" in node.data) {
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
          });
        }
        node.data.isInitiator = false;
        node.data.hideConnector = true;
      return node;
      });
      return nodesWithSelection;
    }
    return _nodes_;
  }

  const setNodes = (nodes: Array<Node & IAgentNode>, onComplete?: Function) => {
    const nodesWithProps = getNodesWithProps(nodes);
    _setNodes(nodesWithProps);
    if (onComplete) setTimeout(onComplete, 100);
  }

  // On clicking of a node sets it as selected
  const handleSelection = useCallback((selected: NodeSelection) => {
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
      else {
        setSelectedNode(selected as any);
      }
    }
    else {
      setSelectedNode(null);
    }
  }, [nodes]);
  
  // suppresses event bubbling for drag events
  const handleDrag: MouseEventHandler = (event: MouseEvent) => {
      event.preventDefault();
  };

  // Drag and drop handler for items dragged onto the canvas or agents
  const handleDrop = getDropHandler(bounding, api, setNodes, nodes as Array<Node & IAgentNode>, [], () => {}, agents, setAgents, setModels, setSkills, handleSelection, true) as any;

  // Load a new node to the canvas if there is an agentId
  useEffect(() => {
    if (initialized.current === false && agentId !== undefined) {
      const agentNode = agents.find((agent: IAgent) => agent.id === agentId);
      if (agentNode) {
        const newAgent = {
          id: '1',
          position: {
            x: 100,
            y: 100
          },
          data: {
            ...agentNode,
            api,
            hideConnector: true,
          },
          type: agentNode.type,
          setSelection: handleSelection
        } as Node & IAgentNode;
        setNodes([newAgent], () => initialized.current = true);
      }
    }
    return () => setSelectedNode(null);
  }, [])

  // Updates nodes to reflect changes to models or skills
  useEffect(() => {
    if (initialized.current === true) {
      api?.getAgents((updatedAgents: IAgent[]) => {
        setAgents(updatedAgents);
        const updatedNodes = (nodes as Array<Node & IAgentNode>).map((node: Node & IAgentNode) => {
          const foundAgent = updatedAgents.find((agent: IAgent) => node.data.id === agent.id);
          if (foundAgent) {
            node.data = {
              ...node.data,
              ...foundAgent
            }
          }
          return node;
        });

        setNodes(updatedNodes);
      });
    }
  }, [models, skills]);

  // Update selected agent properties when selectedNode changes
  useEffect(() => {
    if (initialized.current === true && (!selectedNode || selectedNode.type === "model" || selectedNode.type === "skill")) {
      // setNodes(nodes as Array<Node & IAgentNode>);
    }
  }, [selectedNode]);

  // Updates nodes on the canvas when there are changes made
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
              deselected: false
            }
          }
  
          return newNode;
        });
        setNodes(updatedNodes);
      });
    }
  }

  // Handles on click for library item
  // TO DO: This should be similar to workflow.tsx.
  const addLibraryItem = (data: any) => {
    console.log(data);
  }
  
  // Items to show in the library
  const libraryItems: Array<LibraryGroup> = [
    { label: "Agents", items: [{
      id: 0,
      config: {
        name: "New Agent"
      }
    }, ...agents]} as LibraryGroup,
    { label: "Models", items: [{
      id: 0,
      model: "New Model"
    }, ...models]},
    { label: "Skills", items: [{
      id: 0,
      name: "New Skill",
      content: " ",
    }, ...skills]}
  ];

  return (
    <ReactFlowProvider>
      <BuildLayout
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        menu={<Library setShowMenu={setShowMenu} libraryItems={libraryItems} addLibraryItem={addLibraryItem} />}
        properties={selectedNode !== null ? 
          <NodeProperties
            handleInteract={updateNodes}
            setSelectedNode={setSelectedNode as any}
          /> : null}
      >
        <AgentCanvas
            nodes={nodes}
            onNodesChange={onNodesChange}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            setBounding={setBounding}
            setNodes={setNodes as any}
            setSelection={handleSelection}
        />
      </BuildLayout>
    </ReactFlowProvider>
  )
}

export default EditAgent;
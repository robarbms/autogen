import AssistantNode from "../nodes/AssistantNode";
import GroupChatNode from "../nodes/GroupChatNode";
import UserProxyNode from "../nodes/UserProxyNode";
import AgentSelectNode from "../nodes/AgentSelectNode";
import { Node, Edge, MarkerType } from "reactflow";
import { IAgent, IModelConfig, ISkill } from "../../../types";
import { API } from "../API";
import React, { MouseEventHandler, createElement } from "react";

// Type for positioning of a node
export type NodePosition = {
  x: number;
  y: number;
}

export type NodeSelection = Array<Node & IAgentNode> | AgentProperty | IModelConfig & AgentProperty | ISkill & AgentProperty | null;

/**
 * Encapsulating IAgent config and node information
 */
export interface IAgentNode {
  position?: NodePosition;
  id: string;
  type: "userproxy" | "assistant" | "groupchat" | undefined;
  isConnectable?: Boolean;
  dragHandle?: string;
  data: IAgent & {
    isInitiator?: Boolean;
    models?: IModelConfig[];
    skills?: ISkill[];
    api: API;
    hideConnector?: boolean;
    linkedAgents?: Array<IAgent & {dragHandle?: Function, isSelected?: boolean}>;
  },
  setSelection?: (node: NodeSelection) => void,
  selectedProp?: boolean,
  selected?: boolean
}

/**
 * Data for targeting a model or skill for an agent instance
 */
export type AgentProperty = {
  id?: number;
  parent: string;
  type: "model" | "skill";
  group?: string;
}

/**
 * Data attached to the events dataTransfer property for an item being dragged
 */
export interface IDropData {
  group: "agent" | "model" | "skill" | "group-agent" | "agent-property";
  id: number;
  offsetX: number;
  offsetY: number;
  parent?: number;
  type?: "model" | "skill";
}

export interface INodeTypes {
  [key: string]: any
}

/**
 * Nodes used by the canvas
 */
export const NodeTypes: INodeTypes = {
  userproxy: UserProxyNode,
  assistant: AssistantNode,
  groupchat: GroupChatNode,
  agentselect: AgentSelectNode
}

/**
 * Injects additional props into node components
 * @param extraProps 
 * @returns 
 */
export const TypesWithProps = (extraProps: any) => {
  const typeWithProps:  {[key: string]: any} = {};
  for (let key in NodeTypes) {
    const node = NodeTypes[key];
    typeWithProps[key] = (props: any) => createElement(node, {
      ...extraProps,
      ...props
    });
  }
  return typeWithProps;
}

// Walks dom up looking for a valid drop element
export const getTargetId = (event: Event, targetClass: string) => {
  let target: HTMLElement = event.target as HTMLElement;
  const match = (elm: HTMLElement) => elm && elm.classList && elm.classList.contains(targetClass);

  while (!match(target) && target.parentNode) {
    target = target.parentNode as HTMLElement;
  }

  if (!match(target)) return -1;

  const dataId = target.getAttribute("data-id");

  return dataId !== null ? parseInt(dataId) : -1;
}


// Gets a new node id based on existing nodes
const getNodeId = (nodes: Array<Node & IAgentNode> | null): number => {
  if (!nodes || nodes.length === 0) {
    return 1;
  }
  const max: number = Math.max(...nodes.map(node => parseInt(node.id || "0")));
  return max + 1;
}

// method used to add new nodes and track node Id's
export const addNode = (
  nodes: Array<Node & IAgentNode>,
  api: API,
  agents: Array<IAgent>,
  setNodes: (nodes: Array<Node & IAgentNode>) => void,
  edges: Array<Edge>,
  setEdges: (edges: Array<Edge>) => void,
  agentId: number,
  position: NodePosition,
  hideConnector: boolean = false
) => {
  if(!agentId) return;
  const agentData: IAgent | undefined = agents.find((agent:IAgent) => agent.id === agentId);
  const initiator = nodes.find(node => node.data.isInitiator);
  const isInitiator: Boolean = !!(!initiator && agentData && agentData.type === "userproxy");
  if (agentData) {
    const node_id: number = getNodeId(nodes);
    const nodeData: Node & IAgentNode = {
      data: {...agentData,
        config: {...agentData.config},
        isInitiator,
        api,
        hideConnector
      },
      position,
      dragHandle: '.drag-handle',
      id: node_id.toString(),
      type: agentData.type || "assistant",
    };
    if (!initiator && nodeData.type === "userproxy") {
      nodeData.data.isInitiator = true;
    }
    const newNodes: Array<Node & IAgentNode> = nodes.concat([nodeData]);
    if (setNodes){
      setNodes(newNodes);

      // Create a new edge from the initiator to the newly created node
      if (nodeData.type === "assistant" || nodeData.type === "groupchat") {
        if (initiator) {
          setEdges([{
            source: initiator.id,
            id: `${edges.length + 2}`,
            selected: false,
            target: node_id.toString(),
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
  }
}

  // Refreshes agents from the database and rerenders nodes
export const nodeUpdater = (
  api: API,
  setAgents: (agents: Array<IAgent>) => void,
  setNodes: (nodes: Array<Node & IAgentNode>) => void,
  nodes: Array<Node & IAgentNode>
) => {
  api.getAgents((agentsFromDB: Array<IAgent>) => {
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

export const emptyAgent = (user_id: string = ""): IAgent => ({
  id: -1,
  user_id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  type: undefined,
  config: {
    name: "create_agent",
    human_input_mode: "NEVER",
    max_consecutive_auto_reply: 10,
    system_message: "",
    is_termination_msg: true,
    code_execution_config: "local",
    default_auto_reply: "",
    description: "",
    llm_config: false,
    admin_name: "Admin",
    messages: [],
    max_round: 100,
    speaker_selection_method: "auto",
    allow_repeat_speaker: true
  }
});

export const createModel = (
  api: API,
  nodes: Array<Node & IAgentNode>,
  setModels: Function,
  handleSelection: Function,
  callback: Function,
  modelTarget: number
) => {
  // Creating a new model
  const now = new Date().toISOString();
  const name = "Model name";
  const modelData = {
    created_at: now,
    updated_at: now,
    model: name,
    user_id: api.user?.email,
  }

  api.setModel(modelData, (data: any) => {
    const {id} = data.data;
    api.linkAgentModel(modelTarget, id, (resp) => {
      callback(resp);
      api.getItems("models", (models: Array<IModelConfig>) => {
        setModels(models);
        setTimeout(() => {
          const nodeParent = nodes.find(node => node.data.id === modelTarget);
          handleSelection({
            group: "agent-property",
            parent: nodeParent?.id || modelTarget,
            id,
            type: "model",
            model: true
          });
        }, 100);
      }, true);
    });
  });
}

export const createSkill = (
  api: API,
  nodes: Array<Node & IAgentNode>,
  setSkills: Function,
  handleSelection: Function,
  callback: Function,
  skillTarget: number
) => {
  // Adding a new skill
  const now = new Date().toISOString();
  const name = "Skill name";
  const skillData = {
    id: 0,
    created_at: now,
    updated_at: now,
    user_id: api.user?.email,
    name,
    content: "// Content goes here",
    description: " ",
    secrets: {},
    libraries: {},
  }
  api.addSkill(skillData, (data: any) => {
    setSkills(data);
    let targetIndex = data.length - 1;
    while (targetIndex > 0 && data[targetIndex].name !== name) {
      targetIndex -= 1;
    }
    if (targetIndex >= 0 && data[targetIndex].name === name) {
      api.linkAgentSkill(skillTarget, data[targetIndex].id, (agentSkillResp) => {
        callback(agentSkillResp);
        setTimeout(() => {
          const nodeParent = nodes.find(node => node.data.id === skillTarget);
          handleSelection({
            group: "agent-property",
            parent: nodeParent?.id ?? skillTarget,
            id: data[targetIndex].id,
            type: "skill"
          });
        }, 100);
      });
    }
  });
}

export const activeNode = (edges: Array<Edge>, nodeId: string) => edges && edges.length > 0 && !!edges.find(edge => edge.source === nodeId || edge.target === nodeId);

// Figures out what was dropped, where it came from and where it is being dropped
export const getDropHandler = (
  canvasArea: DOMRect | undefined,
  api: API,
  setNodes: (nodes: Array<Node & IAgentNode>) => void,
  nodes: Array<Node & IAgentNode>,
  edges: Array<Edge>,
  setEdges: (edges: Array<Edge>) => void,
  agents: Array<IAgent>,
  setAgents: (agents: Array<IAgent>) => void,
  setModels: (models: Array<IModelConfig>) => void,
  setSkills: (skills: Array<ISkill>) => void,
  handleSelection: Function,
  hideConnector: boolean = false
) =>
  (event: MouseEvent & {
    dataTransfer: {
        getData: (type: string) => string
    }
  }
  ) => {
    const { left, top } = {
      left: 388,
      top: 16
    };

    // Update agents and refresh nodes once a database edit has been made
    const callback = (data: any[]) => nodeUpdater(api, setAgents, setNodes, nodes);

    // addNode function with api, nodes and edges preloaded
    const newNode = (
      agentId: number,
      position: NodePosition,
      customAgents?: Array<IAgent>,
      customSetNodes?: (nodes: Array<Node & IAgentNode>) => void,
      customHideConnector?: boolean
    ) => addNode(
      nodes,
      api,
      customAgents || agents,
      customSetNodes || setNodes,
      edges,
      setEdges,
      agentId,
      position,
      customHideConnector || hideConnector
    )

    // Get the data about the item being dragged
    const dataTransfer: string = event.dataTransfer.getData('text/plain');
    const data: IDropData = JSON.parse(dataTransfer) as IDropData;
    const { group, id, offsetX, offsetY, parent, type } = data;

    const eventTargetId = getTargetId.bind(this, event); // Finds the parent drop zone based on the event
    const position = {
      x: event.clientX + (offsetX || 0) - left,
      y: event.clientY + (offsetY || 0) - top,
    };


    switch (group) {
      // If dragging and dropping an agent
      case "agent":
        const agentTarget = eventTargetId("drop-agents");
        const initiator = nodes.find(node => node.data.isInitiator);

        // Creating a new agent
        if (!id) {
          // Push an empty agent node into the nodes stack
          const now = new Date().toISOString();
          const agentsPlusEmpty = [...agents, emptyAgent(api.user?.email)];
        
          // Adding a new agent to a group agent
          if (agentTarget > 0) {

          }
          else {
            newNode( -1, position, agentsPlusEmpty, (updatedNodes) => {
              const selected = updatedNodes.map(node => {
                if (node.data.id === -1) {
                  node.selected = true;
                }
                node.data.deselected = !edges || edges.length < 1 || !edges.find(edge => node.id === edge.source || node.id === edge.target);
                return node;
              });
              setNodes(selected);
              // const emptyNode = updatedNodes.find((node) => node.data.id === -1);
            }, true);
          }
        }

        // If dropping the agent onto a group agent
        else if (agentTarget > 0) {
            api.linkAgent(agentTarget, id, callback);
        }

        // Otherwise create a position on the canvas to render
        else {
          newNode(id, position);
        }

        break;
      // Dragging a model or skill from an agent on the canvas
      case "agent-property":
        const targetId = eventTargetId(`drop-${type}s`);

        if (targetId !== parent) {
            if (type === "model") {
              if (parent) {
                api.unLinkAgentModel(parent, id, callback);
              }
              if (targetId >= 0) {
                api.linkAgentModel(targetId, id, callback);
              }
            }
            else if (type === "skill") {
                if (parent) {
                  api.unLinkAgentSkill(parent, id, callback);
                }
                if (targetId >= 0) {
                  api.linkAgentSkill(targetId, id, callback);
                }
            }
        }
        break;
      // Dragging a skill from the library
      case "skill":
        const skillTarget = eventTargetId("drop-skills");
        if(skillTarget >= 0) {
          if (id) {
            api.linkAgentSkill(skillTarget, id, callback);
          }
          else {
            createSkill(api, nodes, setSkills, handleSelection, callback, skillTarget);
          }
        }
        break;
      // Dragging a model from the library
      case "model":
        const modelTarget = eventTargetId("drop-models");
        if (modelTarget >= 0) {
            if (id) {
              api.linkAgentModel(modelTarget, id, callback);
            }
            else {
              createModel(api, nodes, setModels, handleSelection, callback, modelTarget);
            }
        }
        break;
      // Dragging an agent from a group-chat agent
      case "group-agent":
        const groupTarget = eventTargetId("drop-agents");

        if (parent && groupTarget !== parent) {
            api.unlinkAgent(parent, id, callback as () => {});
        }

        break;
    }
}
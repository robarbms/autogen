import AssistantNode from "../nodes/AssistantNode";
import GroupChatNode from "../nodes/GroupChatNode";
import UserProxyNode from "../nodes/UserProxyNode";
import { Node } from "reactflow";
import { IAgent, IModelConfig, ISkill } from "../../../types";
import { API } from "../API";

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
  dragHandle?: string;
  data: IAgent & {
    isInitiator?: Boolean;
    models?: IModelConfig[];
    skills?: ISkill[];
    api: API;
    hideConnector?: boolean;
  },
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

/**
 * Nodes used by the canvas
 */
export const NodeTypes = {
  userproxy: UserProxyNode,
  assistant: AssistantNode,
  groupchat: GroupChatNode,
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
  agentId: number,
  position: NodePosition,
  hideConnector: boolean = false
) => {
  const agentData: IAgent | undefined = agents.find((agent:IAgent) => agent.id === agentId);
  const isInitiator: Boolean = nodes?.length === 0;
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
      const newNodes: Array<Node & IAgentNode> = nodes.concat([nodeData]);
      if (setNodes){
        setNodes(newNodes);
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

// Figures out what was dropped, where it came from and where it is being dropped
export const getDropHandler = (
  canvasArea: DOMRect | undefined,
  api: API,
  setNodes: (nodes: Array<Node & IAgentNode>) => void,
  nodes: Array<Node & IAgentNode>,
  agents: Array<IAgent>,
  setAgents: (agents: Array<IAgent>) => void,
  hideConnector: boolean = false
) =>
  (event: MouseEvent & {
    dataTransfer: {
        getData: (type: string) => string
    }
  }
  ) => {
    const { left, top } = canvasArea || {
      left: 0,
      top: 0
    };

    // Update agents and refresh nodes once a database edit has been made
    const callback = (data: any[]) => nodeUpdater(api, setAgents, setNodes, nodes);

    // Get the data about the item being dragged
    const dataTransfer: string = event.dataTransfer.getData('text/plain');
    const data: IDropData = JSON.parse(dataTransfer) as IDropData;
    const { group, id, offsetX, offsetY, parent, type } = data;

    const eventTargetId = getTargetId.bind(this, event); // Finds the parent drop zone based on the event

    switch (group) {
      // If dragging and dropping an agent
      case "agent":
          const agentTarget = eventTargetId("drop-agents");

          // If dropping the agent onto a group agent
          if (agentTarget > 0) {
              api.linkAgent(agentTarget, id, callback);
          }

          // Otherwise create a position on the canvas to render
          else {
              const position = {
                  x: event.clientX + (offsetX || 0) - left,
                  y: event.clientY + (offsetY || 0) - top,
                };
              addNode(nodes, api, agents, setNodes, id, position, hideConnector);
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
              api.linkAgentSkill(skillTarget, id, callback);
          }
          break;
      // Dragging a model from the library
      case "model":
          const modelTarget = eventTargetId("drop-models");
          if (modelTarget >= 0) {
              api.linkAgentModel(modelTarget, id, callback);
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

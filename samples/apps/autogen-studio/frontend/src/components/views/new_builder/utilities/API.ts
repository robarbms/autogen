import { useContext } from "react";
import { IAgent, IChatSession, IStatus, IWorkflow, IModelConfig, ISkill } from "../../../types";
import { useConfigStore } from "../../../../hooks/store";
import { appContext, IUser } from "../../../../hooks/provider";
import { fetchJSON, getServerUrl } from "../../../utils";
import { message } from "antd";

// Class for handling and caching api calls
export class API {

    /* ================ HEADERS ================ */
    
    // Headers used for get calls
    private GET_HEADERS = {
        "method": "GET",
        "headers": {
            "Content-Type": "application/json"
        }
    }

    // Headers used for post calls
    private POST_HEADERS: {
        method: "POST";
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body?: string;
    } = {
        "method": "POST",
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    }

    // Headers used to call delete
    private DELETE_HEADERS = {
        "method": "DELETE",
        "headers": {
            "Content-Type": "application/json"
        }
    }

    // Error and loading handlers
    private _error: (error: IStatus) => void = (error) => {};
    private _loading: (isLoading: Boolean) => void = (isLoading) => {};
    private _success: (success: IStatus) => void = (success) => {};

    // User and serverUrl used for api calls
    public user: IUser | null;
    private serverUrl: string;

    constructor() {
        // Getting the user and server URL for api calls
        const context = useContext(appContext);
        this.user = context.user;
        this.serverUrl = getServerUrl();
    }

    /* ================ STATUS HANDLING ================ */

    set error (handler: (error: IStatus) => void) {
        this._error = handler;
    }

    get error (): (error: IStatus) => void {
        return this._error;
    }

    set loading (handler) {
        this._loading = handler;
    }

    get loading() {
        return this._loading;
    }

    set success (handler: (success: IStatus) => void) {
        this._success = handler;
    }

    get success (): (success: IStatus) => void {
        return this._success;
    }

    // Helper function to order items by a list of ids
    private orderById (items: any[], source: any[]) {
        return source.map(({id}) => items.find((item) => item.id === id));
    }

    /* ================ MODELS ================ */

    // Gets all of the models in the DB
    public getModels(callback: (data: IModelConfig[]) => void) {
        const url =`${this.serverUrl}/models?user_id=${this.user?.email || ""}`;
        const headers = this.GET_HEADERS;

        fetchJSON(url, headers, (response: IStatus) => {
            callback(response.data);
        }, this._error);
    }

    // Adds or updates a new  or existing model to the DB
    public setModel(model: IModelConfig, callback: (data: any) => void) {
        const url = `${this.serverUrl}/models`;
        const headers = this.POST_HEADERS;
        headers.body = JSON.stringify(model);

        fetchJSON(url, headers, (response: IStatus) => {
            callback(response.data);
            this._success(response);
        }, this._error);
    }

    // Removes a model from the DB by ID
    public deleteModel(id: number, callback: (data: IModelConfig[]) => void) {
        if (id) {
            const url = `${this.serverUrl}/models/delete?model_id=${id}&user_id=${this.user?.email || ""}`;
            const headers = this.DELETE_HEADERS;
    
            fetchJSON(url, headers, (response: IStatus) => {
                callback(response.data);
                this._success(response)
            }, this._error);
        }
    }

    // Test a model
    public testModel(model: IModelConfig, callback: (data: any) => void) {
        const url = `${this.serverUrl}/models/test`;
        const headers = this.POST_HEADERS;
        headers.body = JSON.stringify(model);

        fetchJSON(url, headers, (data) => {
            callback(data);
            this._success(data);
        }, this._error);
    }
    
    /* ================ SKILLS ================ */

    // Gets all of the skills in the DB
    public getSkills(callback: (skills: ISkill[]) => void) {
        const url =`${this.serverUrl}/skills?user_id=${this.user?.email || ""}`;
        const headers = this.GET_HEADERS;

        fetchJSON(url, headers, (response: IStatus) => {
            callback(response.data);
        }, this._error);
    }

    // Adds or updates a new or existing skill to the DB
    public setSkill(skill: ISkill, callback: (data: ISkill[]) => void) {
        // Find all agents with the skill and unlink them
        const url =`${this.serverUrl}/skills?user_id=${this.user?.email || ""}`;
        const headers = this.POST_HEADERS;
        headers.body = JSON.stringify(skill);

        fetchJSON(url, headers, (data: IStatus) => {
            callback(data.data);
            this._success(data);
        }, this._error);
    }

    // Removes a skill from the DB by ID
    public deleteSkill(id: number, callback: (data: ISkill[]) => void) {
        if (id) {
            const url = `${this.serverUrl}/skills/delete?skill_id=${id}&user_id=${this.user?.email || ""}`;
            const headers = this.DELETE_HEADERS;
    
            fetchJSON(url, headers, (data: IStatus) => {
                callback(data.data);
                this._success(data);
            }, this._error);
        }
    }

    /* ================ AGENTS ================ */

    // Gets agents and their linked models and skills
    public getAgents (callback: Function) {
        const url = `${this.serverUrl}/agents?user_id=${this.user?.email}`;
        const headers = this.GET_HEADERS;

        fetchJSON(url, headers, (response: IStatus) => {
            const agents = response.data;
            const updatedAgents: Set<IAgent> = new Set();
            const addUpdatedAgent = (agent: IAgent) => {
                updatedAgents.add(agent);
                if (updatedAgents.size === agents.length) {
                    const orderedAgents = this.orderById(Array.from(updatedAgents), agents);
                    callback(orderedAgents);
                }
            }
            agents.forEach((agent: IAgent) => {
                if (agent.id && agent.type) {
                    this.getAgentData(agent.id, agent.type, (data: {
                        models: Array<IModelConfig>,
                        skills: Array<ISkill>,
                        linkedAgents?: Array<IAgent>
                    }) => {
                        addUpdatedAgent({
                            ...agent,
                            ...data
                        });
                    });
                }
            });
        }, this._error);
    }

    // Gets models, skills and linked agents for an agent and returns them
    public getAgentData(id: number, agentType: string, callback: Function) {
        this.getAgentModels(id, (models) => {
            this.getAgentSkills(id, (skills) => {
                if (agentType === "groupchat") {
                    this.getLinkedAgents(id, (linkedAgents) => {
                        let updatedAgents: Set<IAgent> = new Set();
                        const addUpdatedLink = (agent: IAgent) => {
                            updatedAgents.add(agent);
                            if (updatedAgents.size === linkedAgents.length) {
                                const orderedLinks = this.orderById(Array.from(updatedAgents), linkedAgents);
                                callback(orderedLinks);
                            }
                        }
                        linkedAgents.forEach((agent: IAgent) => {
                            if (agent.id && agent.type) {
                                this.getAgentData(agent.id, agent.type, (agentData: IAgent) => {
                                    addUpdatedLink(agentData);
                                });
                            }
                        });
                    });
                }
                else {
                    callback({
                        models,
                        skills
                    });
                }
            });
        })
    }

    // Adds or updates a new or existing agent
    public setAgent(agent: IAgent, callback: (data: any) => void) {
        let error_msg = "";
        if (!agent.id || agent.id < 1) {
            error_msg += ` Invalid agent id: ${agent.id}; `;
        }
        if (agent.type !==  "assistant" && agent.type !== "userproxy" && agent.type !== "groupchat") {
            error_msg += ` Invalid agent type: ${agent.type}; `;
        }
        if (error_msg !== "") {
            const error = {
                message: error_msg,
                status: false
            }
            this._error(error);
            callback(error);
            return;
        }
        const url = `${this.serverUrl}/agents`;
        const headers = this.POST_HEADERS;
        headers.body = JSON.stringify(agent);

        fetchJSON(url, headers, (data) => {
            callback(data.data);
            this._success(data);
        }, this._error);
    }

    // Removes an agent from the DB by ID
    public deleteAgent(id: number, callback: (data: IAgent[]) => void) {
        if (id) {
            const url = `${this.serverUrl}/agents/delete?agent_id=${id}&user_id=${this.user?.email || ""}`;
            const headers = this.DELETE_HEADERS;

            fetchJSON(url, headers, (data: IStatus) => {
                callback(data.data);
                this._success(data);
            }, this._error);
        }
    }

    /* ================ GROUPCHAT AGENTS ================ */

    // Gets agents linked to a paticular agent id
    public getLinkedAgents(agentId: number, callback: (data: any) => void) {
        const url = `${this.serverUrl}/agents/link/agent/${agentId}`;
        const headers = this.GET_HEADERS;
        fetchJSON(url, headers, (data) => {
            const groupAgents = data.data.map((agent: IAgent & {
                groupAgent?: boolean
            }) => {
                agent.groupAgent = true;
                return agent;
            });
            callback(groupAgents);
        }, this._error);
    }

    // Links an agent to a group agent
    public linkAgent(agentId: number, linkedAgent: number, callback: (data: any) => void) {
        const url = `${this.serverUrl}/agents/link/agent/${agentId}/${linkedAgent}`;
        const headers = this.POST_HEADERS;
        fetchJSON(url, headers, (data) => {
            callback(data.data);
            this._success(data);
        }, this._error);
    }

    // Unlinks an agent from a group agent
    public unlinkAgent(agentId: number, linkedAgent: number, callback: () => void) {
        const url = `${this.serverUrl}/agents/link/agent/${agentId}/${linkedAgent}`;
        const headers = this.DELETE_HEADERS;
        fetchJSON(url, headers, (data) => {
            callback();
            this._success(data);
        }, this._error);
    }

    /* ================ AGENT MODELS ================ */

    // Gets models linked to an agent
    public getAgentModels (agent_id: number, callback: (data: IModelConfig[]) => void) {
        const url = `${this.serverUrl}/agents/link/model/${agent_id}`;
        fetchJSON(url, this.GET_HEADERS, (data) => callback(data.data), () => {});
    }

    // Links a model to an agent
    public linkAgentModel(agentId: number, modelId: number, callback: (data: any) => void) {
        const url = `${this.serverUrl}/agents/link/model/${agentId}/${modelId}`;
        const headers = this.POST_HEADERS;
        fetchJSON(url, headers, (data) => {
            callback(data.data);
            this._success(data);
        }, this._error);
    }

    // Unlinks a model to an agent
    public unLinkAgentModel(agentId: number, modelId: number, callback: (data: any) => void) {
        const url = `${this.serverUrl}/agents/link/model/${agentId}/${modelId}`;
        const headers = this.DELETE_HEADERS;
        fetchJSON(url, headers, (data) => {
            callback(data.data);
            this._success(data);
        }, this._error);
    }

    /* ================ AGENT SKILLS ================ */

    // Gets skill linked to an agent
    public getAgentSkills (agent_id: number, callback: (data: ISkill[]) => void) {
        const url = `${this.serverUrl}/agents/link/skill/${agent_id}`;
        fetchJSON(url, this.GET_HEADERS, (data) => callback(data.data), () => {});
    }
    
    // Links a skill to an agent
    public linkAgentSkill(agentId: number, skillId: number, callback: (data: any) => void) {
        const url = `${this.serverUrl}/agents/link/skill/${agentId}/${skillId}`;
        const headers = this.POST_HEADERS;
        fetchJSON(url, headers, (data) => {
            callback(data.data);
            this._success(data);
        }, this._error);
    }

    // Unlinks a skill to an agent
    public unLinkAgentSkill(agentId: number, skillId: number, callback: (data: any) => void) {
        const url = `${this.serverUrl}/agents/link/skill/${agentId}/${skillId}`;
        const headers = this.DELETE_HEADERS;
        fetchJSON(url, headers, (data) => {
            callback(data.data);
            this._success(data);
        }, this._error);
    }
    
    /* ================ WORKFLOWS ================ */

    // Gets all workflows and their associated agents
    public getWorkflows(callback: (data: any) => void) {
        const url = `${this.serverUrl}/workflows?user_id=${this.user?.email}`;
        const headers = this.GET_HEADERS;
        fetchJSON(url, headers, (data) => {
            const workflows = data.data as Array<IWorkflow & {
                sender: IAgent,
                receiver: IAgent
            }>;
            const workflowCount = workflows.length;
            const linkedWorkflows: any[] = [];
            while(workflows.length > 0) {
                const workflow = workflows.pop();
                if (workflow && workflow.id) {
                    this.getWorkflowLinks(workflow.id, (sender: IAgent, receiver: IAgent) => {
                        linkedWorkflows.push({
                            ...workflow,
                            sender,
                            receiver
                        });
                        if (linkedWorkflows.length === workflowCount) {
                            callback(linkedWorkflows);
                        }                    
                    })
                }
            }
        }, this._error);
    }

    // Adds or updates a new or existing workflow
    public setWorkflow(workflow: IWorkflow, callback: (data: any) => void) {
        const url = `${this.serverUrl}/workflows?user_id=${this.user?.email || ""}`;
        const headers = this.POST_HEADERS;
        headers.body = JSON.stringify(workflow);

        fetchJSON(url, headers, (data) => {
            callback(data.data);
            this._success(data);
        }, this._error);
    };

    // Deletes a workflow from the DB
    public deleteWorkflow(id: number, callback: (workflows: IWorkflow[]) => void) {
        const url = `${this.serverUrl}/workflows/delete?workflow_id=${id}&user_id=${this.user?.email || ""}`;
        const headers = this.DELETE_HEADERS;

        fetchJSON(url, headers, (data: IStatus) => {
            callback(data.data);
            this._success(data);
        }, this._error);
    }

    /* ================ WORKFLOW AGENTS ================ */

    // Gets a workflow link path based on workflow id, type and agent id
    public getLinkPath (workflow_id: number, type: "sender" | "receiver", agent_id?: number) {
        return `${this.serverUrl}/workflows/link/agent/${workflow_id}/${agent_id ? agent_id + "/" : ""}${type}`;
    }

    // Helper function to load a worklfows sender or receiver
    private loadLink (id: number, type: "sender" | "receiver", callback: Function) {
        const url = this.getLinkPath(id, type);
        const target = `_${type}`;

        fetchJSON(url, this.GET_HEADERS, (data) => {
            const items = data.data;
            const item = items.length > 0 ? items[0] : null;
            callback(item);
        }, (error) => {
            error.message += `; id: ${id}; type: ${type}`
            this._error(error);
        });
    }
    
    // Gets agents linked to a workflow
    public getWorkflowLinks (id: number, callback: Function,) {
        this.loadLink(id, "sender", (sender: IAgent) => {
            this.loadLink(id, "receiver", (receiver: IAgent) => {
                callback(sender, receiver);
            });
        });
    }

    // Links workflows to either a sender or receiver agent
    public linkWorkflow (workflow_id: number, type: "sender" |  "receiver", agent_id: number, callback?: (status: IStatus) => void) {
        const url = `${this.serverUrl}/workflows/link/agent/${workflow_id}/${agent_id}/${type}`;
        fetchJSON(url, this.POST_HEADERS, (data) => {
            if (callback) callback(data);
            this._success(data);
        }, this._error);
    }

    // Unlinks workflows from either a sender or receiver agent
    public unlinkWorkflow (workflow_id: number, type: "sender" | "receiver", agent_id?: number, callback?: (status: IStatus) => void) {
        if (agent_id === undefined) {
            this.getWorkflowLinks(workflow_id, (sender: IAgent, receiver: IAgent) => {
                this.unlinkWorkflow(workflow_id, type, type === "sender" ? sender.id : receiver.id, () => {});
            });
        }
        else {
            const url = this.getLinkPath(workflow_id, type, agent_id)
            fetchJSON(url, this.DELETE_HEADERS, (data) => {
                if (callback) callback(data);
                this._success(data);
            }, () => {});
        }
    }
}

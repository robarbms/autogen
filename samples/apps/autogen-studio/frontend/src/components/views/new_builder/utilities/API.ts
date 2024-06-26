import { useContext } from "react";
import { IAgent, IChatSession, IStatus, IWorkflow, IModelConfig, ISkill } from "../../../types";
import { useConfigStore } from "../../../../hooks/store";
import { appContext, IUser } from "../../../../hooks/provider";
import { fetchJSON, getServerUrl } from "../../../utils";
import { message } from "antd";

// Class for handling and caching api calls
export class API {
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

    // Local copies of agents and workflows.
    // They might be empty, so flagging if they have been fetched.
    private _agents: IAgent[] = [];
    private loadedAgents: boolean = false;
    private _workflows: IWorkflow[] = [];
    private loadedWorkflows: boolean = false;
    private _models: IModelConfig[] = [];
    private loadedModels: boolean = false;
    private _skills: ISkill[] = [];
    private loadedSkills: boolean = false;
    private _sender = null;
    private loadedSender = false;
    private _receiver = null;
    private loadedReceiver = false;

    // User and serverUrl used for api calls
    public user: IUser | null;
    public serverUrl: string;

    constructor() {
        // Getting the user and server URL for api calls
        const context = useContext(appContext);
        this.user = context.user;
        this.serverUrl = getServerUrl();
    }

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

    public timestamp () {
        return new Date().toISOString();
    }
    
    // URL path to api for agents and workflows
    public getPath (type: "agents" | "workflows" | "models" | "skills") {
        return `${this.serverUrl}/${type}?user_id=${this.user?.email}`
    }

    public getLinkPath (workflow_id: number, type: "sender" | "receiver", agent_id?: number) {
        return `${this.serverUrl}/workflows/link/agent/${workflow_id}/${agent_id ? agent_id + "/" : ""}${type}`;
    }

    // Sorts a list of items by the oldest created to newest
    private sortByDate (items: Array<any>) {
        if (items.length > 0 && items[0] && "created_at" in items[0]) {
            items = items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }
        return items;
    }

    // Method used for getting agents and workflows and passing them to a callback.
    // Refresh forces another call rather than calling from cache
    public getItems (type: "agents" | "workflows" | "models" | "skills", action: Function, refresh: Boolean = false) {
        const config = {
            "agents": {
                loaded: "loadedAgents",
                target: "_agents"
            },
            "workflows": {
                loaded: "loadedWorkflows",
                target: "_workflows"
            },
            "models": {
                loaded: "loadedModels",
                target: "_models"
            },
            "skills": {
                loaded: "loadedSkills",
                target: "_skills"
            }
        }[type];
        // If not forcing refresh, check cached copies first
        if (!refresh && (this as any)[config.loaded]) {
            action((this as any)[config.target]);
            return;
        }

        // Start loading callback and reset errors
        this._loading(true);
        this._error({
            message: "All good",
            status: true
        });
        fetchJSON(this.getPath(type), this.GET_HEADERS, (data) => {
            let items = data.data;
            items = this.sortByDate(items);
            (this as any)[config.target] = items;
            (this as any)[config.loaded] = true;

            action(items);
            this._loading(false);
        }, (error) => {
            this._error(error);
            this._loading(false);
        });
    }

    // Loads the linked item then returns it to the action
    public loadLink (id: number, type: "sender" | "receiver", action: Function) {
        const url = this.getLinkPath(id, type);
        const target = `_${type}`;

        fetchJSON(url, this.GET_HEADERS, (data) => {
            const items = data.data;
            const item = items.length > 0 ? items[0] : null;
            action(item);
        }, (error) => {
            error.message += ` id: ${id}; type: ${type}`
            this._error(error);
        });
    }
    
    // Gets agents linked to a workflow
    public getWorkflowLinks (id: number, action: Function, refresh: Boolean = false) {
        // If refreshing, reload workflows and agents
        // After refreshing, call back into getWorkflowLinks without a refresh
        if (refresh) {
            this.getItems("agents", () => {
                this.getItems("workflows", () => {
                    this.getWorkflowLinks(id, action, false);
                }, true);
            }, true)
        }
        else {
            this.loadLink(id, "sender", (sender: IAgent) => {
                this.loadLink(id, "receiver", (receiver: IAgent) => {
                    action(sender, receiver);
                });
            });
        }
    }

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
                            this._workflows === linkedWorkflows;
                            callback(linkedWorkflows);
                        }                    
                    })
                }
            }
        }, this._error);
    }

    // Adds a new workflow
    public addWorkflow(workflow: IWorkflow, callback: (data: any) => void) {
        const url = `${this.serverUrl}/workflows?user_id=${this.user?.email || ""}`;
        const headers = this.POST_HEADERS;
        headers.body = JSON.stringify(workflow);

        fetchJSON(url, headers, (data) => {
            callback(data.data);
        }, this._error);
    };

    // Deletes a workflow from the DB
    public deleteWorkflow(id: number, callback: (workflows: IWorkflow[]) => void) {
        const url = `${this.serverUrl}/workflows/delete?workflow_id=${id}&user_id=${this.user?.email || ""}`;
        const headers = this.DELETE_HEADERS;

        fetchJSON(url, headers, (data: IWorkflow[]) => {
            const updatedWorkflows = this._workflows.filter(workflow => workflow.id !== id);
            const sortedWorkflows = this.sortByDate(updatedWorkflows);
            this._workflows = sortedWorkflows;
            callback(sortedWorkflows);
        }, this._error);
    }

    // Links workflows to either a sender or receiver agent
    public linkWorkflow (workflow_id: number, type: "sender" |  "receiver", agent_id: number) {
        const url = `${this.serverUrl}/workflows/link/agent/${workflow_id}/${agent_id}/${type}`;
        fetchJSON(url, this.POST_HEADERS, (data) => {}, this._error);
    }

    // Unlinks workflows from either a sender or receiver agent
    public unlinkWorkflow (workflow_id: number, type: "sender" | "receiver", agent_id?: number) {
        if (agent_id === undefined) {
            this.getWorkflowLinks(workflow_id, (sender: IAgent, receiver: IAgent) => {
                this.unlinkWorkflow(workflow_id, type, type === "sender" ? sender.id : receiver.id);
            });
        }
        else {
            const url = this.getLinkPath(workflow_id, type, agent_id)
            fetchJSON(url, this.DELETE_HEADERS, (data) => {}, () => {});
        }
    }

    // Gets agents and their linked models and skills
    public getAgents (callback: Function) {
        this.getItems("agents", (agents: IAgent[]) => {
            const {length} = agents;
            let updatedAgents: IAgent[] = [];
            const addAgent = (agent: IAgent) => {
                updatedAgents.push(agent);
                if (updatedAgents.length === length) {
                    updatedAgents = this.sortByDate(updatedAgents);
                    this._agents = updatedAgents;
                    callback(updatedAgents);
                }
            }
            while (agents.length > 0) {
                const agent: IAgent | undefined = agents.pop();
                if (agent !== undefined && agent.id && agent.type) {
                    this.getAgentData(agent.id, agent.type, (data: {
                        models: Array<IModelConfig>,
                        skills: Array<ISkill>,
                        linkedAgents?: Array<IAgent>
                    }) => {
                        const agentWithData = Object.assign({}, agent, data);
                        addAgent(agentWithData);
                    });
                }
            }
        }, true);
    }

    // Gets models, skills and linked agents for an agent and returns them
    public getAgentData(id: number, agentType: string, callback: Function) {
        this.getAgentModels(id, (models) => {
            this.getAgentSkills(id, (skills) => {
                models = this.sortByDate(models);
                skills = this.sortByDate(skills);
                if (agentType === "groupchat") {
                    this.getLinkedAgents(id, (linkedAgents) => {
                        const {length} = linkedAgents;
                        const order = linkedAgents.map(({id}: {id: number}) => id);
                        let updatedAgents: Array<IAgent> = [];
                        while(linkedAgents && linkedAgents.length > 0) {
                            const agent = linkedAgents.pop();
                            if (agent) {
                                this.getAgentData(agent.id, agent.type, (agentData: IAgent) => {
                                    const updatedAgent = Object.assign({}, agent, agentData);
                                    updatedAgents.push(updatedAgent);
                                    if (updatedAgents.length === length) {
                                        // Sort agents so they are in the same order as returned by the DB
                                        const sortedAgents = new Array(length).fill(null).map((_, idx) => {
                                            const id = order[idx];
                                            return updatedAgents.find(agent => agent.id === id);
                                        })
                                        callback({
                                            models,
                                            skills,
                                            linkedAgents: sortedAgents || []
                                        });
                                    }
                                });
                            }
                        }
                        callback({
                            models,
                            skills,
                            linkedAgents: updatedAgents
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

    // Inserts a new agent
    public addAgent(agent: IAgent, callback: (data: any) => void) {
        let error_msg = "";
        if (!agent.id || agent.id < 1) {
            error_msg += ` Invalid agent id: ${agent.id}; `;
        }
        if (agent.type !==  "assistant" && agent.type !== "userproxy" && agent.type !== "groupchat") {
            error_msg += ` Invalid agent type: ${agent.type}; `;
        }
        if (error_msg !== "") {
            callback({
                message: error_msg,
                status: false
            });
            return;
        }
        const url = `${this.serverUrl}/agents`;
        const headers = this.POST_HEADERS;
        headers.body = JSON.stringify(agent);

        fetchJSON(url, headers, (data) => {
            callback(data.data);
        }, this._error);
    }

    // Removes an agent from the DB by ID
    public deleteAgent(id: number, callback: (data: IAgent[]) => void) {
        if (id) {
            const url = `${this.serverUrl}/agents/delete?agent_id=${id}&user_id=${this.user?.email || ""}`;
            const headers = this.DELETE_HEADERS;

            fetchJSON(url, headers, (data: IAgent[]) => {
                this._agents = this._agents.filter((agent: IAgent) => agent.id !== id);
                callback(this._agents);
            }, this._error);
        }
    }

    // Creates a new skill
    public addSkill (skill: ISkill, callback: Function) {
        // Load all skills in DB
        this.getItems("skills", (skills: ISkill[]) => {
            const { name, content, description } = skill;
            let { id } = skill;
            const url = this.getPath("skills");

            //check if there is an id and it exists in the data base
            if (!id) {
                // Get highest id and create a new one 1 larger
                const max = Math.max(...skills.map((skill: ISkill) => skill.id || -1));
                id = max + 1;
            }

            const headers = this.POST_HEADERS;
            const timestamp = this.timestamp();
            const body = {
                "id": id,
                "created_at": timestamp,
                "updated_at": timestamp,
                "user_id": this.user?.email,
                "name": name,
                "content": content,
                "description": description
            };

            headers.body = JSON.stringify(body);

            fetchJSON(url, headers, (data) => {
                const newSkills = skills.concat([data.data]);
                callback(newSkills);
                }, this._error)
        }, true);
    }

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
        }, this._error);
    }

    // Unlinks an agent from a group agent
    public unlinkAgent(agentId: number, linkedAgent: number, callback: () => void) {
        const url = `${this.serverUrl}/agents/link/agent/${agentId}/${linkedAgent}`;
        const headers = this.DELETE_HEADERS;
        fetchJSON(url, headers, () => {
            callback();
        }, this._error);
    }

    // Links a model to an agent
    public linkAgentModel(agentId: number, modelId: number, callback: (data: any) => void) {
        const url = `${this.serverUrl}/agents/link/model/${agentId}/${modelId}`;
        const headers = this.POST_HEADERS;
        fetchJSON(url, headers, (data) => {
            callback(data.data);
        }, this._error);
    }

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
        }, this._error);
    }

    // Gets models linked to an agent
    public getAgentModels (agent_id: number, callback: (data: IModelConfig[]) => void) {
        const url = `${this.serverUrl}/agents/link/model/${agent_id}`;
        fetchJSON(url, this.GET_HEADERS, (data) => callback(data.data), () => {});
    }

    // Links a model to an agent
    public unLinkAgentModel(agentId: number, modelId: number, callback: (data: any) => void) {
        const url = `${this.serverUrl}/agents/link/model/${agentId}/${modelId}`;
        const headers = this.DELETE_HEADERS;
        fetchJSON(url, headers, (data) => {
            callback(data.data);
        }, this._error);
    }

    // Links a skill to an agent
    public unLinkAgentSkill(agentId: number, skillId: number, callback: (data: any) => void) {
        const url = `${this.serverUrl}/agents/link/skill/${agentId}/${skillId}`;
        const headers = this.DELETE_HEADERS;
        fetchJSON(url, headers, (data) => {
            callback(data.data);
        }, this._error);
    }

    // Test a model
    public testModel(model: IModelConfig, callback: (data: any) => void) {
        const url = `${this.serverUrl}/models/test`;
        const headers = this.POST_HEADERS;
        headers.body = JSON.stringify(model);

        fetchJSON(url, headers, (data) => {
            callback(data);
        }, this._error);
    }

    public getModels(callback: (data: IModelConfig[]) => void, refresh: boolean = true) {
        if (refresh === false) {
            callback(this._models);
            return;
        }
        const url =`${this.serverUrl}/models?user_id=${this.user?.email || ""}`;
        const headers = this.GET_HEADERS;

        fetchJSON(url, headers, (data) => {
            const models = data.data;
            const sortedModels = this.sortByDate(models);
            this._models = sortedModels;
            callback(sortedModels);
        }, this._error);
    }

    // Adds a new model to the DB
    public setModel(model: IModelConfig, callback: (data: any) => void) {
        const url = `${this.serverUrl}/models`;
        const headers = this.POST_HEADERS;
        headers.body = JSON.stringify(model);

        fetchJSON(url, headers, (data) => {
            const updatedModels = [...this._models, model];
            const sortedModels = this.sortByDate(updatedModels);
            this._models = sortedModels;
            callback(data);
        }, this._error);
    }

    // Removes a model from the DB by ID
    public deleteModel(id: number, callback: (data: IModelConfig[]) => void) {
        if (id) {
            const url = `${this.serverUrl}/models/delete?model_id=${id}&user_id=${this.user?.email || ""}`;
            const headers = this.DELETE_HEADERS;
    
            fetchJSON(url, headers, (data: IModelConfig[]) => {
                // remove from local models and return them
                const updatedModels = this._models.filter(model => model.id !== id);
                callback(updatedModels);
                this._models = updatedModels;
            }, this._error);
        }
    }

    // Adds a new skill to the DB
    public setSkill(skill: ISkill, callback: (data: any) => void) {
        // Find all agents with the skill and unlink them
        const url = `${this.serverUrl}/skills`;
        const headers = this.POST_HEADERS;
        headers.body = JSON.stringify(skill);

        fetchJSON(url, headers, (data) => {
            callback(data);
        }, this._error);
    }
    
    // Removes a skill from the DB by ID
    public deleteSkill(id: number, callback: (data: ISkill[]) => void) {
        if (id) {
            const url = `${this.serverUrl}/skills/delete?skill_id=${id}&user_id=${this.user?.email || ""}`;
            const headers = this.DELETE_HEADERS;
    
            fetchJSON(url, headers, (data: ISkill[]) => {
                // remove from local skills and return them
                this._skills = this._skills.filter(skill => skill.id !== id);
                callback(this._skills);
            }, this._error);
        }
    }
}

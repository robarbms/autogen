import { useContext } from "react";
import { IAgent, IChatSession, IStatus, IWorkflow, IModelConfig, ISkill } from "../../types";
import { useConfigStore } from "../../../hooks/store";
import { appContext, IUser } from "../../../hooks/provider";
import { fetchJSON, getServerUrl } from "../../utils";
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
    private loadedAgents: Boolean = false;
    private _workflows: IWorkflow[] = [];
    private loadedWorkflows: Boolean = false;
    private _models: IModelConfig[] = [];
    private loadedModels: Boolean = false;
    private _skills: ISkill[] = [];
    private loadedSkills: Boolean = false;
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
        if (!refresh && this[config.loaded]) {
            action(this[config.target]);
            return;
        }

        // Start loading callback and reset errors
        this._loading(true);
        this._error({
            message: "All good",
            status: true
        });
        fetchJSON(this.getPath(type), this.GET_HEADERS, (data) => {
            const items = data.data;
            this[config.target] = items;
            this[config.loaded] = true;

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
            this._error(error);
        });
    }
    
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
                })
            })
        }
    }

    // Links workflows to either a sender or receiver agent
    public linkWorkflow (workflow_id: number, type: "sender" |  "receiver", agent_id: number) {
        const url = this.getLinkPath(workflow_id, type, agent_id);
        fetchJSON(url, this.POST_HEADERS, (data) => {}, () => {});
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

    // Gets models associated with an agent
    public getAgentModels (agent_id: number, callback: (data: IModelConfig[]) => void) {
        const url = `${this.serverUrl}/agents/link/model/${agent_id}`;
        fetchJSON(url, this.GET_HEADERS, (data) => callback(data.data), () => {});
    }

    // Gets skill associated with an agent
    public getAgentSkills (agent_id: number, callback: (data: ISkill[]) => void) {
        const url = `${this.serverUrl}/agents/link/skill/${agent_id}`;
        fetchJSON(url, this.GET_HEADERS, (data) => callback(data.data), () => {});
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

            console.log({id, skills, skill});

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

    // Creates a new model in the database
    public addModel (model: IModelConfig, callback: Function) {

    }

    // Creates a new agent in the database
    public addAgent(model: IAgent, callback: Function) {

    }
}

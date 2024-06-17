import React, { useEffect, useState, MouseEvent } from "react";
import { WorkflowIcon, AgentIcon, ModelIcon, SkillIcon } from "./Icons";
import { dataToWorkItem, IWorkItem } from "./utils";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../types";
import { Segmented } from "antd";
import { IBuildState, useBuildStore } from "../../../hooks/buildStore";
import { useNavigationStore } from "../../../hooks/navigationStore";
import { ArrowDownTrayIcon, DocumentDuplicateIcon, TrashIcon } from "@heroicons/react/24/solid";
import { API } from "./API";
import { sanitizeConfig } from "../../utils";

/**
 * Rendering of a work item row (agent, model, skill or workflow)
 * @param props 
 * @returns 
 */
const RecentRow = (props: IWorkItem & {
    setEditScreen: Function,
    setEditId: Function,
    setWorkflowId: Function,
    api: API
}) => {
    const {category, id, name, description, type, time, edit, setEditScreen, setEditId, setWorkflowId, api} = props;
    const { workflows, setWorkflows, agents, setAgents, skills, setSkills, models, setModels } = useBuildStore(({workflows, setWorkflows, agents, setAgents, skills, setSkills, models, setModels}) => ({workflows, setWorkflows, agents, setAgents, skills, setSkills, models, setModels}));
    let click = () => {
        if (category === "workflow") {
            setWorkflowId(id);
            setEditScreen(null);
            setEditId(null);
        }
        else {
            setEditScreen(category);
            setEditId(id);
        }
    }

    const icons: {[key: string]: React.JSX.Element} = {
        "agent": <AgentIcon />,
        "workflow": <WorkflowIcon />,
        "model": <ModelIcon />,
        "skill": <SkillIcon />
    }

    const downloadWork = (event: MouseEvent) => {
        event.stopPropagation();
        // find the data to download
        let data;
        switch(category) {
            case "workflow":
                data = workflows.find(wf => wf.id === id);
                break;
            case "agent":
                data = agents.find(agent => agent.id === id);
                break;
            case "model":
                data = models.find(model => model.id === id);
                break;
            case "skill":
                data = skills.find(skill => skill.id === id);
        }
        if (data) {
            const element = document.createElement("a");
            const sanitizedWork = sanitizeConfig(data);
            const file = new Blob([JSON.stringify(sanitizedWork)], {
                type: "application/json",
            });
            element.href = URL.createObjectURL(file);
            // downloads the file as it's category and name. Example: workflow-Default_Agent_Workflow.json, agent-userproxy.json
            element.download = `${category}-${name.replace(/ /g, "_")}.json`;
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
        }
    }

    const copyWork = (event: MouseEvent) => {
        const copy = (value: any) => JSON.parse(JSON.stringify(value));
        event.stopPropagation();
        const now = () => new Date().toISOString();
        switch (category) {
            case "workflow":
                const workflowData = workflows.find(workflow => workflow.id === id);
                if (workflowData) {
                    const workflowCopy = copy({
                        ...workflowData,
                        name: `${workflowData.name}_copy`,
                        created_at: now(),
                        updated_at: now()
                    })
                    delete workflowCopy.sender;
                    delete workflowCopy.receiver;
                    delete workflowCopy.id;
                    api.addWorkflow(workflowCopy, (workflow) => {
                        // link the workflow if they exist
                        if (workflowData.sender) {
                            api.linkWorkflow(workflow.id, "sender", workflowData.sender.id || 0);
                            workflow.sender = copy(workflowData.sender); 
                        }
                        if (workflowData.receiver) {
                            api.linkWorkflow(workflow.id, "receiver", workflowData.receiver.id || 0);
                            workflow.receiver = copy(workflowData.receiver);
                        }
                        setWorkflows([
                            ...workflows,
                            workflow
                        ]);
                        setWorkflowId(workflow.id);
                    })
                }
                break;
            case "agent":
                const agentData = agents.find(agent => agent.id === id) as IAgent & { models: IModelConfig[], skills: ISkill[], linkedAgents?: IAgent[]};
                const maxId = agents && agents.length > 0 ? Math.max(...agents.map(agent => agent.id || 0)) : 0;
                if (agentData && agentData.id) {
                    const agentCopy = copy({
                        ...agentData,
                        id: maxId + 1,
                        config: {
                            ...agentData.config,
                            name: `${agentData.config.name}_copy`
                        }
                    });
                    delete agentCopy.models;
                    delete agentCopy.skills;

                    api.addAgent(agentCopy, (data) => {
                        // link models
                        agentData.models.forEach(model => api.linkAgentModel(data.id, model.id || 0, () =>{}));
                        agentData.skills.forEach(skill => api.linkAgentSkill(data.id, skill.id || 0, () => {}));
                        if (agentData.type === "groupchat" && agentData.linkedAgents) {
                            // duplicate group chat links
                            agentData.linkedAgents.forEach(agent => {
                                api.linkAgent(data.id, agent.id || 0, () => {});
                            });
                            data.linkedAgents = copy(agentData.linkedAgents);
                        }
                        data.models = copy(agentData.models);
                        data.skills = copy(agentData.skills);
                        setAgents([
                            ...agents,
                            data
                        ]);
                        setEditId(data.id);
                        setEditScreen("agent");
                    });
                }
                break;
            case "model":
                const modelData = models.find(model => model.id === id);
                if (modelData) {
                    // create a copy of this model
                    const modelCopy = copy({
                        ...modelData,
                        model: `${modelData.model}_copy`,
                        created_at: now(),
                        updated_at: now()
                    });
                    delete modelCopy.id;

                    api.setModel(modelCopy, (data) => {
                        setModels([
                            ...models,
                            data.data
                        ]);
                        setEditId(data.data.id);
                        setEditScreen("model");
                    })
                }
                break;
            case "skill":
                const skillData = skills.find(skill => skill.id === id);
                if (skillData) {
                    // create a copy of this skill
                    const skillCopy = copy({
                        ...skillData,
                        name: `${skillData.name}_copy`,
                        created_at: now(),
                        updated_at: now()
                    });
                    delete skillCopy.id;

                    api.addSkill(skillCopy, ((updatedSkills: ISkill[]) => {
                        setSkills(updatedSkills);
                        const newSkill = updatedSkills[updatedSkills.length - 1];
                        setEditId(newSkill.id);
                        setEditScreen("skill");
                    }));
                }
                
                break;
        }
    }

    const deleteWork = (event: MouseEvent) => {
        event.stopPropagation();
        switch (category) {
            case "workflow":
                api.deleteWorkflow(id, (data: IWorkflow[]) => {
                    setWorkflows(workflows.filter(workflow => workflow.id !== id));
                });
                break;
            case "agent":
                api.deleteAgent(id, (data: IAgent[]) => {
                    setAgents(agents.filter(agent => agent.id !== id));
                });
                break;
            case "model":
                api.deleteModel(id, (data: IModelConfig[]) => {
                    setModels(models.filter(model => model.id !== id));
                    api.getAgents(setAgents);
                });
                break;
            case "skill":
                api.deleteSkill(id, (data: ISkill[]) => {
                    setSkills(skills.filter(skill => skill.id !== id));
                    api.getAgents(setAgents);
                });
                break;
        }
    }

    
    return (
        <tr onClick={click}>
            <td>{icons[category]} {name}</td>
            <td>{description}</td>
            <td>{type}</td>
            <td>{time}</td>
            <td>
                <div className="action download" onClick={downloadWork} title="Download">
                    <ArrowDownTrayIcon />
                </div>
                <div className="action copy" onClick={copyWork} title="Copy">
                    <DocumentDuplicateIcon />
                </div>
                <div className="action delete" onClick={deleteWork} title="Delete">
                    <TrashIcon />
                </div>
            </td>
        </tr>
    )
}

// Properties for the RecentWork component
type RecentWorkProps = {
    api: API;
}

/**
 * Rendering for the recent work (agents, models, skills and workflows)
 * @param props 
 * @returns 
 */
const RecentWork = (props: RecentWorkProps) => {
    const [work, setWork] = useState<IWorkItem[]>([]);
    const [filter, setFilter] = useState<String>("All");
    const { agents, models, setEditScreen, setEditId, skills, workflows, setWorkflowId } = useBuildStore((state: IBuildState) => ({
        agents: state.agents,
        models: state.models,
        setEditScreen: state.setEditScreen,
        setEditId: state.setEditId,
        skills: state.skills,
        workflows: state.workflows,
        setWorkflowId: state.setWorkflowId
    }));
    const userObj = useNavigationStore(state => state.user);
    const user = userObj?.email || "Unknown";

    const filterOptions = [
        {
            label: (
                <div className="filter-label">
                    All
                </div>
            ),
            value: "All"
        },
        {
            label: (
                <div className="filter-label">
                    <WorkflowIcon />
                    Workflows
                </div>
            ),
            value: "Workflows"
        },
        {
            label: (
                <div className="filter-label">
                    <AgentIcon />
                    Agents
                </div>
            ),
            value: "Agents"
        },
        {
            label: (
                <div className="filter-label">
                    <ModelIcon />
                    Models
                </div>
            ),
            value: "Models"
        },
        {
            label: (
                <div className="filter-label">
                    <SkillIcon />
                    Skills
                </div>
            ),
            value: "Skills"
        },
    ]

    // Load work items as common data as they are returned
    useEffect(() => {
        const dataForUser: (work: IAgent | IModelConfig | ISkill | IWorkflow) => IWorkItem = dataToWorkItem.bind(null, user);
        let workItms: IWorkItem[] = ["Agents", "Models", "Skills", "Workflows"].reduce((itms: IWorkItem[], label: string) => {
            if (filter === "All" || filter === label) {
                let target = null;
                switch (label){
                    case "Agents":
                       target = agents as IAgent[];
                       break;
                    case "Models":
                        target = models as IModelConfig[];
                        break;
                    case "Skills":
                        target = skills as ISkill[];
                        break;
                    case "Workflows":
                        target = workflows as IWorkflow[];
                    break;
                }

                if (target) {
                    itms = [...itms, ...target.map(dataForUser)];
                }
            }
            return itms;
        }, []);
        workItms = workItms.sort((a, b) => b.sortTime - a.sortTime);
        setWork(workItms);
    }, [agents, models, skills, workflows, user, filter]);

    return (
        <div className="recent-work">
            <h2>Recent</h2>
            <Segmented
                options={filterOptions}
                onChange={setFilter}
            />
            <div className="recent-work-scroll scroll overflow-y-scroll overflow-hidden">
                <table>
                    <thead>
                        <tr>
                            <th>Work</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Updated at</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {work &&
                            work.map((item, idx) => <RecentRow api={props.api} setEditScreen={setEditScreen} setEditId={setEditId} setWorkflowId={setWorkflowId} key={idx} {...item} />)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RecentWork;
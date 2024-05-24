import React, { useEffect, useState } from "react";
import { WorkflowIcon, AgentIcon, ModelIcon, SkillIcon } from "./Icons";
import { dataToWorkItem, IWorkItem } from "./utils";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../types";
import { Segmented } from "antd";

/**
 * Rendering of a work item row (agent, model, skill or workflow)
 * @param props 
 * @returns 
 */
const RecentRow = (props: IWorkItem & {
    openWorkflow: Function,
    handleEdit: (category: "agent" | "model" | "skill" | "workflow" | null, id: number) => void
}) => {
    const {category, openWorkflow, id, name, description, type, time, edit, handleEdit} = props;
    let click = () => {}

    if (category === "workflow") {
        click = () => openWorkflow(props.id);
    }
    else {
        click = () => handleEdit(category as "agent" | "model" | "skill", props.id);
    }

    const icons: {[key: string]: React.JSX.Element} = {
        "agent": <AgentIcon />,
        "workflow": <WorkflowIcon />,
        "model": <ModelIcon />,
        "skill": <SkillIcon />
    }

    return (
        <tr onClick={click}>
            <td>{icons[category]} {name}</td>
            <td>{description}</td>
            <td>{type}</td>
            <td>{time}</td>
            <td>{edit}</td>
        </tr>
    )
}

// Properties for the RecentWork component
type RecentWorkProps = {
    agents: IAgent[];
    models: IModelConfig[];
    openWorkflow: Function;
    skills: ISkill[];
    user: string;
    workflows: IWorkflow[];
    handleEdit: (category: "agent" | "model" | "skill" | "workflow" | null, id: number) => void;
}

/**
 * Rendering for the recent work (agents, models, skills and workflows)
 * @param props 
 * @returns 
 */
const RecentWork = (props: RecentWorkProps) => {
    const [work, setWork] = useState<IWorkItem[]>([]);
    const [filter, setFilter] = useState<String>("All");
    const { 
        agents,
        handleEdit,
        models,
        openWorkflow,
        skills,
        user,
        workflows
    }: {
        agents: IAgent[],
        handleEdit: (category: "agent" | "model" | "skill" | "workflow" | null, id: number) => void,
        models: IModelConfig[],
        openWorkflow: Function,
        skills: ISkill[],
        user: string,
        workflows: IWorkflow[]
    } = props;

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
        let workItms: IWorkItem[] = ["Agents", "Models", "Skills", "Workflows"].reduce((itms, label) => {
            if (filter === "All" || filter === label) {
                itms = itms.concat(props[label.toLowerCase()].map(dataForUser));
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
                    <tbody>
                        {work &&
                            work.map((item, idx) => <RecentRow handleEdit={handleEdit} openWorkflow={openWorkflow} key={idx} {...item} />)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RecentWork;
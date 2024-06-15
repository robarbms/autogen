import React, { useEffect, useState } from "react";
import { WorkflowIcon, AgentIcon, ModelIcon, SkillIcon } from "./Icons";
import { dataToWorkItem, IWorkItem } from "./utils";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../types";
import { Segmented } from "antd";
import { BuildSections, IBuildState, useBuildStore } from "../../../hooks/buildStore";
import { useNavigationStore } from "../../../hooks/navigationStore";

/**
 * Rendering of a work item row (agent, model, skill or workflow)
 * @param props 
 * @returns 
 */
const RecentRow = (props: IWorkItem & {
    setEditScreen: Function,
    setEditId: Function,
    setWorkflowId: Function
}) => {
    const {category, id, name, description, type, time, edit, setEditScreen, setEditId, setWorkflowId} = props;
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
                    <tbody>
                        {work &&
                            work.map((item, idx) => <RecentRow setEditScreen={setEditScreen} setEditId={setEditId} setWorkflowId={setWorkflowId} key={idx} {...item} />)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RecentWork;
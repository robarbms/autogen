import React from "react";
import RecentWork from "./RecentWork";
import { AgentIcon, ModelIcon, SkillIcon, WorkflowIcon } from "./Icons";
import { IAgent, IModelConfig,ISkill, IStatus, IWorkflow } from "../../types";

// Properties for the BuildTile component
type BuildTileProps = {
    action: () => void;
    category: "workflow" | "agent" | "model" | "skill";
    label: string;
}

/**
 * Renders a tile for creating new workflows, agents, models and skills
 * @param props 
 * @returns 
 */
const BuildTile = (props: BuildTileProps) => {
    const { action, category, label } = props;
    const Icon = {
        "agent": AgentIcon,
        "model": ModelIcon,
        "skill": SkillIcon,
        "workflow": WorkflowIcon
    }[category];

    return (
        <div className={`build-tile tile-${category}`} onClick={action}>
            <div className="build-tile-icon"><Icon /></div>
            <div className="build-tile-label">{label}</div>
        </div>
    )
}

// Properties for the Home component
type HomeProps = {
    agents: IAgent[];
    editMode: Function;
    models: IModelConfig[];
    openWorkflow: Function;
    skills: ISkill[];
    user: string;
    workflows: IWorkflow[];
    handleEdit: (category: "agent" | "model" | "skill" | "workflow" | null, id: number | null) => void;
}

/**
 * Renders the Welcome screen
 * @param props 
 * @returns 
 */
const Home = (props: HomeProps) => {
    const {
        agents,
        editMode,
        models,
        openWorkflow,
        skills,
        user,
        workflows,
        handleEdit
    } = props;

    return (
        <div className="build-home h-full">
            <div className="build-home-back"></div>
            <div className="build-home-const h-full">
            <h1>Welcome to AutoGen</h1>
                <div className="build-home-create">
                    <BuildTile category="workflow" label="Build workflow" action={handleEdit.bind(this, "workflow", null)} />
                    <BuildTile category="agent" label="Add Agents" action={handleEdit.bind(this, "agent", null)} />
                    <BuildTile category="model" label="Add Models" action={handleEdit.bind(this, "model", null)} />
                    <BuildTile category="skill" label="Add Skills" action={handleEdit.bind(this, "skill", null)} />
                </div>
                <RecentWork
                    openWorkflow={openWorkflow}
                    agents={agents}
                    models={models}
                    skills={skills}
                    workflows={workflows}
                    user={user}
                    handleEdit={handleEdit}
                />
            </div>
        </div>
    )
}

export default Home;

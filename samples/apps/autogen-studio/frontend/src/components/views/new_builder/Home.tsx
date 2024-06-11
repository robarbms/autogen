import React from "react";
import RecentWork from "./RecentWork";
import { AgentIcon, ModelIcon, SkillIcon, WorkflowIcon } from "./Icons";
import { IAgent, IModelConfig,ISkill, IStatus, IWorkflow } from "../../types";
import { BuildSections, IBuildState, useBuildStore } from "../../../hooks/buildStore";

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
    hasPreviousWork: boolean;
}

/**
 * Renders the Welcome screen
 * @param props 
 * @returns 
 */
const Home = (props: HomeProps) => {
    const { hasPreviousWork }: { showRecent: boolean} = props;
    const {setEditScreen, setEditId} = useBuildStore((state: IBuildState) => ({
        setEditScreen: state.setEditScreen,
        setEditId: state.setEditId,
    }));

    const editNew = (category: BuildSections) => {
        setEditScreen(category);
        setEditId(null);
    }

    return (
        <div className="build-home h-full">
            <div className="build-home-back"></div>
            <div className="build-home-const h-full">
            <h1>Welcome to AutoGen</h1>
                <div className="build-home-create">
                    <BuildTile category="workflow" label="Build workflow" action={editNew.bind(this, "workflow",)} />
                    <BuildTile category="agent" label="Add Agents" action={editNew.bind(this, "agent")} />
                    <BuildTile category="model" label="Add Models" action={editNew.bind(this, "model")} />
                    <BuildTile category="skill" label="Add Skills" action={editNew.bind(this, "skill")} />
                </div>
                {hasPreviousWork &&
                    <RecentWork />
                }
            </div>
        </div>
    )
}

export default Home;

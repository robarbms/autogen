import React, { createRef, useEffect, useRef, useState } from "react";
import RecentWork from "./RecentWork";
import { AgentIcon, ModelIcon, SkillIcon, WorkflowIcon } from "../utilities/Icons";
import { BuildSections, useBuildStore } from "../../../../hooks/buildStore";

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
}

/**
 * Renders the Welcome screen
 * @param props 
 * @returns 
 */
const Home = (props: HomeProps) => {
    const { setEditScreen, setEditId, workflows, agents, models, skills} = useBuildStore(({setEditScreen, setEditId, workflows, agents, models, skills}) => ({
        setEditScreen,
        setEditId,
        workflows,
        agents,
        models,
        skills
    }));
    const [ hasPreviousWork, setHasPreviousWork ] = useState(false);

    // Creates action handlers for editing a workflow, agent, model or skill
    const editNew = (category: BuildSections) => () => {
        setEditScreen(category);
        setEditId(null);
    }

    // If there are workflows, agents, models or skills, show recent work
    useEffect(() => {
        if (
            (workflows && workflows.length > 0) ||
            (agents && agents.length > 0) ||
            (models && models.length > 0) ||
            (skills && skills.length > 0)
          ) {
            setHasPreviousWork(true);
        }
        else {
        setHasPreviousWork(false);
        }
    }, [ workflows, agents, models, skills ]);

    return (
        <div className="build-home h-full">
            <div className="build-home-back"></div>
            <div className="build-home-const h-full">
                <div className="build-home-create">
                    <BuildTile category="workflow" label="Build Workflow" action={editNew("workflow")} />
                    <BuildTile category="agent" label="Add Agents" action={editNew("agent")} />
                    <BuildTile category="model" label="Add Models" action={editNew("model")} />
                    <BuildTile category="skill" label="Add Skills" action={editNew("skill")} />
                </div>
                {hasPreviousWork &&
                    <RecentWork />
                }
            </div>
        </div>
    )
}

export default Home;

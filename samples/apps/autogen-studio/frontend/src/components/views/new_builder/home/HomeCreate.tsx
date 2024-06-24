import React from "react";
import { AgentIcon, ModelIcon, SkillIcon } from "../utilities/Icons";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

// Properties for HomeCreate component
type HomeCreateProps = {
    editMode: (mode: "workflow" | "agent" | "model" | "skill") => void;
    handleEdit: (type: "workflow" | "agent" | "model" | "skill" | null, id: number | null) => void;
}


/**
 * Renders a banner for creating workflows, agents, models and skills
 * @param props 
 * @returns 
 */
const HomeCreate =  (props: HomeCreateProps) => {
    const { editMode, handleEdit } = props;
    return (
        <div className="build-create-items">
        <div className="build-create-workflow">
            <p>
                A Workflow is achieved through the coordinated efforts of multiple collaborative Agents
                structured in a specific configuration. Each Agent is equipped with various Model's and
                Skills.
            </p>
            <button className="create-workflow" onClick={editMode.bind(null, "workflow")}>Build your workflow <ArrowRightIcon /></button>
        </div>
        <div className="build-create-nodes">
            <button className="create-agent" onClick={handleEdit.bind(null, "agent", null)}>Create Agent <ArrowRightIcon /> <AgentIcon className="create-icon" /></button>
            <button className="create-skill" onClick={editMode.bind(null, "skill")}>Create Skill <ArrowRightIcon /> <SkillIcon className="create-icon" /></button>
            <button className="create-model" onClick={editMode.bind(null, "model")}>Create Model <ArrowRightIcon /> <ModelIcon className="create-icon" /></button>
        </div>
     </div>
    )
}

export default HomeCreate;

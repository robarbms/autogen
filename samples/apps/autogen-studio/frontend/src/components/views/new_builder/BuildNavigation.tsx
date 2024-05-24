import React, { MouseEventHandler, ReactElement, JSX } from "react";
import { IWorkItem } from "./utils";
import { WorkflowIcon, AgentIcon, ModelIcon, SkillIcon } from "./Icons";
import { Select } from "antd";
import "../../../styles/build.css";

/**
 * Properties for the BuildNavigation component
 */
type BuildNavigationProps = {
    category: "workflow" | "agent" | "model" | "skill" | null,
    className?: string;
    editting: IWorkItem | undefined;
    handleEdit: Function;
}

/**
 * Renders navigation to traverse the build experiences
 * @param props 
 * @returns 
 */
const BuildNavigation = (props: BuildNavigationProps) => {
    const { category, className, handleEdit, editting } = props;
    const iconMap: { [key: string]: JSX.Element} = {
        "workflow": <WorkflowIcon />,
        "agent": <AgentIcon />,
        "model": <ModelIcon />,
        "skill": <SkillIcon />
    }
    const icon: JSX.Element | string = category ? iconMap[category] : "";

    console.log(props);

    // When the select edit mode is changed, update to the correct select screen
    const onChange = (value: "workflow" | "agent" | "model" | "skill" | null): void => {
        handleEdit(value, null);
    }

    // Link to take the user back to the homepage by setting the edit screen, and edit id to null
    const homeLink = (): void => {
        handleEdit(null, null, null);
    }

    return (
        <div className={`build-nav ${className || ""}`}>
            <div onClick={homeLink} className="build-nav-home">Build /</div>
            <Select onChange={onChange} className="build-nav-select" defaultValue={category} options={[
                { value: "workflow", label: "Workflow"},
                { value: "agent", label: "Agent"},
                { value: "model", label: "Model"},
                { value: "skill", label: "Skill"}
            ]} />
            <div className="build-nav-work">{icon}{editting && editting.id ? editting?.name : `Add ${category}`}</div>
        </div>
    )
}

export default BuildNavigation;
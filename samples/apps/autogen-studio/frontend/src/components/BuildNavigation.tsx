import React from "react";
import { Divider, Select } from "antd";
import "../styles/build.css";
import { useBuildStore } from "../hooks/buildStore";
import { IWorkflow } from "./types";
import { PlusIcon } from "@heroicons/react/24/solid";

/**
 * Properties for the BuildNavigation component
 */
type BuildNavigationProps = {
    category: "workflow" | "agent" | "model" | "skill" | null,
    className?: string;
}

/**
 * Renders navigation to traverse the build experiences
 * @param props 
 * @returns 
 */
const BuildNavigation = (props: BuildNavigationProps) => {
    const { setEditScreen, setEditId, setWorkflowId, workflows, workflowId } = useBuildStore(({ setEditScreen, setEditId, setWorkflowId, workflows, workflowId}) => ({
        setEditScreen,
        setEditId,
        setWorkflowId,
        workflows,
        workflowId
    }))
    const { className } = props;

    // When the select edit mode is changed, update to the correct select screen
    const onChange = (value: number): void => {
        setWorkflowId(null)
        setTimeout(() => setWorkflowId(value), 10);
    }

    const options = workflows.map((workflow) => ({
        value: workflow.id,
        label: workflow.name
    }));

    const newWorkflow = () => {
        setWorkflowId(null);
        setEditId(null);
        setEditScreen("workflow");
    }

    return (
        <div className={`build-nav ${className || ""}`}>
            <Select
                onChange={onChange}
                className="build-nav-select"
                defaultValue={workflowId}
                dropdownRender={(menu) => (
                    <>
                        {menu}
                        <Divider style={{margin: "8px"}} />
                        <div className="new-workflow" onClick={newWorkflow}>
                            <PlusIcon /> New workflow
                        </div>
                    </>
                )}
                options={options}
            />
        </div>
    )
}

export default BuildNavigation;
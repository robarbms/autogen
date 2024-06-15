import React, { useEffect, useState } from "react";
import { WorflowViewer } from "../builder/utils/workflowconfig";
import { sampleWorkflowConfig } from "../../utils";
import { IWorkflow } from "../../types";
import { API } from "./API";
import { useBuildStore } from "../../../hooks/buildStore";
import { IAgent } from "../../types";

/**
 * Properties used by the EditWorkflow component
 */
type EditWorkflowProps = {
    api: API;
}

/**
 * Renders the edit / create workflow screen
 * @param props 
 * @returns 
 */
const EditWorkflow = (props: EditWorkflowProps) => {
    const { agents, setEditScreen, editId, setEditId, workflowId, setWorkflowId, workflows, setWorkflows } = useBuildStore(({ agents, setEditScreen, editId, setEditId, workflowId, setWorkflowId, workflows, setWorkflows}) => ({
        agents,
        setEditScreen,
        setEditId,
        editId,
        workflowId,
        setWorkflowId,
        workflows,
        setWorkflows
    }))
    const { api } = props;
    const [workflow, setWorkflow] = useState<IWorkflow | null>(null);
    let sampleWorkflow = sampleWorkflowConfig();
    let editWorkflow;
    if (editId) {
        editWorkflow = workflows.find((workflow) => workflow.id === editId);
    }
    const [localWorkflow, setLocalWorkflow] = useState(sampleWorkflow);

    const update = (workflow: IWorkflow) => {
        setLocalWorkflow(workflow);
        // Handle workflow created
        if (workflow.id !== undefined) {
            // Add an initiator
            const userproxy = agents.find((agent: IAgent) => agent.type === "userproxy");
            if (userproxy && !!userproxy.id) {
                api.linkWorkflow(workflow.id, "sender", userproxy?.id);
            }
            // refresh workflows
            api.getItems("workflows", (workflows: Array<IWorkflow>) => {
                setWorkflows(workflows);
                if (workflow.id) {
                    setWorkflowId(workflow.id); 
                }
                setEditScreen(null);
                setEditId(null);
            });
        }
    }

    const close = () => {
        setEditId(null);
        setEditScreen(null);
    }
    
    return (
        <div className="workflow-create">
            <h1>Create a new Workflow</h1>
            <WorflowViewer
                workflow={localWorkflow}
                setWorkflow={update}
                close={close}
            />
        </div>
    )
}

export default EditWorkflow;
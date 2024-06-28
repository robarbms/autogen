import React, { useEffect, useState } from "react";
import { WorflowViewer } from "../../builder/utils/workflowconfig";
import { sampleWorkflowConfig } from "../../../utils";
import { IWorkflow } from "../../../types";
import { API } from "../utilities/API";
import { useBuildStore } from "../../../../hooks/buildStore";
import { IAgent } from "../../../types";

/**
 * Properties used by the EditWorkflow component
 */
type CreateWorkflowProps = {
}

/**
 * Renders the edit / create workflow screen
 * @param props 
 * @returns 
 */
const CreateWorkflow = (props: CreateWorkflowProps) => {
    const { api, agents, setEditScreen, editId, setEditId, workflowId, setWorkflowId, workflows, setWorkflows } = useBuildStore(({ api, agents, setEditScreen, editId, setEditId, workflowId, setWorkflowId, workflows, setWorkflows}) => ({
        api,
        agents,
        setEditScreen,
        setEditId,
        editId,
        workflowId,
        setWorkflowId,
        workflows,
        setWorkflows
    }))
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
        if (workflow.id !== undefined && api) {
            // Add an initiator
            const userproxy = agents.find((agent: IAgent) => agent.type === "userproxy");
            if (userproxy && !!userproxy.id) {
                api.linkWorkflow(workflow.id, "sender", userproxy?.id);
            }
            // refresh workflows
            api.getWorkflows((workflows: Array<IWorkflow>) => {
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

export default CreateWorkflow;
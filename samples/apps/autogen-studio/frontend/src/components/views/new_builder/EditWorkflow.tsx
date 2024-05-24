import React, { useEffect, useState } from "react";
import { WorflowViewer } from "../builder/utils/workflowconfig";
import { sampleWorkflowConfig } from "../../utils";
import { IWorkflow } from "../../types";

/**
 * Properties used by the EditWorkflow component
 */
type EditWorkflowProps = {
    updateWorkflow: (id: number) => void;
    close: () => void;
}

/**
 * Renders the edit / create workflow screen
 * @param props 
 * @returns 
 */
const EditWorkflow = (props: EditWorkflowProps) => {
    const { close, updateWorkflow } = props;
    const [workflow, setWorkflow] = useState<IWorkflow | null>(null);
    const [localWorkflow, setLocalWorkflow] = useState(sampleWorkflowConfig());

    useEffect(() => {
        if (workflow && workflow.id !== undefined) {
            updateWorkflow(workflow.id);
        }
    }, [workflow]);
    
    return (
        <div className="workflow-create">
            <h1>Create a new Workflow</h1>
            <WorflowViewer
                workflow={localWorkflow}
                setWorkflow={setWorkflow}
                close={close}
            />
        </div>
    )
}

export default EditWorkflow;
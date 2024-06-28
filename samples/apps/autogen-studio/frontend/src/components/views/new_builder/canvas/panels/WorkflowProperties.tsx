import React, { useEffect, useState } from "react";
import { IWorkflow } from "../../../../types";
import { NodeSelection } from "../Canvas";
import { WorflowViewer } from "../../../builder/utils/workflowconfig";
import { useBuildStore } from "../../../../../hooks/buildStore";

// Properties for the workflow properties panel
type WorkflowPropertiesProps = {
    setSelectedNode: (node: NodeSelection) => void;
    workflow: IWorkflow | null;
}

/**
 * Properties panel showing a workflows configuration
 * @param props 
 * @returns 
 */
const WorkflowProperties = (props: WorkflowPropertiesProps) => {
    const { setSelectedNode, workflow } = props;
    const [ localWorkflow, setLocalWorkflow ] = useState<IWorkflow | null>();
    const { setWorkflows, workflows } = useBuildStore(({ workflows, setWorkflows}) => ({
        workflows,
        setWorkflows
    }));

    // Loads the workflow for editing
    useEffect(() => {
        setLocalWorkflow(workflow)
    }, []);

    // Closes the workflow properties panel
    const close = () => {
        setSelectedNode(null);
    }

    // Updates workflows on save
    const updated = (workflow: IWorkflow) => {
        const updatedWorkflows = workflows.map((wf) => {
            if (wf.id === workflow.id) {
                wf = workflow;
            }
            return wf;
        });
        setWorkflows(updatedWorkflows);
    }

    return (
        <div className="workflow-properties">
            <h2>Workflow: {localWorkflow?.name}</h2>
            {localWorkflow &&
                <WorflowViewer
                    workflow={localWorkflow}
                    setWorkflow={setLocalWorkflow}
                    close={close}
                    onUpdate={updated}
                />
            }
        </div>
    )
}

export default WorkflowProperties;

import React, { useEffect, useState } from "react";
import { IWorkflow } from "../../../types";
import { NodeSelection } from "../canvas/Canvas";
import { WorflowViewer } from "../../builder/utils/workflowconfig";
import { useBuildStore } from "../../../../hooks/buildStore";

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
    const { api, setWorkflows, workflows } = useBuildStore(({ api, setWorkflows, workflows }) => ({ api, setWorkflows, workflows }));

    // Loads the workflow for editing
    useEffect(() => {
        setLocalWorkflow(workflow)
    }, []);

    // Writes changes to the workflow to the DB
    const update = (updatedWorkflow: IWorkflow) => {
        if (api) {
            api.addWorkflow(updatedWorkflow, (data) => {
                const updatedWorkflows: IWorkflow[] = workflows.map((workflow) => {
                    if (workflow.id === data.id) {
                        const workflowUpdated = {
                            ...workflow,
                            ...data
                        }
                        setLocalWorkflow(workflowUpdated);
                        return workflowUpdated;
                    }
                    return workflow;
                });
                setWorkflows(updatedWorkflows)
            });
        }
    }

    // Closes the workflow properties panel
    const close = () => {
        setSelectedNode(null);
    }

    return (
        <div className="workflow-properties">
            <h2>Workflow: {localWorkflow?.name}</h2>
            {localWorkflow &&
                <WorflowViewer
                    workflow={localWorkflow}
                    setWorkflow={update}
                    close={close}
                />
            }
        </div>
    )
}

export default WorkflowProperties;

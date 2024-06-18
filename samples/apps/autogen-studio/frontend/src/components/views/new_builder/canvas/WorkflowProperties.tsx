import React, { useEffect, useState } from "react";
import { IWorkflow } from "../../../types";
import { API } from "../API";
import { NodeSelection } from "./Canvas";
import { WorflowViewer } from "../../builder/utils/workflowconfig";
import { useBuildStore } from "../../../../hooks/buildStore";

type WorkflowPropertiesProps = {
    api: API;
    setSelectedNode: (node: NodeSelection) => void;
    workflow: IWorkflow | null;
}

const WorkflowProperties = (props: WorkflowPropertiesProps) => {
    const { api, setSelectedNode, workflow } = props;
    const [ localWorkflow, setLocalWorkflow ] = useState<IWorkflow | null>();
    const { setWorkflows, workflows } = useBuildStore(({setWorkflows, workflows}) => ({setWorkflows, workflows}));

    useEffect(() => {
        setLocalWorkflow(workflow)
    }, []);

    const update = (updatedWorkflow: IWorkflow) => {
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
        })
    }

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

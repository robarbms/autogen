import React, {MouseEventHandler} from "react";
import { PlayIcon } from "@heroicons/react/24/solid";

// Properties for the TestWorkflow component
type TestWorkflowProps = {
    validWorkflow: boolean;
    click: MouseEventHandler;
}

/**
 * Renders the test workflow button
 * Only clickable when the workflow is a valid workflow with a sender connected to a receiver
 * @param props 
 * @returns 
 */
const TestWorkflow = (props: TestWorkflowProps) => {
    const {
        validWorkflow,
        click
    } = props;

    return (
        <button 
            onClick={validWorkflow ? click : () => {}}
            className={`test-workflow ${validWorkflow ? "" : "disabled"}`}
        >
            <PlayIcon className="test-icon" /> Test
        </button>
    )
}

export default TestWorkflow;

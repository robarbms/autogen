import React, { useState } from "react";
import { ModelConfigView } from "../builder/utils/modelconfig";
import { IModelConfig } from "../../types";
import BuildLayout from "./canvas/BuildLayout";
import Library from "./library/Library";
import BuildNavigation from "./BuildNavigation";
import { dataToWorkItem } from "./utils";

// EditModel component properties
type EditModelProps = {
    close: () => void;
    handleEdit: (category: "agent" | "model" | "skill" | "workflow" | null, id: number | null, workflow_id?: number | null) => void;
    id?: number | null;
    models: IModelConfig[],
    user: string;
}

/**
 * Renders page for editting and creating new models
 * @param props 
 * @returns 
 */
const EditModel = (props: EditModelProps) => {
    const { close, handleEdit, id, models, user } = props;
    const defaultModel: IModelConfig = {
        model: "gpt-4-1106-preview",
        description: "Sample OpenAI GPT-4 model",
        user_id: user,
    };
    let model: IModelConfig = defaultModel;
    if (id) {
        const found = models.find(model => model.id === id);
        if (found) {
            model = found;
        }
    }
    const [ localModel, setLocalModel ] = useState<IModelConfig>(model);

    return (
        <BuildLayout className="edit-model" menu={<Library libraryItems={[{
                label: "Models",
                items: models
            }]}
            user={user}
            addNode={() => {}}
            />}
        >
            <BuildNavigation category="model" handleEdit={handleEdit} editting={dataToWorkItem(user, localModel)} />
            <ModelConfigView model={localModel} setModel={setLocalModel} close={close}/>
        </BuildLayout>
    )
}

export default EditModel;
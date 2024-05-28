import React, { useState } from "react";
import { ModelConfigView } from "../builder/utils/modelconfig";
import { IModelConfig } from "../../types";
import BuildLayout from "./canvas/BuildLayout";
import Library from "./library/Library";
import BuildNavigation from "./BuildNavigation";
import { dataToWorkItem } from "./utils";
import { IBuildState, useBuildStore } from "../../../hooks/buildStore";
import { useNavigationStore } from "../../../hooks/navigationStore";
import { API } from "./API";

// EditModel component properties
type EditModelProps = {
    api: API;
}

/**
 * Renders page for editting and creating new models
 * @param props 
 * @returns 
 */
const EditModel = (props: EditModelProps) => {
    const { api } = props;
    const { models, setModels, setEditScreen, editId, setEditId } = useBuildStore(({ models, setModels, setEditScreen, editId, setEditId}) => ({
        models,
        setModels,
        editId,
        setEditScreen,
        setEditId
    }));
    const loggedInUser = useNavigationStore(({user}) => user);
    const user = loggedInUser?.name || "Unknown";
    const defaultModel: IModelConfig = {
        model: "gpt-4-1106-preview",
        description: "Sample OpenAI GPT-4 model",
        user_id: user,
    };
    let model: IModelConfig = defaultModel;
    if (editId) {
        const found = models.find(model => model.id === editId);
        if (found) {
            model = found;
        }
    }
    const [ localModel, setLocalModel ] = useState<IModelConfig>(model);
    const close = () => {
        setEditScreen(null);
        setEditId(null);
    }

    const updateModel = (model: IModelConfig) => {
        setLocalModel(model);
        api.getItems("models", setModels, true);
    }

    return (
        <BuildLayout className="edit-model" menu={<Library libraryItems={[{
                label: "Models",
                items: models
            }]}
            user={user}
            addNode={() => {}}
            />}
        >
            <ModelConfigView model={localModel} setModel={updateModel} close={close}/>
        </BuildLayout>
    )
}

export default EditModel;
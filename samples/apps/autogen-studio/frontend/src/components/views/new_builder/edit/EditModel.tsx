import React, { useState } from "react";
import { ModelConfigView } from "../../builder/utils/modelconfig";
import { IModelConfig } from "../../../types";
import BuildLayout from "../layout/BuildLayout";
import Library from "../layout/library/Library";
import { useBuildStore } from "../../../../hooks/buildStore";
import { API } from "../utilities/API";

// EditModel component properties
type EditModelProps = {
}

/**
 * Renders page for editting and creating new models
 * @param props 
 * @returns 
 */
const EditModel = (props: EditModelProps) => {
    const { api, models, setModels, setEditScreen, editId, setEditId } = useBuildStore(({ api, models, setModels, setEditScreen, editId, setEditId}) => ({
        api,
        models,
        setModels,
        editId,
        setEditScreen,
        setEditId
    }));
    const defaultModel: IModelConfig = {
        model: "gpt-4-1106-preview",
        description: "Sample OpenAI GPT-4 model",
        user_id: api?.user?.name || "",
    };
    let model: IModelConfig = defaultModel;
    if (editId) {
        const found = models.find(model => model.id === editId);
        if (found) {
            model = found;
        }
    }
    const [ localModel, setLocalModel ] = useState<IModelConfig>(model);
    const [ showMenu, setShowMenu ] = useState<boolean>(true);
    const close = () => {
        setEditScreen(null);
        setEditId(null);
    }

    const updateModel = (model: IModelConfig) => {
        setLocalModel(model);
        api?.getModels(setModels);
    }

    const addLibraryItem = () => {

    }

    return (
        <BuildLayout className="edit-model" menu={<Library libraryItems={[{
                label: "Models",
                items: [
                    ...models
                ]
            }]}
            addLibraryItem={addLibraryItem}
            />}
        >
            <ModelConfigView model={localModel} setModel={updateModel} close={close}/>
        </BuildLayout>
    )
}

export default EditModel;
import React, { useEffect, useState } from "react";
import { IModelConfig, IStatus } from "../../../../types";
import { NodeSelection } from "../Canvas";
import { Button, Input, Divider } from "antd";
import TextArea from "antd/es/input/TextArea";
import { InformationCircleIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import { ControlRowView } from "../../../../atoms";
import { useBuildStore } from "../../../../../hooks/buildStore";
import { sampleModelConfig } from "../../../../utils";

// Properties for the model properties pane
type ModelPropertiesProps = {
    model: IModelConfig;
    setSelectedNode: (node: NodeSelection) => void;
}

/**
 * A property pane showing a models configuration
 * @param props 
 * @returns 
 */
const ModelProperties = (props: ModelPropertiesProps) => {
    const { model, setSelectedNode } = props;
    const [ modelStatus, setModelStatus ] = useState<IStatus>();
    const [ loading, setLoading ] = useState(false);
    const [ editModel, setEditModel ] = useState<IModelConfig>();
    const [ hasChanged, setHasChanged ] = useState(false);
    const { api, setModels } = useBuildStore(({ api, setModels }) => ({ api, setModels }));
    const modelTypes = [
      {
        label: "OpenAI",
        value: "open_ai",
        description: "OpenAI or other endpoints that implement the OpenAI API",
        icon: <CpuChipIcon className="h-6 w-6 text-primary" />,
        hint: "In addition to OpenAI models, You can also use OSS models via tools like Ollama, vLLM, LMStudio etc. that provide OpenAI compatible endpoint.",
      },
      {
        label: "Azure OpenAI",
        value: "azure",
        description: "Azure OpenAI endpoint",
        icon: <CpuChipIcon className="h-6 w-6 text-primary" />,
        hint: "Azure OpenAI endpoint",
      },
      {
        label: "Gemini",
        value: "google",
        description: "Gemini",
        icon: <CpuChipIcon className="h-6 w-6 text-primary" />,
        hint: "Gemini",
      },
    ];
  
    const [selectedType, setSelectedType] = React.useState<string | undefined>(
      model?.api_type
    );

    const ModelTypeSelector = modelTypes.map((modelType: any, i: number) => {
      return (
        <div
          key={i}
          className={`model-selector ${selectedType === modelType.value ? "model-seleted" : ""}`}
          onClick={() => setSelectedType(modelType.value)}
        >
          <div className="model-title">{modelType.icon} {modelType.label}</div>
          <div className="model-description">{modelType.description}</div>
        </div>
      );
    });
  
    // Updates the local model
    const updateModelConfig = (key: string, value: string) => {
        const newModel = {
            ...editModel
        };
        (newModel as any)[key] = value;
        setEditModel(newModel as IModelConfig);
        setHasChanged(true);
    }

    useEffect(() => {
      if (selectedType) {
        const modelInfo = sampleModelConfig(selectedType);
        modelInfo.id = editModel?.id;
        const newModel = {
          ...editModel,
          ...modelInfo
        }
        setEditModel(newModel);
        setHasChanged(true);
      }
    }, [selectedType]);

    // Tests the current model configuration
    const testModel = (model: IModelConfig) => {
      if (api) {
        setLoading(true);
        api.testModel(model, (resp) => {
            setModelStatus(resp)
            setLoading(false);
        });
      }
    }

    // Writes changes to the DB
    const setModel = (model: IModelConfig) => {
      if (api) {
        api.setModel(model, (resp) => {
            api.getItems("models", (models: Array<IModelConfig>) => {
                setModels(models);
            }, true)
        });
        setHasChanged(false);
      }
    }

    // Closes the model properties pane
    const close = () => {
        setSelectedNode(null);
    }

    // Loads the model for editing
    useEffect(() => {
        setModelStatus(null as any);
        setEditModel(model);
    }, [model]);

    return (
        <>
            <h2>Model: {editModel?.model}</h2>
            <div className="relative ">
      <div className="text-sm my-2">
        Enter parameters for your{" "}
        <span className="mx-1 text-accent">{editModel?.api_type}</span> model.
      </div>
        <div>
          {ModelTypeSelector}
        </div>
        <Divider />
        <div>
          <ControlRowView
            title="Model"
            className=""
            description="Model name"
            value={editModel?.model || ""}
            control={
              <Input
                className="mt-2 w-full"
                value={editModel?.model}
                onChange={(e) => {
                  updateModelConfig("model", e.target.value);
                }}
              />
            }
          />

          <ControlRowView
            title="Base URL"
            className=""
            description="Base URL for Model Endpoint"
            value={editModel?.base_url || ""}
            control={
              <Input
                className="mt-2 w-full"
                value={editModel?.base_url}
                onChange={(e) => {
                  updateModelConfig("base_url", e.target.value);
                }}
              />
            }
          />
        </div>
        <div>
          <ControlRowView
            title="API Key"
            className=""
            description="API Key"
            value={editModel?.api_key || ""}
            truncateLength={5}
            control={
              <Input.Password
                className="mt-2 w-full"
                value={editModel?.api_key}
                onChange={(e) => {
                  updateModelConfig("api_key", e.target.value);
                }}
              />
            }
          />
          {editModel?.api_type == "azure" && (
            <ControlRowView
              title="API Version"
              className=" "
              description="API Version, required by Azure Models"
              value={editModel?.api_version || ""}
              control={
                <Input
                  className="mt-2 w-full"
                  value={editModel?.api_version}
                  onChange={(e) => {
                    updateModelConfig("api_version", e.target.value);
                  }}
                />
              }
            />
          )}
        </div>

      <ControlRowView
        title="Description"
        className="mt-4"
        description="Description of the model"
        value={editModel?.description || ""}
        control={
          <TextArea
            className="mt-2 w-full"
            value={editModel?.description}
            onChange={(e) => {
              updateModelConfig("description", e.target.value);
            }}
          />
        }
      />

      {model?.api_type === "azure" && (
        <div className="mt-4 text-xs">
          Note: For Azure OAI models, you will need to specify all fields.
        </div>
      )}

      {modelStatus && (
        <div
          className={`text-sm border mt-4 rounded text-secondary p-2 ${
            modelStatus.status ? "border-accent" : " border-red-500 "
          }`}
        >
          <InformationCircleIcon className="h-4 w-4 inline mr-1" />
          {modelStatus.message}

          {/* <span className="block"> Note </span> */}
        </div>
      )}

      <div className="w-full mt-4 text-right">
        <Button
          key="test"
          type="primary"
          loading={loading}
          onClick={() => {
            if (editModel) {
              testModel(editModel);
            }
          }}
        >
          Test Model
        </Button>

        {hasChanged && (
          <Button
            className="ml-2"
            key="save"
            type="primary"
            onClick={() => {
              if (editModel) {
                setModel(editModel);
              }
            }}
          >
            {editModel?.id ? "Update Model" : "Save Model"}
          </Button>
        )}

        <Button
          className="ml-2"
          key="close"
          type="default"
          onClick={() => {
            close();
          }}
        >
          Close
        </Button>
      </div>
    </div>
        </>
    )
}

export default ModelProperties;

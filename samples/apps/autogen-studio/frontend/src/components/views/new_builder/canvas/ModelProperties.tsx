import React, { MouseEventHandler, useEffect, useState } from "react";
import { IModelConfig } from "../../../types";
import { AgentProperty, IAgentNode } from "./Canvas";
import { Button, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import {
    CpuChipIcon,
    InformationCircleIcon,
  } from "@heroicons/react/24/outline";
import { ControlRowView } from "../../../atoms";
import { API } from "../API";
import { useBuildStore } from "../../../../hooks/buildStore";
  
type ModelPropertiesProps = {
    api: API;
    model: IModelConfig;
    setSelectedNode: (node: Node & IAgentNode | AgentProperty | null) => void;
}

const ModelProperties = (props: ModelPropertiesProps) => {
    const { api, model, setSelectedNode } = props;
    const [ modelStatus, setModelStatus ] = useState();
    const [ loading, setLoading ] = useState(false);
    const [ editModel, setEditModel ] = useState<IModelConfig>();
    const [ hasChanged, setHasChanged ] = useState(false);
    const { setModels } = useBuildStore(({setModels}) => ({setModels}));

    const updateModelConfig = (key: string, value: string) => {
        const newModel = {
            ...editModel
        };
        newModel[key] = value;
        setEditModel(newModel);
        setHasChanged(true);
    }

    const testModel = (model: IModelConfig) => {
        setLoading(true);
        api.testModel(model, (resp) => {
            setModelStatus(resp)
            console.log(resp);
            setLoading(false);
        });
    }

    const createModel = (model: IModelConfig) => {

    }

    const setModel = (model: IModelConfig) => {
        api.setModel(model, (resp) => {
            console.log(resp);
            api.getItems("models", (models) => {
                setModels(models);
            }, true)
        });
        setHasChanged(false);
    }

    const close = () => {
        setSelectedNode(null);
    }

    useEffect(() => {
        setModelStatus(null);
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
                createModel(editModel);
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

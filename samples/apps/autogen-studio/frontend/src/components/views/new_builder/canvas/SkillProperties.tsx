import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import {
    BounceLoader,
    Card,
    CardHoverBar,
    LoadingOverlay,
    MonacoEditor,
  } from "../../../atoms";
import { ISkill } from "../../../types";
import { API } from "../API";
import { AgentProperty, IAgentNode, NodeSelection } from "./Canvas";
import {
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    DocumentDuplicateIcon,
    InformationCircleIcon,
    PlusIcon,
    TrashIcon,
  } from "@heroicons/react/24/outline";
  import { Button, Input, Modal, message, MenuProps, Dropdown } from "antd";
  import { useBuildStore } from "../../../../hooks/buildStore";
    
type SkillPropertiesProps = {
    api: API;
    setSelectedNode: (node: NodeSelection) => void;
    skill: ISkill;
}

const SkillProperties = (props: SkillPropertiesProps) => {
    const { api, setSelectedNode, skill } = props;
    const [ skillEdit, setSkillEdit ] = useState<ISkill>();
    const editorRef = useRef<any | null>(null);
    const [ loading, setLoading ] = useState(false);
    const { setSkills } = useBuildStore(({ setSkills }) => ({ setSkills }))

    const close = () => {
        setSelectedNode(null);
    }

    useEffect(()  => {
        setSkillEdit(skill);
    }, [skill]);

    const setSkill = (updatedSkill: ISkill) => {
        setLoading(true);
        api.setSkill(updatedSkill, (resp) => {
            api.getItems("skills", (skills: Array<ISkill>) => {
                setSkills(skills);
                setLoading(false);
            }, true);
        });
    } 

    return (
        <>
            <h2>Skill: {skillEdit?.name}</h2>
            <div style={{ minHeight: "70vh" }}>
            <div className="mb-2">
              <Input
                placeholder="Skill Name"
                value={skillEdit?.name}
                onChange={(e) => {
                  const updatedSkill: ISkill = { ...skillEdit, name: e.target.value || "" } as ISkill;
                  setSkillEdit(updatedSkill);
                }}
              />
            </div>

            <div style={{ height: "70vh" }} className="h-full  mt-2 rounded">
              <MonacoEditor
                value={skillEdit?.content || ""}
                language="python"
                editorRef={editorRef}
              />
            </div>
          </div>
          <div className="w-full mt-4 text-right">
          <Button
            key="back"
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            key="submit"
            type="primary"
            className="ml-2"
            loading={loading}
            onClick={() => {
              if (editorRef.current) {
                const value = editorRef.current.getValue();
                const updatedSkill: ISkill = { ...skillEdit, content: value } as ISkill;
                setSkill(updatedSkill);
                close();
              }
            }}
          >
            Save
          </Button>
          </div>
        </>
    )
}

export default SkillProperties;
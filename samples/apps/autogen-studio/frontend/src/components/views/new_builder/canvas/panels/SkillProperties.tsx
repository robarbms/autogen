import React, { useEffect, useRef, useState } from "react";
import { MonacoEditor } from "../../../../atoms";
import { ISkill } from "../../../../types";
import { API } from "../../utilities/API";
import { NodeSelection } from "../../canvas/Canvas";
import { Button, Input } from "antd";
import { useBuildStore } from "../../../../../hooks/buildStore";

// Properties for the skill properties pane
type SkillPropertiesProps = {
    setSelectedNode: (node: NodeSelection) => void;
    skill: ISkill;
}

/**
 * A properties panel for a skill
 * @param props 
 * @returns 
 */
const SkillProperties = (props: SkillPropertiesProps) => {
    const { setSelectedNode, skill } = props;
    const [ skillEdit, setSkillEdit ] = useState<ISkill>();
    const editorRef = useRef<any | null>(null);
    const [ loading, setLoading ] = useState(false);
    const { api, setSkills } = useBuildStore(({ api, setSkills }) => ({ api, setSkills }))

    // Closes the skill properties panel
    const close = () => {
        setSelectedNode(null);
    }

    // Loads a skill to be edited
    useEffect(()  => {
        setSkillEdit(skill);
    }, [skill]);

    // Writes skill changes to the DB
    const setSkill = (updatedSkill: ISkill) => {
      if (api) {
        setLoading(true);
        api.setSkill(updatedSkill, (resp) => {
            api.getSkills((skills: Array<ISkill>) => {
                setSkills(skills);
                setLoading(false);
            });
        });
      }
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
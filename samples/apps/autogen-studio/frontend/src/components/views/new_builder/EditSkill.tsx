import React, { ChangeEvent, ChangeEventHandler, useState, useEffect, useRef, MouseEventHandler } from "react";
import { MonacoEditor } from "../../atoms";
import { Button, Input } from "antd";
import { ISkill } from "../../types";
import { getSampleSkill } from "../../utils";
import BuildLayout from "./canvas/BuildLayout";
import Library from "./library/Library";
import { IWorkItem, dataToWorkItem } from "./utils";
import BuildNavigation from "./BuildNavigation";
import { useBuildStore } from "../../../hooks/buildStore";
import { useNavigationStore } from "../../../hooks/navigationStore";
import { API } from "./API";


// Properties for creating and editing skills
type EditSkillProps = {
    api: API;
}

// Panel for creating and editing skills
const EditSkill = (props: EditSkillProps) => {
    const { editId, skills, setSkills, setEditScreen, setEditId } = useBuildStore(({ editId, skills, setSkills, setEditScreen, setEditId}) => ({
        editId,
        skills,
        setSkills,
        setEditScreen,
        setEditId
    }));
    const { api } = props;
    const [ localSkill, setLocalSkill ] = useState<ISkill>();
    const [loading, setLoading] = useState<boolean>(false);
    const editorRef = useRef<any | null>(null);
    const loggedInUser = useNavigationStore(({user}) => user);
    const user = loggedInUser?.name || "Uknown";

    // If a skill is being editted, it will be passed and set
    // Otherwise use an empty skill
    useEffect(() => {
        if (editId) {
            const skill_edit = skills.find(skill => skill.id === editId);
            if (skill_edit) {
                setLocalSkill(skill_edit);
            }
        }
        else {
            const emptySkill: ISkill = {
                name: "new_skill",
                content: "// Code goes here"
            }
            setLocalSkill(emptySkill);
        }
    }, []);

    const cancel = () => {
        setEditScreen(null);
        setEditId(null);
    }

    const save = () => {
        if (editorRef.current) {
            const value = editorRef.current.getValue();
            const updatedSkill: ISkill = { ...localSkill, content: value } as ISkill;
            api.addSkill(updatedSkill, () => {
                api.getItems("skills", setSkills, true);
            });
        }
        cancel();
    }

    const onChange: ChangeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const updatedSkill = { ...localSkill, name: e?.target?.value || ""} as ISkill;
        setLocalSkill(updatedSkill);
    }

    const addLibraryItem = () => {

    }

    return (
        <BuildLayout
            menu={<Library libraryItems={[{label: "Skills", items: skills}]} user={user ? user : ""} addLibraryItem={addLibraryItem} />}
        >
            {localSkill &&
            <>
                <div style={{ minHeight: "70vh" }}>
                    <div className="mb-2">
                        <Input
                            placeholder="Skill Name"
                            value={localSkill.name}
                            onChange={onChange}
                        />
                    </div>

                    <div style={{ height: "70vh" }} className="h-full  mt-2 rounded">
                        <MonacoEditor
                            value={localSkill?.content}
                            language="python"
                            editorRef={editorRef}
                        />
                    </div>
                </div>
                <div className="create-skill-actions">
                    <Button
                        key="back"
                        onClick={cancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={save}
                    >
                        Save
                    </Button>
                </div>
            </>
            }
        </BuildLayout>
    );
}

export default EditSkill;
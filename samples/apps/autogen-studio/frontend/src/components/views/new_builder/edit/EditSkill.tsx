import React, { ChangeEvent, ChangeEventHandler, useState, useEffect, useRef, MouseEventHandler } from "react";
import { MonacoEditor } from "../../../atoms";
import { Button, Input } from "antd";
import { ISkill } from "../../../types";
import BuildLayout from "../layout/BuildLayout";
import Library from "../layout/library/Library";
import { useBuildStore } from "../../../../hooks/buildStore";
import { useNavigationStore } from "../../../../hooks/navigationStore";

// Properties for creating and editing skills
type EditSkillProps = {
}

// Panel for creating and editing skills
const EditSkill = (props: EditSkillProps) => {
    const { api, editId, skills, setSkills, setEditScreen, setEditId } = useBuildStore(({ api, editId, skills, setSkills, setEditScreen, setEditId}) => ({
        api,
        editId,
        skills,
        setSkills,
        setEditScreen,
        setEditId
    }));
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

    // Save action. Pushes the new skill to the DB and refreshes the cached skills
    const save = () => {
        if (editorRef.current) {
            const value = editorRef.current.getValue();
            const updatedSkill: ISkill = { ...localSkill, content: value } as ISkill;
            api?.addSkill(updatedSkill, () => {
                api.getItems("skills", setSkills, true);
            });
        }
        cancel();
    }

    // Handles changing the skill name
    const nameChange: ChangeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const updatedSkill = { ...localSkill, name: e?.target?.value || ""} as ISkill;
        setLocalSkill(updatedSkill);
    }

    // Handles changing the skill description
    const descriptionChange: ChangeEventHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const updatedSkill = {
            ...localSkill,
            description: event?.target?.value || ""
        } as ISkill;
        setLocalSkill(updatedSkill);
    }

    const addLibraryItem = () => {

    }

    return (
        <BuildLayout
            menu={<Library libraryItems={[{label: "Skills", items: [
                {
                    name: "New skill",
                    content: ""
                },
                ...skills
            ]}]} addLibraryItem={addLibraryItem} />}
        >
            {localSkill &&
            <div className="edit-skill">
                <h2>Skill setting: {localSkill.name}</h2>
                <div className="edit-skill-layout">
                    <div className="edit-skill-col1">
                        <div className="skill-name">
                            <h3>Skill name</h3>
                            <Input
                                placeholder="Skill Name"
                                value={localSkill.name}
                                onChange={nameChange}
                            />
                        </div>
                        <div className="edit-description">
                            <h3>What does the Skill do?</h3>
                            <textarea value={localSkill.description} onChange={descriptionChange}></textarea>
                        </div>
                    </div>
                    <div className="edit-skill-col2">
                        <h3>Python Code</h3>
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
            </div>
            }
        </BuildLayout>
    );
}

export default EditSkill;
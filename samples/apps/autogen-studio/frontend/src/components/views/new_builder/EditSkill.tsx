import React, { useState, useEffect, useRef, MouseEventHandler } from "react";
import { MonacoEditor } from "../../atoms";
import { Button, Input } from "antd";
import { ISkill } from "../../types";
import { getSampleSkill } from "../../utils";
import BuildLayout from "./canvas/BuildLayout";
import Library from "./library/Library";
import { IWorkItem, dataToWorkItem } from "./utils";
import BuildNavigation from "./BuildNavigation";

// Properties for creating and editing skills
type EditSkillProps = {
    skill?: ISkill;
    skills: ISkill[];
    addSkill: (skill: ISkill & {content: string}) => void;
    user: string | undefined;
    addNode: () => {};
    handleEdit: (category: "agent" | "model" | "skill" | "workflow" | null, id: number | null) => void;
    id: number | null | undefined;
}

// Panel for creating and editing skills
const EditSkill = (props: EditSkillProps) => {
    const { handleEdit, skill, addSkill, skills, user, addNode, id } = props;
    const [ localSkill, setLocalSkill ] = useState<ISkill>();
    const [loading, setLoading] = useState<boolean>(false);
    const editorRef = useRef<any | null>(null);
    const [librarySkills, setLibrarySkills] = useState<IWorkItem[]>([]);

    // If a skill is being editted, it will be passed and set
    // Otherwise use a sample skill
    useEffect(() => {
        if (id) {
            const skill_edit = skills.find(skill => skill.id === id);
            if (skill_edit) {
                setLocalSkill(skill_edit);
            }
        }
        else {
            setLocalSkill(getSampleSkill());
        }
    }, []);

    return (
        <BuildLayout
            menu={<Library libraryItems={[{label: "Skills", items: skills}]} user={user ? user : ""} addNode={addNode}/>}
        >
            {localSkill &&
                <BuildNavigation editting={dataToWorkItem(user || "", localSkill)} handleEdit={handleEdit} category="skill" />
            }
            {localSkill &&
            <>
                <div style={{ minHeight: "70vh" }}>
                    <div className="mb-2">
                        <Input
                            placeholder="Skill Name"
                            value={localSkill.name}
                            onChange={(e) => {
                            const updatedSkill = { ...localSkill, name: e.target.value };
                            setLocalSkill(updatedSkill);
                            }}
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
                        onClick={handleEdit.bind(this, null, null)}
                    >
                        Cancel
                    </Button>
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={(e) => {
                            handleEdit(null, null);
                            if (editorRef.current) {
                                const value = editorRef.current.getValue();
                                const updatedSkill = { ...localSkill, content: value };
                                addSkill(updatedSkill);
                            }
                        }}
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
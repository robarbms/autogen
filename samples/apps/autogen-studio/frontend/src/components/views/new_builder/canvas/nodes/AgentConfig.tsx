import React, { DragEvent, MouseEvent } from "react";
import { IModelConfig, ISkill } from "../../../../types";
import { ModelIcon, SkillIcon } from "../../utilities/Icons";
import { AgentProperty, IAgentNode, NodeSelection } from "../Canvas";
import { Node } from "reactflow";

// Rendering for an agent skill
const Skill = (props: ISkill & {dragHandle: (event: DragEvent) => boolean, click: (event: MouseEvent) => void, selected: boolean}) => {
    const { name, dragHandle, click, selected }: { name: string, dragHandle: (event: DragEvent) => boolean, click: (event: MouseEvent) => void, selected: boolean} = props;

    return (
        <div onClick={click} className={`node-skill ${selected ? "selected" : ""}`} draggable="true" onDragStart={dragHandle}>
            <SkillIcon />
            {name}
        </div>
    );
}

// Rendering for an agent model
const Model = (props: IModelConfig & {dragHandle: (event: DragEvent) => boolean, click: (event: MouseEvent) => void, selected: boolean}) => {
    const { model, dragHandle, click, selected }: { model: string, dragHandle: (event: DragEvent) => boolean, click: (event: MouseEvent) => void, selected: boolean} = props;

    return (
        <div onClick={click} className={`node-model ${selected ? "selected" : ""}`} draggable="true" onDragStart={dragHandle}>
            <ModelIcon />
            {model}
        </div>
    )
}

// Properties for AgentProperties component
type AgentConfigProps = {
    models: IModelConfig[],
    skills: ISkill[],
    parent: number,
    instance: string,
    setSelection: (selected: NodeSelection) => void,
    selectedProp: AgentProperty,
    group?: string
}

/**
 * Component for rendering models and skill applied to an agent
 * @param props 
 * @returns 
 */
const AgentConfig = (props: AgentConfigProps) => {
    const { models, skills, parent, instance, setSelection, selectedProp }: 
        { 
            models: IModelConfig[],
            skills: ISkill[],
            parent: number,
            instance: string,
            setSelection: (selected: NodeSelection) => void,
            selectedProp: AgentProperty
        } = props;

    const dragHandle = (type: "model" | "skill", id?: number) => {
        return (event: DragEvent) => {
            const position = (event.target as HTMLDivElement)?.getBoundingClientRect();
            const data = {
                id,
                type,
                parent,
                group: "agent-property"
            };
            const nodeInfo = JSON.stringify(data);
            event.dataTransfer.setData('text/plain', nodeInfo);
            return true;
        }
    }

    const clickHandler = (clickData: IModelConfig | ISkill, type: "model" | "skill") => {
        const propertyData: (IModelConfig | ISkill) & AgentProperty = {
            ...clickData,
            parent: instance,
            group: props.group,
            type
        }
        return (event: MouseEvent) => setSelection(propertyData);
    }
  
    return (
        <div className="node_properties">
            {models && models.length > 0 &&
                models.map((model: IModelConfig, idx: number) => <Model
                        selected={selectedProp && selectedProp.type == "model" && selectedProp.id === model.id}
                        click={clickHandler(model, "model")}
                        dragHandle={dragHandle("model", model.id)}
                        {...model}
                        key={idx}
                    />)
            }
            {!models || models.length === 0 &&
                <div className="node-property-empty">Drag & drop to add a model</div>
            }
            {skills && skills.length > 0 &&
                skills.map((skill: ISkill, idx: number) => <Skill
                        selected={selectedProp && selectedProp.type == "skill" && selectedProp.id === skill.id}
                        click={clickHandler(skill, "skill")}
                        dragHandle={dragHandle("skill", skill.id)}
                        {...skill}
                        key={idx}
                    />)
            }
            {!skills || skills.length === 0 &&
                <div className="node-property-empty">Drag & drop to add a skill</div>
            }
        </div>
    )
}

export default AgentConfig;
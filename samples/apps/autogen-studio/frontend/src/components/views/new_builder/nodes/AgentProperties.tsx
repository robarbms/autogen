import React, { DragEvent } from "react";
import { IModelConfig, ISkill } from "../../../types";
import { ModelIcon, SkillIcon } from "../Icons";

// Rendering for an agent skill
const Skill = (props: ISkill & {dragHandle: (event: DragEvent) => boolean}) => {
    const { name, dragHandle }: { name: string, dragHandle: (event: DragEvent) => boolean } = props;

    return (
        <div className="node-skill" draggable="true" onDragStart={dragHandle}>
            <SkillIcon />
            {name}
        </div>
    );
}

// Rendering for an agent model
const Model = (props: IModelConfig) => {
    const { model }: { model: string} = props;

    return (
        <div className="node-model">
            <ModelIcon />
            {model}
        </div>
    )
}

// Properties for AgentProperties component
type AgentPropertiesProps = {
    models: IModelConfig[],
    skills: ISkill[],
    parent: number
}

/**
 * Component for rendering models and skill applied to an agent
 * @param props 
 * @returns 
 */
const AgentProperties = (props: AgentPropertiesProps) => {
    const { models, skills, parent }: { models: IModelConfig[], skills: ISkill[], parent: number } = props;

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
        }
    }
  
    return (
        <div className="node_properties">
            {models &&
                models.map((model: IModelConfig, idx: number) => <Model {...model} key={idx} />)
            }
            {!models || models.length === 0 &&
                <div className="node-property-empty">Drag & drop to add a model</div>
            }
            {skills &&
                skills.map((skill: ISkill, idx: number) => <Skill dragHandle={dragHandle("skill", skill.id)} {...skill} key={idx} />)
            }
            {!skills || skills.length === 0 &&
                <div className="node-property-empty">Drag & drop to add a skill</div>
            }
        </div>
    )
}

export default AgentProperties;
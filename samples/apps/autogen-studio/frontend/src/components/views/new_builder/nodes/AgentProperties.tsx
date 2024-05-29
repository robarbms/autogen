import React from "react";
import { IAgent, IModelConfig, ISkill } from "../../../types";
import { ModelIcon, SkillIcon } from "../Icons";

// Rendering for an agent skill
const Skill = (props: ISkill) => <div className="node-skill"><SkillIcon />{props.name}</div>

// Rendering for an agent model
const Model = (props: IModelConfig) => (
    <div className="node-model"><ModelIcon />{props.model}</div>
);

// Properties for AgentProperties component
type AgentPropertiesProps = {
    data: IAgent & {
        models?: IModelConfig[],
        skills?: ISkill[]
    }
}

/**
 * Component for rendering models and skill applied to an agent
 * @param props 
 * @returns 
 */
const AgentProperties = (props: AgentPropertiesProps) => {
    const {models, skills} = props.data;
    return (
        <div className="node_properties">
            {models &&
                models.map((model: IModelConfig, idx: number) => <Model {...model} key={idx} />)
            }
            {!models || models.length === 0 &&
                <div className="node-property-empty">Drag & drop to add a model</div>
            }
            {skills &&
                skills.map((skill: ISkill, idx: number) => <Skill {...skill} key={idx} />)
            }
            {!skills || skills.length === 0 &&
                <div className="node-property-empty">Drag & drop to add a skill</div>
            }
        </div>
    )
}

export default AgentProperties;
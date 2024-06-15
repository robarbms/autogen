import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../types";

// Gets string version of the amount of time between 2 dates or a date and now
export const timeAgo = (date: string | Date | number, date2?: string | Date | number): string => {
    const toMilliseconds = (d: string | Date | number): number => typeof d === "number" ? d :
        (typeof d === "string" ? new Date(d) : d).getTime();
    date = toMilliseconds(date);
    date2 = toMilliseconds(date2 || new Date());
    const since: number = Math.abs(date2 - date);

    const times: { [key: string]: number} = {
        second: 1000,
        minute: 60000,
        hour: 3600000,
        day: 86400000,
        week: 604800000,
        month: 2592000000,
        year: 31536000000
    }

    const plural = (value: number): string => value > 1 ? "s" : "";
    let string: string = "";

    for (let key in times) {
        const diff = Math.floor(since / times[key]);
        if (diff >= 1 || string === "") {
            string = `${diff} ${key}${plural(diff)}`;
        }
        else {
            return string;
        }
    }

    return string;
}

// Types of work items
export type DataType = | "agent" | "model" | "skill" | "workflow";

// Checks an object structure to determine it's data type
export const getDataType = (data: { [key: string]: any}): DataType  => {
    if (data.config) {
        return "agent";
      }
      else if (data.model) {
        return "model";
      }
      else if (data.content) {
        return "skill";
      }
    
    return "workflow";
}

// Interface for a common data structure for components
export interface IWorkItem {
    category: string;
    type?: string;
    name: string;
    description?: string,
    time: string;
    edit: string;
    id: number;
    sortTime: number;
}

/**
 * Creates a common data structure rendering used for components
 * @param user_email 
 * @param data 
 * @returns 
 */
export const dataToWorkItem = (user_email: string, data: IAgent | IModelConfig | ISkill | IWorkflow | {label: string, config: {name: string}}): IWorkItem => {
    let category: DataType = getDataType(data);
    let {id, created_at, updated_at, user_id} = data as any;
    let name: string | undefined = "";
    let description: string | undefined = "";

    // properties for agents
    if ("config" in data) {
        name = data.config.name;
        description = "description" in data.config ? data.config.description : "";
    }
    else {
        if ("name" in data) {
            name = data.name;
        }
        // properties for models
        if ("model" in data) {
            name = data.model;
        }
        description = data.description;
    }

    let type: string | undefined = "";

    if ("type" in data) {
        type = data.type;
    }
    // types for models
    else if ("api_type" in data) {
        type = data.api_type;
    }

    const user_name: string = user_id && user_email === user_id ? "You" : user_id || "";
    const timeDiff: number = new Date(updated_at || new Date()).getTime() - new Date(created_at || new Date()).getTime();
    const edit: string = user_name + (timeDiff > 0 ? " edited" : " created");
    const time: string = timeAgo(updated_at || new Date()) + " ago";

    return {
        category,
        type,
        name,
        description,
        time,
        edit,
        id,
        sortTime: new Date(updated_at || new Date()).getTime()
    }
}
import React, {useState, useEffect} from "react";
import { Drawer } from "antd";
import LibraryTitle from "./LibraryTitle";
import "../../../../styles/library.css";
import { LibraryGroups, Group } from "./LibraryGroups";
import { IWorkItem, dataToWorkItem } from "../utils";
import { IAgent, IModelConfig, ISkill, IWorkflow } from "../../../types";
import { CollapseMenuIcon } from "../Icons";

export type EmptyLibraryItem = {
    id: number;
    config?: {
        name: string;
    };
    model?: string;
    content?: string;
}

export type LibraryGroup = {
    items: Array<EmptyLibraryItem | IAgent | ISkill | IModelConfig | IWorkflow>;
    label: string;
    collapsed?: Boolean;
}

/**
 * Properties for the Library component
 */
type LibraryProps = {
    libraryItems: LibraryGroup[];
    user: string;
    setShowMenu?: (showMenu: boolean) => void;
    addLibraryItem: Function;
};

/**
 * Library component for picking Agents, Models and Skills
 * @param props 
 * @returns 
 */
const Library = (props: LibraryProps) => {
    const { libraryItems, user, setShowMenu, addLibraryItem } = props;
    const [search, setSearch] = useState('');
    const [items, setItems] = useState<Group[]>([]);

    // Update rendered items when search string changes
    useEffect(() => {
        // Creates Group[] objects from what's in the libraryItems (agents, models, skills, and workflows)
        const userDataToWorkItem = dataToWorkItem.bind(this, user);
        let groups: Group[] = libraryItems.map((libGroup: any, idx: number) => ({
            title: libGroup.label,
            items: libGroup.items.map(userDataToWorkItem),
            collapsed: false,
            key: idx.toString()
        } as Group));

        // Filters out items that don't match the search string
        // TODO: implement better search
        //       split strings and search for each
        //       search title, description and categories
        if (search) {
            groups = groups.map((group) => ({
                ...group,
                items: group.items.filter(itm => 
                    itm && itm.name && itm.name.toLowerCase().indexOf(search.toLowerCase()) >= 0
                )
            }));
        }

        // TODO: Should there be sorting here? By title or date created / updated?

        setItems(groups);
    }, [ search, libraryItems]);

    return (
        <div className="library h-full">
            <div className="library-title-area">
                <LibraryTitle searchChanged={setSearch} searchOptions={items} />
            </div>
            <div className="library-content scroll overflow-y-scroll overflow-hidden">
                <LibraryGroups
                    groups={items}
                    addLibraryItem={addLibraryItem}
                />
            </div>
            {setShowMenu &&
                <div className="library-close" onClick={() => setShowMenu(false)}><CollapseMenuIcon /> Close library</div>
            }
        </div>
    )
}

export default Library;
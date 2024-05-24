import React, { DragEventHandler, DragEvent } from "react";
import { IAgent } from "../../../types";

/**
 * LibraryItem component properties 
 */
type LibraryItemProps = {
    id: number;
    name: string;
    description?: string;
    category: string;
    addNode: Function;
}

/**
 * LibraryItem component
 * @param props 
 * @returns 
 */
const LibraryItem = (props: LibraryItemProps) => {
    const { id, name, description, category } = props;

    const classNames = ['library_item', 'group_' + category];
    // Special styling for New item options
    // TODO: The ability to push additional classNames?
    if (description && description.toLowerCase().indexOf('blank') > 0) {
        classNames.push('item_emph');
    }

    // Adds node info to the event's dataTransfer property on drag start
    const dragHandle = (event: DragEvent) => {
        const position = (event.target as HTMLDivElement)?.getBoundingClientRect();
        const data = {
            id,
            group: category,
            text: description,
            title: name,
            offsetX: position.left - event.clientX + 4, // + 4 for the thicker left border
            offsetY: position.top - event.clientY - 13, // - 13 for top canvas spacing
        };
        const nodeInfo = JSON.stringify(data);
        event.dataTransfer.setData('text/plain', nodeInfo);
    };

    return (
        <div
            className={classNames.join(' ')}
            draggable
            onDragStart={dragHandle}
            onClick={props.addNode.bind(null, props)}
        >
            <div className="library-item-title">{name}</div>
        </div>
    );
};

export { LibraryItem, LibraryItemProps };

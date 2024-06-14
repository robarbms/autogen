import React from "react";
import { Collapse } from "antd";
import { LibraryItem } from "./LibraryItem";
import { IWorkItem } from "../utils";

/**
 * Group properties
 */
type Group = {
    title: string;
    items: IWorkItem[];
    icon?: string;
    key: string;
}

/**
 * Component for rendering a Group Title
 * @param param0 
 * @returns 
 */
const GroupTitle = ({title, icon}: {title: string, icon: string | undefined}) => (
  <div className="library-group-title">
    {icon &&
      <span className="library-group-icon">{icon}</span>
    }
    {title}
  </div>
);

/**
 * LibraryGroups component properties
 */
type LibraryGroupsProps = {
    groups: Group[];
    addNode: (node: any) => void;
    addLibraryItem: Function;
}

/**
 * Renders all of the groups using the Ant Collapse component
 * @param props 
 * @returns 
 */
const LibraryGroups = (props: LibraryGroupsProps) => {
  // Formatting groups to the expected data structure for Ant Collapse component
 const groups = props.groups ? props.groups.map(({title, icon, items, key}) => ({
    key,
    label: <GroupTitle {...{title, icon}} />,
    children: items ? items.map((item, idx) => <LibraryItem key={idx} {...item} addNode={props.addNode} addLibraryItem={props.addLibraryItem} />) : []
 }))
  : [];

  return (
    <Collapse
      className={'library-groups'}
      items={groups}
      bordered={false}
      defaultActiveKey={['0', '1', '2']}
    ></Collapse>
  );
};

export {LibraryGroups, Group};

import * as React from "react";
import { AutoComplete } from "antd";
import { useState } from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { Group } from "./LibraryGroups";

/**
 * Properties used bo the LibraryTitle component
 */
type LibraryTitleProps = {
    title?: string;
    searchOptions: Group[];
    searchChanged: (value: any) => void;
}

/**
 * Title component for the Library
 * Includes a search bar
 * @param props 
 * @returns 
 */
const LibraryTitle = (props: LibraryTitleProps) => {
    // Push some default properties if values aren't provided
    const defaultProperties: {
        title: string;
    } = {title: "Library"};
    props = Object.assign({}, defaultProperties, props);
    const {  title,  searchChanged} = props;
    const [ options, setOptions ] = useState<Group[] | []>([]);

    // Creates a list of options for autocomplete based on query string
    const getPanelValue = (searchText: string): Group[] => {
      const searchResults: Group[] = !searchText
        ? []
        : props.searchOptions.filter(
            (opt: any) =>
              opt && opt.value && opt.value.toLowerCase().indexOf(searchText.toLowerCase()) >= 0
          );
      return searchResults;
    };
  
    return (
        <div className="library-title">
            <h2>
                <BookOpenIcon />
                {title}
            </h2>
            <AutoComplete
                className="library-search"
                onChange={searchChanged}
                placeholder="Search for items"
                onSearch={(text) => setOptions(getPanelValue(text))}
                options={options}
            />
        </div>
    );
};

export default LibraryTitle;
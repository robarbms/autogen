import React, {ReactNode, useEffect, useState} from "react";
import "../../../../styles/build.css";

/**
 * Build Layout component properties
 */
type BuildLayoutProps = {
    menu?: ReactNode;              // Left rail menu used for the Library
    children?: ReactNode | ReactNode[];          // All of the content that the Build Layout wraps
    properties?: ReactNode;           // A right menu area used for node properties
    chat?: ReactNode;           // A furthermost right menu used for workflow testing
    className?: string;
}

/**
 * Basic build page layout
 * @param props 
 * @returns 
 */
const BuildLayout = (props: BuildLayoutProps) => {
    const [ menuOpen, setMenuOpen ] = useState(false);
    const {menu, children, properties, chat, className} = props;
    let cn = "build-layout h-full";
    if (properties) {
        cn += " build-layout-properties"
    }
    if (chat) {
        cn += " build-layout-chat";
    }
    if (className) {
        cn += " " + className;
    }
    if (menuOpen) {
        cn += " menu-open";
    }

    const toggleMenu = (e) => {
        setMenuOpen(menuOpen === false);
    }

    // Resets the menu locked open when properties or chat state are changed
    useEffect(() => {
        setMenuOpen(false);
    }, [ properties, chat ])

    return (
        <div className={cn}>
            <div className="build-layout-menu">
                {menu}
            </div>
            <div className="build-layout-content">
                {children}
                <div className="library-button" onClick={toggleMenu}>Library</div>
            </div>
            <div className="build-layout-props">
                {properties}
            </div>
            <div className="build-layout-actions">
                {chat}
            </div>
        </div>
    )
}

export default BuildLayout;
import React, {EventHandler, MouseEventHandler, ReactNode, useEffect, useState} from "react";
import "../../../../styles/build.css";
import { ExpandMenuIcon } from "../utilities/Icons";
import { Drawer } from "antd";

/**
 * Build Layout component properties
 */
type BuildLayoutProps = {
    menu?: ReactNode;              // Left rail menu used for the Library
    children?: ReactNode | ReactNode[];          // All of the content that the Build Layout wraps
    properties?: ReactNode;           // A right menu area used for node properties
    chat?: ReactNode;           // A furthermost right menu used for workflow testing
    className?: string;
    showMenu?: boolean;
    setShowMenu?: (showMenu: boolean) => void;
    closeChat?: () => void;
    chatTitle?: string;
}

/**
 * Basic build page layout
 * @param props 
 * @returns 
 */
const BuildLayout = (props: BuildLayoutProps) => {
    const {menu, children, properties, chat, className, showMenu, setShowMenu, closeChat, chatTitle} = props;
    const [ structure, setStructure ] = useState("");

    useEffect(() => {
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
        if (showMenu === false) {
            cn += " menu-closed";
        }

        setStructure(cn);
    }, [ properties, chat, showMenu, menu]);
    const openMenu = (event: MouseEvent) => {
        if (setShowMenu) {
            setShowMenu(true);
        }
    }

    return (
        <div className={structure}>
            <div className="build-layout-menu">
                {menu}
            </div>
            <div className="build-layout-content" style={{height: "100%", width: "calc(100% - 20px)"}}>
                {children}
                {setShowMenu &&
                    <div className="library-button" onClick={openMenu as any}><ExpandMenuIcon /> Open library</div>
                }
            </div>
            <div className="build-layout-props">
                {properties}
            </div>
            <Drawer title={chatTitle} open={chat ? true : false} onClose={closeChat} size="large">
                {chat}               
            </Drawer>
        </div>
    )
}

export default BuildLayout;
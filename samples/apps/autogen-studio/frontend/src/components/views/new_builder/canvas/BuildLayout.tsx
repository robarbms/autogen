import React, {ReactNode} from "react";
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

    return (
        <div className={cn}>
            <div className="build-layout-menu">
                {menu}
            </div>
            <div className="build-layout-content">
                {children}
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
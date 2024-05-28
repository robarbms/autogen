import React, { useEffect } from "react";
import { CollapseMenuIcon, BuildIcon, ExpandMenuIcon, PlaygroundIcon } from "./views/new_builder/Icons";
import { IUser } from "../hooks/provider";
import { Collapse } from "antd";
import { useNavigationStore } from "../hooks/navigationStore";

// Properties for the PageNavigation component
type PageNavigationProps = {
    buildNav: (category: "workflow" | "agent" | "skill" | "model") => void;
    hasGallery: boolean;
}

/**
 * Renders the site navigation
 * @param props 
 * @returns 
 */
const PageNavigation = (props: PageNavigationProps) => {
    const { buildNav, hasGallery, } = props;
    const { buildExpand, setBuildExpand, navigationExpand, setNavigationExpand, user } = useNavigationStore();
    const userAvatar = user?.avatar_url;
    const userName = user?.name || "Uknown";

    const buildMenu = [
        {
            key: '1',
            label: (<><BuildIcon /> <label>Build</label></>),
            children: 
            <>
                <div className="build-nav-item" onClick={buildNav.bind(this, "workflow")}>Workflows</div>
                <div className="build-nav-item" onClick={buildNav.bind(this, "agent")}>Agents</div>
                <div className="build-nav-item" onClick={buildNav.bind(this, "skill")}>Skills</div>
                <div className="build-nav-item" onClick={buildNav.bind(this, "model")}>Models</div>
            </>
        }
    ]

    return (
        <div className="page-navigation">
            <div className="page-logo">
                <a href="/"><img className="logo" src="/images/logo.png" /> <label>Autogen Studio</label></a>
            </div>
            <nav>
                <section>
                    <a href="/"><PlaygroundIcon /><label>Playground</label></a>
                    <Collapse onChange={(value) => setBuildExpand(value.length > 0)} bordered={false} items={buildMenu} defaultActiveKey={buildExpand ? ['1'] : []} />
                </section>
                {hasGallery &&
                    <section>
                        <div className="nav-gallery">Gallery</div>
                    </section>
                }
            </nav>
            <div className="nav-actions">
                <div className="user">
                    {userAvatar &&
                        <div className="user-avatar" style={{backgroundImage: `url(${userAvatar})`}}></div>
                    }
                    {!userAvatar &&
                        <div className="user-avatar">{userName[0]}</div>
                    }
                    <span className="user-name">{userName}</span>
                </div>
                <div className="nav-view">
                    <div className="nav-minimize" onClick={setNavigationExpand.bind(this, false)}><CollapseMenuIcon />Close sidebar</div>
                    <div className="nav-expand" onClick={setNavigationExpand.bind(this, true)}><ExpandMenuIcon /></div>
                </div>
            </div>
        </div>
    );
}

export default PageNavigation;
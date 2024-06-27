import React, { useEffect } from "react";
import { CollapseMenuIcon, BuildIcon, ExpandMenuIcon, PlaygroundIcon } from "./views/new_builder/utilities/Icons";
import { IUser } from "../hooks/provider";
import { Collapse, Dropdown } from "antd";
import { useNavigationStore } from "../hooks/navigationStore";
import { BuildSections, IBuildState, useBuildStore } from "../hooks/buildStore";

// Properties for the PageNavigation component
type PageNavigationProps = {
    buildNav: (category: "workflow" | "agent" | "skill" | "model") => void;
    hasGallery: boolean;
    location?: "home" | "build";
}

/**
 * Renders the site navigation
 * @param props 
 * @returns 
 */
const PageNavigation = (props: PageNavigationProps) => {
    const { buildNav, hasGallery, location } = props;
    const { setEditScreen, setEditId, setWorkflowId } = useBuildStore(({setEditScreen, setEditId, setWorkflowId}) => ({
        setEditScreen,
        setEditId,
        setWorkflowId
    }));
    const { buildExpand, setBuildExpand, navigationExpand, setNavigationExpand, user } = useNavigationStore();
    const userAvatar = user?.avatar_url;
    const userName = user?.name || "Uknown";
    const create = (category: BuildSections) => () => {
        navigateBuild();
        setEditId(null);
        setEditScreen(category);
    }

    const navigateBuild = () => {
        const {pathname} = document.location;
        if (pathname.indexOf('/new_build') !== 0) {
            document.location.href = '/new_build';
        }
    }

    const buildHome = () => {
        navigateBuild();
        setEditScreen(null);
        setEditId(null);
        setWorkflowId(null);
    }

    const links = [
        <div key="1" className="build-nav-item" onClick={create("workflow")}>Workflows</div>,
        <div key="2" className="build-nav-item" onClick={create("agent")}>Agents</div>,
        <div key="3" className="build-nav-item" onClick={create("skill")}>Skills</div>,
        <div key="4" className="build-nav-item" onClick={create("model")}>Models</div>,
    ]

    const buildMenu = [
        {
            key: '1',
            label: (<a onClick={buildHome} className={location === "build" ? "page-nav-loc" : ""}><BuildIcon className="nav-icon" /> <label>Build</label></a>),
            children: links
        }          
    ];

    const minimalMenu = links.map((link, idx) => ({
        key: `${idx}`,
        label: link
    }));

    const minimalBuildMenu = () => (
        <Dropdown menu={{items: minimalMenu}} placement="bottomLeft">
            <div className={`build-min ${location === "build" ? "page-nav-loc" : ""}`} onClick={buildHome}><BuildIcon className="nav-icon" /></div>
        </Dropdown>
    );

    return (
        <div className="page-navigation">
            <div className="page-logo">
                <a href="/"><img className="logo" src="/images/logo.png" alt="Autogen Studio logo" /> <label>Autogen Studio</label></a>
            </div>
            <nav>
                <section>
                    <a className={location === "home" ? "page-nav-loc" : ""} href="/"><PlaygroundIcon className="nav-icon" /><label>Playground</label></a>
                    {navigationExpand &&
                        <Collapse onChange={(value) => setBuildExpand(value.length > 0)} bordered={false} items={buildMenu} defaultActiveKey={buildExpand ? ['1'] : []} />
                    }
                    {!navigationExpand &&
                        minimalBuildMenu()
                    }
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
                    <div className="nav-minimize" onClick={setNavigationExpand.bind(this, false)}><CollapseMenuIcon className="nav-icon" />Close sidebar</div>
                    <div className="nav-expand" onClick={setNavigationExpand.bind(this, true)}><ExpandMenuIcon className="nav-icon" /></div>
                </div>
            </div>
        </div>
    );
}

export default PageNavigation;
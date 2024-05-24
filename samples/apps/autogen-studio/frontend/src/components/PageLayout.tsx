import React, { ReactElement, useEffect, useState } from "react";
import { appContext } from "../hooks/provider";
import PageNavigation from "./PageNavigation";
import "../styles/site.css";
import "../styles/layout.css";

// Properties used by the PageLayout component
type PageLayoutProps = {
    buildNav: (category: "workflow" | "agent" | "skill" | "model") => void;
    buildNavOpen: boolean;
    setBuildNavOpen: (open: boolean) => void;
    children: ReactElement | Array<ReactElement>;
    navExpand: boolean;
    setNavExpand: (expand: boolean) => void;
}

/**
 * Renders a PageLayout. Adds navigation and page content areas
 * @param props 
 * @returns 
 */
const PageLayout = (props: PageLayoutProps) => {
    const { buildNav, buildNavOpen, setBuildNavOpen, children, navExpand, setNavExpand } = props;
    const { darkMode } = React.useContext(appContext);
    const { user, logout } = React.useContext(appContext);
    const userName = user ? user.name : "Unknown";
    const userAvatarUrl = user ? user.avatar_url : "";
    const user_id = user ? user.username : "unknown";
  
    const links: any[] = [
      { name: "Build", href: "/build" },
      { name: "New Build", href: "/new_build"},
      { name: "Playground", href: "/" },
      // { name: "Gallery", href: "/gallery" },
      // { name: "Data Explorer", href: "/explorer" },
    ];

    return (
        <div className={`page-layout ${darkMode === "dark" ? "dark" : "light"} ${navExpand ? "nav-wide" : "nav-narrow"}`}>
            <PageNavigation buildNav={buildNav} buildNavOpen={buildNavOpen} setBuildNavOpen={setBuildNavOpen} navToggle={setNavExpand} hasGallery={false} user={user} userName={userName} userAvatarUrl={userAvatarUrl} user_id={user_id} />
            <main className="page-content">
                {children}
            </main>
        </div>
    );
}

export default PageLayout;
import React, { ReactElement, useEffect, useState } from "react";
import { appContext } from "../hooks/provider";
import PageNavigation from "./PageNavigation";
import "../styles/site.css";
import { useNavigationStore } from "../hooks/navigationStore";

// Properties used by the PageLayout component
type PageLayoutProps = {
    buildNav: (category: "workflow" | "agent" | "skill" | "model") => void;
    children: ReactElement | Array<ReactElement>;
}

/**
 * Renders a PageLayout. Adds navigation and page content areas
 * @param props 
 * @returns 
 */
const PageLayout = (props: PageLayoutProps) => {
    const { setUser, navigationExpand } = useNavigationStore(({setUser, navigationExpand}) => ({
        setUser,
        navigationExpand
    }));
    const { buildNav, children } = props;
    const { darkMode, user } = React.useContext(appContext);

    useEffect(() => {
        setUser(user);
    }, []);
  
    const links: any[] = [
      { name: "Build", href: "/build" },
      { name: "New Build", href: "/new_build"},
      { name: "Playground", href: "/" },
      // { name: "Gallery", href: "/gallery" },
      // { name: "Data Explorer", href: "/explorer" },
    ];

    return (
        <div className={`page-layout ${darkMode === "dark" ? "dark" : "light"} ${navigationExpand ? "nav-wide" : "nav-narrow"}`}>
            <PageNavigation buildNav={buildNav} hasGallery={false} />
            <main className="page-content">
                {children}
            </main>
        </div>
    );
}

export default PageLayout;
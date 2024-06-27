import React, { ReactElement, useEffect } from "react";
import { appContext } from "../hooks/provider";
import PageNavigation from "./PageNavigation";
import "../styles/site.css";
import { useNavigationStore } from "../hooks/navigationStore";

// Properties used by the PageLayout component
type PageLayoutProps = {
    buildNav: (category: "workflow" | "agent" | "skill" | "model") => void;
    children: ReactElement | Array<ReactElement>;
    meta: any;
    title: string;
    defaultCollapse?: boolean;
    location?: "home" | "build"
}

/**
 * Renders a PageLayout. Adds navigation and page content areas
 * @param props 
 * @returns 
 */
const PageLayout = (props: PageLayoutProps) => {
    const { setUser, navigationExpand, setNavigationExpand } = useNavigationStore(({setUser, navigationExpand, setNavigationExpand}) => ({
        setUser,
        navigationExpand,
        setNavigationExpand
    }));
    const { buildNav, children, meta, title, defaultCollapse, location } = props;
    const { darkMode, user } = React.useContext(appContext);

    useEffect(() => {
        setUser(user);
        if (defaultCollapse === true) {
            setNavigationExpand(false);
        }
    }, []);

    React.useEffect(() => {
      document.getElementsByTagName("html")[0].className = `${
        darkMode === "dark" ? "dark bg-primary" : "light bg-primary"
      } `;
    }, [darkMode]);
  
    return (
        <>
        <title>{meta?.title + " | " + title}</title>
        <div className={`page-layout ${darkMode === "dark" ? "dark" : "light"} ${navigationExpand ? "nav-wide" : "nav-narrow"}`}>
            <PageNavigation location={location} buildNav={buildNav} hasGallery={false} />
            <main className="page-content">
                {children}
            </main>
        </div>
        </>
    );
}

export default PageLayout;
import { create } from "zustand";
import { IUser } from "./provider";

/**
 * Navigation state type
 */
interface NavigationState {
    buildExpand: boolean;
    setBuildExpand: (buildExpand: boolean) => void;
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    navigationExpand: boolean;
    setNavigationExpand: (navigationExpand: boolean) => void;
}

/**
 * Handles the state for the site navigation
 */
export const useNavigationStore = create<NavigationState>()((set) => ({
    buildExpand: false,
    setBuildExpand: buildExpand => set( state => ({
        buildExpand,
        // Expanding the build menu should ensure that the navigation is expanded
        navigationExpand: buildExpand ? true : state.navigationExpand
    })),
    user: null,
    setUser: user => set({user}),
    navigationExpand: true,
    setNavigationExpand: navigationExpand => set( state => ({
        navigationExpand,
        // collapsing the navigation should collapse the build menu
        buildExpand: !navigationExpand ? false : state.buildExpand
    })),
}));
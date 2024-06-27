# New Builder overview

# File structure

- **canvas**: Files associated with the Workflow canvas editing screen.
    - **nodes**: Files for the nodes used on the canvas. These include the userproxy, assistant and groupchat agents.
    - **panels**: Files for rendering the node properties panels on the canvas.
- **edit**: Files for the editing agents, models, skills and workflow screens.
- **home**: Files for the home landing screen for the new build experience.
- **layout**: Files for the page layout, property panels and chat panel on edit screens.
    - **library**: Files used to make up the library used on the edit screens.
- **utilities**: Helper files for data processing, some icons and DB actions.

# File overview

## build.tsx
This is the entry point for the new builder page. It loads models, skills, agents, and workflows into the build store. It also handles state management for which edit screen or home page should be shown.

## Home
The homepage components can be found in the home directory. This includes the overall home page and the recent work table.

### Home component
This is the entry point for the home landing page. It handles the basic rendering of the homepage and loading of the recent work if any is present in the DB.

### RecentWork
This renders a table showing all of the agents, models, skills and workflows in the DB.

## Layout
All of the edit screens use the BuildLayout component in the layout folder. It handles the layout of the page and whether panels such as the properties panel or chat panel should be shown.

### BuildLayout
This is the component that renders components in the proper containers. It also manages classes on the main structure to handle layout when certain elements are not present.

## Library
Components that make up the library used on the edit screens and canvas, are in the library directory under the layout directory.

### Library component
This component has the basic structure, maintains the open state and loads the agents, models and skills into collapsible menus.

### Library title
Title of the library panel. Includes search functions.

### LibraryGroup
A group of library items including their title and items in them. The 3 groups are agents, models and skills.

### LibraryItem
A component representing an agent, model or skill in the DB. Also includes creating a new one of eacth.

## Edit pages
Most of the components for each of the edit pages can be found in the edit directory. There are pages that are for creating and editing for agents, models and skills. Workflows have separate components for creating and editing.

### EditAgent
Component for rendering a screen for creating and editting agents. Includes a canvas for drag and drop functionality. It's canva associated components are in the canvas directory.

### EditModel
Component for creating or editting an existing model.

### EditSkill
Component for creating or editting an existing skill.

### CreateWorkflow
Component that includes a form for creating a new workflow.

## Canvas
Components used to create and work with the canvas.

### Canvas.ts
This contains several shared functions used by both the agent and workflow canvas screens.

### AgentCanvas
A canvas for editting agents. Manages loading an exisiting agent or creating a new agent. Manages the nodes on the canvas. Unlike the workflow canvas, the agent canvas does not support edges.

### WorkflowCanvas
A canvas for editting a workflow. Manages loading an exisiting workflow as the nodes and edges on the canvas.

### TestWorkflow
A small component for opening the chat panel when there is a valid workflow.

## Nodes
Components that make up the different agents that can be added to the canvas.

### UserProxyNode
A component representing a userproxy agent node. Can be rendered under a group chat node and must self manage selection.

### AssistantNode
A component representing an assistant agent node. Can also be rendered under a group chat node and must also self manage selection.

### GroupChatNode
A component representing a group chat node. Manages nodes linked to it and rendering them.

### AgentProperties
A container used by userproxy and assistant nodes to render their associated models and skills which must be draggable and selectable.

## Panels
Components used in the property panels and the chat panel.

### NodeProperties
This is a panel that opens on the right that shows the properties of the selected agent, model, skill or workflow. It will pick the corresponding component based on what is selected.

### AgentProperties
This populates the NodeProperties panel with an edit agent form. This can be either an existing agent or creating a new node.

### ModelProperties
This populates the NodeProperties panel with an edit model form. This can also create a new model.

### SkillProperties
This is the skill edit form. It can also create a new skill.

### WorkflowProperties
A form for the current active workflow which can be editted.

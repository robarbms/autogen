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
This is the entry point for the new builder page. It handles loading the initial data and state as well as managing where in the build section the user is.

- Creates the api for making DB calls. `const api = new API();`
    - Primes the error handling.
    ```javascript
    api.error = (error: IStatus) => {
        if (!error.status) message.error(error.message)
    }
    ```

    - Primes the success message handling.

    ```javascript
    api.success = (success: IStatus) => {
        message.success(success.message);
    }  
    ```
- On page load, loads workflows, agents, models and skills.
    - Uses the api to load workflows, agents, models and skills.
    - Sets workflows, agents, models and skills on the builder store
- Renders the appropriate screen based on state.
    - Home page is rendered if there isn't an active workflow id or edit screen.
    - Edit screens are displayed if set to workflow, agent, model or skill.
    - If workflow id is set and no edit screen is selected, it shows the edit workflow canvas.



## Home
The homepage components can be found in the home directory. This includes the overall home page and the recent work table.

### Home component
This is the entry point for the home landing page. It handles the basic rendering of the homepage and loading of the recent work if any is present in the DB.

- Renders create tiles.
    - **Build Workflow**: Creates a new workflow. Opens the CreateWorkflow component. Editing happens in the EditWorkflow component.
    - **Add Agents**: Create or edit an agent. Opens the EditAgent component.
    - **Add Models**: Create or edit a model. Opens the EditModel component.
    - **Add Skills**: Create or edit a skill. Opens the EditSkill component.

### RecentWork
This renders a table showing all of the agents, models, skills and workflows in the DB.

- **icons**: A map for showing icons for workflow, agent, model or skill. Additional types can be added here.
- **click()**: Method for selecting a workflow, agent, model or skill. Will set the correct edit screen to show, (agent, model or skill. Workflows doen't use an edit screen), or it will set the workflow id which will show the workflow canvas.
- **download()**: Function for downloading a workflow, agent, model or skill.
- **copyWork()**: Function for duplicating a workflow, agent, model or skill and creating a new one.
- **deleteWork()**: Function for deleting a workflow, agent, model or skill from the DB.

## Layout
All of the edit screens use the BuildLayout component in the layout folder. It handles the layout of the page and whether panels such as the properties panel or chat panel should be shown.

### BuildLayout
This is the component that renders components in the proper containers. It also manages classes on the main structure to handle layout when certain elements are not present.

#### Different states
The menu, properties and chat panels can be opened or closed in any combination. The content are will resize accordingly.

-**menu**: Content going in the left pane.
-**content**: Children nodes in the wrapper are placed in the main content area.
-**properties**: A right pane used to show properties of the workflow, agent, model or skill.
-**chat**: A drawer for showing chat.


No menu, properties or chat
```
---------------------------------
|       content full width      |
---------------------------------
```

With menu, no properties or chat
```
---------------------------------
|menu|        content           |
---------------------------------
```

With menu and properties, no chat
```
---------------------------------
|menu|     content      | props |
---------------------------------
```

With properties, no menu or chat
```
---------------------------------
|        content        | props |
---------------------------------
```

With menu, props and chat
```
---------------------------------
|menu|     content      | chat  |
---------------------------------
```

With chat, no menu or props
```
---------------------------------
|        content         | chat |
---------------------------------
```

There is a useEffect watching properties, chat, menu and showMenu that modifies the CSS classes on the wrapper to control layout.

```javascript
// Updates CSS classes based on elements shown
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
```
Styles for controlling layout can be found in `./styles/build.css`
```css

.build-layout {
    display: grid;
    grid-template-columns: 270px 1fr 0; /* menu open, properties closed */
    transition: all .3s ease-out;
}

/* menu and properties panels open */
.build-layout-properties {
    grid-template-columns: 270px 1fr 540px;
}

/* menu closed and properties panel open */
.build-layout-properties.menu-closed {
    grid-template-columns: 0 1fr 540px;
}

```
The chat panel uses Drawer from Ant Design so it slides over content.

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

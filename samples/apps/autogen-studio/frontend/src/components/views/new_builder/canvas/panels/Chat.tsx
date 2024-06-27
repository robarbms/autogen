import React, { MouseEventHandler } from "react";
import ChatBox from "../../../playground/chatbox";
import { IChatSession } from "../../../../types";
import { appContext } from "../../../../../hooks/provider";

// Chat properties
type ChatProps = {
  workflow_id: number;
  close: MouseEventHandler;
  setMessages: (messages: any[]) => void;
}

/**
 * Renders the chat menu for testing a workflow
 * @param props 
 * @returns 
 */
const Chat = (props: ChatProps) => {
    const { user } = React.useContext(appContext);
    const { workflow_id, setMessages } = props;

    const dummySession: IChatSession = {
        user_id: user?.email || "test_session_user_id",
        workflow_id,
        name: "test_session",
      };
    return (
        <div className="build-chat h-full">
            <ChatBox
              returnMessages={setMessages}
              initMessages={[]}
              session={dummySession}
              heightOffset={100}
            />
        </div>
    )
}

export default Chat;
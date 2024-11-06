"use client";

import {
  useCopilotAction,
  extract,
  useCopilotContext,
  useCopilotMessagesContext,
} from "@copilotkit/react-core";
import { useState } from "react";

export default function Home() {
  useIntegryCopilotKitIntegration();
  return (
    <div className="flex items-center justify-center min-h-screen">
      Integry CopilotKit Integration
    </div>
  );
}

function useIntegryCopilotKitIntegration() {
  const generalContext = useCopilotContext();
  const messagesContext = useCopilotMessagesContext();
  const context = { ...generalContext, ...messagesContext };

  useCopilotAction({
    name: "findAndExecuteFunction",
    description: `
    Find and execute a function.
    If the user asks you to perform a function not provided to you by
    the system, call this tool. It will search a catalog of functions
    and execute the one that best matches the user's request.
    It will also inform the user if it couldn't find a function that matches.
    `,
    parameters: [
      {
        name: "query",
        description: "The query to search for a function",
        type: "string",
      },
    ],
    renderAndWait: ({ args, handler, status }) => {
      if (status === "inProgress") {
        return <div>Loading...</div>;
      } else if (status === "executing") {
        // At this point, the args are ready to be accessed. You could call
        // into your backend here to find the fitting function / UI definitions.

        // In this example, the UI is rendered directly inside of the chat.
        // It would also be possible to render a separate UI in a modal / popup.

        const execute = () => {
          return fakeExecutingFunction(context, args.query);
        };
        return (
          <ExecutionPrompt args={args} handler={handler} execute={execute} />
        );
      } else {
        return <div>Executed: {args.query}</div>;
      }
    },
  });
}

function ExecutionPrompt({
  args,
  handler,
  execute,
}: {
  args: any;
  handler: any;
  execute: () => Promise<any>;
}) {
  const [buttonActive, setButtonActive] = useState(false);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div>Do you want to execute the query: {args.query}?</div>
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 text-white rounded ${
            buttonActive ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={async () => {
            setButtonActive(true);
            const result = await execute();
            setButtonActive(false);
            handler({ result });
          }}
          disabled={buttonActive}
        >
          Execute
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() =>
            handler(
              "Function cancelled by the user. This is not an issue, it's ok."
            )
          }
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

async function fakeExecutingFunction(context: any, query: string) {
  const { fakeJSONResult } = await extract({
    context,
    instructions:
      "The user asked to find and execute a function. You are given a query." +
      "Make up a fake JSON result that can be used to simulate executing a function.",
    parameters: [
      {
        name: "fakeJSONResult",
        description:
          "A fake JSON result that can be used to simulate executing a function.",
        type: "string",
      },
    ],
    data: {
      query,
    },
  });
  return fakeJSONResult;
}

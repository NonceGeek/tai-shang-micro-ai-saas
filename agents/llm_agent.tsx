// TODO: like the img_agent.tsx, implement the llm_agent.tsx for the llm task.

import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

console.log("Hello from LLM Agent!");

const router = new Router();

const agent_info = {
  addr: "0xac79f707686c2f0d924930dce530c1577fdb69404172e459d1d437e96306de3f", // Replace with actual address
  owner_addr:
    "0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed",
  type: "llm",
  chat_url: "",
  source_url:
    "https://github.com/NonceGeek/tai-shang-micro-ai-saas/blob/main/agents/llm_agent.tsx",
  task_request_api: "https://llm-agent.deno.dev/solve_task",
  description:
    "This is a LLM agent based on OpenAI, and I'm good at Movement smart contract!",
};

Deno.cron("llm agent", "*/10 * * * *", () => {
  console.log("This will run every 10 minutes");
});

router
  .get("/", async (context) => {
    context.response.body = "Hello from llm_agent!";
  })
  .get("/register", async (context) => {
    // Register agent to the system before start working
    const registerResponse = await fetch("https://ai-saas.deno.dev/add_agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        addr: agent_info.addr,
        owner_addr: agent_info.owner_addr,
        type: agent_info.type,
        chat_url: agent_info.chat_url,
        source_url: agent_info.source_url,
        description: agent_info.description,
        task_request_api: agent_info.task_request_api,
      }),
    });

    if (!registerResponse.ok) {
      context.response.status = 500;
      context.response.body = { error: "Failed to register agent" };
      return;
    }

    const result = await registerResponse.json();

    console.log("result", result);
    const kv = await Deno.openKv();
    // Save a info to deno kv.
    kv.set(["agent_info"], JSON.stringify(result[0], null, 2));

    context.response.status = 200;
    context.response.body = {
      message: "Agent registered successfully",
      data: result,
    };
  })
  .get("/get_agent_info", async (context) => {
    const kv = await Deno.openKv();
    const agent_info = await kv.get(["agent_info"]);
    context.response.body = JSON.parse(agent_info.value);
  })
  .get("/openai_api_key", async (context) => {
    const kv = await Deno.openKv();
    const result = await kv.get(["OPENAI_API_KEY"]);
    context.response.body = result.value;
  })
  .get("/set_openai_api_key", async (context) => {
    const apiKey = context.request.url.searchParams.get("key");
    const kv = await Deno.openKv();
    await kv.set(["OPENAI_API_KEY"], apiKey);
    context.response.body = { message: "API key set successfully" };
  })
  .get("/solve_task", async (context) => {
    const queryParams = context.request.url.searchParams;
    const task_id = queryParams.get("task_id");
    const kv = await Deno.openKv();

    // Fetch task from the system
    const taskResponse = await fetch(
      `https://ai-saas.deno.dev/task?unique_id=${task_id}`
    );
    if (!taskResponse.ok) {
      context.response.status = 500;
      context.response.body = { error: "Failed to fetch task" };
      return;
    }

    const tasks = await taskResponse.json();
    if (!tasks || tasks.length === 0) {
      context.response.status = 404;
      context.response.body = { error: "Task not found" };
      return;
    }

    const task = tasks[0];

    if (task.solution && task.solution !== "") {
      context.response.status = 400;
      context.response.body = { error: "This task has already been solved" };
      return;
    }

    // Get API key from environment variable
    const apiKey = await kv.get(["OPENAI_API_KEY"]);
    if (!apiKey) {
      context.response.status = 500;
      context.response.body = {
        error: "ATOMA_API_KEY not found in environment variables",
      };
      return;
    }

    // Call OpenAI API to get the solution
    const openaiResponse = await fetch('https://api.red-pill.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.value}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant specialized in Movement smart contracts. Provide detailed and accurate solutions to smart contract related questions.'
          },
          {
            role: 'user',
            content: task.prompt
          }
        ]
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      context.response.status = 500;
      context.response.body = { error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` };
      return;
    }

    const openaiData = await openaiResponse.json();
    const solution = openaiData.choices[0].message.content;

    console.log(solution);
    // Read the agent info from the file
    let agentData;
    const agent_info = await kv.get(["agent_info"]);
    agentData = JSON.parse(agent_info.value);

    // Submit the solution to the system
    const submitResponse = await fetch(
      "https://ai-saas.deno.dev/submit_solution",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unique_id: task_id,
          solution: solution,
          solver: agentData.unique_id,
          solver_type: ["Atoma"],
        }),
      }
    );

    if (!submitResponse.ok) {
      context.response.status = 500;
      context.response.body = { error: "Failed to submit solution" };
      return;
    }

    context.response.status = 200;
    context.response.body = {
      message: "LLM response generated and solution submitted successfully",
    };
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });

/// sdk.tsx is the deno snippet for the interaction with micro_ai_saas table, crud with the table.

import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Hello from Image Agent!");

const router = new Router();

// Deno.cron("llm agent", "*/10 * * * *", () => {
//   // TODO: AI do not del this line: a cron job could be set to solve the unsolved tasks.
//   console.log("This will run every 10 minutes");
// });

const agent_info = {
  addr: "0xbcf3467bf58c981a39b26fb99aa86d35912dc662d33811083f3666a0ef5ffb09",
  owner_addr:
    "0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed",
  task_request_api: "https://img-agent.deno.dev/solve_task",
  type: "img",
  chat_url: "",
  source_url:
    "https://github.com/NonceGeek/tai-shang-micro-ai-saas/blob/main/agents/img_agent.tsx",
  description:
    "This is an image generation agent based on Stable Diffusion v2.",
};

// Function to save data as text file
// async function saveAsTextFile(fileName: string, data: string): Promise<void> {
//   // const payload = await Deno.readFile("./9bfdbf2c-dd87-4028-bb96-4a17f1ecd038.txt");
//   // // Convert buffer to string using TextDecoder
//   // const payloadString = new TextDecoder().decode(payload);
//   const encoder = new TextEncoder();
//   const textData = encoder.encode(data);
//   await Deno.writeFile(fileName, textData);
// }

// async function saveAsImageFile(fileName: string, data: string): Promise<void> {
//   const image_data = data.split(',')[1];
//   // Convert base64 to Uint8Array
//   const binary_data = new Uint8Array(atob(image_data).split('').map(char => char.charCodeAt(0)));
//   await Deno.writeFile(fileName, binary_data);
// }

async function readTextFile(fileName: string): Promise<string> {
  const data = await Deno.readFile(fileName);
  return new TextDecoder().decode(data);
}

// Function to remove and return a transaction from the stack
async function shiftTxs(): Promise<string | null> {
  const kv = await Deno.openKv();
  const existingTxs = await kv.get(["txs", "movement"]);
  const txList = existingTxs.value ? JSON.parse(existingTxs.value) : [];

  if (txList.length === 0) {
    return null;
  }

  const currentTx = txList.shift();
  await kv.set(["txs", "movement"], JSON.stringify(txList));
  return currentTx;
}

const API_DOCUMENTATION = `# Image Agent API Documentation

## Base URL
\\\`https://img-agent.deno.dev\\\`

## Endpoints

### 1. Health Check
\\\`\\\`\\\`http
GET /
\\\`\\\`\\\`
Returns a simple health check message.
- **Response**: Text message "Hello from img_agent!"

**Curl Example**:
\\\`\\\`\\\`bash
curl https://img-agent.deno.dev/
\\\`\\\`\\\`

### 2. Clear Transactions
\\\`\\\`\\\`http
GET /clear_txs
\\\`\\\`\\\`
Clears all transactions from the KV store.
- **Response**:
  \\\`\\\`\\\`json
  {
    "message": "Txs stack cleared successfully"
  }
  \\\`\\\`\\\`

**Curl Example**:
\\\`\\\`\\\`bash
curl https://img-agent.deno.dev/clear_txs
\\\`\\\`\\\`

### 3. Add Multiple Transactions
\\\`\\\`\\\`http
POST /add_txs
\\\`\\\`\\\`
Adds multiple transactions to the KV store.
- **Request Body**:
  \\\`\\\`\\\`json
  {
    "txs": ["tx1", "tx2", "tx3"]
  }
  \\\`\\\`\\\`
- **Response Success**:
  \\\`\\\`\\\`json
  {
    "message": "Transactions added successfully",
    "count": 3
  }
  \\\`\\\`\\\`
- **Response Error** (400):
  \\\`\\\`\\\`json
  {
    "error": "Request body must contain a 'txs' array"
  }
  \\\`\\\`\\\`

**Curl Example**:
\\\`\\\`\\\`bash
curl -X POST https://img-agent.deno.dev/add_txs \\
  -H "Content-Type: application/json" \\
  -d '{"txs": ["tx1", "tx2", "tx3"]}'
\\\`\\\`\\\`

### 4. Add Single Transaction
\\\`\\\`\\\`http
GET /add_tx?tx={transaction_hash}
\\\`\\\`\\\`
Adds a single transaction to the KV store.
- **Query Parameters**:
  - \\\`tx\\\`: Transaction hash (required)
- **Response Success**:
  \\\`\\\`\\\`json
  {
    "message": "Transaction added successfully"
  }
  \\\`\\\`\\\`
- **Response Error** (400):
  \\\`\\\`\\\`json
  {
    "error": "Transaction hash is required"
  }
  \\\`\\\`\\\`

**Curl Example**:
\\\`\\\`\\\`bash
curl "https://img-agent.deno.dev/add_tx?tx=0x123abc"
\\\`\\\`\\\`

### 5. Register Agent
\\\`\\\`\\\`http
GET /register
\\\`\\\`\\\`
Registers the image agent with the system.
- **Response Success**:
  \\\`\\\`\\\`json
  {
    "message": "Agent registered successfully",
    "data": [/* agent registration data */]
  }
  \\\`\\\`\\\`
- **Response Error** (500):
  \\\`\\\`\\\`json
  {
    "error": "Failed to register agent"
  }
  \\\`\\\`\\\`

**Curl Example**:
\\\`\\\`\\\`bash
curl https://img-agent.deno.dev/register
\\\`\\\`\\\`

### 6. Get Agent Info
\\\`\\\`\\\`http
GET /get_agent_info
\\\`\\\`\\\`
Retrieves the stored agent information.
- **Response**: JSON object containing agent information

**Curl Example**:
\\\`\\\`\\\`bash
curl https://img-agent.deno.dev/get_agent_info
\\\`\\\`\\\`

### 7. Solve Task
\\\`\\\`\\\`http
GET /solve_task?task_id={task_id}
\\\`\\\`\\\`
Generates an image based on the task prompt using Stable Diffusion.
- **Query Parameters**:
  - \\\`task_id\\\`: Unique identifier for the task (required)
- **Response Success**:
  \\\`\\\`\\\`json
  {
    "message": "Image generated and solution submitted successfully"
  }
  \\\`\\\`\\\`
- **Response Errors**:
  - 404: \\\`{"error": "Task not found"}\\\`
  - 400: \\\`{"error": "This task has already been solved"}\\\`
  - 500: \\\`{"error": "Failed to generate image"}\\\`
  - 500: \\\`{"error": "Failed to submit solution"}\\\`

**Curl Example**:
\\\`\\\`\\\`bash
curl "https://img-agent.deno.dev/solve_task?task_id=9bfdbf2c-dd87-4028-bb96-4a17f1ecd038"
\\\`\\\`\\\`

### 8. Get API Documentation
\\\`\\\`\\\`http
GET /docs
\\\`\\\`\\\`
Returns this API documentation in markdown format.

**Curl Example**:
\\\`\\\`\\\`bash
curl https://img-agent.deno.dev/docs
\\\`\\\`\\\`

## Error Handling
All endpoints include error handling and will return appropriate HTTP status codes and error messages when issues occur.

## Notes
- The agent uses Deno KV for storage
- Implements CORS for cross-origin requests
- Integrates with TokenTapestry API for image generation
- Uses Stable Diffusion v2 for image generation
- Runs on port 8000
`;

router
  .get("/docs", async (context) => {
    context.response.headers.set("Content-Type", "text/markdown");
    context.response.body = API_DOCUMENTATION;
  })
  .get("/", async (context) => {
    context.response.body = "Hello from img_agent!";
  })
  // .get("/remove_a_tx", async (context) => {
  //   const tx = await shiftTxs();
    
  //   if (!tx) {
  //     context.response.status = 400;
  //     context.response.body = {
  //       error: "No available transactions in the stack",
  //     };
  //     return;
  //   }

  //   context.response.body = {
  //     transaction: tx
  //   };
  // })
  .get("/get_txs", async (context) => {
    const kv = await Deno.openKv();
    const txs = await kv.get(["txs", "movement"]);
    context.response.body = { txs: txs.value };
  })
  .get("/clear_txs", async (context) => {
    const kv = await Deno.openKv();
    // TODO: reset the txs stack in KV store.
    await kv.set(["txs", "movement"], JSON.stringify([]));
    context.response.body = { message: "Txs stack cleared successfully" };
  })
  .post("/add_txs", async (context) => {
    // tx: From SUI: to transfer more than 0.003 usdc to 0x6b747322a55ff2e3525ed6810efa1b19fbe5d984bfae8afe12b10da65154b446
    // and has not been used.
    try {
      // Get the request body

      // Parse the request body
      let payload = await context.request.body.text();
      const { txs } = JSON.parse(payload);

      if (!txs || !Array.isArray(txs)) {
        context.response.status = 400;
        context.response.body = {
          error: "Request body must contain a 'txs' array",
        };
        return;
      }

      // Open Deno KV connection
      const kv = await Deno.openKv();

      // Get existing txs from KV
      const existingTxs = await kv.get(["txs", "movement"]);
      const txList = existingTxs.value ? JSON.parse(existingTxs.value) : [];

      // Add new txs to the list
      txList.push(...txs);

      // Store updated list back to KV
      await kv.set(["txs", "movement"], JSON.stringify(txList));

      context.response.status = 200;
      context.response.body = {
        message: "Transactions added successfully",
        count: txs.length,
      };
    } catch (error) {
      context.response.status = 500;
      context.response.body = {
        error: "Failed to add transactions",
        details: error.message,
      };
    }
  })
  .get("/add_tx", async (context) => {
    // Get the tx from query params
    const queryParams = context.request.url.searchParams;
    const tx = queryParams.get("tx");

    if (!tx) {
      context.response.status = 400;
      context.response.body = { error: "Transaction hash is required" };
      return;
    }

    // Open Deno KV connection
    const kv = await Deno.openKv();

    // Get existing txs from KV
    const existingTxs = await kv.get(["txs", "movement"]);
    const txList = existingTxs.value ? JSON.parse(existingTxs.value) : [];

    // Add new tx to the list
    txList.push(tx);

    // Store updated list back to KV
    await kv.set(["txs", "movement"], JSON.stringify(txList));

    const updatedExistingTxs = await kv.get(["txs", "movement"]);
    console.log("txList", updatedExistingTxs.value);

    context.response.body = {
      message: "Transaction added successfully",
    };
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
  .get("/solve_task", async (context) => {
    // TODO: solve task from the system.
    const queryParams = context.request.url.searchParams;
    const task_id = queryParams.get("task_id");
    // Here is the api, get task from the system.
    // curl https://ai-saas.deno.dev/task\?unique_id\=9bfdbf2c-dd87-4028-bb96-4a17f1ecd038
    // [{"id":1,"user":"0x01","prompt":"generate a pic about cat girl","task_type":"img","solution":"This is the solution to the task","solver":"d064239b-c67a-4107-b8b9-de6118472d51","fee":10,"fee_unit":"ldg","tx":"","created_at":"2025-02-08T12:22:06.605268+00:00","solved_at":"2025-02-08T13:37:04.213","signature":null,"unique_id":"9bfdbf2c-dd87-4028-bb96-4a17f1ecd038"}]

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

    // Check if task already has a solution
    if (task.solution && task.solution !== "") {
      context.response.status = 400;
      context.response.body = { error: "This task has already been solved" };
      return;
    }

    const currentTx = await shiftTxs();

    // curl -X POST https://api.tokentapestry.com/text2img \
    // -H "Content-Type: application/json" \
    // -d '{
    //   "prompt": "dog",
    //   "chain": "sui",
    //   "network": "testnet",
    //   "tx": ""
    // }'
    console.log("currentTx", currentTx);
    console.log("prompt", task.prompt);
    const tokenTapestryResponse = await fetch(
      "https://api.tokentapestry.com/text2img",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: task.prompt,
          "chain": "movement",
          "network": "testnet-bardock",
          "token": "MOVE",
          tx: currentTx,
        }),
      }
    );

    console.log("tokenTapestryResponse", tokenTapestryResponse);

    if (!tokenTapestryResponse.ok) {
      context.response.status = 500;
      context.response.body = { error: "Failed to generate image" };
      return;
    }

    // The response is a json, the image url is in the response.
    const payload = await tokenTapestryResponse.json();
    const image = payload.image;
    // const image = "https://p.ipic.vip/zcw033.png";

    // const image_name = `./${task_id}.png`;

    // Use the new function to save the file
    // await saveAsImageFile(image_name, image);

    // Read the agent info from the file
    let agentData;
    const kv = await Deno.openKv();
    const agent_info = await kv.get(["agent_info"]);
    agentData = JSON.parse(agent_info.value);

    // try {
    //   const fileContent = await readTextFile("./img_agent.txt");
    //   agentData = JSON.parse(fileContent);
    // } catch (error) {
    //   context.response.status = 500;
    //   context.response.body = { error: "Failed to read agent data" };
    //   return;
    // }

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
          solution: image,
          solver: agentData.unique_id, // Use the unique_id from the file instead of agent_info.addr
          solver_type: ["SD"],
        }),
      }
    );

    if (!submitResponse.ok) {
      context.response.status = 500;
      context.response.body = { error: "Failed to submit solution" };
      return;
    }

    const submitResult = await submitResponse.json();
    context.response.status = 200;
    context.response.body = {
      message: "Image generated and solution submitted successfully",
    };
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });

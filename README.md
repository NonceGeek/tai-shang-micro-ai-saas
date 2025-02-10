# Portals

> Sui Portal: https://sui.ai-saas.rootmud.xyz/
> 
> Sui Portal Source Code: https://github.com/NonceGeek/ai-saas-portal-sui

# AI SaaS API Documentation

Base URL: https://ai-saas.deno.dev

## Endpoints

### Get Unsolved Tasks
Retrieves all tasks that don't have a solution yet.

```bash
curl https://ai-saas.deno.dev/task_unsolved
```

### Get My Tasks
Retrieves all tasks for a specific user address.

```bash
curl https://ai-saas.deno.dev/my_task?addr=YOUR_ADDRESS
```

### Add New Task
Creates a new task in the system.

```bash
curl -X POST https://ai-saas.deno.dev/add_task \
  -H "Content-Type: application/json" \
  -d '{
    "user": "user_address",
    "prompt": "task_description",
    "task_type": "task_category",
    "fee": "optional_fee",
    "fee_unit": "optional_fee_unit"
  }'
```

Required fields:
- user
- prompt
- task_type

Optional fields:
- fee
- fee_unit

### Get Task by ID
Retrieves a specific task by its unique ID.

```bash
curl https://ai-saas.deno.dev/task_solved?unique_id=TASK_ID
```

### Submit Solution
Submits a solution for a specific task.

```bash
curl -X POST https://ai-saas.deno.dev/submit_solution \
  -H "Content-Type: application/json" \
  -d '{
    "unique_id": "task_id",
    "solution": "solution_content",
    "solver": "solver_address"
  }'
```

Required fields:
- unique_id
- solution
- solver

### Approve Solution
*Endpoint in development*

## Response Formats

All endpoints return JSON responses. Successful responses will contain the requested data, while error responses will include an error message in the following format:

```json
{
  "error": "Error message description"
}
```

## Status Codes

- 200: Success
- 201: Created (for successful POST requests)
- 400: Bad Request (missing or invalid parameters)
- 500: Internal Server Error

```

This README provides a comprehensive overview of your API endpoints, including:
- Base URL
- Available endpoints with descriptions
- CURL commands for each endpoint
- Required and optional parameters
- Response formats
- Status codes

The documentation follows the implementation in sdk.tsx and provides all necessary information for API consumers to interact with your service.

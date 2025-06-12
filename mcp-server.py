import sys, json

echo_tool = {
    "name": "echo",
    "description": "Echo back a message",
    "inputSchema": {
        "type": "object",
        "properties": {"message": {"type": "string"}},
        "required": ["message"],
        "additionalProperties": False,
    },
}

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        msg = json.loads(line)
    except json.JSONDecodeError:
        continue
    method = msg.get("method")
    if method == "initialize":
        resp = {
            "jsonrpc": "2.0",
            "id": msg.get("id"),
            "result": {
                "protocolVersion": msg.get("params", {}).get("protocolVersion"),
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "EchoPy", "version": "1.0.0"},
            },
        }
        sys.stdout.write(json.dumps(resp) + "\n")
        sys.stdout.flush()
    elif method == "tools/list":
        resp = {"jsonrpc": "2.0", "id": msg.get("id"), "result": {"tools": [echo_tool]}}
        sys.stdout.write(json.dumps(resp) + "\n")
        sys.stdout.flush()
    elif method == "tools/call":
        args = msg.get("params", {}).get("arguments", {})
        text = args.get("message", "")
        resp = {"jsonrpc": "2.0", "id": msg.get("id"), "result": {"content": [{"type": "text", "text": text}]}}
        sys.stdout.write(json.dumps(resp) + "\n")
        sys.stdout.flush()

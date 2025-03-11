# MCPGod
> Fine-grained control over model context protocol (MCP) clients, servers, and tools. Context is God.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mcpgod.svg)](https://npmjs.org/package/mcpgod)
[![Downloads/week](https://img.shields.io/npm/dw/mcpgod.svg)](https://npmjs.org/package/mcpgod)
[![License](https://img.shields.io/npm/l/mcpgod.svg)](LICENSE)

## Overview

**MCPGod** is a CLI tool designed to help developers manage MCP servers with speed and ease. Whether you need to add, run, list, or remove servers—or even interact with server tools—**MCPGod** provides a streamlined interface to handle all these tasks on Windows, macOS, or Linux.

## Features

- **Client Management**  
  Add, remove, and list MCP servers for specific clients.
- **Tool Discovery**
  List every tool on any MCP server.
- **Tool Calling**
  Run any tool on any MCP server directly from the command line.
- **Tool/Client Permissions**
  Allow or block specific tools for specific clients.
- **Detailed Logging**
  Log every server run from every client, with timestamps and clean output for easy debugging.

## Installation

Install **mcpgod** globally using `npm`:

```sh
npm install -g mcpgod
```

Verify the installation:

```sh
god --version
```

Or run directly with `npx`.

```sh
npx -y mcpgod
```

## Usage

Access the CLI with the `god` command (or `npx -y mcpgod`). Below are some common examples:

- **Add a Server to a Client**

  Add an MCP server to a client (e.g., Claude) with `god add <SERVER> -c <CLIENT>`:

  ```sh
  god add @modelcontextprotocol/server-everything -c claude
  ```

- **Only Add Specific Tools to a Client**

  Only add specific tools to a client with `god add <SERVER> -c <CLIENT> --tools=<COMMA_DELIMITED_LIST>`:

  ```sh
  god add @modelcontextprotocol/server-everything -c claude --tools=echo,add
  ```

- **List Servers for a Client**

  List all configured servers for a specific client with `god list -c <CLIENT>`:

  ```sh
  god list -c claude
  ```

- **Remove a Server**

  Remove an MCP server from your client's configuration with `god remove <SERVER> -c <CLIENT>`:

  ```sh
  god remove @modelcontextprotocol/server-everything -c claude
  ```

- **Run a Server**

  Run a server process with detailed logging with `god run <SERVER>`:

  ```sh
  god run @modelcontextprotocol/server-everything
  ```

- **List Available Tools for a Server**

  Display the list of tools available on a server with `god tools <SERVER>`:

  ```sh
  god tools @modelcontextprotocol/server-everything
  ```

- **Call a Specific Tool on a Server**

  Interact with a tool by passing key-value properties with `god tool <SERVER> <TOOL> [optional parameters]`:

  ```sh
  god tool @modelcontextprotocol/server-everything add a=59 b=40
  ```

For a complete list of commands and options, simply run:

```sh
god --help
```


## Logging

When running a server, **mcpgod** logs output to:

```plaintext
~/mcpgod/logs
```

Each log file is organized by server name and timestamped to help you trace and debug any issues that arise.

## Development

**mcpgod** is built with the [Oclif](https://oclif.io) framework and uses the [Model Context Protocol SDK](https://modelcontextprotocol.org) for robust interactions with MCP servers.

Clone the repository to get started with development:

```sh
git clone https://github.com/mcpgod/cli.git
cd mcpgod
npm install
```

Run the CLI in development mode:

```sh
./bin/dev
```

## Contributing

Contributions are always welcome! To contribute:

1. **Fork** the repository.
2. **Create a branch**:  
   ```sh
   git checkout -b feature/your-feature
   ```
3. **Make your changes**, and commit them:  
   ```sh
   git commit -am 'Add new feature'
   ```
4. **Push** your branch:  
   ```sh
   git push origin feature/your-feature
   ```
5. **Open a Pull Request** on GitHub.

## License

This project is licensed under the [MIT License](LICENSE).

---

## Additional Resources

- [Oclif CLI Framework](https://oclif.io)
- [Model Context Protocol](https://modelcontextprotocol.org)
- [npm Package mcpgod](https://npmjs.org/package/mcpgod)

---

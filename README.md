# mcpgod
> Manage MCP servers with ease

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mcpgod.svg)](https://npmjs.org/package/mcpgod)
[![Downloads/week](https://img.shields.io/npm/dw/mcpgod.svg)](https://npmjs.org/package/mcpgod)
[![License](https://img.shields.io/npm/l/mcpgod.svg)](LICENSE)

## Overview

**mcpgod** is a modern CLI tool designed to help developers manage MCP servers with speed and ease. Whether you need to add, run, list, or remove servers—or even interact with server tools—**mcpgod** provides a streamlined interface to handle all these tasks on Windows, macOS, or Linux.

## Features

- **Server Management**  
  Add, remove, and list MCP servers for specific clients.
- **Run Servers**  
  Execute and log server processes with robust cross-platform support.
- **Tool Integration**  
  Discover and interact with tools on your server seamlessly.
- **Interactive & Non-Interactive Modes**  
  Enjoy optimal experiences in both TTY and non-TTY environments.
- **Cross-Platform Configuration**  
  Automatically uses platform-specific paths for configuration files.
- **Detailed Logging**  
  Logs every server run with timestamps and clean output for easy debugging.

## Installation

Install **mcpgod** globally using npm:

```sh
npm install -g mcpgod
```

Verify the installation:

```sh
god --version
```

## Usage

Access the CLI with the `god` command. Below are some common examples:

- **Add a Server**

  Add an MCP server for a client (e.g., Claude):

  ```sh
  god add <MCP_SERVER> -c claude
  ```

- **List Servers for a Client**

  List all configured servers for a specific client:

  ```sh
  god list -c claude
  ```

- **Remove a Server**

  Remove an MCP server from your client's configuration:

  ```sh
  god remove <MCP_SERVER> -c claude
  ```

- **Run a Server**

  Run a server process with detailed logging:

  ```sh
  god run <PACKAGE_NAME> [additional arguments]
  ```

- **List Available Tools for a Server**

  Display the list of tools available on a server:

  ```sh
  god tools <SERVER>
  ```

- **Call a Specific Tool on a Server**

  Interact with a tool by passing key-value properties:

  ```sh
  god tool <SERVER> <TOOL> key1=value1 key2=value2
  ```

For a complete list of commands and options, simply run:

```sh
god --help
```

## Configuration

**mcpgod** manages server configurations by updating a client-specific JSON file:

- **Windows:**
  ```plaintext
  %APPDATA%\Claude\claude_desktop_config.json
  ```
- **macOS/Linux:**
  ```plaintext
  ~/Library/Application Support/Claude/claude_desktop_config.json
  ```

Ensure your client configuration file exists or create it as needed.

## Logging

When running a server, **mcpgod** logs output to:

```plaintext
~/mcpgod/logs
```

Each log file is timestamped to help you trace and debug any issues that arise.

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
npm run dev -- <command>
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

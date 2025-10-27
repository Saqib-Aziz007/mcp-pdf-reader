# MCP PDF Reader Server

A Model Context Protocol (MCP) server that enables AI assistants like Claude, Windsurf, and other MCP-compatible tools to read and analyze PDF files.

## Features

- 📄 Read PDF files from **local paths or URLs**
- 🔍 Search for specific terms within PDFs
- 📊 Get PDF metadata (page count, author, title, etc.)
- 📖 Read specific pages or page ranges
- 🌐 Download and analyze PDFs from the web
- 🤖 Seamless integration with AI assistants via MCP

## Installation

### Using npm

```bash
npm install -g @dev.saqibaziz/mcp-pdf-reader
```

### Using npx (no installation required)

```bash
npx @dev.saqibaziz/mcp-pdf-reader
```

## Configuration

### For Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pdf-reader": {
      "command": "npx",
      "args": ["-y", "@dev.saqibaziz/mcp-pdf-reader"]
    }
  }
}
```

### For Windsurf

**Option 1: Via Plugin Store (Coming Soon)**

- Open Windsurf
- Click the `Plugins` icon in Cascade panel
- Search for "PDF Reader"
- Click `Install`

**Option 2: Manual Configuration**

Edit your MCP configuration file:

**macOS**: `~/Library/Application Support/Windsurf/User/globalStorage/codeium.codeium/mcp_config.json`
**Windows**: `%APPDATA%\Windsurf\User\globalStorage\codeium.codeium\mcp_config.json`
**Linux**: `~/.config/Windsurf/User/globalStorage/codeium.codeium/mcp_config.json`

```json
{
  "mcpServers": {
    "pdf-reader": {
      "command": "npx",
      "args": ["-y", "@dev.saqibaziz/mcp-pdf-reader"]
    }
  }
}
```

After adding, click the refresh button in the Plugins panel.

### For Cline

Add this to your MCP settings file:

```json
{
  "mcpServers": {
    "pdf-reader": {
      "command": "npx",
      "args": ["-y", "@dev.saqibaziz/mcp-pdf-reader"]
    }
  }
}
```

## Available Tools

The server provides the following tools to AI assistants:

### `read_pdf_pages`

Read specific pages from a PDF file.

**Parameters:**

- `pdf_path` (string): Path to the PDF file
- `pages` (array): List of page numbers to read

### `read_pdf_page_range`

Read a range of pages from a PDF file.

**Parameters:**

- `pdf_path` (string): Path to the PDF file
- `start_page` (number): First page to read (inclusive)
- `end_page` (number): Last page to read (inclusive)

### `search_pdf`

Search for terms in a PDF file and return pages containing them.

**Parameters:**

- `pdf_path` (string): Path to the PDF file
- `terms` (string or array): Search term(s)

### `get_pdf_metadata`

Get metadata from a PDF file (page count, author, title, etc.).

**Parameters:**

- `pdf_path` (string): Path to the PDF file

## Usage Examples

Once configured, you can ask your AI assistant:

**Local Files:**
- "Read pages 1-5 from document.pdf"
- "Search for 'machine learning' in research.pdf"
- "What's the metadata of report.pdf?"
- "Read page 10 from presentation.pdf"

**URLs:**
- "Read this PDF: https://example.com/research-paper.pdf"
- "Search for 'climate change' in https://example.com/report.pdf"
- "Get metadata from https://arxiv.org/pdf/2301.00001.pdf"
- "Read pages 1-3 from https://example.com/whitepaper.pdf"

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/Saqib-Aziz007/mcp-pdf-reader.git
cd mcp-pdf-reader

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm start` - Run the compiled server
- `npm run prepare` - Pre-install build hook

## Technical Details

This MCP server is built with:

- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk) - MCP SDK for TypeScript
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF parsing library
- TypeScript for type safety

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

**Muhammad Saqib Aziz**

- Email: saqib.aziz1000@gmail.com
- GitHub: [@Saqib-Aziz007](https://github.com/Saqib-Aziz007)
- npm: [@saqibaziz](https://www.npmjs.com/~dev.saqibaziz)

## Support

If you encounter any issues or have questions:

- Open an issue on [GitHub](https://github.com/Saqib-Aziz007/mcp-pdf-reader/issues)
- Check the [MCP documentation](https://modelcontextprotocol.io/)

## Acknowledgments

Built with the Model Context Protocol by Anthropic.

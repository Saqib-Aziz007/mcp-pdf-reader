#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import pdf from "pdf-parse";
import path from "path";

interface PDFMetadata {
  title?: string;
  author?: string;
  pages: number;
  created?: Date;
}

interface PDFContent {
  text: string;
  metadata: PDFMetadata;
}

class PDFReaderServer {
  private server: Server;
  private pdfCache: Map<string, PDFContent> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: "pdf-reader-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "read_pdf",
          description:
            "Read and extract text content from a PDF file. Returns the full text content and metadata.",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Absolute or relative path to the PDF file",
              },
            },
            required: ["path"],
          },
        },
        {
          name: "read_pdf_page",
          description:
            "Read a specific page or range of pages from a PDF file.",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Absolute or relative path to the PDF file",
              },
              page: {
                type: "number",
                description: "Page number to read (1-indexed)",
              },
              startPage: {
                type: "number",
                description: "Start page for range (1-indexed)",
              },
              endPage: {
                type: "number",
                description: "End page for range (1-indexed)",
              },
            },
            required: ["path"],
          },
        },
        {
          name: "get_pdf_metadata",
          description:
            "Get metadata information from a PDF file without reading all content.",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Absolute or relative path to the PDF file",
              },
            },
            required: ["path"],
          },
        },
        {
          name: "search_pdf",
          description: "Search for specific text within a PDF file.",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Absolute or relative path to the PDF file",
              },
              query: {
                type: "string",
                description: "Text to search for",
              },
              caseSensitive: {
                type: "boolean",
                description: "Whether search should be case-sensitive",
                default: false,
              },
            },
            required: ["path", "query"],
          },
        },
      ] as Tool[],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Missing arguments for tool call",
            },
          ],
        };
      }

      try {
        switch (name) {
          case "read_pdf":
            if (typeof args.path !== "string") {
              throw new Error("path must be a string");
            }
            return await this.handleReadPDF(args.path);

          case "read_pdf_page":
            if (typeof args.path !== "string") {
              throw new Error("path must be a string");
            }
            return await this.handleReadPDFPage(
              args.path,
              args.page as number | undefined,
              args.startPage as number | undefined,
              args.endPage as number | undefined
            );

          case "get_pdf_metadata":
            if (typeof args.path !== "string") {
              throw new Error("path must be a string");
            }
            return await this.handleGetMetadata(args.path);

          case "search_pdf":
            if (typeof args.path !== "string") {
              throw new Error("path must be a string");
            }
            if (typeof args.query !== "string") {
              throw new Error("query must be a string");
            }
            return await this.handleSearchPDF(
              args.path,
              args.query,
              args.caseSensitive as boolean | undefined
            );

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    });
  }

  private async loadPDF(filePath: string): Promise<PDFContent> {
    // Check cache first
    if (this.pdfCache.has(filePath)) {
      return this.pdfCache.get(filePath)!;
    }

    // Read and parse PDF
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    const content: PDFContent = {
      text: data.text,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        pages: data.numpages,
        created: data.info?.CreationDate,
      },
    };

    // Cache the result
    this.pdfCache.set(filePath, content);

    return content;
  }

  private async handleReadPDF(filePath: string) {
    const resolvedPath = path.resolve(filePath);
    const content = await this.loadPDF(resolvedPath);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              path: resolvedPath,
              text: content.text,
              metadata: content.metadata,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleReadPDFPage(
    filePath: string,
    page?: number,
    startPage?: number,
    endPage?: number
  ) {
    const resolvedPath = path.resolve(filePath);
    const content = await this.loadPDF(resolvedPath);

    const lines = content.text.split("\n");
    const totalPages = content.metadata.pages;

    // Simple page estimation (this is approximate)
    const linesPerPage = Math.ceil(lines.length / totalPages);

    let extractedText = "";

    if (page !== undefined) {
      // Single page
      const start = (page - 1) * linesPerPage;
      const end = page * linesPerPage;
      extractedText = lines.slice(start, end).join("\n");
    } else if (startPage !== undefined && endPage !== undefined) {
      // Page range
      const start = (startPage - 1) * linesPerPage;
      const end = endPage * linesPerPage;
      extractedText = lines.slice(start, end).join("\n");
    } else {
      throw new Error(
        "Must specify either 'page' or both 'startPage' and 'endPage'"
      );
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              path: resolvedPath,
              requestedPage: page,
              requestedRange:
                startPage && endPage ? { startPage, endPage } : undefined,
              text: extractedText,
              totalPages: totalPages,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleGetMetadata(filePath: string) {
    const resolvedPath = path.resolve(filePath);
    const content = await this.loadPDF(resolvedPath);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              path: resolvedPath,
              metadata: content.metadata,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleSearchPDF(
    filePath: string,
    query: string,
    caseSensitive: boolean = false
  ) {
    const resolvedPath = path.resolve(filePath);
    const content = await this.loadPDF(resolvedPath);

    const searchText = caseSensitive
      ? content.text
      : content.text.toLowerCase();
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    const matches: Array<{ line: number; text: string; context: string }> = [];
    const lines = content.text.split("\n");

    lines.forEach((line, index) => {
      const searchLine = caseSensitive ? line : line.toLowerCase();
      if (searchLine.includes(searchQuery)) {
        const contextStart = Math.max(0, index - 1);
        const contextEnd = Math.min(lines.length, index + 2);
        const context = lines.slice(contextStart, contextEnd).join("\n");

        matches.push({
          line: index + 1,
          text: line.trim(),
          context: context,
        });
      }
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              path: resolvedPath,
              query: query,
              matches: matches,
              totalMatches: matches.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("PDF Reader MCP Server running on stdio");
  }
}

// Start the server
const server = new PDFReaderServer();
server.run().catch(console.error);

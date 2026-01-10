#!/usr/bin/env python3
"""
Claude API with Advanced Tool Use Beta Features

Enables:
- Tool Search Tool (on-demand tool discovery)
- Programmatic Tool Calling (code-based tool orchestration)
- Tool Use Examples

Usage:
    python scripts/claude_beta.py "your prompt here"
"""

import os
import sys
import json
from anthropic import Anthropic

# Initialize client
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Your custom tools (can be extended)
TOOLS = [
    # Tool Search Tool - discovers tools on-demand
    {
        "type": "tool_search_tool_regex_20251119",
        "name": "tool_search"
    },
    # Code Execution - enables programmatic tool calling
    {
        "type": "code_execution_20250825",
        "name": "code_execution"
    },
    # Example custom tool with defer_loading
    {
        "name": "search_kb",
        "description": "Search the knowledge base for relevant information",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "limit": {"type": "integer", "default": 10}
            },
            "required": ["query"]
        },
        "defer_loading": True,  # Only loaded when needed
        "allowed_callers": ["code_execution_20250825"],  # Can be called from code
        "input_examples": [
            {"query": "react streaming hooks", "limit": 5},
            {"query": "webllm integration"}
        ]
    },
    {
        "name": "read_file",
        "description": "Read a file from the project",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path relative to project root"}
            },
            "required": ["path"]
        },
        "defer_loading": True,
        "allowed_callers": ["code_execution_20250825"]
    }
]


def chat_with_beta(prompt: str, model: str = "claude-sonnet-4-5-20250929"):
    """
    Send a message using beta features.

    Args:
        prompt: User message
        model: Model to use (claude-sonnet-4-5-20250929 or claude-opus-4-5-20251101)
    """
    print(f"\n🤖 Using model: {model}")
    print(f"📝 Prompt: {prompt}\n")
    print("-" * 50)

    try:
        response = client.beta.messages.create(
            betas=["advanced-tool-use-2025-11-20"],  # Enable beta features
            model=model,
            max_tokens=4096,
            tools=TOOLS,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Process response
        for block in response.content:
            if block.type == "text":
                print(f"\n💬 Response:\n{block.text}")
            elif block.type == "tool_use":
                print(f"\n🔧 Tool Call: {block.name}")
                print(f"   Input: {json.dumps(block.input, indent=2)}")
            elif block.type == "server_tool_use":
                print(f"\n⚡ Server Tool: {block.name}")
                if hasattr(block, 'input') and 'code' in block.input:
                    print(f"   Code:\n{block.input['code']}")

        print("\n" + "-" * 50)
        print(f"📊 Usage: {response.usage.input_tokens} in / {response.usage.output_tokens} out")
        print(f"💰 Est. cost: ${(response.usage.input_tokens * 0.003 + response.usage.output_tokens * 0.015) / 1000:.4f}")

        return response

    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def main():
    if len(sys.argv) < 2:
        print("Usage: python claude_beta.py 'your prompt'")
        print("\nExamples:")
        print("  python claude_beta.py 'Analyze src/core/*.ts files and find patterns'")
        print("  python claude_beta.py 'Search KB for react streaming and summarize'")
        sys.exit(1)

    prompt = " ".join(sys.argv[1:])

    # Use Opus for complex tasks, Sonnet for simple
    model = "claude-opus-4-5-20251101" if any(kw in prompt.lower() for kw in
        ["architect", "design", "complex", "analyze all"]) else "claude-sonnet-4-5-20250929"

    chat_with_beta(prompt, model)


if __name__ == "__main__":
    main()

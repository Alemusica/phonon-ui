# Knowledge Base Integration

## MCP Tools Available

### search(query, source?, limit?)
Universal search across KB (papers, code, Q&A).
```
search("react streaming hooks")
search("webgpu compute shader", source="github")
```

### research(topic, sources?, max_items?)
Fetch and ingest new knowledge from external sources.
```
research("webllm react integration")
research("swiss typography css", sources="npm,github")
```

### find_experience(problem, problem_type?)
Find similar problem-solving experiences from past sessions.
```
find_experience("streaming parser state machine", problem_type="implementation")
```

### record_experience(problem_type, problem_description, solution_steps, outcome, tags)
Save successful solutions for future reference.

### get_context(entity_name)
Get GraphRAG context for a concept.
```
get_context("golden_ratio_spacing")
```

## When to Use KB

### Before Implementation
1. `search()` for existing patterns
2. `find_experience()` for similar problems
3. `get_context()` for concept deep-dives

### During Research
1. `plan_research()` to strategize
2. `research()` to ingest new knowledge
3. `search()` to verify ingestion

### After Success
1. `record_experience()` to save solution
2. Helps future sessions and other projects

## Relevant Knowledge Domains

For Phonon UI, prioritize:
- `npm` - React/TypeScript packages
- `github` - Similar implementations
- `stackoverflow` - React patterns, TypeScript issues
- `arxiv` - WebGPU research (if needed)

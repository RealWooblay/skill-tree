# Skill Tree

An AI-assisted learning planner that turns an open-ended goal into a structured, visual progression of skills, prerequisites, resources, and practical quests.

Skill Tree starts with a short clarifying dialogue, asks about the learner's goals and experience, and generates a branching roadmap from beginner foundations to advanced work. Progress, completed quests, and XP are kept locally in the browser.

## What it demonstrates

- Multi-stage AI generation: clarification first, structured planning second
- A graph-shaped learning model with prerequisite relationships
- Interactive node exploration, quest tracking, unlocks, and XP progression
- Defensive parsing and normalization of model-generated JSON
- A server-side OpenAI integration that keeps the API key out of the browser

## Architecture

```text
Learner goal and answers
          |
          v
Next.js API routes ---> OpenAI chat completions
          |                 |
          +---- structured JSON response
                            |
                            v
React skill-tree UI ---> browser localStorage
```

The Next.js application contains both the React interface and server routes. The server builds context from the learner's answers and requests either follow-up questions or a complete skill-tree document. The client validates and normalizes that document before rendering the graph and storing local progress.

## Run locally

Requirements: Node.js, npm, and an OpenAI API key.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your key to `.env.local`, then open `http://localhost:3000`.

## Privacy and operational notes

- `OPENAI_API_KEY` is read only by server routes and is not committed.
- Learning goals and questionnaire answers are sent to OpenAI to generate the plan.
- Skill trees and completion state are stored in browser `localStorage`; this prototype has no user database.
- A production deployment would still need authentication, rate limiting, usage controls, model/schema upgrades, and stronger output validation.

## Status

This is a completed product prototype and is not under active development. It is published as an example of AI workflow design, structured generation, and interactive product engineering.

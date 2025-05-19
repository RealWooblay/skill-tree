import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { prompt, messages } = await req.json()

        if (!prompt) {
            console.error("No prompt provided")
            return NextResponse.json(
                { error: "No prompt provided" },
                { status: 400 }
            )
        }

        console.log("Generating skill tree for prompt:", prompt)

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: `You are an expert skill tree generator. Your task is to create a comprehensive learning path that spans from beginner to advanced levels based on the user's input.

The skill tree should follow these rules:
1. Create a minimum of 15-20 nodes spanning from absolute beginner to advanced levels
2. Each node represents a skill or concept to learn
3. Nodes should be organized in a logical progression with clear prerequisites
4. Each node should have:
   - A clear, specific title
   - A detailed description of what will be learned
   - 3-5 quests (learning tasks) that are specific and actionable
   - 2-3 relevant, high-quality resources (courses, videos, articles)
5. Include XP values for each node (50-200 XP based on complexity)
6. Mark the first node as unlocked, others as locked
7. Use appropriate colors for different types of nodes:
   - Theory nodes: #34D399 (green)
   - Practical nodes: #9333EA (purple)
   - Test nodes: #F472B6 (pink)
8. Position nodes in a logical layout:
   - Root node at (500, 100)
   - Level 1 nodes at y=200, spread horizontally
   - Level 2 nodes at y=300, spread horizontally
   - Level 3 nodes at y=400, spread horizontally
   - Level 4 nodes at y=500, spread horizontally
   - Level 5 nodes at y=600, spread horizontally
9. Each quest should be specific and actionable with clear success criteria
10. Resources should be high-quality and up-to-date

Format the response as a JSON object with this structure:
{
  "title": "Skill Tree Title",
  "description": "Detailed description of the learning path",
  "nodes": [
    {
      "id": "unique-id",
      "title": "Node Title",
      "description": "Detailed node description",
      "level": 1,
      "position": { "x": 100, "y": 100 },
      "completed": false,
      "locked": false,
      "parentIds": [],
      "color": "#34D399",
      "xp": 100,
      "type": "theory",
      "quests": [
        {
          "id": "quest-1",
          "title": "Quest Title",
          "description": "Detailed quest description with success criteria",
          "completed": false,
          "resources": [
            {
              "type": "course",
              "title": "Resource Title",
              "url": "https://example.com",
              "description": "Brief description of the resource"
            }
          ]
        }
      ]
    }
  ]
}`
                },
                {
                    role: "user",
                    content: `Based on the following conversation, generate a comprehensive skill tree:\n\n${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}`
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        })

        const content = completion.choices[0].message.content
        if (!content) {
            console.error("No content in OpenAI response")
            throw new Error("No content in response")
        }

        console.log("Received response from OpenAI:", content)

        let skillTree
        try {
            skillTree = JSON.parse(content)
        } catch (e) {
            console.error("Failed to parse OpenAI response as JSON:", e)
            throw new Error("Invalid JSON response from OpenAI")
        }

        // Validate the skill tree structure
        if (!skillTree.title || !skillTree.description || !Array.isArray(skillTree.nodes)) {
            console.error("Invalid skill tree structure:", skillTree)
            throw new Error("Invalid skill tree structure")
        }

        // Ensure all required fields are present in each node
        skillTree.nodes = skillTree.nodes.map((node: any, index: number) => {
            // Generate unique IDs if not present
            const nodeId = node.id || `node-${index}`

            return {
                ...node,
                id: nodeId,
                completed: node.completed ?? false,
                locked: node.locked ?? (index === 0 ? false : true), // First node unlocked, others locked
                quests: (node.quests || []).map((quest: any, questIndex: number) => ({
                    ...quest,
                    id: quest.id || `quest-${nodeId}-${questIndex}`,
                    completed: quest.completed ?? false,
                    resources: quest.resources || []
                }))
            }
        })

        console.log("Generated skill tree:", skillTree)

        return NextResponse.json(skillTree)
    } catch (error) {
        console.error("Error generating skill tree:", error)
        return NextResponse.json(
            { error: "Failed to generate skill tree", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
} 
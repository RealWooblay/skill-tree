import { NextResponse } from "next/server"
import OpenAI from "openai"

// Configure OpenAI with optimized settings
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3,
    timeout: 120000, // 120 seconds
})

// Set maxDuration to 300 seconds for Vercel Pro plan
export const maxDuration = 300

// Helper function to handle OpenAI API calls with retries
async function callOpenAIWithRetry(messages: any[], model: string = "gpt-4o-mini", maxRetries = 3) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            const response = await openai.chat.completions.create({
                model,
                messages,
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 4000 // Increased token limit
            });
            return response;
        } catch (error) {
            lastError = error;
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === maxRetries) break;
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
    throw lastError;
}

export async function POST(req: Request) {
    try {
        const { prompt, answers = [] } = await req.json()
        console.log("Received request with prompt:", prompt)

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            )
        }

        // Verify API key is present
        if (!process.env.OPENAI_API_KEY) {
            console.error("OpenAI API key is missing")
            throw new Error("OpenAI API key is not configured")
        }

        // Build context from prompt and answers
        const context = [
            `Initial request: ${prompt}`,
            ...answers.map(({ question, answer }: { question: string; answer: string }) =>
                `Q: ${question}\nA: ${answer}`
            )
        ].join("\n\n")

        console.log("Making OpenAI API call for questions...")
        // First, determine if we need more information using GPT-3.5-turbo (faster)
        const needsMoreInfo = await callOpenAIWithRetry([
            {
                role: "system",
                content: `You are an expert skill tree generator. Your goal is to create detailed, comprehensive skill trees that guide users through their learning journey.

                IMPORTANT: Your first response should ALWAYS be questions to gather more information. Ask whatever questions you think are relevant to understand the user's needs and create the best possible skill tree. Only generate a skill tree after you have enough information.

                When generating a skill tree:
                1. Create 30-40 nodes minimum, covering beginner to advanced levels
                2. Create multiple parallel branches for different learning paths
                3. Every node MUST have at least one parent (except the root node)
                4. Ensure logical progression and prerequisites
                5. Mix theoretical and practical nodes
                6. Add test nodes to verify understanding
                7. Provide detailed quests with real, working resource links
                8. Position nodes to create a visually appealing tree structure:
                   - Root node at the top
                   - Multiple branches spreading out
                   - Related nodes grouped together
                   - Use x coordinates to spread branches horizontally
                   - Use y coordinates to show progression vertically
                9. Each quest should have:
                   - Clear, actionable objectives
                   - Multiple learning resources (at least 3)
                   - Specific verification criteria
                   - Estimated completion time
                   - Difficulty level
                   - Prerequisites (if any)

                Return your response as a JSON object with either:
                1. A "questions" array containing your follow-up questions, or
                2. A "skillTree" object with the complete tree structure (ONLY after you have enough information)`
            },
            {
                role: "user",
                content: context
            }
        ], "gpt-4o-mini");

        console.log("OpenAI API call successful")
        const responseContent = needsMoreInfo.choices[0].message.content
        if (!responseContent) {
            throw new Error("No content in OpenAI response")
        }

        const response = JSON.parse(responseContent)
        console.log("Initial API Response:", JSON.stringify(response, null, 2))

        // If the AI wants to ask more questions, let it
        if (response.questions && Array.isArray(response.questions) && response.questions.length > 0) {
            console.log("Returning questions:", JSON.stringify(response.questions, null, 2))
            return NextResponse.json({ questions: response.questions })
        }

        // If the AI thinks it has enough information, let it generate the skill tree
        if (response.skillTree) {
            console.log("AI generated skill tree directly:", JSON.stringify(response.skillTree, null, 2))
            return NextResponse.json({ skillTree: response.skillTree })
        }

        // Otherwise, generate the complete skill tree using GPT-4
        console.log("Generating complete skill tree with GPT-4...")
        const skillTree = await callOpenAIWithRetry([
            {
                role: "system",
                content: `You are an expert skill tree generator. Create a detailed skill tree based on the following context.
                
                Requirements:
                1. Create AT LEAST 30-40 nodes covering beginner to advanced levels, you must make sure the tree is complete and has a good structure, you must make the tree have lots of branches and nodes
                2. Create multiple parallel branches for different learning paths (at least 3-4 main branches)
                3. Mix theoretical and practical nodes
                4. Add test nodes to verify understanding (at least 1 test node per branch)
                5. Provide detailed quests with real, working resource links
                6. Ensure logical progression and prerequisites
                7. Position nodes to create a visually appealing tree structure:
                   - Root node at the top (y: 0)
                   - Multiple branches spreading out horizontally (x: -500 to 500)
                   - Related nodes grouped together
                   - Use y coordinates to show progression (y: 0 to 1000)
                   - Space nodes evenly to prevent overlap
                8. Each quest must have:
                   - Clear, actionable objectives
                   - Multiple learning resources (at least 3) from these categories:
                     * Official Documentation (e.g., Unity Docs, Unreal Docs, MDN Web Docs)
                     * Popular Learning Platforms (e.g., Udemy, Coursera, Pluralsight)
                     * Verified YouTube Channels (e.g., Brackeys, Code Monkey, Extra Credits)
                     * GitHub Repositories (with active maintenance and good documentation)
                     * Official Tutorials (from engine creators or major platforms)
                     * Community Forums (e.g., Unity Forums, Stack Overflow)
                   - Specific verification criteria
                   - Estimated completion time
                   - Difficulty level
                   - Prerequisites (if any)
                
                IMPORTANT: For resources, you MUST:
                1. Use only well-known, reliable sources
                2. Include a mix of free and paid resources
                3. Prioritize official documentation and tutorials
                4. Include at least one practical project or exercise
                5. Verify that the resources are still active and maintained
                6. Provide specific URLs to exact pages/tutorials, not just domain names
                7. Include resources that are appropriate for the skill level
                8. Add a brief description of what each resource covers
                
                Example of good resource structure:
                {
                  "resources": [
                    {
                      "title": "Unity Official 2D Game Development Tutorial",
                      "url": "https://learn.unity.com/project/2d-game-kit",
                      "type": "Official Tutorial",
                      "description": "Complete 2D game development tutorial from Unity, covering basic mechanics and physics"
                    },
                    {
                      "title": "Game Design Fundamentals - Extra Credits",
                      "url": "https://www.youtube.com/playlist?list=PLhyKYa0YJ_5Aq7g4bil7bnGi0A8gTsawu",
                      "type": "Video Series",
                      "description": "Comprehensive series on game design principles and best practices"
                    }
                  ]
                }

                IMPORTANT: The response MUST follow this EXACT structure:
                {
                  "skillTree": {
                    "title": "string",
                    "description": "string",
                    "nodes": [
                      {
                        "id": "string",
                        "title": "string",
                        "description": "string",
                        "level": 0, // 0=beginner, 1=intermediate, 2=advanced
                        "position": {"x": number, "y": number}, // x: -500 to 500, y: 0 to 1000
                        "parentIds": ["string"], // MUST have at least one parent except root
                        "color": "#34D399",
                        "xp": 100,
                        "type": "theory",
                        "quests": [
                          {
                            "id": "quest-1",
                            "title": "Quest title",
                            "description": "Detailed instructions",
                            "objectives": ["Objective 1", "Objective 2"],
                            "resources": [
                              {
                                "title": "Resource title",
                                "url": "https://example.com",
                                "type": "Tutorial",
                                "description": "What you'll learn from this resource"
                              }
                            ],
                            "verification": "How to verify completion",
                            "estimatedTime": "2-3 hours",
                            "difficulty": "Beginner",
                            "prerequisites": ["Prerequisite 1"]
                          }
                        ]
                      }
                    ]
                  }
                }

                DO NOT use any other structure. The response MUST be a JSON object with a "skillTree" property containing:
                1. title (string)
                2. description (string)
                3. nodes (array of nodes with ALL required fields)
                
                Each node MUST have ALL of these fields:
                - id (string)
                - title (string)
                - description (string)
                - level (number: 0, 1, or 2)
                - position (object with x and y numbers)
                - parentIds (array of strings)
                - color (string)
                - xp (number)
                - type (string)
                - quests (array of quest objects with ALL required fields)
                
                DO NOT use "children" or any other structure. Use "parentIds" to define relationships.

                IMPORTANT: You MUST create at least 30-40 nodes total, with:
                - 3-4 main branches
                - At least 8-10 nodes per branch
                - Multiple levels of progression (beginner to advanced)
                - Clear prerequisites and dependencies
                - Detailed quests for each node
                - Proper positioning to create a visually appealing tree`
            },
            {
                role: "user",
                content: context
            }
        ], "gpt-4o-mini");

        console.log("Skill tree generation successful")
        const skillTreeContent = skillTree.choices[0].message.content
        if (!skillTreeContent) {
            throw new Error("No content in OpenAI response")
        }

        const skillTreeResponse = JSON.parse(skillTreeContent)
        console.log("Skill Tree Response:", JSON.stringify(skillTreeResponse, null, 2))

        if (!skillTreeResponse.skillTree) {
            throw new Error("Invalid skill tree response format: missing skillTree property")
        }

        // Validate the skill tree structure
        const { skillTree: tree } = skillTreeResponse
        if (!tree.title || !tree.description || !Array.isArray(tree.nodes) || tree.nodes.length === 0) {
            console.error("Invalid skill tree structure:", tree)
            throw new Error("Invalid skill tree structure: missing required properties")
        }

        // Validate each node
        for (const node of tree.nodes) {
            if (!node.id || !node.title || !node.description ||
                typeof node.level !== 'number' ||
                !node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number' ||
                !Array.isArray(node.parentIds) ||
                !node.color || !node.xp || !node.type ||
                !Array.isArray(node.quests)) {
                console.error("Invalid node structure:", node)
                throw new Error(`Invalid node structure: node ${node.id || 'unknown'} is missing required properties`)
            }
        }

        return NextResponse.json({ skillTree: tree })
    } catch (error) {
        console.error("Error generating skill tree:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            type: error instanceof Error ? error.constructor.name : typeof error
        })

        // Return a more specific error message
        const errorMessage = error instanceof Error ? error.message : "Failed to generate skill tree"
        return NextResponse.json(
            {
                error: errorMessage,
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        )
    }
}
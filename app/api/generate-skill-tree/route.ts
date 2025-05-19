import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { prompt, answers = [] } = await req.json()

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            )
        }

        // Build context from prompt and answers
        const context = [
            `Initial request: ${prompt}`,
            ...answers.map(({ question, answer }: { question: string; answer: string }) =>
                `Q: ${question}\nA: ${answer}`
            )
        ].join("\n\n")

        // First, determine if we need more information
        const needsMoreInfo = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: `You are an expert skill tree generator. Your goal is to create detailed, comprehensive skill trees that guide users through their learning journey.

                    IMPORTANT: Your first response should ALWAYS be questions to gather more information. Ask whatever questions you think are relevant to understand the user's needs and create the best possible skill tree. Only generate a skill tree after you have enough information.

                    When generating a skill tree:
                    1. Create 20-30 nodes minimum, covering beginner to advanced levels
                    2. Every node MUST have at least one parent (except the root node)
                    3. Ensure logical progression and prerequisites
                    4. Mix theoretical and practical nodes
                    5. Add test nodes to verify understanding
                    6. Provide detailed quests with real, working resource links

                    Return your response as a JSON object with either:
                    1. A "questions" array containing your follow-up questions, or
                    2. A "skillTree" object with the complete tree structure (ONLY after you have enough information)

                    The skillTree object must have:
                    {
                      "title": "string",
                      "description": "string",
                      "nodes": [
                        {
                          "id": "string",
                          "title": "string",
                          "description": "string",
                          "level": 0, // 0=beginner, 1=intermediate, 2=advanced
                          "position": {"x": number, "y": number},
                          "parentIds": ["string"], // MUST have at least one parent except root
                          "color": "string",
                          "xp": number,
                          "type": "string",
                          "quests": [
                            {
                              "id": "string",
                              "title": "string",
                              "description": "string",
                              "resources": [
                                {
                                  "title": "string",
                                  "url": "string",
                                  "type": "string"
                                }
                              ],
                              "verification": "string"
                            }
                          ]
                        }
                      ]
                    }`
                },
                {
                    role: "user",
                    content: context
                }
            ],
            response_format: { type: "json_object" }
        })

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

        // Otherwise, generate the complete skill tree
        const skillTree = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: `You are an expert skill tree generator. Create a detailed skill tree based on the following context.
                    
                    Requirements:
                    1. Create 30-50 nodes covering beginner to advanced levels
                    2. Include multiple branches for different learning paths
                    3. Mix theoretical and practical nodes
                    4. Add test nodes to verify understanding
                    5. Provide detailed quests with real, working resource links
                    6. Ensure logical progression and prerequisites
                    
                    Node Structure (REQUIRED fields):
                    {
                      "id": "unique-string-id",
                      "title": "Clear, specific title",
                      "description": "Detailed explanation",
                      "level": 0, // 0=beginner, 1=intermediate, 2=advanced
                      "position": {"x": 100, "y": 200},
                      "parentIds": ["parent-node-id"],
                      "color": "#34D399",
                      "xp": 100,
                      "type": "theory",
                      "quests": [
                        {
                          "id": "quest-1",
                          "title": "Quest title",
                          "description": "Detailed instructions",
                          "resources": [
                            {
                              "title": "Resource title",
                              "url": "https://example.com",
                              "type": "Tutorial"
                            }
                          ],
                          "verification": "How to verify completion"
                        }
                      ]
                    }
                    
                    IMPORTANT: Every node MUST have ALL of these fields:
                    - id (string)
                    - title (string)
                    - description (string)
                    - level (number: 0, 1, or 2)
                    - position (object with x and y numbers)
                    - parentIds (array of strings)
                    - color (string)
                    - xp (number)
                    - type (string)
                    - quests (array of quest objects)
                    
                    Return your response as a JSON object with a "skillTree" property containing:
                    1. title (string)
                    2. description (string)
                    3. nodes (array of nodes with ALL required fields)`
                },
                {
                    role: "user",
                    content: context
                }
            ],
            response_format: { type: "json_object" }
        })

        const skillTreeContent = skillTree.choices[0].message.content
        if (!skillTreeContent) {
            throw new Error("No content in OpenAI response")
        }

        const skillTreeResponse = JSON.parse(skillTreeContent)
        console.log("Skill Tree Response:", JSON.stringify(skillTreeResponse, null, 2))

        if (!skillTreeResponse.skillTree) {
            throw new Error("Invalid skill tree response format")
        }

        // Validate the skill tree structure
        const { skillTree: tree } = skillTreeResponse
        if (!tree.title || !tree.description || !Array.isArray(tree.nodes) || tree.nodes.length === 0) {
            console.error("Invalid skill tree structure:", tree)
            throw new Error("Invalid skill tree structure: missing required properties")
        }

        return NextResponse.json({ skillTree: tree })
    } catch (error) {
        console.error("Error generating skill tree:", error)
        return NextResponse.json(
            { error: "Failed to generate skill tree" },
            { status: 500 }
        )
    }
}
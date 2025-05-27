import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        if (!messages || !Array.isArray(messages)) {
            console.error("No messages provided")
            return NextResponse.json(
                { error: "No messages provided" },
                { status: 400 }
            )
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert learning path creator. Your task is to ask relevant follow-up questions to gather enough information to create a comprehensive skill tree.

Guidelines for questions:
1. Ask specific, targeted questions that will help understand the user's goals
2. Questions should build upon previous answers
3. Focus on gathering information to build a comprehensive skill tree
4. Keep questions concise and clear
5. Avoid asking questions that have already been answered
6. Adapt questions based on the user's responses

Respond with a single question that will help gather the most relevant information for creating a skill tree.`
                },
                ...messages,
            ],
            temperature: 0.7,
        })

        const question = completion.choices[0].message.content
        if (!question) {
            throw new Error("No question generated")
        }

        return NextResponse.json({ question })
    } catch (error) {
        console.error("Error generating question:", error)
        return NextResponse.json(
            { error: "Failed to generate question", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
} 
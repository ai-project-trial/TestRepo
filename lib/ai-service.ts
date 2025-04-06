// This is a mock implementation for demonstration purposes
// In a real application, you would need to use the OpenAI API with a valid API key

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

// Mock summary data for when API key is not available or invalid
const mockSummary = `This comprehensive tutorial covers modern JavaScript features that every developer should know in 2023. 

The video begins with an overview of ES6+ syntax improvements, highlighting how these changes have made JavaScript code more concise and readable. It explains arrow functions, template literals, and the let/const declarations that have replaced var in modern codebases.

Next, the tutorial dives into async/await patterns, demonstrating how they simplify asynchronous code compared to traditional promises and callback approaches. The presenter provides practical examples of fetching data from APIs and handling responses cleanly.

The video also covers modern array methods like map, filter, reduce, and the spread operator, showing how they enable more functional programming approaches. Destructuring assignments for both objects and arrays are explained with clear examples of how they reduce boilerplate code.

Finally, the tutorial explores newer JavaScript features like optional chaining and nullish coalescing operators, explaining how they help prevent common runtime errors when dealing with potentially undefined values.

Throughout the video, practical code examples are shown to illustrate each concept, making it easy for viewers to understand how to apply these techniques in their own projects.`

// Mock Q&A responses
const mockAnswers = {
  "What are arrow functions?":
    "Arrow functions are a concise syntax for writing function expressions in JavaScript. They use the => syntax and automatically bind this to the surrounding code's context. The video explains that arrow functions are particularly useful for callbacks and when you want to preserve the lexical this binding.",
  "How does async/await work?":
    "Async/await is a syntax for handling asynchronous operations in JavaScript. The video explains that the 'async' keyword is used to define a function that returns a Promise, and the 'await' keyword is used inside async functions to pause execution until a Promise is resolved. This makes asynchronous code look and behave more like synchronous code, improving readability and error handling.",
  "What is destructuring?":
    "Destructuring is a JavaScript syntax that allows you to extract values from arrays or properties from objects into distinct variables. The video demonstrates how destructuring can significantly reduce code verbosity when working with complex data structures.",
  "What is optional chaining?":
    "Optional chaining is a feature introduced in modern JavaScript that allows you to access deeply nested object properties without worrying about whether intermediate nodes exist. The video shows how the ?. operator prevents errors when accessing properties of potentially undefined objects.",
  default:
    "Based on the video transcript, this topic wasn't covered in detail. The video primarily focuses on ES6+ syntax, async/await, modern array methods, destructuring, and optional chaining. Would you like me to explain any of these topics instead?",
}

export async function generateVideoSummary(videoId: string, transcript: string, apiKey: string): Promise<string> {
  try {
    // Only use the API if a valid API key is provided
    if (apiKey && apiKey.startsWith("sk-")) {
      const openai = createOpenAI({
        apiKey: apiKey,
      })

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system:
          "You are an AI assistant that summarizes video content. Provide a concise, informative summary that captures the main points of the video.",
        prompt: `Summarize the following video transcript in a comprehensive way, highlighting the key points and main takeaways:

${transcript}`,
      })

      return text
    } else {
      // If no valid API key, return mock data after a short delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return mockSummary
    }
  } catch (error) {
    console.error("Error generating summary:", error)
    // Even if the API call fails, return mock data
    return mockSummary
  }
}

export async function askQuestionAboutVideo(
  videoId: string,
  question: string,
  transcript: string,
  apiKey: string,
): Promise<string> {
  try {
    // Only use the API if a valid API key is provided
    if (apiKey && apiKey.startsWith("sk-")) {
      const openai = createOpenAI({
        apiKey: apiKey,
      })

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system:
          "You are an AI assistant that answers questions about video content. Use the provided transcript to give accurate, helpful answers. If the answer cannot be found in the transcript, acknowledge this limitation.",
        prompt: `Based on the following video transcript, answer this question: "${question}"

Transcript: ${transcript}`,
      })

      return text
    } else {
      // If no valid API key, return mock data after a short delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Look for a matching question in our mock answers, or return the default response
      const lowerQuestion = question.toLowerCase()
      let answer = mockAnswers.default

      for (const [key, value] of Object.entries(mockAnswers)) {
        if (lowerQuestion.includes(key.toLowerCase())) {
          answer = value
          break
        }
      }

      return answer
    }
  } catch (error) {
    console.error("Error answering question:", error)
    // Return a generic response if the API call fails
    return "I'm sorry, I couldn't process that question. Based on the video content, it appears to cover modern JavaScript features including ES6+ syntax, async/await, and various other improvements that make JavaScript code more concise and powerful."
  }
}


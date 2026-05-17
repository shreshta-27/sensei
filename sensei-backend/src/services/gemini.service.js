import { GoogleGenerativeAI } from '@google/generative-ai';
import PQueue from 'p-queue';
import { callHuggingFace, callHuggingFaceJSON } from './huggingface.service.js';

const MODELS = ['gemini-1.5-flash', 'gemini-1.5-flash'];
const RETRY_DELAYS = [500, 1000, 2000];
const AI_TIMEOUT_MS = 60000;

let genAI = null;
const getGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const queue = new PQueue({
  concurrency: 2,
  interval: 60000,
  intervalCap: 14
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const callGemini = async (prompt, options = {}) => {
  const { systemPrompt, jsonMode = false, maxAttempts = 3, throwOnError = false } = options;

  const fullPrompt = jsonMode
    ? `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no backticks, no explanation.`
    : prompt;

  try {
    return await queue.add(async () => {
      let lastError = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let modelIndex = 0;
        if (attempt >= 2) modelIndex = 1;

        const modelName = MODELS[modelIndex];

        try {
          const client = getGenAI();
          const model = client.getGenerativeModel({ 
            model: modelName,
            systemInstruction: systemPrompt 
          });

          const result = await model.generateContent(fullPrompt);
          const response = await result.response;
          const text = response.text();
          
          if (!text) throw new Error('Empty response from Gemini');
          return text;
        } catch (error) {
          lastError = error;
          console.error(`[Gemini Attempt ${attempt + 1}] failed:`, error.message);
          if (attempt < maxAttempts - 1) {
            await sleep(RETRY_DELAYS[attempt] || 800);
          }
        }
      }

      throw lastError;
    });
  } catch (geminiError) {
    if (process.env.HF_TOKEN && process.env.HF_TOKEN !== 'hf_placeholder_token') {
      console.log('[AI Fallback] Gemini failed, trying HuggingFace...');
      try {
        return await callHuggingFace(fullPrompt, { systemPrompt });
      } catch (hfError) {
        if (throwOnError) throw hfError;
        console.warn('[AI Fallback] Both Gemini and HuggingFace failed. Using mock text fallback.');
        return getMockTextResponse(prompt);
      }
    }
    if (throwOnError) throw geminiError;
    console.warn('[AI Fallback] Gemini failed and HF not configured. Using mock text fallback.');
    return getMockTextResponse(prompt);
  }
};

export const callGeminiJSON = async (prompt, options = {}) => {
  let text;
  try {
    text = await callGemini(prompt, { ...options, jsonMode: true });
  } catch (error) {
    console.log('[AI Fallback] Gemini JSON failed, trying HuggingFace JSON...');
    try {
      if (process.env.HF_TOKEN && process.env.HF_TOKEN !== 'hf_placeholder_token') {
        const hfResult = await callHuggingFaceJSON(prompt, options);
        if (hfResult) {
          let isValid = true;
          if (prompt.includes('Overcome Learning Path') && (!hfResult.tasks || !hfResult.pastSummary)) isValid = false;
          if (prompt.includes('expert tutor') && (!hfResult.flowData || !hfResult.content)) isValid = false;
          if (prompt.includes('MCQ quiz') && (!Array.isArray(hfResult) && !hfResult.questions)) isValid = false;
          
          if (isValid) return hfResult;
          console.warn('[AI Fallback] HuggingFace returned invalid schema, falling back to mock.');
        }
      }
    } catch (hfError) {
      console.error('[AI Fallback] HuggingFace JSON also failed:', hfError.message);
    }

    console.error('[AI Fallback] Using Mock Data due to API Error:', error.message);
    if (prompt.includes('MCQ quiz')) {
      const topic = prompt.match(/"([^"]+)"/)?.[1] || 'the topic';
      return Array.from({ length: 10 }).map((_, i) => ({
        id: `q${i + 1}`,
        question: `Question ${i + 1} regarding ${topic}: What is an important aspect of ${topic} part ${i + 1}?`,
        options: [
          `Option A: Core concept ${i + 1}.1`,
          `Option B: Misconception ${i + 1}.2`,
          `Option C: Unrelated detail ${i + 1}.3`,
          `Option D: Edge case ${i + 1}.4`
        ],
        correctAnswer: `Option A: Core concept ${i + 1}.1`,
        explanation: `The correct answer is A because core concept ${i + 1}.1 is fundamental to understanding ${topic}.`,
        difficulty: 'intermediate',
        topic: topic
      }));
    }
    if (prompt.includes('study plan')) {
      const numDays = prompt.includes('14-day') ? 14 : 7;
      const topic = prompt.match(/"([^"]+)"/)?.[1] || 'Topic';
      return {
        title: `Study Plan for ${topic}`,
        totalDays: numDays,
        dailySessions: Array.from({ length: numDays }).map((_, i) => ({
          day: i + 1,
          topics: [`${topic} - Subtopic ${i * 2 + 1}`, `${topic} - Subtopic ${i * 2 + 2}`],
          activities: [`Read chapter ${i + 1} of the guide`, `Complete practice exercise ${i + 1}A`, `Watch video module ${i + 1}`],
          resources: [`https://example.com/resource/${i + 1}/a`, `https://example.com/resource/${i + 1}/b`]
        }))
      };
    }
    if (prompt.includes('Summarize this video')) {
      return { title: 'Mock Video Summary', summary: 'This is a mocked video summary because the AI limit was reached.', keyPoints: ['Key point 1', 'Key point 2', 'Key point 3'] };
    }
    if (prompt.includes('visual summary flashcards')) {
      return Array.from({ length: 6 }).map((_, i) => ({
        title: `Flashcard ${i + 1}`, keyPoint: `Mock key point ${i + 1}`, emoji: '💡', color: '#8b5cf6'
      }));
    }
    if (prompt.includes('career trajectories')) {
      return [
        {
          "type": "conservative",
          "title": "Corporate Development Path",
          "probability": 85,
          "targetRole": "Senior Systems Engineer",
          "expectedSalary": "$90k - $120k",
          "milestones": [
            { "month": 6, "title": "Associate Certification", "description": "Obtain AWS/Azure associate cert", "skills": ["Cloud"] },
            { "month": 12, "title": "Junior Role", "description": "Entry level position at a tech firm", "skills": ["Backend"] }
          ],
          "actions": ["Focus on DSA", "Learn System Design"],
          "narrative": "A steady climb through established tech corporations focusing on reliability and core engineering excellence."
        },
        {
          "type": "ambitious",
          "title": "Startup Technical Lead",
          "probability": 45,
          "targetRole": "CTO / Founding Engineer",
          "expectedSalary": "$110k + Equity",
          "milestones": [
            { "month": 4, "title": "Open Source Contributor", "description": "Contribute to major projects", "skills": ["Git", "Collaboration"] },
            { "month": 10, "title": "Seed Stage Hire", "description": "Join a well-funded early startup", "skills": ["Fullstack"] }
          ],
          "actions": ["Build 3 complex projects", "Network in Silicon Valley"],
          "narrative": "A high-risk, high-reward path starting from early-stage ventures to leadership roles in rapid-growth environments."
        },
        {
          "type": "wildcard",
          "title": "Indie Researcher & Creator",
          "probability": 25,
          "targetRole": "Independent Researcher / Consultant",
          "expectedSalary": "$70k - $200k",
          "milestones": [
            { "month": 8, "title": "Paper Publication", "description": "Publish a novel AI research paper", "skills": ["Research"] },
            { "month": 14, "title": "Consultancy Launch", "description": "Start high-end technical consulting", "skills": ["Business"] }
          ],
          "actions": ["Master niche tech", "Build personal brand"],
          "narrative": "An unconventional path focusing on deep specialization and intellectual property creation outside traditional employment."
        }
      ];
    }
    if (prompt.includes('Analyze the current job market')) {
      return {
        "trendingSkills": ["Python", "Machine Learning", "React", "Cloud Computing", "Cybersecurity"],
        "growthSectors": ["Artificial Intelligence", "Renewable Energy", "Fintech"],
        "demandScore": 85,
        "avgSalary": "$80k - $150k",
        "topRoles": ["AI Engineer", "Fullstack Developer", "Data Scientist", "Cloud Architect", "Security Analyst"]
      };
    }
    if (prompt.includes('Compare this student\'s profile')) {
      return {
        "score": 65,
        "gaps": ["Deep Learning", "Kubernetes", "System Design"],
        "strengths": ["JavaScript", "Problem Solving", "Collaboration"],
        "priority": ["System Design", "Cloud Computing", "Technical Writing"]
      };
    }
    if (prompt.includes('Overcome Learning Path')) {
      return {
        "pastSummary": "You've consistently struggled with applying theoretical concepts in practical scenarios, specifically falling behind in the System Design assignments due to time constraints.",
        "futureProjection": "By adopting structured practice sessions and reviewing core architectural patterns daily, you will transform this weakness into a core strength.",
        "chartData": [
          { "name": "Past", "score": 30 },
          { "name": "Current", "score": 50 },
          { "name": "Future Target", "score": 90 }
        ],
        "flowData": {
          "nodes": [
            { "id": "1", "position": { "x": 0, "y": 0 }, "data": { "label": "Acknowledge Weakness" } },
            { "id": "2", "position": { "x": 0, "y": 100 }, "data": { "label": "Build Foundations" } },
            { "id": "3", "position": { "x": 0, "y": 200 }, "data": { "label": "Mastery" } }
          ],
          "edges": [
            { "id": "e1-2", "source": "1", "target": "2" },
            { "id": "e2-3", "source": "2", "target": "3" }
          ]
        },
        "tasks": [
          {
            "day": 1,
            "title": "Topic Quiz",
            "description": "Play the foundational quiz to assess current level.",
            "type": "internal"
          },
          {
            "day": 2,
            "title": "Notebook Practice",
            "description": "Write down 5 key concepts in your notebook and upload a photo.",
            "type": "external"
          }
        ]
      };
    }
    if (prompt.includes('expert tutor') && prompt.includes('comprehensive note')) {
      const topicMatch = prompt.match(/"([^"]+)"/);
      const topic = topicMatch ? topicMatch[1] : 'Topic';
      const mainConcept = topic.split(' ')[0] || 'Concept';
      return {
        "title": `Comprehensive Guide: ${topic}`,
        "content": `# Understanding ${topic}\n\n${topic} represents a critical subject in your curriculum. This auto-generated note is designed to help you quickly grasp the core architecture.\n\n## Core Principles\n- **Scalability:** The ability to grow gracefully without breaking.\n- **Maintainability:** Writing clean, testable logic.\n- **Performance:** Optimizing data flow and processing.\n\n## Practical Application\nApply these concepts using best practices in your upcoming projects to secure high marks!`,
        "tags": [mainConcept.toLowerCase().replace(/[^a-z0-9]/g, ''), "study-notes", "ai-generated"],
        "flowData": {
          "nodes": [
            { "id": "1", "position": { "x": 0, "y": 0 }, "data": { "label": `${topic} Fundamentals` } },
            { "id": "2", "position": { "x": -100, "y": 100 }, "data": { "label": `Advanced ${mainConcept}` } },
            { "id": "3", "position": { "x": 100, "y": 100 }, "data": { "label": `${topic} Practical Apps` } },
            { "id": "4", "position": { "x": 0, "y": 200 }, "data": { "label": `${mainConcept} Mastery` } }
          ],
          "edges": [
            { "id": "e1-2", "source": "1", "target": "2" },
            { "id": "e1-3", "source": "1", "target": "3" },
            { "id": "e2-4", "source": "2", "target": "4" },
            { "id": "e3-4", "source": "3", "target": "4" }
          ]
        }
      };
    }
    if (prompt.includes('extract data for visualization')) {
      return {
        "chartType": "bar",
        "chartTitle": "Data Analysis Overview",
        "chartConfig": {
          "data": [
            { "name": "Metric A", "value": 85 },
            { "name": "Metric B", "value": 60 },
            { "name": "Metric C", "value": 90 }
          ],
          "xAxis": "Categories",
          "yAxis": "Values",
          "colors": ["#8b5cf6", "#f59e0b", "#10b981"]
        },
        "insights": ["Metric C shows the highest performance.", "Metric B requires further optimization."]
      };
    }
    return { mock: true, message: 'Fallback due to API error' };
  }

  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {}
    }
    throw new Error(`Failed to parse Gemini JSON response: ${parseError.message}`);
  }
};

const getMockTextResponse = (prompt) => {
  const lowercasePrompt = prompt.toLowerCase();
  const topic = extractTopic(prompt);
  
  if (lowercasePrompt.includes('mcq') || lowercasePrompt.includes('quiz')) {
    return `### 📝 AI-Generated Quiz: ${topic}
    
1. **What is the primary characteristic of ${topic}?**
   - (A) High scalability and parallel execution
   - (B) Unpredictable behavioral complexity
   - (C) Static, non-modifiable execution path
   - (D) Low memory footprint under load
   *Correct Answer: (A)*
   *Explanation: ${topic} emphasizes robust performance and linear scaling characteristics.*

2. **Which of the following represents a common real-world implementation issue?**
   - (A) Inadequate code documentation
   - (B) Infinite recursion or resource leaking
   - (C) Correct object mapping
   - (D) Inline formatting
   *Correct Answer: (B)*
   *Explanation: Processing high volumes without boundary checks in ${topic} causes severe memory leaks.*

3. **How is optimization typically achieved in modern systems for ${topic}?**
   - (A) Adding high CPU frequency vertically
   - (B) Distributing workflows horizontally across redundant nodes
   - (C) Decreasing internal transaction throughput
   - (D) Removing all cache-invalidation logic
   *Correct Answer: (B)*
   *Explanation: Horizontal expansion ensures high availability and horizontal scaling.*

4. **Which architectural design pattern is best suited for decoupling events in ${topic}?**
   - (A) Singleton Pattern
   - (B) Publisher-Subscriber (Pub-Sub) Pattern
   - (C) Monolithic coupling
   - (D) Factory Pattern
   *Correct Answer: (B)*
   *Explanation: Pub-Sub models allow completely isolated, asynchronous message broker handling.*

5. **What is a major technical trade-off when adopting this framework?**
   - (A) Deprecated security controls
   - (B) High initial latency during cold-start cycles
   - (C) Completely unconfigurable templates
   - (D) Requirement of specialized physical servers
   *Correct Answer: (B)*
   *Explanation: Distributing servers across serverless runtimes leads to cold-start delays.*`;
  }
  
  if (lowercasePrompt.includes('notes') || lowercasePrompt.includes('lecture') || lowercasePrompt.includes('material')) {
    return `# 📚 Complete Study Guide: ${topic}

## Introduction
This comprehensive lecture note provides a detailed deep dive into **${topic}**. Understanding these principles is pivotal for building resilient, industry-grade architectures.

## Core Concepts & Key Abstractions
1. **Decoupled Architecture**: Keeping different services completely independent to ensure single-point failure prevention.
2. **State Concurrency**: Managing multiple threads and race-conditions cleanly.
3. **Data Integrity**: Enforcing consistent transactions and data schemas.

---

## Practical Code Walkthrough
\`\`\`javascript
// Highly optimized event controller
async function processTask(event) {
  try {
    const validated = validateInput(event);
    const result = await executionPipeline(validated);
    return { success: true, payload: result };
  } catch (err) {
    console.error('Pipeline crashed:', err);
    return { success: false, error: err.message };
  }
}
\`\`\`

## Common Misconceptions
* *“It is too complex for standard enterprise apps.”* -> Actually, standard libraries make integration seamless.
* *“It causes substantial operational overhead.”* -> Managed cloud providers reduce overhead to near-zero.

## Summary
Adhering to these clean abstractions ensures your applications remain performant and scalable under peak request volumes.`;
  }
  
  if (lowercasePrompt.includes('summary')) {
    return `# 🔍 Concise Summary: ${topic}

## High-Level Definition
**${topic}** encapsulates the modern principles of system architecture, focusing on highly cohesive and loosely coupled designs.

## Primary Key Takeaways
* **Horizontal Scaling**: Always distribute loads horizontally rather than adding vertical machine size.
* **Non-Blocking IO**: Utilize modern async event loops to maximize CPU efficiency.
* **Comprehensive Metrics**: Integrate application performance monitoring (APM) tools early in the lifecycle.

## Summary Checklist
- [x] Clear understanding of state concurrency limitations.
- [x] Correct implementation of transaction isolation levels.
- [x] Integration of automated unit testing suites.`;
  }

  if (lowercasePrompt.includes('rubric') || lowercasePrompt.includes('assignment')) {
    return `# 📋 Rubric & Assignment Guide: ${topic}

## Practical Assignment
**Problem Statement:** Design and build a modular, decoupled microservice that demonstrates the principal concepts of **${topic}**. The service should handle request throttling, securely persist data, and execute within sub-second latencies.

---

## Grading Rubric (100 Points Total)

| Criteria | Max Points | Description |
| :--- | :--- | :--- |
| **Technical Execution** | 40 Points | Serves requests perfectly, handles edge cases gracefully, and has no race conditions. |
| **Architecture & Patterns** | 30 Points | Correct implementation of clean code patterns, separation of concerns, and meaningful variable names. |
| **Documentation** | 20 Points | A comprehensive README containing execution instructions, API specs, and configuration keys. |
| **Unit Testing** | 10 Points | Inclusions of test cases covering positive, negative, and extreme boundaries. |`;
  }

  return `# 💡 Lecture Materials on: ${topic}

This comprehensive dynamic overview covers the basic foundations, best practices, and implementation guidelines for **${topic}**. 

### Quick Reference:
* **Core Principle**: Loosely coupled architecture.
* **Key Goal**: Maximizing runtime performance.
* **Testing Standard**: Minimum 80% coverage on all business layers.`;
};

const extractTopic = (prompt) => {
  const match = prompt.match(/"([^"]+)"/);
  return match ? match[1] : 'the Selected Subject';
};

export default { callGemini, callGeminiJSON };

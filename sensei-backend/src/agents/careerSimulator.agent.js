import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { callGeminiJSON } from '../services/gemini.service.js';

const CareerState = Annotation.Root({
  interests: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  cgpa: Annotation({ reducer: (a, b) => b ?? a, default: () => 0 }),
  skills: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  targetCompanies: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  semester: Annotation({ reducer: (a, b) => b ?? a, default: () => 1 }),
  marketInsights: Annotation({ reducer: (a, b) => b ?? a, default: () => ({}) }),
  skillGaps: Annotation({ reducer: (a, b) => b ?? a, default: () => ({}) }),
  trajectories: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  resumeMatch: Annotation({ reducer: (a, b) => b ?? a, default: () => ({}) })
});

async function marketResearchNode(state) {
  const prompt = `Analyze the current job market for a student with these interests: ${state.interests.join(', ')}.
Target companies: ${state.targetCompanies.join(', ') || 'any top companies'}.

Return JSON:
{
  "trendingSkills": ["top 5 trending skills in these areas"],
  "growthSectors": ["top 3 growth sectors"],
  "demandScore": number 0-100 representing job demand,
  "avgSalary": "expected starting salary range",
  "topRoles": ["top 5 job roles matching interests"]
}`;
  const marketInsights = await callGeminiJSON(prompt);
  return { marketInsights };
}

async function skillGapNode(state) {
  const prompt = `Compare this student's profile to job requirements:
Student skills: ${state.skills.join(', ')}
Student CGPA: ${state.cgpa}
Required trending skills: ${state.marketInsights?.trendingSkills?.join(', ') || 'unknown'}
Target roles: ${state.marketInsights?.topRoles?.join(', ') || 'software engineer'}

Return JSON:
{
  "score": number 0-100 skill match score,
  "gaps": ["skills the student needs to learn"],
  "strengths": ["student's strong areas"],
  "priority": ["top 3 skills to learn first"]
}`;
  const resumeMatch = await callGeminiJSON(prompt);
  return { resumeMatch };
}

async function timelineNode(state) {
  const prompt = `Create 3 career trajectories for a student:
- Interests: ${state.interests.join(', ')}
- CGPA: ${state.cgpa}, Semester: ${state.semester}
- Current skills: ${state.skills.join(', ')}
- Skill gaps: ${state.resumeMatch?.gaps?.join(', ') || 'none identified'}
- Target companies: ${state.targetCompanies.join(', ') || 'top tech companies'}
- Market demand: ${state.marketInsights?.demandScore || 50}/100

Return JSON array of exactly 3 trajectories:
[
  {
    "type": "conservative",
    "title": "Conservative Path title",
    "probability": number 0-100,
    "targetRole": "specific job role",
    "expectedSalary": "salary range",
    "milestones": [
      { "month": 1, "title": "milestone", "description": "details", "skills": ["skill1"] }
    ],
    "actions": ["specific action items"],
    "narrative": "2-3 sentence narrative of this path"
  },
  { "type": "ambitious", ... },
  { "type": "wildcard", ... }
]

Conservative = safe, high probability. Ambitious = stretch goal. Wildcard = unconventional but exciting.`;

  const trajectories = await callGeminiJSON(prompt);
  return { trajectories: Array.isArray(trajectories) ? trajectories : [] };
}

async function riskNode(state) {
  const updated = (state.trajectories || []).map(t => ({
    ...t,
    probability: Math.min(99, Math.max(5, t.probability || 50))
  }));
  return { trajectories: updated };
}

const careerSimulatorGraph = new StateGraph(CareerState)
  .addNode('marketResearch', marketResearchNode)
  .addNode('skillGap', skillGapNode)
  .addNode('timeline', timelineNode)
  .addNode('risk', riskNode)
  .addEdge(START, 'marketResearch')
  .addEdge('marketResearch', 'skillGap')
  .addEdge('skillGap', 'timeline')
  .addEdge('timeline', 'risk')
  .addEdge('risk', END);

export const runCareerSimulator = async (input) => {
  const compiled = careerSimulatorGraph.compile();
  return await compiled.invoke(input);
};

export default careerSimulatorGraph;

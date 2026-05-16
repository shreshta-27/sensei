import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { callGeminiJSON } from '../services/gemini.service.js';
import { generateEmbeddingsHF } from '../services/huggingface.service.js';

const BehaviorState = Annotation.Root({
  classId: Annotation({ reducer: (a, b) => b ?? a, default: () => '' }),
  students: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  clusters: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  correlations: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  alerts: Annotation({ reducer: (a, b) => b ?? a, default: () => [] })
});

async function aggregateNode(state) {
  return { students: state.students };
}


const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

async function clusteringNode(state) {

  const embeddedStudents = await Promise.all(state.students.map(async (s) => {
    const profileText = `Attendance: ${s.signals?.attendancePattern || 0}%, Quizzes: ${s.signals?.quizVelocity || 0}, Wellness: ${s.signals?.wellnessScore || 50}, Help: ${s.signals?.helpFrequency || 0}, Study: ${s.signals?.studyDuration || 0}m, Risk: ${s.riskLevel || 'low'}`;
    const embedding = await generateEmbeddingsHF(profileText);
    return { ...s, profileText, embedding };
  }));


  const clusters = [];
  const visited = new Set();
  
  for (let i = 0; i < embeddedStudents.length; i++) {
    if (visited.has(i)) continue;
    
    const currentCluster = [embeddedStudents[i]];
    visited.add(i);
    
    for (let j = i + 1; j < embeddedStudents.length; j++) {
      if (visited.has(j)) continue;
      const sim = cosineSimilarity(embeddedStudents[i].embedding, embeddedStudents[j].embedding);
      if (sim > 0.85) {
        currentCluster.push(embeddedStudents[j]);
        visited.add(j);
      }
    }
    
    clusters.push({
      clusterId: `Group_${clusters.length + 1}`,
      size: currentCluster.length,
      members: currentCluster.map(c => c.name),
      representativeProfile: currentCluster[0].profileText
    });
  }
  
  return { clusters };
}

async function correlateNode(state) {

  const prompt = `Analyze these mathematically clustered student behavior groups for hidden correlations:
${JSON.stringify(state.clusters)}
Return JSON: { "correlations": [{"pattern":"...","affectedCount":0,"impactDescription":"...","severity":"info|warning|critical"}], "alerts": [{"message":"...","matchedStudents":["names"],"severity":"warning","actionSuggestion":"..."}] }`;

  const result = await callGeminiJSON(prompt);
  return { correlations: result.correlations || [], alerts: result.alerts || [] };
}

async function alertNode(state) {
  return { correlations: state.correlations, alerts: state.alerts };
}

const behaviorGraph = new StateGraph(BehaviorState)
  .addNode('aggregate', aggregateNode)
  .addNode('cluster', clusteringNode)
  .addNode('correlate', correlateNode)
  .addNode('alert', alertNode)
  .addEdge(START, 'aggregate')
  .addEdge('aggregate', 'cluster')
  .addEdge('cluster', 'correlate')
  .addEdge('correlate', 'alert')
  .addEdge('alert', END);

export const runBehaviorFingerprint = async (input) => {
  const compiled = behaviorGraph.compile();
  return await compiled.invoke(input);
};

export default behaviorGraph;

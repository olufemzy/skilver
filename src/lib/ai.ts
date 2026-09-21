import OpenAI from 'openai'
import prisma from './prisma'

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function matchProvidersToJob(jobId: string, limit = 10) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      category: true,
      skills: { include: { skill: true } },
      customer: { include: { user: true } },
    },
  })
  if (!job) return []

  const providers = await prisma.providerProfile.findMany({
    where: {
      verificationStatus: 'VERIFIED',
      isAvailable: true,
      user: { isSuspended: false },
    },
    include: {
      user: true,
      skills: { include: { skill: true } },
    },
    take: 50,
  })

  const jobContext = `
    Job: ${job.title}
    Category: ${job.category.name}
    Description: ${job.description}
    Budget: ${job.budget} ${job.currency}
    Required skills: ${job.skills.map((s: any) => s.skill.name).join(', ')}
    Location: ${job.location || 'Remote'}
  `

  const providersContext = providers.map((p: any) => ({
    id: p.id,
    name: p.user.name,
    skills: p.skills.map((s: any) => s.skill.name),
    rating: p.averageRating,
    completedJobs: p.jobsCompleted,
    location: p.user.location,
  }))

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a marketplace AI that matches jobs to service providers. 
        Rank providers by relevance to the job based on skills, rating, experience, and location.
        Return a JSON array of provider IDs in ranked order with a match score (0-100) and reason.`,
      },
      {
        role: 'user',
        content: `Match providers to this job:\n${jobContext}\n\nProviders:\n${JSON.stringify(providersContext, null, 2)}\n\nReturn JSON: [{"id": "...", "score": 85, "reason": "..."}]`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
  })

  try {
    const result = JSON.parse(completion.choices[0].message.content || '{"matches":[]}')
    const matches = result.matches || result
    return matches
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit)
      .map((m: any) => ({
        ...m,
        provider: providers.find((p: any) => p.id === m.id),
      }))
      .filter((m: any) => m.provider)
  } catch {
    return []
  }
}

export async function recommendJobsToProvider(providerId: string, limit = 10) {
  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    include: {
      skills: { include: { skill: true } },
      user: true,
    },
  })
  if (!provider) return []

  const jobs = await prisma.job.findMany({
    where: {
      status: 'OPEN',
      applications: { none: { providerId } },
    },
    include: {
      category: true,
      skills: { include: { skill: true } },
      customer: { include: { user: true } },
      _count: { select: { applications: true } },
    },
    take: 50,
    orderBy: { createdAt: 'desc' },
  })

  const providerSkills = provider.skills.map((s: any) => s.skill.name)
  const scored = jobs.map((job: any) => {
    const jobSkills = job.skills.map((s: any) => s.skill.name)
    const skillMatch = jobSkills.filter((s: any) => providerSkills.includes(s)).length
    const score = skillMatch * 20 + (job.budget > 10000 ? 10 : 0)
    return { job, score }
  })

  return scored
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, limit)
    .map((s: any) => s.job)
}

export async function generateProfileSuggestions(bio: string, skills: string[]): Promise<string> {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a professional profile writer helping Nigerian university students create compelling service provider profiles. Be concise, professional, and highlight value.',
      },
      {
        role: 'user',
        content: `Improve this bio and make it more professional and client-friendly:\n\nBio: ${bio}\nSkills: ${skills.join(', ')}\n\nReturn an improved bio in 3-4 sentences.`,
      },
    ],
    max_tokens: 300,
  })
  return completion.choices[0].message.content || bio
}

export async function moderateJobPost(title: string, description: string): Promise<{ flagged: boolean; reason?: string }> {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Review job postings for a skills marketplace. Flag if: illegal activity, scam patterns, inappropriate content, unrealistic offers. Return JSON.',
      },
      {
        role: 'user',
        content: `Review this job: Title: ${title}\nDescription: ${description}\n\nReturn JSON: {"flagged": boolean, "reason": "string or null"}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 200,
  })
  try {
    return JSON.parse(completion.choices[0].message.content || '{"flagged":false}')
  } catch {
    return { flagged: false }
  }
}
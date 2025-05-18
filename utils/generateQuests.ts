export const generateQuests = (nodeId: string) => {
  // Mock quest data based on nodeId
  switch (nodeId) {
    case "mindfulness":
      return [
        {
          id: "mindfulness-quest-1",
          title: "Practice Mindful Breathing",
          description: "Take 5 minutes to focus on your breath and observe your thoughts without judgment.",
          completed: false,
        },
        {
          id: "mindfulness-quest-2",
          title: "Body Scan Meditation",
          description: "Perform a body scan meditation to increase awareness of physical sensations.",
          completed: false,
        },
      ]
    case "productivity":
      return [
        {
          id: "productivity-quest-1",
          title: "Prioritize Tasks",
          description: "Identify your top 3 most important tasks for the day and focus on completing them.",
          completed: false,
        },
        {
          id: "productivity-quest-2",
          title: "Eliminate Distractions",
          description: "Turn off notifications and find a quiet workspace to minimize interruptions.",
          completed: false,
        },
      ]
    case "meditation":
      return [
        {
          id: "meditation-quest-1",
          title: "Guided Meditation Session",
          description: "Complete a 10-minute guided meditation session using a meditation app or online resource.",
          completed: false,
        },
        {
          id: "meditation-quest-2",
          title: "Silent Meditation Practice",
          description: "Practice silent meditation for 15 minutes, focusing on your breath or a mantra.",
          completed: false,
        },
      ]
    case "journaling":
      return [
        {
          id: "journaling-quest-1",
          title: "Morning Gratitude Journal",
          description: "Write down three things you are grateful for in your journal each morning.",
          completed: false,
        },
        {
          id: "journaling-quest-2",
          title: "Reflective Journaling",
          description: "Reflect on your day and write about your experiences, thoughts, and feelings in your journal.",
          completed: false,
        },
      ]
    case "time-blocking":
      return [
        {
          id: "time-blocking-quest-1",
          title: "Create a Time Block Schedule",
          description:
            "Create a time block schedule for the upcoming week, allocating specific time slots for different tasks and activities.",
          completed: false,
        },
        {
          id: "time-blocking-quest-2",
          title: "Follow Time Block Schedule",
          description:
            "Adhere to your time block schedule for at least 3 days, tracking your progress and making adjustments as needed.",
          completed: false,
        },
      ]
    case "deep-work":
      return [
        {
          id: "deep-work-quest-1",
          title: "Deep Work Session",
          description: "Complete a 90-minute deep work session without any distractions or interruptions.",
          completed: false,
        },
        {
          id: "deep-work-quest-2",
          title: "Deep Work Environment",
          description:
            "Create a dedicated deep work environment that is free from distractions and conducive to focused work.",
          completed: false,
        },
      ]
    default:
      return []
  }
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import "katex/dist/katex.min.css";

const modes = [
  "General AI Chat", "Research Assistant", "Research Paper Analysis", "Economics Paper Review",
  "Finance Paper Review", "Accounting Paper Review", "Actuarial Paper Review", "Statistics Paper Review",
  "Mathematics Paper Review", "Computer Science Paper Review", "Engineering Paper Review",
  "Machine Learning Paper Review", "Physics Paper Review", "Chemistry Paper Review", "Business Paper Review",
  "Marketing Paper Review", "Management Paper Review", "Healthcare Paper Review", "Law Paper Review",
  "Public Policy Paper Review", "Climate Research Review", "Dissertation Review", "Journal Referee Mode",
  "Education Engine", "SAT Practice", "ACT Practice", "GRE Practice", "GMAT Practice", "LSAT Practice",
  "MCAT Practice", "Olympiads", "AP Exams", "WAEC Practice", "JAMB Practice", "IGCSE Practice", "A-Level Practice",
  "Mathematics", "Pure Mathematics", "Applied Mathematics", "Academic Writing",
  "SOA Exam P", "SOA Exam FM", "IFOA CS1", "IFOA CM1",
  "Statistics", "Finance", "CFA Exam", "Accounting", "ICAN Exam", "Economics",
  "Actuarial Science", "Physics", "Chemistry", "Engineering", "Computer Science",
  "Data Science", "AI & Machine Learning", "Practice Questions", "File Analysis", "Stock Analysis",
];

type Message = { role: "user" | "assistant"; text: string };

type Project = {
  id: string;
  name: string;
  color: string;
  category: string;
  updatedAt: number;
};
const projectColors: Record<string, string> = {
  purple: "bg-purple-900",
  blue: "bg-blue-900",
  green: "bg-green-900",
  orange: "bg-orange-900",
  red: "bg-red-900",
};
  const projectCategories: Record<string, string> = {
  research: "📚 Research",
  finance: "📈 Finance",
  cfa: "📊 CFA",
  ican: "🧾 ICAN",
  actuarial: "📐 Actuarial",
  phd: "🎓 PhD Applications",
  papers: "📄 Papers",
  datasets: "📂 Datasets",
};
  type ProjectMemoryItem = {
  text: string;
  createdAt: number;
};
  type ProjectMemory = {
  projectId: string;
  items: ProjectMemoryItem[];
};
  type ProjectNote = {
  projectId: string;
  content: string;
};
  type ProjectTask = {
  id: string;
  projectId: string;
  text: string;
  completed: boolean;
  createdAt: number;
};
type ProjectFile = {
  id: string;
  projectId: string;
  name: string;
  type: string;
  uploadedAt: number;
  analysis?: string;
};

type ChatSession = {
  id: string;
  projectId: string;
  title: string;
  mode: string;
  messages: Message[];
  updatedAt: number;
};

const welcomeMessage: Message = {
  role: "assistant",
  text: "Welcome to Quant GPT! I am an AI Engine Developed by YomiAnnixs. Feel free to inquire about topics in mathematics, finance, actuarial science, accounting, CFA, ICAN, economics, data analysis, research, coding, exam prep, Olympiads, or stock analysis.",
};

function createDefaultProject(): Project {
  return {
    id: "default-project",
    name: "General Workspace",
    color: "purple",
    category: "research",
    updatedAt: Date.now(),
  };
}

function createNewProject(name: string): Project {
  return {
    id: Date.now().toString(),
    name,
    color: "purple",
    category: "research",
    updatedAt: Date.now(),
  };
}

function createNewChat(projectId: string, mode = "General AI Chat", title = "New Chat"): ChatSession {
  return {
    id: Date.now().toString(),
    projectId,
    title,
    mode,
    messages: [welcomeMessage],
    updatedAt: Date.now(),
  };
}

function generateTitle(text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  return cleaned.length > 34 ? cleaned.slice(0, 34) + "..." : cleaned || "New Chat";
}

function DashboardContent() {
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("General AI Chat");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chart, setChart] = useState<string | null>(null);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [projectMemories, setProjectMemories] = useState<ProjectMemory[]>([]);
  const [projectNotes, setProjectNotes] = useState<ProjectNote[]>([]);
  
  const [activeProjectId, setActiveProjectId] = useState("");

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState("");

  const activeProject = projects.find(
  (project) => project.id === activeProjectId
);  
  const activeChat = chats.find(
  (chat) => chat.id === activeChatId
);

  const messages = activeChat?.messages || [welcomeMessage];

  const projectChats = chats
  .filter((chat) => chat.projectId === activeProjectId)
  .sort((a, b) => b.updatedAt - a.updatedAt);

  const activeProjectFiles = projectFiles
  .filter((file) => file.projectId === activeProjectId)
  .sort((a, b) => b.uploadedAt - a.uploadedAt);

  const activeProjectMemory =
  projectMemories.find(
    (m) => m.projectId === activeProjectId
  );
  const activeProjectNote = projectNotes.find( (n) => n.projectId === activeProjectId);
  const activeProjectTasks = projectTasks.filter((task) => task.projectId === activeProjectId).sort((a, b) => b.createdAt - a.createdAt);
  const activeProjectChatCount = projectChats.length;
  const activeProjectFileCount = activeProjectFiles.length;
  const mostRecentFile = activeProjectFiles.length > 0 ? activeProjectFiles[0] : null;

  const mostRecentChat = projectChats.length > 0 ? projectChats[0] : null;
  const completedTasks = activeProjectTasks.filter( (t) => t.completed ).length;
  const openTasks = activeProjectTasks.filter( (t) => !t.completed ).length;
  const latestMemory = activeProjectMemory?.items?.length ? activeProjectMemory.items[ activeProjectMemory.items.length - 1 ] : null;

  const totalTasks = activeProjectTasks.length;

const researchProgress =
  totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

const memoryEntries =
  activeProjectMemory?.items?.length || 0;

const notesWordCount =
  activeProjectNote?.content
    ? activeProjectNote.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

const projectHealth =
  Math.min(
    100,
    Math.round(
      activeProjectChatCount * 5 +
        activeProjectFileCount * 15 +
        memoryEntries * 5 +
        notesWordCount * 0.05 +
        completedTasks * 10
    )
  );
  const projectStage =
  activeProjectFileCount === 0 && notesWordCount < 50
    ? "Planning"
    : activeProjectFileCount > 0 && completedTasks === 0
    ? "Data Collection"
    : totalTasks > 0 && researchProgress < 50
    ? "Analysis"
    : researchProgress >= 50 && notesWordCount > 100
    ? "Writing"
    : researchProgress === 100
    ? "Final Review"
    : "Active Research";

const projectRisk =
  openTasks >= 5 && researchProgress < 40
    ? "High"
    : openTasks >= 3 || projectHealth < 50
    ? "Medium"
    : "Low";

const nextFocus =
  openTasks > 0
    ? "Complete open tasks"
    : activeProjectFileCount === 0
    ? "Upload source files"
    : notesWordCount < 100
    ? "Expand project notes"
    : "Generate summary";

  const latestFileType =
  mostRecentFile?.type || "None";

const latestFileUploadedAt =
  mostRecentFile?.uploadedAt
    ? new Date(mostRecentFile.uploadedAt).toLocaleString()
    : "None";

const latestFileHasAnalysis =
  mostRecentFile?.analysis ? "Yes" : "No";
  
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    const savedProjects = localStorage.getItem("quant-gpt-projects");
    const savedChats = localStorage.getItem("quant-ai-chats");
    const savedProjectFiles = localStorage.getItem("quant-gpt-project-files");
    const savedProjectMemories = localStorage.getItem( "quant-gpt-project-memories");
    const savedProjectNotes = localStorage.getItem("quant-gpt-project-notes");
    const savedProjectTasks = localStorage.getItem("quant-gpt-project-tasks");
    const savedActiveProjectId = localStorage.getItem("quant-gpt-active-project-id");
    const savedActiveChatId = localStorage.getItem("quant-ai-active-chat-id");
    
    let loadedProjects: Project[] = savedProjects
  ? JSON.parse(savedProjects).map((p: any) => ({
      ...p,
      color: p.color || "purple",
      category: p.category || "research",
    }))
  : [];
    let loadedChats: ChatSession[] = savedChats ? JSON.parse(savedChats) : [];
    const loadedProjectFiles: ProjectFile[] = savedProjectFiles
  ? JSON.parse(savedProjectFiles)
  : [];

    setProjectFiles(loadedProjectFiles);
    const parsedMemories = savedProjectMemories
  ? JSON.parse(savedProjectMemories)
  : [];

    const upgradedMemories = parsedMemories.map((memory: any) => ({
      projectId: memory.projectId,
      items: (memory.items || []).map((item: any) =>
        typeof item === "string"
         ? {
             text: item,
             createdAt: Date.now(),
           }
         : item
    ),
   }));

    setProjectMemories(upgradedMemories);
    setProjectNotes(savedProjectNotes ? JSON.parse(savedProjectNotes) : []);
    setProjectTasks(savedProjectTasks ? JSON.parse(savedProjectTasks) : []);

    if (loadedProjects.length === 0) {
      loadedProjects = [createDefaultProject()];
    }
    const defaultProjectId = loadedProjects[0].id;

    loadedChats = loadedChats.map((chat) => ({
      ...chat,
      projectId: chat.projectId || defaultProjectId,
    }));

    if (loadedChats.length === 0) {
      loadedChats = [createNewChat(defaultProjectId)];
    }

    let selectedProjectId =
      savedActiveProjectId && loadedProjects.some((project) => project.id === savedActiveProjectId)
        ? savedActiveProjectId
        : defaultProjectId;

    if (urlMode && modes.includes(urlMode)) {
      const newChat = createNewChat(selectedProjectId, urlMode, urlMode);
      loadedChats = [newChat, ...loadedChats];

      setProjects(loadedProjects);
      setChats(loadedChats);
      setActiveProjectId(selectedProjectId);
      setActiveChatId(newChat.id);
      setMode(urlMode);
      return;
    }

    const chatsInSelectedProject = loadedChats.filter(
      (chat) => chat.projectId === selectedProjectId
    );

    let selectedChatId =
      savedActiveChatId && chatsInSelectedProject.some((chat) => chat.id === savedActiveChatId)
        ? savedActiveChatId
        : chatsInSelectedProject[0]?.id;

    if (!selectedChatId) {
      const newChat = createNewChat(selectedProjectId);
      loadedChats = [newChat, ...loadedChats];
      selectedChatId = newChat.id;
    }

    const selectedChat = loadedChats.find((chat) => chat.id === selectedChatId);

    setProjects(loadedProjects);
    setChats(loadedChats);
    setActiveProjectId(selectedProjectId);
    setActiveChatId(selectedChatId);
    setMode(selectedChat?.mode || "General AI Chat");
  }, [searchParams]);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("quant-gpt-projects", JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem("quant-gpt-active-project-id", activeProjectId);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("quant-ai-chats", JSON.stringify(chats));
    }
  }, [chats]);

   useEffect(() => {
   localStorage.setItem(
    "quant-gpt-project-files",
    JSON.stringify(projectFiles)
  );
}, [projectFiles]);

   useEffect(() => {
   localStorage.setItem(
    "quant-gpt-project-memories",
    JSON.stringify(projectMemories)
   );
  }, [projectMemories]);

   useEffect(() => {
   localStorage.setItem(
    "quant-gpt-project-notes",
    JSON.stringify(projectNotes)
   );
  }, [projectNotes]);

   useEffect(() => {
  localStorage.setItem(
    "quant-gpt-project-tasks",
    JSON.stringify(projectTasks)
  );
}, [projectTasks]); 
  
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem("quant-ai-active-chat-id", activeChatId);
    }
  }, [activeChatId]);

  function updateActiveChat(updater: (chat: ChatSession) => ChatSession) {
    setChats((prev) =>
      prev.map((chat) => (chat.id === activeChatId ? updater(chat) : chat))
    );

    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProjectId
          ? { ...project, updatedAt: Date.now() }
          : project
      )
    );
  }

     function startNewProject() {
     const projectName = window.prompt("Enter project name:");

     if (!projectName || !projectName.trim()) return;

     const colors = ["purple", "blue", "green", "orange", "red"];

     const randomColor =
     colors[Math.floor(Math.random() * colors.length)];
 
     const categoryInput = window.prompt(
     "Choose project category: research, finance, cfa, ican, actuarial, phd, papers, datasets",
     "research"
    );

    const allowedCategories = [
    "research",
    "finance",
    "cfa",
    "ican",
    "actuarial",
    "phd",
    "papers",
    "datasets",
   ];

const selectedCategory = allowedCategories.includes(
  (categoryInput || "").toLowerCase().trim()
)
  ? (categoryInput || "").toLowerCase().trim()
  : "research";

const newProject: Project = {
  id: Date.now().toString(),
  name: projectName.trim(),
  color: randomColor,
  category: selectedCategory,
  updatedAt: Date.now(),
};

  const newChat = createNewChat(newProject.id);

  setProjects((prev) => [newProject, ...prev]);
  setProjectMemories((prev) => [
  ...prev,
  {
    projectId: newProject.id,
    items: [
      {
        text: "Project created",
        createdAt: Date.now(),
      },
      {
        text: "Ready for research",
        createdAt: Date.now(),
      },
    ],
  },
]);
  
  setChats((prev) => [newChat, ...prev]);

  setActiveProjectId(newProject.id);
  setActiveChatId(newChat.id);
  setMode(newChat.mode);
  setMessage("");
  setSelectedFile(null);
  setChart(null);
}
     function renameProject(project: Project) {
  const newName = window.prompt("Rename project", project.name);

  if (!newName || !newName.trim()) return;

  setProjects((prev) =>
    prev.map((item) =>
      item.id === project.id
        ? {
            ...item,
            name: newName.trim(),
            updatedAt: Date.now(),
          }
        : item
    )
  );
} 
  function selectProject(project: Project) {
    const chatsInProject = chats
      .filter((chat) => chat.projectId === project.id)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    let selectedChat = chatsInProject[0];

    if (!selectedChat) {
      selectedChat = createNewChat(project.id);
      setChats((prev) => [selectedChat, ...prev]);
    }

    setActiveProjectId(project.id);
    setActiveChatId(selectedChat.id);
    setMode(selectedChat.mode);
    setMessage("");
    setSelectedFile(null);
    setChart(null);
  }

  function deleteProject(projectId: string) {
    if (projects.length <= 1) {
      alert("You must keep at least one project.");
      return;
    }

    const confirmDelete = window.confirm(
      "Delete this project and all chats inside it?"
    );

    if (!confirmDelete) return;

    const remainingProjects = projects.filter((project) => project.id !== projectId);
    const remainingChats = chats.filter((chat) => chat.projectId !== projectId);

    const fallbackProject = remainingProjects[0];
    let fallbackChat = remainingChats
      .filter((chat) => chat.projectId === fallbackProject.id)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];

    if (!fallbackChat) {
      fallbackChat = createNewChat(fallbackProject.id);
      remainingChats.unshift(fallbackChat);
    }

    setProjects(remainingProjects);
    setChats(remainingChats);
    setActiveProjectId(fallbackProject.id);
    setActiveChatId(fallbackChat.id);
    setMode(fallbackChat.mode);
  }

  function startNewChat() {
    if (!activeProjectId) return;

    const newChat = createNewChat(activeProjectId);
    setChats((prev) => [newChat, ...prev]);

    setActiveChatId(newChat.id);
    setMode(newChat.mode);
    setMessage("");
    setSelectedFile(null);
    setChart(null);
  }

  function selectChat(chat: ChatSession) {
    setActiveChatId(chat.id);
    setMode(chat.mode);
    setMessage("");
    setSelectedFile(null);
    setChart(null);
  }

  function deleteChat(chatId: string) {
    setChats((prev) => {
      const remaining = prev.filter((chat) => chat.id !== chatId);
      const remainingProjectChats = remaining.filter(
        (chat) => chat.projectId === activeProjectId
      );

      if (remainingProjectChats.length === 0) {
        const newChat = createNewChat(activeProjectId);
        setActiveChatId(newChat.id);
        setMode(newChat.mode);
        return [newChat, ...remaining];
      }

      if (chatId === activeChatId) {
        const nextChat = remainingProjectChats.sort((a, b) => b.updatedAt - a.updatedAt)[0];
        setActiveChatId(nextChat.id);
        setMode(nextChat.mode);
      }

      return remaining;
    });
  }
  function formatTimelineDate(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();

  const sameDay =
    date.toDateString() === today.toDateString();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameYesterday =
    date.toDateString() === yesterday.toDateString();

  if (sameDay) return "Today";
  if (sameYesterday) return "Yesterday";

  return date.toLocaleDateString();
}
    function addProjectTask(taskText: string) {
       const value = taskText.trim();

       if (!value || !activeProjectId) return;

       setProjectTasks((prev) => [
       {
          id: Date.now().toString(),
          projectId: activeProjectId,
          text: value,
          completed: false,
          createdAt: Date.now(),
       },
       ...prev,
     ]);
        setProjectMemories((prev) =>
         prev.map((memory) =>
           memory.projectId === activeProjectId
            ? {
          ...memory,
           items: [
            ...memory.items,
            {
              text: `Added task: ${value}`,
              createdAt: Date.now(),
            },
          ],
        }
      : memory
     )
   );
}
  function addProjectMemory(text: string) {
  if (!activeProjectId) return;

  setProjectMemories((prev) =>
    prev.map((memory) =>
      memory.projectId === activeProjectId
        ? {
            ...memory,
            items: [
              ...memory.items,
              {
                text,
                createdAt: Date.now(),
              },
            ],
          }
        : memory
    )
  );
}
  function openLatestFileAnalysis() {
  if (!mostRecentFile?.analysis || !activeProjectId) return;

  const fileChat: ChatSession = {
    id: Date.now().toString(),
    projectId: activeProjectId,
    title: `File: ${mostRecentFile.name}`,
    mode: "File Analysis",
    messages: [
      {
        role: "user",
        text: `Open previous file analysis: ${mostRecentFile.name}`,
      },
      {
        role: "assistant",
        text: mostRecentFile.analysis,
      },
    ],
    updatedAt: Date.now(),
  };

  setChats((prev) => [fileChat, ...prev]);
  setActiveChatId(fileChat.id);
  setMode("File Analysis");
  addProjectMemory(`Opened analysis for ${mostRecentFile.name}`);
}
  function clearProjectMemory() {
  if (!activeProjectId) return;

  const confirmClear = window.confirm(
    "Clear all memory/timeline entries for this project?"
  );

  if (!confirmClear) return;

  setProjectMemories((prev) =>
    prev.map((memory) =>
      memory.projectId === activeProjectId
        ? { ...memory, items: [] }
        : memory
    )
  );
}

function clearProjectNotes() {
  if (!activeProjectId) return;

  const confirmClear = window.confirm(
    "Clear project notes?"
  );

  if (!confirmClear) return;

  setProjectNotes((prev) =>
    prev.map((note) =>
      note.projectId === activeProjectId
        ? { ...note, content: "" }
        : note
    )
  );
}

function clearProjectTasks() {
  if (!activeProjectId) return;

  const confirmClear = window.confirm(
    "Clear all tasks for this project?"
  );

  if (!confirmClear) return;

  setProjectTasks((prev) =>
    prev.filter((task) => task.projectId !== activeProjectId)
  );
}
  function exportProject() {
  if (!activeProject) return;

  const projectText = `
# ${activeProject.name}

## Project Details
- Category: ${projectCategories[activeProject.category || "research"]}
- Stage: ${projectStage}
- Risk: ${projectRisk}
- Health: ${projectHealth}%
- Progress: ${researchProgress}%

## Files
${
  activeProjectFiles.length
    ? activeProjectFiles.map((f) => `- ${f.name}`).join("\n")
    : "No files uploaded."
}

## Tasks
${
  activeProjectTasks.length
    ? activeProjectTasks
        .map((t) => `- [${t.completed ? "x" : " "}] ${t.text}`)
        .join("\n")
    : "No tasks."
}

## Notes
${activeProjectNote?.content || "No notes."}

## Timeline
${
  activeProjectMemory?.items?.length
    ? activeProjectMemory.items
        .map(
          (m) =>
            `- ${new Date(m.createdAt).toLocaleString()}: ${m.text}`
        )
        .join("\n")
    : "No timeline entries."
}

## Chats
${
  projectChats.length
    ? projectChats
        .map(
          (chat) => `
### ${chat.title}

${chat.messages
  .map((m) => `**${m.role === "user" ? "You" : "Quant GPT"}:** ${m.text}`)
  .join("\n\n")}
`
        )
        .join("\n\n---\n\n")
    : "No chats."
}
`;

  const blob = new Blob([projectText], {
    type: "text/markdown",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `${activeProject.name.replace(/[^a-z0-9]/gi, "_")}_project.md`;
  a.click();

  URL.revokeObjectURL(url);
}
  function exportChat() {
    if (!activeChat) return;

    const chatText = activeChat.messages
      .map((m) => `## ${m.role === "user" ? "You" : "Quant GPT"}\n\n${m.text}`)
      .join("\n\n---\n\n");

    const blob = new Blob([chatText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeChat.title.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click();

    URL.revokeObjectURL(url);
  }
  async function suggestNextTasks() {
  if (!activeProject || !activeChat) return;

  const taskPrompt = `
  Based on this project context, suggest 5 concrete next tasks.

  Project: ${activeProject.name}
  Category: ${projectCategories[activeProject.category || "research"]}

  Files:
  ${activeProjectFiles.map((f) => `- ${f.name}`).join("\n") || "No files uploaded"}

  Memory:
  ${activeProjectMemory?.items?.map((m) => `- ${m.text}`).join("\n") || "No memory yet"}

  Notes:
  ${activeProjectNote?.content || "No notes yet"}

  Current Tasks:
  ${activeProjectTasks
  .map((t) => `- [${t.completed ? "x" : " "}] ${t.text}`)
  .join("\n") || "No tasks yet"}

   Return only a concise numbered list of 5 next tasks.
  `;
   sendPresetMessage(taskPrompt);
}
  async function generateProjectSummary() {
  if (!activeProject || !activeChat) return;

  const summaryPrompt = `
  Generate a clear project status summary for this project.

  Project: ${activeProject.name}
  Category: ${projectCategories[activeProject.category || "research"]}

  Files:
  ${activeProjectFiles.map((f) => `- ${f.name}`).join("\n") || "No files uploaded"}

  Memory:
  ${activeProjectMemory?.items?.map((m) => `- ${m.text}`).join("\n") || "No memory yet"}

  Notes:
  ${activeProjectNote?.content || "No notes yet"}

  Tasks:
  ${activeProjectTasks
  .map((t) => `- [${t.completed ? "x" : " "}] ${t.text}`)
  .join("\n") || "No tasks yet"}

  Please summarize:
  1. Current project status
  2. Completed work
  3. Outstanding tasks
  4. Recommended next steps
  `;   
  sendPresetMessage(summaryPrompt);
}
  async function generateResearchReport() {
  if (!activeProject || !activeChat) return;

  const reportPrompt = `
Generate a professional research progress report for this project.

Project: ${activeProject.name}
Category: ${projectCategories[activeProject.category || "research"]}
Stage: ${projectStage}
Risk Level: ${projectRisk}
Next Focus: ${nextFocus}
Health Score: ${projectHealth}%
Research Progress: ${researchProgress}%

Files:
${activeProjectFiles.map((f) => `- ${f.name}`).join("\n") || "No files uploaded"}

Tasks:
${activeProjectTasks
  .map((t) => `- [${t.completed ? "x" : " "}] ${t.text}`)
  .join("\n") || "No tasks"}

Notes:
${activeProjectNote?.content || "No notes"}

Timeline:
${activeProjectMemory?.items
  ?.map((m) => `- ${new Date(m.createdAt).toLocaleString()}: ${m.text}`)
  .join("\n") || "No timeline entries"}

Please structure the report with:
1. Executive summary
2. Current project status
3. Completed work
4. Outstanding work
5. Risks and bottlenecks
6. Recommended next steps
`;

  addProjectMemory("Generated research progress report");

  sendPresetMessage(reportPrompt);
}
  function sendPresetMessage(presetText: string) {
  if (!presetText.trim()) return;

  setMessage(presetText);

  setTimeout(() => {
    sendMessage();
  }, 100);
}
  async function sendMessage() {
    if (!message.trim() || !activeChat) return;

    const currentMessage = message;
    const userMessage: Message = { role: "user", text: currentMessage };
    const assistantMessage: Message = { role: "assistant", text: "" };

    updateActiveChat((chat) => ({
      ...chat,
      title: chat.title === "New Chat" ? generateTitle(currentMessage) : chat.title,
      mode,
      messages: [...chat.messages, userMessage, assistantMessage],
      updatedAt: Date.now(),
    }));

    const historyForBackend = [...messages, userMessage].slice(-12);

    setMessage("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const res = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMessage, mode, history: historyForBackend }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        updateActiveChat((chat) => {
          const updatedMessages = [...chat.messages];
          const lastIndex = updatedMessages.length - 1;

          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            text: updatedMessages[lastIndex].text + chunk,
          };

          return { ...chat, messages: updatedMessages, updatedAt: Date.now() };
        });
      }
    } catch {
      updateActiveChat((chat) => ({
        ...chat,
        messages: [
          ...chat.messages,
          {
            role: "assistant",
            text: "Could not connect to backend. Check that FastAPI is running and NEXT_PUBLIC_API_URL is correct.",
          },
        ],
        updatedAt: Date.now(),
      }));
    }

    setLoading(false);
  }

  async function uploadFile() {
    if (!selectedFile || !activeChat) return;

    const fileMessage: Message = {
      role: "user",
      text: `Uploaded file: ${selectedFile.name}`,
    };

    const assistantMessage: Message = {
      role: "assistant",
      text: "",
    };

    updateActiveChat((chat) => ({
      ...chat,
      title: chat.title === "New Chat" ? `File: ${selectedFile.name}` : chat.title,
      mode,
      messages: [...chat.messages, fileMessage, assistantMessage],
      updatedAt: Date.now(),
    }));

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mode", mode);

      const res = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const fileRecord: ProjectFile = {
      id: Date.now().toString(),
      projectId: activeProjectId,
      name: selectedFile.name,
      type: selectedFile.type || "unknown",
      uploadedAt: Date.now(),
      analysis: data.response || "",
     };

      setProjectFiles((prev) => [fileRecord, ...prev]);

      setProjectMemories((prev) => {
       const existing =
        prev.find(
          (m) => m.projectId === activeProjectId
      );

      if (existing) {
          return prev.map((m) =>
            m.projectId === activeProjectId
             ? {
              ...m,
              items: [
              ...m.items,
               {
              text: `Uploaded ${selectedFile.name}`,
              createdAt: Date.now(),
               },
             ],
             }
          : m
        );
      }

     return [
       ...prev,
         {
          projectId: activeProjectId!,
          items: [
         {
          text: `Uploaded ${selectedFile.name}`,
          createdAt: Date.now(),
          },
         ],
            },
          ];
      });

      setChart(data.chart || null);

      updateActiveChat((chat) => {
        const updatedMessages = [...chat.messages];
        const lastIndex = updatedMessages.length - 1;

        updatedMessages[lastIndex] = {
          ...updatedMessages[lastIndex],
          text: data.response || "File uploaded, but no analysis was returned.",
        };

        return { ...chat, messages: updatedMessages, updatedAt: Date.now() };
      });

      setSelectedFile(null);
    } catch {
      updateActiveChat((chat) => ({
        ...chat,
        messages: [
          ...chat.messages,
          {
            role: "assistant",
            text: "File upload failed. Check that backend /upload route is working.",
          },
        ],
        updatedAt: Date.now(),
      }));
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
    <aside className="w-full lg:w-80 bg-gray-950 border-b lg:border-b-0 lg:border-r border-gray-800 p-4 lg:p-5">
  <div className="flex flex-col gap-4">
    <div>
      <h1 className="text-3xl font-bold mb-2">Quant GPT</h1>
      <p className="text-gray-400 text-sm mb-4">
        Research, learning, analytics and exam prep workspace.
      </p>
    </div>

    <div className="space-y-3">
      <button onClick={startNewProject} className="w-full bg-purple-700 hover:bg-purple-800 rounded-xl p-3 font-semibold">
        + New Project
      </button>

      <button onClick={startNewChat} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl p-3 font-semibold">
        + New Chat
      </button>

      <button onClick={exportChat} className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-3 font-semibold">
        ⬇ Export Chat
      </button>
    </div>
    
    <button
  onClick={exportProject}
  className="w-full bg-green-700 hover:bg-green-800 rounded-xl p-3 font-semibold"
>
  ⬇ Export Project
</button>
    
    <div className="border-t border-gray-800 pt-4">
      <p className="text-gray-400 text-sm mb-3">Projects</p>

      <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-1">
        {[...projects].sort((a, b) => b.updatedAt - a.updatedAt).map((project) => (
          <div
            key={project.id}
            className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2 cursor-pointer ${
              project.id === activeProjectId
                ? projectColors[project.color]
                : "bg-gray-900 hover:bg-gray-800"
            }`}
          >
            <button
              onClick={() => selectProject(project)}
              className="flex-1 text-left text-sm"
            >
             <>
              <span className="block truncate">
               <span className="mr-2">
              {{
               purple: "🟣",
               blue: "🔵",
               green: "🟢",
               orange: "🟠",
               red: "🔴",
               }[project.color || "purple"]}
               </span>
            {project.name}
           </span>

            <span className="block text-[10px] text-gray-400 truncate mt-0.5">
            {projectCategories[project.category || "research"]}
           </span>
           </>
         </button>

            <button
                 onClick={() => renameProject(project)}
                 className="text-gray-500 hover:text-blue-400 text-sm"
                 title="Rename project"
             >
                 ✏
            </button>

            <button  
                 onClick={() => deleteProject(project.id)}
                 className="text-gray-500 hover:text-red-400 text-sm"
                 title="Delete project"
             >
                 ×
            </button>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t border-gray-800 pt-4">
      <p className="text-gray-400 text-sm mb-3">
        Files {activeProject ? `in ${activeProject.name}` : ""}
      </p>

      <div className="space-y-2 max-h-[20vh] overflow-y-auto pr-1">
        {activeProjectFiles.length === 0 ? (
          <p className="text-xs text-gray-500">No files uploaded yet.</p>
        ) : (
          activeProjectFiles.map((file) => (
            <div key={file.id} className="bg-gray-900 hover:bg-gray-800 rounded-xl px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  className="flex-1 text-left truncate text-sm"
                  onClick={() => {
                    if (!file.analysis) return;

                    const fileChat: ChatSession = {
                      id: Date.now().toString(),
                      projectId: activeProjectId,
                      title: `File: ${file.name}`,
                      mode: "File Analysis",
                      messages: [
                        {
                          role: "user",
                          text: `Open previous file analysis: ${file.name}`,
                        },
                        {
                          role: "assistant",
                          text: file.analysis,
                        },
                      ],
                      updatedAt: Date.now(),
                    };

                    setChats((prev) => [fileChat, ...prev]);
                    setActiveChatId(fileChat.id);
                    setMode("File Analysis");
                  }}
                >
                  📄 {file.name}
                </button>

                <button
                  onClick={() =>
                    setProjectFiles((prev) => prev.filter((item) => item.id !== file.id))
                  }
                  className="text-gray-500 hover:text-red-400"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    <div>
      <p className="text-gray-400 text-sm mb-2">Mode</p>
      <select
        value={mode}
        onChange={(e) => {
          setMode(e.target.value);
          updateActiveChat((chat) => ({
            ...chat,
            mode: e.target.value,
            updatedAt: Date.now(),
          }));
        }}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white"
      >
        {modes.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>

    <div className="border-t border-gray-800 pt-4">
      <p className="text-gray-400 text-sm mb-3">
        Chats {activeProject ? `in ${activeProject.name}` : ""}
      </p>

      <div className="space-y-2 max-h-[28vh] overflow-y-auto pr-1">
        {projectChats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2 cursor-pointer ${
              chat.id === activeChatId ? "bg-gray-800" : "bg-gray-900 hover:bg-gray-800"
            }`}
          >
            <button onClick={() => selectChat(chat)} className="flex-1 text-left truncate text-sm">
              {chat.title}
            </button>

            <button onClick={() => deleteChat(chat.id)} className="text-gray-500 hover:text-red-400 text-sm">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>

    <div className="hidden lg:block space-y-3 text-sm text-gray-400 mt-4">
      <p>Core Engines:</p>
      <p>• Research Projects</p>
      <p>• AI Chat</p>
      <p>• Research Assistant</p>
      <p>• Paper Review</p>
      <p>• Finance / CFA / ICAN</p>
      <p>• Actuarial Science</p>
      <p>• File Intelligence</p>
    </div>
  </div>
</aside>

         <section className="flex-1 flex flex-col min-h-[calc(100vh-230px)] lg:min-h-screen">
  <div className="border-b border-gray-800 p-4 lg:p-5">
      <h2 className="text-xl lg:text-2xl font-semibold mb-2">
        {activeProject?.name || "Quant GPT"} / {activeChat?.title || mode}
      </h2>

      <p className="text-gray-400 text-xs lg:text-sm mb-4"> Mode: {mode} </p>
      <div className="flex flex-wrap gap-2 mb-4">
  <button
    onClick={generateProjectSummary}
    className="bg-purple-700 hover:bg-purple-800 rounded-xl px-4 py-2 text-sm font-semibold"
  >
    Generate Project Summary
  </button>

  <button
    onClick={suggestNextTasks}
    className="bg-green-700 hover:bg-green-800 rounded-xl px-4 py-2 text-sm font-semibold"
  >
    Suggest Next Tasks
  </button>
</div>
    <div className="grid md:grid-cols-8 gap-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="text-gray-400 text-sm">Chats</div>
        <div className="text-3xl font-bold">
          {activeProjectChatCount}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="text-gray-400 text-sm">Files</div>
        <div className="text-3xl font-bold">
          {activeProjectFileCount}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="text-gray-400 text-sm">Latest File</div>
        <div className="truncate">
          {mostRecentFile?.name || "None"}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="text-gray-400 text-sm">Latest Chat</div>
        <div className="truncate">
          {mostRecentChat?.title || "None"}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
  <div className="text-gray-400 text-sm">Memory</div>
  <div className="text-3xl font-bold">
    {memoryEntries}
  </div>
</div>

<div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
  <div className="text-gray-400 text-sm">Progress</div>
  <div className="text-3xl font-bold">
    {researchProgress}%
  </div>
</div>

<div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
  <div className="text-gray-400 text-sm">Notes Words</div>
  <div className="text-3xl font-bold">
    {notesWordCount}
  </div>
</div>

<div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
  <div className="text-gray-400 text-sm">Health</div>
  <div className="text-3xl font-bold">
    {projectHealth}%
  </div>
</div>
  
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
  <div className="text-gray-400 text-sm">Open Tasks</div>
  <div className="text-3xl font-bold">
    {openTasks}
  </div>
</div>

<div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
  <div className="text-gray-400 text-sm">Completed</div>
  <div className="text-3xl font-bold">
    {completedTasks}
  </div>
</div>
       <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
  <div className="text-gray-400 text-sm">Stage</div>
  <div className="text-lg font-bold">
    {projectStage}
  </div>
</div>

<div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
  <div className="text-gray-400 text-sm">Risk</div>
  <div className="text-lg font-bold">
    {projectRisk}
  </div>
</div>

<div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
  <div className="text-gray-400 text-sm">Next Focus</div>
  <div className="text-sm font-bold">
    {nextFocus}
  </div>
</div>
      
    </div>
</div> 
      <div className="border-b border-gray-800 p-4">
       <h3 className="font-semibold mb-3">
      Research Dashboard
     </h3>

  <div className="space-y-2 text-sm">
    <div>
      Stage: <span className="font-semibold">{projectStage}</span>
    </div>

    <div>
      Risk Level: <span className="font-semibold">{projectRisk}</span>
    </div>

    <div>
      Tasks Completion:{" "}
      <span className="font-semibold">
        {completedTasks}/{totalTasks}
      </span>
    </div>

    <div>
      Files Uploaded:{" "}
      <span className="font-semibold">
        {activeProjectFileCount}
      </span>
    </div>

    <div>
      Memory Entries:{" "}
      <span className="font-semibold">
        {memoryEntries}
      </span>
    </div>

    <div className="w-full bg-gray-800 rounded-full h-3 mt-3">
      <div
        className="bg-blue-600 h-3 rounded-full"
        style={{ width: `${projectHealth}%` }}
      />
    </div>

    <div className="text-xs text-gray-400">
      Project Health: {projectHealth}%
    </div>
  </div>
        <div className="flex flex-wrap gap-2 mt-4">
  <button
    onClick={clearProjectMemory}
    className="bg-red-700 hover:bg-red-800 rounded-xl px-3 py-2 text-xs font-semibold"
  >
    Clear Memory
  </button>

  <button
    onClick={clearProjectNotes}
    className="bg-orange-700 hover:bg-orange-800 rounded-xl px-3 py-2 text-xs font-semibold"
  >
    Clear Notes
  </button>

  <button
    onClick={clearProjectTasks}
    className="bg-yellow-700 hover:bg-yellow-800 rounded-xl px-3 py-2 text-xs font-semibold"
  >
    Clear Tasks
  </button>
</div>
</div>

           <div className="border-b border-gray-800 p-4">
  <h3 className="font-semibold mb-3">
    File Intelligence
  </h3>

  <div className="grid md:grid-cols-4 gap-4 text-sm">
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
      <div className="text-gray-400">Latest File</div>
      <div className="font-semibold truncate">
        {mostRecentFile?.name || "None"}
      </div>
    </div>

    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
      <div className="text-gray-400">File Type</div>
      <div className="font-semibold truncate">
        {latestFileType}
      </div>
    </div>

    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
      <div className="text-gray-400">Uploaded</div>
      <div className="font-semibold truncate">
        {latestFileUploadedAt}
      </div>
    </div>

    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
      <div className="text-gray-400">Has Analysis</div>
      <div className="font-semibold">
        {latestFileHasAnalysis}
      </div>
   </div>
  
  </div>
             <div className="flex flex-wrap gap-2 mt-4">
  <button
    onClick={openLatestFileAnalysis}
    disabled={!mostRecentFile?.analysis}
    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-xl px-4 py-2 text-sm font-semibold"
  >
    Open Analysis
  </button>

  <button
    onClick={() => {
      if (!mostRecentFile) return;
      sendPresetMessage(`Ask a question about this file: ${mostRecentFile.name}`);
      addProjectMemory(`Asked about ${mostRecentFile.name}`);
    }}
    disabled={!mostRecentFile}
    className="bg-purple-700 hover:bg-purple-800 disabled:bg-gray-700 rounded-xl px-4 py-2 text-sm font-semibold"
  >
    Ask About File
  </button>

  <button
    onClick={() => {
      if (!mostRecentFile) return;
      sendPresetMessage(`Summarize the uploaded file: ${mostRecentFile.name}`);
      addProjectMemory(`Requested summary for ${mostRecentFile.name}`);
    }}
    disabled={!mostRecentFile}
    className="bg-green-700 hover:bg-green-800 disabled:bg-gray-700 rounded-xl px-4 py-2 text-sm font-semibold"
  >
    Summarize File
  </button>
</div>
</div>
           
      <div className="border-b border-gray-800 p-4">
        <h3 className="font-semibold mb-2">
           Project Memory
        </h3>
    
     {activeProjectMemory?.items?.length ? (
      <div className="space-y-2">
  {activeProjectMemory.items
    .slice()
    .reverse()
    .map((item, idx) => (
      <div
        key={idx}
        className="border-l-2 border-blue-600 pl-3 py-1"
      >
        <div className="text-xs text-gray-500">
          {formatTimelineDate(item.createdAt)}
        </div>

        <div className="text-sm text-gray-200">
          {item.text}
        </div>

        <div className="text-[10px] text-gray-500">
          {new Date(item.createdAt).toLocaleString()}
        </div>
      </div>
    ))}
</div>
) : (
             <p className="text-gray-500 text-sm">
                No memory yet.
             </p>
           )}
         </div>

        <div className="border-b border-gray-800 p-4">
               <h3 className="font-semibold mb-2">
                  Project Notes
            </h3>

           <textarea
           value={activeProjectNote?.content || ""}
           onChange={(e) => {
           const value = e.target.value;

           setProjectNotes((prev) => {
           const existing = prev.find(
          (n) => n.projectId === activeProjectId
          );

        if (existing) {
          return prev.map((n) =>
            n.projectId === activeProjectId
              ? { ...n, content: value }
              : n
          );
        }

        return [
          ...prev,
          {
            projectId: activeProjectId,
            content: value,
          },
        ];
      });
    }}
    rows={5}
    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white"
    placeholder="Write project notes here..."
  />
</div>
        <div className="border-b border-gray-800 p-4">
           <h3 className="font-semibold mb-2">Project Tasks</h3>

       <div className="flex gap-2 mb-3">
           <input
             id="new-task-input"
             type="text"
             className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white"
             placeholder="Add a task..."
             onKeyDown={(e) => {
          if (e.key === "Enter") {
          const input = e.currentTarget;
          const value = input.value.trim();

          if (!value || !activeProjectId) return;

           addProjectTask(value);

          input.value = "";
        }
      }}
    />

    <button
      onClick={() => {
        const input = document.getElementById(
          "new-task-input"
        ) as HTMLInputElement | null;

        const value = input?.value.trim();

        if (!value || !activeProjectId) return;

         addProjectTask(value); 

        if (input) input.value = "";
      }}
      className="bg-blue-600 hover:bg-blue-700 rounded-xl px-4 font-semibold"
    >
      Add
    </button>
  </div>
  <div className="flex gap-2 mb-3">
  <input
    id="suggested-task-input"
    type="text"
    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white"
    placeholder="Paste AI suggested task here..."
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        const input = e.currentTarget;
        addProjectTask(input.value);
        input.value = "";
      }
    }}
  />

  <button
    onClick={() => {
      const input = document.getElementById(
        "suggested-task-input"
      ) as HTMLInputElement | null;

      addProjectTask(input?.value || "");

      if (input) input.value = "";
    }}
    className="bg-green-700 hover:bg-green-800 rounded-xl px-4 font-semibold"
  >
    Add Suggested Task
  </button>
</div>

  {activeProjectTasks.length === 0 ? (
    <p className="text-sm text-gray-500">No tasks yet.</p>
  ) : (
    <div className="space-y-2">
      {activeProjectTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3"
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() =>
              setProjectTasks((prev) =>
                prev.map((item) =>
                  item.id === task.id
                    ? { ...item, completed: !item.completed }
                    : item
                )
              )
            }
          />

          <span
            className={`flex-1 text-sm ${
              task.completed
                ? "line-through text-gray-500"
                : "text-gray-200"
            }`}
          >
            {task.text}
          </span>

          <button
            onClick={() =>
              setProjectTasks((prev) =>
                prev.filter((item) => item.id !== task.id)
              )
            }
            className="text-gray-500 hover:text-red-400"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}
</div>
           
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`w-full lg:max-w-4xl p-4 rounded-2xl text-sm lg:text-base ${
                msg.role === "user"
                  ? "bg-blue-700 lg:ml-auto"
                  : "bg-gray-900 border border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300">
                  {msg.role === "user" ? "You" : "Quant GPT"}
                </p>

                {msg.role === "assistant" && (
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    📋 Copy
                  </button>
                )}
              </div>

              <div className="whitespace-pre-wrap leading-relaxed break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                  components={{
                    code(props) {
                      const { className, children } = props; 
                      const match = /language-(\w+)/.exec(className || "");

                      return match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-800 px-1 py-0.5 rounded">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="w-full lg:max-w-4xl p-4 rounded-2xl bg-gray-900 border border-gray-800">
              <p className="text-sm text-gray-300 mb-2">Quant GPT</p>
              <p>Thinking...</p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="px-4 lg:px-5 pb-2 bg-black">
            <div className="text-sm text-gray-300 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 flex items-center justify-between gap-3">
              <span className="truncate">Selected file: {selectedFile.name}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  Remove
                </button>

                <button
                  onClick={uploadFile}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  Analyze File
                </button>
              </div>
            </div>
          </div>
        )}

        {chart && (
          <div className="px-4 lg:px-5 pb-3 bg-black">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">
                Generated Dataset Chart
              </h3>

              <img
                src={`data:image/png;base64,${chart}`}
                alt="Generated Chart"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        )}

        <div className="border-t border-gray-800 p-4 lg:p-5 sticky bottom-0 bg-black">
          <div className="w-full flex items-end gap-3 bg-[#1f1f1f] border border-gray-700 rounded-3xl px-4 py-3">
            <label className="cursor-pointer text-gray-300 hover:text-white px-2 text-xl">
              📎
              <input
                type="file"
                accept=".txt,.csv,.xlsx,.pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
            </label>

            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();

                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                }
              }}
              placeholder="Ask Quant GPT anything..."
              rows={1}
              className="flex-1 w-full bg-transparent text-white placeholder:text-gray-400 outline-none resize-none px-2 py-2 min-h-[40px] max-h-[200px] overflow-y-auto"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center font-bold"
            >
              ↑
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white p-6">
          Loading Quant GPT...
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

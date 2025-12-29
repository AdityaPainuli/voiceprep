export const tools = [
  {
    type: "function",
    name: "provide_code_correction",
    description:
      "Provide a corrected version of the candidate's code, or show a code example.",
    parameters: {
      type: "object",
      properties: {
        correctedCode: {
          type: "string",
          description: "The full code snippet to display.",
        },
        language: {
          type: "string",
          description:
            "The programming language of the code (e.g., 'python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust').",
        },
        explanation: {
          type: "string",
          description: "Brief explanation of the code.",
        },
      },
      required: ["correctedCode", "language", "explanation"],
    },
  },
  {
    type: "function",
    name: "provide_execution_output",
    description: "Provide the output of the simulated code execution.",
    parameters: {
      type: "object",
      properties: {
        output: {
          type: "string",
          description: "The console output of the code execution.",
        },
        status: {
          type: "string",
          enum: ["success", "error"],
          description: "The execution status.",
        },
        id: {
          type: "string",
          description:
            "The internal ID provided in the user's request (if any).",
        },
      },
      required: ["output", "status"],
    },
  },
  {
    type: "function",
    name: "generate_chart",
    description:
      "Generate a standard chart for QUANTITATIVE/NUMERICAL data (e.g., performance metrics, market share, comparisons).",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["bar", "line", "pie", "doughnut", "radar"],
          description: "The type of chart to generate.",
        },
        data: {
          type: "object",
          properties: {
            labels: {
              type: "array",
              items: { type: "string" },
              description: "Labels for the X-axis or categories.",
            },
            datasets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: {
                    type: "string",
                    description: "Label for the dataset.",
                  },
                  data: {
                    type: "array",
                    items: { type: "number" },
                    description:
                      "Array of numerical values corresponding to the labels.",
                  },
                  backgroundColor: {
                    type: "array",
                    items: { type: "string" },
                    description:
                      "Optional array of colors for the data points.",
                  },
                },
                required: ["label", "data"],
              },
              description: "Data points. MUST include at least one dataset.",
            },
          },
          required: ["labels", "datasets"],
        },
        title: { type: "string", description: "Title of the chart." },
        description: {
          type: "string",
          description: "Brief description of what the chart shows.",
        },
      },
      required: ["type", "data", "title"],
    },
  },
  {
    type: "function",
    name: "generate_diagram",
    description:
      "Generate a structural diagram using Mermaid.js for CONCEPTS, FLOWS, and DATA STRUCTURES (e.g., Linked Lists, Trees, Graphs, Class Diagrams, Flowcharts).",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description:
            "The Mermaid.js syntax string. Do not include markdown backticks.",
        },
        title: { type: "string", description: "Title of the diagram." },
        description: {
          type: "string",
          description: "Brief description of what the diagram shows.",
        },
      },
      required: ["code", "title"],
    },
  },
  {
    type: "function",
    name: "create_note",
    description: "Create a structured note card for the user's notebook.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Title of the note." },
        content: {
          type: "string",
          description:
            "The content of the note. MUST use rich Markdown formatting: Use Headers (##), Bold (**text**), Lists (- item), and Code Blocks (```language) to organize information clearly.",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional tags for the note (e.g., 'Concept', 'Tip', 'Warning').",
        },
      },
      required: ["title", "content"],
    },
  },
  {
    type: "function",
    name: "create_slide",
    description: "Create a presentation slide for a specific topic.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Title of the slide (the topic).",
        },
        bulletPoints: {
          type: "array",
          items: { type: "string" },
          description: "List of 3-5 key points to display on the slide.",
        },
      },
      required: ["title", "bulletPoints"],
    },
  },
  {
    type: "function",
    name: "generate_animation",
    description:
      "Generate a video animation using Manim (Python) for explaining DYNAMIC concepts (e.g., how a Linked List insertion works, Binary Search visualization, Physics concepts).",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description:
            "The Python code for the Manim Scene. Must define a class inheriting from Scene (e.g. class MyScene(Scene):). The code should construct the animation.",
        },
        title: { type: "string", description: "Title of the animation." },
        description: {
          type: "string",
          description: "Brief description of what the animation shows.",
        },
      },
      required: ["code", "title"],
    },
  },
];

export const notUsedTools = [
  {
    type: "function",
    name: "post_question",
    description:
      "Post a technical interview question or a coding exercise to the candidate's screen with test cases.",
    parameters: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The text of the question or exercise to display.",
        },
        testCases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              input: { type: "string" },
              expectedOutput: { type: "string" },
            },
          },
          description: "Array of test cases (input/output pairs).",
        },
      },
      required: ["question", "testCases"],
    },
  },
  {
    type: "function",
    name: "mark_question_solved",
    description:
      "Mark the current question as solved when the candidate provides a correct solution.",
    parameters: {
      type: "object",
      properties: {
        feedback: {
          type: "string",
          description: "Brief feedback on the solution.",
        },
      },
      required: ["feedback"],
    },
  },
];

"use client";

import React from "react";
import Editor, { DiffEditor } from "@monaco-editor/react";

interface CodeEditorProps {
  language?: string;
  setLanguage?: (lang: string) => void;
  value?: string;
  onChange?: (value: string | undefined) => void;
  onSubmit?: () => void;
  onRun?: () => void;
  isSubmitting?: boolean;
  isRunning?: boolean;
  isDiffMode?: boolean;
  originalCode?: string;
  modifiedCode?: string;
  onApply?: () => void;
  onCancel?: () => void;
  output?: string | null;
  isError?: boolean;
}

const LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "go", name: "Go" },
];

const CodeEditor: React.FC<CodeEditorProps> = ({
  language = "javascript",
  setLanguage,
  value = "// Write your code here...",
  onChange,
  onSubmit,
  onRun,
  isSubmitting = false,
  isRunning = false,
  isDiffMode = false,
  originalCode = "",
  modifiedCode = "",
  onApply,
  onCancel,
  output,
  isError = false,
}) => {
  console.log("Inside final component", value);
  return (
    <div className="h-full w-full bg-[#1e1e1e] border-l border-gray-700 flex flex-col">
      <div className="h-12 bg-[#252526] flex items-center justify-between px-4 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 font-medium flex items-center gap-2">
            {isDiffMode ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                AI Suggestion
              </>
            ) : (
              "Code Editor"
            )}
          </span>
          {!isDiffMode && setLanguage && (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#3c3c3c] text-gray-300 text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-2">
          {isDiffMode ? (
            <>
              <button
                onClick={onCancel}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onApply}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors"
              >
                Apply Fix
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onRun}
                disabled={isRunning || isSubmitting}
                className={`px-3 py-1.5 text-white text-xs font-bold rounded transition-colors flex items-center gap-2 ${
                  isRunning
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
              >
                {isRunning ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Running...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Run
                  </>
                )}
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitting || isRunning}
                className={`px-3 py-1.5 text-white text-xs font-bold rounded transition-colors flex items-center gap-2 ${
                  isSubmitting
                    ? "bg-green-600/50 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Submit Solution
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1">
          {isDiffMode ? (
            <DiffEditor
              height="100%"
              language={language}
              original={originalCode}
              modified={modifiedCode}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: true,
              }}
            />
          ) : (
            <Editor
              key={`${language}-${value?.length}`}
              height="100%"
              // defaultLanguage={language}
              language={language}
              value={value}
              theme="vs-dark"
              onChange={onChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: isSubmitting || isRunning,
              }}
            />
          )}
        </div>
        <div className="h-1/3 bg-black border-t border-gray-700 p-4 overflow-auto font-mono text-sm shrink-0">
          <div className="text-gray-400 mb-2 text-xs uppercase tracking-wider flex justify-between items-center">
            <span>Console Output</span>
            {output && (
              <button
                onClick={() => {
                  /* TODO: Add clear function */
                }}
                className="text-gray-600 hover:text-gray-400"
              >
                Clear
              </button>
            )}
          </div>
          {output ? (
            <pre
              className={`${
                isError ? "text-red-400" : "text-green-400"
              } whitespace-pre-wrap`}
            >
              {output}
            </pre>
          ) : (
            <div className="text-gray-600 italic">
              Output will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

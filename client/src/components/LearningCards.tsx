import React from "react";
import ReactMarkdown from "react-markdown";
import ChartVisualizer from "./ChartVisualizer";
import MermaidDiagram from "./MermaidDiagram";
import CodeEditor from "./CodeEditor";
import { useEffect, useRef } from "react";

interface NoteCardProps {
  title: string;
  content: string;
  tags?: string[];
  onSave?: (newContent: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  title,
  content,
  tags,
  onSave,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState(content);

  const handleSave = () => {
    if (onSave) {
      onSave(editedContent);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6 shadow-lg mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="p-1.5 bg-yellow-500/10 rounded-md text-yellow-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </span>
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {tags?.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-full border border-gray-700"
            >
              #{tag}
            </span>
          ))}
          {onSave && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              title="Edit Note"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-300 text-sm focus:outline-none focus:border-blue-500 font-mono"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditedContent(content);
                setIsEditing(false);
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
            >
              Save & Update Tutor
            </button>
          </div>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

interface VisualCardProps {
  type: "bar" | "line" | "pie" | "doughnut" | "radar" | "mermaid";
  data: any;
  title: string;
  description?: string;
  id?: string;
  onExpand?: () => void;
}

export const VisualCard: React.FC<VisualCardProps> = ({
  type,
  data,
  title,
  description,
  id,
  onExpand,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6 shadow-lg mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="p-1.5 bg-purple-500/10 rounded-md text-purple-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </span>
          {title || "Visual Explanation"}
        </h3>

        {onExpand && (
          <button
            onClick={onExpand}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            title="Maximize"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        )}
      </div>

      {/* CHART CONTAINER */}
      <div
        className={`relative w-full bg-black/20 rounded-lg border border-gray-800/50 
  ${type === "mermaid" ? "min-h-[400px]" : "h-[400px]"}
  overflow-auto p-8`}
      >
        {type === "mermaid" ? (
          <MermaidDiagram key={id} chart={data.code || data} />
        ) : (
          <ChartVisualizer
            type={type}
            data={data}
            title=""
            description={description}
          />
        )}
      </div>

      {description && (
        <div className="mt-4 text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg border border-gray-800/50">
          {description}
        </div>
      )}
    </div>
  );
};

interface CodeCardProps {
  code: string;
  language: string;
  explanation?: string;
  onRun?: (code: string) => void;
  isRunning?: boolean;
  output?: string | null;
  isError?: boolean;
}

export const CodeCard: React.FC<CodeCardProps> = ({
  code,
  language,
  explanation,
  onRun,
  isRunning,
  output,
  isError,
}) => {
  return (
    <div className="bg-[#161b22] rounded-xl border border-gray-800 shadow-lg mb-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-800/20">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="p-1.5 bg-blue-500/10 rounded-md text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </span>
          Code Example
        </h3>
        <span className="text-xs text-gray-500 uppercase">{language}</span>
      </div>

      <div className="h-[300px] border-b border-gray-800">
        <CodeEditor
          language={language}
          value={code}
          onChange={(val) => {}} // Read-only for now in the stream, or we could make it editable
          onSubmit={() => {}}
          onRun={() => onRun && onRun(code)}
          isSubmitting={false}
          isRunning={isRunning || false}
          isDiffMode={false}
          originalCode={code}
          modifiedCode=""
          onApply={() => {}}
          onCancel={() => {}}
          output={output}
          isError={isError || false}
          setLanguage={() => {}}
        />
      </div>

      {explanation && (
        <div className="p-4 bg-gray-800/10 text-sm text-gray-300">
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
};

interface SlideCardProps {
  title: string;
  bulletPoints: string[];
}

export const SlideCard: React.FC<SlideCardProps> = ({
  title,
  bulletPoints,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#161b22] to-[#1c2128] rounded-xl border border-gray-700 p-8 shadow-2xl mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 transform hover:scale-[1.01] transition-transform">
      <div className="border-b-2 border-blue-500/50 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {bulletPoints.map((point, i) => (
          <div
            key={i}
            className="flex items-start gap-4 animate-in fade-in slide-in-from-left-4"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="mt-1.5 p-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
            <p className="text-xl text-gray-200 leading-relaxed font-light">
              {point}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface VideoCardProps {
  url: string;
  title: string;
  description?: string;
  onExpand?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  url,
  title,
  description,
  onExpand,
}) => {
  return (
    <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6 shadow-lg mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="p-1.5 bg-red-500/10 rounded-md text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </span>
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-medium rounded-full border border-red-500/20 uppercase">
            Animation
          </span>
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              title="Maximize"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="w-full bg-black/40 rounded-lg overflow-hidden border border-gray-800/50">
        <video src={url} controls autoPlay loop className="w-full">
          Your browser does not support the video tag.
        </video>
      </div>
      {description && (
        <div className="mt-4 text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg border border-gray-800/50">
          {description}
        </div>
      )}
    </div>
  );
};

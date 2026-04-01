import { Loader2 } from "lucide-react";

const EditorLoadingState = () => {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-4xl rounded-[32px] border border-surface-200/70 bg-white/80 backdrop-blur-xl shadow-xl shadow-surface-900/5 p-10">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 size={32} className="text-primary-400 animate-spin" />
          <div className="text-center">
            <p className="text-surface-700 font-semibold">Preparing your writing space</p>
            <p className="text-surface-400 text-sm mt-1">
              Loading document content, formatting tools, and collaborators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLoadingState;

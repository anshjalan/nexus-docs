const EditorInfoBar = ({ characterCount }) => {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 px-2">
      <span className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
        Writing mode
      </span>
      <span className="text-sm text-surface-500">{characterCount} characters</span>
      <span className="text-sm text-surface-300">&bull;</span>
      <span className="text-sm text-surface-500">Autosaves shortly after changes</span>
    </div>
  );
};

export default EditorInfoBar;

import { CheckCircle2, Clock3, Crown, ScanText, Users } from "lucide-react";

const EditorMetaBar = ({ wordCount, readingTime, lastSavedLabel, owner, collaborators }) => {
  const people = [owner, ...(collaborators || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-4">
      <div className="rounded-2xl border border-surface-200/80 bg-white shadow-sm px-4 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-sm text-surface-600">
          <ScanText size={16} className="text-primary-500" />
          <span className="font-medium text-surface-800">{wordCount}</span>
          <span>words</span>
        </div>

        <div className="h-4 w-px bg-surface-200 hidden sm:block" />

        <div className="flex items-center gap-2 text-sm text-surface-600">
          <Clock3 size={16} className="text-primary-500" />
          <span>{readingTime} min read</span>
        </div>

        <div className="h-4 w-px bg-surface-200 hidden sm:block" />

        <div className="flex items-center gap-2 text-sm text-surface-600">
          <CheckCircle2 size={16} className="text-primary-500" />
          <span>Last saved {lastSavedLabel}</span>
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {owner && (
            <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
              <Crown size={12} />
              <span>
                {owner.firstName} {owner.lastName}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full bg-surface-50 px-3 py-1.5 text-xs font-medium text-surface-600">
            <Users size={12} />
            <span>{people.length} with access</span>
          </div>

          <div className="flex -space-x-2">
            {people.slice(0, 4).map((person) => (
              <div
                key={person._id}
                title={`${person.firstName || ""} ${person.lastName || ""}`.trim() || person.email}
                className="w-8 h-8 rounded-full border-2 border-white bg-linear-to-br from-primary-500 to-primary-700 text-white text-xs font-semibold flex items-center justify-center shadow-sm"
              >
                {(person.firstName?.charAt(0) || person.email?.charAt(0) || "U").toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorMetaBar;

const LoadingCard = () => {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-surface-100 last:border-none">
    <div className="w-10 h-10 rounded-xl shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded-lg shimmer" />
        <div className="h-3 w-24 rounded-lg shimmer" />
      </div>
    </div>
  );
};

export default LoadingCard;
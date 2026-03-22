export default function StarRating({ rating = 0, count = 0, size = "sm" }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`${size === "sm" ? "text-sm" : "text-lg"} leading-none
                                   ${rating >= s ? "text-yellow-400" : "text-white/20"}`}>
          ★
        </span>
      ))}
      <span className="text-muted text-xs ml-1">
        ({count?.toLocaleString?.() ?? count})
      </span>
    </div>
  );
}

const STEPS = ["Address", "Payment", "Confirm"];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 py-8">
      {STEPS.map((label, idx) => {
        const step     = idx + 1;
        const done     = currentStep > step;
        const active   = currentStep === step;
        return (
          <div key={step} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center
                               font-bold text-sm border-2 transition-all duration-300
                               ${done   ? "bg-accent border-accent text-white" : ""}
                               ${active ? "border-primary text-primary bg-primary/10" : ""}
                               ${!done && !active ? "border-white/20 text-muted" : ""}`}>
                {done ? "✓" : step}
              </div>
              <span className={`text-xs font-medium transition-colors
                                ${active ? "text-primary" : done ? "text-accent" : "text-muted"}`}>
                {label}
              </span>
            </div>
            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mb-5 mx-2 transition-colors duration-300
                              ${currentStep > step ? "bg-accent" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

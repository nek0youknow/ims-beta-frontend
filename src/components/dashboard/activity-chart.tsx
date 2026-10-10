export function ActivityChart() {
  return (
    <div className="glass-panel flex h-full min-h-[16rem] flex-col p-5">
      <div className="mb-4">
        <h3 className="text-base font-normal text-foreground">Activity frequency</h3>
        <p className="text-xs text-muted-foreground">Workspace & project momentum</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-white/10 bg-black/15 px-6 py-10 text-center">
        <p className="text-sm text-foreground">No data yet</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Activity chart will appear here soon — after issues and events are live.
        </p>
      </div>
    </div>
  );
}

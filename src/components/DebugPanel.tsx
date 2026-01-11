/**
 * DEBUG PANEL
 * ============
 * Visual testing panel for typography rendering pipeline.
 * Shows real-time character positions, timing, and reflow detection.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VisualDebugger, type DebugReport } from '../core/visual-debugger';

interface DebugPanelProps {
  /** Target container to debug */
  targetSelector?: string;
  /** Auto-start recording */
  autoStart?: boolean;
  /** Recording duration in ms */
  duration?: number;
}

export function DebugPanel({
  targetSelector = '.newspaper-article-flow',
  autoStart = false,
  duration = 10000,
}: DebugPanelProps) {
  const debuggerRef = useRef<VisualDebugger | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [report, setReport] = useState<DebugReport | null>(null);
  const [liveStats, setLiveStats] = useState({
    chars: 0,
    visible: 0,
    reflows: 0,
    elapsed: 0,
  });

  // Initialize debugger
  useEffect(() => {
    debuggerRef.current = new VisualDebugger({
      positionTolerance: 2,
      timingTolerance: 50,
    });

    return () => {
      debuggerRef.current?.detach();
    };
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.error(`[DebugPanel] Target not found: ${targetSelector}`);
      return;
    }

    debuggerRef.current?.attach(target);
    debuggerRef.current?.startRecording();
    setIsRecording(true);
    setReport(null);

    // Update live stats
    const interval = setInterval(() => {
      if (debuggerRef.current) {
        const r = debuggerRef.current.getReport();
        setLiveStats({
          chars: r.totalChars,
          visible: r.appearedChars,
          reflows: r.reflowCount,
          elapsed: r.timing.lastCharAt,
        });
      }
    }, 100);

    // Auto-stop after duration
    setTimeout(() => {
      clearInterval(interval);
      stopRecording();
    }, duration);

  }, [targetSelector, duration]);

  // Stop recording
  const stopRecording = useCallback(() => {
    debuggerRef.current?.stopRecording();
    setIsRecording(false);

    const finalReport = debuggerRef.current?.getReport();
    if (finalReport) {
      setReport(finalReport);
      debuggerRef.current?.printReport();
    }
  }, []);

  // Auto-start
  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(startRecording, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startRecording]);

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-black/90 text-white font-mono text-xs p-4 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sage">VISUAL DEBUGGER</h3>
        <div className="flex gap-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-2 py-1 bg-sage text-black rounded hover:bg-sage/80"
            >
              ▶ Record
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ■ Stop
            </button>
          )}
        </div>
      </div>

      {/* Live Stats */}
      {isRecording && (
        <div className="grid grid-cols-4 gap-2 mb-3 p-2 bg-white/10 rounded">
          <div className="text-center">
            <div className="text-lg font-bold">{liveStats.chars}</div>
            <div className="text-[10px] opacity-60">CHARS</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{liveStats.visible}</div>
            <div className="text-[10px] opacity-60">VISIBLE</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${liveStats.reflows > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {liveStats.reflows}
            </div>
            <div className="text-[10px] opacity-60">REFLOWS</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{(liveStats.elapsed / 1000).toFixed(1)}s</div>
            <div className="text-[10px] opacity-60">TIME</div>
          </div>
        </div>
      )}

      {/* Final Report */}
      {report && (
        <div className="space-y-3">
          {/* Summary */}
          <div className={`p-2 rounded ${report.summary.reflowFree ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            <div className="font-bold mb-1">
              {report.summary.reflowFree ? '✓ REFLOW FREE' : '✗ REFLOWS DETECTED'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>Position Accuracy: {report.summary.positionAccuracy.toFixed(1)}%</div>
              <div>Timing Accuracy: {report.summary.timingAccuracy.toFixed(1)}%</div>
            </div>
          </div>

          {/* Timing */}
          <div className="p-2 bg-white/10 rounded">
            <div className="font-bold mb-1 text-sage">TIMING</div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div>First char: {report.timing.firstCharAt.toFixed(0)}ms</div>
              <div>Last char: {report.timing.lastCharAt.toFixed(0)}ms</div>
              <div>Duration: {report.timing.totalDuration.toFixed(0)}ms</div>
              <div>Avg interval: {report.timing.avgInterval.toFixed(1)}ms</div>
            </div>
          </div>

          {/* Issues */}
          {report.summary.issues.length > 0 && (
            <div className="p-2 bg-red-900/30 rounded">
              <div className="font-bold mb-1 text-red-400">ISSUES</div>
              {report.summary.issues.map((issue, i) => (
                <div key={i} className="text-[10px] text-red-300">• {issue}</div>
              ))}
            </div>
          )}

          {/* Reflow Details */}
          {report.positionChanges.length > 0 && (
            <div className="p-2 bg-white/10 rounded">
              <div className="font-bold mb-1 text-red-400">
                REFLOWS ({report.positionChanges.length})
              </div>
              <div className="max-h-32 overflow-auto">
                {report.positionChanges.slice(0, 20).map((change, i) => (
                  <div key={i} className="text-[10px] opacity-80">
                    [{change.charIndex}] "{change.char}" Δ({change.delta.x.toFixed(0)},{change.delta.y.toFixed(0)})
                  </div>
                ))}
                {report.positionChanges.length > 20 && (
                  <div className="text-[10px] opacity-50">
                    ... and {report.positionChanges.length - 20} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Character Timeline (first 50) */}
          <div className="p-2 bg-white/10 rounded">
            <div className="font-bold mb-1 text-sage">CHARACTER TIMELINE</div>
            <div className="flex flex-wrap gap-px max-h-20 overflow-auto">
              {report.observations.slice(0, 100).map((obs, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-sm ${obs.visible ? 'bg-sage' : 'bg-red-500'}`}
                  title={`[${obs.charIndex}] "${obs.char}" at ${obs.appearedAt.toFixed(0)}ms`}
                />
              ))}
            </div>
            <div className="text-[10px] opacity-50 mt-1">
              {report.observations.length} chars total
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isRecording && !report && (
        <div className="text-[10px] opacity-60">
          <p>1. Trigger a newspaper render</p>
          <p>2. Click Record to start tracking</p>
          <p>3. Watch for reflows and timing issues</p>
        </div>
      )}
    </div>
  );
}

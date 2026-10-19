import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { osiLayers, packetJourneySteps } from '../data/theoryData';

/* ═══════════════ OSI / TCP-IP Comparator ════════════════════════════════ */
function LayerComparator() {
  const [selectedLayer, setSelectedLayer] = useState(null);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>
        🗂️ OSI (7) vs TCP/IP Classic (4) vs TCP/IP Modern (5)
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-sec)' }}>
        Click any layer to explore its PDU, devices, and protocols.
      </p>

      <div className="grid grid-cols-3 gap-3 text-sm">
        {/* Headers */}
        <div className="font-semibold text-center py-2 rounded-t-lg" style={{ background: 'var(--border-clr)', color: 'var(--text)' }}>
          OSI Model (7 Layers)
        </div>
        <div className="font-semibold text-center py-2 rounded-t-lg" style={{ background: 'var(--border-clr)', color: 'var(--text)' }}>
          TCP/IP Classic (4)
        </div>
        <div className="font-semibold text-center py-2 rounded-t-lg" style={{ background: 'var(--border-clr)', color: 'var(--text)' }}>
          TCP/IP Modern (5)
        </div>

        {/* Layers */}
        {osiLayers.map((layer, idx) => {
          const isSelected = selectedLayer === layer.num;
          // Group for TCP classic
          const classicGroup = layer.tcpClassic;
          const isFirstInClassic = idx === 0 || osiLayers[idx - 1].tcpClassic !== classicGroup;
          const classicSpan = isFirstInClassic
            ? osiLayers.filter((l) => l.tcpClassic === classicGroup).length
            : 0;

          // Group for TCP modern
          const modernGroup = layer.tcpModern;
          const isFirstInModern = idx === 0 || osiLayers[idx - 1].tcpModern !== modernGroup;
          const modernSpan = isFirstInModern
            ? osiLayers.filter((l) => l.tcpModern === modernGroup).length
            : 0;

          return (
            <motion.div key={layer.num} className="contents">
              {/* OSI column */}
              <motion.button
                className="text-left px-3 py-2.5 border transition-all cursor-pointer"
                style={{
                  background: isSelected ? layer.color : 'var(--card)',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border-clr)',
                  borderRadius: idx === 0 ? '0' : idx === 6 ? '0 0 0 8px' : '0',
                }}
                onClick={() => setSelectedLayer(isSelected ? null : layer.num)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="font-mono text-xs mr-1.5" style={{ color: 'var(--accent)' }}>L{layer.num}</span>
                <span className="font-medium">{layer.name}</span>
                <div className="text-[11px] mt-0.5 font-mono" style={{ color: 'var(--text-ter)' }}>
                  PDU: {layer.pdu}
                </div>
              </motion.button>

              {/* TCP Classic column */}
              {isFirstInClassic ? (
                <div
                  className="flex items-center justify-center border text-center font-medium"
                  style={{
                    gridRow: `span ${classicSpan}`,
                    background: 'var(--card)',
                    borderColor: 'var(--border-clr)',
                    color: 'var(--text)',
                    borderRadius: idx === 6 ? '0 0 0 0' : '0',
                  }}
                >
                  {classicGroup}
                </div>
              ) : null}

              {/* TCP Modern column */}
              {isFirstInModern ? (
                <div
                  className="flex items-center justify-center border text-center font-medium"
                  style={{
                    gridRow: `span ${modernSpan}`,
                    background: 'var(--card)',
                    borderColor: 'var(--border-clr)',
                    color: 'var(--text)',
                    borderRadius: idx === 6 ? '0 0 8px 0' : '0',
                  }}
                >
                  {modernGroup}
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {/* Selected layer details */}
      <AnimatePresence>
        {selectedLayer && (
          <motion.div
            className="mt-3 p-4 rounded-lg border"
            style={{ background: 'var(--card)', borderColor: 'var(--border-clr)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {(() => {
              const layer = osiLayers.find((l) => l.num === selectedLayer);
              if (!layer) return null;
              return (
                <div>
                  <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--text)' }}>
                    Layer {layer.num}: {layer.name}
                  </h4>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-sec)' }}>
                    {layer.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-ter)' }}>Devices</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {layer.devices.map((d) => (
                          <span key={d} className="ip-pill text-[11px]">{d}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-ter)' }}>Protocols</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {layer.protocols.map((p) => (
                          <span key={p} className="ip-pill text-[11px]" style={{ background: 'var(--purple-bg)', color: 'var(--purple-fg)' }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════ Frame / Packet X-Ray Card ══════════════════════════════ */
function XRayCard({ step }) {
  return (
    <motion.div
      className="p-4 rounded-lg border"
      style={{ background: 'var(--card)', borderColor: 'var(--border-clr)' }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      key={step.id}
    >
      <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--text)' }}>
        {step.title}
      </h4>
      <p className="text-sm mb-3" style={{ color: 'var(--text-sec)' }}>
        {step.description}
      </p>

      {/* Layer 2 Frame */}
      {step.frame && (
        <div className="mb-3 p-3 rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--accent)', background: 'var(--accent-bg)' }}>
          <div className="text-[10px] font-semibold uppercase mb-1.5" style={{ color: 'var(--accent)' }}>
            🔲 Layer 2 — Ethernet Frame
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span style={{ color: 'var(--text-ter)' }}>Src MAC:</span>
              <div className="font-mono font-medium" style={{ color: 'var(--text)' }}>{step.frame.srcMac}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-ter)' }}>Dst MAC:</span>
              <div className="font-mono font-medium" style={{ color: 'var(--text)' }}>{step.frame.dstMac}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-ter)' }}>Type:</span>
              <div className="font-mono font-medium" style={{ color: 'var(--text)' }}>{step.frame.type}</div>
            </div>
          </div>
        </div>
      )}

      {/* Layer 3 Packet */}
      {step.packet && (
        <div className="p-3 rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--success)', background: 'var(--success-bg)' }}>
          <div className="text-[10px] font-semibold uppercase mb-1.5" style={{ color: 'var(--success)' }}>
            📦 Layer 3 — IPv4 Packet
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span style={{ color: 'var(--text-ter)' }}>Src IP:</span>
              <div className="font-mono font-medium" style={{ color: 'var(--text)' }}>{step.packet.srcIp}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-ter)' }}>Dst IP:</span>
              <div className="font-mono font-medium" style={{ color: 'var(--text)' }}>{step.packet.dstIp}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-ter)' }}>TTL:</span>
              <div className="font-mono font-medium" style={{ color: step.packet.ttl < 64 ? 'var(--warning)' : 'var(--text)' }}>
                {step.packet.ttl}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-ter)' }}>Protocol:</span>
              <div className="font-mono font-medium" style={{ color: 'var(--text)' }}>{step.packet.protocol}</div>
            </div>
          </div>
        </div>
      )}

      {/* Highlight indicators */}
      <div className="mt-3 flex gap-1.5 flex-wrap">
        {step.highlight === 'datalink' && <span className="ip-pill text-[11px]" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>📡 Layer 2 Active</span>}
        {step.highlight === 'network' && <span className="ip-pill text-[11px]" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🌐 Layer 3 Active</span>}
        {step.highlight === 'switch' && <span className="ip-pill text-[11px]" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>🔀 Switch: MAC-only forwarding</span>}
        {step.highlight === 'router-strip' && <span className="ip-pill text-[11px]" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>🗑️ Frame DESTROYED at router!</span>}
        {step.highlight === 'router-route' && <span className="ip-pill text-[11px]" style={{ background: 'var(--purple-bg)', color: 'var(--purple-fg)' }}>🧭 Routing table lookup + TTL−1</span>}
        {step.highlight === 'router-new-frame' && <span className="ip-pill text-[11px]" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>✨ Brand NEW frame created!</span>}
        {step.highlight === 'destination' && <span className="ip-pill text-[11px]" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🎉 Delivered!</span>}
      </div>
    </motion.div>
  );
}

/* ═══════════════ Animated Journey Timeline ══════════════════════════════ */
function PacketJourney() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = packetJourneySteps[currentStep];
  const totalSteps = packetJourneySteps.length;

  // Auto-play
  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    let s = currentStep;
    const interval = setInterval(() => {
      s++;
      if (s >= totalSteps) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      setCurrentStep(s);
    }, 3000);
    // store interval id for cleanup
    return () => clearInterval(interval);
  };

  const nodes = ['Host A', 'Switch S1', 'Router R1', 'Server B'];
  const nodePositions = [0, 1, 2, 3];
  const stepNodeMap = {
    'Host A': 0, 'Switch S1': 1, 'Router R1 (in)': 2,
    'Router R1': 2, 'Router R1 (out)': 2, 'Server B': 3,
  };
  const activeNodeIdx = stepNodeMap[step.node] ?? 0;

  return (
    <div>
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>
        🎬 Step-by-Step Packet Journey
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-sec)' }}>
        Watch how a packet travels from Host A → Switch → Router → Server, and see the Frame & IP headers change at each hop.
      </p>

      {/* Visual node path */}
      <div className="flex items-center justify-between mb-5 px-4">
        {nodes.map((node, i) => (
          <div key={node} className="flex items-center">
            <motion.div
              className="flex flex-col items-center"
              animate={{
                scale: activeNodeIdx === i ? 1.1 : 1,
                opacity: activeNodeIdx >= i ? 1 : 0.4,
              }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl border-2 transition-all"
                style={{
                  background: activeNodeIdx === i ? 'var(--accent-bg)' : 'var(--card)',
                  borderColor: activeNodeIdx === i ? 'var(--accent)' : 'var(--border-clr)',
                }}
                animate={activeNodeIdx === i ? { boxShadow: '0 0 15px rgba(35,131,226,0.3)' } : { boxShadow: 'none' }}
              >
                {i === 0 ? '💻' : i === 1 ? '🔀' : i === 2 ? '🔲' : '🖥️'}
              </motion.div>
              <span className="text-[11px] mt-1 font-medium" style={{ color: activeNodeIdx === i ? 'var(--accent)' : 'var(--text-ter)' }}>
                {node}
              </span>
            </motion.div>
            {i < 3 && (
              <div className="flex-1 mx-2 relative">
                <div className="h-0.5 w-full" style={{ background: 'var(--border-clr)' }} />
                {activeNodeIdx > i && (
                  <motion.div
                    className="absolute top-0 left-0 h-0.5"
                    style={{ background: 'var(--accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-4">
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
          <ChevronLeft size={14} /> Prev
        </button>
        <button className="btn btn-primary btn-sm" onClick={handlePlay}>
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'Pause' : 'Auto-Play'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))} disabled={currentStep === totalSteps - 1}>
          Next <ChevronRight size={14} />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => { setCurrentStep(0); setIsPlaying(false); }}>
          <RotateCcw size={14} /> Reset
        </button>
        <span className="ml-auto text-xs font-mono" style={{ color: 'var(--text-ter)' }}>
          Step {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Step progress bar */}
      <div className="flex gap-1 mb-4">
        {packetJourneySteps.map((_, i) => (
          <motion.button
            key={i}
            className="flex-1 h-1.5 rounded-full cursor-pointer transition-all"
            style={{ background: i <= currentStep ? 'var(--accent)' : 'var(--border-clr)' }}
            onClick={() => setCurrentStep(i)}
            whileHover={{ scaleY: 2 }}
          />
        ))}
      </div>

      {/* X-Ray Card */}
      <AnimatePresence mode="wait">
        <XRayCard step={step} key={step.id} />
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════ MAIN EXPORT ════════════════════════════════════════════ */
export default function PacketXRay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🔬</span>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Packet X-Ray Lab</h2>
          <p className="text-sm" style={{ color: 'var(--text-sec)' }}>
            Interactive OSI & TCP/IP comparator and animated frame/packet journey
          </p>
        </div>
      </div>

      <LayerComparator />

      <div className="my-6 h-px" style={{ background: 'var(--border-clr)' }} />

      <PacketJourney />
    </motion.div>
  );
}

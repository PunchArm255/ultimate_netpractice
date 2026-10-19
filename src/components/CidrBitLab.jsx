import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Terminal } from 'lucide-react';
import {
  cidrToMask, cidrToMaskInt, intToIp, subnetCalc, ipToBinaryOctets
} from '../engine/ipEngine';
import { subnetReferenceTable, powerOfTwoChart, bcCheatSheet } from '../data/theoryData';

/* ═══════════════ 32-Bit Binary Toggle & CIDR Slider ════════════════════ */
function BitToggleVisualizer() {
  const [cidr, setCidr] = useState(24);
  const [ip, setIp] = useState('192.168.1.100');

  const maskInt = useMemo(() => cidrToMaskInt(cidr), [cidr]);
  const mask = useMemo(() => cidrToMask(cidr), [cidr]);
  const calc = useMemo(() => subnetCalc(ip, cidr), [ip, cidr]);
  const maskBits = useMemo(() => {
    if (maskInt === null) return [];
    const bits = [];
    for (let i = 31; i >= 0; i--) {
      bits.push((maskInt >>> i) & 1);
    }
    return bits;
  }, [maskInt]);

  const ipBits = useMemo(() => {
    const octets = ipToBinaryOctets(ip);
    if (!octets) return [];
    return octets.join('').split('').map(Number);
  }, [ip]);

  const magicOctet = useMemo(() => {
    if (!mask) return null;
    const octets = mask.split('.').map(Number);
    if (cidr <= 8) return { index: 0, value: octets[0] };
    if (cidr <= 16) return { index: 1, value: octets[1] };
    if (cidr <= 24) return { index: 2, value: octets[2] };
    return { index: 3, value: octets[3] };
  }, [mask, cidr]);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <Sliders size={20} />
        Interactive 32-Bit Binary Toggle
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-sec)' }}>
        Slide the CIDR or click bits to see how the subnet mask changes. Blue = Network bits (locked street), Gray = Host bits (device pool).
      </p>

      {/* IP input */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium" style={{ color: 'var(--text-sec)' }}>IP Address:</label>
        <input
          className="np-input"
          style={{ width: 180 }}
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          spellCheck={false}
        />
        <label className="text-sm font-medium" style={{ color: 'var(--text-sec)' }}>CIDR:</label>
        <input
          type="range"
          min={8} max={30}
          value={cidr}
          onChange={(e) => setCidr(Number(e.target.value))}
          className="flex-1 accent-[var(--accent)]"
        />
        <span className="font-mono font-bold text-lg" style={{ color: 'var(--accent)' }}>/{cidr}</span>
      </div>

      {/* 32-bit grid */}
      <div className="mb-4">
        <div className="flex items-center gap-0.5 mb-1">
          {maskBits.map((bit, i) => {
            const isNetwork = i < cidr;
            const octetBoundary = i > 0 && i % 8 === 0;
            return (
              <div key={i} className="flex items-center">
                {octetBoundary && <div className="w-2" />}
                <motion.div
                  className={`bit-cell ${isNetwork ? 'network' : 'host'}`}
                  onClick={() => setCidr(i + 1)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    background: isNetwork ? 'var(--accent-bg)' : 'var(--card)',
                    borderColor: isNetwork ? 'var(--accent)' : 'var(--border-clr)',
                    color: isNetwork ? 'var(--accent)' : 'var(--text-ter)',
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {bit}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Labels */}
        <div className="flex items-center gap-0.5">
          {maskBits.map((_, i) => {
            const octetBoundary = i > 0 && i % 8 === 0;
            return (
              <div key={i} className="flex items-center">
                {octetBoundary && <div className="w-2" />}
                <div className="w-[34px] text-center text-[9px] font-mono" style={{ color: 'var(--text-ter)' }}>
                  {i === cidr - 1 ? '↑' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* IP bits below */}
        {ipBits.length === 32 && (
          <div className="mt-2">
            <span className="text-[10px] font-semibold uppercase mb-1 block" style={{ color: 'var(--text-ter)' }}>
              IP in Binary
            </span>
            <div className="flex items-center gap-0.5">
              {ipBits.map((bit, i) => {
                const isNetwork = i < cidr;
                const octetBoundary = i > 0 && i % 8 === 0;
                return (
                  <div key={i} className="flex items-center">
                    {octetBoundary && <div className="w-2" />}
                    <div
                      className="w-[34px] h-7 flex items-center justify-center font-mono text-xs font-medium rounded"
                      style={{
                        background: isNetwork ? 'var(--success-bg)' : 'var(--warning-bg)',
                        color: isNetwork ? 'var(--success)' : 'var(--warning)',
                      }}
                    >
                      {bit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <InfoCard label="Subnet Mask" value={mask} />
        <InfoCard label="Magic Number" value={magicOctet ? `256 − ${magicOctet.value} = ${256 - magicOctet.value}` : '—'} />
        <InfoCard label="Network" value={calc?.networkIp || '—'} />
        <InfoCard label="Broadcast" value={calc?.broadcastIp || '—'} />
        <InfoCard label="First Usable" value={calc?.firstUsable || '—'} />
        <InfoCard label="Last Usable" value={calc?.lastUsable || '—'} />
        <InfoCard label="Total IPs" value={calc?.totalIps?.toLocaleString() || '—'} />
        <InfoCard label="Usable Hosts" value={calc?.usableHosts?.toLocaleString() || '—'} />
      </div>

      {/* Power of 2 chart */}
      <div className="p-3 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border-clr)' }}>
        <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-ter)' }}>
          Power-of-2 Octet Chart
        </span>
        <div className="flex gap-1 mt-1.5">
          {powerOfTwoChart.map((p) => (
            <div key={p.bit} className="text-center flex-1">
              <div className="text-[10px] font-mono" style={{ color: 'var(--text-ter)' }}>2^{p.bit}</div>
              <div className="font-mono font-bold text-sm" style={{ color: 'var(--accent)' }}>{p.value}</div>
            </div>
          ))}
        </div>
        <div className="text-[11px] mt-2" style={{ color: 'var(--text-sec)' }}>
          Summing leftmost bits: 128, 192, 224, 240, 248, 252, 254, 255
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Info Card Helper ═══════════════════════════════════════ */
function InfoCard({ label, value }) {
  return (
    <div className="p-2.5 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border-clr)' }}>
      <div className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-ter)' }}>{label}</div>
      <div className="font-mono text-sm font-medium mt-0.5" style={{ color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

/* ═══════════════ Subnet Reference Table ════════════════════════════════ */
function SubnetTable() {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>📊 Subnet Reference Table</h3>
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border-clr)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--border-clr)' }}>
              <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--text)' }}>CIDR</th>
              <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--text)' }}>Mask</th>
              <th className="px-3 py-2 text-right font-semibold" style={{ color: 'var(--text)' }}>Total IPs</th>
              <th className="px-3 py-2 text-right font-semibold" style={{ color: 'var(--text)' }}>Usable</th>
              <th className="px-3 py-2 text-right font-semibold" style={{ color: 'var(--text)' }}>Block</th>
            </tr>
          </thead>
          <tbody>
            {subnetReferenceTable.map((row) => (
              <tr key={row.cidr} className="border-t" style={{ borderColor: 'var(--border-clr)' }}>
                <td className="px-3 py-1.5 font-mono font-medium" style={{ color: 'var(--accent)' }}>/{row.cidr}</td>
                <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--text)' }}>{row.mask}</td>
                <td className="px-3 py-1.5 text-right font-mono text-xs" style={{ color: 'var(--text-sec)' }}>{row.hosts.toLocaleString()}</td>
                <td className="px-3 py-1.5 text-right font-mono text-xs font-medium" style={{ color: 'var(--success)' }}>{row.usable.toLocaleString()}</td>
                <td className="px-3 py-1.5 text-right font-mono text-xs" style={{ color: 'var(--warning)' }}>{row.block}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════ Linux `bc` Terminal Simulator ═════════════════════════ */
function BcTerminal() {
  const [history, setHistory] = useState([
    { type: 'output', text: 'bc 1.07.1 — Welcome to the NetPractice bc calculator!' },
    { type: 'output', text: 'Type math expressions. Special: obase=2; N (decimal→binary), ibase=2; N (binary→decimal)' },
  ]);
  const [input, setInput] = useState('');
  const [ibase, setIbase] = useState(10);
  const [obase, setObase] = useState(10);

  const evaluate = useCallback((expr) => {
    const trimmed = expr.trim();
    if (!trimmed) return;

    const newHistory = [...history, { type: 'input', text: trimmed }];

    try {
      // Handle ibase/obase
      if (trimmed.match(/^obase\s*=\s*(\d+)/i)) {
        const base = parseInt(trimmed.match(/^obase\s*=\s*(\d+)/i)[1], 10);
        setObase(base);
        newHistory.push({ type: 'output', text: `(output base set to ${base})` });
      } else if (trimmed.match(/^ibase\s*=\s*(\d+)/i)) {
        const base = parseInt(trimmed.match(/^ibase\s*=\s*(\d+)/i)[1], 10);
        setIbase(base);
        newHistory.push({ type: 'output', text: `(input base set to ${base})` });
      } else {
        // Parse expression
        let expression = trimmed;
        // Replace ^ with **
        expression = expression.replace(/\^/g, '**');

        // Parse number with current ibase
        let result;
        if (ibase !== 10) {
          // Simple: try to parse the number in ibase
          const num = parseInt(expression, ibase);
          if (isNaN(num)) {
            throw new Error('Invalid expression');
          }
          result = num;
        } else {
          // Evaluate as JS math
          // Simple safe eval for basic math only
          if (/^[\d\s+\-*/().%*]+$/.test(expression)) {
            result = Function('"use strict"; return (' + expression + ')')();
          } else {
            throw new Error('Invalid characters');
          }
        }

        // Format output with obase
        let output;
        if (obase === 2) {
          output = (result >>> 0).toString(2);
        } else if (obase === 16) {
          output = result.toString(16).toUpperCase();
        } else {
          output = result.toString(obase);
        }

        newHistory.push({ type: 'output', text: output });
      }
    } catch (err) {
      newHistory.push({ type: 'output', text: `(standard_in) error: ${err.message || 'parse error'}` });
    }

    setHistory(newHistory);
    setInput('');
  }, [history, ibase, obase]);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <Terminal size={20} />
        Linux `bc` Calculator Simulator
      </h3>
      <p className="text-sm mb-3" style={{ color: 'var(--text-sec)' }}>
        <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--border-clr)' }}>bc</code> is the ONLY calculator allowed during the 42 NetPractice defense. Practice here!
      </p>

      <div className="bc-terminal max-h-64 overflow-y-auto">
        {history.map((line, i) => (
          <div key={i} className="mb-0.5">
            {line.type === 'input' ? (
              <span><span className="prompt">bc&gt; </span>{line.text}</span>
            ) : (
              <span style={{ color: '#aaa' }}>{line.text}</span>
            )}
          </div>
        ))}
        <div className="flex items-center">
          <span className="prompt">bc&gt; </span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') evaluate(input);
            }}
            autoFocus
            placeholder="Type expression..."
          />
        </div>
      </div>

      {/* Cheat sheet */}
      <div className="mt-3 p-3 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border-clr)' }}>
        <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-ter)' }}>
          bc Cheat Sheet — Click to try!
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2">
          {bcCheatSheet.map((item, i) => (
            <motion.button
              key={i}
              className="flex items-center gap-2 text-left px-2 py-1.5 rounded text-xs transition-colors"
              style={{ color: 'var(--text-sec)' }}
              onClick={() => {
                setInput(item.command);
                evaluate(item.command);
              }}
              whileHover={{ background: 'var(--border-clr)' }}
            >
              <code className="font-mono px-1.5 py-0.5 rounded text-[11px]"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                {item.command}
              </code>
              <span>→ {item.result}</span>
              <span style={{ color: 'var(--text-ter)' }}>({item.description})</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN EXPORT ════════════════════════════════════════════ */
export default function CidrBitLab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🧮</span>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>CIDR Bit Lab</h2>
          <p className="text-sm" style={{ color: 'var(--text-sec)' }}>
            Interactive binary visualizer, subnet calculator, and bc terminal simulator
          </p>
        </div>
      </div>

      <BitToggleVisualizer />

      <div className="my-6 h-px" style={{ background: 'var(--border-clr)' }} />

      <SubnetTable />

      <div className="my-6 h-px" style={{ background: 'var(--border-clr)' }} />

      <BcTerminal />
    </motion.div>
  );
}

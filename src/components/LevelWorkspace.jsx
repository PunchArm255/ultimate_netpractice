import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, RotateCcw, Eye, Lightbulb, AlertTriangle,
  CheckCircle2, XCircle, ChevronDown, ChevronRight, Sparkles, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  subnetCalc, validateLevel, maskToCidr, isValidIp, cidrToMask
} from '../engine/ipEngine';
import Markdown from './Markdown';

/* ═══════════════ Notion-style Collapsible Toggle Block ═══════════════════ */
function ToggleBlock({ icon, title, children, defaultOpen = false, variant = 'info' }) {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    info: { bg: 'var(--accent-bg)', border: 'var(--accent)' },
    success: { bg: 'var(--success-bg)', border: 'var(--success)' },
    warning: { bg: 'var(--warning-bg)', border: 'var(--warning)' },
    danger: { bg: 'var(--danger-bg)', border: 'var(--danger)' },
  };
  const colors = colorMap[variant] || colorMap.info;

  return (
    <div className="notion-toggle" style={{ borderColor: colors.border }}>
      <div
        className="notion-toggle-header"
        style={{ background: open ? colors.bg : 'transparent' }}
        onClick={() => setOpen(!open)}
      >
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight size={14} />
        </motion.span>
        <span className="text-base">{icon}</span>
        <span>{title}</span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="notion-toggle-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════ Live Subnet Helper Badge ════════════════════════════════ */
function SubnetBadge({ ip, mask }) {
  const cidr = useMemo(() => {
    if (!mask) return null;
    if (mask.includes('.')) return maskToCidr(mask);
    const n = parseInt(mask, 10);
    return isNaN(n) ? null : n;
  }, [mask]);

  const calc = useMemo(() => {
    if (!ip || !isValidIp(ip) || cidr === null) return null;
    return subnetCalc(ip, cidr);
  }, [ip, cidr]);

  if (!calc) return null;

  return (
    <motion.div
      className="mt-1.5 grid grid-cols-2 gap-1 text-[10px]"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span
        className="ip-pill truncate px-1.5 py-0.5 text-center font-mono"
        title={`Network Address: ${calc.networkIp}`}
        style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
      >
        Net: {calc.networkIp}
      </span>
      <span
        className="ip-pill truncate px-1.5 py-0.5 text-center font-mono"
        title={`Broadcast Address: ${calc.broadcastIp}`}
        style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}
      >
        Bcast: {calc.broadcastIp}
      </span>
      <span
        className="ip-pill truncate px-1.5 py-0.5 text-center font-mono"
        title={`Usable Host Range: ${calc.firstUsable} – ${calc.lastUsable}`}
      >
        {calc.firstUsable.split('.').slice(2).join('.')}–{calc.lastUsable.split('.').slice(2).join('.')}
      </span>
      <span
        className="ip-pill truncate px-1.5 py-0.5 text-center font-mono"
        title={`Block size: ${calc.magicNumber} | Usable Hosts: ${calc.usableHosts}`}
        style={{ background: 'var(--purple-bg)', color: 'var(--purple-fg)' }}
      >
        /{cidr} • {calc.usableHosts}h
      </span>
    </motion.div>
  );
}

/* ═══════════════ Interface Card (Pink) ═══════════════════════════════════ */
function InterfaceCard({ field, value, onChange, error, disabled }) {
  const isIp = field.id.includes('_ip') || field.id.includes('_gw');
  return (
    <div className="mb-2">
      <label className="text-xs font-medium mb-0.5 block" style={{ color: 'var(--text-sec)' }}>
        {field.label}
      </label>
      <motion.input
        className={`np-input ${error ? 'error' : value && !error ? 'success' : ''}`}
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.placeholder || ''}
        disabled={disabled || !field.editable}
        animate={error ? { x: [0, -4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        spellCheck={false}
      />
    </div>
  );
}

/* ═══════════════ Node Card on Topology Canvas ═══════════════════════════ */
function NodeCard({ node, fields, answers, onFieldChange, errors, packetAt }) {
  const nodeFields = fields.filter((f) =>
    node.interfaces?.some((i) => i.ipField === f.id || i.maskField === f.id) ||
    f.id.startsWith(node.id + '_')
  );

  // Also grab route/gateway fields
  const gwField = fields.find((f) => f.id === node.id + '_gw' || f.id === node.id.charAt(0) + '_gw');
  if (gwField && !nodeFields.find(nf => nf.id === gwField.id)) {
    nodeFields.push(gwField);
  }

  const typeClass = node.type === 'router' ? 'router' : node.type === 'switch' ? 'switch' : 'host';
  const isPacketHere = packetAt === node.id;

  return (
    <motion.div
      className={`node-card ${typeClass}`}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        zIndex: isPacketHere ? 20 : 10,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: isPacketHere
          ? '0 0 20px rgba(35,131,226,0.4), 0 0 40px rgba(35,131,226,0.15)'
          : 'var(--shadow-sm)',
      }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      layout
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{node.icon}</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{node.label}</span>
        {node.type === 'switch' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            L2 Only
          </span>
        )}
      </div>

      {node.type !== 'switch' && (
        <div className="space-y-0.5">
          {nodeFields.map((field) => {
            const val = field.editable
              ? (answers[field.id] !== undefined ? answers[field.id] : '')
              : field.value;
            const err = errors.find((e) => e.fieldId === field.id);
            const isIpField = field.id.includes('_ip');
            const maskField = fields.find(
              (f) => f.id === field.id.replace('_ip', '_mask').replace('_gw', '_mask')
            );
            const maskVal = maskField
              ? (maskField.editable ? (answers[maskField.id] || '') : maskField.value)
              : null;

            return (
              <div key={field.id}>
                <InterfaceCard
                  field={field}
                  value={val}
                  onChange={onFieldChange}
                  error={err}
                  disabled={!field.editable}
                />
                {isIpField && val && maskVal && (
                  <SubnetBadge ip={val} mask={maskVal} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {isPacketHere && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm"
          style={{ background: 'var(--accent)', color: '#fff' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          📦
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════ SVG Links Between Nodes ════════════════════════════════ */
function TopologyLinks({ nodes, links, fields, answers, packetPath, packetStep }) {
  const getNodeCenter = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const w = node.type === 'router' ? 270 : node.type === 'switch' ? 160 : 250;
    const ifaceCount = node.interfaces?.length || 1;
    const h = node.type === 'switch' ? 50 : 70 + ifaceCount * 65;
    return {
      x: node.x + w / 2,
      y: node.y + Math.min(h / 2, 85),
    };
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {links.map((link, i) => {
        const p1 = getNodeCenter(link.iface1.nodeId);
        const p2 = getNodeCenter(link.iface2.nodeId);
        if (!p1 || !p2) return null;

        const isActive = packetPath?.some((p, idx) => {
          if (idx >= packetPath.length - 1) return false;
          const curr = packetPath[idx].node;
          const next = packetPath[idx + 1].node;
          return (
            (curr === link.iface1.nodeId && next === link.iface2.nodeId) ||
            (curr === link.iface2.nodeId && next === link.iface1.nodeId)
          );
        });

        return (
          <g key={i}>
            <line
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={isActive ? 'var(--accent)' : 'var(--border-clr)'}
              strokeWidth={isActive ? 3 : 2}
              strokeDasharray={isActive ? '' : '6 3'}
            />
            {isActive && (
              <motion.circle
                r={5}
                fill="var(--accent)"
                initial={{ cx: p1.x, cy: p1.y }}
                animate={{ cx: p2.x, cy: p2.y }}
                transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════ Route Table Cards (Green) ═══════════════════════════════ */
function RouteCards({ routes, fields, answers, onFieldChange, errors }) {
  const routesByNode = {};
  for (const route of routes) {
    if (!routesByNode[route.nodeId]) routesByNode[route.nodeId] = [];
    routesByNode[route.nodeId].push(route);
  }

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {Object.entries(routesByNode).map(([nodeId, nodeRoutes]) => (
        <div key={nodeId} className="route-card">
          <div className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--green-fg)' }}>
            <ArrowRight size={13} />
            {nodeRoutes[0].deviceName} Routing Table
          </div>
          {nodeRoutes.map((route) => {
            const field = fields.find((f) => f.id === route.nextHopField);
            if (!field) return null;
            const val = field.editable ? (answers[field.id] || '') : field.value;
            const err = errors.find((e) => e.fieldId === route.nextHopField);
            return (
              <div key={route.nextHopField} className="mb-2">
                <div className="text-[11px] mb-0.5" style={{ color: 'var(--text-sec)' }}>
                  {route.label} → Next Hop:
                </div>
                <InterfaceCard
                  field={field}
                  value={val}
                  onChange={onFieldChange}
                  error={err}
                  disabled={!field.editable}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════ Error Tutor Panel ═══════════════════════════════════════ */
function ErrorTutor({ errors }) {
  if (errors.length === 0) return null;
  return (
    <motion.div
      className="mt-4 space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--danger)' }}>
        <AlertTriangle size={16} />
        {errors.length} Error{errors.length > 1 ? 's' : ''} Found — Read the explanations!
      </div>
      {errors.map((err, i) => (
        <motion.div
          key={i}
          className="callout callout-danger"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="font-semibold text-sm mb-1" style={{ color: 'var(--danger)' }}>
            ❌ {err.errorTitle}
          </div>
          <div className="text-sm mb-1.5" style={{ color: 'var(--text)' }}>
            <span className="font-semibold mr-1.5" style={{ color: 'var(--danger)' }}>Why:</span>
            <Markdown content={err.theoryWhy} className="inline" />
          </div>
          <div className="text-sm" style={{ color: 'var(--success)' }}>
            <span className="font-semibold mr-1.5" style={{ color: 'var(--success)' }}>Fix:</span>
            <Markdown content={err.howToFix} className="inline" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ═══════════════ MAIN LEVEL WORKSPACE ═══════════════════════════════════ */
export default function LevelWorkspace({ level, answers, setAnswers, onComplete, isCompleted }) {
  const [showSolution, setShowSolution] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [packetPath, setPacketPath] = useState(null);
  const [packetStep, setPacketStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const onFieldChange = useCallback((fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setValidationResult(null);
  }, [setAnswers]);

  // Validate
  const handleValidate = useCallback(() => {
    const result = validateLevel(level, answers);
    setValidationResult(result);

    if (result.valid) {
      onComplete(level.id);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2383E2', '#0F7B6C', '#D9730D', '#C14C8A', '#6940A5'],
      });
    }
  }, [level, answers, onComplete]);

  // Show solution
  const handleShowSolution = useCallback(() => {
    setShowSolution(true);
    setAnswers((prev) => ({ ...prev, ...level.solution }));
    setValidationResult(null);
  }, [level, setAnswers]);

  // Reset
  const handleReset = useCallback(() => {
    setAnswers({});
    setValidationResult(null);
    setShowSolution(false);
    setHintIndex(-1);
    setPacketPath(null);
  }, [setAnswers]);

  // Simulate packet
  const handleSimulate = useCallback(() => {
    setIsAnimating(true);
    setPacketStep(0);

    // Build a simple path through nodes
    const nodeOrder = level.nodes.map(n => n.id);
    const srcIdx = nodeOrder.indexOf(level.packetTest.src);
    const dstIdx = nodeOrder.indexOf(level.packetTest.dst);

    const path = [];
    const validation = validateLevel(level, answers);

    if (validation.valid) {
      // All good — animate through all nodes
      const allNodes = level.nodes;
      // Simple: go through nodes in link order
      const visited = new Set();
      const queue = [level.packetTest.src];
      while (queue.length > 0) {
        const curr = queue.shift();
        if (visited.has(curr)) continue;
        visited.add(curr);
        path.push({ node: curr, status: 'ok' });
        if (curr === level.packetTest.dst) break;

        for (const link of level.links) {
          let next = null;
          if (link.iface1.nodeId === curr) next = link.iface2.nodeId;
          if (link.iface2.nodeId === curr) next = link.iface1.nodeId;
          if (next && !visited.has(next)) queue.push(next);
        }
      }
    } else {
      // Show path until failure
      path.push({ node: level.packetTest.src, status: 'ok' });
      const failNode = level.nodes.find(n =>
        validation.errors.some(e => e.fieldId && e.fieldId.startsWith(n.id.charAt(0)))
      );
      if (failNode && failNode.id !== level.packetTest.src) {
        path.push({ node: failNode.id, status: 'fail', reason: validation.errors[0]?.errorTitle });
      } else if (validation.errors.length > 0) {
        path.push({ node: level.packetTest.src, status: 'fail', reason: validation.errors[0]?.errorTitle });
      }
    }

    setPacketPath(path);

    // Animate through steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= path.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }
      setPacketStep(step);
    }, 1000);
  }, [level, answers]);

  const { canvasWidth, canvasHeight } = useMemo(() => {
    let maxX = 720;
    let maxY = 360;
    for (const node of level.nodes) {
      const nodeW = node.type === 'router' ? 270 : node.type === 'switch' ? 160 : 250;
      const ifaceCount = node.interfaces?.length || 1;
      const nodeH = node.type === 'switch' ? 90 : 160 + ifaceCount * 75;
      if (node.x + nodeW > maxX) maxX = node.x + nodeW;
      if (node.y + nodeH > maxY) maxY = node.y + nodeH;
    }
    return {
      canvasWidth: maxX + 50,
      canvasHeight: maxY + 50,
    };
  }, [level.nodes]);

  const currentPacketNode = packetPath && packetStep < packetPath.length
    ? packetPath[packetStep]?.node
    : null;

  const errors = validationResult?.errors || [];
  const errorFieldIds = new Set(errors.map((e) => e.fieldId).filter(Boolean));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Level Header */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{level.emoji}</span>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Level {level.id}: {level.title}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-sec)' }}>{level.subtitle}</p>
          </div>
          {isCompleted && (
            <motion.span
              className="ml-auto flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full"
              style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <CheckCircle2 size={15} /> Completed
            </motion.span>
          )}
        </div>

        {/* Difficulty */}
        <div className="flex gap-1 mt-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="w-5 h-1.5 rounded-full"
                 style={{ background: i < level.difficulty ? 'var(--accent)' : 'var(--border-clr)' }} />
          ))}
          <span className="text-[11px] ml-1.5" style={{ color: 'var(--text-ter)' }}>
            Difficulty
          </span>
        </div>
      </div>

      {/* Theory Briefing */}
      <ToggleBlock
        icon={level.theoryBriefing.icon}
        title={level.theoryBriefing.title}
        defaultOpen={!isCompleted}
        variant="info"
      >
        <Markdown content={level.theoryBriefing.body} />
      </ToggleBlock>

      {/* Topology Canvas */}
      <div className="topology-canvas-wrapper mt-4">
        <div
          className="topology-canvas p-4"
          style={{
            width: '100%',
            minWidth: canvasWidth,
            height: canvasHeight,
            minHeight: canvasHeight,
          }}
        >
          <TopologyLinks
            nodes={level.nodes}
            links={level.links}
            fields={level.fields}
            answers={answers}
            packetPath={packetPath}
            packetStep={packetStep}
          />
          {level.nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              fields={level.fields}
              answers={answers}
              onFieldChange={onFieldChange}
              errors={errors.filter((e) => {
                if (!e.fieldId) return false;
                return e.fieldId.startsWith(node.id.charAt(0)) ||
                       node.interfaces?.some(i => e.fieldId === i.ipField || e.fieldId === i.maskField);
              })}
              packetAt={currentPacketNode}
            />
          ))}
        </div>
      </div>

      {/* Route Tables */}
      {level.routes.length > 0 && (
        <RouteCards
          routes={level.routes}
          fields={level.fields}
          answers={answers}
          onFieldChange={onFieldChange}
          errors={errors}
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-5">
        <motion.button
          className="btn btn-primary"
          onClick={handleValidate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <CheckCircle2 size={15} /> Check My Config
        </motion.button>

        <motion.button
          className="btn btn-ghost"
          onClick={handleSimulate}
          disabled={isAnimating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Play size={15} /> Simulate Packet
        </motion.button>

        <motion.button
          className="btn btn-ghost"
          onClick={() => setHintIndex(Math.min(hintIndex + 1, level.hints.length - 1))}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Lightbulb size={15} />
          Hint {hintIndex + 2 <= level.hints.length ? `(${hintIndex + 2}/${level.hints.length})` : '(done)'}
        </motion.button>

        <motion.button
          className="btn btn-ghost"
          onClick={handleShowSolution}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Eye size={15} /> Show Fix & Explain Math
        </motion.button>

        <motion.button
          className="btn btn-ghost"
          onClick={handleReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={15} /> Reset
        </motion.button>
      </div>

      {/* Hints */}
      <AnimatePresence>
        {hintIndex >= 0 && (
          <motion.div
            className="mt-3 space-y-1.5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {level.hints.slice(0, hintIndex + 1).map((hint, i) => (
              <motion.div
                key={i}
                className="callout callout-warning text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-start gap-1.5">
                  <span className="shrink-0 mt-0.5">💡</span>
                  <div className="flex-1">
                    <strong className="mr-1">Hint {i + 1}:</strong>
                    <Markdown content={hint} className="inline" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Result */}
      {validationResult && validationResult.valid && (
        <motion.div
          className="callout callout-success mt-4 flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Sparkles size={18} style={{ color: 'var(--success)' }} />
          <span className="font-semibold">🎉 Perfect! All interfaces and routes are valid!</span>
        </motion.div>
      )}

      {/* Error Tutor */}
      <ErrorTutor errors={errors} />

      {/* Solution Explanation */}
      <AnimatePresence>
        {showSolution && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <ToggleBlock icon="📝" title="Step-by-Step Solution" defaultOpen={true} variant="success">
              <Markdown content={level.solutionExplanation} className="text-sm" />
            </ToggleBlock>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Packet simulation failure message */}
      <AnimatePresence>
        {packetPath && !isAnimating && packetPath.some(p => p.status === 'fail') && (
          <motion.div
            className="callout callout-danger mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <XCircle size={16} className="inline mr-1.5" style={{ color: 'var(--danger)' }} />
            <strong>Packet dropped!</strong>{' '}
            {packetPath.find(p => p.status === 'fail')?.reason || 'A routing or subnet error prevented delivery.'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

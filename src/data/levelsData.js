/* ─────────────────────────────────────────────────────────────────────────────
 *  levelsData.js – All 10 progressive training levels for Ultimate NetPractice
 *
 *  Each level has:
 *  - id, title, subtitle, difficulty, theoryBriefing
 *  - nodes: hosts, routers, switches with positions
 *  - fields: every editable/fixed input field in the topology
 *  - interfaces: list of interface descriptors for validation
 *  - links: which interfaces are on the same wire/switch
 *  - routers: grouped router interfaces for overlap check
 *  - routes: routing table entries with next-hop validation
 *  - packetTest: { src, dst } to simulate packet traversal
 *  - solution: { [fieldId]: value } complete valid answers
 *  - solutionExplanation: step-by-step math breakdown
 *  - hints: array of progressive hints
 * ───────────────────────────────────────────────────────────────────────────── */

const levels = [
  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 1 — The Direct Cable (/24 Basics)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 1,
    title: 'The Direct Cable',
    subtitle: '/24 Basics — Two Hosts, One Wire',
    difficulty: 1,
    emoji: '🔌',
    theoryBriefing: {
      icon: '💡',
      title: 'What is a Subnet?',
      body: `Imagine a **street** in a neighborhood. Every house (host) on that street shares the same **street name** (Network Address) but has a unique **house number** (Host portion).

With a **/24 mask** (255.255.255.0), the first 3 octets are the street name and the last octet (0–255) is for houses. But two addresses are reserved:
- **.0** = the street name itself (Network Address) — no one lives here
- **.255** = the megaphone that shouts to ALL houses (Broadcast Address)

So you have **254 usable addresses** (.1 through .254). Both hosts on the same cable MUST share the same first 3 octets and use the same mask.`,
    },
    nodes: [
      { id: 'A', label: 'Host A', type: 'host', x: 80, y: 40, icon: '💻',
        interfaces: [{ id: 'A1', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' }] },
      { id: 'B', label: 'Host B', type: 'host', x: 480, y: 40, icon: '💻',
        interfaces: [{ id: 'B1', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' }] },
    ],
    fields: [
      { id: 'A1_ip',   label: 'A1 IP',   editable: true,  value: '', placeholder: '104.96.23.??' },
      { id: 'A1_mask', label: 'A1 Mask', editable: false, value: '255.255.255.0' },
      { id: 'B1_ip',   label: 'B1 IP',   editable: true,  value: '', placeholder: '104.96.23.??' },
      { id: 'B1_mask', label: 'B1 Mask', editable: false, value: '255.255.255.0' },
    ],
    interfaces: [
      { label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
      { label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
    ],
    links: [
      {
        iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
      },
    ],
    routers: [],
    routes: [],
    packetTest: { src: 'A', dst: 'B' },
    solution: { A1_ip: '104.96.23.1', B1_ip: '104.96.23.2' },
    solutionExplanation: `**Step 1:** Mask is /24 (255.255.255.0), so the network is **104.96.23.0**.
**Step 2:** Usable range: 104.96.23.**1** – 104.96.23.**254**.
**Step 3:** Pick any two unique IPs in that range, e.g., .1 and .2.
**Step 4:** Avoid .0 (Network) and .255 (Broadcast).`,
    hints: [
      'Both hosts must be on the same /24 network: 104.96.23.x',
      'Avoid .0 (network address) and .255 (broadcast address)',
      'Any two different IPs from .1 to .254 will work!',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 2 — Custom Subnet Mask (/26 Magic Number)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 2,
    title: 'The Custom Subnet Mask',
    subtitle: '/26 Magic Number — 64-IP Blocks',
    difficulty: 2,
    emoji: '🔢',
    theoryBriefing: {
      icon: '🧮',
      title: 'The Magic Number Trick',
      body: `When the mask isn't /24, we use the **Magic Number** (also called Block Size):

**Magic Number = 256 − interesting mask octet**

For /26 → mask = 255.255.255.**192** → Magic = 256 − 192 = **64**

This means the last octet is chopped into blocks of 64:
- Block 1: **.0** – .63 (Network .0, Broadcast .63, Usable .1–.62)
- Block 2: **.64** – .127 (Network .64, Broadcast .127, Usable .65–.126)
- Block 3: **.128** – .191
- Block 4: **.192** – .255

⚠️ Common trap: .64, .128, .192 are Network Addresses! They look normal but are reserved!`,
    },
    nodes: [
      { id: 'A', label: 'Host A', type: 'host', x: 80, y: 40, icon: '💻',
        interfaces: [{ id: 'A1', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' }] },
      { id: 'B', label: 'Host B', type: 'host', x: 480, y: 40, icon: '💻',
        interfaces: [{ id: 'B1', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' }] },
    ],
    fields: [
      { id: 'A1_ip',   label: 'A1 IP',   editable: false, value: '192.168.1.222' },
      { id: 'A1_mask', label: 'A1 Mask', editable: false, value: '255.255.255.192' },
      { id: 'B1_ip',   label: 'B1 IP',   editable: true,  value: '', placeholder: '192.168.1.??' },
      { id: 'B1_mask', label: 'B1 Mask', editable: false, value: '255.255.255.192' },
    ],
    interfaces: [
      { label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
      { label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
    ],
    links: [
      {
        iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
      },
    ],
    routers: [],
    routes: [],
    packetTest: { src: 'A', dst: 'B' },
    solution: { B1_ip: '192.168.1.193' },
    solutionExplanation: `**Step 1:** Mask = /26 → 255.255.255.192 → Magic Number = 256 − 192 = **64**
**Step 2:** Host A is at .222. Which block? 192 ÷ 64 = 3 → Block starts at .192
**Step 3:** Block 4: .192 – .255 → Network = .192, Broadcast = .255
**Step 4:** Usable range: **.193 – .254**
**Step 5:** ⚠️ .192 is the Network Address, .255 is Broadcast — BOTH reserved!
**Answer:** Any IP from .193 to .254 (except .222 which A already uses).`,
    hints: [
      'Host A (.222) uses mask /26 → Magic = 256 − 192 = 64',
      '.222 is in the block 192–255 (starts at 192, since 3×64=192)',
      'Network = .192, Broadcast = .255. Usable: .193 to .254',
      'Pick any IP between .193 and .254 that isn\'t .222',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 3 — The Layer 2 Switch Neighborhood (/28)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 3,
    title: 'The Switch Neighborhood',
    subtitle: '/28 — Layer 2 Switch with 3 Hosts',
    difficulty: 2,
    emoji: '🔀',
    theoryBriefing: {
      icon: '📡',
      title: 'Switches vs Routers — Layer 2 vs Layer 3',
      body: `A **Switch** operates at **Layer 2** (Data Link). It:
- Does NOT have an IP address
- Uses **MAC addresses** (like AA:BB:CC:DD:EE:FF) to forward frames
- Maintains a **CAM table** mapping MAC → port
- All ports on a switch are the SAME subnet/broadcast domain

A **Router** operates at **Layer 3** (Network). It:
- HAS IP addresses (one per interface)
- Uses **IP addresses** to forward packets between different subnets
- Each interface is a DIFFERENT subnet

/28 → mask = 255.255.255.**240** → Magic = 256 − 240 = **16** → 14 usable hosts per block.`,
    },
    nodes: [
      { id: 'A', label: 'Host A', type: 'host', x: 60, y: 40, icon: '💻',
        interfaces: [{ id: 'A1', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' }] },
      { id: 'S1', label: 'Switch S1', type: 'switch', x: 370, y: 190, icon: '🔀' },
      { id: 'B', label: 'Host B', type: 'host', x: 60, y: 320, icon: '💻',
        interfaces: [{ id: 'B1', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' }] },
      { id: 'C', label: 'Host C', type: 'host', x: 600, y: 160, icon: '💻',
        interfaces: [{ id: 'C1', label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' }] },
    ],
    fields: [
      { id: 'A1_ip',   label: 'A1 IP',   editable: false, value: '10.0.5.34' },
      { id: 'A1_mask', label: 'A1 Mask', editable: false, value: '255.255.255.240' },
      { id: 'B1_ip',   label: 'B1 IP',   editable: true,  value: '', placeholder: '10.0.5.??' },
      { id: 'B1_mask', label: 'B1 Mask', editable: false, value: '255.255.255.240' },
      { id: 'C1_ip',   label: 'C1 IP',   editable: true,  value: '', placeholder: '10.0.5.??' },
      { id: 'C1_mask', label: 'C1 Mask', editable: false, value: '255.255.255.240' },
    ],
    interfaces: [
      { label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
      { label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
      { label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' },
    ],
    links: [
      { iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'S1', label: 'S1' } },
      { iface1: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
        iface2: { nodeId: 'S1', label: 'S1' } },
      { iface1: { nodeId: 'C', label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' },
        iface2: { nodeId: 'S1', label: 'S1' } },
      { iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' } },
      { iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'C', label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' } },
      { iface1: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
        iface2: { nodeId: 'C', label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' } },
    ],
    routers: [],
    routes: [],
    packetTest: { src: 'A', dst: 'C' },
    solution: { B1_ip: '10.0.5.35', C1_ip: '10.0.5.36' },
    solutionExplanation: `**Step 1:** Mask = /28 → 255.255.255.240 → Magic = 256 − 240 = **16**
**Step 2:** Host A is at .34. Block? 32 ÷ 16 = 2 → Block starts at **.32**
**Step 3:** Block: .32 – .47 → Network = .32, Broadcast = .47
**Step 4:** Usable range: **.33 – .46** (14 usable hosts)
**Step 5:** All three hosts must be in this block with unique IPs.
**Answer:** B = .35, C = .36 (any 2 unique IPs from .33–.46 except .34)`,
    hints: [
      'Mask /28 → Magic = 256 − 240 = 16. Blocks: 0, 16, 32, 48...',
      'Host A (.34) is in block .32–.47',
      'All three hosts go through the same switch = same subnet',
      'Usable IPs: .33 to .46 (avoid .32 network and .47 broadcast)',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 4 — The Router Border Crossing & Default Gateway
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 4,
    title: 'Router Border Crossing',
    subtitle: 'Default Gateway & Two Subnets',
    difficulty: 3,
    emoji: '🌉',
    theoryBriefing: {
      icon: '🚦',
      title: 'Why Routers Have Two Interfaces',
      body: `A router is a **border guard** between two different networks/subnets. It has at least **2 interfaces**, each with an IP on a **different subnet**.

When Host A (192.168.1.10/24) wants to reach Host B (10.0.0.5/24), it sees B is on a different network. So A sends the packet to its **Default Gateway** — the router's interface IP on A's subnet.

The **Default Route** is written as: **Destination: 0.0.0.0/0 → Next-Hop: [Router's IP on my subnet]**

This means: "For ANY destination I don't know about, send to this gateway."

The router receives on Interface 1, looks up the destination in its routing table, and forwards out Interface 2.`,
    },
    nodes: [
      { id: 'A', label: 'Host A', type: 'host', x: 50, y: 40, icon: '💻',
        interfaces: [{ id: 'A1', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' }] },
      { id: 'R1', label: 'Router R1', type: 'router', x: 370, y: 40, icon: '🔲',
        interfaces: [
          { id: 'R11', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
          { id: 'R12', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        ] },
      { id: 'B', label: 'Host B', type: 'host', x: 710, y: 40, icon: '💻',
        interfaces: [{ id: 'B1', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' }] },
    ],
    fields: [
      { id: 'A1_ip',    label: 'A1 IP',    editable: false, value: '192.168.1.10' },
      { id: 'A1_mask',  label: 'A1 Mask',  editable: false, value: '255.255.255.0' },
      { id: 'A_gw',     label: 'A Default GW', editable: true, value: '', placeholder: 'Router IP on A\'s subnet' },
      { id: 'R11_ip',   label: 'R11 IP',   editable: true,  value: '', placeholder: '192.168.1.??' },
      { id: 'R11_mask', label: 'R11 Mask', editable: false, value: '255.255.255.0' },
      { id: 'R12_ip',   label: 'R12 IP',   editable: false, value: '10.0.0.1' },
      { id: 'R12_mask', label: 'R12 Mask', editable: false, value: '255.255.255.0' },
      { id: 'B1_ip',    label: 'B1 IP',    editable: true,  value: '', placeholder: '10.0.0.??' },
      { id: 'B1_mask',  label: 'B1 Mask',  editable: false, value: '255.255.255.0' },
      { id: 'B_gw',     label: 'B Default GW', editable: true, value: '', placeholder: 'Router IP on B\'s subnet' },
    ],
    interfaces: [
      { label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
      { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
      { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
      { label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
    ],
    links: [
      {
        iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'R1', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
      },
      {
        iface1: { nodeId: 'R1', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        iface2: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
      },
    ],
    routers: [
      {
        name: 'R1',
        interfaces: [
          { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
          { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        ],
      },
    ],
    routes: [
      { nodeId: 'A', deviceName: 'Host A', label: 'Default Route', nextHopField: 'A_gw',
        localIpField: 'A1_ip', localMaskField: 'A1_mask', facingIpField: 'R11_ip' },
      { nodeId: 'B', deviceName: 'Host B', label: 'Default Route', nextHopField: 'B_gw',
        localIpField: 'B1_ip', localMaskField: 'B1_mask', facingIpField: 'R12_ip' },
    ],
    packetTest: { src: 'A', dst: 'B' },
    solution: { R11_ip: '192.168.1.1', A_gw: '192.168.1.1', B1_ip: '10.0.0.2', B_gw: '10.0.0.1' },
    solutionExplanation: `**Step 1:** Left subnet: 192.168.1.0/24. Router R11 needs an IP here → .1
**Step 2:** Host A's gateway must point to R11 → 192.168.1.1
**Step 3:** Right subnet: 10.0.0.0/24. R12 is fixed at .1, so B needs .2 (or any .2–.254)
**Step 4:** Host B's gateway must point to R12 → 10.0.0.1`,
    hints: [
      'Host A and R11 must be on the same /24 subnet (192.168.1.x)',
      'A\'s default gateway = R11\'s IP address',
      'Host B and R12 must be on the same /24 subnet (10.0.0.x)',
      'B\'s default gateway = R12\'s IP address = 10.0.0.1',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 5 — Router Subnet Overlap Trap (/25 Split)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 5,
    title: 'The Overlap Trap',
    subtitle: '/25 Split — Dividing 192.168.1.x in Half',
    difficulty: 3,
    emoji: '⚠️',
    theoryBriefing: {
      icon: '🚫',
      title: 'Router Overlap: The #1 NetPractice Trap',
      body: `A router's two interfaces MUST be on **non-overlapping** subnets. If both sides use 192.168.1.x, you need to split the range:

With **/25** (255.255.255.**128**), Magic = 256 − 128 = **128**:
- **Left side:** 192.168.1.0/25 → .0 – .127 (usable: .1 – .126)
- **Right side:** 192.168.1.128/25 → .128 – .255 (usable: .129 – .254)

If both interfaces had /24 (the whole .0–.255 range), the router couldn't tell which side a packet belongs to → **overlap error!**`,
    },
    nodes: [
      { id: 'A', label: 'Host A', type: 'host', x: 50, y: 40, icon: '💻',
        interfaces: [{ id: 'A1', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' }] },
      { id: 'R1', label: 'Router R1', type: 'router', x: 370, y: 40, icon: '🔲',
        interfaces: [
          { id: 'R11', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
          { id: 'R12', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        ] },
      { id: 'B', label: 'Host B', type: 'host', x: 710, y: 40, icon: '💻',
        interfaces: [{ id: 'B1', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' }] },
    ],
    fields: [
      { id: 'A1_ip',    label: 'A1 IP',    editable: false, value: '192.168.1.20' },
      { id: 'A1_mask',  label: 'A1 Mask',  editable: true,  value: '', placeholder: '/25 mask' },
      { id: 'A_gw',     label: 'A Default GW', editable: true, value: '', placeholder: '' },
      { id: 'R11_ip',   label: 'R11 IP',   editable: true,  value: '', placeholder: '192.168.1.??' },
      { id: 'R11_mask', label: 'R11 Mask', editable: true,  value: '', placeholder: '/25 mask' },
      { id: 'R12_ip',   label: 'R12 IP',   editable: true,  value: '', placeholder: '192.168.1.??' },
      { id: 'R12_mask', label: 'R12 Mask', editable: true,  value: '', placeholder: '/25 mask' },
      { id: 'B1_ip',    label: 'B1 IP',    editable: false, value: '192.168.1.200' },
      { id: 'B1_mask',  label: 'B1 Mask',  editable: true,  value: '', placeholder: '/25 mask' },
      { id: 'B_gw',     label: 'B Default GW', editable: true, value: '', placeholder: '' },
    ],
    interfaces: [
      { label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
      { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
      { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
      { label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
    ],
    links: [
      {
        iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'R1', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
      },
      {
        iface1: { nodeId: 'R1', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        iface2: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
      },
    ],
    routers: [
      {
        name: 'R1',
        interfaces: [
          { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
          { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        ],
      },
    ],
    routes: [
      { nodeId: 'A', deviceName: 'Host A', label: 'Default Route', nextHopField: 'A_gw',
        localIpField: 'A1_ip', localMaskField: 'A1_mask', facingIpField: 'R11_ip' },
      { nodeId: 'B', deviceName: 'Host B', label: 'Default Route', nextHopField: 'B_gw',
        localIpField: 'B1_ip', localMaskField: 'B1_mask', facingIpField: 'R12_ip' },
    ],
    packetTest: { src: 'A', dst: 'B' },
    solution: {
      A1_mask: '255.255.255.128', R11_ip: '192.168.1.1', R11_mask: '255.255.255.128',
      R12_ip: '192.168.1.129', R12_mask: '255.255.255.128',
      B1_mask: '255.255.255.128', A_gw: '192.168.1.1', B_gw: '192.168.1.129',
    },
    solutionExplanation: `**Step 1:** Both hosts use 192.168.1.x, so we MUST split with /25 (128-IP blocks).
**Step 2:** Left side: 192.168.1.0/25 → .0–.127. Host A (.20) is here. R11 = .1
**Step 3:** Right side: 192.168.1.128/25 → .128–.255. Host B (.200) is here. R12 = .129
**Step 4:** All masks = 255.255.255.128 (/25)
**Step 5:** A's GW → R11 (.1), B's GW → R12 (.129)`,
    hints: [
      'Both hosts are in 192.168.1.x — you MUST split to avoid overlap',
      'Use /25 (255.255.255.128): blocks are .0–.127 and .128–.255',
      'Host A (.20) → left block. Host B (.200) → right block',
      'R11 goes in the left block, R12 in the right block',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 6 — Point-to-Point /30 Router Link
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 6,
    title: 'Point-to-Point /30 Link',
    subtitle: '4 IPs, 2 Usable — Router Transit Link',
    difficulty: 4,
    emoji: '🔗',
    theoryBriefing: {
      icon: '🎯',
      title: 'The /30 Subnet — Using Every Last IP',
      body: `When two routers connect directly, you only need **2 usable IPs** (one per interface). The tightest mask for this is **/30**:

Mask = 255.255.255.**252** → Magic = 256 − 252 = **4**

A /30 block has 4 total IPs: 1 Network + **2 Usable** + 1 Broadcast.

Example block: .0, .1, .2, .3
- .0 = Network Address
- **.1 = Router A interface**
- **.2 = Router B interface**
- .3 = Broadcast

Using /30 for point-to-point links is a **VLSM best practice** — it conserves addresses for the rest of your network.`,
    },
    nodes: [
      { id: 'A', label: 'Host A', type: 'host', x: 40, y: 40, icon: '💻',
        interfaces: [{ id: 'A1', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' }] },
      { id: 'R1', label: 'Router R1', type: 'router', x: 350, y: 40, icon: '🔲',
        interfaces: [
          { id: 'R11', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
          { id: 'R12', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        ] },
      { id: 'R2', label: 'Router R2', type: 'router', x: 680, y: 40, icon: '🔲',
        interfaces: [
          { id: 'R21', label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
          { id: 'R22', label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
        ] },
      { id: 'B', label: 'Host B', type: 'host', x: 1010, y: 40, icon: '💻',
        interfaces: [{ id: 'B1', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' }] },
    ],
    fields: [
      { id: 'A1_ip',    label: 'A1 IP',    editable: false, value: '172.16.1.10' },
      { id: 'A1_mask',  label: 'A1 Mask',  editable: false, value: '255.255.255.0' },
      { id: 'A_gw',     label: 'A GW',     editable: true,  value: '', placeholder: '' },
      { id: 'R11_ip',   label: 'R11 IP',   editable: true,  value: '', placeholder: '172.16.1.??' },
      { id: 'R11_mask', label: 'R11 Mask', editable: false, value: '255.255.255.0' },
      { id: 'R12_ip',   label: 'R12 IP',   editable: true,  value: '', placeholder: '10.0.0.??' },
      { id: 'R12_mask', label: 'R12 Mask', editable: false, value: '255.255.255.252' },
      { id: 'R21_ip',   label: 'R21 IP',   editable: true,  value: '', placeholder: '10.0.0.??' },
      { id: 'R21_mask', label: 'R21 Mask', editable: false, value: '255.255.255.252' },
      { id: 'R22_ip',   label: 'R22 IP',   editable: false, value: '192.168.50.1' },
      { id: 'R22_mask', label: 'R22 Mask', editable: false, value: '255.255.255.0' },
      { id: 'B1_ip',    label: 'B1 IP',    editable: true,  value: '', placeholder: '192.168.50.??' },
      { id: 'B1_mask',  label: 'B1 Mask',  editable: false, value: '255.255.255.0' },
      { id: 'B_gw',     label: 'B GW',     editable: true,  value: '', placeholder: '' },
      { id: 'R1_route_nh', label: 'R1 → B net NH', editable: true, value: '', placeholder: '' },
      { id: 'R2_route_nh', label: 'R2 → A net NH', editable: true, value: '', placeholder: '' },
    ],
    interfaces: [
      { label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
      { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
      { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
      { label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
      { label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
      { label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
    ],
    links: [
      { iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'R1', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' } },
      { iface1: { nodeId: 'R1', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        iface2: { nodeId: 'R2', label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' } },
      { iface1: { nodeId: 'R2', label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
        iface2: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' } },
    ],
    routers: [
      { name: 'R1', interfaces: [
        { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
        { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' }] },
      { name: 'R2', interfaces: [
        { label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
        { label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' }] },
    ],
    routes: [
      { nodeId: 'A', deviceName: 'Host A', label: 'Default', nextHopField: 'A_gw',
        localIpField: 'A1_ip', localMaskField: 'A1_mask', facingIpField: 'R11_ip' },
      { nodeId: 'R1', deviceName: 'R1', label: '→ B net', nextHopField: 'R1_route_nh',
        localIpField: 'R12_ip', localMaskField: 'R12_mask', facingIpField: 'R21_ip' },
      { nodeId: 'R2', deviceName: 'R2', label: '→ A net', nextHopField: 'R2_route_nh',
        localIpField: 'R21_ip', localMaskField: 'R21_mask', facingIpField: 'R12_ip' },
      { nodeId: 'B', deviceName: 'Host B', label: 'Default', nextHopField: 'B_gw',
        localIpField: 'B1_ip', localMaskField: 'B1_mask', facingIpField: 'R22_ip' },
    ],
    packetTest: { src: 'A', dst: 'B' },
    solution: {
      R11_ip: '172.16.1.1', A_gw: '172.16.1.1',
      R12_ip: '10.0.0.1', R21_ip: '10.0.0.2',
      B1_ip: '192.168.50.2', B_gw: '192.168.50.1',
      R1_route_nh: '10.0.0.2', R2_route_nh: '10.0.0.1',
    },
    solutionExplanation: `**Step 1:** Left LAN: 172.16.1.0/24. R11 = .1, A's GW = R11 = .1
**Step 2:** Transit link: /30 block 10.0.0.0–.3. R12 = .1, R21 = .2
**Step 3:** Right LAN: 192.168.50.0/24. R22 = .1 (fixed), B = .2, B's GW = .1
**Step 4:** R1 route to B's net → next-hop = R21 = 10.0.0.2
**Step 5:** R2 route to A's net → next-hop = R12 = 10.0.0.1 (return path!)`,
    hints: [
      'The transit link between R1 and R2 uses /30 (255.255.255.252)',
      '/30 block 10.0.0.0–.3: R12 = .1, R21 = .2',
      'R1 needs a route to B\'s network → next-hop = R21\'s IP',
      'R2 needs a return route to A\'s network → next-hop = R12\'s IP',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 7 — Classic VLSM Carving
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 7,
    title: 'VLSM Address Carving',
    subtitle: 'One Block, Three Subnets, Zero Overlap',
    difficulty: 4,
    emoji: '✂️',
    theoryBriefing: {
      icon: '📐',
      title: 'VLSM — Variable Length Subnet Masking',
      body: `**VLSM** lets you carve one address block into multiple subnets of **different sizes**.

Rule: Start with the **largest** subnet, then carve smaller ones from the remaining space.

Example: 118.198.14.0/24 → carve into:
1. **/25** (128 IPs) → 118.198.14.0/25 → .0–.127
2. **/26** (64 IPs) → 118.198.14.128/26 → .128–.191
3. **/30** (4 IPs) → 118.198.14.252/30 → .252–.255

Key rule: Subnets MUST NOT overlap. Each block starts where the previous one ended.`,
    },
    nodes: [
      { id: 'A', label: 'Host A', type: 'host', x: 40, y: 30, icon: '💻',
        interfaces: [{ id: 'A1', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' }] },
      { id: 'R1', label: 'Router R1', type: 'router', x: 350, y: 50, icon: '🔲',
        interfaces: [
          { id: 'R11', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
          { id: 'R12', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        ] },
      { id: 'R2', label: 'Router R2', type: 'router', x: 680, y: 50, icon: '🔲',
        interfaces: [
          { id: 'R21', label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
          { id: 'R22', label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
        ] },
      { id: 'C', label: 'Host C', type: 'host', x: 1010, y: 30, icon: '💻',
        interfaces: [{ id: 'C1', label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' }] },
    ],
    fields: [
      { id: 'A1_ip',    label: 'A1 IP',    editable: true,  value: '', placeholder: '118.198.14.??' },
      { id: 'A1_mask',  label: 'A1 Mask',  editable: true,  value: '', placeholder: '/25 mask' },
      { id: 'A_gw',     label: 'A GW',     editable: true,  value: '', placeholder: '' },
      { id: 'R11_ip',   label: 'R11 IP',   editable: true,  value: '', placeholder: '118.198.14.??' },
      { id: 'R11_mask', label: 'R11 Mask', editable: true,  value: '', placeholder: '/25 mask' },
      { id: 'R12_ip',   label: 'R12 IP',   editable: true,  value: '', placeholder: '118.198.14.??' },
      { id: 'R12_mask', label: 'R12 Mask', editable: false, value: '255.255.255.252' },
      { id: 'R21_ip',   label: 'R21 IP',   editable: true,  value: '', placeholder: '118.198.14.??' },
      { id: 'R21_mask', label: 'R21 Mask', editable: false, value: '255.255.255.252' },
      { id: 'R22_ip',   label: 'R22 IP',   editable: true,  value: '', placeholder: '118.198.14.??' },
      { id: 'R22_mask', label: 'R22 Mask', editable: true,  value: '', placeholder: '/26 mask' },
      { id: 'C1_ip',    label: 'C1 IP',    editable: true,  value: '', placeholder: '118.198.14.??' },
      { id: 'C1_mask',  label: 'C1 Mask',  editable: true,  value: '', placeholder: '/26 mask' },
      { id: 'C_gw',     label: 'C GW',     editable: true,  value: '', placeholder: '' },
      { id: 'R1_route_nh', label: 'R1→C NH', editable: true, value: '', placeholder: '' },
      { id: 'R2_route_nh', label: 'R2→A NH', editable: true, value: '', placeholder: '' },
    ],
    interfaces: [
      { label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
      { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
      { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
      { label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
      { label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
      { label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' },
    ],
    links: [
      { iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'R1', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' } },
      { iface1: { nodeId: 'R1', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        iface2: { nodeId: 'R2', label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' } },
      { iface1: { nodeId: 'R2', label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
        iface2: { nodeId: 'C', label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' } },
    ],
    routers: [
      { name: 'R1', interfaces: [
        { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
        { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' }] },
      { name: 'R2', interfaces: [
        { label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
        { label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' }] },
    ],
    routes: [
      { nodeId: 'A', deviceName: 'Host A', label: 'Default', nextHopField: 'A_gw',
        localIpField: 'A1_ip', localMaskField: 'A1_mask', facingIpField: 'R11_ip' },
      { nodeId: 'R1', deviceName: 'R1', label: '→ C net', nextHopField: 'R1_route_nh',
        localIpField: 'R12_ip', localMaskField: 'R12_mask', facingIpField: 'R21_ip' },
      { nodeId: 'R2', deviceName: 'R2', label: '→ A net', nextHopField: 'R2_route_nh',
        localIpField: 'R21_ip', localMaskField: 'R21_mask', facingIpField: 'R12_ip' },
      { nodeId: 'C', deviceName: 'Host C', label: 'Default', nextHopField: 'C_gw',
        localIpField: 'C1_ip', localMaskField: 'C1_mask', facingIpField: 'R22_ip' },
    ],
    packetTest: { src: 'A', dst: 'C' },
    solution: {
      A1_ip: '118.198.14.1', A1_mask: '255.255.255.128',
      R11_ip: '118.198.14.126', R11_mask: '255.255.255.128',
      R12_ip: '118.198.14.253', R21_ip: '118.198.14.254',
      R22_ip: '118.198.14.129', R22_mask: '255.255.255.192',
      C1_ip: '118.198.14.130', C1_mask: '255.255.255.192',
      A_gw: '118.198.14.126', C_gw: '118.198.14.129',
      R1_route_nh: '118.198.14.254', R2_route_nh: '118.198.14.253',
    },
    solutionExplanation: `**Carving 118.198.14.0/24:**
1. **/25** (128 IPs): .0–.127 → Host A subnet. A1 = .1, R11 = .126
2. **/26** (64 IPs): .128–.191 → Host C subnet. R22 = .129, C1 = .130
3. **/30** (4 IPs): .252–.255 → Transit link. R12 = .253, R21 = .254
**No overlap:** .0–.127 | .128–.191 | .252–.255 ✓`,
    hints: [
      'Carve 118.198.14.0/24 into 3 non-overlapping subnets',
      'Largest first: /25 (.0–.127), then /26 (.128–.191), then /30 (.252–.255)',
      'Host A goes in the /25 block, Host C in the /26 block',
      'The /30 transit link uses .252–.255 (usable: .253 and .254)',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 8 — Return Path Mystery
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 8,
    title: 'The Return Path Mystery',
    subtitle: 'Packets arrive but replies get lost!',
    difficulty: 4,
    emoji: '🔄',
    theoryBriefing: {
      icon: '↩️',
      title: 'Bidirectional Routing — The Return Trip',
      body: `Networking is a **two-way conversation**. When Host A pings Host B:
1. **Forward path:** A → R1 → R2 → B ✅
2. **Return path:** B → R2 → R1 → A ❓

If R2 only has a route for B's subnet but NOT for A's subnet, the reply packet gets **dropped at R2**!

Every router in the path must know how to reach BOTH the source AND destination subnets. This is why you always need:
- Forward routes (to reach the destination)
- **Return routes** (for the reply to come back)

The 0.0.0.0/0 default route is often the simplest fix — "send everything I don't know about to my next-hop neighbor."`,
    },
    nodes: [
      { id: 'A', label: 'Host A', type: 'host', x: 40, y: 40, icon: '💻',
        interfaces: [{ id: 'A1', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' }] },
      { id: 'R1', label: 'Router R1', type: 'router', x: 350, y: 40, icon: '🔲',
        interfaces: [
          { id: 'R11', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
          { id: 'R12', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        ] },
      { id: 'R2', label: 'Router R2', type: 'router', x: 680, y: 40, icon: '🔲',
        interfaces: [
          { id: 'R21', label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
          { id: 'R22', label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
        ] },
      { id: 'B', label: 'Host B', type: 'host', x: 1010, y: 40, icon: '💻',
        interfaces: [{ id: 'B1', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' }] },
    ],
    fields: [
      { id: 'A1_ip',    label: 'A1 IP',    editable: false, value: '10.10.1.5' },
      { id: 'A1_mask',  label: 'A1 Mask',  editable: false, value: '255.255.255.0' },
      { id: 'A_gw',     label: 'A GW',     editable: true,  value: '', placeholder: '' },
      { id: 'R11_ip',   label: 'R11 IP',   editable: false, value: '10.10.1.1' },
      { id: 'R11_mask', label: 'R11 Mask', editable: false, value: '255.255.255.0' },
      { id: 'R12_ip',   label: 'R12 IP',   editable: false, value: '10.10.2.1' },
      { id: 'R12_mask', label: 'R12 Mask', editable: false, value: '255.255.255.252' },
      { id: 'R21_ip',   label: 'R21 IP',   editable: false, value: '10.10.2.2' },
      { id: 'R21_mask', label: 'R21 Mask', editable: false, value: '255.255.255.252' },
      { id: 'R22_ip',   label: 'R22 IP',   editable: false, value: '10.10.3.1' },
      { id: 'R22_mask', label: 'R22 Mask', editable: false, value: '255.255.255.0' },
      { id: 'B1_ip',    label: 'B1 IP',    editable: false, value: '10.10.3.10' },
      { id: 'B1_mask',  label: 'B1 Mask',  editable: false, value: '255.255.255.0' },
      { id: 'B_gw',     label: 'B GW',     editable: true,  value: '', placeholder: '' },
      { id: 'R1_def_nh', label: 'R1 default NH', editable: true, value: '', placeholder: '' },
      { id: 'R2_def_nh', label: 'R2 default NH', editable: true, value: '', placeholder: '' },
    ],
    interfaces: [
      { label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
      { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
      { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
      { label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
      { label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
      { label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
    ],
    links: [
      { iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'R1', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' } },
      { iface1: { nodeId: 'R1', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        iface2: { nodeId: 'R2', label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' } },
      { iface1: { nodeId: 'R2', label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
        iface2: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' } },
    ],
    routers: [
      { name: 'R1', interfaces: [
        { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
        { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' }] },
      { name: 'R2', interfaces: [
        { label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
        { label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' }] },
    ],
    routes: [
      { nodeId: 'A', deviceName: 'Host A', label: 'Default', nextHopField: 'A_gw',
        localIpField: 'A1_ip', localMaskField: 'A1_mask', facingIpField: 'R11_ip' },
      { nodeId: 'R1', deviceName: 'R1', label: 'Default', nextHopField: 'R1_def_nh',
        localIpField: 'R12_ip', localMaskField: 'R12_mask', facingIpField: 'R21_ip' },
      { nodeId: 'R2', deviceName: 'R2', label: 'Default', nextHopField: 'R2_def_nh',
        localIpField: 'R21_ip', localMaskField: 'R21_mask', facingIpField: 'R12_ip' },
      { nodeId: 'B', deviceName: 'Host B', label: 'Default', nextHopField: 'B_gw',
        localIpField: 'B1_ip', localMaskField: 'B1_mask', facingIpField: 'R22_ip' },
    ],
    packetTest: { src: 'A', dst: 'B' },
    solution: {
      A_gw: '10.10.1.1', B_gw: '10.10.3.1',
      R1_def_nh: '10.10.2.2', R2_def_nh: '10.10.2.1',
    },
    solutionExplanation: `**The Mystery:** All IPs are already configured! The problem is missing routes.
**Forward:** A→R1→R2→B: R1 needs a default route → next-hop = R21 (10.10.2.2)
**Return:** B→R2→R1→A: R2 needs a return route → next-hop = R12 (10.10.2.1)
Without R2's return route, B's reply reaches R2 but R2 doesn't know how to get back to 10.10.1.0/24!`,
    hints: [
      'All IPs are already set — this is purely a routing table problem',
      'A\'s gateway = R11 (10.10.1.1), B\'s gateway = R22 (10.10.3.1)',
      'R1 default route → next-hop = R21 on the transit link',
      'R2 ALSO needs a default route back → next-hop = R12. This is the return path!',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 9 — Class B / Third-Octet Subnetting
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 9,
    title: 'Third-Octet Subnetting',
    subtitle: '/18 — When the Interesting Octet Shifts',
    difficulty: 5,
    emoji: '🔬',
    theoryBriefing: {
      icon: '🧠',
      title: 'Subnetting Beyond the 4th Octet',
      body: `So far, the "interesting" octet has been the 4th (last) one. But with masks like /18, /20, or /22, the boundary falls in the **3rd octet**:

**/18** → 255.255.**192**.0 → Magic Number in 3rd octet = 256 − 192 = **64**

This means the 3rd octet breaks into blocks of 64:
- 172.16.**0**.0/18 → 172.16.0.0 – 172.16.**63**.255
- 172.16.**64**.0/18 → 172.16.64.0 – 172.16.**127**.255
- 172.16.**128**.0/18 → 172.16.128.0 – 172.16.**191**.255

The 4th octet runs the full 0–255 range within each block. So host 172.16.50.200 and host 172.16.10.5 are in the **same** /18 subnet!`,
    },
    nodes: [
      { id: 'A', label: 'Host A', type: 'host', x: 50, y: 40, icon: '💻',
        interfaces: [{ id: 'A1', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' }] },
      { id: 'R1', label: 'Router R1', type: 'router', x: 370, y: 40, icon: '🔲',
        interfaces: [
          { id: 'R11', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
          { id: 'R12', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        ] },
      { id: 'B', label: 'Host B', type: 'host', x: 710, y: 40, icon: '💻',
        interfaces: [{ id: 'B1', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' }] },
    ],
    fields: [
      { id: 'A1_ip',    label: 'A1 IP',    editable: false, value: '172.16.50.200' },
      { id: 'A1_mask',  label: 'A1 Mask',  editable: false, value: '255.255.192.0' },
      { id: 'A_gw',     label: 'A GW',     editable: true,  value: '', placeholder: '' },
      { id: 'R11_ip',   label: 'R11 IP',   editable: true,  value: '', placeholder: '172.16.??.??' },
      { id: 'R11_mask', label: 'R11 Mask', editable: false, value: '255.255.192.0' },
      { id: 'R12_ip',   label: 'R12 IP',   editable: false, value: '10.0.0.1' },
      { id: 'R12_mask', label: 'R12 Mask', editable: false, value: '255.255.255.252' },
      { id: 'B1_ip',    label: 'B1 IP',    editable: true,  value: '', placeholder: '10.0.0.??' },
      { id: 'B1_mask',  label: 'B1 Mask',  editable: false, value: '255.255.255.252' },
      { id: 'B_gw',     label: 'B GW',     editable: true,  value: '', placeholder: '' },
    ],
    interfaces: [
      { label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
      { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
      { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
      { label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
    ],
    links: [
      { iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'R1', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' } },
      { iface1: { nodeId: 'R1', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        iface2: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' } },
    ],
    routers: [
      { name: 'R1', interfaces: [
        { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
        { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' }] },
    ],
    routes: [
      { nodeId: 'A', deviceName: 'Host A', label: 'Default', nextHopField: 'A_gw',
        localIpField: 'A1_ip', localMaskField: 'A1_mask', facingIpField: 'R11_ip' },
      { nodeId: 'B', deviceName: 'Host B', label: 'Default', nextHopField: 'B_gw',
        localIpField: 'B1_ip', localMaskField: 'B1_mask', facingIpField: 'R12_ip' },
    ],
    packetTest: { src: 'A', dst: 'B' },
    solution: {
      R11_ip: '172.16.0.1', A_gw: '172.16.0.1',
      B1_ip: '10.0.0.2', B_gw: '10.0.0.1',
    },
    solutionExplanation: `**Step 1:** A is at 172.16.50.200 with /18 → network = 172.16.**0**.0 (since 50 < 64)
**Step 2:** The /18 block spans 172.16.0.0 – 172.16.63.255 (16,382 usable hosts!)
**Step 3:** R11 needs any IP in that range → 172.16.0.1 works
**Step 4:** Right side: /30, R12 = 10.0.0.1 (fixed), B = 10.0.0.2
**Key insight:** The 3rd octet (50) matters! With /18, .50 and .0 are on the SAME network.`,
    hints: [
      'With /18 (255.255.192.0), the magic number applies to the 3RD octet: 256 − 192 = 64',
      '172.16.50.200 → 3rd octet 50 < 64, so network = 172.16.0.0',
      'R11 can be ANY IP from 172.16.0.1 to 172.16.63.254',
      'Right side is a simple /30: R12 = .1, B = .2',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL 10 — The Final Boss
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 10,
    title: 'The Final Boss',
    subtitle: '3 Routers, Internet Gateway, VLSM Mastery',
    difficulty: 5,
    emoji: '🏆',
    theoryBriefing: {
      icon: '🎓',
      title: 'Putting It ALL Together',
      body: `This is the final evaluation scenario. You must combine EVERY concept:

✅ /30 point-to-point transit links between routers
✅ /24 and /26 LAN subnets for hosts
✅ VLSM carving without overlap
✅ Default routes (0.0.0.0/0) on hosts
✅ Specific static routes on routers
✅ Bidirectional routing (forward AND return paths)

Think of it as a mini-Internet: Hosts connect to their local router, routers connect to each other via /30 links, and one router connects to "The Internet" (represented by an ISP gateway).

Plan your address blocks BEFORE typing! Draw out the subnets on paper first.`,
    },
    nodes: [
      { id: 'A', label: 'Host A', type: 'host', x: 40, y: 40, icon: '💻',
        interfaces: [{ id: 'A1', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' }] },
      { id: 'D', label: 'Host D', type: 'host', x: 40, y: 340, icon: '💻',
        interfaces: [{ id: 'D1', label: 'D1', ipField: 'D1_ip', maskField: 'D1_mask' }] },
      { id: 'S1', label: 'Switch', type: 'switch', x: 340, y: 220, icon: '🔀' },
      { id: 'R1', label: 'Router R1', type: 'router', x: 550, y: 170, icon: '🔲',
        interfaces: [
          { id: 'R11', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
          { id: 'R12', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
          { id: 'R13', label: 'R13', ipField: 'R13_ip', maskField: 'R13_mask' },
        ] },
      { id: 'R2', label: 'Router R2', type: 'router', x: 870, y: 40, icon: '🔲',
        interfaces: [
          { id: 'R21', label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
          { id: 'R22', label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
        ] },
      { id: 'R3', label: 'Router R3', type: 'router', x: 870, y: 340, icon: '🔲',
        interfaces: [
          { id: 'R31', label: 'R31', ipField: 'R31_ip', maskField: 'R31_mask' },
          { id: 'R32', label: 'R32', ipField: 'R32_ip', maskField: 'R32_mask' },
        ] },
      { id: 'B', label: 'Host B', type: 'host', x: 1190, y: 40, icon: '💻',
        interfaces: [{ id: 'B1', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' }] },
      { id: 'C', label: 'Host C', type: 'host', x: 1190, y: 340, icon: '💻',
        interfaces: [{ id: 'C1', label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' }] },
    ],
    fields: [
      { id: 'A1_ip',    label: 'A1 IP',    editable: false, value: '192.168.1.2' },
      { id: 'A1_mask',  label: 'A1 Mask',  editable: false, value: '255.255.255.192' },
      { id: 'A_gw',     label: 'A GW',     editable: true,  value: '', placeholder: '' },
      { id: 'D1_ip',    label: 'D1 IP',    editable: true,  value: '', placeholder: '192.168.1.??' },
      { id: 'D1_mask',  label: 'D1 Mask',  editable: false, value: '255.255.255.192' },
      { id: 'D_gw',     label: 'D GW',     editable: true,  value: '', placeholder: '' },
      { id: 'R11_ip',   label: 'R11 IP',   editable: true,  value: '', placeholder: '192.168.1.??' },
      { id: 'R11_mask', label: 'R11 Mask', editable: false, value: '255.255.255.192' },
      { id: 'R12_ip',   label: 'R12 IP',   editable: true,  value: '', placeholder: '10.0.0.??' },
      { id: 'R12_mask', label: 'R12 Mask', editable: false, value: '255.255.255.252' },
      { id: 'R13_ip',   label: 'R13 IP',   editable: true,  value: '', placeholder: '10.0.0.??' },
      { id: 'R13_mask', label: 'R13 Mask', editable: false, value: '255.255.255.252' },
      { id: 'R21_ip',   label: 'R21 IP',   editable: true,  value: '', placeholder: '10.0.0.??' },
      { id: 'R21_mask', label: 'R21 Mask', editable: false, value: '255.255.255.252' },
      { id: 'R22_ip',   label: 'R22 IP',   editable: true,  value: '', placeholder: '10.0.1.??' },
      { id: 'R22_mask', label: 'R22 Mask', editable: false, value: '255.255.255.0' },
      { id: 'R31_ip',   label: 'R31 IP',   editable: true,  value: '', placeholder: '10.0.0.??' },
      { id: 'R31_mask', label: 'R31 Mask', editable: false, value: '255.255.255.252' },
      { id: 'R32_ip',   label: 'R32 IP',   editable: true,  value: '', placeholder: '10.0.2.??' },
      { id: 'R32_mask', label: 'R32 Mask', editable: false, value: '255.255.255.0' },
      { id: 'B1_ip',    label: 'B1 IP',    editable: true,  value: '', placeholder: '10.0.1.??' },
      { id: 'B1_mask',  label: 'B1 Mask',  editable: false, value: '255.255.255.0' },
      { id: 'B_gw',     label: 'B GW',     editable: true,  value: '', placeholder: '' },
      { id: 'C1_ip',    label: 'C1 IP',    editable: true,  value: '', placeholder: '10.0.2.??' },
      { id: 'C1_mask',  label: 'C1 Mask',  editable: false, value: '255.255.255.0' },
      { id: 'C_gw',     label: 'C GW',     editable: true,  value: '', placeholder: '' },
      { id: 'R1_r2_nh', label: 'R1→R2 NH', editable: true, value: '', placeholder: '' },
      { id: 'R1_r3_nh', label: 'R1→R3 NH', editable: true, value: '', placeholder: '' },
      { id: 'R2_def_nh', label: 'R2 def NH', editable: true, value: '', placeholder: '' },
      { id: 'R3_def_nh', label: 'R3 def NH', editable: true, value: '', placeholder: '' },
    ],
    interfaces: [
      { label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
      { label: 'D1', ipField: 'D1_ip', maskField: 'D1_mask' },
      { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
      { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
      { label: 'R13', ipField: 'R13_ip', maskField: 'R13_mask' },
      { label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
      { label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
      { label: 'R31', ipField: 'R31_ip', maskField: 'R31_mask' },
      { label: 'R32', ipField: 'R32_ip', maskField: 'R32_mask' },
      { label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' },
      { label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' },
    ],
    links: [
      { iface1: { nodeId: 'A', label: 'A1', ipField: 'A1_ip', maskField: 'A1_mask' },
        iface2: { nodeId: 'R1', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' } },
      { iface1: { nodeId: 'D', label: 'D1', ipField: 'D1_ip', maskField: 'D1_mask' },
        iface2: { nodeId: 'R1', label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' } },
      { iface1: { nodeId: 'A', label: 'A1' }, iface2: { nodeId: 'S1', label: 'S1' } },
      { iface1: { nodeId: 'D', label: 'D1' }, iface2: { nodeId: 'S1', label: 'S1' } },
      { iface1: { nodeId: 'R1', label: 'R11' }, iface2: { nodeId: 'S1', label: 'S1' } },
      { iface1: { nodeId: 'R1', label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        iface2: { nodeId: 'R2', label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' } },
      { iface1: { nodeId: 'R1', label: 'R13', ipField: 'R13_ip', maskField: 'R13_mask' },
        iface2: { nodeId: 'R3', label: 'R31', ipField: 'R31_ip', maskField: 'R31_mask' } },
      { iface1: { nodeId: 'R2', label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' },
        iface2: { nodeId: 'B', label: 'B1', ipField: 'B1_ip', maskField: 'B1_mask' } },
      { iface1: { nodeId: 'R3', label: 'R32', ipField: 'R32_ip', maskField: 'R32_mask' },
        iface2: { nodeId: 'C', label: 'C1', ipField: 'C1_ip', maskField: 'C1_mask' } },
    ],
    routers: [
      { name: 'R1', interfaces: [
        { label: 'R11', ipField: 'R11_ip', maskField: 'R11_mask' },
        { label: 'R12', ipField: 'R12_ip', maskField: 'R12_mask' },
        { label: 'R13', ipField: 'R13_ip', maskField: 'R13_mask' }] },
      { name: 'R2', interfaces: [
        { label: 'R21', ipField: 'R21_ip', maskField: 'R21_mask' },
        { label: 'R22', ipField: 'R22_ip', maskField: 'R22_mask' }] },
      { name: 'R3', interfaces: [
        { label: 'R31', ipField: 'R31_ip', maskField: 'R31_mask' },
        { label: 'R32', ipField: 'R32_ip', maskField: 'R32_mask' }] },
    ],
    routes: [
      { nodeId: 'A', deviceName: 'Host A', label: 'Default', nextHopField: 'A_gw',
        localIpField: 'A1_ip', localMaskField: 'A1_mask', facingIpField: 'R11_ip' },
      { nodeId: 'D', deviceName: 'Host D', label: 'Default', nextHopField: 'D_gw',
        localIpField: 'D1_ip', localMaskField: 'D1_mask', facingIpField: 'R11_ip' },
      { nodeId: 'R1', deviceName: 'R1', label: '→R2', nextHopField: 'R1_r2_nh',
        localIpField: 'R12_ip', localMaskField: 'R12_mask', facingIpField: 'R21_ip' },
      { nodeId: 'R1', deviceName: 'R1', label: '→R3', nextHopField: 'R1_r3_nh',
        localIpField: 'R13_ip', localMaskField: 'R13_mask', facingIpField: 'R31_ip' },
      { nodeId: 'R2', deviceName: 'R2', label: 'Default', nextHopField: 'R2_def_nh',
        localIpField: 'R21_ip', localMaskField: 'R21_mask', facingIpField: 'R12_ip' },
      { nodeId: 'R3', deviceName: 'R3', label: 'Default', nextHopField: 'R3_def_nh',
        localIpField: 'R31_ip', localMaskField: 'R31_mask', facingIpField: 'R13_ip' },
      { nodeId: 'B', deviceName: 'Host B', label: 'Default', nextHopField: 'B_gw',
        localIpField: 'B1_ip', localMaskField: 'B1_mask', facingIpField: 'R22_ip' },
      { nodeId: 'C', deviceName: 'Host C', label: 'Default', nextHopField: 'C_gw',
        localIpField: 'C1_ip', localMaskField: 'C1_mask', facingIpField: 'R32_ip' },
    ],
    packetTest: { src: 'A', dst: 'B' },
    solution: {
      R11_ip: '192.168.1.1', A_gw: '192.168.1.1',
      D1_ip: '192.168.1.3', D_gw: '192.168.1.1',
      R12_ip: '10.0.0.1',
      R13_ip: '10.0.0.6',
      R21_ip: '10.0.0.2', R22_ip: '10.0.1.1',
      R31_ip: '10.0.0.5', R32_ip: '10.0.2.1',
      B1_ip: '10.0.1.2', B_gw: '10.0.1.1',
      C1_ip: '10.0.2.2', C_gw: '10.0.2.1',
      R1_r2_nh: '10.0.0.2', R1_r3_nh: '10.0.0.5',
      R2_def_nh: '10.0.0.1', R3_def_nh: '10.0.0.6',
    },
    solutionExplanation: `**LAN:** 192.168.1.0/26 → A(.2), D(.3), R11(.1) on the switch. GW = .1
**Transit R1↔R2:** 10.0.0.0/30 → R12(.1), R21(.2)
**Transit R1↔R3:** 10.0.0.4/30 → R13(.6), R31(.5)
**R2 LAN:** 10.0.1.0/24 → R22(.1), B(.2)
**R3 LAN:** 10.0.2.0/24 → R32(.1), C(.2)
**Routes:** R2/R3 default back to R1. R1 routes to R2/R3 via their transit IPs.`,
    hints: [
      'Start with the LAN: A, D, and R11 all share the /26 switch subnet',
      'Transit links use /30: R1↔R2 and R1↔R3 need separate /30 blocks',
      'R2 and R3 each have their own /24 LAN for B and C',
      'All hosts point to their local router. R2/R3 default back to R1.',
    ],
  },
];

export default levels;

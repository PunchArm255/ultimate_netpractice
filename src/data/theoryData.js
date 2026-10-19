/* ─────────────────────────────────────────────────────────────────────────────
 *  theoryData.js – Complete interactive data for OSI/TCP models, Packet X-Ray,
 *  and Oral Defense Flashcards.
 * ───────────────────────────────────────────────────────────────────────────── */

// ──────────────────────── OSI & TCP/IP MODEL DATA ────────────────────────────

export const osiLayers = [
  {
    num: 7, name: 'Application', color: '#E8DEEE',
    pdu: 'Data', devices: ['End Devices'], protocols: ['HTTP', 'HTTPS', 'FTP', 'SSH', 'DNS', 'DHCP', 'SMTP'],
    description: 'Where user applications interact with the network. Provides services like web browsing (HTTP), file transfer (FTP), and email (SMTP).',
    tcpClassic: 'Application', tcpModern: 'Application',
  },
  {
    num: 6, name: 'Presentation', color: '#F5E0F0',
    pdu: 'Data', devices: ['End Devices'], protocols: ['SSL/TLS', 'JPEG', 'GIF', 'ASCII', 'MPEG'],
    description: 'Translates data formats, handles encryption/decryption, and compression. Ensures data from the application layer can be understood.',
    tcpClassic: 'Application', tcpModern: 'Application',
  },
  {
    num: 5, name: 'Session', color: '#FBECDD',
    pdu: 'Data', devices: ['End Devices'], protocols: ['NetBIOS', 'RPC', 'PPTP'],
    description: 'Manages sessions (connections) between applications. Controls dialog, synchronization, and checkpointing.',
    tcpClassic: 'Application', tcpModern: 'Application',
  },
  {
    num: 4, name: 'Transport', color: '#DBEDDB',
    pdu: 'Segment / Datagram', devices: ['Firewalls', 'Load Balancers'], protocols: ['TCP', 'UDP'],
    description: 'Provides end-to-end communication, flow control, and error recovery. TCP = reliable ordered delivery. UDP = fast, best-effort.',
    tcpClassic: 'Transport', tcpModern: 'Transport',
  },
  {
    num: 3, name: 'Network', color: '#D3E5EF',
    pdu: 'Packet', devices: ['Router', 'Layer 3 Switch'], protocols: ['IPv4', 'IPv6', 'ICMP', 'ARP', 'OSPF', 'BGP'],
    description: 'Handles logical addressing (IP addresses) and routing. Routers operate here, deciding the best path for packets across networks.',
    tcpClassic: 'Internet', tcpModern: 'Network',
  },
  {
    num: 2, name: 'Data Link', color: '#E8F0FE',
    pdu: 'Frame', devices: ['Switch', 'Bridge', 'NIC'], protocols: ['Ethernet', 'Wi-Fi (802.11)', 'PPP', 'ARP'],
    description: 'Provides node-to-node data transfer using MAC addresses. Switches use their CAM table to forward frames to the correct port.',
    tcpClassic: 'Network Access', tcpModern: 'Data Link',
  },
  {
    num: 1, name: 'Physical', color: '#FBE4E4',
    pdu: 'Bits', devices: ['Cable', 'Hub', 'Repeater', 'NIC'], protocols: ['Ethernet (physical)', 'USB', 'DSL', 'Fiber'],
    description: 'Transmits raw bitstreams (1s and 0s) over the physical medium — copper cables, fiber optics, or wireless radio waves.',
    tcpClassic: 'Network Access', tcpModern: 'Physical',
  },
];

// ───────────────────────── PACKET JOURNEY STEPS ──────────────────────────────

export const packetJourneySteps = [
  {
    id: 0,
    title: '1. Host A Creates the Data',
    node: 'Host A',
    description: 'Host A\'s application (e.g., a web browser) generates an HTTP request. The Transport layer wraps it in a TCP Segment with source and destination port numbers.',
    frame: null,
    packet: null,
    highlight: 'application',
  },
  {
    id: 1,
    title: '2. Layer 3: IP Packet Created',
    node: 'Host A',
    description: 'The Network layer adds an IPv4 header with Source IP (Host A\'s IP) and Destination IP (Server B\'s IP). These IPs NEVER change during transit.',
    frame: null,
    packet: { srcIp: '192.168.1.10', dstIp: '10.0.0.5', ttl: 64, protocol: 'TCP' },
    highlight: 'network',
  },
  {
    id: 2,
    title: '3. ARP Broadcast — "Who has the gateway?"',
    node: 'Host A',
    description: 'Host A knows the destination is on a different network, so it must send to its Default Gateway (Router R1). But it needs R1\'s MAC address! It sends an ARP Request broadcast to FF:FF:FF:FF:FF:FF asking "Who has 192.168.1.1?"',
    frame: { srcMac: 'AA:AA:AA:00:00:01', dstMac: 'FF:FF:FF:FF:FF:FF', type: 'ARP Request' },
    packet: { srcIp: '192.168.1.10', dstIp: '10.0.0.5', ttl: 64, protocol: 'TCP' },
    highlight: 'datalink',
  },
  {
    id: 3,
    title: '4. Layer 2 Frame Encapsulation',
    node: 'Host A',
    description: 'After ARP resolves, Host A wraps the IP packet in an Ethernet Frame with its own MAC as source and Router R1\'s MAC as destination. The frame is now ready to travel on the wire.',
    frame: { srcMac: 'AA:AA:AA:00:00:01', dstMac: 'BB:BB:BB:00:00:01', type: '0x0800 (IPv4)' },
    packet: { srcIp: '192.168.1.10', dstIp: '10.0.0.5', ttl: 64, protocol: 'TCP' },
    highlight: 'datalink',
  },
  {
    id: 4,
    title: '5. Switch S1 — Layer 2 Forwarding',
    node: 'Switch S1',
    description: 'The switch receives the frame and reads ONLY the Layer 2 destination MAC address. It looks up its CAM table to find which port that MAC is on and forwards the frame there. The switch NEVER looks at IP addresses!',
    frame: { srcMac: 'AA:AA:AA:00:00:01', dstMac: 'BB:BB:BB:00:00:01', type: '0x0800 (IPv4)' },
    packet: { srcIp: '192.168.1.10', dstIp: '10.0.0.5', ttl: 64, protocol: 'TCP' },
    highlight: 'switch',
  },
  {
    id: 5,
    title: '6. Router R1 — Frame Stripped & Destroyed!',
    node: 'Router R1 (in)',
    description: 'Router R1 receives the frame on interface R11. It STRIPS OFF the entire Layer 2 Ethernet Frame header (src MAC, dst MAC) and DESTROYS it. The router only cares about the Layer 3 IP Packet inside.',
    frame: { srcMac: '🗑️ DESTROYED', dstMac: '🗑️ DESTROYED', type: '—' },
    packet: { srcIp: '192.168.1.10', dstIp: '10.0.0.5', ttl: 64, protocol: 'TCP' },
    highlight: 'router-strip',
  },
  {
    id: 6,
    title: '7. Router R1 — Routing Decision & TTL',
    node: 'Router R1',
    description: 'R1 reads the Destination IP (10.0.0.5), consults its routing table, finds it should forward out interface R12. It DECREMENTS TTL from 64 → 63 (if TTL hits 0, the packet is dropped and an ICMP "Time Exceeded" is sent back — this is how traceroute works!).',
    frame: null,
    packet: { srcIp: '192.168.1.10', dstIp: '10.0.0.5', ttl: 63, protocol: 'TCP' },
    highlight: 'router-route',
  },
  {
    id: 7,
    title: '8. Router R1 — NEW Frame Created!',
    node: 'Router R1 (out)',
    description: 'R1 wraps the packet in a BRAND NEW Layer 2 Ethernet Frame with R12\'s MAC as source and Server B\'s MAC as destination. Notice: Source IP and Destination IP are UNCHANGED! Only the MACs changed.',
    frame: { srcMac: 'BB:BB:BB:00:00:02', dstMac: 'CC:CC:CC:00:00:01', type: '0x0800 (IPv4)' },
    packet: { srcIp: '192.168.1.10', dstIp: '10.0.0.5', ttl: 63, protocol: 'TCP' },
    highlight: 'router-new-frame',
  },
  {
    id: 8,
    title: '9. Server B Receives!',
    node: 'Server B',
    description: 'Server B receives the frame, strips the Ethernet header, reads the IP packet, finds its own IP as the destination, and passes the data up through Transport (TCP) to the Application layer. The request is delivered! 🎉',
    frame: { srcMac: 'BB:BB:BB:00:00:02', dstMac: 'CC:CC:CC:00:00:01', type: '0x0800 (IPv4)' },
    packet: { srcIp: '192.168.1.10', dstIp: '10.0.0.5', ttl: 63, protocol: 'TCP' },
    highlight: 'destination',
  },
];

// ──────────────────────── DEFENSE FLASHCARDS ─────────────────────────────────

export const defenseTopics = [
  {
    id: 'ipv4-vs-ipv6',
    title: 'IPv4 vs IPv6',
    emoji: '🌐',
    color: '#D3E5EF',
    cards: [
      {
        q: 'How many bits is an IPv4 address? How many total addresses?',
        a: '**32 bits** → 2³² = **~4.29 billion** addresses. Written in dotted-decimal: 192.168.1.1',
      },
      {
        q: 'How many bits is an IPv6 address? How many total addresses?',
        a: '**128 bits** → 2¹²⁸ = **3.4 × 10³⁸** addresses. Written in hexadecimal groups: 2001:0db8:85a3::8a2e:0370:7334',
      },
      {
        q: 'Does IPv6 have Broadcast?',
        a: '**No!** IPv6 eliminated broadcast entirely. Instead it uses:\n- **Multicast** (one-to-many specific group)\n- **Anycast** (one-to-nearest in a group)\nThis reduces network congestion from broadcast storms.',
      },
      {
        q: 'What replaces ARP in IPv6?',
        a: '**NDP (Neighbor Discovery Protocol)**, part of ICMPv6. It uses multicast instead of broadcast for address resolution, making it more efficient.',
      },
    ],
  },
  {
    id: 'private-ips',
    title: 'Private IPs & Special Ranges',
    emoji: '🏠',
    color: '#DBEDDB',
    cards: [
      {
        q: 'What are the three RFC 1918 Private IP ranges?',
        a: '**Class A:** 10.0.0.0/8 (10.0.0.0 – 10.255.255.255) → 16.7M hosts\n**Class B:** 172.16.0.0/12 (172.16.0.0 – 172.31.255.255) → 1M hosts\n**Class C:** 192.168.0.0/16 (192.168.0.0 – 192.168.255.255) → 65K hosts',
      },
      {
        q: 'What is 127.0.0.1?',
        a: '**Loopback** — the entire 127.0.0.0/8 range points back to your own machine. Used for testing: `ping 127.0.0.1` = "ping myself." Never leaves the NIC.',
      },
      {
        q: 'What is 169.254.x.x?',
        a: '**APIPA (Automatic Private IP Addressing)** — 169.254.0.0/16. Assigned automatically when DHCP fails. Allows link-local communication only (no routing).',
      },
      {
        q: 'What does 0.0.0.0/0 mean in a routing table?',
        a: '**Default Route** — matches ALL destinations. It\'s the "if I don\'t know where to send this, use this gateway" rule. Like a catch-all mailbox.',
      },
    ],
  },
  {
    id: 'nat-pat',
    title: 'NAT & PAT (NAT Overload)',
    emoji: '🔄',
    color: '#FBECDD',
    cards: [
      {
        q: 'What is NAT? Why do we need it?',
        a: '**Network Address Translation** converts private IPs (RFC 1918) to public IPs at the router/firewall. Needed because IPv4 has only ~4.29B addresses — not enough for every device to have a public IP.',
      },
      {
        q: 'What is PAT (Port Address Translation)?',
        a: '**PAT** (also called NAT Overload) lets MANY private hosts share ONE public IP by using different **Layer 4 port numbers** as identifiers.\n\nExample:\n- 192.168.1.10:50001 → 203.0.113.1:**50001**\n- 192.168.1.20:50002 → 203.0.113.1:**50002**\n\nThe NAT table maps each internal IP:port to the public IP:port.',
      },
      {
        q: 'What\'s the difference between Static NAT, Dynamic NAT, and PAT?',
        a: '**Static NAT:** 1-to-1 permanent mapping (server hosting)\n**Dynamic NAT:** Pool of public IPs assigned first-come-first-served\n**PAT:** Many-to-1 using port numbers (most common for homes/offices)',
      },
    ],
  },
  {
    id: 'dhcp',
    title: 'DHCP (DORA Sequence)',
    emoji: '📋',
    color: '#E8DEEE',
    cards: [
      {
        q: 'What are the 4 steps of DHCP?',
        a: '**D**iscover → **O**ffer → **R**equest → **A**cknowledge\n\n1. **Discover:** Client broadcasts "I need an IP!" (src: 0.0.0.0, dst: 255.255.255.255)\n2. **Offer:** Server offers an IP + mask + gateway + DNS\n3. **Request:** Client says "I\'ll take that one!" (broadcast so other DHCP servers know)\n4. **Acknowledge:** Server confirms the lease',
      },
      {
        q: 'What UDP ports does DHCP use?',
        a: '**Server: UDP 67** | **Client: UDP 68**\n\nDHCP uses UDP (not TCP) because the client doesn\'t have an IP yet, so it can\'t establish a TCP connection!',
      },
      {
        q: 'What info does DHCP provide besides an IP?',
        a: '- **Subnet Mask** (e.g., 255.255.255.0)\n- **Default Gateway** (router IP)\n- **DNS Server(s)**\n- **Lease Duration** (how long you keep the IP)\n- Optional: Domain name, NTP server, WINS server',
      },
    ],
  },
  {
    id: 'tcp-udp',
    title: 'TCP vs UDP & 3-Way Handshake',
    emoji: '🤝',
    color: '#FBE4E4',
    cards: [
      {
        q: 'TCP vs UDP — key differences?',
        a: '| | **TCP** | **UDP** |\n|---|---|---|\n| Connection | Connection-oriented | Connectionless |\n| Reliability | Guaranteed delivery | Best-effort |\n| Ordering | In-order delivery | No ordering |\n| Speed | Slower (overhead) | Faster |\n| Use cases | HTTP, SSH, FTP, Email | DNS, DHCP, Streaming, Gaming |',
      },
      {
        q: 'Explain the TCP 3-Way Handshake',
        a: '1. **SYN →** Client sends SYN (seq=x) to initiate\n2. **← SYN-ACK** Server responds with SYN-ACK (seq=y, ack=x+1)\n3. **ACK →** Client sends ACK (ack=y+1)\n\nConnection is now **ESTABLISHED**. Data can flow both ways.\n\nTo close: FIN → ACK → FIN → ACK (4-way teardown)',
      },
      {
        q: 'Why does DNS use UDP?',
        a: 'DNS queries are tiny (usually < 512 bytes) and need to be FAST. UDP avoids the overhead of the 3-way handshake. If a response is lost, the client simply re-asks. For large responses (zone transfers), DNS switches to TCP.',
      },
    ],
  },
  {
    id: 'dns-icmp',
    title: 'DNS & ICMP (Ping/Traceroute)',
    emoji: '🔍',
    color: '#E8F0FE',
    cards: [
      {
        q: 'How does DNS resolve a domain name?',
        a: '1. Browser checks **local cache** → hosts file\n2. Asks **Recursive DNS Resolver** (usually ISP or 8.8.8.8)\n3. Resolver asks **Root Server** (.) → gets TLD server\n4. Asks **TLD Server** (.com) → gets authoritative server\n5. Asks **Authoritative Server** (example.com) → gets IP\n6. IP cached at each level for the TTL duration',
      },
      {
        q: 'How does `ping` work?',
        a: '`ping` sends **ICMP Echo Request** packets to a target. The target replies with **ICMP Echo Reply**. Ping measures:\n- **RTT** (Round-Trip Time)\n- **Packet loss** percentage\n\nICMP is Layer 3 — no ports, no TCP/UDP!',
      },
      {
        q: 'How does `traceroute` work?',
        a: 'Traceroute sends packets with **incrementing TTL**:\n- TTL=1 → first router decrements to 0, sends back **ICMP Time Exceeded** (reveals its IP!)\n- TTL=2 → passes first router, second router sends ICMP back\n- TTL=3 → third router...\n\nThis maps every hop between you and the destination!',
      },
    ],
  },
];

// ──────────────────────── SUBNET REFERENCE TABLE ─────────────────────────────

export const subnetReferenceTable = [
  { cidr: 32, mask: '255.255.255.255', hosts: 1,         usable: 1,         block: 1 },
  { cidr: 31, mask: '255.255.255.254', hosts: 2,         usable: 2,         block: 2 },
  { cidr: 30, mask: '255.255.255.252', hosts: 4,         usable: 2,         block: 4 },
  { cidr: 29, mask: '255.255.255.248', hosts: 8,         usable: 6,         block: 8 },
  { cidr: 28, mask: '255.255.255.240', hosts: 16,        usable: 14,        block: 16 },
  { cidr: 27, mask: '255.255.255.224', hosts: 32,        usable: 30,        block: 32 },
  { cidr: 26, mask: '255.255.255.192', hosts: 64,        usable: 62,        block: 64 },
  { cidr: 25, mask: '255.255.255.128', hosts: 128,       usable: 126,       block: 128 },
  { cidr: 24, mask: '255.255.255.0',   hosts: 256,       usable: 254,       block: 256 },
  { cidr: 23, mask: '255.255.254.0',   hosts: 512,       usable: 510,       block: 2 },
  { cidr: 22, mask: '255.255.252.0',   hosts: 1024,      usable: 1022,      block: 4 },
  { cidr: 21, mask: '255.255.248.0',   hosts: 2048,      usable: 2046,      block: 8 },
  { cidr: 20, mask: '255.255.240.0',   hosts: 4096,      usable: 4094,      block: 16 },
  { cidr: 19, mask: '255.255.224.0',   hosts: 8192,      usable: 8190,      block: 32 },
  { cidr: 18, mask: '255.255.192.0',   hosts: 16384,     usable: 16382,     block: 64 },
  { cidr: 17, mask: '255.255.128.0',   hosts: 32768,     usable: 32766,     block: 128 },
  { cidr: 16, mask: '255.255.0.0',     hosts: 65536,     usable: 65534,     block: 256 },
  { cidr: 8,  mask: '255.0.0.0',       hosts: 16777216,  usable: 16777214,  block: 256 },
];

export const powerOfTwoChart = [
  { bit: 7, value: 128 },
  { bit: 6, value: 64 },
  { bit: 5, value: 32 },
  { bit: 4, value: 16 },
  { bit: 3, value: 8 },
  { bit: 2, value: 4 },
  { bit: 1, value: 2 },
  { bit: 0, value: 1 },
];

export const bcCheatSheet = [
  { command: '256 - 192', description: 'Magic Number for /26 mask', result: '64' },
  { command: '256 - 240', description: 'Magic Number for /28 mask', result: '16' },
  { command: '256 - 252', description: 'Magic Number for /30 mask', result: '4' },
  { command: 'obase=2; 192', description: 'Convert 192 to binary', result: '11000000' },
  { command: 'obase=2; 255', description: 'Convert 255 to binary', result: '11111111' },
  { command: 'ibase=2; 11000000', description: 'Binary to decimal', result: '192' },
  { command: '2^8 - 2', description: 'Usable hosts for /24', result: '254' },
  { command: '2^6 - 2', description: 'Usable hosts for /26', result: '62' },
  { command: '2^2 - 2', description: 'Usable hosts for /30', result: '2' },
  { command: '2^32', description: 'Total IPv4 addresses', result: '4294967296' },
];

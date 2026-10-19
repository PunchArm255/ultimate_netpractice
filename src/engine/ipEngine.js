/* ─────────────────────────────────────────────────────────────────────────────
 *  ipEngine.js – Complete 32-bit Bitwise IPv4, CIDR, VLSM & Routing Engine
 *  for Ultimate NetPractice.
 *
 *  Every public function is a REAL bitwise implementation — no shortcuts.
 * ───────────────────────────────────────────────────────────────────────────── */

// ──────────────────────────────── CONVERSIONS ────────────────────────────────

/** Parse "A.B.C.D" → 32-bit unsigned integer (using >>> 0) */
export function ipToInt(ip) {
  const parts = ip.trim().split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255))
    return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/** 32-bit unsigned integer → "A.B.C.D" */
export function intToIp(n) {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.');
}

/** "A.B.C.D" → array of 4 binary-octet strings (8 chars each, zero-padded) */
export function ipToBinaryOctets(ip) {
  const n = ipToInt(ip);
  if (n === null) return null;
  return [
    ((n >>> 24) & 0xff).toString(2).padStart(8, '0'),
    ((n >>> 16) & 0xff).toString(2).padStart(8, '0'),
    ((n >>> 8) & 0xff).toString(2).padStart(8, '0'),
    (n & 0xff).toString(2).padStart(8, '0'),
  ];
}

/** Full 32-char binary string → "A.B.C.D" */
export function binaryStringToIp(bin) {
  if (bin.length !== 32) return null;
  return [
    parseInt(bin.slice(0, 8), 2),
    parseInt(bin.slice(8, 16), 2),
    parseInt(bin.slice(16, 24), 2),
    parseInt(bin.slice(24, 32), 2),
  ].join('.');
}

// ────────────────────────────── SUBNET MASKS ─────────────────────────────────

/** CIDR prefix length (/0 … /32) → 32-bit mask integer */
export function cidrToMaskInt(cidr) {
  if (cidr < 0 || cidr > 32) return null;
  return cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
}

/** CIDR → dotted-decimal mask string */
export function cidrToMask(cidr) {
  const m = cidrToMaskInt(cidr);
  return m === null ? null : intToIp(m);
}

/** Dotted-decimal mask → CIDR prefix length. Returns null if invalid mask. */
export function maskToCidr(mask) {
  const n = ipToInt(mask);
  if (n === null) return null;
  // Verify continuous 1s then continuous 0s
  const inv = (~n) >>> 0;
  if (((inv + 1) & inv) !== 0) return null; // not a valid mask
  let cidr = 0;
  let tmp = n;
  for (let i = 31; i >= 0; i--) {
    if ((tmp >>> i) & 1) cidr++;
    else break;
  }
  return cidr;
}

/** Validate that a string is a valid subnet mask (continuous 1s then 0s) */
export function isValidMask(mask) {
  return maskToCidr(mask) !== null;
}

/** Get the "interesting octet" index (0-3) — the octet where the boundary falls */
export function interestingOctetIndex(cidr) {
  if (cidr <= 8) return 0;
  if (cidr <= 16) return 1;
  if (cidr <= 24) return 2;
  return 3;
}

/** Magic Number = 256 - interesting_octet_value */
export function magicNumber(cidr) {
  const maskStr = cidrToMask(cidr);
  const octets = maskStr.split('.').map(Number);
  const idx = interestingOctetIndex(cidr);
  return 256 - octets[idx];
}

// ────────────────────────────── SUBNET MATH ──────────────────────────────────

/**
 * Full subnet calculation from IP + CIDR.
 * Returns an object with every field needed for teaching and validation.
 */
export function subnetCalc(ip, cidr) {
  const ipInt = ipToInt(ip);
  if (ipInt === null || cidr < 0 || cidr > 32) return null;

  const maskInt = cidrToMaskInt(cidr);
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
  const totalIps = Math.pow(2, 32 - cidr);
  const usableHosts = totalIps > 2 ? totalIps - 2 : 0;
  const firstUsable = totalIps > 2 ? networkInt + 1 : networkInt;
  const lastUsable = totalIps > 2 ? broadcastInt - 1 : broadcastInt;
  const idx = interestingOctetIndex(cidr);
  const maskOctets = intToIp(maskInt).split('.').map(Number);
  const magic = 256 - maskOctets[idx];

  return {
    ip,
    cidr,
    mask: intToIp(maskInt),
    maskInt,
    networkIp: intToIp(networkInt),
    networkInt,
    broadcastIp: intToIp(broadcastInt),
    broadcastInt,
    firstUsable: intToIp(firstUsable),
    firstUsableInt: firstUsable,
    lastUsable: intToIp(lastUsable),
    lastUsableInt: lastUsable,
    totalIps,
    usableHosts,
    interestingOctet: idx,
    magicNumber: magic,
    binaryOctets: ipToBinaryOctets(ip),
    networkBinaryOctets: ipToBinaryOctets(intToIp(networkInt)),
  };
}

// ────────────────────────── VALIDATION HELPERS ───────────────────────────────

/** Check if dotted-decimal string is a syntactically valid IPv4 */
export function isValidIp(ip) {
  return ipToInt(ip) !== null;
}

/** Check if ip is the network address for the given cidr */
export function isNetworkAddress(ip, cidr) {
  const n = ipToInt(ip);
  const maskInt = cidrToMaskInt(cidr);
  return n !== null && (n & maskInt) >>> 0 === n;
}

/** Check if ip is the broadcast address for the given cidr */
export function isBroadcastAddress(ip, cidr) {
  const n = ipToInt(ip);
  const maskInt = cidrToMaskInt(cidr);
  if (n === null) return false;
  const net = (n & maskInt) >>> 0;
  const bcast = (net | (~maskInt >>> 0)) >>> 0;
  return n === bcast;
}

/** Check if two IPs share the same network (same CIDR) */
export function sameNetwork(ip1, ip2, cidr) {
  const a = ipToInt(ip1);
  const b = ipToInt(ip2);
  const m = cidrToMaskInt(cidr);
  if (a === null || b === null || m === null) return false;
  return ((a & m) >>> 0) === ((b & m) >>> 0);
}

/** Check if two subnets overlap: (netA <= bcastB) && (netB <= bcastA) */
export function subnetsOverlap(ip1, cidr1, ip2, cidr2) {
  const s1 = subnetCalc(ip1, cidr1);
  const s2 = subnetCalc(ip2, cidr2);
  if (!s1 || !s2) return false;
  return s1.networkInt <= s2.broadcastInt && s2.networkInt <= s1.broadcastInt;
}

// ──────────────────── PLAIN-ENGLISH DIAGNOSTIC TUTOR ─────────────────────────

/**
 * Validate a single interface IP + mask.
 * Returns null if valid, or { errorTitle, theoryWhy, howToFix }.
 */
export function diagnoseInterface(ifaceName, ip, cidr) {
  if (!isValidIp(ip)) {
    return {
      errorTitle: `${ifaceName}: "${ip}" is not a valid IPv4 address!`,
      theoryWhy: 'An IPv4 address must be four decimal numbers (0-255) separated by dots, like 192.168.1.10.',
      howToFix: 'Check each octet and make sure it is a number between 0 and 255 with no extra characters.',
    };
  }
  if (cidr === null || cidr === undefined || cidr < 0 || cidr > 32) {
    return {
      errorTitle: `${ifaceName}: Invalid subnet mask or CIDR!`,
      theoryWhy: 'A subnet mask must be a contiguous block of 1-bits followed by 0-bits. Valid CIDRs range from /0 to /32.',
      howToFix: 'Use a standard mask like 255.255.255.0 (/24), 255.255.255.128 (/25), 255.255.255.192 (/26), etc.',
    };
  }

  const calc = subnetCalc(ip, cidr);
  if (!calc) return null;

  // Network address check
  if (isNetworkAddress(ip, cidr) && cidr < 31) {
    const mask = cidrToMask(cidr);
    const maskOctets = mask.split('.').map(Number);
    const idx = interestingOctetIndex(cidr);
    const block = 256 - maskOctets[idx];
    return {
      errorTitle: `${ifaceName}: ${ip} is the Reserved Network Address!`,
      theoryWhy: `With mask ${mask} (/${cidr}), the block size is 256 − ${maskOctets[idx]} = ${block}. ` +
        `The network address ${calc.networkIp} has all host bits set to 0 — it identifies the "street name" of the subnet and cannot be assigned to any host.`,
      howToFix: `Pick any usable IP between ${calc.firstUsable} and ${calc.lastUsable}.`,
    };
  }

  // Broadcast address check
  if (isBroadcastAddress(ip, cidr) && cidr < 31) {
    const mask = cidrToMask(cidr);
    const maskOctets = mask.split('.').map(Number);
    const idx = interestingOctetIndex(cidr);
    const block = 256 - maskOctets[idx];
    return {
      errorTitle: `${ifaceName}: ${ip} is the Reserved Broadcast Address!`,
      theoryWhy: `With mask ${mask} (/${cidr}), the block size is ${block}. ` +
        `The broadcast address ${calc.broadcastIp} has all host bits set to 1 — it sends data to ALL hosts on the subnet and cannot be assigned to any device.`,
      howToFix: `Pick any usable IP between ${calc.firstUsable} and ${calc.lastUsable}.`,
    };
  }

  return null;
}

/**
 * Validate that two interfaces on the same link share the same subnet.
 * Returns null if valid, or a diagnostic object.
 */
export function diagnoseSameLink(iface1, ip1, cidr1, iface2, ip2, cidr2) {
  // Different masks
  if (cidr1 !== cidr2) {
    return {
      errorTitle: `Subnet Mask Mismatch: ${iface1} (/${cidr1}) ≠ ${iface2} (/${cidr2})!`,
      theoryWhy: 'All devices on the same physical link (cable or switch) MUST use the exact same subnet mask. Different masks mean they calculate different network boundaries and cannot communicate.',
      howToFix: `Set both ${iface1} and ${iface2} to the same mask, e.g., /${cidr1} (${cidrToMask(cidr1)}).`,
    };
  }

  // Different networks
  if (!sameNetwork(ip1, ip2, cidr1)) {
    const s1 = subnetCalc(ip1, cidr1);
    const s2 = subnetCalc(ip2, cidr2);
    return {
      errorTitle: `${iface1} and ${iface2} are on different subnets!`,
      theoryWhy: `${iface1} (${ip1}) is in network ${s1.networkIp}/${cidr1} (range ${s1.firstUsable}–${s1.lastUsable}), ` +
        `but ${iface2} (${ip2}) is in network ${s2.networkIp}/${cidr2} (range ${s2.firstUsable}–${s2.lastUsable}). ` +
        'Devices on the same cable or switch must be in the same subnet to communicate at Layer 2.',
      howToFix: `Move ${iface2}'s IP into the ${s1.networkIp}/${cidr1} range (${s1.firstUsable} – ${s1.lastUsable}), or vice versa.`,
    };
  }

  // Duplicate IPs
  if (ipToInt(ip1) === ipToInt(ip2)) {
    const s1 = subnetCalc(ip1, cidr1);
    return {
      errorTitle: `Duplicate IP! ${iface1} and ${iface2} both use ${ip1}!`,
      theoryWhy: 'Every interface on a network must have a unique IP address. Duplicates cause packet delivery chaos because the switch cannot tell which device should receive the traffic.',
      howToFix: `Change one of them to another usable IP in ${s1.networkIp}/${cidr1} (${s1.firstUsable} – ${s1.lastUsable}).`,
    };
  }

  return null;
}

/**
 * Validate that two interfaces on the SAME ROUTER do NOT overlap.
 */
export function diagnoseRouterOverlap(routerName, iface1, ip1, cidr1, iface2, ip2, cidr2) {
  if (subnetsOverlap(ip1, cidr1, ip2, cidr2)) {
    const s1 = subnetCalc(ip1, cidr1);
    const s2 = subnetCalc(ip2, cidr2);
    return {
      errorTitle: `${routerName} Overlap Error: ${iface1} and ${iface2} subnets collide!`,
      theoryWhy: `${iface1} covers ${s1.networkIp}/${cidr1} (${s1.networkIp} – ${s1.broadcastIp}), and ` +
        `${iface2} covers ${s2.networkIp}/${cidr2} (${s2.networkIp} – ${s2.broadcastIp}). ` +
        'These ranges overlap! A router cannot have two interfaces on overlapping subnets because it would not know which interface to forward packets through.',
      howToFix: `Use non-overlapping blocks. For example, split the address space: ${s1.networkIp}/${cidr1} on one side and a different block on the other. Consider VLSM to carve out tighter subnets.`,
    };
  }
  return null;
}

/**
 * Validate a routing table entry's next-hop.
 * The next-hop must be directly reachable on the device's local interface subnet,
 * and must actually be assigned to the facing router interface.
 */
export function diagnoseNextHop(deviceName, routeLabel, nextHop, localIp, localCidr, facingIp) {
  if (!isValidIp(nextHop)) {
    return {
      errorTitle: `${deviceName}: Next-hop "${nextHop}" is not a valid IP!`,
      theoryWhy: 'A next-hop (gateway) IP must be a valid IPv4 address pointing to the router interface on your local subnet.',
      howToFix: 'Enter the IP of the router interface that faces this device on the same link.',
    };
  }

  // next-hop must be in the local subnet
  if (!sameNetwork(nextHop, localIp, localCidr)) {
    const s = subnetCalc(localIp, localCidr);
    return {
      errorTitle: `${deviceName} ${routeLabel}: Next-hop ${nextHop} is unreachable!`,
      theoryWhy: `The next-hop gateway MUST be an IP on the same subnet as ${deviceName}'s outgoing interface (${localIp}/${localCidr}, network ${s.networkIp}). ` +
        `${nextHop} is outside that range. Think of it like giving a letter to a mail carrier — the carrier must be standing on your street!`,
      howToFix: `Set the next-hop to the router's interface IP on subnet ${s.networkIp}/${localCidr} (${s.firstUsable} – ${s.lastUsable}).`,
    };
  }

  // next-hop should match the facing router interface
  if (facingIp && ipToInt(nextHop) !== ipToInt(facingIp)) {
    return {
      errorTitle: `${deviceName} ${routeLabel}: Next-hop ${nextHop} doesn't match the router's interface!`,
      theoryWhy: `The next-hop should point to the actual IP of the router's interface on this link, which is ${facingIp}. ` +
        'While any reachable IP might technically work, in NetPractice the next-hop must exactly match the facing router port.',
      howToFix: `Set the next-hop to ${facingIp}.`,
    };
  }

  return null;
}

/**
 * VLSM waste check: flag overly-broad masks that waste address space.
 */
export function diagnoseVlsmWaste(ifaceName, cidr, neededHosts, context) {
  const usable = Math.pow(2, 32 - cidr) - 2;
  if (usable > neededHosts * 4 && cidr < 30) {
    const optimalBits = Math.ceil(Math.log2(neededHosts + 2));
    const optimalCidr = 32 - optimalBits;
    return {
      errorTitle: `${ifaceName}: /${cidr} is wastefully large for ${context || 'this link'}!`,
      theoryWhy: `A /${cidr} mask provides ${usable} usable hosts, but you only need ${neededHosts}. ` +
        `The wasted IPs will collide with neighboring subnets. With VLSM, you can carve tighter blocks to avoid overlap.`,
      howToFix: `Consider using /${optimalCidr} (${cidrToMask(optimalCidr)}) which provides exactly ${Math.pow(2, 32 - optimalCidr) - 2} usable hosts.`,
    };
  }
  return null;
}

// ──────────────────────── FULL LEVEL VALIDATOR ────────────────────────────────

/**
 * Validate an entire level topology given the current user answers.
 * `topology` = level definition from levelsData.js
 * `answers`  = { [fieldId]: value }
 *
 * Returns { valid: bool, errors: [...diagnostics], packetPath: [...nodes] }
 */
export function validateLevel(topology, answers) {
  const errors = [];
  const resolvedFields = {};

  // Merge fixed values with user answers
  for (const field of topology.fields) {
    const val = field.editable
      ? (answers[field.id] !== undefined ? answers[field.id] : '')
      : field.value;
    resolvedFields[field.id] = typeof val === 'string' ? val.trim() : val;
  }

  // 0. Verify no required fields are empty
  for (const field of topology.fields) {
    const val = resolvedFields[field.id];
    if (val === undefined || val === null || val === '') {
      errors.push({
        fieldId: field.id,
        errorTitle: `Empty Field: ${field.label}`,
        theoryWhy: `Every interface and routing field in NetPractice must be assigned a valid configuration before the network can communicate. Leaving "${field.label}" empty means the device does not have an active IP address or route to communicate.`,
        howToFix: `Enter a valid ${field.id.includes('mask') ? 'subnet mask (e.g. 255.255.255.0)' : 'IP address (e.g. 192.168.1.1)'} for ${field.label}.`,
      });
    }
  }

  // 1. Format check for each non-empty field
  for (const field of topology.fields) {
    const val = resolvedFields[field.id];
    if (!val) continue;
    const str = val.toString().trim();
    if (field.id.includes('mask')) {
      if (maskToCidr(str) === null) {
        errors.push({
          fieldId: field.id,
          errorTitle: `Invalid Subnet Mask: "${str}" for ${field.label}`,
          theoryWhy: `A subnet mask must be contiguous 1-bits followed by 0-bits (e.g. 255.255.255.0, 255.255.255.192, 255.255.255.252).`,
          howToFix: `Check the required prefix length and use standard dotted-decimal notation.`,
        });
      }
    } else {
      if (!isValidIp(str)) {
        errors.push({
          fieldId: field.id,
          errorTitle: `Invalid IPv4 Address: "${str}" for ${field.label}`,
          theoryWhy: `An IPv4 address consists of 4 decimal octets separated by dots (0–255), like 192.168.1.10.`,
          howToFix: `Correct the address syntax for ${field.label}.`,
        });
      }
    }
  }

  // 2. Validate each interface IP + mask
  for (const iface of topology.interfaces || []) {
    const ip = resolvedFields[iface.ipField];
    const maskVal = resolvedFields[iface.maskField];
    if (!ip || !maskVal) continue;

    let cidr;
    if (typeof maskVal === 'string' && maskVal.includes('.')) {
      cidr = maskToCidr(maskVal);
    } else {
      cidr = parseInt(maskVal, 10);
    }
    if (cidr === null || isNaN(cidr)) continue;

    const diag = diagnoseInterface(iface.label, ip, cidr);
    if (diag) errors.push({ ...diag, fieldId: iface.ipField });
  }

  // 3. Validate same-link peers (ignoring switch pseudo-links or identical ifaces)
  for (const link of topology.links || []) {
    if (!link.iface1?.ipField || !link.iface2?.ipField) continue;
    if (link.iface1.ipField === link.iface2.ipField) continue;

    const ip1 = resolvedFields[link.iface1.ipField];
    const ip2 = resolvedFields[link.iface2.ipField];
    const m1 = resolvedFields[link.iface1.maskField];
    const m2 = resolvedFields[link.iface2.maskField];
    if (!ip1 || !ip2 || !m1 || !m2) continue;

    const c1 = typeof m1 === 'string' && m1.includes('.') ? maskToCidr(m1) : parseInt(m1, 10);
    const c2 = typeof m2 === 'string' && m2.includes('.') ? maskToCidr(m2) : parseInt(m2, 10);
    if (c1 === null || c2 === null || isNaN(c1) || isNaN(c2)) continue;

    const diag = diagnoseSameLink(link.iface1.label, ip1, c1, link.iface2.label, ip2, c2);
    if (diag) errors.push({ ...diag, fieldId: link.iface2.ipField });
  }

  // 4. Validate router interface non-overlap
  for (const router of topology.routers || []) {
    if (router.interfaces.length >= 2) {
      for (let i = 0; i < router.interfaces.length; i++) {
        for (let j = i + 1; j < router.interfaces.length; j++) {
          const a = router.interfaces[i];
          const b = router.interfaces[j];
          const ipA = resolvedFields[a.ipField];
          const ipB = resolvedFields[b.ipField];
          const mA = resolvedFields[a.maskField];
          const mB = resolvedFields[b.maskField];
          if (!ipA || !ipB || !mA || !mB) continue;

          const cA = typeof mA === 'string' && mA.includes('.') ? maskToCidr(mA) : parseInt(mA, 10);
          const cB = typeof mB === 'string' && mB.includes('.') ? maskToCidr(mB) : parseInt(mB, 10);
          if (cA === null || cB === null || isNaN(cA) || isNaN(cB)) continue;

          const diag = diagnoseRouterOverlap(router.name, a.label, ipA, cA, b.label, ipB, cB);
          if (diag) errors.push(diag);
        }
      }
    }
  }

  // 5. Validate routing table next-hops
  for (const route of topology.routes || []) {
    const nextHop = resolvedFields[route.nextHopField];
    const localIp = resolvedFields[route.localIpField];
    const localMask = resolvedFields[route.localMaskField];
    if (!nextHop || !localIp || !localMask) continue;

    const localCidr = typeof localMask === 'string' && localMask.includes('.')
      ? maskToCidr(localMask) : parseInt(localMask, 10);
    if (localCidr === null || isNaN(localCidr)) continue;

    const facingIp = resolvedFields[route.facingIpField] || null;
    const diag = diagnoseNextHop(route.deviceName, route.label, nextHop, localIp, localCidr, facingIp);
    if (diag) errors.push({ ...diag, fieldId: route.nextHopField });
  }

  // 6. If no structural errors, verify end-to-end packet delivery
  if (errors.length === 0 && topology.packetTest) {
    const path = tracePacketPath(topology, answers, topology.packetTest.src, topology.packetTest.dst);
    const failStep = path.find((p) => p.status === 'fail');
    if (failStep) {
      errors.push({
        errorTitle: `Packet dropped at ${failStep.node}!`,
        theoryWhy: failStep.reason || `A packet sent from ${topology.packetTest.src} could not reach ${topology.packetTest.dst}.`,
        howToFix: `Verify that all routing table entries and default gateways are configured correctly.`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ────────────────────────── PACKET PATH TRACER ───────────────────────────────

/**
 * Trace a packet from source to destination through the topology.
 * Returns an array of { node, status: 'ok'|'fail', reason? }.
 */
export function tracePacketPath(topology, answers, srcNodeId, dstNodeId) {
  const resolvedFields = {};
  for (const field of topology.fields) {
    resolvedFields[field.id] = field.editable
      ? (answers[field.id] !== undefined ? answers[field.id] : '')
      : field.value;
  }

  const path = [];
  let currentNodeId = srcNodeId;
  const visited = new Set();

  for (let hop = 0; hop < 20; hop++) {
    if (visited.has(currentNodeId)) {
      path.push({ node: currentNodeId, status: 'fail', reason: 'Routing loop detected!' });
      break;
    }
    visited.add(currentNodeId);

    if (currentNodeId === dstNodeId) {
      path.push({ node: currentNodeId, status: 'ok' });
      break;
    }

    const node = topology.nodes.find((n) => n.id === currentNodeId);
    if (!node) {
      path.push({ node: currentNodeId, status: 'fail', reason: 'Node not found in topology' });
      break;
    }

    path.push({ node: currentNodeId, status: 'ok' });

    // Find where to go next
    const dstIp = (() => {
      const dstNode = topology.nodes.find((n) => n.id === dstNodeId);
      if (!dstNode || !dstNode.interfaces || !dstNode.interfaces[0]) return null;
      return resolvedFields[dstNode.interfaces[0].ipField];
    })();

    if (!dstIp) {
      path.push({ node: currentNodeId, status: 'fail', reason: 'Destination IP unknown' });
      break;
    }

    // Check if directly connected
    const directLink = topology.links.find((l) => {
      const isEndpoint = (l.iface1.nodeId === currentNodeId && l.iface2.nodeId === dstNodeId) ||
                         (l.iface2.nodeId === currentNodeId && l.iface1.nodeId === dstNodeId);
      return isEndpoint;
    });

    if (directLink) {
      // Check subnet compatibility
      const myIface = directLink.iface1.nodeId === currentNodeId ? directLink.iface1 : directLink.iface2;
      const theirIface = directLink.iface1.nodeId === currentNodeId ? directLink.iface2 : directLink.iface1;
      const myIp = resolvedFields[myIface.ipField];
      const theirIp = resolvedFields[theirIface.ipField];
      const myMask = resolvedFields[myIface.maskField];
      const myCidr = typeof myMask === 'string' && myMask.includes('.') ? maskToCidr(myMask) : parseInt(myMask, 10);

      if (myIp && theirIp && sameNetwork(myIp, theirIp, myCidr)) {
        currentNodeId = dstNodeId;
        continue;
      }
    }

    // Check routing table for next hop
    if (node.type === 'router' || node.routes) {
      const nodeRoutes = topology.routes?.filter((r) => r.nodeId === currentNodeId) || [];
      let nextNodeId = null;

      for (const route of nodeRoutes) {
        const nextHop = resolvedFields[route.nextHopField];
        if (!nextHop) continue;

        // Find which link this next-hop leads to
        for (const link of topology.links) {
          const myEnd = link.iface1.nodeId === currentNodeId ? link.iface1 :
                        link.iface2.nodeId === currentNodeId ? link.iface2 : null;
          const otherEnd = link.iface1.nodeId === currentNodeId ? link.iface2 :
                           link.iface2.nodeId === currentNodeId ? link.iface1 : null;
          if (!myEnd || !otherEnd) continue;

          const otherIp = resolvedFields[otherEnd.ipField];
          if (otherIp && ipToInt(otherIp) === ipToInt(nextHop)) {
            nextNodeId = otherEnd.nodeId;
            break;
          }
        }
        if (nextNodeId) break;
      }

      if (nextNodeId) {
        currentNodeId = nextNodeId;
        continue;
      } else {
        path.push({
          node: currentNodeId,
          status: 'fail',
          reason: `${node.label || currentNodeId} has no route to reach ${dstIp}. Check the routing table!`,
        });
        break;
      }
    } else {
      // Host: use default gateway
      const hostRoutes = topology.routes?.filter((r) => r.nodeId === currentNodeId) || [];
      let nextNodeId = null;

      for (const route of hostRoutes) {
        const nextHop = resolvedFields[route.nextHopField];
        if (!nextHop) continue;

        for (const link of topology.links) {
          const myEnd = link.iface1.nodeId === currentNodeId ? link.iface1 :
                        link.iface2.nodeId === currentNodeId ? link.iface2 : null;
          const otherEnd = link.iface1.nodeId === currentNodeId ? link.iface2 :
                           link.iface2.nodeId === currentNodeId ? link.iface1 : null;
          if (!myEnd || !otherEnd) continue;

          const otherIp = resolvedFields[otherEnd.ipField];
          if (otherIp && ipToInt(otherIp) === ipToInt(nextHop)) {
            nextNodeId = otherEnd.nodeId;
            break;
          }
        }
        if (nextNodeId) break;
      }

      if (nextNodeId) {
        currentNodeId = nextNodeId;
        continue;
      }

      // Maybe directly connected via switch?
      for (const link of topology.links) {
        const myEnd = link.iface1.nodeId === currentNodeId ? link.iface1 :
                      link.iface2.nodeId === currentNodeId ? link.iface2 : null;
        if (!myEnd) continue;
        const otherEnd = link.iface1.nodeId === currentNodeId ? link.iface2 : link.iface1;
        const otherNode = topology.nodes.find((n) => n.id === otherEnd.nodeId);
        if (otherNode && otherNode.type === 'switch') {
          // find destinations connected to this switch
          for (const link2 of topology.links) {
            if (link2 === link) continue;
            const switchEnd = link2.iface1.nodeId === otherEnd.nodeId ? link2.iface1 :
                              link2.iface2.nodeId === otherEnd.nodeId ? link2.iface2 : null;
            if (!switchEnd) continue;
            const farEnd = link2.iface1.nodeId === otherEnd.nodeId ? link2.iface2 : link2.iface1;
            if (farEnd.nodeId === dstNodeId) {
              nextNodeId = otherEnd.nodeId; // go to switch first
              break;
            }
          }
          if (nextNodeId) break;
        }
      }

      if (nextNodeId) {
        currentNodeId = nextNodeId;
        continue;
      }

      path.push({
        node: currentNodeId,
        status: 'fail',
        reason: `${node.label || currentNodeId} doesn't know how to reach ${dstIp}. Add a default route (0.0.0.0/0) pointing to the router's interface IP.`,
      });
      break;
    }
  }

  return path;
}

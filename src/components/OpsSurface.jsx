import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DOMAINS,
  WIFI_VENUES,
  WIFI_TECHNIQUES,
  EMAIL_VECTORS,
  BLE_TECHNIQUES,
  IOT_TECHNIQUES,
  SOCIAL_TECHNIQUES,
  ENTERPRISE_TECHNIQUES,
  groupByCategory
} from '../ops/catalog';

const FIRST = ['Ava', 'Noah', 'Mia', 'Liam', 'Zoe', 'Kai', 'Iris', 'Owen', 'Nina', 'Leo', 'Sara', 'Jude', 'Elena', 'Marco'];
const LAST = ['Brooks', 'Nguyen', 'Patel', 'Garcia', 'Kim', 'Rossi', 'Anders', 'Okoye', 'Silva', 'Walsh'];
const DEVICES = ['iPhone', 'Pixel', 'MacBook', 'Windows laptop', 'iPad', 'Chromebook'];

const sirenFlash = keyframes`
  0%, 100% { background: rgba(37, 99, 235, 0.28); box-shadow: inset 0 0 80px rgba(37, 99, 235, 0.45); }
  50% { background: rgba(220, 38, 38, 0.32); box-shadow: inset 0 0 80px rgba(220, 38, 38, 0.5); }
`;

const sirenFlashHard = keyframes`
  0%, 100% { background: rgba(37, 99, 235, 0.55); box-shadow: inset 0 0 120px rgba(37, 99, 235, 0.7); }
  50% { background: rgba(220, 38, 38, 0.6); box-shadow: inset 0 0 120px rgba(220, 38, 38, 0.75); }
`;

const Shell = styled.div`
  position: relative;
  max-width: 1040px;
  margin: 0 auto;
  padding: 20px 20px 48px;
  color: #d1d5db;
  font-size: 15px;
  line-height: 1.5;
`;

const SirenOverlay = styled(motion.div)`
  pointer-events: ${(p) => (p.$caught ? 'auto' : 'none')};
  position: fixed;
  inset: 0;
  z-index: 80;
  animation: ${(p) =>
    p.$caught
      ? css`${sirenFlashHard} 0.35s linear infinite`
      : css`${sirenFlash} 0.55s linear infinite`};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SirenCard = styled.div`
  pointer-events: auto;
  max-width: 420px;
  margin: 16px;
  padding: 22px 24px;
  border-radius: 12px;
  background: rgba(10, 10, 12, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.18);
  text-align: center;
  color: #f3f4f6;
`;

const SirenTitle = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const SirenCount = styled.div`
  font-size: 2.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin: 10px 0;
  color: #fca5a5;
`;

const HeatMeter = styled.div`
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid
    ${(p) =>
      p.$level === 'danger'
        ? 'rgba(248,113,113,0.45)'
        : p.$level === 'warn'
          ? 'rgba(251,191,36,0.4)'
          : 'rgba(255,255,255,0.1)'};
  background: rgba(0, 0, 0, 0.25);
`;

const HeatBarTrack = styled.div`
  height: 8px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-top: 8px;
`;

const HeatBarFill = styled.div`
  height: 100%;
  width: ${(p) => p.$pct}%;
  background: ${(p) =>
    p.$pct >= 72 ? '#ef4444' : p.$pct >= 45 ? '#f59e0b' : '#60a5fa'};
  transition: width 0.35s ease;
`;

const TopBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const Kicker = styled.div`
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 6px;
`;

const Heading = styled.h1`
  margin: 0 0 6px;
  font-size: 1.5rem;
  font-weight: 600;
  color: #f9fafb;
  letter-spacing: -0.02em;
`;

const Lead = styled.p`
  margin: 0;
  max-width: 42ch;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #9ca3af;
`;

const Note = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
`;

const Balance = styled.div`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.85rem;
  color: #9ca3af;
  white-space: nowrap;
  span {
    display: block;
    margin-top: 2px;
    font-size: 1.15rem;
    font-weight: 600;
    color: #f3f4f6;
  }
`;

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
`;

const Tab = styled.button`
  appearance: none;
  border: 1px solid ${(p) => (p.$active ? 'rgba(255,255,255,0.28)' : 'transparent')};
  background: ${(p) => (p.$active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)')};
  color: ${(p) => (p.$active ? '#f9fafb' : '#9ca3af')};
  font-size: 0.84rem;
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  padding: 9px 14px;
  border-radius: 999px;
  cursor: pointer;
  &:hover {
    color: #f3f4f6;
  }
`;

const Guide = styled.div`
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(147, 197, 253, 0.2);
  background: rgba(59, 130, 246, 0.08);
  color: #bfdbfe;
  font-size: 0.9rem;
  line-height: 1.45;
  strong {
    color: #eff6ff;
  }
`;

const DomainRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
  margin-bottom: 20px;
`;

const DomainBtn = styled.button`
  appearance: none;
  text-align: left;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.$active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)')};
  background: ${(p) => (p.$active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)')};
  color: inherit;
  cursor: pointer;
`;

const DomainName = styled.div`
  font-size: 0.95rem;
  color: #f3f4f6;
  margin-bottom: 4px;
  font-weight: 560;
`;

const DomainMeta = styled.div`
  font-size: 0.84rem;
  color: #9ca3af;
  line-height: 1.45;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px 18px;
  background: rgba(17, 24, 39, 0.55);
`;

const PanelTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #f3f4f6;
  letter-spacing: -0.01em;
`;

const CatTitle = styled.div`
  margin: 14px 0 8px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9ca3af;
  &:first-child {
    margin-top: 0;
  }
`;

const Tech = styled.button`
  appearance: none;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  margin-bottom: 8px;
  border-radius: 10px;
  border: 1px solid
    ${(p) =>
      p.$done
        ? 'rgba(134,239,172,0.3)'
        : p.$ready
          ? 'rgba(147,197,253,0.35)'
          : p.$locked
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(255,255,255,0.08)'};
  background: ${(p) =>
    p.$done
      ? 'rgba(134,239,172,0.07)'
      : p.$ready
        ? 'rgba(59,130,246,0.1)'
        : 'rgba(255,255,255,0.02)'};
  color: ${(p) => (p.$locked ? '#6b7280' : '#e5e7eb')};
  cursor: ${(p) => (p.$locked || p.$busy ? 'not-allowed' : 'pointer')};
`;

const TechName = styled.div`
  font-size: 0.92rem;
  color: inherit;
  margin-bottom: 4px;
  font-weight: 560;
`;

const TechDetail = styled.div`
  font-size: 0.82rem;
  color: #9ca3af;
  line-height: 1.45;
`;

const TechNeed = styled.div`
  font-size: 0.78rem;
  color: #fbbf24;
  margin-top: 6px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.9rem;
  &:last-child {
    border-bottom: none;
  }
`;

const Tag = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${(p) => p.$color || '#d1d5db'};
  background: ${(p) => p.$bg || 'rgba(255,255,255,0.06)'};
  border: 1px solid ${(p) => p.$border || 'rgba(255,255,255,0.1)'};
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
`;

const FlagStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const Flag = styled.span`
  font-size: 0.72rem;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid ${(p) => (p.$on ? 'rgba(134,239,172,0.35)' : 'rgba(255,255,255,0.08)')};
  color: ${(p) => (p.$on ? '#86efac' : '#6b7280')};
  background: ${(p) => (p.$on ? 'rgba(134,239,172,0.08)' : 'transparent')};
`;

const Log = styled.div`
  margin-top: 4px;
  max-height: 240px;
  overflow-y: auto;
  font-size: 0.84rem;
  line-height: 1.55;
  color: #9ca3af;
`;

const LogLine = styled.div`
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: ${(p) => p.$tone || '#9ca3af'};
  &:last-child {
    border-bottom: none;
  }
  time {
    display: inline-block;
    min-width: 72px;
    color: #6b7280;
    margin-right: 8px;
    font-variant-numeric: tabular-nums;
  }
`;

const Primary = styled.button`
  appearance: none;
  border: none;
  background: #f3f4f6;
  color: #111827;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 11px 16px;
  border-radius: 9px;
  cursor: pointer;
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const Ghost = styled.button`
  appearance: none;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: #e5e7eb;
  font-size: 0.88rem;
  padding: 11px 14px;
  border-radius: 9px;
  cursor: pointer;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;

const VenueGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CardBtn = styled.button`
  appearance: none;
  text-align: left;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.$active ? 'rgba(147,197,253,0.45)' : 'rgba(255,255,255,0.08)')};
  background: ${(p) => (p.$active ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)')};
  color: inherit;
  cursor: pointer;
  &:hover {
    border-color: rgba(255, 255, 255, 0.16);
  }
`;

const CaptureGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 6px 12px;
  margin: 8px 0 4px;
  font-size: 0.88rem;
  dt {
    color: #6b7280;
  }
  dd {
    margin: 0;
    color: #e5e7eb;
    word-break: break-word;
  }
`;

const StepList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const StepItem = styled.li`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: ${(p) => (p.$active ? '#f9fafb' : p.$done ? '#86efac' : '#6b7280')};
  font-size: 0.9rem;
  &:last-child {
    border-bottom: none;
  }
`;

const StepNum = styled.span`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${(p) =>
    p.$done ? 'rgba(134,239,172,0.2)' : p.$active ? 'rgba(147,197,253,0.25)' : 'rgba(255,255,255,0.06)'};
  color: inherit;
`;

function statusStyle(status) {
  switch (status) {
    case 'clicked':
      return { color: '#86efac', bg: 'rgba(134,239,172,0.12)', border: 'rgba(134,239,172,0.3)' };
    case 'opened':
      return { color: '#93c5fd', bg: 'rgba(147,197,253,0.12)', border: 'rgba(147,197,253,0.3)' };
    case 'exploited':
      return { color: '#fca5a5', bg: 'rgba(252,165,165,0.12)', border: 'rgba(252,165,165,0.3)' };
    case 'deleted':
    case 'ignored':
      return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' };
    default:
      return { color: '#d1d5db', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' };
  }
}

function rand(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeClient(venue) {
  const awareness = rand(15, 90);
  return {
    id: `c-${Math.random().toString(36).slice(2, 8)}`,
    name: `${pick(FIRST)} ${pick(LAST)}`,
    device: pick(DEVICES),
    awareness,
    soft: awareness < 45,
    oui: `Apple/Google/Samsung`.split('/')[rand(0, 2)],
    probing: pick(['HomeWifi', 'Hotel_Guest', 'CafeFreeNet', 'iPhone']),
    ports: [],
    status: 'associated'
  };
}

function emptyFlags() {
  return {};
}

function canRun(tech, flags, venue) {
  if (tech.blocksIf?.some((f) => flags[f])) {
    return { ok: false, reason: `Blocked by ${tech.blocksIf.find((f) => flags[f])}` };
  }
  if (tech.requiresEnc && venue && !venue.encMix.includes(tech.requiresEnc)) {
    return { ok: false, reason: `Needs ${tech.requiresEnc} on this venue` };
  }
  const missing = (tech.needs || []).filter((n) => !flags[n]);
  if (missing.length) return { ok: false, reason: `Needs: ${missing.join(', ')}` };
  return { ok: true };
}

function TechniqueList({ techniques, flags, venue, doneIds, busy, onRun }) {
  const groups = groupByCategory(techniques);
  return (
    <div>
      {groups.map(([cat, list]) => (
        <div key={cat}>
          <CatTitle>{cat}</CatTitle>
          {list.map((tech) => {
            const check = canRun(tech, flags, venue);
            const done = doneIds.has(tech.id);
            const ready = check.ok && !done;
            return (
              <Tech
                key={tech.id}
                type="button"
                $locked={!check.ok && !done}
                $done={done}
                $ready={ready}
                $busy={busy}
                disabled={busy || (!check.ok && !done)}
                onClick={() => check.ok && !done && onRun(tech)}
              >
                <TechName>
                  {done ? 'Done · ' : ready ? 'Ready · ' : 'Locked · '}
                  {tech.name}
                  <span style={{ float: 'right', color: '#9ca3af', fontSize: '0.82rem' }}>
                    +${tech.payout}
                  </span>
                </TechName>
                <TechDetail>{tech.detail}</TechDetail>
                {!check.ok && !done && <TechNeed>{check.reason}</TechNeed>}
              </Tech>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SimpleDomainLab({ techniques, title, onEarn, pushLog, addHeat }) {
  const [flags, setFlags] = useState({});
  const [doneIds, setDoneIds] = useState(() => new Set());
  const [busy, setBusy] = useState(false);

  const run = (tech) => {
    const check = canRun(tech, flags, null);
    if (!check.ok) return;
    setBusy(true);
    pushLog(`Running ${tech.name}…`);
    setTimeout(() => {
      setFlags((f) => {
        const next = { ...f };
        (tech.gives || []).forEach((g) => {
          next[g] = true;
        });
        return next;
      });
      setDoneIds((d) => new Set([...d, tech.id]));
      pushLog(`${tech.name} complete (+$${tech.payout})`);
      onEarn?.(tech.payout, { title: tech.name, note: tech.detail });
      addHeat?.(8);
      setBusy(false);
    }, 900);
  };

  return (
    <Panel>
      <PanelTitle>{title}</PanelTitle>
      <TechniqueList
        techniques={techniques.map((t) => ({ ...t, category: t.category || 'Playbook', seconds: 1 }))}
        flags={flags}
        venue={null}
        doneIds={doneIds}
        busy={busy}
        onRun={run}
      />
    </Panel>
  );
}

function WifiLab({ onEarn, money, pushLog, log, addHeat, heat }) {
  const [venueId, setVenueId] = useState(null);
  const [flags, setFlags] = useState(emptyFlags);
  const [doneIds, setDoneIds] = useState(() => new Set());
  const [clients, setClients] = useState([]);
  const [busy, setBusy] = useState(false);
  const timers = useRef([]);

  const venue = useMemo(() => WIFI_VENUES.find((v) => v.id === venueId) || null, [venueId]);
  const grouped = useMemo(() => groupByCategory(WIFI_TECHNIQUES), []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const enterVenue = (id) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const v = WIFI_VENUES.find((x) => x.id === id);
    setVenueId(id);
    setFlags({});
    setDoneIds(new Set());
    setClients(Array.from({ length: rand(5, 8) }, () => makeClient(v)));
    pushLog(`Entered ${v.name} @ ${v.place}. Encryption mix: ${v.encMix.join(', ')}.`);
  };

  const runTech = (tech) => {
    if (!venue) return;
    const check = canRun(tech, flags, venue);
    if (!check.ok) {
      pushLog(check.reason, '#b45309');
      return;
    }
    setBusy(true);
    pushLog(`exec ${tech.name}…`);
    const t = setTimeout(() => {
      const nextFlags = { ...flags };
      (tech.gives || []).forEach((g) => {
        nextFlags[g] = true;
      });
      // passive-only mutually exclusive with active work: if running active, clear passiveOnly unless tech is passive_only
      if (tech.risk !== 'stealth' && tech.id !== 'passive_only') {
        // keep passiveOnly if set — blocksIf already prevented run
      }
      if (tech.id === 'passive_only') {
        nextFlags.passiveOnly = true;
      }
      if (tech.id === 'profile') {
        setClients((cs) =>
          cs.map((c) => ({
            ...c,
            profiled: true,
            soft: c.awareness < 45 + (venue.softBias > 0.5 ? 5 : 0)
          }))
        );
      }
      if (tech.id === 'nmap') {
        setClients((cs) =>
          cs.map((c) => ({
            ...c,
            ports: c.soft ? ['445', '139', '80'] : ['443', '5353']
          }))
        );
      }
      if (tech.id === 'deauth_flood' || tech.id === 'beacon_flood' || tech.id === 'jam') {
        setClients((cs) => cs.map((c) => (Math.random() < 0.35 ? { ...c, status: 'deauthed' } : c)));
      }
      if (tech.id === 'captive' || tech.id === 'qr_drop') {
        setClients((cs) =>
          cs.map((c) =>
            c.soft && Math.random() < 0.55 ? { ...c, status: 'phished' } : c
          )
        );
      }
      if (tech.id === 'session_hijack' || tech.id === 'browser_exploit' || tech.id === 'smb') {
        setClients((cs) =>
          cs.map((c) =>
            (c.status === 'phished' || c.soft) && Math.random() < 0.5
              ? { ...c, status: 'compromised' }
              : c
          )
        );
      }

      setFlags(nextFlags);
      setDoneIds((d) => new Set([...d, tech.id]));
      const noise =
        tech.risk === 'loud' ? 22 : tech.risk === 'noisy' ? 12 : tech.risk === 'active' ? 7 : 2;
      addHeat?.(noise);
      pushLog(`${tech.name} OK — flags: ${(tech.gives || []).join(', ') || 'none'} (+$${tech.payout})`);
      onEarn?.(tech.payout, {
        title: `Wi‑Fi · ${tech.name}`,
        note: `${tech.detail} @ ${venue.name}`
      });
      setBusy(false);
    }, (tech.seconds || 2) * 700);
    timers.current.push(t);
  };

  const flagKeys = [
    'monitor',
    'map',
    'pcap',
    'profiles',
    'networkAccess',
    'mitm',
    'evilTwin',
    'portal',
    'cookies',
    'passiveOnly'
  ];

  if (!venue) {
    return (
      <Panel>
        <PanelTitle>Select Wi‑Fi venue</PanelTitle>
        <VenueGrid>
          {WIFI_VENUES.map((v) => (
            <CardBtn key={v.id} type="button" onClick={() => enterVenue(v.id)}>
              <DomainName>{v.name}</DomainName>
              <DomainMeta>
                {v.place} · {v.encMix.join(' / ')}
              </DomainMeta>
            </CardBtn>
          ))}
        </VenueGrid>
        <Lead style={{ fontSize: '0.85rem', maxWidth: '54ch' }}>
          Techniques unlock after you join a venue. Typical path: monitor → discovery → pcap →
          profile → access → MitM → endpoint.
        </Lead>
      </Panel>
    );
  }

  return (
    <Layout>
      <Panel style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <PanelTitle>
          Toolkit · {venue.name}
          <span style={{ float: 'right', fontWeight: 500, color: '#9ca3af' }}>
            heat {Math.round(heat || 0)}%
          </span>
        </PanelTitle>
        <FlagStrip>
          {flagKeys.map((k) => (
            <Flag key={k} $on={!!flags[k]}>
              {k}
            </Flag>
          ))}
        </FlagStrip>
        {grouped.map(([cat, list]) => (
          <div key={cat}>
            <CatTitle>{cat}</CatTitle>
            {list.map((tech) => {
              const check = canRun(tech, flags, venue);
              const done = doneIds.has(tech.id);
              return (
                <Tech
                  key={tech.id}
                  type="button"
                  $locked={!check.ok && !done}
                  $done={done}
                  $busy={busy}
                  disabled={busy || done || !check.ok}
                  onClick={() => runTech(tech)}
                >
                  <TechName>
                    {done ? '✓ ' : ''}
                    {tech.name}
                    <span style={{ float: 'right', color: '#6b7280' }}>+${tech.payout}</span>
                  </TechName>
                  <TechDetail>{tech.detail}</TechDetail>
                  {!done && !check.ok && <TechNeed>{check.reason}</TechNeed>}
                </Tech>
              );
            })}
          </div>
        ))}
        <Actions>
          <Ghost type="button" onClick={() => enterVenue(venue.id)}>
            Reset venue
          </Ghost>
          <Ghost type="button" onClick={() => setVenueId(null)}>
            Change venue
          </Ghost>
        </Actions>
      </Panel>

      <div>
        <Panel>
          <PanelTitle>Air / clients</PanelTitle>
          <DomainMeta style={{ marginBottom: 10 }}>
            {venue.place} · enc {venue.encMix.join(', ')}
          </DomainMeta>
          {clients.map((c) => (
            <Row key={c.id}>
              <div>
                <div style={{ color: '#e5e7eb' }}>
                  {c.name}
                  {c.soft ? ' · fish' : ''}
                </div>
                <DomainMeta>
                  {c.device}
                  {c.profiled ? ` · OUI ${c.oui} · probes ${c.probing}` : ''}
                  {c.ports?.length ? ` · ports ${c.ports.join(',')}` : ''}
                </DomainMeta>
              </div>
              <Tag>{c.status}</Tag>
            </Row>
          ))}
        </Panel>
        <Panel style={{ marginTop: 12 }}>
          <PanelTitle>Ops log</PanelTitle>
          <Log>
            {log.map((line, i) => (
              <div key={`${line.t}-${i}`} style={{ color: line.tone || '#9ca3af', padding: '4px 0' }}>
                {line.t} — {line.text}
              </div>
            ))}
          </Log>
        </Panel>
      </div>
    </Layout>
  );
}

const EMAIL_LIST_PACKS = [
  {
    id: 'street',
    name: 'Street list',
    count: 5,
    price: 1800,
    softBias: 0.35,
    note: 'Scraped consumer addresses — mixed quality.'
  },
  {
    id: 'premium',
    name: 'Premium leads',
    count: 8,
    price: 4200,
    softBias: 0.55,
    note: 'Verified inboxes, higher open rates, soft targets.'
  },
  {
    id: 'executive',
    name: 'Executive dump',
    count: 4,
    price: 7800,
    softBias: 0.25,
    note: 'Few addresses, high awareness — big exploit payouts if they click.'
  },
  {
    id: 'bulk',
    name: 'Bulk farm',
    count: 15,
    price: 9500,
    softBias: 0.45,
    note: 'Large spray list. Expensive bandwidth theater.'
  }
];

function makeEmailTarget(softBias = 0.4) {
  const awareness = Math.max(
    12,
    Math.min(92, Math.round(rand(18, 88) - softBias * 18 + (1 - softBias) * 10))
  );
  const local = `${pick(FIRST).toLowerCase()}.${pick(LAST).toLowerCase()}`;
  return {
    id: Math.random().toString(36).slice(2, 9),
    name: `${pick(FIRST)} ${pick(LAST)}`,
    email: `${local}@mail.sim`,
    awareness,
    status: 'inbox',
    source: 'starter',
    capture: null,
    exploitLog: [],
    exploitMethod: null
  };
}

function buildCapture(target, vector) {
  const passHints = ['Summer2024!', 'Password1', 'company@123', 'qwerty2023', 'Welcome1!'];
  return {
    landingUrl: `https://secure-login.${(vector?.id || 'portal')}.sim/continue`,
    submittedEmail: target.email,
    submittedPass: pick(passHints),
    cookie: `sid_${Math.random().toString(36).slice(2, 10)}`,
    userAgent: pick([
      'Chrome/Windows',
      'Safari/iPhone',
      'Firefox/Mac',
      'Edge/Windows'
    ]),
    mfa: target.awareness > 60 && Math.random() < 0.45,
    capturedAt: Date.now()
  };
}

const EMAIL_EXPLOIT_METHODS = [
  {
    id: 'replay',
    name: 'Credential replay',
    detail: 'Use the harvested username/password against the real login (sim).',
    steps: [
      'Normalize captured form fields',
      'Replay POST to authentic endpoint (sandboxed)',
      'Check for session cookie / redirect to app home',
      'Confirm mailbox or dashboard access'
    ],
    payoutMul: 1,
    needsMfaBypass: false
  },
  {
    id: 'session',
    name: 'Session cookie import',
    detail: 'Import the staged sid cookie into an isolated browser profile.',
    steps: [
      'Export sid from phishing collector',
      'Spin disposable browser profile',
      'Inject cookie for target domain',
      'Load authenticated page without re-entering password'
    ],
    payoutMul: 1.2,
    needsMfaBypass: false
  },
  {
    id: 'mfa',
    name: 'MFA prompt fatigue',
    detail: 'If MFA fired, spam approve requests until the soft target accepts (sim).',
    steps: [
      'Detect MFA challenge on replay',
      'Trigger push notifications on enrolled device',
      'Wait for accidental approve',
      'Complete login with temporary token'
    ],
    payoutMul: 1.45,
    needsMfaBypass: true
  },
  {
    id: 'mailbox',
    name: 'Mailbox pivot',
    detail: 'Search mail for password resets, invoices, and secondary accounts.',
    steps: [
      'Open webmail with stolen session',
      'Search: password, invoice, wire, VPN',
      'Clone recovery codes / app passwords if present',
      'Stage secondary targets from contacts'
    ],
    payoutMul: 1.6,
    needsMfaBypass: false
  }
];

function EmailLab({ onEarn, onSpend, money, pushLog, log, addHeat }) {
  const [vectorId, setVectorId] = useState(EMAIL_VECTORS[0].id);
  const [targets, setTargets] = useState(() =>
    Array.from({ length: 6 }, () => makeEmailTarget(0.4))
  );
  const [busy, setBusy] = useState(false);
  const [buyMsg, setBuyMsg] = useState('');
  const [focusId, setFocusId] = useState(null);
  const [methodId, setMethodId] = useState(EMAIL_EXPLOIT_METHODS[0].id);
  const [runningExploit, setRunningExploit] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const exploitTimers = useRef([]);
  const vector = EMAIL_VECTORS.find((v) => v.id === vectorId);
  const focus = targets.find((t) => t.id === focusId) || null;
  const method = EMAIL_EXPLOIT_METHODS.find((m) => m.id === methodId) || EMAIL_EXPLOIT_METHODS[0];

  useEffect(
    () => () => {
      exploitTimers.current.forEach(clearTimeout);
    },
    []
  );

  const buyList = (pack) => {
    if (busy) return;
    if (Number(money || 0) < pack.price) {
      setBuyMsg(`Need $${pack.price.toLocaleString()} — balance $${Number(money || 0).toLocaleString()}`);
      pushLog(`Purchase failed: ${pack.name} (insufficient funds)`, '#b45309');
      return;
    }
    const ok = onSpend?.(pack.price, {
      title: `Email list · ${pack.name}`,
      note: `Bought ${pack.count} simulated inboxes (${pack.note})`
    });
    if (!ok) {
      setBuyMsg('Purchase declined.');
      pushLog(`Purchase failed: ${pack.name}`, '#b45309');
      return;
    }
    const fresh = Array.from({ length: pack.count }, () => ({
      ...makeEmailTarget(pack.softBias),
      source: pack.id
    }));
    setTargets((prev) => [...fresh, ...prev]);
    setBuyMsg(`+${pack.count} emails from ${pack.name} (−$${pack.price.toLocaleString()})`);
    pushLog(`Purchased ${pack.name}: +${pack.count} inboxes (−$${pack.price})`);
  };

  const send = () => {
    const queue = targets.filter((t) => t.status === 'inbox');
    if (!queue.length) {
      pushLog('No unsent inboxes — buy a list or wait.', '#b45309');
      return;
    }
    setBusy(true);
    pushLog(`Phish wave: ${vector.name} → ${queue.length} recipients`);
    addHeat?.(4 + Math.min(12, Math.floor(queue.length / 2)));
    let i = 0;
    const tick = () => {
      if (i >= queue.length) {
        pushLog('Campaign wave finished — open exploit on clickers when ready.');
        setBusy(false);
        return;
      }
      const t = queue[i];
      i += 1;
      const open = Math.random() > t.awareness / 130;
      const click = open && Math.random() > t.awareness / 110;
      setTargets((prev) =>
        prev.map((x) => {
          if (x.id !== t.id) return x;
          if (click) {
            return {
              ...x,
              status: 'clicked',
              capture: buildCapture(x, vector),
              exploitLog: ['Lure CTA clicked — fake landing collected a form submit.'],
              exploitMethod: null
            };
          }
          return { ...x, status: open ? 'opened' : 'deleted' };
        })
      );
      pushLog(
        click
          ? `${t.name} clicked — capture ready`
          : open
            ? `${t.name} opened`
            : `${t.name} deleted`,
        click ? '#86efac' : open ? '#93c5fd' : '#b45309'
      );
      // ~3s between each inbox result so the log is readable
      setTimeout(tick, 3200);
    };
    // Pause after the wave announcement before the first result
    setTimeout(tick, 2500);
  };

  const openExploit = (t) => {
    if (t.status !== 'clicked' && t.status !== 'exploited') return;
    setFocusId(t.id);
    setMethodId(t.capture?.mfa ? 'mfa' : EMAIL_EXPLOIT_METHODS[0].id);
    setStepIndex(-1);
    setRunningExploit(false);
    pushLog(`Exploit desk opened for ${t.name}`);
  };

  const runExploitChain = () => {
    if (!focus || focus.status !== 'clicked' || runningExploit) return;
    if (method.needsMfaBypass && !focus.capture?.mfa) {
      pushLog('MFA fatigue not needed — target has no MFA flag. Pick another method.', '#b45309');
      return;
    }
    if (!method.needsMfaBypass && focus.capture?.mfa && method.id === 'replay') {
      pushLog('Replay alone may stall on MFA — consider MFA fatigue or session import.', '#b45309');
    }

    exploitTimers.current.forEach(clearTimeout);
    exploitTimers.current = [];
    setRunningExploit(true);
    setStepIndex(0);
    pushLog(`Starting ${method.name} on ${focus.name}`);

    const steps = method.steps;
    const stepGapMs = 2800;
    steps.forEach((label, idx) => {
      const timer = setTimeout(() => {
        setStepIndex(idx);
        setTargets((prev) =>
          prev.map((x) =>
            x.id === focus.id
              ? {
                  ...x,
                  exploitLog: [...(x.exploitLog || []), `${idx + 1}/${steps.length} ${label}`],
                  exploitMethod: method.id
                }
              : x
          )
        );
        pushLog(`${focus.name}: ${label}`);

        if (idx === steps.length - 1) {
          const base =
            focus.source === 'executive'
              ? rand(180, 320)
              : focus.source === 'premium'
                ? rand(100, 200)
                : rand(60, 140);
          const pay = Math.round(base * method.payoutMul);
          const finish = setTimeout(() => {
            setTargets((prev) =>
              prev.map((x) =>
                x.id === focus.id
                  ? {
                      ...x,
                      status: 'exploited',
                      exploitLog: [
                        ...(x.exploitLog || []),
                        `Access confirmed via ${method.name}. Training credit +$${pay}.`
                      ]
                    }
                  : x
              )
            );
            pushLog(`Exploit complete on ${focus.name} (+$${pay})`, '#86efac');
            onEarn?.(pay, {
              title: `Email · ${method.name}`,
              note: `${focus.name} via ${method.name}`
            });
            addHeat?.(method.id === 'mailbox' ? 14 : 10);
            setRunningExploit(false);
            setStepIndex(steps.length);
          }, stepGapMs);
          exploitTimers.current.push(finish);
        }
      }, 800 + idx * stepGapMs);
      exploitTimers.current.push(timer);
    });
  };

  const inboxReady = targets.filter((t) => t.status === 'inbox').length;
  const clickers = targets.filter((t) => t.status === 'clicked');

  return (
    <Layout>
      <div>
        <Panel>
          <PanelTitle>Lures</PanelTitle>
          <DomainMeta style={{ marginBottom: 10 }}>
            {targets.length} total · {inboxReady} unsent · {clickers.length} ready to exploit
          </DomainMeta>
          {EMAIL_VECTORS.map((v) => (
            <CardBtn
              key={v.id}
              type="button"
              $active={vectorId === v.id}
              onClick={() => setVectorId(v.id)}
              style={{ marginBottom: 8, width: '100%' }}
            >
              <DomainName>{v.name}</DomainName>
              <DomainMeta>{v.subject}</DomainMeta>
            </CardBtn>
          ))}
          <Actions>
            <Primary type="button" disabled={busy || inboxReady === 0} onClick={send}>
              {busy ? 'Sending…' : `Send to ${inboxReady} unsent`}
            </Primary>
          </Actions>
        </Panel>
        <Panel style={{ marginTop: 12 }}>
          <PanelTitle>Buy email lists</PanelTitle>
          <DomainMeta style={{ marginBottom: 10 }}>
            Simulated broker dumps — expensive, expands your pool.
          </DomainMeta>
          {EMAIL_LIST_PACKS.map((pack) => {
            const canAfford = Number(money || 0) >= pack.price;
            return (
              <CardBtn
                key={pack.id}
                type="button"
                disabled={busy || !canAfford}
                onClick={() => buyList(pack)}
                style={{
                  marginBottom: 8,
                  width: '100%',
                  opacity: canAfford ? 1 : 0.45,
                  cursor: canAfford ? 'pointer' : 'not-allowed'
                }}
              >
                <DomainName>
                  {pack.name}
                  <span style={{ float: 'right', color: '#e5e7eb' }}>
                    ${pack.price.toLocaleString()}
                  </span>
                </DomainName>
                <DomainMeta>
                  +{pack.count} emails · {pack.note}
                </DomainMeta>
              </CardBtn>
            );
          })}
          {buyMsg && <DomainMeta style={{ marginTop: 8 }}>{buyMsg}</DomainMeta>}
        </Panel>
      </div>

      <div>
        <Panel>
          <PanelTitle>Inboxes</PanelTitle>
          {targets.map((t) => (
            <Row key={t.id}>
              <div>
                <div style={{ color: '#e5e7eb' }}>{t.name}</div>
                <DomainMeta>
                  {t.email} · awareness {t.awareness}
                  {t.source && t.source !== 'starter' ? ` · ${t.source}` : ''}
                </DomainMeta>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag>{t.status}</Tag>
                {(t.status === 'clicked' || t.status === 'exploited') && (
                  <Ghost type="button" onClick={() => openExploit(t)}>
                    {t.status === 'clicked' ? 'Open exploit' : 'Review'}
                  </Ghost>
                )}
              </div>
            </Row>
          ))}
        </Panel>

        {focus && (focus.status === 'clicked' || focus.status === 'exploited') && (
          <Panel style={{ marginTop: 12 }}>
            <PanelTitle>Exploit desk · {focus.name}</PanelTitle>
            <DomainMeta style={{ marginBottom: 12 }}>
              Review capture, pick a method, then run each step.
            </DomainMeta>

            {focus.capture && (
              <>
                <CatTitle>1 · Capture</CatTitle>
                <CaptureGrid as="dl">
                  <dt>URL</dt>
                  <dd>{focus.capture.landingUrl}</dd>
                  <dt>Email</dt>
                  <dd>{focus.capture.submittedEmail}</dd>
                  <dt>Password</dt>
                  <dd>{focus.capture.submittedPass}</dd>
                  <dt>Cookie</dt>
                  <dd>{focus.capture.cookie}</dd>
                  <dt>Browser</dt>
                  <dd>{focus.capture.userAgent}</dd>
                  <dt>MFA</dt>
                  <dd>{focus.capture.mfa ? 'Yes — consider MFA fatigue' : 'No'}</dd>
                </CaptureGrid>
              </>
            )}

            {focus.status === 'clicked' && (
              <>
                <CatTitle>2 · Method</CatTitle>
                {EMAIL_EXPLOIT_METHODS.map((m) => {
                  const blocked = m.needsMfaBypass && !focus.capture?.mfa;
                  return (
                    <CardBtn
                      key={m.id}
                      type="button"
                      $active={methodId === m.id}
                      disabled={blocked || runningExploit}
                      onClick={() => !blocked && setMethodId(m.id)}
                      style={{
                        marginBottom: 8,
                        width: '100%',
                        opacity: blocked ? 0.4 : 1,
                        cursor: blocked ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <DomainName>
                        {m.name}
                        <span style={{ float: 'right', color: '#9ca3af' }}>×{m.payoutMul}</span>
                      </DomainName>
                      <DomainMeta>{blocked ? 'Requires MFA flag' : m.detail}</DomainMeta>
                    </CardBtn>
                  );
                })}

                <CatTitle>3 · Steps</CatTitle>
                <StepList>
                  {method.steps.map((s, i) => (
                    <StepItem
                      key={s}
                      $done={stepIndex > i}
                      $active={stepIndex === i && runningExploit}
                    >
                      <StepNum $done={stepIndex > i} $active={stepIndex === i && runningExploit}>
                        {stepIndex > i ? '✓' : i + 1}
                      </StepNum>
                      <span>{s}</span>
                    </StepItem>
                  ))}
                </StepList>
                <Actions>
                  <Primary type="button" disabled={runningExploit} onClick={runExploitChain}>
                    {runningExploit ? 'Running…' : `Run ${method.name}`}
                  </Primary>
                  <Ghost type="button" disabled={runningExploit} onClick={() => setFocusId(null)}>
                    Close
                  </Ghost>
                </Actions>
              </>
            )}

            {focus.status === 'exploited' && (
              <>
                <CatTitle>Result</CatTitle>
                <DomainMeta>Method: {focus.exploitMethod || 'done'}</DomainMeta>
                {(focus.exploitLog || []).map((line) => (
                  <DomainMeta key={line}>• {line}</DomainMeta>
                ))}
                <Actions>
                  <Ghost type="button" onClick={() => setFocusId(null)}>
                    Close
                  </Ghost>
                </Actions>
              </>
            )}
          </Panel>
        )}

        <Panel style={{ marginTop: 12 }}>
          <PanelTitle>Ops log</PanelTitle>
          <Log>
            {log.slice(0, 14).map((line, i) => (
              <div key={i} style={{ color: line.tone || '#9ca3af', padding: '4px 0' }}>
                {line.t} — {line.text}
              </div>
            ))}
          </Log>
        </Panel>
      </div>
    </Layout>
  );
}

const TRACE_START_HEAT = 72;
const TRACE_CLEAR_HEAT = 50;
const TRACE_SECONDS = 18;
const CAUGHT_HOLD_MS = 4500;

export default function OpsSurface({ onEarn, onSpend, money }) {
  const [domain, setDomain] = useState('wifi');
  const [log, setLog] = useState([]);
  const [heat, setHeat] = useState(0);
  const [police, setPolice] = useState('clear'); // clear | trace | caught
  const [countdown, setCountdown] = useState(0);
  const [fineNote, setFineNote] = useState('');
  const caughtTimer = useRef(null);

  const pushLog = useCallback((text, tone) => {
    const t = new Date().toLocaleTimeString();
    setLog((prev) => [{ t, text, tone }, ...prev].slice(0, 60));
  }, []);

  const addHeat = useCallback(
    (amount) => {
      if (!amount || amount <= 0 || police === 'caught') return;
      setHeat((h) => Math.min(100, h + amount));
    },
    [police]
  );

  const resolveCaught = useCallback(() => {
    setPolice((prev) => {
      if (prev === 'caught') return prev;
      const fine = Math.max(800, Math.round(Number(money || 0) * 0.18));
      setCountdown(0);
      setFineNote(`Fined $${fine.toLocaleString()} — simulated raid.`);
      pushLog(`CAUGHT by police sim. Fine −$${fine}.`, '#fca5a5');
      onSpend?.(fine, {
        title: 'Police seizure (sim)',
        note: 'Heat maxed — simulated LE response confiscated funds.'
      });
      setHeat(0);
      if (caughtTimer.current) clearTimeout(caughtTimer.current);
      caughtTimer.current = setTimeout(() => {
        setPolice('clear');
        setFineNote('');
        pushLog('Trace cleared. Keep noise down.');
      }, CAUGHT_HOLD_MS);
      return 'caught';
    });
  }, [money, onSpend, pushLog]);

  // Start trace when heat crosses threshold
  useEffect(() => {
    if (police === 'clear' && heat >= TRACE_START_HEAT) {
      setPolice('trace');
      setCountdown(TRACE_SECONDS);
      pushLog('Police trace locked on — evade or get caught.', '#fca5a5');
    }
  }, [heat, police, pushLog]);

  // Slip the trace by cooling below clear line
  useEffect(() => {
    if (police === 'trace' && heat < TRACE_CLEAR_HEAT) {
      setPolice('clear');
      setCountdown(0);
      pushLog('You slipped the trace. Heat cooling.', '#86efac');
    }
  }, [heat, police, pushLog]);

  // Slow natural cool-down
  useEffect(() => {
    const id = setInterval(() => {
      setHeat((h) => {
        if (h <= 0 || police === 'caught') return h;
        return Math.max(0, h - (police === 'trace' ? 1.2 : 2.2));
      });
    }, 2000);
    return () => clearInterval(id);
  }, [police]);

  // Pursuit countdown
  useEffect(() => {
    if (police !== 'trace') return undefined;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          queueMicrotask(() => resolveCaught());
          return 0;
        }
        if (c === 6) pushLog('Sirens closing in — seconds left.', '#fca5a5');
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [police, resolveCaught, pushLog]);

  useEffect(
    () => () => {
      if (caughtTimer.current) clearTimeout(caughtTimer.current);
    },
    []
  );

  const heatLevel = heat >= 72 ? 'danger' : heat >= 45 ? 'warn' : 'ok';
  const showSiren = police === 'trace' || police === 'caught';

  return (
    <Shell>
      <AnimatePresence>
        {showSiren && (
          <SirenOverlay
            key="siren"
            $caught={police === 'caught'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SirenCard>
              {police === 'trace' ? (
                <>
                  <SirenTitle>Police trace</SirenTitle>
                  <DomainMeta style={{ color: '#d1d5db' }}>
                    Almost caught — stop noisy ops and wait for heat to drop, or get raided.
                  </DomainMeta>
                  <SirenCount>{countdown}s</SirenCount>
                  <DomainMeta>Heat {Math.round(heat)}% · clear below {TRACE_CLEAR_HEAT}%</DomainMeta>
                </>
              ) : (
                <>
                  <SirenTitle>Caught</SirenTitle>
                  <DomainMeta style={{ color: '#fecaca', marginBottom: 8 }}>
                    Simulated raid. Blue / red boards rolling.
                  </DomainMeta>
                  <DomainMeta>{fineNote}</DomainMeta>
                </>
              )}
            </SirenCard>
          </SirenOverlay>
        )}
      </AnimatePresence>

      <TopBar>
        <div>
          <Kicker>Simulation only</Kicker>
          <Heading>Operations</Heading>
          <Lead>
            Pick a domain. Loud techniques raise police heat — sirens and a countdown if they lock
            onto you.
          </Lead>
          <Note style={{ marginTop: 8 }}>No real networks, mail, or devices are used.</Note>
          <HeatMeter $level={heatLevel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Police heat</span>
              <span style={{ color: heatLevel === 'danger' ? '#fca5a5' : '#e5e7eb' }}>
                {Math.round(heat)}%
                {police === 'trace' ? ` · TRACE ${countdown}s` : police === 'caught' ? ' · CAUGHT' : ''}
              </span>
            </div>
            <HeatBarTrack>
              <HeatBarFill $pct={Math.min(100, heat)} />
            </HeatBarTrack>
          </HeatMeter>
        </div>
        <Balance>
          Balance
          <span>${Number(money || 0).toLocaleString()}</span>
        </Balance>
      </TopBar>

      <DomainRow>
        {DOMAINS.map((d) => (
          <DomainBtn
            key={d.id}
            type="button"
            $active={domain === d.id}
            onClick={() => {
              setDomain(d.id);
              setLog([]);
              pushLog(`Domain → ${d.name}`);
            }}
          >
            <DomainName style={{ marginBottom: 4 }}>{d.name}</DomainName>
            <DomainMeta>
              {d.tag} · {d.blurb}
            </DomainMeta>
          </DomainBtn>
        ))}
      </DomainRow>

      <AnimatePresence mode="wait">
        <motion.div
          key={domain}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {domain === 'wifi' && (
            <WifiLab
              onEarn={onEarn}
              money={money}
              pushLog={pushLog}
              log={log}
              addHeat={addHeat}
              heat={heat}
            />
          )}
          {domain === 'email' && (
            <EmailLab
              onEarn={onEarn}
              onSpend={onSpend}
              money={money}
              pushLog={pushLog}
              log={log}
              addHeat={addHeat}
            />
          )}
          {domain === 'ble' && (
            <SimpleDomainLab
              title="Bluetooth / BLE"
              techniques={BLE_TECHNIQUES}
              onEarn={onEarn}
              pushLog={pushLog}
              addHeat={addHeat}
            />
          )}
          {domain === 'iot' && (
            <SimpleDomainLab
              title="IoT & printers"
              techniques={IOT_TECHNIQUES}
              onEarn={onEarn}
              pushLog={pushLog}
              addHeat={addHeat}
            />
          )}
          {domain === 'social' && (
            <SimpleDomainLab
              title="Physical / social"
              techniques={SOCIAL_TECHNIQUES}
              onEarn={onEarn}
              pushLog={pushLog}
              addHeat={addHeat}
            />
          )}
          {domain === 'enterprise' && (
            <SimpleDomainLab
              title="Enterprise edge"
              techniques={ENTERPRISE_TECHNIQUES}
              onEarn={onEarn}
              pushLog={pushLog}
              addHeat={addHeat}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}

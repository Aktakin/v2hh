import { useCallback, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import Login from './components/Login';
import { FaHome, FaStore, FaMobileAlt, FaSignOutAlt, FaDollarSign, FaChartLine, FaShieldAlt, FaLaptop, FaWifi, FaPhone, FaPowerOff, FaCheckCircle, FaSkullCrossbones, FaBug, FaBars, FaChevronLeft, FaCrosshairs, FaShoppingCart, FaBell, FaNetworkWired, FaTruck, FaLock, FaSearch, FaBroadcastTower } from 'react-icons/fa';
import MainPhone from './client/components/Phone';
import MainLaptopInterface from './client/components/LaptopInterface';
import { GameProvider as MainGameProvider, useGame as useMainGame } from './client/context/GameContext';
import OpsSurface from './components/OpsSurface';
import './App.css';

const SESSION_KEY = 'hackhilis_v2_session';
const HV1_STATE_KEY = 'hackhilis_v2_state';

/**
 * When false: no random incoming breaches, no "You Have Been Hacked" strip, no simulated BOT roaming nodes.
 * Set to true to restore timed attacks and mixed bot/player targets.
 */
const ENABLE_SIMULATED_BOTS = false;

const roamingSweep = keyframes`
  0% { transform: translateX(-30%) rotate(-8deg); }
  100% { transform: translateX(30%) rotate(-8deg); }
`;

const MISSION_CATALOG = [
  {
    id: 'phishing-sweep',
    title: 'Network Sweep',
    subtitle: 'Track fake operator IPs and stop coordinated automated strikes.',
    reward: 420,
    pressure: 'malware',
    recommendedTool: 'malware',
    difficulty: 'Low'
  },
  {
    id: 'malware-hive',
    title: 'Malware Hive',
    subtitle: 'Neutralize infected fake bot nodes before they spread persistent malware.',
    reward: 760,
    pressure: 'malware',
    recommendedTool: 'malware',
    difficulty: 'Medium'
  },
  {
    id: 'dark-relay',
    title: 'Dark Relay',
    subtitle: 'Infiltrate a relay cluster of fake player signatures and command bots.',
    reward: 980,
    pressure: 'hybrid',
    recommendedTool: 'bruteforce',
    difficulty: 'High'
  }
];

const defaultDevices = {
  phone: { purchased: false, model: 'Not Purchased', online: false, price: 500 },
  laptop: { purchased: false, model: 'Not Purchased', online: false, price: 1000 },
  router: { purchased: false, model: 'Not Purchased', online: false, price: 500 }
};

const defaultUpgrades = {
  phishingKit: {
    purchased: false,
    title: 'Malware Lab Kit',
    price: 350,
    description: 'Improves malware-lab missions and simulated breach success rate.'
  },
  malwareSandbox: {
    purchased: false,
    title: 'Malware Sandbox',
    price: 480,
    description: 'Safely stages payloads before deployment in malware missions.'
  },
  exploitDatabase: {
    purchased: false,
    title: 'Exploit Database',
    price: 650,
    description: 'Adds curated exploit references for brute-force and recon attacks.'
  },
  stealthVpn: {
    purchased: false,
    title: 'Stealth VPN',
    price: 540,
    description: 'Masks routing signatures to reduce trace exposure during operations.'
  },
  signalBooster: {
    purchased: false,
    title: 'Signal Booster',
    price: 420,
    description: 'Stabilizes mission uplinks and accelerates progress gain.'
  }
};

const defaultTransactionHistory = [
  {
    id: 'initial-allocation',
    timestamp: 'Session Bootstrap',
    type: 'credit',
    title: 'Starting Balance',
    amount: 10000,
    note: 'Initial Version 1 operating funds.',
    category: 'system',
    balanceAfter: 10000
  }
];

const createTransactionEntry = ({ type, title, amount, note, category, balanceAfter }) => ({
  id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  timestamp: new Date().toLocaleString(),
  type,
  title,
  amount,
  note,
  category,
  balanceAfter
});

const withTransaction = (state, transaction) => ({
  ...state,
  transactionHistory: [
    createTransactionEntry({
      ...transaction,
      balanceAfter: transaction.balanceAfter ?? state.money
    }),
    ...((state.transactionHistory && state.transactionHistory.length > 0)
      ? state.transactionHistory
      : defaultTransactionHistory)
  ].slice(0, 40)
});

function catalogItemMatchesSearch(item, rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const words = q.split(/\s+/).filter(Boolean);
  const blob = [item.id, item.title, item.description, item.kind]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return words.every((w) => blob.includes(w));
}

const AppShell = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(1200px 600px at -10% -10%, rgba(0, 255, 65, 0.14), transparent 55%),
    radial-gradient(900px 600px at 100% 10%, rgba(0, 255, 65, 0.08), transparent 50%),
    linear-gradient(160deg, #06080f 0%, #0a0f1b 45%, #070b14 100%);
  color: #d9ffe7;
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  }
`;

const Sidebar = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: ${({ $expanded }) => ($expanded ? '220px' : '80px')};
  height: 100vh;
  background: linear-gradient(180deg, rgba(8, 12, 24, 0.95) 0%, rgba(10, 16, 30, 0.96) 100%);
  border-right: 1px solid rgba(73, 255, 170, 0.4);
  display: flex;
  flex-direction: column;
  align-items: ${({ $expanded }) => ($expanded ? 'flex-start' : 'center')};
  padding: ${({ $expanded }) => ($expanded ? '20px 14px' : '20px 0')};
  z-index: 20;
  backdrop-filter: blur(12px);
  box-shadow: 8px 0 40px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  transition: width 0.3s ease;
`;

const NavHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $expanded }) => ($expanded ? 'space-between' : 'center')};
  width: 100%;
  margin-bottom: 20px;
  padding: ${({ $expanded }) => ($expanded ? '0 10px' : '0')};
`;

const NavLogo = styled.div`
  color: #00ff41;
  font-family: 'Orbitron', sans-serif;
  font-size: ${({ $expanded }) => ($expanded ? '1rem' : '0')};
  opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
  white-space: nowrap;
  transition: all 0.3s ease;
  overflow: hidden;
`;

const ToggleButton = styled.button`
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.35);
  color: #00ff41;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  flex: 1;
  align-items: ${({ $expanded }) => ($expanded ? 'stretch' : 'center')};
`;

const NavButton = styled.button`
  width: ${({ $expanded }) => ($expanded ? '100%' : '52px')};
  min-height: 52px;
  margin: ${({ $expanded }) => ($expanded ? '0' : '0 auto')};
  border-radius: 14px;
  border: 1px solid ${({ active }) => (active ? 'rgba(0,255,65,0.8)' : 'rgba(120, 146, 168, 0.26)')};
  background: ${({ active }) =>
    active
      ? 'linear-gradient(145deg, rgba(0,255,65,0.2), rgba(0, 255, 140, 0.12))'
      : 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'};
  color: ${({ active }) => (active ? '#8dffb2' : '#95a2bd')};
  display: flex;
  flex-direction: ${({ $expanded }) => ($expanded ? 'row' : 'column')};
  align-items: center;
  justify-content: ${({ $expanded }) => ($expanded ? 'flex-start' : 'center')};
  gap: ${({ $expanded }) => ($expanded ? '12px' : '0')};
  font-size: 0.66rem;
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 0.3px;
  line-height: 1;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.22s ease;
  padding: ${({ $expanded }) => ($expanded ? '12px 14px' : '0')};
  box-shadow: ${({ active }) =>
    active
      ? '0 10px 26px rgba(0, 255, 65, 0.2), inset 0 0 0 1px rgba(255,255,255,0.04)'
      : 'inset 0 0 0 1px rgba(255,255,255,0.02)'};
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 255, 65, 0.65);
    color: #c9ffea;
  }
`;

const NavIcon = styled.span`
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: ${({ $expanded }) => ($expanded ? '1rem' : '1.12rem')};
`;

const NavLabel = styled.span`
  opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
  width: ${({ $expanded }) => ($expanded ? 'auto' : '0')};
  height: ${({ $expanded }) => ($expanded ? 'auto' : '0')};
  overflow: hidden;
  white-space: nowrap;
  transition: all 0.3s ease;
`;

const Main = styled.main`
  margin-left: ${({ $expanded }) => ($expanded ? '220px' : '80px')};
  width: ${({ $expanded }) => ($expanded ? 'calc(90% - 220px)' : 'calc(90% - 80px)')};
  padding: ${({ $expanded }) => ($expanded ? '20px 22px 20px 5%' : '20px 22px')};
  transition: margin-left 0.3s ease, width 0.3s ease, padding 0.3s ease;
`;

const PageContainer = styled.div`
  max-width: 1320px;
  margin: 0 auto;
`;

const HeaderCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(18, 27, 46, 0.8), rgba(11, 18, 33, 0.88));
  border: 1px solid rgba(0, 255, 65, 0.45);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 14px;
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.03);
`;

const StoreHeaderRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
  margin-bottom: 56px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const CartSummaryCard = styled(motion.div)`
  min-width: 220px;
  background: linear-gradient(145deg, rgba(18, 27, 46, 0.82), rgba(11, 18, 33, 0.9));
  border: 1px solid rgba(0, 255, 65, 0.4);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.24),
    inset 0 0 0 1px rgba(255, 255, 255, 0.03);
`;

const CartSummaryLabel = styled.div`
  color: #99aac8;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
`;

const CartSummaryValue = styled.div`
  color: #a7ffd0;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StoreHero = styled(motion.section)`
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  padding: 28px 28px 32px;
  margin-bottom: 22px;
  border: 1px solid rgba(120, 200, 160, 0.28);
  background:
    radial-gradient(900px 280px at 88% -40%, rgba(0, 255, 120, 0.2), transparent 55%),
    radial-gradient(500px 220px at 5% 110%, rgba(0, 180, 255, 0.1), transparent 50%),
    linear-gradient(145deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 28, 0.98) 100%);
  box-shadow:
    0 28px 60px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      125deg,
      transparent 35%,
      rgba(255, 255, 255, 0.03) 48%,
      transparent 62%
    );
    pointer-events: none;
  }
`;

const StoreHeroTitle = styled.h1`
  position: relative;
  z-index: 1;
  margin: 0 0 8px;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.15rem, 2.2vw, 1.55rem);
  font-weight: 700;
  letter-spacing: 0.35px;
  color: #e8fff2;
  text-shadow: 0 2px 18px rgba(0, 255, 100, 0.16);
`;

const StoreSearchBar = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 440px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(4, 12, 22, 0.55);
  border: 1px solid rgba(100, 180, 140, 0.25);
  color: rgba(170, 200, 215, 0.75);
  font-size: 0.88rem;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.25);

  &:focus-within {
    border-color: rgba(120, 220, 160, 0.45);
    box-shadow:
      inset 0 2px 8px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(0, 255, 120, 0.12);
  }
`;

const StoreSearchInput = styled.input`
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(215, 230, 240, 0.96);
  font-size: inherit;
  font-family: inherit;
  line-height: 1.35;

  &::placeholder {
    color: rgba(170, 200, 215, 0.45);
  }

  &:focus::placeholder {
    color: rgba(170, 200, 215, 0.22);
  }
`;

const StoreEmptyHint = styled.p`
  margin: 0;
  padding: 12px 4px 0;
  font-size: 0.86rem;
  color: rgba(150, 175, 200, 0.9);
`;

const StoreTrustRow = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px 28px;
`;

const TrustPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: rgba(205, 230, 218, 0.9);
  letter-spacing: 0.03em;
  svg {
    opacity: 0.95;
    color: #6fffab;
  }
`;

const StoreSectionBlock = styled.section`
  margin-bottom: 64px;

  &:last-of-type {
    margin-bottom: 32px;
  }
`;

const StoreSectionHeading = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`;

const StoreSectionTitle = styled.h2`
  margin: 0;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.15rem;
  color: #9effc4;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const StoreSectionHint = styled.span`
  font-size: 0.78rem;
  color: rgba(150, 175, 200, 0.85);
`;

const CommerceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(254px, 1fr));
  column-gap: 30px;
  row-gap: 34px;
`;

const CommerceCard = styled(motion.article)`
  position: relative;
  border-radius: 17px;
  overflow: hidden;
  border: 1px solid rgba(100, 200, 150, 0.22);
  background: linear-gradient(165deg, rgba(14, 22, 38, 0.95) 0%, rgba(8, 12, 24, 0.98) 100%);
  box-shadow:
    0 11px 34px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    border-color: rgba(120, 255, 180, 0.38);
    box-shadow:
      0 17px 44px rgba(0, 0, 0, 0.42),
      0 0 0 1px rgba(0, 255, 120, 0.08);
  }
`;

const CommerceCardVisual = styled.div`
  position: relative;
  height: 103px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $gradient }) => $gradient};
  border-bottom: 1px solid rgba(0, 0, 0, 0.35);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 45%);
    pointer-events: none;
  }

  svg {
    position: relative;
    z-index: 1;
    font-size: 2.65rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.45));
    color: rgba(255, 255, 255, 0.92);
  }
`;

const CommerceBadge = styled.span`
  position: absolute;
  top: 7px;
  right: 7px;
  z-index: 2;
  font-size: 0.69rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #b8ffd8;
`;

const CommerceCardBody = styled.div`
  padding: 12px 16px 17px;
`;

const CommerceCardTitle = styled.h3`
  margin: 0 0 4px;
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  color: #c5ffe0;
  line-height: 1.2;
`;

const CommerceDesc = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.38;
  color: rgba(180, 200, 220, 0.92);
  min-height: 2em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CommercePriceRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 8px;
  gap: 8px;
`;

const CommercePrice = styled.div`
  font-family: 'Orbitron', sans-serif;
  font-size: 1.31rem;
  font-weight: 700;
  color: #7dffb4;
  text-shadow: 0 0 10px rgba(0, 255, 120, 0.2);

  small {
    font-size: 0.66rem;
    font-weight: 500;
    color: rgba(150, 190, 170, 0.75);
    margin-right: 0.5em;
  }
`;

const CommerceBtnPrimary = styled.button`
  margin-top: 8px;
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 7px 10px;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
  cursor: pointer;
  color: #031208;
  background: linear-gradient(135deg, #3cff7a 0%, #00e04e 45%, #00b846 100%);
  box-shadow: 0 4px 17px rgba(0, 220, 90, 0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(0, 240, 100, 0.28);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const CartPanel = styled(motion.div)`
  border-radius: 22px;
  padding: 22px 24px;
  border: 1px solid rgba(100, 200, 160, 0.28);
  background:
    linear-gradient(165deg, rgba(16, 28, 46, 0.94) 0%, rgba(8, 14, 26, 0.97) 100%);
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  margin-top: 0;
`;

const CartLine = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  margin-bottom: 10px;
  background: rgba(6, 14, 26, 0.55);
  border: 1px solid rgba(80, 140, 120, 0.2);
`;

const CartCheckoutRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(120, 200, 160, 0.15);
`;

const PageTitle = styled.h1`
  margin: 0 0 10px;
  font-family: 'Orbitron', sans-serif;
  font-size: 2.15rem;
  color: #87ffb0;
  letter-spacing: 0.6px;
  text-shadow: 0 0 20px rgba(0, 255, 65, 0.28);
`;

const PageSubtitle = styled.p`
  margin: 0;
  color: #99aac8;
  line-height: 1.5;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 18px;
`;

const Card = styled.div`
  background: linear-gradient(145deg, rgba(17, 26, 44, 0.86), rgba(9, 15, 28, 0.92));
  border: 1px solid rgba(0, 255, 65, 0.35);
  border-radius: 16px;
  padding: 20px;
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.28),
    inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 255, 65, 0.6);
  }
`;

const StatCardButton = styled(Card).attrs({ as: 'button', type: 'button' })`
  width: 100%;
  text-align: left;
  cursor: pointer;
  color: inherit;
`;

const CardTitle = styled.h3`
  margin: 0 0 10px;
  color: #8dffb2;
  font-size: 1.05rem;
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 0.4px;
`;

const StatValue = styled.div`
  font-size: 1.9rem;
  font-weight: bold;
  color: #65ff9a;
  font-family: 'Orbitron', sans-serif;
`;

const ProductPrice = styled.div`
  color: #65ff9a;
  font-weight: bold;
  margin-top: 10px;
  font-size: 1.08rem;
`;

const BuyButton = styled.button`
  margin-top: 12px;
  width: 100%;
  background: linear-gradient(135deg, #00ff41 0%, #00e03a 55%, #00c734 100%);
  border: 1px solid rgba(145, 255, 181, 0.65);
  border-radius: 10px;
  padding: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
  cursor: pointer;
  color: #031006;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(0, 224, 58, 0.35);
  }
`;

const UserFooter = styled.div`
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 18px;
  transform: translateY(-18px);
`;

const GadgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
`;

const GadgetCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(17, 26, 44, 0.86), rgba(9, 15, 28, 0.92));
  border: 1px solid rgba(0, 255, 65, 0.35);
  border-radius: 14px;
  padding: 14px;
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.28),
    inset 0 0 0 1px rgba(255, 255, 255, 0.02);
`;

const GadgetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const GadgetName = styled.h3`
  margin: 0;
  color: #8dffb2;
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
`;

const GadgetModel = styled.div`
  color: #99aac8;
  font-size: 0.82rem;
  margin-top: 2px;
`;

const StatusText = styled.div`
  color: ${({ online }) => (online ? '#66ff98' : '#ff7f9f')};
  font-size: 0.78rem;
  font-weight: bold;
`;

const GadgetActions = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const ActionButton = styled.button`
  width: 100%;
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(0, 255, 65, 0.55);
  background: ${({ primary }) =>
    primary
      ? 'linear-gradient(135deg, #00ff41 0%, #00e03a 55%, #00c734 100%)'
      : 'rgba(0, 255, 65, 0.06)'};
  color: ${({ primary }) => (primary ? '#031006' : '#8dffb2')};
  font-weight: bold;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 255, 65, 0.85);
  }
`;

const NoticeBox = styled.div`
  margin-top: 8px;
  border: 1px solid rgba(255, 194, 91, 0.5);
  border-radius: 10px;
  padding: 8px;
  color: #ffd181;
  background: rgba(255, 177, 44, 0.09);
  font-size: 0.76rem;
  line-height: 1.3;
`;

const AlertStrip = styled(HeaderCard)`
  border-color: ${({ $unread }) => ($unread ? 'rgba(255, 92, 133, 0.62)' : 'rgba(0, 255, 65, 0.35)')};
  background: ${({ $unread }) => (
    $unread
      ? 'linear-gradient(145deg, rgba(48, 14, 26, 0.9), rgba(20, 11, 18, 0.92))'
      : 'linear-gradient(145deg, rgba(18, 27, 46, 0.8), rgba(11, 18, 33, 0.88))'
  )};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const AlertText = styled.div`
  min-width: 0;
`;

const AlertTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ $unread }) => ($unread ? '#ff9bb3' : '#a7ffd0')};
  font-family: 'Orbitron', sans-serif;
  font-size: 0.92rem;
  margin-bottom: 4px;
`;

const AlertMeta = styled.div`
  color: #b8c6de;
  font-size: 0.78rem;
  line-height: 1.4;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const IncidentOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(2, 5, 10, 0.72);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const IncidentCard = styled(Card)`
  width: min(620px, 100%);
  padding: 20px;
  border-color: rgba(255, 92, 133, 0.45);
  background:
    radial-gradient(circle at top right, rgba(255, 92, 133, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(12, 16, 28, 0.96), rgba(8, 10, 18, 0.98));
`;

const IncidentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const IncidentField = styled.div`
  border: 1px solid rgba(255, 92, 133, 0.16);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
`;

const IncidentLabel = styled.div`
  color: #ff9bb3;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
`;

const IncidentValue = styled.div`
  color: #ebf4ff;
  font-size: 0.84rem;
  line-height: 1.45;
  word-break: break-word;
`;

const TransactionSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const TransactionSummaryCard = styled.div`
  border: 1px solid rgba(0, 255, 65, 0.16);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
`;

const TransactionList = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
`;

const TransactionRow = styled.div`
  border: 1px solid ${({ $type }) => ($type === 'debit' ? 'rgba(255, 92, 133, 0.22)' : 'rgba(0, 255, 65, 0.2)')};
  border-radius: 10px;
  padding: 10px 12px;
  background: ${({ $type }) => ($type === 'debit' ? 'rgba(255, 92, 133, 0.05)' : 'rgba(0, 255, 65, 0.04)')};
`;

const TransactionTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

const TransactionTitle = styled.div`
  color: #ebf4ff;
  font-size: 0.88rem;
  font-weight: 700;
`;

const TransactionAmount = styled.div`
  color: ${({ $type }) => ($type === 'debit' ? '#ff9bb3' : '#8dffb2')};
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  white-space: nowrap;
`;

const TemplateFrame = styled.div`
  margin-top: 6px;
  border: 1px solid rgba(0, 255, 65, 0.4);
  border-radius: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.35);
`;

const RouterTemplate = styled.div`
  border-radius: 10px;
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(0, 255, 65, 0.35);
  padding: 8px;
`;

const RouterRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: #00ff41;
  font-size: 0.72rem;
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 255, 65, 0.12);
`;

const MultiplayerLayout = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const MultiplayerSection = styled(Card)`
  padding: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0, 255, 65, 0.04), transparent 42%, rgba(0, 255, 255, 0.04));
    pointer-events: none;
  }
`;

const MultiplayerHero = styled(HeaderCard)`
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 12% 20%, rgba(0, 255, 65, 0.12), transparent 26%),
      radial-gradient(circle at 88% 32%, rgba(0, 255, 255, 0.1), transparent 24%);
    pointer-events: none;
  }
`;

const CommandDeck = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const CommandStat = styled.div`
  border: 1px solid rgba(0, 255, 65, 0.18);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  padding: 10px 12px;
`;

const CommandLabel = styled.div`
  color: #89a4bf;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
`;

const CommandValue = styled.div`
  color: #a7ffd0;
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
`;

const SectionHeading = styled.h4`
  margin: 0 0 8px;
  color: #8dffb2;
  font-size: 0.95rem;
  font-family: 'Orbitron', sans-serif;
  display: flex;
  align-items: center;
  gap: 7px;
`;

const SectionSubtle = styled.div`
  color: #7c8da7;
  font-size: 0.75rem;
  margin-bottom: 10px;
  line-height: 1.45;
`;

const RowWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const TinyButton = styled.button`
  border: 1px solid ${({ danger }) => (danger ? 'rgba(255, 92, 133, 0.55)' : 'rgba(0, 255, 65, 0.55)')};
  background: ${({ active, danger }) =>
    danger
      ? 'rgba(255, 92, 133, 0.1)'
      : active
        ? 'linear-gradient(135deg, #00ff41 0%, #00e03a 55%, #00c734 100%)'
        : 'rgba(0, 255, 65, 0.06)'};
  color: ${({ active, danger }) => (danger ? '#ff8ba9' : active ? '#031006' : '#8dffb2')};
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: ${({ active }) => (active ? '0 6px 18px rgba(0, 224, 58, 0.2)' : 'none')};
`;

const MetaLine = styled.div`
  color: #99aac8;
  font-size: 0.78rem;
  margin-bottom: 8px;
`;

const FeedBox = styled.div`
  border: 1px solid rgba(0, 255, 65, 0.2);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.26), rgba(5, 10, 18, 0.32));
  max-height: 180px;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FeedItem = styled.div`
  font-size: 0.75rem;
  color: #9be7be;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
`;

const RoamingArena = styled.div`
  position: relative;
  height: 320px;
  border: 1px solid rgba(0, 255, 65, 0.25);
  border-radius: 14px;
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 255, 65, 0.08) 0%, transparent 35%),
    radial-gradient(circle at 80% 80%, rgba(0, 255, 255, 0.08) 0%, transparent 35%),
    linear-gradient(160deg, rgba(0, 0, 0, 0.4), rgba(6, 12, 22, 0.55));
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    0 16px 32px rgba(0, 0, 0, 0.22);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: -20% -40%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.08), transparent);
    transform: rotate(-8deg);
    animation: ${roamingSweep} 7s linear infinite;
    pointer-events: none;
  }
`;

const RoamingNode = styled.button`
  position: absolute;
  left: ${({ $x }) => `${$x}%`};
  top: ${({ $y }) => `${$y}%`};
  transform: translate(-50%, -50%);
  border: 1px solid ${({ $bot, $selected }) =>
    $selected ? '#00ffff' : $bot ? 'rgba(255, 152, 97, 0.8)' : 'rgba(0, 255, 65, 0.7)'};
  border-radius: 999px;
  background: ${({ $bot }) => ($bot ? 'rgba(255, 116, 67, 0.22)' : 'rgba(0, 255, 65, 0.18)')};
  color: ${({ $bot }) => ($bot ? '#ffb08f' : '#9fffd1')};
  font-size: 0.64rem;
  padding: 5px 9px;
  font-family: 'Share Tech Mono', monospace;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: ${({ $selected }) => ($selected ? '0 0 20px rgba(0,255,255,0.45)' : '0 0 10px rgba(0,255,65,0.2)')};
  backdrop-filter: blur(6px);
`;

const TargetMeta = styled.div`
  border: 1px solid rgba(0, 255, 65, 0.25);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.24), rgba(7, 14, 24, 0.34));
  padding: 10px;
  margin-bottom: 8px;
  font-size: 0.75rem;
  color: #9fffd1;
`;

const ArenaLegend = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  color: #90a8c4;
  font-size: 0.72rem;
`;

const LegendDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
  margin-right: 6px;
  background: ${({ $bot }) => ($bot ? 'rgba(255, 116, 67, 0.7)' : 'rgba(0, 255, 65, 0.75)')};
  box-shadow: ${({ $bot }) => ($bot ? '0 0 10px rgba(255,116,67,0.4)' : '0 0 10px rgba(0,255,65,0.35)')};
`;

const DeviceOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(4, 8, 16, 0.92);
  display: flex;
  flex-direction: column;
`;

const DeviceOverlayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.35);
  background: linear-gradient(145deg, rgba(9, 14, 27, 0.98), rgba(12, 20, 36, 0.98));
`;

const DeviceOverlayTitle = styled.h3`
  margin: 0;
  color: #8dffb2;
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 0.4px;
`;

const DeviceOverlayActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LaptopWorkspaceShell = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 22px;
  padding: 12px 14px 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const LaptopDeviceSelection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  align-items: center;
  justify-content: center;
`;

const LaptopDeviceButton = styled(motion.button)`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg,
    ${({ $active }) => ($active ? 'rgba(0, 255, 65, 0.2)' : 'rgba(0, 0, 0, 0.6)')} 0%,
    ${({ $active }) => ($active ? 'rgba(0, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)')} 100%);
  backdrop-filter: blur(10px);
  border: 2px solid ${({ $active }) => ($active ? 'rgba(0, 255, 65, 0.6)' : 'rgba(0, 255, 65, 0.3)')};
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${({ $active }) => ($active ? '#00ff41' : '#888')};
  font-family: 'Orbitron', sans-serif;
  padding: 0;

  &:hover {
    border-color: rgba(0, 255, 255, 0.6);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
    transform: translateY(-3px);
    color: #00ff41;
  }

  svg {
    font-size: 1.8rem;
  }
`;

const LaptopDeviceLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const LaptopWorkspaceCanvas = styled.div`
  min-width: 0;
  height: 100%;
`;

const DeviceOverlayBody = styled.div`
  flex: 1;
  overflow: auto;
`;

const PhoneWorkspaceViewport = styled.div`
  height: calc(100vh - 56px);
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 6px 0 0;
`;

const PhoneWorkspaceScale = styled.div`
  transform: scale(0.78);
  transform-origin: top center;
  width: calc(100% / 0.78);
  display: flex;
  justify-content: center;

  @media (max-height: 920px) {
    transform: scale(0.72);
    width: calc(100% / 0.72);
  }

  @media (max-height: 820px) {
    transform: scale(0.66);
    width: calc(100% / 0.66);
  }
`;

const LaptopWorkspaceScale = styled.div`
  transform: scale(0.912);
  transform-origin: center center;
  width: calc(100% / 0.912);
  display: flex;
  justify-content: center;

  @media (max-height: 920px) {
    transform: scale(0.84);
    width: calc(100% / 0.84);
  }

  @media (max-height: 820px) {
    transform: scale(0.768);
    width: calc(100% / 0.768);
  }
`;

const LaptopWorkspaceViewport = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 0;
`;

const baseHv1State = {
  money: 10000,
  devices: defaultDevices,
  upgrades: defaultUpgrades,
  transactionHistory: defaultTransactionHistory
};

const getUserStateKey = (username) => `${HV1_STATE_KEY}_${username}`;
const normalizeHv1State = (rawState) => ({
  ...baseHv1State,
  ...(rawState || {}),
  devices: {
    ...defaultDevices,
    ...(rawState?.devices || {})
  },
  upgrades: {
    ...defaultUpgrades,
    ...(rawState?.upgrades || {})
  },
  transactionHistory:
    Array.isArray(rawState?.transactionHistory) && rawState.transactionHistory.length > 0
      ? rawState.transactionHistory
      : defaultTransactionHistory
});

const toSimulatedUserIp = (username) => {
  if (!username || typeof username !== 'string') return 'SIM-000.000.000-USR';
  let hash = 0;
  for (let i = 0; i < username.length; i += 1) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const uniqueID = Math.abs(hash) % 254 + 1;
  const subnet = Math.abs(hash >> 8) % 254 + 1;
  const segment = Math.abs(hash >> 16) % 254 + 1;
  const toOctet = (num) => String(num).padStart(3, '0');
  return `SIM-${toOctet(segment)}.${toOctet(subnet)}.${toOctet(uniqueID)}-USR`;
};

const MainPhoneBridge = ({ user, hv1State }) => {
  const { dispatch, gameState } = useMainGame();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!user?.username) {
      setIsHydrated(true);
      return;
    }
    setIsHydrated(false);
    const phonePurchased = Boolean(hv1State?.devices?.phone?.purchased);
    const phoneOnline = Boolean(hv1State?.devices?.phone?.online);
    const laptopOnline = Boolean(hv1State?.devices?.laptop?.online);
    const routerOnline = Boolean(hv1State?.devices?.router?.online);
    const phoneModel = hv1State?.devices?.phone?.model || 'Basic Phone';

    dispatch({ type: 'SET_USER', payload: user });
    dispatch({
      type: 'SET_PHONE',
      payload: {
        owned: phonePurchased,
        model: phonePurchased ? phoneModel : null,
        battery: 100,
        money: hv1State?.money ?? 0,
        contacts: [],
        messages: [],
        emails: [],
        internetHistory: [],
        lastCharge: Date.now(),
        securityLevel: 1,
        pin: '0000'
      }
    });
    dispatch({
      type: 'SET_DEVICES',
      payload: {
        laptop: {
          powered: laptopOnline,
          connected: laptopOnline,
          internetType: laptopOnline ? 'wifi' : null,
          battery: 100,
          lastUsed: null,
          userAccount: null,
          loggedIn: false
        },
        router: {
          powered: routerOnline,
          password: null,
          ssid: null,
          connectedDevices: [],
          internetType: null
        },
        phone: {
          powered: phoneOnline,
          connected: phoneOnline,
          internetType: phoneOnline ? 'wifi' : null,
          battery: 100,
          lastUsed: null
        }
      }
    });
    setIsHydrated(true);
  }, [
    dispatch,
    user,
    hv1State?.money,
    hv1State?.devices?.phone?.purchased,
    hv1State?.devices?.phone?.model,
    hv1State?.devices?.phone?.online,
    hv1State?.devices?.laptop?.online,
    hv1State?.devices?.router?.online
  ]);

  // Guard against late context overwrites from provider/localStorage hydration.
  useEffect(() => {
    if (!user?.username) return;
    const phonePurchased = Boolean(hv1State?.devices?.phone?.purchased);
    const phoneOnline = Boolean(hv1State?.devices?.phone?.online);
    const model = hv1State?.devices?.phone?.model || 'Basic Phone';

    if (phonePurchased && !gameState?.phone?.owned) {
      dispatch({
        type: 'SET_PHONE',
        payload: {
          ...(gameState?.phone || {}),
          owned: true,
          model
        }
      });
    }

    if (gameState?.devices?.phone?.connected !== phoneOnline || gameState?.devices?.phone?.powered !== phoneOnline) {
      dispatch({
        type: 'SET_DEVICES',
        payload: {
          ...(gameState?.devices || {}),
          phone: {
            ...(gameState?.devices?.phone || {}),
            powered: phoneOnline,
            connected: phoneOnline,
            internetType: phoneOnline ? 'wifi' : null
          }
        }
      });
    }
  }, [
    dispatch,
    gameState?.phone,
    gameState?.devices,
    hv1State?.devices?.phone?.purchased,
    hv1State?.devices?.phone?.online,
    hv1State?.devices?.phone?.model,
    user?.username
  ]);

  if (!isHydrated) return null;
  return <MainPhone user={user} hideEmbeddedLaptopKeyboard />;
};

function App() {
  const [activePage, setActivePage] = useState('home');
  const [cart, setCart] = useState([]);
  const [activeInterface, setActiveInterface] = useState(null);
  const [navExpanded, setNavExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [hv1State, setHv1State] = useState(() => {
    const rawSession = localStorage.getItem(SESSION_KEY);
    if (!rawSession) return baseHv1State;
    try {
      const parsedUser = JSON.parse(rawSession);
      const stateKey = getUserStateKey(parsedUser.username);
      const stateRaw = localStorage.getItem(stateKey);
      return stateRaw ? normalizeHv1State(JSON.parse(stateRaw)) : baseHv1State;
    } catch {
      return baseHv1State;
    }
  });
  const [selectedMissionId, setSelectedMissionId] = useState(MISSION_CATALOG[0].id);
  const [attackTool, setAttackTool] = useState('recon');
  const [activityFeed, setActivityFeed] = useState([]);
  const [missionProgress, setMissionProgress] = useState({});
  const [targetProfiles, setTargetProfiles] = useState([]);
  const [roamingEntities, setRoamingEntities] = useState([]);
  const [selectedRoamingId, setSelectedRoamingId] = useState(null);
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [incidentUnread, setIncidentUnread] = useState(false);
  const [showIncidentDetails, setShowIncidentDetails] = useState(false);
  const [showMoneyDetails, setShowMoneyDetails] = useState(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');

  const persistState = (username, nextState) => {
    const normalized = normalizeHv1State(nextState);
    localStorage.setItem(getUserStateKey(username), JSON.stringify(normalized));
    setHv1State(normalized);
  };

  const appendActivity = useCallback((line) => {
    setActivityFeed(prev => [`${new Date().toLocaleTimeString()} - ${line}`, ...prev].slice(0, 20));
  }, []);

  const registerIncident = useCallback((incident) => {
    setIncidentHistory((prev) => [incident, ...prev].slice(0, 10));
    setActiveIncident(incident);
    setIncidentUnread(true);
  }, []);

  const createMissionTarget = useCallback((index, missionId) => {
    const segment = String((index * 29 + 77) % 255).padStart(3, '0');
    const subnet = String((index * 41 + 59) % 255).padStart(3, '0');
    const host = String((index * 67 + 31) % 255).padStart(3, '0');
    const playerLike = ENABLE_SIMULATED_BOTS ? index % 3 === 0 : true;
    const missionPrefix = missionId === 'phishing-sweep'
      ? 'SW'
      : missionId === 'malware-hive'
        ? 'MW'
        : 'DR';

    return {
      id: `${missionId}-${index}`,
      username: playerLike ? `${missionPrefix}-PLAYER-${index + 1}` : `${missionPrefix}-BOT-${index + 1}`,
      simulatedId: `SIM-${segment}.${subnet}.${host}-${playerLike ? 'USR' : 'DEV'}`,
      defenseLevel: 2 + (index % 7),
      isBot: !playerLike,
      status: 'online'
    };
  }, []);

  function syncHv1StateToMainGameStorage(username, sourceState) {
    if (!username || !sourceState) return;
    const mainStateKey = `hackhilis_game_state_${username}`;
    const mainStateRaw = localStorage.getItem(mainStateKey);
    let mainState = {};
    try {
      mainState = mainStateRaw ? JSON.parse(mainStateRaw) : {};
    } catch {
      mainState = {};
    }

    const phonePurchased = sourceState.devices.phone.purchased;
    const bridgedState = {
      ...mainState,
      user: mainState.user || { username },
      level: mainState.level ?? 1,
      experience: mainState.experience ?? 0,
      gameMode: mainState.gameMode || 'free',
      ipAddress: /^SIM-\d{3}\.\d{3}\.\d{3}-USR$/.test(mainState.ipAddress || '')
        ? mainState.ipAddress
        : toSimulatedUserIp(username),
      money: mainState.money ?? sourceState.money ?? 10000,
      skills: {
        hacking: 0,
        networking: 0,
        cryptography: 0,
        socialEngineering: 0,
        forensics: 0,
        malware: 0,
        ...(mainState.skills || {})
      },
      equipment: {
        laptop: null,
        router: null,
        vpn: null,
        tools: [],
        ...(mainState.equipment || {})
      },
      internet: {
        connected: false,
        type: null,
        provider: null,
        cost: 0,
        ...(mainState.internet || {})
      },
      phone: {
        ...(mainState.phone || {}),
        owned: phonePurchased,
        model: phonePurchased ? sourceState.devices.phone.model : null,
        battery: mainState.phone?.battery ?? 100,
        money: mainState.phone?.money ?? 0,
        contacts: mainState.phone?.contacts ?? [],
        messages: mainState.phone?.messages ?? [],
        emails: mainState.phone?.emails ?? [],
        internetHistory: mainState.phone?.internetHistory ?? [],
        lastCharge: mainState.phone?.lastCharge ?? Date.now(),
        securityLevel: mainState.phone?.securityLevel ?? 1
      },
      devices: {
        ...(mainState.devices || {}),
        phone: {
          ...(mainState.devices?.phone || {}),
          powered: sourceState.devices.phone.online,
          connected: sourceState.devices.phone.online,
          internetType: sourceState.devices.phone.online ? 'wifi' : null,
          battery: mainState.devices?.phone?.battery ?? 100,
          lastUsed: mainState.devices?.phone?.lastUsed ?? null
        },
        laptop: {
          ...(mainState.devices?.laptop || {}),
          powered: sourceState.devices.laptop.online,
          connected: sourceState.devices.laptop.online
        },
        router: {
          ...(mainState.devices?.router || {}),
          powered: sourceState.devices.router.online
        }
      }
    };

    localStorage.setItem(mainStateKey, JSON.stringify(bridgedState));
    localStorage.setItem('hackhilis_user', JSON.stringify({ username }));
  }

  useEffect(() => {
    if (!currentUser?.username) {
      return undefined;
    }
    const generatedTargets = Array.from({ length: 10 }, (_, index) => createMissionTarget(index, selectedMissionId));
    setTargetProfiles(generatedTargets);
    appendActivity(`mission uplink ready: ${MISSION_CATALOG.find((mission) => mission.id === selectedMissionId)?.title}`);
    return undefined;
  }, [appendActivity, createMissionTarget, currentUser?.username, selectedMissionId]);

  useEffect(() => {
    setRoamingEntities((prev) =>
      targetProfiles.map((entity) => {
        const existing = prev.find((item) => item.id === entity.id);
        return existing
          ? { ...existing, ...entity }
          : {
              ...entity,
              x: 10 + Math.random() * 80,
              y: 10 + Math.random() * 80,
              vx: (Math.random() - 0.5) * 0.7,
              vy: (Math.random() - 0.5) * 0.7
            };
      })
    );
  }, [targetProfiles]);

  useEffect(() => {
    if (roamingEntities.length === 0) return undefined;
    const ticker = setInterval(() => {
      setRoamingEntities((prev) =>
        prev.map((entity) => {
          let nextX = entity.x + entity.vx;
          let nextY = entity.y + entity.vy;
          let nextVx = entity.vx;
          let nextVy = entity.vy;

          if (nextX < 4 || nextX > 96) {
            nextVx = -nextVx;
            nextX = Math.min(96, Math.max(4, nextX));
          }
          if (nextY < 6 || nextY > 94) {
            nextVy = -nextVy;
            nextY = Math.min(94, Math.max(6, nextY));
          }

          return {
            ...entity,
            x: nextX,
            y: nextY,
            vx: nextVx,
            vy: nextVy
          };
        })
      );
    }, 130);

    return () => clearInterval(ticker);
  }, [roamingEntities.length]);

  useEffect(() => {
    if (!selectedRoamingId) return;
    if (!roamingEntities.some((entity) => entity.id === selectedRoamingId)) {
      setSelectedRoamingId(null);
    }
  }, [roamingEntities, selectedRoamingId]);

  useEffect(() => {
    if (!ENABLE_SIMULATED_BOTS) {
      return undefined;
    }
    const activeMission = MISSION_CATALOG.find((mission) => mission.id === selectedMissionId);
    if (!currentUser?.username || !activeMission || targetProfiles.length === 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      const raw =
        activeMission.pressure === 'hybrid'
          ? (Math.random() > 0.5 ? 'malware' : 'bruteforce')
          : activeMission.pressure;
      const chosenAttack = raw === 'phishing' ? 'malware' : raw;
      const target = targetProfiles[Math.floor(Math.random() * targetProfiles.length)];
      if (!target) return;

      const selfTarget = Math.random() > 0.62;
      const successChance = 0.35;
      const success = Math.random() < successChance;
      appendActivity(`${chosenAttack} wave from ${target.username} (${target.simulatedId}) ${success ? 'landed' : 'was blocked'}`);

      if (selfTarget && success) {
        const loss = chosenAttack === 'malware' ? 220 : 120;
        const incident = {
          id: `${Date.now()}-${target.id}`,
          timestamp: new Date().toLocaleString(),
          attackType: chosenAttack,
          sourceName: target.username,
          sourceId: target.simulatedId,
          missionTitle: activeMission.title,
          fundsLost: loss,
          status: 'breach confirmed'
        };
        setHv1State((prev) => {
          const nextState = withTransaction({
            ...prev,
            money: Math.max(0, prev.money - loss)
          }, {
            type: 'debit',
            title: `${chosenAttack.toUpperCase()} Breach Loss`,
            amount: loss,
            note: `Simulated ${chosenAttack} attack from ${target.username} (${target.simulatedId}).`,
            category: 'security'
          });
          localStorage.setItem(getUserStateKey(currentUser.username), JSON.stringify(nextState));
          syncHv1StateToMainGameStorage(currentUser.username, nextState);
          return nextState;
        });
        registerIncident(incident);
        appendActivity(`ALERT: ${chosenAttack} breach confirmed on your operation. Loss -$${loss}`);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [appendActivity, currentUser?.username, registerIncident, selectedMissionId, syncHv1StateToMainGameStorage, targetProfiles]);

  useEffect(() => {
    if (ENABLE_SIMULATED_BOTS) return;
    setIncidentHistory([]);
    setActiveIncident(null);
    setIncidentUnread(false);
    setShowIncidentDetails(false);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    setCurrentUser(userData);
    const stateRaw = localStorage.getItem(getUserStateKey(userData.username));
    const hydratedState = stateRaw ? normalizeHv1State(JSON.parse(stateRaw)) : baseHv1State;
    setHv1State(hydratedState);
    syncHv1StateToMainGameStorage(userData.username, hydratedState);
    setActivePage('home');
    setCart([]);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setHv1State(baseHv1State);
    setCart([]);
    setActiveInterface(null);
    setIncidentHistory([]);
    setActiveIncident(null);
    setIncidentUnread(false);
    setShowIncidentDetails(false);
    setShowMoneyDetails(false);
  };

  if (currentUser) {
    const routerOnline = hv1State.devices.router.online;
    const connectedToRouter = (deviceType) =>
      deviceType !== 'router' && routerOnline && hv1State.devices[deviceType].online;
    const connectedDeviceCount = ['phone', 'laptop'].filter((type) => connectedToRouter(type)).length;
    const currentMission = MISSION_CATALOG.find((mission) => mission.id === selectedMissionId) || MISSION_CATALOG[0];
    const currentMissionProgress = missionProgress[selectedMissionId] || 0;
    const selectedRoamingEntity = roamingEntities.find((entity) => entity.id === selectedRoamingId) || null;
    const ownedUpgrades = hv1State.upgrades || defaultUpgrades;
    const transactionHistory = hv1State.transactionHistory || defaultTransactionHistory;
    const totalSpent = transactionHistory
      .filter((entry) => entry.type === 'debit')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalEarned = transactionHistory
      .filter((entry) => entry.type === 'credit')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const rewardMultiplier =
      1 +
      (ownedUpgrades.signalBooster?.purchased ? 0.05 : 0);

    const registerMissionProgress = (increment, rewardMultiplier = 1) => {
      const boostedIncrement = Math.round(increment * (ownedUpgrades.signalBooster?.purchased ? 1.15 : 1));
      const nextProgress = Math.min(100, currentMissionProgress + boostedIncrement);
      setMissionProgress((prev) => ({ ...prev, [selectedMissionId]: nextProgress }));

      if (currentMissionProgress < 100 && nextProgress >= 100) {
        const reward = Math.round(currentMission.reward * rewardMultiplier);
        const updated = withTransaction({ ...hv1State, money: hv1State.money + reward }, {
          type: 'credit',
          title: `${currentMission.title} Mission Reward`,
          amount: reward,
          note: `Mission completion payout for ${currentMission.title}.`,
          category: 'mission'
        });
        persistState(currentUser.username, updated);
        syncHv1StateToMainGameStorage(currentUser.username, updated);
        appendActivity(`mission complete: ${currentMission.title} reward +$${reward}`);
      }
    };

    const launchRoamingAttack = (entity) => {
      if (!entity) return;
      const baseChance = entity.isBot ? 0.58 : 0.47;
      const gearBonus =
        (attackTool === 'malware' && ownedUpgrades.malwareSandbox?.purchased ? 0.1 : 0) +
        ((attackTool === 'recon' || attackTool === 'bruteforce') && ownedUpgrades.exploitDatabase?.purchased ? 0.08 : 0);
      const toolBonus = (attackTool === currentMission.recommendedTool ? 0.13 : attackTool === 'recon' ? 0.05 : 0.08) + gearBonus;
      const success = Math.random() < Math.min(0.93, baseChance + toolBonus);

      appendActivity(
        `${attackTool} against ${entity.username} (${entity.simulatedId}) ${success ? 'succeeded' : 'was blocked'}`
      );

      if (success) {
        const reward = entity.isBot ? 140 : 220;
        const creditedReward = Math.round(reward * rewardMultiplier);
        const updated = withTransaction({ ...hv1State, money: hv1State.money + creditedReward }, {
          type: 'credit',
          title: `${attackTool.toUpperCase()} Target Reward`,
          amount: creditedReward,
          note: `Successful simulated breach against ${entity.username} (${entity.simulatedId}).`,
          category: 'combat'
        });
        persistState(currentUser.username, updated);
        syncHv1StateToMainGameStorage(currentUser.username, updated);
        registerMissionProgress(entity.isBot ? 16 : 22, entity.isBot ? rewardMultiplier : rewardMultiplier * 1.15);
      } else {
        registerMissionProgress(5);
      }
    };

    const isCatalogPurchased = (item) => (
      item.kind === 'device'
        ? hv1State.devices[item.id].purchased
        : hv1State.upgrades[item.id]?.purchased
    );

    const catalog = [
      { id: 'phone', kind: 'device', title: 'Basic Phone', description: 'Entry-level smartphone with basic security', price: 500 },
      { id: 'laptop', kind: 'device', title: 'Basic Laptop', description: 'Entry-level laptop for beginners', price: 1000 },
      { id: 'router', kind: 'device', title: 'Basic Router', description: 'Standard home router', price: 500 },
      { id: 'phishingKit', kind: 'upgrade', title: 'Malware Lab Kit', description: defaultUpgrades.phishingKit.description, price: defaultUpgrades.phishingKit.price },
      { id: 'malwareSandbox', kind: 'upgrade', title: 'Malware Sandbox', description: defaultUpgrades.malwareSandbox.description, price: defaultUpgrades.malwareSandbox.price },
      { id: 'stealthVpn', kind: 'upgrade', title: 'Stealth VPN', description: defaultUpgrades.stealthVpn.description, price: defaultUpgrades.stealthVpn.price }
    ];

    const addToCart = (item) => {
      if (isCatalogPurchased(item)) {
        return;
      }
      if (cart.some((cartItem) => cartItem.id === item.id)) {
        return;
      }
      setCart((prev) => [...prev, item]);
    };

    const removeFromCart = (id) => {
      setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

    const checkoutCart = () => {
      if (cart.length === 0) {
        return;
      }
      if (hv1State.money < cartTotal) {
        alert('Insufficient funds for checkout.');
        return;
      }

      const updatedDevices = { ...hv1State.devices };
      const updatedUpgrades = { ...hv1State.upgrades };
      cart.forEach((item) => {
        if (item.kind === 'device' && !updatedDevices[item.id].purchased) {
          updatedDevices[item.id] = {
            ...updatedDevices[item.id],
            purchased: true,
            model: item.title
          };
        }
        if (item.kind === 'upgrade' && !updatedUpgrades[item.id].purchased) {
          updatedUpgrades[item.id] = {
            ...updatedUpgrades[item.id],
            purchased: true
          };
        }
      });

      const updated = withTransaction({
        ...hv1State,
        money: hv1State.money - cartTotal,
        devices: updatedDevices,
        upgrades: updatedUpgrades
      }, {
        type: 'debit',
        title: 'Store Checkout',
        amount: cartTotal,
        note: `Purchased: ${cart.map((item) => item.title).join(', ')}.`,
        category: 'store'
      });
      persistState(currentUser.username, updated);
      syncHv1StateToMainGameStorage(currentUser.username, updated);
      setCart([]);
      setActivePage('devices');
    };

    const togglePower = (deviceType) => {
      const device = hv1State.devices[deviceType];
      if (!device.purchased) return;
      const nextOnline = !device.online;
      let updated = {
        ...hv1State,
        devices: {
          ...hv1State.devices,
          [deviceType]: { ...device, online: nextOnline }
        }
      };

      // If router is turned off, all client devices lose router connectivity.
      if (deviceType === 'router' && !nextOnline) {
        updated = {
          ...updated,
          devices: {
            ...updated.devices,
            phone: { ...updated.devices.phone, online: false },
            laptop: { ...updated.devices.laptop, online: false }
          }
        };
      }

      persistState(currentUser.username, updated);
      syncHv1StateToMainGameStorage(currentUser.username, updated);
      if (deviceType === 'phone' || deviceType === 'laptop') {
        setActiveInterface(nextOnline ? deviceType : null);
      }
      if (deviceType === 'router' && !nextOnline) {
        setActiveInterface(null);
      }
    };

    const creditOpsEarnings = (amount, meta = {}) => {
      if (!amount || amount <= 0) return;
      const updated = withTransaction({
        ...hv1State,
        money: hv1State.money + amount
      }, {
        type: 'credit',
        title: meta.title || 'Ops training credit',
        amount,
        note: meta.note || 'Simulated public-WiFi / phishing operation.',
        category: 'ops'
      });
      persistState(currentUser.username, updated);
      syncHv1StateToMainGameStorage(currentUser.username, updated);
      appendActivity(`ops payout +$${amount}${meta.title ? ` (${meta.title})` : ''}`);
    };

    const debitOpsSpend = (amount, meta = {}) => {
      if (!amount || amount <= 0) return false;
      if (hv1State.money < amount) return false;
      const updated = withTransaction({
        ...hv1State,
        money: hv1State.money - amount
      }, {
        type: 'debit',
        title: meta.title || 'Ops purchase',
        amount,
        note: meta.note || 'Simulated ops marketplace purchase.',
        category: 'ops'
      });
      persistState(currentUser.username, updated);
      syncHv1StateToMainGameStorage(currentUser.username, updated);
      appendActivity(`ops spend -$${amount}${meta.title ? ` (${meta.title})` : ''}`);
      return true;
    };

    const renderOps = () => (
      <OpsSurface money={hv1State.money} onEarn={creditOpsEarnings} onSpend={debitOpsSpend} />
    );

    const renderHome = () => (
      <PageContainer>
        <HeaderCard initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <PageTitle>Welcome back, {currentUser.username}</PageTitle>
          <PageSubtitle>Level 1 • 0 XP • Hit Ops for simulated public Wi‑Fi & phishing.</PageSubtitle>
        </HeaderCard>
        <Grid>
          <StatCardButton onClick={() => setShowMoneyDetails(true)}>
            <CardTitle><FaDollarSign /> Money</CardTitle>
            <StatValue>${hv1State.money.toLocaleString()}</StatValue>
            <PageSubtitle style={{ marginTop: '10px' }}>Click to view where your money was earned or spent.</PageSubtitle>
          </StatCardButton>
          <Card><CardTitle><FaChartLine /> Level</CardTitle><StatValue>1</StatValue></Card>
          <Card><CardTitle><FaShieldAlt /> Reputation</CardTitle><StatValue>0</StatValue></Card>
        </Grid>
      </PageContainer>
    );

    const getStoreProductVisual = (item) => {
      if (item.kind === 'device') {
        if (item.id === 'phone') {
          return {
            gradient: 'linear-gradient(148deg, #1c3a5c 0%, #0f1e32 48%, #17324d 100%)',
            Icon: FaMobileAlt,
            badge: 'Device'
          };
        }
        if (item.id === 'laptop') {
          return {
            gradient: 'linear-gradient(148deg, #283d5a 0%, #141e34 100%)',
            Icon: FaLaptop,
            badge: 'Device'
          };
        }
        return {
          gradient: 'linear-gradient(148deg, #1a4036 0%, #0c221c 100%)',
          Icon: FaWifi,
          badge: 'Network'
        };
      }
      const map = {
        phishingKit: { gradient: 'linear-gradient(148deg, #4a2d58 0%, #1c1228 100%)', Icon: FaSkullCrossbones, badge: 'Lab' },
        malwareSandbox: { gradient: 'linear-gradient(148deg, #322850 0%, #160f28 100%)', Icon: FaBug, badge: 'Lab' },
        stealthVpn: { gradient: 'linear-gradient(148deg, #1e4568 0%, #0f2034 100%)', Icon: FaNetworkWired, badge: 'Privacy' }
      };
      return map[item.id] || { gradient: 'linear-gradient(148deg, #2a2848 0%, #141020 100%)', Icon: FaShieldAlt, badge: 'Upgrade' };
    };

    const renderStore = () => {
      const hardwareItems = catalog.filter((i) => i.kind === 'device');
      const upgradeItems = catalog.filter((i) => i.kind === 'upgrade');
      const filteredHardware = hardwareItems.filter((item) => catalogItemMatchesSearch(item, storeSearchQuery));
      const filteredSoftware = upgradeItems.filter((item) => catalogItemMatchesSearch(item, storeSearchQuery));
      const searchTrimmed = storeSearchQuery.trim();
      const hasActiveSearch = searchTrimmed.length > 0;

      const renderCommerceCard = (item, index) => {
        const purchased = isCatalogPurchased(item);
        const inCart = cart.some((c) => c.id === item.id);
        const { gradient, Icon, badge } = getStoreProductVisual(item);

        return (
          <CommerceCard
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.35) }}
          >
            <CommerceCardVisual $gradient={gradient} style={{ position: 'relative' }}>
              <CommerceBadge>{badge}</CommerceBadge>
              <Icon aria-hidden />
            </CommerceCardVisual>
            <CommerceCardBody>
              <CommerceCardTitle>{item.title}</CommerceCardTitle>
              <CommerceDesc>{item.description}</CommerceDesc>
              <CommercePriceRow>
                <CommercePrice>
                  <small>USD</small>${item.price.toLocaleString()}
                </CommercePrice>
              </CommercePriceRow>
              <CommerceBtnPrimary
                type="button"
                onClick={() => addToCart(item)}
                disabled={purchased || inCart}
              >
                {purchased ? 'Purchased' : inCart ? 'In cart' : 'Add to cart'}
              </CommerceBtnPrimary>
            </CommerceCardBody>
          </CommerceCard>
        );
      };

      return (
        <PageContainer>
          <StoreHeaderRow>
            <StoreHero
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ marginBottom: 0 }}
            >
              <StoreHeroTitle>Urvan Cyber Store</StoreHeroTitle>
              <StoreSearchBar as="label">
                <FaSearch style={{ opacity: 0.65, flexShrink: 0 }} aria-hidden />
                <StoreSearchInput
                  type="search"
                  placeholder="Search catalog (e.g. laptop, VPN, sandbox)…"
                  value={storeSearchQuery}
                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Search store catalog"
                />
              </StoreSearchBar>
              <StoreTrustRow>
                <TrustPill>
                  <FaTruck /> Simulated worldwide delivery
                </TrustPill>
                <TrustPill>
                  <FaLock /> Checkout secured
                </TrustPill>
              </StoreTrustRow>
            </StoreHero>
            <CartSummaryCard
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              style={{
                borderColor: 'rgba(120, 200, 160, 0.35)',
                background: 'linear-gradient(165deg, rgba(16, 28, 46, 0.92) 0%, rgba(8, 14, 26, 0.95) 100%)',
                alignSelf: 'stretch',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: 140
              }}
            >
              <CartSummaryLabel>Your cart</CartSummaryLabel>
              <CartSummaryValue>
                <FaShoppingCart />
                {cart.length} item{cart.length === 1 ? '' : 's'}
              </CartSummaryValue>
              <PageSubtitle style={{ marginTop: 10, marginBottom: 0 }}>
                Subtotal <strong style={{ color: '#a7ffd0' }}>${cartTotal.toLocaleString()}</strong>
              </PageSubtitle>
              <PageSubtitle style={{ marginTop: 8, fontSize: '0.78rem', opacity: 0.85 }}>
                Balance ${hv1State.money.toLocaleString()}
              </PageSubtitle>
            </CartSummaryCard>
          </StoreHeaderRow>

          <StoreSectionBlock>
            <StoreSectionHeading>
              <StoreSectionTitle>Hardware</StoreSectionTitle>
              <StoreSectionHint>Phones, laptops, and network gear</StoreSectionHint>
            </StoreSectionHeading>
            {hasActiveSearch && filteredHardware.length === 0 ? (
              <StoreEmptyHint>No hardware matches &quot;{searchTrimmed}&quot;.</StoreEmptyHint>
            ) : (
              <CommerceGrid>{filteredHardware.map((item, i) => renderCommerceCard(item, i))}</CommerceGrid>
            )}
          </StoreSectionBlock>

          <StoreSectionBlock>
            <StoreSectionHeading>
              <StoreSectionTitle>Software</StoreSectionTitle>
              <StoreSectionHint>Kits, sandbox, VPN, and related tools</StoreSectionHint>
            </StoreSectionHeading>
            {hasActiveSearch && filteredSoftware.length === 0 ? (
              <StoreEmptyHint>No software matches &quot;{searchTrimmed}&quot;.</StoreEmptyHint>
            ) : (
              <CommerceGrid>{filteredSoftware.map((item, i) => renderCommerceCard(item, i))}</CommerceGrid>
            )}
          </StoreSectionBlock>

          <CartPanel initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <PageTitle style={{ fontSize: '1.35rem', marginBottom: 6 }}>Basket &amp; checkout</PageTitle>
            <PageSubtitle style={{ marginBottom: 14 }}>
              Review line items, then complete purchase. Insufficient balance blocks checkout—earn funds from missions first.
            </PageSubtitle>
            {cart.length === 0 ? (
              <PageSubtitle style={{ margin: 0 }}>Your basket is empty. Add hardware or software above.</PageSubtitle>
            ) : (
              <>
                {cart.map((item) => (
                  <CartLine key={`cart-${item.id}`} layout>
                    <div>
                      <CardTitle style={{ margin: '0 0 4px', fontSize: '1rem' }}>{item.title}</CardTitle>
                      <PageSubtitle style={{ margin: 0 }}>${item.price.toLocaleString()}</PageSubtitle>
                    </div>
                    <ActionButton type="button" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </ActionButton>
                  </CartLine>
                ))}
                <CartCheckoutRow>
                  <div>
                    <CartSummaryLabel style={{ marginBottom: 4 }}>Order total</CartSummaryLabel>
                    <CommercePrice as="div" style={{ fontSize: '1.5rem' }}>
                      <small>USD</small>${cartTotal.toLocaleString()}
                    </CommercePrice>
                  </div>
                  <BuyButton
                    type="button"
                    onClick={checkoutCart}
                    disabled={cartTotal === 0 || hv1State.money < cartTotal}
                    style={{ minWidth: 160 }}
                  >
                    Checkout
                  </BuyButton>
                </CartCheckoutRow>
              </>
            )}
          </CartPanel>
        </PageContainer>
      );
    };

    const renderDevices = () => (
      <PageContainer>
        <HeaderCard initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <PageTitle>Gadgets & Equipment</PageTitle>
          <PageSubtitle>Configure and manage your hacking equipment</PageSubtitle>
        </HeaderCard>
        <GadgetGrid>
          {[
            { id: 'phone', icon: FaPhone, title: 'Phone' },
            { id: 'laptop', icon: FaLaptop, title: 'Laptop' },
            { id: 'router', icon: FaWifi, title: 'Router' }
          ].map((entry) => {
            const device = hv1State.devices[entry.id];
            const Icon = entry.icon;
            return (
              <GadgetCard key={entry.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <GadgetHeader>
                  <div>
                    <GadgetName><Icon /> {entry.title}</GadgetName>
                    <GadgetModel>{device.model}</GadgetModel>
                    {entry.id !== 'router' && device.purchased && (
                      <GadgetModel>
                        Router: {connectedToRouter(entry.id) ? 'Connected' : 'Not Connected'}
                      </GadgetModel>
                    )}
                  </div>
                  <StatusText online={device.online}>{device.online ? 'Online' : 'Offline'}</StatusText>
                </GadgetHeader>

                {!device.purchased ? (
                  <>
                    <NoticeBox>
                      {entry.id === 'phone'
                        ? 'Please go to Store to buy a phone. Once purchased, it will reflect here automatically.'
                        : 'Please go to Store to buy this device. Once purchased, it will reflect here automatically.'}
                    </NoticeBox>
                    <ActionButton primary onClick={() => setActivePage('store')}>
                      Go to Store
                    </ActionButton>
                  </>
                ) : (
                  <GadgetActions>
                    <ActionButton onClick={() => togglePower(entry.id)}>
                      <FaPowerOff /> {device.online ? 'Power Off' : 'Power On'}
                    </ActionButton>
                    {device.online && (
                      <TemplateFrame>
                        {entry.id === 'phone' && (
                          <ActionButton
                            primary
                            onClick={() => {
                              syncHv1StateToMainGameStorage(currentUser.username, hv1State);
                              setActiveInterface('phone');
                            }}
                          >
                            Open Workspace
                          </ActionButton>
                        )}
                        {entry.id === 'laptop' && (
                          <ActionButton
                            primary
                            style={{ marginTop: '10px' }}
                            onClick={() => {
                              syncHv1StateToMainGameStorage(currentUser.username, hv1State);
                              setActiveInterface('laptop');
                            }}
                          >
                            Open Workspace
                          </ActionButton>
                        )}
                        {entry.id === 'router' && (
                          <RouterTemplate>
                            <RouterRow><span>SSID</span><span>HackHilis-Net</span></RouterRow>
                            <RouterRow><span>Status</span><span>{routerOnline ? 'Connected' : 'Offline'}</span></RouterRow>
                            <RouterRow style={{ borderBottom: 'none' }}><span>Devices</span><span>{connectedDeviceCount} online</span></RouterRow>
                          </RouterTemplate>
                        )}
                      </TemplateFrame>
                    )}
                    <NoticeBox style={{ borderColor: '#00ff41', color: '#00ff41', background: 'rgba(0,255,65,0.08)' }}>
                      <FaCheckCircle /> purchased from store
                    </NoticeBox>
                  </GadgetActions>
                )}
              </GadgetCard>
            );
          })}
        </GadgetGrid>
      </PageContainer>
    );

    return (
      <AppShell>
        <Sidebar $expanded={navExpanded}>
          <NavHeader $expanded={navExpanded}>
            <NavLogo $expanded={navExpanded}>HackHilis V2</NavLogo>
            <ToggleButton onClick={() => setNavExpanded((prev) => !prev)}>
              {navExpanded ? <FaChevronLeft /> : <FaBars />}
            </ToggleButton>
          </NavHeader>
          <NavItems $expanded={navExpanded}>
            <NavButton $expanded={navExpanded} active={activePage === 'home'} onClick={() => setActivePage('home')}>
              <NavIcon $expanded={navExpanded}><FaHome /></NavIcon>
              <NavLabel $expanded={navExpanded}>Home</NavLabel>
            </NavButton>
            <NavButton $expanded={navExpanded} active={activePage === 'store'} onClick={() => setActivePage('store')}>
              <NavIcon $expanded={navExpanded}><FaStore /></NavIcon>
              <NavLabel $expanded={navExpanded}>Store</NavLabel>
            </NavButton>
            <NavButton $expanded={navExpanded} active={activePage === 'devices'} onClick={() => setActivePage('devices')}>
              <NavIcon $expanded={navExpanded}><FaMobileAlt /></NavIcon>
              <NavLabel $expanded={navExpanded}>Devices</NavLabel>
            </NavButton>
            <NavButton $expanded={navExpanded} active={activePage === 'ops'} onClick={() => setActivePage('ops')}>
              <NavIcon $expanded={navExpanded}><FaBroadcastTower /></NavIcon>
              <NavLabel $expanded={navExpanded}>Ops</NavLabel>
            </NavButton>
          </NavItems>
          <UserFooter>
            <NavButton $expanded={navExpanded} onClick={handleLogout}>
              <NavIcon $expanded={navExpanded}><FaSignOutAlt /></NavIcon>
              <NavLabel $expanded={navExpanded}>Logout</NavLabel>
            </NavButton>
          </UserFooter>
        </Sidebar>
        <Main $expanded={navExpanded}>
          {activeIncident && (
            <AlertStrip $unread={incidentUnread} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <AlertText>
                <AlertTitle $unread={incidentUnread}>
                  <FaBell /> {incidentUnread ? 'You Have Been Hacked' : 'Latest Security Incident'}
                </AlertTitle>
                <AlertMeta>
                  {`${activeIncident.attackType.toUpperCase()} breach from ${activeIncident.sourceName} during ${activeIncident.missionTitle}. Funds lost: $${activeIncident.fundsLost}.`}
                </AlertMeta>
              </AlertText>
              <AlertActions>
                <TinyButton onClick={() => { setShowIncidentDetails(true); setIncidentUnread(false); }}>
                  View Details
                </TinyButton>
                <TinyButton onClick={() => setIncidentUnread(false)}>
                  Dismiss
                </TinyButton>
              </AlertActions>
            </AlertStrip>
          )}
          {activePage === 'home' && renderHome()}
          {activePage === 'store' && renderStore()}
          {activePage === 'devices' && renderDevices()}
          {activePage === 'ops' && renderOps()}
        </Main>
        {ENABLE_SIMULATED_BOTS && showIncidentDetails && activeIncident && (
          <IncidentOverlay onClick={() => setShowIncidentDetails(false)}>
            <IncidentCard onClick={(event) => event.stopPropagation()}>
              <PageTitle style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Security Incident Report</PageTitle>
              <PageSubtitle>Review the latest simulated breach against your operation.</PageSubtitle>
              <IncidentGrid>
                <IncidentField>
                  <IncidentLabel>Status</IncidentLabel>
                  <IncidentValue>{activeIncident.status}</IncidentValue>
                </IncidentField>
                <IncidentField>
                  <IncidentLabel>Time</IncidentLabel>
                  <IncidentValue>{activeIncident.timestamp}</IncidentValue>
                </IncidentField>
                <IncidentField>
                  <IncidentLabel>Attack Type</IncidentLabel>
                  <IncidentValue>{activeIncident.attackType.toUpperCase()}</IncidentValue>
                </IncidentField>
                <IncidentField>
                  <IncidentLabel>Mission</IncidentLabel>
                  <IncidentValue>{activeIncident.missionTitle}</IncidentValue>
                </IncidentField>
                <IncidentField>
                  <IncidentLabel>Source</IncidentLabel>
                  <IncidentValue>{activeIncident.sourceName}</IncidentValue>
                </IncidentField>
                <IncidentField>
                  <IncidentLabel>Source Fake IP</IncidentLabel>
                  <IncidentValue>{activeIncident.sourceId}</IncidentValue>
                </IncidentField>
                <IncidentField>
                  <IncidentLabel>Funds Lost</IncidentLabel>
                  <IncidentValue>${activeIncident.fundsLost}</IncidentValue>
                </IncidentField>
                <IncidentField>
                  <IncidentLabel>Stored Reports</IncidentLabel>
                  <IncidentValue>{incidentHistory.length}</IncidentValue>
                </IncidentField>
              </IncidentGrid>
              <NoticeBox style={{ marginTop: '14px', marginBottom: '0', borderColor: 'rgba(255, 92, 133, 0.35)', color: '#ffc0cf', background: 'rgba(255, 92, 133, 0.07)' }}>
                This is a simulation-only incident report. No real network activity or real IP targeting occurred.
              </NoticeBox>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <ActionButton onClick={() => setShowIncidentDetails(false)}>Close Report</ActionButton>
              </div>
            </IncidentCard>
          </IncidentOverlay>
        )}
        {showMoneyDetails && (
          <IncidentOverlay onClick={() => setShowMoneyDetails(false)}>
            <IncidentCard onClick={(event) => event.stopPropagation()}>
              <PageTitle style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Money Details</PageTitle>
              <PageSubtitle>Review how your funds have been earned, spent, or lost in the simulation.</PageSubtitle>
              <TransactionSummary>
                <TransactionSummaryCard>
                  <IncidentLabel>Current Balance</IncidentLabel>
                  <IncidentValue>${hv1State.money.toLocaleString()}</IncidentValue>
                </TransactionSummaryCard>
                <TransactionSummaryCard>
                  <IncidentLabel>Total Earned</IncidentLabel>
                  <IncidentValue>${totalEarned.toLocaleString()}</IncidentValue>
                </TransactionSummaryCard>
                <TransactionSummaryCard>
                  <IncidentLabel>Total Spent / Lost</IncidentLabel>
                  <IncidentValue>${totalSpent.toLocaleString()}</IncidentValue>
                </TransactionSummaryCard>
              </TransactionSummary>
              <TransactionList>
                {transactionHistory.map((entry) => (
                  <TransactionRow key={entry.id} $type={entry.type}>
                    <TransactionTop>
                      <div>
                        <TransactionTitle>{entry.title}</TransactionTitle>
                        <PageSubtitle style={{ marginTop: '4px' }}>{entry.timestamp}</PageSubtitle>
                      </div>
                      <TransactionAmount $type={entry.type}>
                        {entry.type === 'debit' ? '-' : '+'}${entry.amount.toLocaleString()}
                      </TransactionAmount>
                    </TransactionTop>
                    <MetaLine style={{ marginTop: '8px', marginBottom: '4px' }}>{entry.note}</MetaLine>
                    <PageSubtitle>
                      Category: {entry.category} | Balance after: ${entry.balanceAfter.toLocaleString()}
                    </PageSubtitle>
                  </TransactionRow>
                ))}
              </TransactionList>
              <NoticeBox style={{ marginTop: '14px', marginBottom: '0' }}>
                Items added to cart do not reduce your balance. Only completed purchases, mission payouts, or simulated attack losses appear here.
              </NoticeBox>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <ActionButton onClick={() => setShowMoneyDetails(false)}>Close</ActionButton>
              </div>
            </IncidentCard>
          </IncidentOverlay>
        )}
        {activeInterface === 'phone' && (
          <DeviceOverlay>
            <DeviceOverlayHeader>
              <DeviceOverlayTitle>Phone Workspace</DeviceOverlayTitle>
              <ActionButton onClick={() => setActiveInterface(null)}>Close</ActionButton>
            </DeviceOverlayHeader>
            <DeviceOverlayBody>
              <PhoneWorkspaceViewport>
                <PhoneWorkspaceScale>
                  <MainGameProvider
                    key={`${currentUser.username}-${hv1State.devices.phone.purchased}-${hv1State.devices.phone.online}`}
                    user={currentUser}
                  >
                    <MainPhoneBridge user={currentUser} hv1State={hv1State} />
                  </MainGameProvider>
                </PhoneWorkspaceScale>
              </PhoneWorkspaceViewport>
            </DeviceOverlayBody>
          </DeviceOverlay>
        )}
        {activeInterface === 'laptop' && (
          <DeviceOverlay>
            <DeviceOverlayHeader>
              <DeviceOverlayTitle>Laptop Workspace</DeviceOverlayTitle>
              <DeviceOverlayActions>
                <ActionButton onClick={() => setActiveInterface(null)}>Close</ActionButton>
              </DeviceOverlayActions>
            </DeviceOverlayHeader>
            <DeviceOverlayBody>
              <LaptopWorkspaceShell>
                <LaptopWorkspaceCanvas>
                  <LaptopWorkspaceViewport>
                    <LaptopWorkspaceScale>
                      <MainGameProvider
                        key={`${currentUser.username}-${hv1State.devices.laptop.purchased}-${hv1State.devices.laptop.online}`}
                        user={currentUser}
                      >
                        <MainLaptopInterface
                          device={{ powered: true, connected: true, battery: 100 }}
                          hideKeyboard
                          uiVariant="kali"
                        />
                      </MainGameProvider>
                    </LaptopWorkspaceScale>
                  </LaptopWorkspaceViewport>
                </LaptopWorkspaceCanvas>
                <LaptopDeviceSelection>
                  <LaptopDeviceButton
                    $active
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Laptop Workspace"
                  >
                    <FaLaptop />
                    <LaptopDeviceLabel>Laptop</LaptopDeviceLabel>
                  </LaptopDeviceButton>
                  {hv1State.devices.phone.purchased && hv1State.devices.phone.online && (
                    <LaptopDeviceButton
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Switch to Phone"
                      onClick={() => {
                        syncHv1StateToMainGameStorage(currentUser.username, hv1State);
                        setActiveInterface('phone');
                      }}
                    >
                      <FaPhone />
                      <LaptopDeviceLabel>Phone</LaptopDeviceLabel>
                    </LaptopDeviceButton>
                  )}
                  {hv1State.devices.router.purchased && (
                    <LaptopDeviceButton
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Switch to Router"
                      onClick={() => {
                        setActivePage('devices');
                        setActiveInterface(null);
                      }}
                    >
                      <FaNetworkWired />
                      <LaptopDeviceLabel>Router</LaptopDeviceLabel>
                    </LaptopDeviceButton>
                  )}
                  <LaptopDeviceButton
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Devices Hub"
                    onClick={() => {
                      setActivePage('devices');
                      setActiveInterface(null);
                    }}
                  >
                    <FaMobileAlt />
                    <LaptopDeviceLabel>Devices</LaptopDeviceLabel>
                  </LaptopDeviceButton>
                </LaptopDeviceSelection>
              </LaptopWorkspaceShell>
            </DeviceOverlayBody>
          </DeviceOverlay>
        )}
      </AppShell>
    );
  }

  return <Login onLogin={handleLogin} />;
}

export default App;

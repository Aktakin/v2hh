import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useUrlSearchParams } from '../hooks/useUrlSearchParams';
import { useGame } from '../context/GameContext';
import AndroidDevTerminal from './AndroidDevTerminal';
import LaptopInterface from './LaptopInterface';
import RouterInterface from './RouterInterface';
import InternetConnectivity from './InternetConnectivity';
import { 
  FaPhone, 
  FaEnvelope, 
  FaGlobe, 
  FaWallet, 
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty,
  FaSignal,
  FaWifi,
  FaClock,
  FaUser,
  FaTrash,
  FaReply,
  FaPhoneAlt,
  FaVideo,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaSearch,
  FaShieldAlt,
  FaExclamationTriangle,
  FaDollarSign,
  FaPlus,
  FaEdit,
  FaTimes,
  FaCheck,
  FaLock,
  FaLaptop,
  FaNetworkWired
} from 'react-icons/fa';

const glowAnimation = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 65, 0.4), 0 0 40px rgba(0, 255, 65, 0.2); }
  50% { box-shadow: 0 0 30px rgba(0, 255, 65, 0.6), 0 0 60px rgba(0, 255, 65, 0.3); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const PhoneContainer = styled.div`
  --dw-bg: #06080d;
  --dw-surface: rgba(22, 27, 34, 0.78);
  --dw-surface-hover: rgba(30, 36, 45, 0.92);
  --dw-border: rgba(240, 246, 252, 0.08);
  --dw-accent: #3ded97;
  --dw-accent-soft: rgba(61, 237, 151, 0.14);
  --dw-text: #e6edf3;
  --dw-muted: #8b949e;

  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 32px 20px 48px;
  position: relative;
  color: var(--dw-text);
  background:
    radial-gradient(ellipse 120% 80% at 50% -30%, rgba(61, 237, 151, 0.07), transparent 55%),
    radial-gradient(ellipse 60% 40% at 100% 50%, rgba(56, 139, 253, 0.06), transparent 50%),
    linear-gradient(165deg, #06080d 0%, #0d1117 45%, #0a0c12 100%);

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(240, 246, 252, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(240, 246, 252, 0.03) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 90% 70% at 50% 40%, black 20%, transparent 75%);
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at 20% 80%, rgba(61, 237, 151, 0.04), transparent 45%);
    pointer-events: none;
    z-index: 0;
  }

  @media (max-width: 1200px) {
    padding: 24px 16px 40px;
  }
`;

const WorkspaceInner = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const WorkspaceHeader = styled.header`
  padding-bottom: 22px;
  border-bottom: 1px solid var(--dw-border);
`;

const WorkspaceEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--dw-muted);
  margin-bottom: 10px;
  font-family: 'Orbitron', sans-serif;
`;

const WorkspaceTitle = styled.h1`
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.45rem, 2.8vw, 1.9rem);
  font-weight: 600;
  color: #f0f6fc;
  margin: 0 0 10px;
  letter-spacing: 0.03em;
`;

const WorkspaceSubtitle = styled.p`
  margin: 0;
  max-width: 52ch;
  font-size: 0.94rem;
  line-height: 1.6;
  color: var(--dw-muted);
`;

const WorkspaceMain = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  width: 100%;
`;

const PhoneWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
`;

const DeviceDock = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  gap: 10px;
  padding: 12px 14px;
  background: var(--dw-surface);
  backdrop-filter: blur(20px) saturate(1.25);
  border: 1px solid var(--dw-border);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);

  @media (min-width: 900px) {
    justify-content: flex-start;
    padding: 14px 18px;
    gap: 12px;
  }
`;

const DeviceButton = styled(motion.button)`
  min-width: 108px;
  padding: 14px 16px;
  background: ${(props) =>
    props.$active
      ? 'linear-gradient(145deg, var(--dw-accent-soft) 0%, rgba(22, 27, 34, 0.5) 100%)'
      : 'transparent'};
  border: 1px solid
    ${(props) => (props.$active ? 'rgba(61, 237, 151, 0.45)' : 'rgba(240, 246, 252, 0.07)')};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease,
    transform 0.2s ease;
  color: ${(props) => (props.$active ? 'var(--dw-accent)' : 'var(--dw-muted)')};

  &:hover {
    background: var(--dw-surface-hover);
    border-color: rgba(61, 237, 151, 0.35);
    color: var(--dw-accent);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  }

  svg {
    font-size: 1.55rem;
    opacity: ${(props) => (props.$active ? 1 : 0.85)};
  }
`;

const DeviceLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 600;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const PhoneFrame = styled(motion.div)`
  width: 400px;
  height: 900px;
  background: linear-gradient(145deg, 
    rgba(20, 20, 20, 0.95) 0%, 
    rgba(40, 40, 40, 0.95) 50%,
    rgba(20, 20, 20, 0.95) 100%);
  border-radius: 40px;
  border: 8px solid rgba(0, 0, 0, 0.8);
  box-shadow: 
    0 0 50px rgba(0, 255, 65, 0.4),
    0 0 100px rgba(0, 255, 65, 0.2),
    inset 0 0 30px rgba(0, 0, 0, 0.6),
    inset 0 2px 10px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  animation: ${glowAnimation} 3s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(0, 255, 65, 0.1) 0%, 
      transparent 50%,
      rgba(0, 255, 255, 0.1) 100%);
    border-radius: 40px;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 2px;
    z-index: 10;
  }
`;

const PhoneScreen = styled.div`
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  margin: 8px;
  background: linear-gradient(135deg, #000 0%, #0a0a0a 100%);
  border-radius: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.8);
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0.9) 0%, 
    rgba(0, 0, 0, 0.7) 100%);
  backdrop-filter: blur(10px);
  color: #00ff41;
  font-size: 12px;
  font-weight: bold;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  position: relative;
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(0, 255, 65, 0.5) 50%, 
      transparent 100%);
  }
`;

const Time = styled.div`
  font-family: 'Orbitron', sans-serif;
`;

const BatteryIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SignalIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const HomeIndicator = styled.div`
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 5px;
  background: linear-gradient(90deg, 
    rgba(0, 255, 65, 0.3) 0%, 
    rgba(0, 255, 65, 0.8) 50%, 
    rgba(0, 255, 65, 0.3) 100%);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 25px;
  margin-top: 25px;
`;

const AppIcon = styled(motion.div)`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, 
    rgba(0, 255, 65, 0.1) 0%, 
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 255, 255, 0.1) 100%);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid rgba(0, 255, 65, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(0, 255, 65, 0.2), transparent);
    transform: rotate(45deg);
    transition: all 0.6s;
  }
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.6);
    box-shadow: 
      0 0 25px rgba(0, 255, 65, 0.4),
      inset 0 0 20px rgba(0, 255, 65, 0.1);
    transform: translateY(-5px) scale(1.05);
    
    &::before {
      top: 100%;
      left: 100%;
    }
  }
`;

const AppName = styled.div`
  color: #00ff41;
  font-size: 11px;
  margin-top: 8px;
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
`;

const AppScreen = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #000 0%, #0a0a0a 100%);
  z-index: 100;
  backdrop-filter: blur(10px);
`;

const AppHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 18px 20px;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0.95) 0%, 
    rgba(0, 0, 0, 0.85) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(0, 255, 65, 0.5) 50%, 
      transparent 100%);
  }
`;

const BackButton = styled(motion.button)`
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 8px;
  color: #00ff41;
  font-size: 18px;
  cursor: pointer;
  margin-right: 15px;
  padding: 8px 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 65, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  }
`;

const AppTitle = styled.h2`
  background: linear-gradient(135deg, #00ff41, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Orbitron', sans-serif;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
`;

const AppContent = styled.div`
  padding: 25px;
  height: calc(100% - 70px);
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 65, 0.5);
    border-radius: 3px;
    
    &:hover {
      background: rgba(0, 255, 65, 0.7);
    }
  }
`;

const WalletBalance = styled.div`
  background: linear-gradient(135deg, 
    rgba(0, 255, 65, 0.15) 0%, 
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 255, 255, 0.15) 100%);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  margin-bottom: 25px;
  border: 2px solid rgba(0, 255, 65, 0.4);
  box-shadow: 
    0 0 30px rgba(0, 255, 65, 0.3),
    inset 0 0 30px rgba(0, 255, 65, 0.05);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 255, 65, 0.1) 0%, transparent 70%);
    animation: ${shimmer} 3s linear infinite;
  }
`;

const BalanceAmount = styled.div`
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #00ff41, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
  position: relative;
  z-index: 1;
`;

const BalanceLabel = styled.div`
  font-size: 13px;
  color: #aaa;
  margin-top: 8px;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
`;

const TransactionList = styled.div`
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.6) 0%, 
    rgba(0, 255, 65, 0.05) 100%);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(0, 255, 65, 0.2);
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TransactionAmount = styled.div`
  color: ${props => props.type === 'credit' ? '#00ff41' : '#ff0040'};
  font-weight: bold;
`;

const EmailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EmailItem = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.6) 0%, 
    rgba(0, 255, 65, 0.1) 100%);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 18px;
  border-left: 4px solid rgba(0, 255, 65, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 255, 65, 0.2);
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
    transform: translateX(5px);
  }
`;

const EmailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const EmailSender = styled.div`
  background: linear-gradient(135deg, #00ff41, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  font-size: 14px;
`;

const EmailTime = styled.div`
  color: #aaa;
  font-size: 11px;
  letter-spacing: 0.5px;
`;

const EmailSubject = styled.div`
  color: #fff;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 13px;
`;

const EmailPreview = styled.div`
  color: #aaa;
  font-size: 12px;
  line-height: 1.4;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MessageItem = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.6) 0%, 
    rgba(0, 255, 65, 0.1) 100%);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 18px;
  border-left: 4px solid rgba(0, 255, 65, 0.6);
  border: 1px solid rgba(0, 255, 65, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
    transform: translateX(5px);
  }
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const MessageSender = styled.div`
  background: linear-gradient(135deg, #00ff41, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  font-size: 14px;
`;

const MessageTime = styled.div`
  color: #aaa;
  font-size: 11px;
  letter-spacing: 0.5px;
`;

const MessageContent = styled.div`
  color: #ddd;
  font-size: 13px;
  line-height: 1.5;
`;

const BrowserBar = styled.div`
  display: flex;
  align-items: center;
  background: rgba(26, 26, 46, 0.8);
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const BrowserInput = styled.input`
  flex: 1;
  background: #000;
  border: 1px solid #333;
  border-radius: 5px;
  padding: 8px;
  color: #00ff41;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #00ff41;
  }
`;

const WebsiteCard = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.6) 0%, 
    rgba(0, 255, 65, 0.1) 100%);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 18px;
  margin-bottom: 15px;
  border: 1px solid rgba(0, 255, 65, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
    transform: translateX(5px);
  }
`;

const WebsiteName = styled.div`
  background: linear-gradient(135deg, #00ff41, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  margin-bottom: 6px;
  font-size: 14px;
`;

const WebsiteUrl = styled.div`
  color: #aaa;
  font-size: 11px;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

const WebsiteDescription = styled.div`
  color: #ddd;
  font-size: 12px;
  line-height: 1.4;
`;

const SiteRisk = styled.div`
  color: #ff0040;
  font-size: 0.8rem;
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const DialerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const DialerDisplay = styled.div`
  background: linear-gradient(135deg, 
    rgba(0, 255, 65, 0.15) 0%, 
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 255, 255, 0.15) 100%);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  margin-bottom: 25px;
  border: 2px solid rgba(0, 255, 65, 0.4);
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 30px rgba(0, 255, 65, 0.3),
    inset 0 0 30px rgba(0, 255, 65, 0.05);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 255, 65, 0.1) 0%, transparent 70%);
    animation: ${shimmer} 3s linear infinite;
  }
`;

const DialedNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #00ff41, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
  position: relative;
  z-index: 1;
`;

const DialerKeypad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
`;

const DialerKey = styled(motion.button)`
  background: linear-gradient(135deg, 
    rgba(0, 255, 65, 0.1) 0%, 
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 255, 255, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 255, 65, 0.3);
  border-radius: 18px;
  padding: 22px;
  color: #00ff41;
  font-size: 26px;
  font-weight: bold;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 255, 65, 0.3) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: width 0.4s, height 0.4s;
  }
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.6);
    box-shadow: 
      0 0 25px rgba(0, 255, 65, 0.4),
      inset 0 0 20px rgba(0, 255, 65, 0.1);
    transform: scale(1.08) translateY(-3px);
    
    &::before {
      width: 200px;
      height: 200px;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const DialerSubtext = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 5px;
`;

const DialerActions = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const CallButton = styled(motion.button)`
  flex: 1;
  background: linear-gradient(45deg, #00ff41, #00cc33);
  border: none;
  border-radius: 15px;
  padding: 15px;
  color: #000;
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover:not(:disabled) {
    background: linear-gradient(45deg, #00cc33, #00ff41);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(motion.button)`
  background: linear-gradient(45deg, #ff0040, #cc0033);
  border: none;
  border-radius: 15px;
  padding: 15px 20px;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  
  &:hover {
    background: linear-gradient(45deg, #cc0033, #ff0040);
    box-shadow: 0 0 20px rgba(255, 0, 64, 0.5);
    transform: translateY(-2px);
  }
`;

const CallHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
`;

const CallHistoryItem = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.6) 0%, 
    rgba(0, 255, 65, 0.1) 100%);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid rgba(0, 255, 65, 0.6);
  border: 1px solid rgba(0, 255, 65, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
    transform: translateX(5px);
  }
`;

const CallInfo = styled.div`
  flex: 1;
`;

const CallName = styled.div`
  background: linear-gradient(135deg, #00ff41, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 14px;
`;

const CallNumber = styled.div`
  color: #aaa;
  font-size: 11px;
  letter-spacing: 0.5px;
`;

const CallTime = styled.div`
  color: #aaa;
  font-size: 10px;
  letter-spacing: 0.5px;
`;

const ContactsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
`;

const ContactItem = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.6) 0%, 
    rgba(0, 255, 65, 0.1) 100%);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid rgba(0, 255, 65, 0.6);
  border: 1px solid rgba(0, 255, 65, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(0, 0, 0, 0.7) 0%, 
      rgba(0, 255, 65, 0.15) 100%);
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
    transform: translateX(5px);
  }
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const ContactName = styled.div`
  background: linear-gradient(135deg, #00ff41, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  margin-bottom: 6px;
  font-size: 15px;
`;

const ContactNumber = styled.div`
  color: #aaa;
  font-size: 12px;
  letter-spacing: 0.5px;
`;

const ContactActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ContactActionButton = styled(motion.button)`
  background: transparent;
  border: 1px solid #00ff41;
  border-radius: 5px;
  padding: 8px;
  color: #00ff41;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 255, 65, 0.1);
  }
`;

const AddContactForm = styled(motion.div)`
  background: rgba(26, 26, 46, 0.9);
  border: 2px solid #00ff41;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FormInput = styled.input`
  width: 100%;
  background: #000;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  color: #00ff41;
  font-family: 'Share Tech Mono', monospace;
  margin-bottom: 15px;
  
  &:focus {
    outline: none;
    border-color: #00ff41;
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  }
  
  &::placeholder {
    color: #666;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 10px;
`;

const FormButton = styled.button`
  flex: 1;
  background: ${props => props.primary ? 'linear-gradient(45deg, #00ff41, #00cc33)' : 'transparent'};
  border: 2px solid ${props => props.primary ? '#00ff41' : '#888'};
  border-radius: 8px;
  padding: 12px;
  color: ${props => props.primary ? '#000' : '#888'};
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    ${props => props.primary 
      ? 'background: linear-gradient(45deg, #00cc33, #00ff41); box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);'
      : 'background: rgba(136, 136, 136, 0.1); border-color: #fff; color: #fff;'
    }
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #888;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 15px;
  color: #333;
`;

const EmptyStateText = styled.div`
  font-size: 14px;
`;

const LockScreen = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #000 0%, #0a0a0a 100%);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 40px 20px 30px;
`;

const LockScreenTop = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const LockScreenTime = styled.div`
  font-family: 'Orbitron', sans-serif;
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(135deg, #00ff41, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
  margin-top: 20px;
`;

const LockScreenDate = styled.div`
  color: #aaa;
  font-size: 14px;
  letter-spacing: 1px;
  margin-top: -10px;
`;

const NotificationsContainer = styled.div`
  width: 100%;
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 65, 0.5);
    border-radius: 2px;
  }
`;

const NotificationItem = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.7) 0%, 
    rgba(0, 255, 65, 0.1) 100%);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 15px;
  border: 1px solid rgba(0, 255, 65, 0.3);
  width: 100%;
`;

const NotificationTitle = styled.div`
  color: #00ff41;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 5px;
`;

const NotificationText = styled.div`
  color: #ddd;
  font-size: 12px;
  line-height: 1.4;
`;

const NotificationTime = styled.div`
  color: #aaa;
  font-size: 10px;
  margin-top: 5px;
`;

const PINContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  margin-top: auto;
`;

const PINDisplay = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  margin-top: 20px;
`;

const PINDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${props => props.filled ? 'rgba(0, 255, 65, 0.8)' : 'rgba(0, 255, 65, 0.3)'};
  background: ${props => props.filled ? 'rgba(0, 255, 65, 0.6)' : 'transparent'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.filled ? '0 0 10px rgba(0, 255, 65, 0.5)' : 'none'};
`;

const PINKeypad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  width: 100%;
  max-width: 280px;
`;

const PINKey = styled(motion.button)`
  background: linear-gradient(135deg, 
    rgba(0, 255, 65, 0.1) 0%, 
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 255, 255, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 255, 65, 0.3);
  border-radius: 50%;
  width: 70px;
  height: 70px;
  color: #00ff41;
  font-size: 24px;
  font-weight: bold;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.6);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const PINDeleteKey = styled(PINKey)`
  background: linear-gradient(135deg, 
    rgba(255, 0, 64, 0.1) 0%, 
    rgba(0, 0, 0, 0.6) 100%);
  border-color: rgba(255, 0, 64, 0.3);
  color: #ff0040;
  
  &:hover {
    border-color: rgba(255, 0, 64, 0.6);
    box-shadow: 0 0 20px rgba(255, 0, 64, 0.4);
  }
`;

const ErrorMessage = styled(motion.div)`
  color: #ff0040;
  font-size: 12px;
  text-align: center;
  margin-top: 10px;
  font-weight: bold;
`;

const PINHint = styled(motion.div)`
  color: rgba(0, 255, 65, 0.6);
  font-size: 11px;
  text-align: center;
  margin-top: 10px;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
  
  &:hover {
    color: rgba(0, 255, 65, 0.9);
  }
`;

const PINDisplayHint = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(0, 255, 65, 0.15) 0%, 
    rgba(0, 0, 0, 0.6) 100%);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 255, 65, 0.4);
  border-radius: 12px;
  padding: 15px;
  margin-top: 15px;
  text-align: center;
  color: #00ff41;
  font-size: 14px;
  font-weight: bold;
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 3px;
`;

const Phone = ({ user, hideEmbeddedLaptopKeyboard = false }) => {
  const { gameState, dispatch } = useGame();
  const searchParams = useUrlSearchParams();
  const missionParam = searchParams.get('mission');
  const parsedMission = missionParam != null && missionParam !== '' ? parseInt(missionParam, 10) : NaN;
  const missionId = Number.isFinite(parsedMission) ? parsedMission : null;

  const [currentApp, setCurrentApp] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(gameState.phone.battery);
  const [dialedNumber, setDialedNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactNumber, setNewContactNumber] = useState('');
  const [editingContact, setEditingContact] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPINHint, setShowPINHint] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('phone');

  useEffect(() => {
    const d = searchParams.get('device');
    if (d === 'laptop') setSelectedDevice('laptop');
    if (d === 'router') setSelectedDevice('router');
    if (d === 'internet') setSelectedDevice('internet');
    if (d === 'phone') setSelectedDevice('phone');
  }, [searchParams]);

  // Debug: Log equipment changes
  useEffect(() => {
    console.log('Phone - Equipment state:', gameState.equipment);
    console.log('Phone - Has laptop:', !!gameState.equipment.laptop);
    console.log('Phone - Laptop details:', gameState.equipment.laptop);
  }, [gameState.equipment]); // 'phone', 'laptop', 'router'
  
  // Get or set default PIN (stored in localStorage or gameState)
  const defaultPIN = gameState.phone.pin || '0000';
  
  // Notifications for lock screen
  const notifications = [
    {
      id: 1,
      title: 'New Email',
      text: 'You have 3 unread emails',
      time: '2 min ago',
      type: 'email'
    },
    {
      id: 2,
      title: 'New Message',
      text: 'Mom: Don\'t forget dinner tonight!',
      time: '5 min ago',
      type: 'message'
    },
    {
      id: 3,
      title: 'Daily Credit',
      text: 'Your $50 daily credit is ready',
      time: '1 hour ago',
      type: 'wallet'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handlePINInput = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setPinError('');
      
      if (newPin.length === 4) {
        if (newPin === defaultPIN) {
          setIsLocked(false);
          setPin('');
        } else {
          setPinError('Incorrect PIN');
          setTimeout(() => {
            setPin('');
            setPinError('');
          }, 1000);
        }
      }
    }
  };

  const handlePINDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setPinError('');
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBatteryIcon = () => {
    if (batteryLevel > 75) return <FaBatteryFull />;
    if (batteryLevel > 50) return <FaBatteryThreeQuarters />;
    if (batteryLevel > 25) return <FaBatteryHalf />;
    if (batteryLevel > 10) return <FaBatteryQuarter />;
    return <FaBatteryEmpty />;
  };

  const openApp = (appName) => {
    setCurrentApp(appName);
  };

  const closeApp = () => {
    setCurrentApp(null);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const emails = [
    {
      id: 1,
      sender: 'Daily Credit',
      subject: 'Your $50 Daily Credit is Ready!',
      preview: 'Click here to claim your free $50 credit...',
      time: '2 min ago'
    },
    {
      id: 2,
      sender: 'Bank Newsletter',
      subject: 'Your monthly statement is available',
      preview: 'View your balance and recent transactions in the secure portal.',
      time: '15 min ago'
    },
    {
      id: 3,
      sender: 'Tech Support',
      subject: 'Optional maintenance window',
      preview: 'We may perform brief maintenance Sunday 2–4 AM. No action required.',
      time: '1 hour ago'
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Mom',
      content: 'Don\'t forget dinner tonight!',
      time: '5 min ago'
    },
    {
      id: 2,
      sender: 'Unknown',
      content: 'You\'ve won $1000! Click here to claim...',
      time: '1 hour ago'
    }
  ];

  const websites = [
    {
      name: 'HackHilis Official',
      url: 'hackhilis.com',
      description: 'Official hacking simulation platform',
      risk: 'Safe'
    },
    {
      name: 'Dark Web Market',
      url: 'darkmarket.onion',
      description: 'Underground marketplace - High risk',
      risk: 'High Risk'
    },
    {
      name: 'Community Bank',
      url: 'community-bank.example',
      description: 'Official online banking portal',
      risk: 'Safe'
    }
  ];

  const handleDialNumber = (digit) => {
    if (dialedNumber.length < 15) {
      setDialedNumber(prev => prev + digit);
    }
  };

  const handleDeleteDigit = () => {
    setDialedNumber(prev => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (!dialedNumber || dialedNumber.length === 0) return;
    
    setIsCalling(true);
    
    // Find contact name if number exists in contacts
    const contact = gameState.phone.contacts.find(c => c.number === dialedNumber);
    const callName = contact ? contact.name : dialedNumber;
    
    // Simulate call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add to call history
    const newCall = {
      id: Date.now(),
      name: callName,
      number: dialedNumber,
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }),
      date: new Date().toLocaleDateString()
    };
    
    setCallHistory(prev => [newCall, ...prev].slice(0, 20)); // Keep last 20 calls
    setDialedNumber('');
    setIsCalling(false);
  };

  const handleCallContact = (contact) => {
    setDialedNumber(contact.number);
    setTimeout(() => handleCall(), 100);
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactNumber.trim()) return;
    
    const newContact = {
      id: Date.now(),
      name: newContactName.trim(),
      number: newContactNumber.trim()
    };
    
    dispatch({ type: 'ADD_CONTACT', payload: newContact });
    setNewContactName('');
    setNewContactNumber('');
    setShowAddContact(false);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setNewContactName(contact.name);
    setNewContactNumber(contact.number);
    setShowAddContact(true);
  };

  const handleUpdateContact = () => {
    if (!newContactName.trim() || !newContactNumber.trim() || !editingContact) return;
    
    // Remove old contact and add updated one
    const updatedContacts = gameState.phone.contacts
      .filter(c => c.id !== editingContact.id)
      .concat([{
        ...editingContact,
        name: newContactName.trim(),
        number: newContactNumber.trim()
      }]);
    
    // Update contacts in game state
    dispatch({ type: 'SET_PHONE', payload: {
      ...gameState.phone,
      contacts: updatedContacts
    }});
    
    setNewContactName('');
    setNewContactNumber('');
    setEditingContact(null);
    setShowAddContact(false);
  };

  const handleDeleteContact = (contactId) => {
    const updatedContacts = gameState.phone.contacts.filter(c => c.id !== contactId);
    dispatch({ type: 'SET_PHONE', payload: {
      ...gameState.phone,
      contacts: updatedContacts
    }});
  };

  const getContactName = (number) => {
    const contact = gameState.phone.contacts.find(c => c.number === number);
    return contact ? contact.name : number;
  };

  const renderApp = () => {
    switch (currentApp) {
      case 'wallet':
        return (
          <AppScreen
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <AppHeader>
              <BackButton onClick={closeApp} whileHover={{ scale: 1.1 }}>
                <FaChevronLeft />
              </BackButton>
              <AppTitle>Wallet</AppTitle>
            </AppHeader>
            <AppContent>
              <WalletBalance>
                <BalanceAmount>${gameState.phone.money || 10000}</BalanceAmount>
                <BalanceLabel>Available Balance</BalanceLabel>
              </WalletBalance>
              <TransactionList>
                <TransactionItem>
                  <div>Daily Credit</div>
                  <TransactionAmount type="credit">+$50</TransactionAmount>
                </TransactionItem>
                <TransactionItem>
                  <div>Phone Purchase</div>
                  <TransactionAmount type="debit">-$500</TransactionAmount>
                </TransactionItem>
              </TransactionList>
            </AppContent>
          </AppScreen>
        );

      case 'email':
        return (
          <AppScreen
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <AppHeader>
              <BackButton onClick={closeApp} whileHover={{ scale: 1.1 }}>
                <FaChevronLeft />
              </BackButton>
              <AppTitle>Email</AppTitle>
            </AppHeader>
            <AppContent>
              <EmailList>
                {emails.map(email => (
                  <EmailItem
                    key={email.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <EmailHeader>
                      <EmailSender>{email.sender}</EmailSender>
                      <EmailTime>{email.time}</EmailTime>
                    </EmailHeader>
                    <EmailSubject>{email.subject}</EmailSubject>
                    <EmailPreview>{email.preview}</EmailPreview>
                  </EmailItem>
                ))}
              </EmailList>
            </AppContent>
          </AppScreen>
        );

      case 'messages':
        return (
          <AppScreen
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <AppHeader>
              <BackButton onClick={closeApp} whileHover={{ scale: 1.1 }}>
                <FaChevronLeft />
              </BackButton>
              <AppTitle>Messages</AppTitle>
            </AppHeader>
            <AppContent>
              <MessageList>
                {messages.map(message => (
                  <MessageItem
                    key={message.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageHeader>
                      <MessageSender>{message.sender}</MessageSender>
                      <MessageTime>{message.time}</MessageTime>
                    </MessageHeader>
                    <MessageContent>{message.content}</MessageContent>
                  </MessageItem>
                ))}
              </MessageList>
            </AppContent>
          </AppScreen>
        );

      case 'browser':
        return (
          <AppScreen
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <AppHeader>
              <BackButton onClick={closeApp} whileHover={{ scale: 1.1 }}>
                <FaChevronLeft />
              </BackButton>
              <AppTitle>Browser</AppTitle>
            </AppHeader>
            <AppContent>
              <BrowserBar>
                <BrowserInput placeholder="Search or enter URL..." />
              </BrowserBar>
              {websites.map((site, index) => (
                <WebsiteCard
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <WebsiteName>{site.name}</WebsiteName>
                  <WebsiteUrl>{site.url}</WebsiteUrl>
                  <WebsiteDescription>{site.description}</WebsiteDescription>
                  {site.risk !== 'Safe' && (
                    <SiteRisk>
                      <FaExclamationTriangle />
                      {site.risk}
                    </SiteRisk>
                  )}
                </WebsiteCard>
              ))}
            </AppContent>
          </AppScreen>
        );

      case 'calls':
        return (
          <AppScreen
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <AppHeader>
              <BackButton onClick={closeApp} whileHover={{ scale: 1.1 }}>
                <FaChevronLeft />
              </BackButton>
              <AppTitle>Phone</AppTitle>
            </AppHeader>
            <AppContent>
              <DialerContainer>
                <DialerDisplay>
                  <DialedNumber>{dialedNumber || 'Enter number'}</DialedNumber>
                </DialerDisplay>
                
                <DialerKeypad>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <DialerKey
                      key={num}
                      onClick={() => handleDialNumber(num.toString())}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {num}
                      {num === 1 && <DialerSubtext></DialerSubtext>}
                      {num === 2 && <DialerSubtext>ABC</DialerSubtext>}
                      {num === 3 && <DialerSubtext>DEF</DialerSubtext>}
                      {num === 4 && <DialerSubtext>GHI</DialerSubtext>}
                      {num === 5 && <DialerSubtext>JKL</DialerSubtext>}
                      {num === 6 && <DialerSubtext>MNO</DialerSubtext>}
                      {num === 7 && <DialerSubtext>PQRS</DialerSubtext>}
                      {num === 8 && <DialerSubtext>TUV</DialerSubtext>}
                      {num === 9 && <DialerSubtext>WXYZ</DialerSubtext>}
                    </DialerKey>
                  ))}
                  <DialerKey
                    onClick={() => handleDialNumber('*')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    *
                  </DialerKey>
                  <DialerKey
                    onClick={() => handleDialNumber('0')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    0
                    <DialerSubtext>+</DialerSubtext>
                  </DialerKey>
                  <DialerKey
                    onClick={() => handleDialNumber('#')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    #
                  </DialerKey>
                </DialerKeypad>
                
                <DialerActions>
                  <CallButton
                    onClick={handleCall}
                    disabled={!dialedNumber || dialedNumber.length === 0 || isCalling}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCalling ? (
                      <>
                        <FaClock />
                        Calling...
                      </>
                    ) : (
                      <>
                        <FaPhone />
                        Call
                      </>
                    )}
                  </CallButton>
                  <DeleteButton
                    onClick={handleDeleteDigit}
                    disabled={dialedNumber.length === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTimes />
                  </DeleteButton>
                </DialerActions>
                
                {callHistory.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ color: '#00ff41', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
                      Recent Calls
                    </div>
                    <CallHistoryList>
                      {callHistory.slice(0, 5).map(call => (
                        <CallHistoryItem
                          key={call.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setDialedNumber(call.number);
                            setTimeout(() => handleCall(), 100);
                          }}
                        >
                          <CallInfo>
                            <CallName>{call.name}</CallName>
                            <CallNumber>{call.number}</CallNumber>
                          </CallInfo>
                          <CallTime>{call.time}</CallTime>
                        </CallHistoryItem>
                      ))}
                    </CallHistoryList>
                  </div>
                )}
              </DialerContainer>
            </AppContent>
          </AppScreen>
        );

      case 'contacts':
        return (
          <AppScreen
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <AppHeader>
              <BackButton onClick={closeApp} whileHover={{ scale: 1.1 }}>
                <FaChevronLeft />
              </BackButton>
              <AppTitle>Contacts</AppTitle>
              <div style={{ marginLeft: 'auto' }}>
                <ContactActionButton
                  onClick={() => {
                    setShowAddContact(!showAddContact);
                    setEditingContact(null);
                    setNewContactName('');
                    setNewContactNumber('');
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaPlus />
                </ContactActionButton>
              </div>
            </AppHeader>
            <AppContent>
              {showAddContact && (
                <AddContactForm
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <FormInput
                    type="text"
                    placeholder="Contact Name"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                  />
                  <FormInput
                    type="tel"
                    placeholder="Phone Number"
                    value={newContactNumber}
                    onChange={(e) => setNewContactNumber(e.target.value)}
                  />
                  <FormActions>
                    <FormButton
                      onClick={() => {
                        setShowAddContact(false);
                        setEditingContact(null);
                        setNewContactName('');
                        setNewContactNumber('');
                      }}
                    >
                      Cancel
                    </FormButton>
                    <FormButton
                      primary
                      onClick={editingContact ? handleUpdateContact : handleAddContact}
                    >
                      {editingContact ? 'Update' : 'Add'} Contact
                    </FormButton>
                  </FormActions>
                </AddContactForm>
              )}
              
              {gameState.phone.contacts && gameState.phone.contacts.length > 0 ? (
                <ContactsList>
                  {gameState.phone.contacts.map(contact => (
                    <ContactItem
                      key={contact.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ContactInfo onClick={() => handleCallContact(contact)}>
                        <ContactName>{contact.name}</ContactName>
                        <ContactNumber>{contact.number}</ContactNumber>
                      </ContactInfo>
                      <ContactActions>
                        <ContactActionButton
                          onClick={() => handleCallContact(contact)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaPhone />
                        </ContactActionButton>
                        <ContactActionButton
                          onClick={() => handleEditContact(contact)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaEdit />
                        </ContactActionButton>
                        <ContactActionButton
                          onClick={() => handleDeleteContact(contact.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          style={{ borderColor: '#ff0040', color: '#ff0040' }}
                        >
                          <FaTrash />
                        </ContactActionButton>
                      </ContactActions>
                    </ContactItem>
                  ))}
                </ContactsList>
              ) : (
                <EmptyState>
                  <EmptyStateIcon>
                    <FaUser />
                  </EmptyStateIcon>
                  <EmptyStateText>No contacts yet</EmptyStateText>
                  <EmptyStateText style={{ fontSize: '12px', marginTop: '5px' }}>
                    Tap + to add a contact
                  </EmptyStateText>
                </EmptyState>
              )}
            </AppContent>
          </AppScreen>
        );

      default:
        return null;
    }
  };

  if (!gameState.phone.owned) {
    return (
      <PhoneContainer>
        <WorkspaceInner>
          <WorkspaceHeader>
            <WorkspaceEyebrow>Operations</WorkspaceEyebrow>
            <WorkspaceTitle>Device workspace</WorkspaceTitle>
            <WorkspaceSubtitle>
              Purchase a phone in the store to unlock the handset simulator and full device controls.
            </WorkspaceSubtitle>
          </WorkspaceHeader>
          <WorkspaceMain>
            <PhoneFrame
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <PhoneScreen>
                <StatusBar>
                  <Time>{getCurrentTime()}</Time>
                  <SignalIcon>
                    <FaSignal />
                    <FaWifi />
                  </SignalIcon>
                  <BatteryIcon>
                    <FaBatteryEmpty />
                    <span>0%</span>
                  </BatteryIcon>
                </StatusBar>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '40px',
                    textAlign: 'center'
                  }}
                >
                  <FaPhone size={64} color="#484f58" style={{ marginBottom: '20px' }} />
                  <div style={{ color: '#8b949e', fontSize: '17px', marginBottom: '10px', fontWeight: 600 }}>
                    No phone on account
                  </div>
                  <div style={{ color: '#6e7681', fontSize: '14px', lineHeight: 1.5 }}>
                    Purchase a phone from the Store to use this workspace
                  </div>
                </div>
                <HomeIndicator />
              </PhoneScreen>
            </PhoneFrame>
          </WorkspaceMain>
        </WorkspaceInner>
      </PhoneContainer>
    );
  }

  return (
    <PhoneContainer>
      <WorkspaceInner>
        <WorkspaceHeader>
          <WorkspaceEyebrow>Operations</WorkspaceEyebrow>
          <WorkspaceTitle>Device workspace</WorkspaceTitle>
          <WorkspaceSubtitle>
            Switch between simulated phone, laptop, router, and connectivity. Development tools appear below when
            relevant.
          </WorkspaceSubtitle>
        </WorkspaceHeader>

        <DeviceDock aria-label="Select device">
          <DeviceButton
            $active={selectedDevice === 'phone'}
            onClick={() => setSelectedDevice('phone')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaPhone />
            <DeviceLabel>Phone</DeviceLabel>
          </DeviceButton>

          <DeviceButton
            $active={selectedDevice === 'laptop'}
            onClick={() => setSelectedDevice('laptop')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            title="Laptop"
          >
            <FaLaptop />
            <DeviceLabel>Laptop</DeviceLabel>
          </DeviceButton>

          <DeviceButton
            $active={selectedDevice === 'router'}
            onClick={() => setSelectedDevice('router')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            title="Router"
          >
            <FaNetworkWired />
            <DeviceLabel>Router</DeviceLabel>
          </DeviceButton>

          <DeviceButton
            $active={selectedDevice === 'internet'}
            onClick={() => setSelectedDevice('internet')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            title="Internet connectivity"
          >
            <FaGlobe />
            <DeviceLabel>Internet</DeviceLabel>
          </DeviceButton>
        </DeviceDock>

        <WorkspaceMain>
      <PhoneWrapper>
        {selectedDevice === 'phone' && (
          <PhoneFrame
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PhoneScreen>
            <AnimatePresence>
              {isLocked ? (
                <LockScreen
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LockScreenTop>
                    <LockScreenTime>{getCurrentTime()}</LockScreenTime>
                    <LockScreenDate>{getCurrentDate()}</LockScreenDate>
                    
                    {notifications.length > 0 && (
                      <NotificationsContainer>
                        <NotificationItem
                          key={notifications[0].id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <NotificationTitle>{notifications[0].title}</NotificationTitle>
                          <NotificationText>{notifications[0].text}</NotificationText>
                          <NotificationTime>{notifications[0].time}</NotificationTime>
                        </NotificationItem>
                      </NotificationsContainer>
                    )}
                  </LockScreenTop>
                  
                  <PINContainer>
                    <PINDisplay>
                      {[0, 1, 2, 3].map(index => (
                        <PINDot key={index} filled={pin.length > index} />
                      ))}
                    </PINDisplay>
                    
                    {pinError && (
                      <ErrorMessage
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {pinError}
                      </ErrorMessage>
                    )}
                  
                  <PINKeypad>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <PINKey
                        key={num}
                        onClick={() => handlePINInput(num.toString())}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {num}
                      </PINKey>
                    ))}
                    <div></div>
                    <PINKey
                      onClick={() => handlePINInput('0')}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      0
                    </PINKey>
                    <PINDeleteKey
                      onClick={handlePINDelete}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTimes />
                    </PINDeleteKey>
                  </PINKeypad>
                </PINContainer>
              </LockScreen>
            ) : (
              <>
                <StatusBar>
                  <Time>{getCurrentTime()}</Time>
                  <SignalIcon>
                    <FaSignal />
                    <FaWifi />
                  </SignalIcon>
                  <BatteryIcon>
                    {getBatteryIcon()}
                    <span>{Math.round(batteryLevel)}%</span>
                  </BatteryIcon>
                  <motion.button
                    onClick={() => {
                      setIsLocked(true);
                      setCurrentApp(null);
                    }}
                    style={{
                      background: 'rgba(0, 255, 65, 0.1)',
                      border: '1px solid rgba(0, 255, 65, 0.3)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: '#00ff41',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Lock Phone"
                  >
                    <FaLock />
                  </motion.button>
                </StatusBar>

          {!currentApp && (
            <AppGrid>
              <AppIcon
                onClick={() => openApp('wallet')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaWallet size={24} color="#00ff41" />
                <AppName>Wallet</AppName>
              </AppIcon>
              
              <AppIcon
                onClick={() => openApp('calls')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaPhone size={24} color="#00ff41" />
                <AppName>Calls</AppName>
              </AppIcon>
              
              <AppIcon
                onClick={() => openApp('email')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaEnvelope size={24} color="#00ff41" />
                <AppName>Email</AppName>
              </AppIcon>
              
              <AppIcon
                onClick={() => openApp('messages')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaPhoneAlt size={24} color="#00ff41" />
                <AppName>Messages</AppName>
              </AppIcon>
              
              <AppIcon
                onClick={() => openApp('browser')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaGlobe size={24} color="#00ff41" />
                <AppName>Browser</AppName>
              </AppIcon>
              
              <AppIcon
                onClick={() => openApp('contacts')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaUser size={24} color="#00ff41" />
                <AppName>Contacts</AppName>
              </AppIcon>
            </AppGrid>
          )}

                <AnimatePresence>
                  {currentApp && renderApp()}
                </AnimatePresence>

                <HomeIndicator />
              </>
            )}
          </AnimatePresence>
        </PhoneScreen>
      </PhoneFrame>
        )}
        
        {selectedDevice === 'laptop' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', maxWidth: '100%' }}
          >
            <LaptopInterface
              device={gameState.devices.laptop}
              hideKeyboard={hideEmbeddedLaptopKeyboard}
              missionId={missionId}
            />
          </motion.div>
        )}
        
        {selectedDevice === 'router' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', maxWidth: '100%' }}
          >
            <RouterInterface device={gameState.devices.router} />
          </motion.div>
        )}
        
        {selectedDevice === 'internet' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', maxWidth: '600px' }}
          >
            <InternetConnectivity device="internet" />
          </motion.div>
        )}
        
        {selectedDevice === 'phone' && isLocked && (
        <div style={{ 
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {!showPINHint && !pinError && (
            <PINHint
              onClick={() => setShowPINHint(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                fontSize: '14px',
                color: 'rgba(0, 255, 65, 0.8)',
                marginBottom: '10px'
              }}
            >
              Forgot PIN?
            </PINHint>
          )}
          
          {showPINHint && (
            <PINDisplayHint
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setShowPINHint(false)}
              style={{ cursor: 'pointer', margin: '0 auto', maxWidth: '200px' }}
              title="Click to hide"
            >
              PIN: {defaultPIN}
            </PINDisplayHint>
          )}
        </div>
      )}
      </PhoneWrapper>
      
      <AnimatePresence mode="wait">
        {selectedDevice === 'phone' && (
          <motion.div
            key="phone-terminal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <AndroidDevTerminal 
              phoneConnected={gameState.phone.owned}
              phoneData={gameState.phone}
              gameState={gameState}
              dispatch={dispatch}
            />
          </motion.div>
        )}
      </AnimatePresence>
        </WorkspaceMain>
      </WorkspaceInner>
    </PhoneContainer>
  );
};

export default Phone;
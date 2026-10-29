import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTerminal, FaChevronRight, FaAndroid, FaTimes, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const TerminalContainer = styled(motion.div)`
  width: 600px;
  height: 600px;
  background: linear-gradient(145deg, #0a0a0a, #1a1a1a);
  border-radius: 15px;
  border: 2px solid #00ff41;
  box-shadow: 
    0 0 30px rgba(0, 255, 65, 0.3),
    inset 0 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Share Tech Mono', monospace;
`;

const TerminalHeader = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 15px;
  border-bottom: 1px solid #00ff41;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TerminalTitle = styled.div`
  color: #00ff41;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TerminalBody = styled.div`
  flex: 1;
  background: #000;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
`;

const TerminalLine = styled.div`
  color: ${props => {
    if (props.type === 'error') return '#ff0040';
    if (props.type === 'success') return '#00ff41';
    if (props.type === 'warning') return '#ffaa00';
    if (props.type === 'info') return '#00ffff';
    return '#00ff41';
  }};
  font-size: 13px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const TerminalPrompt = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  position: sticky;
  bottom: 0;
  background: #000;
  padding-top: 10px;
  z-index: 10;
`;

const PromptSymbol = styled.span`
  color: #00ff41;
  font-weight: bold;
`;

const TerminalInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #00ff41;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  caret-color: #00ff41;
  
  &::placeholder {
    color: #333;
  }
`;

const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 8px;
  height: 16px;
  background: #00ff41;
  ${css`
    animation: ${blink} 1s infinite;
  `}
  margin-left: 2px;
`;

const BlinkingDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff41;
  ${css`
    animation: ${blink} 1s infinite;
  `}
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(145deg, #1a1a2e, #0a0a0a);
  border: 2px solid #00ff41;
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 0 50px rgba(0, 255, 65, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #00ff41;
`;

const ModalTitle = styled.h2`
  color: #00ff41;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: 2px solid #ff0040;
  color: #ff0040;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 18px;

  &:hover {
    background: rgba(255, 0, 64, 0.1);
    transform: scale(1.1);
  }
`;

const WarningBadge = styled.div`
  background: rgba(255, 170, 0, 0.2);
  border: 1px solid #ffaa00;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: start;
  gap: 10px;
`;

const WarningText = styled.div`
  color: #ffaa00;
  font-weight: bold;
  flex: 1;
`;

const InfoSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: #00ffff;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionContent = styled.div`
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const CodeBlock = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
  border-radius: 5px;
  padding: 12px;
  margin: 10px 0;
  font-family: 'Share Tech Mono', monospace;
  color: #00ff41;
  font-size: 0.9rem;
`;

const RealCommandExample = styled.div`
  background: rgba(0, 255, 65, 0.1);
  border-left: 4px solid #00ff41;
  padding: 12px;
  margin: 15px 0;
`;

const RealCommandLabel = styled.div`
  color: #00ff41;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const RealCommandCode = styled.div`
  color: #00ff41;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.95rem;
`;

const DontShowAgainButton = styled.button`
  background: transparent;
  border: 1px solid #888;
  color: #888;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.9rem;
  margin-top: 15px;
  width: 100%;

  &:hover {
    border-color: #00ff41;
    color: #00ff41;
    background: rgba(0, 255, 65, 0.1);
  }
`;

const AndroidDevTerminal = ({ phoneConnected = false, phoneData = null, gameState = null, dispatch = null, isAttackMode = false, targetDevice = null, isTargetTerminal = false, onCommand = null, isTutorialMode = false }) => {
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [osVersion, setOsVersion] = useState(28); // Default Android 9.0
  const [bluetoothDevices, setBluetoothDevices] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [educationContent, setEducationContent] = useState(null);
  const [dismissedCommands, setDismissedCommands] = useState(
    JSON.parse(localStorage.getItem('hackhilis_dismissed_commands') || '[]')
  );
  const [isInShell, setIsInShell] = useState(false);
  const [shellCwd, setShellCwd] = useState('/');
  const [shellHistory, setShellHistory] = useState([]);
  
  const getOSName = (version) => {
    const osNames = {
      28: 'Android 9.0 (Pie)',
      29: 'Android 10.0 (Q)',
      30: 'Android 11.0 (R)',
      31: 'Android 12.0 (S)',
      32: 'Android 12L',
      33: 'Android 13.0 (Tiramisu)',
      34: 'Android 14.0 (Upside Down Cake)'
    };
    return osNames[version] || 'Unknown';
  };

  const getInitialOutput = () => {
    if (isTargetTerminal && targetDevice) {
      return [
        { type: 'info', text: `Connected to: ${targetDevice.name}` },
        { type: 'info', text: `OS: ${targetDevice.os} | Security: ${targetDevice.security}/10` },
        { type: 'warning', text: 'Attempting unauthorized access...' },
        { type: 'info', text: 'Type "help" for attack commands' },
        { type: 'info', text: '' }
      ];
    }
    return [
      { type: 'info', text: 'Android Development Terminal v1.0' },
      { type: 'info', text: 'Type "help" for available commands' },
      { type: 'info', text: `Current OS: ${getOSName(osVersion)} (API ${osVersion})` },
      { type: 'info', text: '' }
    ];
  };

  const fictionalCommands = {
    'bt scan': {
      command: 'bt scan',
      realAlternative: 'bluetoothctl scan on',
      title: 'Bluetooth Scan Command',
      explanation: 'The "bt scan" command is a game shortcut. The real Linux command is:',
      realInfo: [
        'Real Bluetooth scanning commands:',
        '• bluetoothctl scan on - Start scanning for devices',
        '• bluetoothctl scan off - Stop scanning',
        '• bluetoothctl devices - List discovered devices',
        '',
        'How it works:',
        '• bluetoothctl is part of BlueZ (Linux Bluetooth stack)',
        '• Requires Bluetooth adapter to be enabled',
        '• Scans for discoverable Bluetooth devices',
        '• Shows device name, MAC address, and signal strength',
        '',
        'Usage:',
        '1. Open bluetoothctl: bluetoothctl',
        '2. Start scan: scan on',
        '3. Wait for devices to appear',
        '4. List devices: devices',
        '5. Stop scan: scan off',
        '',
        'Note: "bt scan" in this game is a shortcut for "bluetoothctl scan on"'
      ],
      example: 'bluetoothctl\n[bluetooth]# scan on\n[bluetooth]# devices'
    },
    'bt exploit': {
      command: 'bt exploit',
      realAlternative: 'bluetoothctl + security research tools',
      title: 'Bluetooth Exploitation',
      explanation: 'The "bt exploit" command is fictional. In reality, Bluetooth exploitation requires:',
      realInfo: [
        'Real Bluetooth security research uses tools like:',
        '• bluetoothctl - For device interaction',
        '• BlueZ stack vulnerabilities - Requires deep security research',
        '• BLE (Bluetooth Low Energy) scanners - Like nRF Connect',
        '• Specialized hardware - Like Ubertooth, HackRF',
        '',
        'Real Bluetooth attacks include:',
        '• BlueBorne - Remote code execution vulnerability',
        '• KNOB attack - Key negotiation weakness',
        '• BIAS attack - Bluetooth Impersonation AttackS',
        '',
        'These require:',
        '• Deep understanding of Bluetooth protocols',
        '• Security research and vulnerability discovery',
        '• Specialized hardware and software tools',
        '• Legal authorization (ethical hacking only)'
      ],
      example: 'bluetoothctl connect AA:BB:CC:DD:EE:FF\n# Then use security research tools for vulnerability testing'
    },
    'exploit shell': {
      command: 'exploit shell',
      realAlternative: 'adb shell (with proper authorization)',
      title: 'Root Shell Access',
      explanation: 'The "exploit shell" command is fictional. Real root access requires:',
      realInfo: [
        'Real root shell access methods:',
        '• adb shell - For authorized development devices',
        '• Root exploits - Like Magisk, SuperSU (require unlocked bootloader)',
        '• Security vulnerabilities - Like Dirty COW, Stagefright (patched)',
        '',
        'Important notes:',
        '• Rooting voids device warranty',
        '• Requires unlocked bootloader (on most devices)',
        '• Security risks - Opens device to malware',
        '• Legal only on devices you own',
        '',
        'For development:',
        '• Use adb shell on development devices',
        '• Enable Developer Options and USB Debugging',
        '• Use emulators for testing (already have root)'
      ],
      example: 'adb shell\n# Requires USB debugging enabled and authorized device'
    },
    'exploit backdoor': {
      command: 'exploit backdoor',
      realAlternative: 'Not recommended - Security risk',
      title: 'Persistent Backdoors',
      explanation: 'The "exploit backdoor" command is fictional. Real backdoors are:',
      realInfo: [
        'Real backdoors are malicious software that:',
        '• Maintain unauthorized access to systems',
        '• Are illegal when installed without permission',
        '• Are used by malware and attackers',
        '',
        'Legitimate alternatives:',
        '• SSH access - For authorized remote access',
        '• VPN connections - Secure remote access',
        '• Remote desktop - TeamViewer, RDP (with permission)',
        '',
        'Security best practices:',
        '• Use strong authentication',
        '• Keep systems updated',
        '• Monitor for unauthorized access',
        '• Use security tools to detect backdoors',
        '',
        '⚠️ Installing backdoors on systems you don\'t own is illegal!'
      ],
      example: '# Legitimate remote access:\nssh user@server\n# Or use VPN for secure access'
    },
    'exploit keylogger': {
      command: 'exploit keylogger',
      realAlternative: 'Not recommended - Illegal without consent',
      title: 'Keyloggers',
      explanation: 'The "exploit keylogger" command is fictional. Real keyloggers are:',
      realInfo: [
        'Keyloggers are software/hardware that record keystrokes:',
        '• Often used maliciously for data theft',
        '• Illegal when installed without consent',
        '• Can be detected by antivirus software',
        '',
        'Legitimate uses (with consent):',
        '• Parental control software',
        '• Employee monitoring (with disclosure)',
        '• Security research (authorized testing)',
        '',
        'Protection against keyloggers:',
        '• Use antivirus/anti-malware software',
        '• Keep system updated',
        '• Use virtual keyboards for sensitive input',
        '• Monitor for suspicious processes',
        '',
        '⚠️ Installing keyloggers without consent is illegal!'
      ],
      example: '# Legitimate monitoring (with consent):\n# Use parental control or employee monitoring software\n# Always disclose monitoring to users'
    },
    'hack-device': {
      command: 'hack-device',
      realAlternative: 'Security testing tools (with authorization)',
      title: 'Device Hacking',
      explanation: 'The "hack-device" command is fictional. Real device security testing uses:',
      realInfo: [
        'Legitimate security testing tools:',
        '• nmap - Network scanning and enumeration',
        '• Metasploit - Penetration testing framework',
        '• Burp Suite - Web application security testing',
        '• Wireshark - Network protocol analysis',
        '',
        'Ethical hacking process:',
        '1. Get written authorization',
        '2. Define scope of testing',
        '3. Use proper tools and techniques',
        '4. Document findings',
        '5. Report vulnerabilities responsibly',
        '',
        'Important:',
        '• Only test systems you own or have permission to test',
        '• Unauthorized access is illegal',
        '• Follow responsible disclosure practices',
        '',
        'For learning:',
        '• Use vulnerable VMs (DVWA, Metasploitable)',
        '• Practice on HackTheBox, TryHackMe',
        '• Study cybersecurity certifications (CEH, OSCP)'
      ],
      example: '# Legitimate security testing:\nnmap -sS target_ip\n# Requires authorization and proper scope'
    },
    'crack-pin': {
      command: 'crack-pin',
      realAlternative: 'Not recommended - Illegal without authorization',
      title: 'PIN Cracking',
      explanation: 'The "crack-pin" command is fictional. Real PIN/Password cracking:',
      realInfo: [
        'Password/PIN cracking tools:',
        '• John the Ripper - Password cracker',
        '• Hashcat - Advanced password recovery',
        '• Hydra - Network login cracker',
        '',
        'Legal considerations:',
        '• Only on systems you own or have written permission',
        '• Unauthorized access attempts are illegal',
        '• Can trigger security alerts and lockouts',
        '',
        'Legitimate uses:',
        '• Password recovery on your own systems',
        '• Security testing with authorization',
        '• Digital forensics (with proper authority)',
        '',
        'Protection:',
        '• Use strong, unique passwords',
        '• Enable account lockout after failed attempts',
        '• Use 2FA/MFA when possible',
        '• Monitor for brute force attempts',
        '',
        '⚠️ Unauthorized password cracking is illegal!'
      ],
      example: '# Legitimate password recovery (your own system):\njohn --wordlist=rockyou.txt hash.txt\n# Only use on systems you own!'
    }
  };

  const showEducation = (commandKey) => {
    // Check if user has dismissed this command
    if (dismissedCommands.includes(commandKey)) {
      return;
    }

    const content = fictionalCommands[commandKey];
    if (content) {
      setEducationContent(content);
      setShowEducationModal(true);
    }
  };

  const handleDismissEducation = (dontShowAgain = false) => {
    if (dontShowAgain && educationContent) {
      const updated = [...dismissedCommands, educationContent.command];
      setDismissedCommands(updated);
      localStorage.setItem('hackhilis_dismissed_commands', JSON.stringify(updated));
    }
    setShowEducationModal(false);
    setEducationContent(null);
  };

  const [output, setOutput] = useState(getInitialOutput());
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when output changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    // Refocus input after command execution
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, [output]);

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Keep input focused when clicking in terminal
  useEffect(() => {
    const handleClick = (e) => {
      if (terminalRef.current && terminalRef.current.contains(e.target)) {
        if (inputRef.current && e.target !== inputRef.current) {
          setTimeout(() => {
            inputRef.current.focus();
          }, 0);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const addOutput = (text, type = 'normal') => {
    setOutput(prev => [...prev, { type, text }]);
  };

  const executeCommand = (cmd) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) {
      if (isInShell) {
        addOutput('', 'normal');
      } else {
        addOutput('', 'normal');
      }
      return;
    }

    // If in shell mode, execute shell command
    if (isInShell) {
      executeShellCommand(trimmedCmd);
      return;
    }

    // Add command to history
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Show command in output
    addOutput(`$ ${trimmedCmd}`, 'normal');

    // Parse command
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Execute command
    switch (command) {
      case 'help':
        handleHelp();
        break;
      case 'sdkmanager':
        handleSdkManager(args);
        break;
      case 'avdmanager':
        handleAvdManager(args);
        break;
      case 'adb':
        handleAdb(args);
        break;
      case 'clear':
        setOutput([
          { type: 'info', text: 'Android Development Terminal v1.0' },
          { type: 'info', text: 'Type "help" for available commands' },
          { type: 'info', text: '' }
        ]);
        break;
      case 'ls':
      case 'dir':
        handleListDirectory(args);
        break;
      case 'pwd':
        addOutput('/home/hacker/android-sdk', 'normal');
        break;
      case 'cd':
        handleChangeDirectory(args);
        break;
      case 'cat':
        handleCat(args);
        break;
      case 'echo':
        addOutput(args.join(' '), 'normal');
        break;
      case 'whoami':
        addOutput('hacker', 'normal');
        break;
      case 'uname':
        addOutput('Linux android-dev 5.15.0', 'normal');
        break;
      case 'date':
        addOutput(new Date().toLocaleString(), 'normal');
        break;
      case 'phone':
        handlePhoneCommand(args);
        break;
      case 'switch-os':
        handleSwitchOS(args);
        break;
      case 'current-os':
        handleCurrentOS();
        break;
      case 'os-features':
        handleOSFeatures();
        break;
      case 'bt':
      case 'bluetoothctl':
        handleBluetooth(args, command === 'bluetoothctl');
        break;
      case 'hcitool':
        handleHcitool(args);
        break;
      case 'wifi':
      case 'iwlist':
      case 'nmcli':
        handleWifi(args, command);
        break;
      case 'exploit':
      case 'hack':
      case 'gain-access':
        if (isTargetTerminal && onCommand) {
          onCommand(trimmedCmd);
        }
        if (args.length > 0) {
          const exploitType = args[0];
          if (['shell', 'backdoor', 'keylogger'].includes(exploitType)) {
            showEducation(`exploit ${exploitType}`);
          }
        }
        handleExploit(args);
        break;
      case 'hack-device':
        showEducation('hack-device');
        handleHackDevice(args);
        break;
      case 'crack-pin':
        showEducation('crack-pin');
        handleCrackPin();
        break;
      default:
        if (command.startsWith('./') || command.startsWith('/')) {
          addOutput(`bash: ${command}: No such file or directory`, 'error');
        } else {
          addOutput(`Command not found: ${command}`, 'error');
          addOutput(`Type "help" for available commands`, 'info');
        }
    }

    addOutput('', 'normal');
  };

  const handleHelp = () => {
    addOutput('═══════════════════════════════════════════════════════', 'info');
    addOutput('           ANDROID DEV TERMINAL - COMMAND REFERENCE', 'info');
    addOutput('═══════════════════════════════════════════════════════', 'info');
    addOutput('', 'normal');
    
    addOutput('📱 PHONE DATA ACCESS:', 'info');
    addOutput('  phone info          - View phone system information', 'normal');
    addOutput('  phone contacts      - List all contacts', 'normal');
    addOutput('  phone messages      - View SMS messages', 'normal');
    addOutput('  phone emails        - View email inbox', 'normal');
    addOutput('  phone files         - Browse phone file system', 'normal');
    addOutput('  phone photos        - Access photo gallery', 'normal');
    addOutput('  phone apps          - List installed applications', 'normal');
    addOutput('  phone location      - Get GPS coordinates', 'normal');
    addOutput('  phone logs          - View system logs', 'normal');
    addOutput('', 'normal');
    
    addOutput('🔧 SDK & OS MANAGEMENT:', 'info');
    addOutput('  sdkmanager          - Manage Android SDK packages', 'normal');
    addOutput('  avdmanager          - Manage Android Virtual Devices', 'normal');
    addOutput('', 'normal');
    addOutput('📱 UPGRADE OS VERSION:', 'info');
    addOutput('  switch-os <version> - Upgrade/downgrade OS (28-34)', 'normal');
    addOutput('    Examples:', 'normal');
    addOutput('      switch-os 28    - Android 9.0 (Pie) - Basic security', 'normal');
    addOutput('      switch-os 30    - Android 11.0 (R) - Enhanced security', 'normal');
    addOutput('      switch-os 32    - Android 12L - Advanced security', 'normal');
    addOutput('      switch-os 33    - Android 13.0 - Maximum security', 'normal');
    addOutput('  current-os          - Show current OS version', 'normal');
    addOutput('  os-features         - Show OS version features & security', 'normal');
    addOutput('', 'normal');
    
    addOutput('📡 BLUETOOTH & NETWORK:', 'info');
    addOutput('  bluetoothctl scan on - Scan for Bluetooth devices (real command)', 'normal');
    addOutput('  bluetoothctl devices - List discovered devices (real command)', 'normal');
    addOutput('  bluetoothctl connect <mac> - Connect to device (real command)', 'normal');
    addOutput('  bluetoothctl disconnect - Disconnect from device (real command)', 'normal');
    addOutput('  hcitool scan        - Legacy Bluetooth scan (deprecated)', 'normal');
    addOutput('  bt exploit <mac>    - Attempt Bluetooth exploit (game command)', 'normal');
    addOutput('  iwlist scan         - Scan for WiFi networks (real command)', 'normal');
    addOutput('  nmcli device wifi   - List WiFi networks (real command)', 'normal');
    addOutput('  wifi connect <ssid> - Connect to WiFi (game command)', 'normal');
    addOutput('', 'normal');
    
    addOutput('🔓 ATTACK & EXPLOITATION:', 'info');
    addOutput('  exploit shell       - Gain root shell access', 'normal');
    addOutput('  exploit backdoor    - Install persistent backdoor', 'normal');
    addOutput('  exploit keylogger    - Install keylogger', 'normal');
    addOutput('  exploit camera      - Access camera remotely', 'normal');
    addOutput('  exploit mic         - Access microphone remotely', 'normal');
    addOutput('  exploit sms         - Intercept SMS messages', 'normal');
    addOutput('  exploit location    - Track device location', 'normal');
    addOutput('  exploit contacts    - Extract contact database', 'normal');
    addOutput('  exploit photos      - Download all photos', 'normal');
    addOutput('  exploit files       - Access file system', 'normal');
    addOutput('  exploit wallet      - Extract wallet data and balances', 'normal');
    addOutput('  exploit purchases   - View purchase history', 'normal');
    addOutput('  exploit transfer <amount> - Transfer money from wallet', 'normal');
    addOutput('  hack-device <ip>    - Attempt device hack via IP', 'normal');
    addOutput('  crack-pin           - Attempt PIN brute force', 'normal');
    addOutput('', 'normal');
    
    addOutput('🛠️  ADB COMMANDS:', 'info');
    addOutput('  adb devices         - List connected devices', 'normal');
    addOutput('  adb shell           - Open interactive Android shell', 'normal');
    addOutput('    Once in shell, you can use:', 'normal');
    addOutput('      ls, cd, cat, pwd - Navigate Android filesystem', 'normal');
    addOutput('      Access /sdcard, /data/data, /system, etc.', 'normal');
    addOutput('      Type "exit" to leave shell', 'normal');
    addOutput('  adb install <apk>   - Install APK', 'normal');
    addOutput('  adb uninstall <pkg> - Uninstall package', 'normal');
    addOutput('  adb push <src> <dst> - Push file to device', 'normal');
    addOutput('  adb pull <src> <dst> - Pull file from device', 'normal');
    addOutput('  adb logcat         - View device logs', 'normal');
    addOutput('  adb reboot         - Reboot device', 'normal');
    addOutput('  adb root           - Restart with root', 'normal');
    addOutput('', 'normal');
    
    addOutput('📁 FILE SYSTEM:', 'info');
    addOutput('  ls/dir              - List directory contents', 'normal');
    addOutput('  cd <dir>            - Change directory', 'normal');
    addOutput('  pwd                 - Print working directory', 'normal');
    addOutput('  cat <file>          - Display file contents', 'normal');
    addOutput('  rm <file>           - Delete file', 'normal');
    addOutput('  mkdir <dir>         - Create directory', 'normal');
    addOutput('', 'normal');
    
    addOutput('💡 TIPS & ATTACK SCENARIOS:', 'info');
    addOutput('  1. Start with "adb devices" to check connection', 'normal');
    addOutput('  2. Use "phone info" to gather device information', 'normal');
    addOutput('  3. Upgrade OS: "switch-os 32" for better security', 'normal');
    addOutput('  4. Check OS: "current-os" to see current version', 'normal');
    addOutput('  5. Scan Bluetooth: "bt scan" then "bt exploit <mac>"', 'normal');
    addOutput('  6. Gain access: "exploit shell" for root access', 'normal');
    addOutput('  7. Install backdoor: "exploit backdoor" for persistence', 'normal');
    addOutput('  8. Extract data: "exploit contacts", "exploit photos"', 'normal');
    addOutput('  9. Higher OS (32+) = Better security, harder to exploit', 'normal');
    addOutput('  10. Lower OS (28-30) = Easier to exploit, more vulnerable', 'normal');
    addOutput('', 'normal');
    
    addOutput('🔐 OS VERSION SECURITY:', 'info');
    addOutput('  API 28 (Android 9)  - Basic security, easy exploits', 'normal');
    addOutput('  API 30 (Android 11) - Enhanced security, medium difficulty', 'normal');
    addOutput('  API 32 (Android 12L)- Advanced security, harder exploits', 'normal');
    addOutput('  API 33+ (Android 13+)- Maximum security, expert level', 'normal');
    addOutput('', 'normal');
    
    addOutput('Type "help <command>" for detailed usage', 'info');
  };

  const handleSdkManager = (args) => {
    if (args.length === 0) {
      addOutput('Usage: sdkmanager [options] [packages...]', 'info');
      addOutput('Options:', 'info');
      addOutput('  --list              List all available packages', 'normal');
      addOutput('  --install <package> Install a package', 'normal');
      addOutput('  --uninstall <package> Uninstall a package', 'normal');
      addOutput('  --update            Update all installed packages', 'normal');
      return;
    }

    const option = args[0];

    if (option === '--list') {
      addOutput('Available SDK packages:', 'info');
      addOutput('  platforms;android-28    Android 9.0 (Pie)', 'normal');
      addOutput('  platforms;android-29    Android 10.0 (Q)', 'normal');
      addOutput('  platforms;android-30    Android 11.0 (R)', 'normal');
      addOutput('  platforms;android-31    Android 12.0 (S)', 'normal');
      addOutput('  platforms;android-32    Android 12L', 'normal');
      addOutput('  platforms;android-33    Android 13.0 (Tiramisu)', 'normal');
      addOutput('  platforms;android-34    Android 14.0 (Upside Down Cake)', 'normal');
      addOutput('  build-tools;28.0.3      Android SDK Build-Tools 28.0.3', 'normal');
      addOutput('  build-tools;30.0.3      Android SDK Build-Tools 30.0.3', 'normal');
      addOutput('  build-tools;33.0.0     Android SDK Build-Tools 33.0.0', 'normal');
      addOutput('  system-images;android-28;google_apis;x86_64', 'normal');
      addOutput('  system-images;android-30;google_apis;x86_64', 'normal');
      addOutput('  system-images;android-33;google_apis;x86_64', 'normal');
    } else if (option === '--install') {
      const packageName = args.slice(1).join(' ');
      if (!packageName) {
        addOutput('Error: Package name required', 'error');
        return;
      }
      addOutput(`Installing ${packageName}...`, 'info');
      setTimeout(() => {
        addOutput(`Successfully installed ${packageName}`, 'success');
      }, 1000);
    } else if (option === '--uninstall') {
      const packageName = args.slice(1).join(' ');
      if (!packageName) {
        addOutput('Error: Package name required', 'error');
        return;
      }
      addOutput(`Uninstalling ${packageName}...`, 'info');
      setTimeout(() => {
        addOutput(`Successfully uninstalled ${packageName}`, 'success');
      }, 1000);
    } else if (option === '--update') {
      addOutput('Updating all installed packages...', 'info');
      setTimeout(() => {
        addOutput('All packages are up to date', 'success');
      }, 1500);
    } else {
      addOutput(`Unknown option: ${option}`, 'error');
      addOutput('Use --list, --install, --uninstall, or --update', 'info');
    }
  };

  const handleAvdManager = (args) => {
    if (args.length === 0) {
      addOutput('Usage: avdmanager [command] [options]', 'info');
      addOutput('Commands:', 'info');
      addOutput('  list avd          List all AVDs', 'normal');
      addOutput('  create avd        Create a new AVD', 'normal');
      addOutput('  delete avd        Delete an AVD', 'normal');
      addOutput('  move avd          Move/rename an AVD', 'normal');
      return;
    }

    const command = args[0];
    const subcommand = args[1];

    if (command === 'list' && subcommand === 'avd') {
      addOutput('Available Android Virtual Devices:', 'info');
      addOutput('  Name: Pixel_5_API_28', 'normal');
      addOutput('    Path: /home/hacker/.android/avd/Pixel_5_API_28.avd', 'normal');
      addOutput('    Target: Android 9.0 (API 28)', 'normal');
      addOutput('    Device: pixel_5 (mobile)', 'normal');
      addOutput('  Name: Pixel_6_API_33', 'normal');
      addOutput('    Path: /home/hacker/.android/avd/Pixel_6_API_33.avd', 'normal');
      addOutput('    Target: Android 13.0 (API 33)', 'normal');
      addOutput('    Device: pixel_6 (mobile)', 'normal');
    } else if (command === 'create' && subcommand === 'avd') {
      addOutput('Creating new AVD...', 'info');
      addOutput('Please specify AVD name, target, and device', 'info');
      addOutput('Example: avdmanager create avd -n MyAVD -k "system-images;android-28;google_apis;x86_64"', 'normal');
    } else if (command === 'delete' && subcommand === 'avd') {
      const avdName = args[2];
      if (!avdName) {
        addOutput('Error: AVD name required', 'error');
        return;
      }
      addOutput(`Deleting AVD: ${avdName}...`, 'info');
      setTimeout(() => {
        addOutput(`Successfully deleted ${avdName}`, 'success');
      }, 1000);
    } else {
      addOutput(`Unknown command: ${command}`, 'error');
    }
  };

  const handleAdb = (args) => {
    if (args.length === 0) {
      addOutput('Android Debug Bridge version 1.0.41', 'info');
      addOutput('Usage: adb [command] [options]', 'info');
      addOutput('Commands:', 'info');
      addOutput('  devices              List connected devices', 'normal');
      addOutput('  shell                 Open device shell', 'normal');
      addOutput('  install <apk>         Install APK', 'normal');
      addOutput('  uninstall <package>   Uninstall package', 'normal');
      addOutput('  push <local> <remote> Push file to device', 'normal');
      addOutput('  pull <remote> <local> Pull file from device', 'normal');
      addOutput('  logcat               View device logs', 'normal');
      addOutput('  reboot                Reboot device', 'normal');
      addOutput('  root                  Restart adbd with root permissions', 'normal');
      return;
    }

    const command = args[0];

    switch (command) {
      case 'devices':
        if (phoneConnected) {
          addOutput('List of devices attached', 'info');
          addOutput('emulator-5554    device', 'success');
          addOutput('192.168.1.100:5555  device', 'success');
        } else {
          addOutput('List of devices attached', 'info');
          addOutput('(no devices found)', 'warning');
        }
        break;
      case 'shell':
        if (!phoneConnected) {
          addOutput('Error: No device connected', 'error');
          return;
        }
        setIsInShell(true);
        setShellCwd('/');
        addOutput('Entering device shell...', 'info');
        addOutput('Type "exit" to leave shell', 'info');
        addOutput('', 'normal');
        break;
      case 'install':
        const apk = args[1];
        if (!apk) {
          addOutput('Error: APK path required', 'error');
          return;
        }
        addOutput(`Installing ${apk}...`, 'info');
        setTimeout(() => {
          addOutput(`Success: ${apk} installed`, 'success');
        }, 1500);
        break;
      case 'uninstall':
        const packageName = args[1];
        if (!packageName) {
          addOutput('Error: Package name required', 'error');
          return;
        }
        addOutput(`Uninstalling ${packageName}...`, 'info');
        setTimeout(() => {
          addOutput(`Success: ${packageName} uninstalled`, 'success');
        }, 1000);
        break;
      case 'push':
        const localFile = args[1];
        const remotePath = args[2];
        if (!localFile || !remotePath) {
          addOutput('Error: Both local and remote paths required', 'error');
          return;
        }
        addOutput(`Pushing ${localFile} to ${remotePath}...`, 'info');
        setTimeout(() => {
          addOutput(`${localFile}: 1 file pushed.`, 'success');
        }, 1000);
        break;
      case 'pull':
        const remoteFile = args[1];
        const localPath = args[2] || './';
        if (!remoteFile) {
          addOutput('Error: Remote file path required', 'error');
          return;
        }
        addOutput(`Pulling ${remoteFile} to ${localPath}...`, 'info');
        setTimeout(() => {
          addOutput(`${remoteFile}: 1 file pulled.`, 'success');
        }, 1000);
        break;
      case 'logcat':
        addOutput('Reading device logs...', 'info');
        addOutput('--------- beginning of system', 'normal');
        addOutput('03-15 10:30:45.123  1234  1234 I SystemServer: Starting system services', 'normal');
        addOutput('03-15 10:30:45.456  1234  1234 I ActivityManager: System ready', 'normal');
        addOutput('(Press Ctrl+C to stop)', 'info');
        break;
      case 'reboot':
        addOutput('Rebooting device...', 'warning');
        setTimeout(() => {
          addOutput('Device rebooted successfully', 'success');
        }, 2000);
        break;
      case 'root':
        addOutput('Restarting adbd with root permissions...', 'info');
        setTimeout(() => {
          addOutput('adbd restarted with root permissions', 'success');
        }, 1000);
        break;
      default:
        addOutput(`Unknown command: ${command}`, 'error');
        addOutput('Type "adb" for help', 'info');
    }
  };

  const handleListDirectory = (args) => {
    const path = args[0] || '.';
    addOutput(`Contents of ${path}:`, 'info');
    addOutput('  android-sdk/', 'normal');
    addOutput('  platforms/', 'normal');
    addOutput('  build-tools/', 'normal');
    addOutput('  system-images/', 'normal');
    addOutput('  platform-tools/', 'normal');
    addOutput('  tools/', 'normal');
    addOutput('  avd/', 'normal');
  };

  const handleChangeDirectory = (args) => {
    const path = args[0];
    if (!path) {
      addOutput('Usage: cd <directory>', 'error');
      return;
    }
    addOutput(`Changed directory to ${path}`, 'info');
  };

  const handleCat = (args) => {
    const file = args[0];
    if (!file) {
      addOutput('Usage: cat <file>', 'error');
      return;
    }
    addOutput(`Contents of ${file}:`, 'info');
    addOutput('  [File contents would appear here]', 'normal');
  };

  const handlePhoneCommand = (args) => {
    if (args.length === 0) {
      addOutput('Usage: phone <command>', 'error');
      addOutput('Commands: info, contacts, messages, emails, files, photos, apps, location, logs', 'info');
      return;
    }

    const subcommand = args[0];

    if (!phoneConnected || !phoneData) {
      addOutput('Error: No phone connected', 'error');
      return;
    }

    switch (subcommand) {
      case 'info':
        addOutput('═══════════════════════════════════════════════════════', 'info');
        addOutput('                    PHONE INFORMATION', 'info');
        addOutput('═══════════════════════════════════════════════════════', 'info');
        addOutput(`Model: ${phoneData.model || 'Unknown'}`, 'normal');
        addOutput(`Battery: ${phoneData.battery || 0}%`, 'normal');
        addOutput(`Security Level: ${phoneData.securityLevel || 1}/10`, 'normal');
        addOutput(`OS Version: Android ${osVersion} (API ${osVersion})`, 'normal');
        addOutput(`Money: $${phoneData.money || 0}`, 'normal');
        addOutput(`Contacts: ${phoneData.contacts?.length || 0}`, 'normal');
        addOutput(`Messages: ${phoneData.messages?.length || 0}`, 'normal');
        addOutput(`Emails: ${phoneData.emails?.length || 0}`, 'normal');
        break;
      case 'contacts':
        if (phoneData.contacts && phoneData.contacts.length > 0) {
          addOutput('Contacts:', 'info');
          phoneData.contacts.forEach(contact => {
            addOutput(`  ${contact.name}: ${contact.number}`, 'normal');
          });
        } else {
          addOutput('No contacts found', 'warning');
        }
        break;
      case 'messages':
        if (phoneData.messages && phoneData.messages.length > 0) {
          addOutput('Messages:', 'info');
          phoneData.messages.forEach(msg => {
            addOutput(`  [${msg.time}] ${msg.sender}: ${msg.content}`, 'normal');
          });
        } else {
          addOutput('No messages found', 'warning');
        }
        break;
      case 'emails':
        if (phoneData.emails && phoneData.emails.length > 0) {
          addOutput('Emails:', 'info');
          phoneData.emails.forEach(email => {
            addOutput(`  [${email.time}] ${email.sender}: ${email.subject}`, 'normal');
          });
        } else {
          addOutput('No emails found', 'warning');
        }
        break;
      case 'files':
        addOutput('Phone File System:', 'info');
        addOutput('  /sdcard/', 'normal');
        addOutput('    Downloads/', 'normal');
        addOutput('    Pictures/', 'normal');
        addOutput('    Documents/', 'normal');
        addOutput('    Music/', 'normal');
        addOutput('  /data/', 'normal');
        addOutput('    apps/', 'normal');
        addOutput('    system/', 'normal');
        break;
      case 'photos':
        addOutput('Photo Gallery:', 'info');
        addOutput('  /sdcard/Pictures/', 'normal');
        addOutput('    IMG_001.jpg (2.3 MB)', 'normal');
        addOutput('    IMG_002.jpg (1.8 MB)', 'normal');
        addOutput('    IMG_003.jpg (3.1 MB)', 'normal');
        addOutput(`  Total: ${Math.floor(Math.random() * 50) + 10} photos`, 'normal');
        break;
      case 'apps':
        addOutput('Installed Applications:', 'info');
        addOutput('  com.android.chrome (Chrome Browser)', 'normal');
        addOutput('  com.whatsapp (WhatsApp)', 'normal');
        addOutput('  com.facebook.katana (Facebook)', 'normal');
        addOutput('  com.instagram.android (Instagram)', 'normal');
        addOutput('  com.android.mms (Messages)', 'normal');
        addOutput('  com.android.email (Email)', 'normal');
        break;
      case 'location':
        addOutput('GPS Coordinates:', 'info');
        addOutput(`  Latitude: ${(Math.random() * 180 - 90).toFixed(6)}`, 'normal');
        addOutput(`  Longitude: ${(Math.random() * 360 - 180).toFixed(6)}`, 'normal');
        addOutput('  Accuracy: 10 meters', 'normal');
        break;
      case 'logs':
        addOutput('System Logs:', 'info');
        addOutput('  03-15 10:30:45.123 I SystemServer: Starting services', 'normal');
        addOutput('  03-15 10:30:45.456 I ActivityManager: System ready', 'normal');
        addOutput('  03-15 10:30:46.789 I PackageManager: Scanning packages', 'normal');
        break;
      default:
        addOutput(`Unknown phone command: ${subcommand}`, 'error');
    }
  };

  const handleSwitchOS = (args) => {
    if (args.length === 0) {
      addOutput('Usage: switch-os <version>', 'error');
      addOutput('', 'normal');
      addOutput('Available OS versions:', 'info');
      addOutput('  28 - Android 9.0 (Pie) - Basic security', 'normal');
      addOutput('  29 - Android 10.0 (Q) - Enhanced features', 'normal');
      addOutput('  30 - Android 11.0 (R) - Enhanced security', 'normal');
      addOutput('  31 - Android 12.0 (S) - Advanced features', 'normal');
      addOutput('  32 - Android 12L - Advanced security', 'normal');
      addOutput('  33 - Android 13.0 (Tiramisu) - Maximum security', 'normal');
      addOutput('  34 - Android 14.0 - Latest security', 'normal');
      addOutput('', 'normal');
      addOutput('Example: switch-os 32', 'info');
      addOutput('Note: Higher versions = Better security but harder to exploit', 'warning');
      return;
    }

    const version = parseInt(args[0]);
    if (isNaN(version) || version < 28 || version > 34) {
      addOutput('Error: Invalid OS version. Must be between 28-34', 'error');
      return;
    }

    addOutput(`Switching to Android API ${version}...`, 'info');
      setTimeout(() => {
      setOsVersion(version);
      addOutput(`Successfully switched to ${getOSName(version)} (API ${version})`, 'success');
      if (version >= 32) {
        addOutput('Advanced security features enabled', 'success');
        addOutput('Exploits will be more difficult', 'warning');
      }
      if (dispatch && phoneData) {
        dispatch({ type: 'SET_PHONE', payload: { ...phoneData, osVersion: version } });
      }
    }, 1500);
  };

  const handleCurrentOS = () => {
    addOutput(`Current OS: ${getOSName(osVersion)} (API ${osVersion})`, 'info');
    if (osVersion >= 32) {
      addOutput('Security Level: Advanced', 'success');
    } else if (osVersion >= 30) {
      addOutput('Security Level: Medium', 'normal');
    } else {
      addOutput('Security Level: Basic', 'warning');
    }
  };

  const handleOSFeatures = () => {
    addOutput('═══════════════════════════════════════════════════════', 'info');
    addOutput('              OS VERSION FEATURES & SECURITY', 'info');
    addOutput('═══════════════════════════════════════════════════════', 'info');
    addOutput('', 'normal');
    addOutput('API 28 (Android 9.0):', 'info');
    addOutput('  - Basic security features', 'normal');
    addOutput('  - Easy to exploit', 'warning');
    addOutput('  - No advanced encryption', 'warning');
    addOutput('  - Vulnerable to common attacks', 'warning');
    addOutput('', 'normal');
    addOutput('API 30 (Android 11.0):', 'info');
    addOutput('  - Enhanced security', 'normal');
    addOutput('  - Scoped storage', 'normal');
    addOutput('  - Medium exploit difficulty', 'normal');
    addOutput('', 'normal');
    addOutput('API 32 (Android 12L):', 'info');
    addOutput('  - Advanced security features', 'normal');
    addOutput('  - Strong encryption', 'normal');
    addOutput('  - Hard to exploit', 'success');
    addOutput('  - Requires expert skills', 'success');
    addOutput('', 'normal');
    addOutput('API 33+ (Android 13+):', 'info');
    addOutput('  - Maximum security', 'normal');
    addOutput('  - Quantum-resistant encryption', 'normal');
    addOutput('  - Very hard to exploit', 'success');
    addOutput('  - Requires legendary hacking skills', 'success');
  };

  const handleBluetooth = (args, isBluetoothctl = false) => {
    if (args.length === 0) {
      if (isBluetoothctl) {
        addOutput('bluetoothctl - Bluetooth control tool', 'info');
        addOutput('Usage: bluetoothctl [command]', 'info');
        addOutput('Commands:', 'info');
        addOutput('  scan on            - Start scanning for devices', 'normal');
        addOutput('  scan off           - Stop scanning', 'normal');
        addOutput('  devices            - List discovered devices', 'normal');
        addOutput('  connect <MAC>      - Connect to device', 'normal');
        addOutput('  disconnect         - Disconnect from device', 'normal');
        addOutput('  pair <MAC>         - Pair with device', 'normal');
        addOutput('  trust <MAC>        - Trust device', 'normal');
        addOutput('  info <MAC>         - Show device info', 'normal');
        addOutput('', 'normal');
        addOutput('Note: "bt" is a shortcut alias for bluetoothctl', 'info');
      } else {
        addOutput('Usage: bt <command>', 'error');
        addOutput('Commands: scan, list, connect, disconnect, exploit', 'info');
        addOutput('Note: Use "bluetoothctl" for real Linux commands', 'info');
      }
      return;
    }

    const subcommand = args[0];

    switch (subcommand) {
      case 'scan':
        if (!isBluetoothctl) {
          // Show education for shortcut command
          showEducation('bt scan');
        }
        if (isBluetoothctl && args[1] === 'on') {
          addOutput('Scanning for Bluetooth devices...', 'info');
          addOutput('[bluetooth]# scan on', 'normal');
        } else if (isBluetoothctl && args[1] === 'off') {
          addOutput('Stopping scan...', 'info');
          addOutput('[bluetooth]# scan off', 'normal');
        } else {
          addOutput('Scanning for Bluetooth devices...', 'info');
        }
        setTimeout(() => {
          const devices = [
            { name: 'iPhone 13 Pro', mac: 'AA:BB:CC:DD:EE:01', rssi: -45, type: 'Phone' },
            { name: 'Samsung Galaxy S21', mac: 'AA:BB:CC:DD:EE:02', rssi: -52, type: 'Phone' },
            { name: 'MacBook Pro', mac: 'AA:BB:CC:DD:EE:03', rssi: -38, type: 'Laptop' },
            { name: 'AirPods Pro', mac: 'AA:BB:CC:DD:EE:04', rssi: -65, type: 'Audio' },
            { name: 'Smart Watch', mac: 'AA:BB:CC:DD:EE:05', rssi: -58, type: 'Wearable' }
          ];
          setBluetoothDevices(devices);
          if (isBluetoothctl) {
            addOutput('Device found: AA:BB:CC:DD:EE:01 iPhone 13 Pro', 'success');
            addOutput('Device found: AA:BB:CC:DD:EE:02 Samsung Galaxy S21', 'success');
            addOutput('Device found: AA:BB:CC:DD:EE:03 MacBook Pro', 'success');
            addOutput('Device found: AA:BB:CC:DD:EE:04 AirPods Pro', 'success');
            addOutput('Device found: AA:BB:CC:DD:EE:05 Smart Watch', 'success');
          } else {
            addOutput('Found 5 devices:', 'success');
            devices.forEach(device => {
              addOutput(`  ${device.name} (${device.mac}) - ${device.type} - Signal: ${device.rssi}dBm`, 'normal');
            });
          }
        }, 2000);
        break;
      case 'devices':
      case 'list':
        if (bluetoothDevices.length === 0) {
          addOutput('No devices found. Run "bluetoothctl scan on" first', 'warning');
        } else {
          if (isBluetoothctl) {
            addOutput('Device AA:BB:CC:DD:EE:01 iPhone 13 Pro', 'normal');
            addOutput('Device AA:BB:CC:DD:EE:02 Samsung Galaxy S21', 'normal');
            addOutput('Device AA:BB:CC:DD:EE:03 MacBook Pro', 'normal');
            addOutput('Device AA:BB:CC:DD:EE:04 AirPods Pro', 'normal');
            addOutput('Device AA:BB:CC:DD:EE:05 Smart Watch', 'normal');
          } else {
            addOutput('Discovered Devices:', 'info');
            bluetoothDevices.forEach(device => {
              addOutput(`  ${device.name} (${device.mac})`, 'normal');
            });
          }
        }
        break;
      case 'connect':
        const mac = args[1];
        if (!mac) {
          addOutput('Error: MAC address required', 'error');
          return;
        }
        if (isBluetoothctl) {
          addOutput(`[bluetooth]# connect ${mac}`, 'normal');
        }
        addOutput(`Attempting to connect to ${mac}...`, 'info');
        setTimeout(() => {
          addOutput(`Successfully connected to ${mac}`, 'success');
          setConnectedDevices(prev => [...prev, mac]);
        }, 1500);
        break;
      case 'disconnect':
        if (connectedDevices.length === 0) {
          addOutput('No devices connected', 'warning');
        } else {
          if (isBluetoothctl) {
            addOutput('[bluetooth]# disconnect', 'normal');
          }
          addOutput('Disconnecting...', 'info');
          setConnectedDevices([]);
          addOutput('Disconnected', 'success');
        }
        break;
      case 'exploit':
        if (isBluetoothctl) {
          addOutput('Error: "exploit" is not a real bluetoothctl command', 'error');
          addOutput('Use "bt exploit <mac>" for game exploit functionality', 'info');
          return;
        }
        const targetMac = args[1];
        if (!targetMac) {
          addOutput('Error: MAC address required', 'error');
          return;
        }
        showEducation('bt exploit');
        addOutput(`Attempting Bluetooth exploit on ${targetMac}...`, 'warning');
        setTimeout(() => {
          // In tutorial mode, always succeed
          const success = isTutorialMode ? true : Math.random() > 0.3;
          if (success) {
            addOutput(`Exploit successful! Gained access to device`, 'success');
            addOutput(`Device information extracted`, 'success');
            if (isTargetTerminal && onCommand) {
              onCommand(`bt exploit ${targetMac}`);
            }
          } else {
            addOutput(`Exploit failed. Device has strong security`, 'error');
          }
        }, 3000);
        break;
      default:
        if (isBluetoothctl) {
          addOutput(`Unknown command: ${subcommand}`, 'error');
          addOutput('Type "bluetoothctl" for help', 'info');
        } else {
          addOutput(`Unknown Bluetooth command: ${subcommand}`, 'error');
        }
    }
  };

  const handleHcitool = (args) => {
    if (args.length === 0 || args[0] !== 'scan') {
      addOutput('hcitool - HCI tool (deprecated, use bluetoothctl instead)', 'info');
      addOutput('Usage: hcitool scan', 'info');
      return;
    }

    addOutput('Scanning ...', 'info');
    addOutput('Note: hcitool is deprecated. Use "bluetoothctl scan on" instead', 'warning');
    setTimeout(() => {
      addOutput('AA:BB:CC:DD:EE:01\tiPhone 13 Pro', 'normal');
      addOutput('AA:BB:CC:DD:EE:02\tSamsung Galaxy S21', 'normal');
      addOutput('AA:BB:CC:DD:EE:03\tMacBook Pro', 'normal');
    }, 2000);
  };

  const handleWifi = (args, commandType = 'wifi') => {
    if (args.length === 0) {
      if (commandType === 'iwlist') {
        addOutput('iwlist - Configure wireless network parameters', 'info');
        addOutput('Usage: iwlist <interface> scan', 'info');
        addOutput('Example: iwlist wlan0 scan', 'normal');
        return;
      } else if (commandType === 'nmcli') {
        addOutput('nmcli - NetworkManager command line tool', 'info');
        addOutput('Usage: nmcli device wifi [command]', 'info');
        addOutput('Commands:', 'info');
        addOutput('  list              - List available WiFi networks', 'normal');
        addOutput('  connect <SSID>    - Connect to network', 'normal');
        addOutput('  rescan            - Rescan for networks', 'normal');
        return;
      } else {
        addOutput('Usage: wifi <command>', 'error');
        addOutput('Commands: scan, connect', 'info');
        addOutput('Note: Use "iwlist wlan0 scan" or "nmcli device wifi list" for real commands', 'info');
        return;
      }
    }

    if (commandType === 'iwlist') {
      const interfaceName = args[0] || 'wlan0';
      if (args[1] !== 'scan') {
        addOutput(`Usage: iwlist ${interfaceName} scan`, 'error');
        return;
      }
      addOutput(`Scanning ${interfaceName}...`, 'info');
      setTimeout(() => {
        addOutput('Cell 01 - Address: AA:BB:CC:DD:EE:11', 'normal');
        addOutput('          ESSID:"Home_Network"', 'normal');
        addOutput('          Protocol:IEEE 802.11bgn', 'normal');
        addOutput('          Mode:Master', 'normal');
        addOutput('          Frequency:2.462 GHz', 'normal');
        addOutput('          Encryption key:on', 'normal');
        addOutput('          Quality=70/70  Signal level=-45 dBm', 'normal');
      }, 2000);
      return;
    }

    if (commandType === 'nmcli') {
      if (args[0] === 'wifi' && args[1] === 'list') {
        addOutput('SSID               BSSID              MODE   CHAN  RATE        SIGNAL  BARS  SECURITY', 'info');
        addOutput('Home_Network       AA:BB:CC:DD:EE:11  Infra  6     54 Mbit/s    70      ▂▄▆█  WPA2', 'normal');
        addOutput('Office_WiFi        AA:BB:CC:DD:EE:22  Infra  11    54 Mbit/s    65      ▂▄▆_  WPA3', 'normal');
        addOutput('Public_WiFi        AA:BB:CC:DD:EE:33  Infra  1     54 Mbit/s    45      ▂▄__  --', 'normal');
        return;
      }
    }

    const subcommand = args[0];

    switch (subcommand) {
      case 'scan':
        addOutput('Scanning for WiFi networks...', 'info');
        setTimeout(() => {
          addOutput('Found networks:', 'success');
          addOutput('  Home_Network (WPA2) - Signal: -45dBm', 'normal');
          addOutput('  Office_WiFi (WPA3) - Signal: -52dBm', 'normal');
          addOutput('  Public_WiFi (Open) - Signal: -65dBm', 'normal');
          addOutput('  Secure_Network (WPA3) - Signal: -38dBm', 'normal');
        }, 2000);
        break;
      case 'connect':
        const ssid = args[1];
        if (!ssid) {
          addOutput('Error: SSID required', 'error');
          return;
        }
        addOutput(`Connecting to ${ssid}...`, 'info');
        setTimeout(() => {
          addOutput(`Connected to ${ssid}`, 'success');
        }, 1500);
        break;
      default:
        addOutput(`Unknown WiFi command: ${subcommand}`, 'error');
    }
  };

  const handleExploit = (args) => {
    if (args.length === 0) {
      addOutput('Usage: exploit <type>', 'error');
      addOutput('Types: shell, backdoor, keylogger, camera, mic, sms, location, contacts, photos, files, wallet, transfer, purchases', 'info');
      return;
    }

    const exploitType = args[0];
    const securityLevel = phoneData?.securityLevel || targetDevice?.security || 1;
    const osDifficulty = osVersion >= 32 ? 0.3 : osVersion >= 30 ? 0.5 : 0.8; // Higher OS = harder
    const successRate = (securityLevel / 10) * osDifficulty;

    addOutput(`Attempting ${exploitType} exploit...`, 'warning');
    addOutput(`Security Level: ${securityLevel}/10, OS: API ${osVersion}`, 'info');

    setTimeout(() => {
      // In tutorial mode, always succeed
      const success = isTutorialMode ? true : Math.random() < successRate;
      
      if (success) {
        addOutput(`✓ Exploit successful!`, 'success');
        switch (exploitType) {
          case 'shell':
            addOutput('Root shell access granted', 'success');
            addOutput('You now have full device control', 'success');
            break;
          case 'backdoor':
            addOutput('Persistent backdoor installed', 'success');
            addOutput('Device will remain accessible', 'success');
            break;
          case 'keylogger':
            addOutput('Keylogger installed and active', 'success');
            addOutput('Capturing all keystrokes', 'success');
            break;
          case 'camera':
            addOutput('Camera access granted', 'success');
            addOutput('Streaming camera feed...', 'success');
            break;
          case 'mic':
            addOutput('Microphone access granted', 'success');
            addOutput('Recording audio...', 'success');
            break;
          case 'sms':
            addOutput('SMS interception active', 'success');
            addOutput('All messages are being logged', 'success');
            if (isTutorialMode) {
              addOutput('', 'normal');
              addOutput('Intercepted Messages:', 'info');
              addOutput('  From: +1-555-0101 | "Meeting at 3pm" | 2024-01-15 14:30', 'normal');
              addOutput('  From: +1-555-0102 | "Don\'t forget the password: Secure123" | 2024-01-16 09:15', 'normal');
              addOutput('  From: +1-555-0103 | "Code: 4829" | 2024-01-17 11:22', 'normal');
              addOutput('  Total: 23 messages intercepted', 'success');
            }
            break;
          case 'location':
            addOutput('Location tracking enabled', 'success');
            addOutput('Device position: 40.7128° N, 74.0060° W', 'success');
            break;
          case 'contacts':
            addOutput('Contact database extracted', 'success');
            if (isTutorialMode) {
              addOutput('', 'normal');
              addOutput('Extracted Contacts:', 'info');
              addOutput('  John Doe - +1-555-0101', 'normal');
              addOutput('  Jane Smith - +1-555-0102', 'normal');
              addOutput('  Bob Johnson - +1-555-0103', 'normal');
              addOutput('  Alice Williams - +1-555-0104', 'normal');
              addOutput('  Charlie Brown - +1-555-0105', 'normal');
              addOutput('  Total: 47 contacts extracted', 'success');
            } else {
              addOutput(`Found ${phoneData?.contacts?.length || 0} contacts`, 'success');
            }
            break;
          case 'photos':
            addOutput('Photo gallery accessed', 'success');
            if (isTutorialMode) {
              addOutput('', 'normal');
              addOutput('Downloading photos...', 'info');
              addOutput('  IMG_20240115_143022.jpg - 2.4 MB', 'normal');
              addOutput('  IMG_20240116_091534.jpg - 1.8 MB', 'normal');
              addOutput('  IMG_20240117_204511.jpg - 3.1 MB', 'normal');
              addOutput('  Screenshot_20240118.png - 0.5 MB', 'normal');
              addOutput('  Vacation_Photo_001.jpg - 4.2 MB', 'normal');
              addOutput('  Total: 156 photos downloaded', 'success');
            }
            addOutput('Downloading all photos...', 'success');
            break;
          case 'files':
            addOutput('File system access granted', 'success');
            if (isTutorialMode) {
              addOutput('', 'normal');
              addOutput('Accessing file system...', 'info');
              addOutput('  /sdcard/Documents/notes.txt - 12 KB', 'normal');
              addOutput('  /sdcard/Download/important.pdf - 245 KB', 'normal');
              addOutput('  /data/data/com.android.providers.contacts/databases/contacts.db - 1.2 MB', 'normal');
              addOutput('  /sdcard/Pictures/Screenshots/ - 45 files', 'normal');
              addOutput('  File system fully accessible', 'success');
            }
            addOutput('Full read/write access to /sdcard/', 'success');
            break;
          case 'wallet':
            addOutput('Wallet database extracted', 'success');
            if (isTutorialMode) {
              addOutput('', 'normal');
              addOutput('Accessing wallet application...', 'info');
              addOutput('Wallet Accounts Found:', 'info');
              addOutput('  Account 1: $1,234.56', 'normal');
              addOutput('  Account 2: $5,678.90', 'normal');
              addOutput('  Savings: $12,345.67', 'normal');
              addOutput('  Total Available: $19,259.13', 'success');
              addOutput('', 'normal');
              addOutput('Use "exploit transfer <amount>" to transfer funds', 'info');
              addOutput('Use "exploit purchases" to view purchase history', 'info');
            }
            break;
          case 'purchases':
            addOutput('Purchase history extracted', 'success');
            if (isTutorialMode) {
              addOutput('', 'normal');
              addOutput('Purchase History:', 'info');
              addOutput('', 'normal');
              addOutput('Recent Purchases:', 'info');
              addOutput('  2024-01-18 14:32 | Amazon | $89.99 | Electronics', 'normal');
              addOutput('  2024-01-17 09:15 | Starbucks | $5.45 | Coffee', 'normal');
              addOutput('  2024-01-16 20:11 | Netflix | $15.99 | Subscription', 'normal');
              addOutput('  2024-01-15 12:30 | Uber | $23.50 | Transportation', 'normal');
              addOutput('  2024-01-14 18:45 | Target | $156.78 | Groceries', 'normal');
              addOutput('  2024-01-13 10:22 | Apple Store | $1,299.00 | iPhone 15 Pro', 'normal');
              addOutput('  2024-01-12 16:33 | Best Buy | $349.99 | Headphones', 'normal');
              addOutput('  2024-01-11 08:55 | McDonald\'s | $12.34 | Food', 'normal');
              addOutput('  2024-01-10 19:20 | Spotify | $9.99 | Subscription', 'normal');
              addOutput('  2024-01-09 14:15 | Shell Gas | $45.67 | Fuel', 'normal');
              addOutput('', 'normal');
              addOutput('Total Purchases (Last 30 days): $2,009.66', 'success');
              addOutput('Total Transactions: 47', 'info');
            }
            break;
          case 'transfer':
            if (args.length < 2) {
              addOutput('Usage: exploit transfer <amount>', 'error');
              addOutput('Example: exploit transfer 1000', 'info');
              return;
            }
            const amount = parseFloat(args[1]);
            if (isNaN(amount) || amount <= 0) {
              addOutput('Error: Invalid amount. Must be a positive number', 'error');
              return;
            }
            addOutput(`Transferring $${amount.toFixed(2)}...`, 'warning');
            setTimeout(() => {
              addOutput('Transfer successful!', 'success');
              addOutput(`$${amount.toFixed(2)} transferred to your account`, 'success');
              if (isTutorialMode) {
                addOutput('', 'normal');
                addOutput('Transaction Details:', 'info');
                addOutput(`  Amount: $${amount.toFixed(2)}`, 'normal');
                addOutput('  Status: Completed', 'normal');
                addOutput('  Method: Wallet Exploit', 'normal');
                addOutput('  Funds added to your balance', 'success');
              }
              if (dispatch) {
                dispatch({ type: 'UPDATE_MONEY', payload: amount });
              }
            }, 2000);
            break;
        }
      } else {
        addOutput(`✗ Exploit failed`, 'error');
        addOutput('Device security prevented the attack', 'error');
        if (osVersion >= 32) {
          addOutput('High security OS detected suspicious activity', 'warning');
        }
      }
    }, 2000);
  };

  const handleHackDevice = (args) => {
    if (args.length === 0) {
      addOutput('Usage: hack-device <ip_address>', 'error');
      return;
    }

    const ip = args[0];
    addOutput(`Attempting to hack device at ${ip}...`, 'warning');
    addOutput('Scanning for vulnerabilities...', 'info');

    setTimeout(() => {
      addOutput('Vulnerabilities found:', 'info');
      addOutput('  - Open port 5555 (ADB)', 'normal');
      addOutput('  - Weak authentication', 'normal');
      addOutput('  - Outdated system libraries', 'normal');
      addOutput('  - Unpatched CVE-2023-XXXX', 'normal');
      addOutput('', 'normal');
      addOutput('Exploiting vulnerabilities...', 'warning');
      
      setTimeout(() => {
        // In tutorial mode, always succeed
        const success = isTutorialMode ? true : Math.random() > 0.4;
        if (success) {
          addOutput('Device compromised!', 'success');
          addOutput('Gained root access', 'success');
          addOutput('Installing backdoor...', 'info');
          if (isTargetTerminal && onCommand) {
            onCommand('exploit shell');
          }
        } else {
          addOutput('Hack failed. Device has strong defenses', 'error');
        }
      }, 2000);
    }, 1500);
  };

  const handleCrackPin = () => {
    addOutput('Attempting PIN brute force attack...', 'warning');
    addOutput('This may take a while...', 'info');
    
    let attempts = 0;
    const maxAttempts = isTutorialMode ? 2500 : 10000; // Faster in tutorial mode
    const interval = setInterval(() => {
      attempts += 100;
      if (attempts % 1000 === 0) {
        addOutput(`Tried ${attempts} combinations...`, 'normal');
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        // In tutorial mode, always succeed
        const success = isTutorialMode ? true : Math.random() > 0.7;
        if (success) {
          const crackedPin = isTutorialMode ? '2580' : Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          addOutput(`PIN cracked! Found: ${crackedPin}`, 'success');
          addOutput('Device unlocked successfully', 'success');
        } else {
          addOutput('PIN crack failed. Device locked after too many attempts', 'error');
        }
      }
    }, 100);
  };

  // Android filesystem structure
  const androidFilesystem = {
    '/': {
      type: 'directory',
      contents: ['system', 'data', 'sdcard', 'storage', 'vendor', 'proc', 'sys', 'dev', 'acct', 'cache', 'config', 'mnt', 'root']
    },
    '/sdcard': {
      type: 'directory',
      contents: ['Download', 'Pictures', 'Documents', 'Music', 'Movies', 'DCIM', 'Android']
    },
    '/sdcard/Download': {
      type: 'directory',
      contents: ['file1.apk', 'document.pdf', 'image.jpg']
    },
    '/sdcard/Pictures': {
      type: 'directory',
      contents: ['Screenshots', 'Camera', 'IMG_001.jpg', 'IMG_002.jpg']
    },
    '/sdcard/Documents': {
      type: 'directory',
      contents: ['notes.txt', 'backup.db']
    },
    '/data': {
      type: 'directory',
      contents: ['data', 'app', 'system', 'local', 'misc', 'anr', 'backup', 'dalvik-cache']
    },
    '/data/data': {
      type: 'directory',
      contents: ['com.android.chrome', 'com.whatsapp', 'com.facebook.katana', 'com.instagram.android', 'com.android.mms']
    },
    '/data/data/com.android.chrome': {
      type: 'directory',
      contents: ['cache', 'databases', 'files', 'shared_prefs']
    },
    '/data/data/com.whatsapp': {
      type: 'directory',
      contents: ['databases', 'files', 'shared_prefs', 'cache']
    },
    '/system': {
      type: 'directory',
      contents: ['bin', 'etc', 'lib', 'framework', 'app', 'priv-app', 'xbin']
    },
    '/system/app': {
      type: 'directory',
      contents: ['Calculator', 'Calendar', 'Camera', 'Contacts', 'Email']
    }
  };

  const getShellPrompt = () => {
    if (shellCwd === '/') {
      return 'shell@android:/ $';
    }
    const displayPath = shellCwd.length > 30 ? '...' + shellCwd.slice(-27) : shellCwd;
    return `shell@android:${displayPath} $`;
  };

  const executeShellCommand = (cmd) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) {
      addOutput('', 'normal');
      return;
    }

    // Add to shell history
    setShellHistory(prev => [...prev, trimmedCmd]);

    // Show command in output
    addOutput(`${getShellPrompt()} ${trimmedCmd}`, 'normal');

    // Parse command
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'exit':
        setIsInShell(false);
        setShellCwd('/');
        setHistoryIndex(-1);
        addOutput('Exiting shell...', 'info');
        addOutput('', 'normal');
        break;
      case 'pwd':
        addOutput(shellCwd, 'normal');
        break;
      case 'cd':
        handleShellCd(args);
        break;
      case 'ls':
      case 'dir':
        handleShellLs(args);
        break;
      case 'cat':
        handleShellCat(args);
        break;
      case 'whoami':
        addOutput('shell', 'normal');
        break;
      case 'id':
        addOutput('uid=2000(shell) gid=2000(shell) groups=2000(shell),1004(input),1007(log),1011(adb),1015(sdcard_rw),1028(sdcard_r),3001(net_bt_admin),3002(net_bt),3003(inet),3006(net_bw_stats)', 'normal');
        break;
      case 'su':
        addOutput('su: uid 2000 not allowed to su', 'error');
        break;
      case 'mount':
        addOutput('rootfs on / type rootfs (ro,seclabel)', 'normal');
        addOutput('tmpfs on /dev type tmpfs (rw,seclabel,nosuid,relatime,mode=755)', 'normal');
        addOutput('/dev/block/sda1 on /sdcard type vfat (rw,dirsync,nosuid,nodev,noexec,relatime,uid=1023,gid=1023,fmask=0007,dmask=0007,allow_utime=0020)', 'normal');
        break;
      case 'df':
        addOutput('Filesystem           1K-blocks      Used Available Use% Mounted on', 'normal');
        addOutput('/dev/block/sda1      15728640   5242880  10485760  34% /sdcard', 'normal');
        addOutput('/dev/block/sda2       2097152   1048576   1048576  50% /data', 'normal');
        break;
      case 'ps':
        addOutput('USER     PID   PPID  VSIZE  RSS     WCHAN    PC         NAME', 'normal');
        addOutput('root      1     0     1234   456     c00a1234  S  /init', 'normal');
        addOutput('system    123   1     5678   1234    c00a5678  S  system_server', 'normal');
        addOutput('shell     456   123   2345   567     c00a2345  S  /system/bin/sh', 'normal');
        break;
      case 'pm':
        if (args[0] === 'list' && args[1] === 'packages') {
          addOutput('package:com.android.chrome', 'normal');
          addOutput('package:com.whatsapp', 'normal');
          addOutput('package:com.facebook.katana', 'normal');
          addOutput('package:com.instagram.android', 'normal');
        } else {
          addOutput('Usage: pm [command]', 'error');
          addOutput('Commands: list packages', 'info');
        }
        break;
      case 'dumpsys':
        if (args[0] === 'package') {
          addOutput('Packages:', 'info');
          addOutput('  Package [com.android.chrome] (12345678):', 'normal');
          addOutput('    userId=10123', 'normal');
          addOutput('    versionCode=123', 'normal');
        } else {
          addOutput('Usage: dumpsys [service]', 'error');
        }
        break;
      case 'getprop':
        if (args.length === 0) {
          addOutput('ro.build.version.release=9', 'normal');
          addOutput('ro.build.version.sdk=28', 'normal');
          addOutput('ro.product.model=Android Device', 'normal');
        } else {
          const prop = args[0];
          if (prop === 'ro.build.version.sdk') {
            addOutput(String(osVersion), 'normal');
          } else if (prop === 'ro.build.version.release') {
            const versionMap = { 28: '9', 29: '10', 30: '11', 31: '12', 32: '12', 33: '13', 34: '14' };
            addOutput(versionMap[osVersion] || '9', 'normal');
          } else {
            addOutput('', 'normal');
          }
        }
        break;
      case 'help':
        addOutput('Available shell commands:', 'info');
        addOutput('  ls, dir        - List directory contents', 'normal');
        addOutput('  cd <dir>       - Change directory', 'normal');
        addOutput('  pwd            - Print working directory', 'normal');
        addOutput('  cat <file>     - Display file contents', 'normal');
        addOutput('  whoami         - Show current user', 'normal');
        addOutput('  id             - Show user ID and groups', 'normal');
        addOutput('  mount          - Show mounted filesystems', 'normal');
        addOutput('  df             - Show disk space', 'normal');
        addOutput('  ps             - Show running processes', 'normal');
        addOutput('  pm list packages - List installed packages', 'normal');
        addOutput('  dumpsys        - Dump system information', 'normal');
        addOutput('  getprop        - Get system properties', 'normal');
        addOutput('  exit           - Exit shell', 'normal');
        break;
      default:
        addOutput(`sh: ${command}: not found`, 'error');
    }

    addOutput('', 'normal');
  };

  const handleShellCd = (args) => {
    if (args.length === 0) {
      setShellCwd('/');
      return;
    }

    const targetPath = args[0];
    let newPath = shellCwd;

    if (targetPath.startsWith('/')) {
      newPath = targetPath;
    } else if (targetPath === '..') {
      const parts = shellCwd.split('/').filter(p => p);
      parts.pop();
      newPath = parts.length > 0 ? '/' + parts.join('/') : '/';
    } else {
      newPath = shellCwd === '/' ? '/' + targetPath : shellCwd + '/' + targetPath;
    }

    // Normalize path
    newPath = newPath.replace(/\/+/g, '/');
    if (newPath !== '/' && newPath.endsWith('/')) {
      newPath = newPath.slice(0, -1);
    }

    // Check if path exists in filesystem
    if (androidFilesystem[newPath] || newPath === '/') {
      setShellCwd(newPath);
    } else {
      addOutput(`cd: ${targetPath}: No such file or directory`, 'error');
    }
  };

  const handleShellLs = (args) => {
    const path = args.length > 0 && !args[0].startsWith('-') ? args[0] : shellCwd;
    let targetPath = path;

    if (!targetPath.startsWith('/')) {
      targetPath = shellCwd === '/' ? '/' + targetPath : shellCwd + '/' + targetPath;
    }

    targetPath = targetPath.replace(/\/+/g, '/');
    if (targetPath !== '/' && targetPath.endsWith('/')) {
      targetPath = targetPath.slice(0, -1);
    }

    const dir = androidFilesystem[targetPath];
    if (!dir && targetPath !== '/') {
      addOutput(`ls: ${args[0] || shellCwd}: No such file or directory`, 'error');
      return;
    }

    const contents = targetPath === '/' ? androidFilesystem['/'].contents : (dir?.contents || []);
    
    if (args.includes('-l') || args.includes('-la')) {
      contents.forEach(item => {
        const isDir = androidFilesystem[targetPath + '/' + item]?.type === 'directory' || 
                     (targetPath === '/' && androidFilesystem['/' + item]);
        const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = isDir ? '4096' : Math.floor(Math.random() * 1000000).toString();
        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        addOutput(`${perms} shell shell ${size.padStart(8)} ${date} ${item}`, 'normal');
      });
    } else {
      contents.forEach(item => {
        const isDir = androidFilesystem[targetPath + '/' + item]?.type === 'directory' || 
                     (targetPath === '/' && androidFilesystem['/' + item]);
        addOutput(isDir ? `${item}/` : item, 'normal');
      });
    }
  };

  const handleShellCat = (args) => {
    if (args.length === 0) {
      addOutput('Usage: cat <file>', 'error');
      return;
    }

    const filePath = args[0].startsWith('/') ? args[0] : 
                    (shellCwd === '/' ? '/' + args[0] : shellCwd + '/' + args[0]);
    
    // Simulate file contents based on path
    if (filePath.includes('contacts')) {
      if (phoneData?.contacts && phoneData.contacts.length > 0) {
        phoneData.contacts.forEach(contact => {
          addOutput(`${contact.name}: ${contact.number}`, 'normal');
        });
      } else {
        addOutput('No contacts found', 'normal');
      }
    } else if (filePath.includes('.db') || filePath.includes('database')) {
      addOutput('SQLite database file (binary)', 'normal');
      addOutput('Use sqlite3 to read database contents', 'info');
    } else if (filePath.includes('.apk')) {
      addOutput('Android Package (APK) file - binary format', 'normal');
    } else {
      addOutput(`Contents of ${args[0]}:`, 'info');
      addOutput('  [File contents would appear here]', 'normal');
      addOutput('  Use "cat" with specific file paths to view contents', 'info');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
      setCurrentCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const history = isInShell ? shellHistory : commandHistory;
      if (history.length > 0) {
        const newIndex = historyIndex === -1 
          ? history.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const history = isInShell ? shellHistory : commandHistory;
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(history[newIndex]);
        }
      }
    }
  };

  return (
    <>
      <TerminalContainer
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TerminalHeader>
          <TerminalTitle>
            <FaTerminal />
            <FaAndroid />
            Android Dev Terminal
          </TerminalTitle>
          {phoneConnected && (
            <div style={{ 
              marginLeft: 'auto', 
              color: '#00ff41', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <BlinkingDot />
              Device Connected
            </div>
          )}
        </TerminalHeader>
        <TerminalBody 
          ref={terminalRef}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
        >
          {output.map((line, index) => (
            <TerminalLine key={index} type={line.type}>
              {line.text}
            </TerminalLine>
          ))}
        <TerminalPrompt>
          <PromptSymbol>{isInShell ? 'shell@android' : '$'}</PromptSymbol>
          <TerminalInput
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            autoFocus
            style={{ flex: 1 }}
          />
          {!currentCommand && <Cursor />}
        </TerminalPrompt>
        </TerminalBody>
      </TerminalContainer>

      <AnimatePresence>
        {showEducationModal && educationContent && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleDismissEducation(false)}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
              <ModalTitle>
                <FaExclamationTriangle />
                {educationContent.title}
              </ModalTitle>
              <CloseButton onClick={() => handleDismissEducation(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <WarningBadge>
              <FaInfoCircle style={{ fontSize: '20px', color: '#ffaa00', marginTop: '2px' }} />
              <WarningText>
                {educationContent.command.includes('exploit') || educationContent.command.includes('hack') || educationContent.command.includes('crack') 
                  ? 'This command is fictional and for game purposes only. Here\'s what you should know about the real thing:'
                  : 'This is a game shortcut command. Here\'s the real command you should know:'}
              </WarningText>
            </WarningBadge>

            <InfoSection>
              <SectionTitle>
                <FaInfoCircle />
                Real Alternative
              </SectionTitle>
              <SectionContent>
                {educationContent.explanation}
              </SectionContent>
            </InfoSection>

            <InfoSection>
              <SectionTitle>
                <FaInfoCircle />
                Real-World Information
              </SectionTitle>
              <SectionContent>
                {educationContent.realInfo.map((line, index) => (
                  <div key={index} style={{ marginBottom: line === '' ? '8px' : '4px' }}>
                    {line}
                  </div>
                ))}
              </SectionContent>
            </InfoSection>

            {educationContent.example && (
              <InfoSection>
                <SectionTitle>
                  <FaInfoCircle />
                  Example Real Command
                </SectionTitle>
                <RealCommandExample>
                  <RealCommandLabel>Real Command:</RealCommandLabel>
                  <CodeBlock>
                    {educationContent.example}
                  </CodeBlock>
                </RealCommandExample>
              </InfoSection>
            )}

            <DontShowAgainButton onClick={() => handleDismissEducation(true)}>
              Don't show this again for "{educationContent.command}"
            </DontShowAgainButton>
          </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default AndroidDevTerminal;


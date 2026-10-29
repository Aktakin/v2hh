import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import InternetConnectivity from './InternetConnectivity';
import { FaTerminal } from 'react-icons/fa';
import { 
  FaPowerOff,
  FaWifi,
  FaEthernet,
  FaCog,
  FaShieldAlt,
  FaUsers,
  FaSignal,
  FaLock,
  FaUnlock,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaRedo,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaNetworkWired,
  FaGlobe,
  FaServer,
  FaChartLine,
  FaCog as FaSettings,
  FaWifi as FaWifiIcon,
  FaEthernet as FaEthernetIcon
} from 'react-icons/fa';

const RouterWrapper = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 1400px;
`;

const RouterContainer = styled.div`
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid #00ff41;
  border-radius: 15px;
  padding: 25px;
  flex: 1;
  min-width: 600px;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 350px;
  flex-shrink: 0;
`;

const Card = styled.div`
  background: rgba(26, 26, 46, 0.9);
  border: 2px solid #00ff41;
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.3);
`;

const TerminalCard = styled(Card)``;

const TerminalContent = styled.div`
  height: 400px;
  overflow-y: auto;
  margin-bottom: 15px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.85rem;
`;

const TerminalLine = styled.div`
  margin-bottom: 5px;
  color: ${props => props.type === 'command' ? '#00ff41' : 
                   props.type === 'output' ? '#00ffff' : 
                   props.type === 'error' ? '#ff0040' : '#888'};
`;

const TerminalInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Prompt = styled.span`
  color: #00ff41;
  font-weight: bold;
`;

const TerminalInputField = styled.input`
  background: transparent;
  border: 1px solid #333;
  border-radius: 3px;
  padding: 5px 10px;
  color: #00ff41;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.85rem;
  outline: none;
  flex: 1;
  
  &:focus {
    border-color: #00ff41;
  }
`;

const RouterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const RouterTitle = styled.h3`
  color: #00ff41;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RouterStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: ${props => props.active ? '#00ff41' : '#888'};
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? '#00ff41' : '#ff0040'};
  animation: ${props => props.active ? 'pulse 2s infinite' : 'none'};
`;

const RouterDashboard = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const DashboardCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border-radius: 10px;
  padding: 20px;
`;

const CardTitle = styled.h4`
  color: #00ff41;
  font-size: 1.1rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardContent = styled.div`
  color: #888;
  font-size: 0.9rem;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #222;
`;

const StatLabel = styled.span`
  color: #888;
`;

const StatValue = styled.span`
  color: #00ff41;
  font-weight: bold;
`;

const ConnectedDevices = styled.div`
  margin-top: 15px;
`;

const DeviceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid #00ff41;
  border-radius: 5px;
  margin-bottom: 8px;
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DeviceIcon = styled.div`
  font-size: 1.2rem;
  color: #00ff41;
`;

const DeviceName = styled.span`
  color: #00ff41;
  font-weight: bold;
`;

const DeviceIP = styled.span`
  color: #888;
  font-size: 0.8rem;
`;

const DeviceStatus = styled.div`
  color: #00ff41;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ConfigurationPanel = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;

const ConfigForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #00ff41;
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: bold;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ff41;
  border-radius: 5px;
  padding: 12px;
  color: #00ff41;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ff41;
  border-radius: 5px;
  padding: 12px;
  color: #00ff41;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
`;

const Button = styled.button`
  background: ${props => props.primary ? 'linear-gradient(45deg, #00ff41, #00cc33)' : 'transparent'};
  color: ${props => props.primary ? '#000' : '#00ff41'};
  border: 2px solid #00ff41;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.primary ? 'linear-gradient(45deg, #00cc33, #00ff41)' : '#00ff41'};
    color: ${props => props.primary ? '#000' : '#000'};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecuritySettings = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const SecurityCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
`;

const SecurityIcon = styled.div`
  font-size: 2rem;
  color: ${props => props.enabled ? '#00ff41' : '#ff0040'};
  margin-bottom: 10px;
`;

const SecurityName = styled.h5`
  color: #00ff41;
  font-size: 1rem;
  margin-bottom: 5px;
`;

const SecurityStatus = styled.div`
  color: ${props => props.enabled ? '#00ff41' : '#ff0040'};
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
`;

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const RouterInterface = ({ device }) => {
  const { gameState, dispatch } = useGame();
  const [config, setConfig] = useState({
    ssid: gameState.devices.router.ssid || 'HackHilis-Net',
    password: gameState.devices.router.password || '',
    encryption: 'WPA3',
    channel: 'Auto',
    bandwidth: '1Gbps',
    firewall: true,
    vpn: false,
    guestNetwork: false
  });
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'output', text: 'RouterOS v7.12 (RouterBOARD)' },
    { type: 'output', text: 'Copyright (c) 1999-2024 by MikroTik' },
    { type: 'output', text: 'Software id: XXXX-XXXX-XXXX' },
    { type: 'output', text: '' },
    { type: 'output', text: 'Login: admin' },
    { type: 'output', text: 'Password: ' },
    { type: 'output', text: 'Last login: Mon Jan 15 10:30:45 UTC 2024' },
    { type: 'command', text: '[admin@Router] > ' }
  ]);
  const [terminalCommand, setTerminalCommand] = useState('');

  const routerDevice = gameState.devices.router;
  const isPowered = routerDevice.powered;
  const isConnected = routerDevice.connected;
  const connectedDevices = routerDevice.connectedDevices || [];

  const handlePowerToggle = () => {
    dispatch({
      type: 'POWER_DEVICE',
      payload: {
        device: 'router',
        powered: !isPowered
      }
    });
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveConfiguration = () => {
    if (!config.ssid || !config.password) {
      alert('Please fill in both SSID and password!');
      return;
    }

    dispatch({
      type: 'CONFIGURE_ROUTER',
      payload: {
        ssid: config.ssid,
        password: config.password
      }
    });

    alert('Router configuration saved successfully!');
  };

  const toggleSecurity = (setting) => {
    setConfig(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleTerminalCommand = (command) => {
    if (!command.trim()) return;
    setTerminalHistory(prev => [...prev, { type: 'command', text: `[admin@Router] > ${command}` }]);
    
    setTimeout(() => {
      let output = '';
      const cmd = command.toLowerCase().trim();
      const parts = command.split(' ');
      
      switch (cmd) {
        case 'help':
          output = 'Available commands:\n  /system - System commands\n  /interface - Interface management\n  /ip - IP configuration\n  /wireless - Wireless settings\n  /routing - Routing configuration\n  /tool - Router tools\n  /ping - Ping network\n  /traceroute - Trace route\n  /reboot - Reboot router\n  /shutdown - Shutdown router\n  /export - Export configuration\n  /clear - Clear terminal';
          break;
        case 'clear':
          setTerminalHistory([
            { type: 'output', text: 'RouterOS v7.12 (RouterBOARD)' },
            { type: 'output', text: 'Copyright (c) 1999-2024 by MikroTik' },
            { type: 'command', text: '[admin@Router] > ' }
          ]);
          return;
        case '/system identity print':
          output = 'name: "Router"\nmodel: "RB4011iGS+5HacQ2HnD"\nserial-number: "XXXXXXXXXXXX"';
          break;
        case '/interface print':
          output = 'Flags: D - dynamic, X - disabled, R - running, S - slave\n#    NAME                TYPE       ACTUAL-MTU  L2MTU  MAC-ADDRESS\n0  R  ether1              ether      1500        1598   00:11:22:33:44:55\n1  R  wlan1               wlan       1500        1598   00:11:22:33:44:56';
          break;
        case '/ip address print':
          output = 'Flags: X - disabled, I - invalid, D - dynamic\n#   ADDRESS            NETWORK         INTERFACE\n0   192.168.1.1/24    192.168.1.0     ether1';
          break;
        case '/wireless print':
          output = 'Flags: X - disabled, R - running\n0  R name="wlan1" mtu=1500 l2mtu=1598 mac-address=00:11:22:33:44:56\n    radio-name="HackHilis-Net" disabled=no';
          break;
        case '/ping 8.8.8.8':
        case 'ping 8.8.8.8':
          output = 'PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=12.3 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=11.8 ms';
          break;
        case '/reboot':
        case 'reboot':
          output = 'System will reboot in 5 seconds...';
          setTimeout(() => {
            handlePowerToggle();
          }, 2000);
          break;
        case '/shutdown':
        case 'shutdown':
          output = 'System will shutdown in 5 seconds...';
          setTimeout(() => {
            handlePowerToggle();
          }, 2000);
          break;
        case '/export':
        case 'export':
          output = '# RouterOS Configuration\n# by admin\n/interface ethernet\nset [ find default-name=ether1 ] name=ether1\n/ip address\nadd address=192.168.1.1/24 interface=ether1 network=192.168.1.0';
          break;
        default:
          if (cmd.startsWith('/system')) {
            output = 'System command executed.';
          } else if (cmd.startsWith('/interface')) {
            output = 'Interface command executed.';
          } else if (cmd.startsWith('/ip')) {
            output = 'IP configuration command executed.';
          } else if (cmd.startsWith('/wireless')) {
            output = 'Wireless command executed.';
          } else {
            output = `Unknown command: ${command}. Type "help" for available commands.`;
          }
      }
      
      setTerminalHistory(prev => [...prev, { type: 'output', text: output }]);
    }, 500);
    
    setTerminalCommand('');
  };

  // Simulate connected devices
  useEffect(() => {
    if (isPowered && isConnected) {
      const devices = [
        { name: 'Hacker Laptop', ip: gameState.ipAddress, type: 'laptop', icon: FaEthernetIcon },
        { name: 'iPhone Pro', ip: '192.168.1.100', type: 'phone', icon: FaWifiIcon }
      ];
      
      dispatch({
        type: 'CONFIGURE_ROUTER',
        payload: {
          connectedDevices: devices
        }
      });
    }
  }, [isPowered, isConnected, gameState.ipAddress, dispatch]);

  if (!isPowered) {
    return (
      <RouterContainer>
        <RouterHeader>
          <RouterTitle>
            <FaWifi />
            Enterprise Router
          </RouterTitle>
          <RouterStatus>
            <StatusItem active={false}>
              <StatusDot active={false} />
              Offline
            </StatusItem>
            <button
              onClick={handlePowerToggle}
              style={{
                background: 'linear-gradient(45deg, #00ff41, #00cc33)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                color: '#000',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Power On
            </button>
          </RouterStatus>
        </RouterHeader>
        
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <FaPowerOff style={{ fontSize: '3rem', marginBottom: '20px' }} />
          <h4>Router is powered off</h4>
          <p>Click the power button to start the router</p>
        </div>
      </RouterContainer>
    );
  }

  return (
    <RouterWrapper>
      <RouterContainer>
        <RouterHeader>
          <RouterTitle>
            <FaWifi />
            Enterprise Router
          </RouterTitle>
          <RouterStatus>
            <StatusItem active={isConnected}>
              <StatusDot active={isConnected} />
              {isConnected ? 'Connected' : 'Offline'}
            </StatusItem>
            <button
              onClick={handlePowerToggle}
              style={{
                background: 'transparent',
                border: '2px solid #ff0040',
                borderRadius: '5px',
                padding: '8px 15px',
                color: '#ff0040',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              <FaPowerOff />
            </button>
          </RouterStatus>
        </RouterHeader>

      <RouterDashboard>
        <DashboardCard>
          <CardTitle>
            <FaSignal />
            Network Status
          </CardTitle>
          <CardContent>
            <StatRow>
              <StatLabel>SSID</StatLabel>
              <StatValue>{config.ssid || 'Not Set'}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Encryption</StatLabel>
              <StatValue>{config.encryption}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Channel</StatLabel>
              <StatValue>{config.channel}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Bandwidth</StatLabel>
              <StatValue>{config.bandwidth}</StatValue>
            </StatRow>
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardTitle>
            <FaUsers />
            Connected Devices
          </CardTitle>
          <CardContent>
            <div style={{ marginBottom: '10px' }}>
              <StatRow>
                <StatLabel>Total Devices</StatLabel>
                <StatValue>{connectedDevices.length}</StatValue>
              </StatRow>
            </div>
            <ConnectedDevices>
              {connectedDevices.map((device, index) => (
                <DeviceItem key={index}>
                  <DeviceInfo>
                    <DeviceIcon as={device.icon} />
                    <div>
                      <DeviceName>{device.name}</DeviceName>
                      <br />
                      <DeviceIP>{device.ip}</DeviceIP>
                    </div>
                  </DeviceInfo>
                  <DeviceStatus>
                    <FaCheckCircle />
                    Online
                  </DeviceStatus>
                </DeviceItem>
              ))}
            </ConnectedDevices>
          </CardContent>
        </DashboardCard>
      </RouterDashboard>

      <ConfigurationPanel>
        <CardTitle>
          <FaCog />
          Router Configuration
        </CardTitle>
        
        <ConfigForm>
          <FormGroup>
            <Label>Network Name (SSID)</Label>
            <Input
              type="text"
              value={config.ssid}
              onChange={(e) => handleConfigChange('ssid', e.target.value)}
              placeholder="Enter network name"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Password</Label>
            <Input
              type="password"
              value={config.password}
              onChange={(e) => handleConfigChange('password', e.target.value)}
              placeholder="Enter password"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Encryption</Label>
            <Select
              value={config.encryption}
              onChange={(e) => handleConfigChange('encryption', e.target.value)}
            >
              <option value="WPA3">WPA3 (Recommended)</option>
              <option value="WPA2">WPA2</option>
              <option value="WEP">WEP (Insecure)</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Channel</Label>
            <Select
              value={config.channel}
              onChange={(e) => handleConfigChange('channel', e.target.value)}
            >
              <option value="Auto">Auto</option>
              <option value="1">Channel 1</option>
              <option value="6">Channel 6</option>
              <option value="11">Channel 11</option>
            </Select>
          </FormGroup>
        </ConfigForm>

        <SecuritySettings>
          <SecurityCard>
            <SecurityIcon enabled={config.firewall}>
              <FaShieldAlt />
            </SecurityIcon>
            <SecurityName>Firewall</SecurityName>
            <SecurityStatus enabled={config.firewall}>
              {config.firewall ? <FaCheckCircle /> : <FaTimesCircle />}
              {config.firewall ? 'Enabled' : 'Disabled'}
            </SecurityStatus>
            <Button 
              onClick={() => toggleSecurity('firewall')}
              style={{ marginTop: '10px', width: '100%' }}
            >
              {config.firewall ? 'Disable' : 'Enable'}
            </Button>
          </SecurityCard>

          <SecurityCard>
            <SecurityIcon enabled={config.vpn}>
              <FaNetworkWired />
            </SecurityIcon>
            <SecurityName>VPN</SecurityName>
            <SecurityStatus enabled={config.vpn}>
              {config.vpn ? <FaCheckCircle /> : <FaTimesCircle />}
              {config.vpn ? 'Enabled' : 'Disabled'}
            </SecurityStatus>
            <Button 
              onClick={() => toggleSecurity('vpn')}
              style={{ marginTop: '10px', width: '100%' }}
            >
              {config.vpn ? 'Disable' : 'Enable'}
            </Button>
          </SecurityCard>

          <SecurityCard>
            <SecurityIcon enabled={config.guestNetwork}>
              <FaUsers />
            </SecurityIcon>
            <SecurityName>Guest Network</SecurityName>
            <SecurityStatus enabled={config.guestNetwork}>
              {config.guestNetwork ? <FaCheckCircle /> : <FaTimesCircle />}
              {config.guestNetwork ? 'Enabled' : 'Disabled'}
            </SecurityStatus>
            <Button 
              onClick={() => toggleSecurity('guestNetwork')}
              style={{ marginTop: '10px', width: '100%' }}
            >
              {config.guestNetwork ? 'Disable' : 'Enable'}
            </Button>
          </SecurityCard>
        </SecuritySettings>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Button primary onClick={saveConfiguration}>
            <FaSave />
            Save Configuration
          </Button>
          <Button onClick={() => window.location.reload()}>
            <FaRedo />
            Reset
          </Button>
        </div>
      </ConfigurationPanel>

      </RouterContainer>

      <RightPanel>
        <TerminalCard>
          <CardHeader>
            <CardTitle>
              <FaTerminal />
              Router Terminal
            </CardTitle>
          </CardHeader>
          <TerminalContent>
            {terminalHistory.map((line, index) => (
              <TerminalLine key={index} type={line.type}>
                {line.text}
              </TerminalLine>
            ))}
          </TerminalContent>
          <TerminalInput>
            <Prompt>[admin@Router] &gt;</Prompt>
            <TerminalInputField
              type="text"
              value={terminalCommand}
              onChange={(e) => setTerminalCommand(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTerminalCommand(terminalCommand);
                }
              }}
              placeholder="Enter command..."
              disabled={!isPowered}
            />
          </TerminalInput>
        </TerminalCard>

        <Card>
          <CardHeader>
            <CardTitle>
              <FaWifi />
              Internet Connectivity
            </CardTitle>
          </CardHeader>
          <InternetConnectivity device="router" />
        </Card>
      </RightPanel>
    </RouterWrapper>
  );
};

export default RouterInterface;

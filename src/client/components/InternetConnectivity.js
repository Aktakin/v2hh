import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { 
  FaWifi, 
  FaEthernet, 
  FaDollarSign, 
  FaShieldAlt, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaCog,
  FaSignal,
  FaLock,
  FaUnlock
} from 'react-icons/fa';

const InternetContainer = styled.div`
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid #00ff41;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
`;

const InternetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const InternetTitle = styled.h3`
  color: #00ff41;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: ${props => props.connected ? '#00ff41' : '#ff0040'};
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#00ff41' : '#ff0040'};
  animation: ${props => props.connected ? 'pulse 2s infinite' : 'none'};
`;

const ConnectionOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const ConnectionCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid ${props => props.selected ? '#00ff41' : '#333'};
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: #00ffff;
    background: rgba(0, 255, 255, 0.05);
  }
`;

const ConnectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const ConnectionIcon = styled.div`
  font-size: 1.5rem;
  color: ${props => props.color || '#00ff41'};
`;

const ConnectionName = styled.h4`
  color: #00ff41;
  font-size: 1.1rem;
  margin-bottom: 5px;
`;

const ConnectionDescription = styled.p`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 10px;
`;

const ConnectionDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ConnectionCost = styled.div`
  color: ${props => props.free ? '#00ff41' : '#ffaa00'};
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ConnectionSecurity = styled.div`
  color: ${props => props.secure ? '#00ff41' : '#ff0040'};
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ConnectButton = styled.button`
  background: ${props => props.connected ? 'linear-gradient(45deg, #ff0040, #cc0033)' : 'linear-gradient(45deg, #00ff41, #00cc33)'};
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    background: ${props => props.connected ? 'linear-gradient(45deg, #cc0033, #ff0040)' : 'linear-gradient(45deg, #00cc33, #00ff41)'};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RouterConfig = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
`;

const ConfigTitle = styled.h4`
  color: #00ff41;
  font-size: 1.1rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConfigForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #00ff41;
  font-size: 0.9rem;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ff41;
  border-radius: 5px;
  padding: 10px;
  color: #00ff41;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(45deg, #00ff41, #00cc33);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(45deg, #00cc33, #00ff41);
    transform: translateY(-2px);
  }
`;

const InternetConnectivity = ({ device }) => {
  const { gameState, dispatch } = useGame();
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [routerConfig, setRouterConfig] = useState({
    ssid: gameState.devices.router.ssid || 'HackHilis-Net',
    password: gameState.devices.router.password || ''
  });

  const connectionOptions = [
    {
      id: 'router',
      name: 'Personal Router',
      icon: FaEthernet,
      color: '#00ff41',
      description: 'Connect to your own router for maximum security',
      cost: 0,
      secure: true,
      available: gameState.equipment.router && gameState.devices.router.powered,
      requirements: 'Router must be powered on and configured'
    },
    {
      id: 'wifi',
      name: 'Free Public WiFi',
      icon: FaWifi,
      color: '#ffaa00',
      description: 'Connect to public WiFi - convenient but vulnerable',
      cost: 0,
      secure: false,
      available: true,
      requirements: 'No requirements - but you\'ll be vulnerable to attacks'
    },
    {
      id: 'provider',
      name: 'Internet Provider',
      icon: FaSignal,
      color: '#00ffff',
      description: 'Pay for secure internet connection',
      cost: 100,
      secure: true,
      available: gameState.money >= 100 || (gameState.phone.owned && gameState.phone.money >= 100),
      requirements: '$100 per month'
    }
  ];

  const handleConnection = (option) => {
    if (!option.available) return;

    if (gameState.internet.connected && gameState.internet.type === option.id) {
      // Disconnect
      dispatch({
        type: 'DISCONNECT_INTERNET',
        payload: { device }
      });
    } else {
      // Connect
      if (option.cost > 0) {
        const availableMoney = gameState.phone.owned ? gameState.phone.money : gameState.money;
        if (availableMoney < option.cost) {
          alert('Insufficient funds!');
          return;
        }
        
        // Deduct cost
        dispatch({
          type: 'UPDATE_MONEY',
          payload: -option.cost
        });
      }

      dispatch({
        type: 'CONNECT_INTERNET',
        payload: {
          device,
          type: option.id,
          provider: option.id === 'provider' ? 'CyberNet ISP' : null,
          cost: option.cost
        }
      });
    }
  };

  const handleRouterConfig = () => {
    if (!routerConfig.ssid || !routerConfig.password) {
      alert('Please fill in both SSID and password!');
      return;
    }

    dispatch({
      type: 'CONFIGURE_ROUTER',
      payload: {
        ssid: routerConfig.ssid,
        password: routerConfig.password
      }
    });

    alert('Router configured successfully!');
  };

  const currentConnection = gameState.internet.connected ? 
    connectionOptions.find(opt => opt.id === gameState.internet.type) : null;

  return (
    <InternetContainer>
      <InternetHeader>
        <InternetTitle>
          <FaWifi />
          Internet Connectivity
        </InternetTitle>
        <ConnectionStatus connected={gameState.internet.connected}>
          <StatusDot connected={gameState.internet.connected} />
          {gameState.internet.connected ? 'Connected' : 'Disconnected'}
        </ConnectionStatus>
      </InternetHeader>

      {gameState.internet.connected && currentConnection && (
        <div style={{ 
          background: 'rgba(0, 255, 65, 0.1)', 
          border: '1px solid #00ff41', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '20px' 
        }}>
          <div style={{ color: '#00ff41', fontWeight: 'bold', marginBottom: '5px' }}>
            Currently Connected: {currentConnection.name}
          </div>
          <div style={{ color: '#888', fontSize: '0.9rem' }}>
            {currentConnection.secure ? 'Secure Connection' : 'Vulnerable Connection'} • 
            {currentConnection.cost === 0 ? ' Free' : ` $${currentConnection.cost}/month`}
          </div>
        </div>
      )}

      <ConnectionOptions>
        {connectionOptions.map((option) => (
          <ConnectionCard
            key={option.id}
            selected={gameState.internet.connected && gameState.internet.type === option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ConnectionHeader>
              <ConnectionIcon as={option.icon} color={option.color} />
              <ConnectionSecurity secure={option.secure}>
                {option.secure ? <FaLock /> : <FaUnlock />}
                {option.secure ? 'Secure' : 'Vulnerable'}
              </ConnectionSecurity>
            </ConnectionHeader>
            
            <ConnectionName>{option.name}</ConnectionName>
            <ConnectionDescription>{option.description}</ConnectionDescription>
            
            <ConnectionDetails>
              <ConnectionCost free={option.cost === 0}>
                <FaDollarSign />
                {option.cost === 0 ? 'Free' : `$${option.cost}/month`}
              </ConnectionCost>
            </ConnectionDetails>

            <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '15px' }}>
              {option.requirements}
            </div>

            <ConnectButton
              connected={gameState.internet.connected && gameState.internet.type === option.id}
              onClick={() => handleConnection(option)}
              disabled={!option.available}
            >
              {gameState.internet.connected && gameState.internet.type === option.id ? 
                'Disconnect' : 
                option.available ? 'Connect' : 'Not Available'
              }
            </ConnectButton>
          </ConnectionCard>
        ))}
      </ConnectionOptions>

      {gameState.equipment.router && (
        <RouterConfig>
          <ConfigTitle>
            <FaCog />
            Router Configuration
          </ConfigTitle>
          <ConfigForm>
            <FormGroup>
              <Label>Network Name (SSID)</Label>
              <Input
                type="text"
                value={routerConfig.ssid}
                onChange={(e) => setRouterConfig({...routerConfig, ssid: e.target.value})}
                placeholder="Enter network name"
              />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                value={routerConfig.password}
                onChange={(e) => setRouterConfig({...routerConfig, password: e.target.value})}
                placeholder="Enter password"
              />
            </FormGroup>
          </ConfigForm>
          <SaveButton onClick={handleRouterConfig}>
            Save Configuration
          </SaveButton>
        </RouterConfig>
      )}
    </InternetContainer>
  );
};

export default InternetConnectivity;




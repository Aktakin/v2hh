import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

// Function to generate unique simulation-only IP identifier based on username
const generateUserIP = (username) => {
  // Check if username exists and is a string
  if (!username || typeof username !== 'string') {
    return 'SIM-000.000.000-USR'; // Default simulated identifier
  }
  
  // Create a hash from the username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Ensure positive number and map to a stable simulation identifier
  const uniqueID = Math.abs(hash) % 254 + 1; // 1-254 for last octet
  const subnet = Math.abs(hash >> 8) % 254 + 1; // 1-254 for third octet
  const segment = Math.abs(hash >> 16) % 254 + 1; // 1-254 for second octet
  
  const toOctet = (num) => String(num).padStart(3, '0');
  return `SIM-${toOctet(segment)}.${toOctet(subnet)}.${toOctet(uniqueID)}-USR`;
};

/** Avoid blank screen if localStorage has empty or invalid JSON (JSON.parse throws synchronously). */
function safeParseLocalStorageJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === '') return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const initialState = {
  user: null,
  money: 10000, // Starting money (vulnerable until phone is purchased)
  level: 1,
  experience: 0,
  ipAddress: null, // Unique IP address for this user
  gameMode: localStorage.getItem('hackhilis_gameMode') || 'free', // 'free' or 'story'
  character: safeParseLocalStorageJson('hackhilis_character'),
  story: safeParseLocalStorageJson('hackhilis_story'),
  phone: {
    owned: false,
    model: null,
    battery: 100,
    money: 0, // Money starts outside phone, moves to phone when purchased
    contacts: [],
    messages: [],
    emails: [],
    internetHistory: [],
    lastCharge: Date.now(),
    securityLevel: 1
  },
  skills: {
    hacking: 0,
    networking: 0,
    cryptography: 0,
    socialEngineering: 0,
    forensics: 0,
    malware: 0
  },
  inventory: [],
  equipment: {
    laptop: null,
    router: null,
    vpn: null,
    tools: []
  },
  devices: {
    laptop: {
      powered: false,
      connected: false,
      internetType: null, // 'router', 'wifi', 'provider'
      battery: 100,
      lastUsed: null,
      userAccount: null, // { username, password, created }
      loggedIn: false
    },
    router: {
      powered: false,
      password: null,
      ssid: null,
      connectedDevices: [],
      internetType: null
    },
    phone: {
      powered: true,
      connected: false,
      internetType: null,
      battery: 100,
      lastUsed: null
    }
  },
  internet: {
    connected: false,
    type: null, // 'router', 'wifi', 'provider'
    provider: null,
    cost: 0
  },
  education: {
    coursesCompleted: [],
    certifications: [],
    currentCourse: null
  },
  career: {
    company: null,
    position: null,
    salary: 0,
    reputation: 0
  },
  alliance: {
    name: null,
    role: null,
    members: []
  },
  stats: {
    hacksAttempted: 0,
    hacksSuccessful: 0,
    moneyEarned: 0,
    moneyStolen: 0,
    reputation: 0
  }
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        ipAddress: action.payload ? generateUserIP(action.payload.username) : null
      };
    
    case 'UPDATE_MONEY':
      // If phone is owned, update phone money, otherwise update main money
      if (state.phone.owned) {
        return {
          ...state,
          phone: {
            ...state.phone,
            money: Math.max(0, state.phone.money + action.payload)
          }
        };
      } else {
        return {
          ...state,
          money: Math.max(0, state.money + action.payload)
        };
      }
    
    case 'ADD_EXPERIENCE':
      const newExp = state.experience + action.payload;
      const newLevel = Math.floor(newExp / 1000) + 1;
      return { 
        ...state, 
        experience: newExp, 
        level: newLevel 
      };
    
    case 'UPDATE_SKILL':
      return {
        ...state,
        skills: {
          ...state.skills,
          [action.skill]: Math.min(100, state.skills[action.skill] + action.payload)
        }
      };
    
    case 'ADD_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, action.payload]
      };
    
    case 'EQUIP_ITEM':
      return {
        ...state,
        equipment: {
          ...state.equipment,
          [action.slot]: action.payload
        }
      };
    
    case 'COMPLETE_COURSE':
      return {
        ...state,
        education: {
          ...state.education,
          coursesCompleted: [...state.education.coursesCompleted, action.payload]
        }
      };
    
    case 'JOIN_COMPANY':
      return {
        ...state,
        career: {
          ...state.career,
          company: action.payload.company,
          position: action.payload.position,
          salary: action.payload.salary
        }
      };
    
    case 'JOIN_ALLIANCE':
      return {
        ...state,
        alliance: {
          ...state.alliance,
          name: action.payload.name,
          role: action.payload.role,
          members: action.payload.members
        }
      };
    
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload
        }
      };
    
    case 'PURCHASE_PHONE':
      const isFreeModePhone = state.gameMode === 'free';
      // In free mode, don't transfer money (keep it all)
      if (isFreeModePhone) {
        return {
          ...state,
          phone: {
            ...state.phone,
            owned: true,
            model: action.payload.model,
            money: state.phone.money + state.money, // Transfer money to phone
            securityLevel: action.payload.securityLevel || 1
          }
          // Keep money in main account too in free mode
        };
      }
      return {
        ...state,
        phone: {
          ...state.phone,
          owned: true,
          model: action.payload.model,
          money: state.phone.money + state.money, // Transfer money to phone
          securityLevel: action.payload.securityLevel || 1
        },
        money: 0 // All money goes to phone
      };
    
    case 'UPDATE_PHONE_MONEY':
      return {
        ...state,
        phone: {
          ...state.phone,
          money: Math.max(0, state.phone.money + action.payload)
        }
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        phone: {
          ...state.phone,
          messages: [...state.phone.messages, action.payload]
        }
      };
    
    case 'ADD_EMAIL':
      return {
        ...state,
        phone: {
          ...state.phone,
          emails: [...state.phone.emails, action.payload]
        }
      };
    
    case 'ADD_CONTACT':
      return {
        ...state,
        phone: {
          ...state.phone,
          contacts: [...state.phone.contacts, action.payload]
        }
      };
    
    case 'UPDATE_PHONE_BATTERY':
      return {
        ...state,
        phone: {
          ...state.phone,
          battery: Math.max(0, Math.min(100, state.phone.battery + action.payload))
        }
      };
    
    case 'EASY_MONEY_HACK':
      return {
        ...state,
        phone: {
          ...state.phone,
          money: 0 // All money stolen
        },
        money: 0
      };
    
    case 'POWER_DEVICE':
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.payload.device]: {
            ...state.devices[action.payload.device],
            powered: action.payload.powered
          }
        }
      };
    
    case 'CONNECT_INTERNET':
      return {
        ...state,
        internet: {
          connected: true,
          type: action.payload.type,
          provider: action.payload.provider,
          cost: action.payload.cost
        },
        devices: {
          ...state.devices,
          [action.payload.device]: {
            ...state.devices[action.payload.device],
            connected: true,
            internetType: action.payload.type
          }
        }
      };
    
    case 'DISCONNECT_INTERNET':
      return {
        ...state,
        internet: {
          connected: false,
          type: null,
          provider: null,
          cost: 0
        },
        devices: {
          ...state.devices,
          [action.payload.device]: {
            ...state.devices[action.payload.device],
            connected: false,
            internetType: null
          }
        }
      };
    
    case 'CONFIGURE_ROUTER':
      return {
        ...state,
        devices: {
          ...state.devices,
          router: {
            ...state.devices.router,
            password: action.payload.password,
            ssid: action.payload.ssid
          }
        }
      };
    
    case 'UPDATE_DEVICE_BATTERY':
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.payload.device]: {
            ...state.devices[action.payload.device],
            battery: action.payload.battery
          }
        }
      };
    
    case 'USE_DEVICE':
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.payload.device]: {
            ...state.devices[action.payload.device],
            lastUsed: Date.now(),
            battery: Math.max(0, state.devices[action.payload.device].battery - action.payload.batteryDrain)
          }
        }
      };
    
    case 'PURCHASE_EQUIPMENT':
      const itemPrice = action.payload.item.price;
      const isFreeMode = state.gameMode === 'free';
      console.log('GameContext - PURCHASE_EQUIPMENT:', { type: action.payload.type, item: action.payload.item });
      console.log('GameContext - Before equipment state:', state.equipment);
      console.log('GameContext - Item price:', itemPrice);
      console.log('GameContext - Phone owned:', state.phone.owned);
      console.log('GameContext - Current money:', state.phone.owned ? state.phone.money : state.money);
      console.log('GameContext - Free mode:', isFreeMode);
      
      // In free mode, don't deduct money
      if (isFreeMode) {
        return {
          ...state,
          equipment: {
            ...state.equipment,
            [action.payload.type]: action.payload.item
          }
        };
      }
      
      // If phone is owned, deduct from phone money, otherwise from main money
      if (state.phone.owned) {
        const newState = {
          ...state,
          equipment: {
            ...state.equipment,
            [action.payload.type]: action.payload.item
          },
          phone: {
            ...state.phone,
            money: Math.max(0, state.phone.money - itemPrice)
          }
        };
        console.log('GameContext - After equipment state (phone):', newState.equipment);
        console.log('GameContext - New phone money:', newState.phone.money);
        return newState;
      } else {
        const newState = {
          ...state,
          equipment: {
            ...state.equipment,
            [action.payload.type]: action.payload.item
          },
          money: Math.max(0, state.money - itemPrice)
        };
        console.log('GameContext - After equipment state (cash):', newState.equipment);
        console.log('GameContext - New money:', newState.money);
        return newState;
      }

    case 'SELL_EQUIPMENT':
      const sellPrice = Math.floor(action.payload.item.price * 0.6); // 60% of original price
      const equipmentType = action.payload.type;
      
      // If phone is owned, add to phone money, otherwise to main money
      if (state.phone.owned) {
        return {
          ...state,
          equipment: {
            ...state.equipment,
            [equipmentType]: null
          },
          phone: {
            ...state.phone,
            money: state.phone.money + sellPrice
          }
        };
      } else {
        return {
          ...state,
          equipment: {
            ...state.equipment,
            [equipmentType]: null
          },
          money: state.money + sellPrice
        };
      }

    case 'CREATE_LAPTOP_ACCOUNT':
      return {
        ...state,
        devices: {
          ...state.devices,
          laptop: {
            ...state.devices.laptop,
            userAccount: {
              username: action.payload.username,
              password: action.payload.password,
              created: Date.now()
            }
          }
        }
      };

    case 'LOGIN_LAPTOP':
      return {
        ...state,
        devices: {
          ...state.devices,
          laptop: {
            ...state.devices.laptop,
            loggedIn: action.payload.success
          }
        }
      };

    case 'LOGOUT_LAPTOP':
      return {
        ...state,
        devices: {
          ...state.devices,
          laptop: {
            ...state.devices.laptop,
            loggedIn: false
          }
        }
      };
    
    case 'RESET_GAME':
      return initialState;

    case 'SET_GAME_MODE':
      localStorage.setItem('hackhilis_gameMode', action.payload);
      return {
        ...state,
        gameMode: action.payload
      };

    case 'CREATE_CHARACTER':
      const characterData = {
        nickname: action.payload.nickname,
        age: action.payload.age,
        personality: action.payload.personality,
        createdAt: Date.now()
      };
      localStorage.setItem('hackhilis_character', JSON.stringify(characterData));
      return {
        ...state,
        character: characterData
      };

    case 'SELECT_JOB':
      const storyData = {
        job: action.payload.job,
        currentChapter: 1,
        currentStep: 1,
        completedSteps: [],
        objectives: [],
        createdAt: Date.now()
      };
      localStorage.setItem('hackhilis_story', JSON.stringify(storyData));
      return {
        ...state,
        story: storyData
      };

    case 'UPDATE_STORY_PROGRESS':
      const updatedStory = {
        ...state.story,
        currentChapter: action.payload.chapter || state.story.currentChapter,
        currentStep: action.payload.step || state.story.currentStep,
        completedSteps: action.payload.completedSteps || state.story.completedSteps,
        objectives: action.payload.objectives || state.story.objectives
      };
      localStorage.setItem('hackhilis_story', JSON.stringify(updatedStory));
      return {
        ...state,
        story: updatedStory
      };

    case 'RESET_STORY_MODE':
      localStorage.removeItem('hackhilis_character');
      localStorage.removeItem('hackhilis_story');
      return {
        ...state,
        character: null,
        story: null,
        gameMode: 'free'
      };

    case 'SET_EQUIPMENT':
      return {
        ...state,
        equipment: action.payload
      };

    case 'SET_PHONE':
      return {
        ...state,
        phone: action.payload
      };

    case 'SET_DEVICES':
      return {
        ...state,
        devices: action.payload
      };

    case 'SET_INTERNET':
      return {
        ...state,
        internet: action.payload
      };

    case 'SET_IP_ADDRESS':
      return {
        ...state,
        ipAddress: action.payload
      };

    case 'UPDATE_LEVEL':
      return {
        ...state,
        level: action.payload
      };

    case 'UPDATE_EXPERIENCE':
      return {
        ...state,
        experience: action.payload
      };

    case 'UPDATE_SKILLS':
      return {
        ...state,
        skills: action.payload
      };

    case 'CONNECT_DEVICE':
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.payload.device]: {
            ...state.devices[action.payload.device],
            connected: action.payload.internetType !== null,
            internetType: action.payload.internetType
          }
        }
      };
    
    default:
      return state;
  }
};

export const GameProvider = ({ children, user }) => {
  // Create user-specific localStorage key
  const getStorageKey = (username) => `hackhilis_game_state_${username}`;
  const isSimulatedIp = (ip) => typeof ip === 'string' && /^SIM-\d{3}\.\d{3}\.\d{3}-USR$/.test(ip);

  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  // Update user data and load user-specific game state when user changes
  useEffect(() => {
    if (user && user.username) {
      console.log('GameContext - User changed:', user.username);
      dispatch({ type: 'SET_USER', payload: user });
      
      // Load user-specific game state
      const storageKey = getStorageKey(user.username);
      console.log('GameContext - Loading from storage key:', storageKey);
      const savedState = localStorage.getItem(storageKey);
      console.log('GameContext - Saved state found:', !!savedState);
      console.log('GameContext - Raw saved state:', savedState);
      
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          console.log('GameContext - Parsed state:', parsedState);
          console.log('GameContext - Equipment in saved state:', parsedState.equipment);
          
          // Dispatch individual actions to restore the state
          if (parsedState.money !== undefined) {
            dispatch({ type: 'UPDATE_MONEY', payload: parsedState.money });
          }
          if (parsedState.level !== undefined) {
            dispatch({ type: 'UPDATE_LEVEL', payload: parsedState.level });
          }
          if (parsedState.experience !== undefined) {
            dispatch({ type: 'UPDATE_EXPERIENCE', payload: parsedState.experience });
          }
          if (parsedState.skills !== undefined) {
            dispatch({ type: 'UPDATE_SKILLS', payload: parsedState.skills });
          }
          if (parsedState.equipment !== undefined) {
            console.log('GameContext - Restoring equipment:', parsedState.equipment);
            dispatch({ type: 'SET_EQUIPMENT', payload: parsedState.equipment });
          }
          if (parsedState.phone !== undefined) {
            dispatch({ type: 'SET_PHONE', payload: parsedState.phone });
          }
          if (parsedState.devices !== undefined) {
            dispatch({ type: 'SET_DEVICES', payload: parsedState.devices });
          }
          if (parsedState.internet !== undefined) {
            dispatch({ type: 'SET_INTERNET', payload: parsedState.internet });
          }
          if (parsedState.ipAddress !== undefined) {
            const normalizedIp = isSimulatedIp(parsedState.ipAddress)
              ? parsedState.ipAddress
              : generateUserIP(user.username);
            dispatch({ type: 'SET_IP_ADDRESS', payload: normalizedIp });
          }
        } catch (error) {
          console.error('Error loading user-specific state:', error);
        }
      } else {
        console.log('GameContext - No saved state found for user:', user.username);
      }
    }
  }, [user]);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (user && user.username) {
      console.log('GameContext - Saving state for user:', user.username);
      console.log('GameContext - Equipment being saved:', gameState.equipment);
      localStorage.setItem(getStorageKey(user.username), JSON.stringify(gameState));
      console.log('GameContext - State saved successfully');
    }
  }, [gameState, user]);

  const value = {
    gameState,
    dispatch
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const glitch = keyframes`
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
`;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(0, 255, 65, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 0, 64, 0.1) 0%, transparent 50%);
    animation: ${glitch} 4s infinite;
  }
`;

const LoginBox = styled(motion.div)`
  background: rgba(26, 26, 46, 0.9);
  border: 2px solid #00ff41;
  border-radius: 10px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow:
    0 0 20px rgba(0, 255, 65, 0.3),
    inset 0 0 20px rgba(0, 255, 65, 0.1);
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 1s ease-out;
`;

const Title = styled.h1`
  font-family: 'Orbitron', sans-serif;
  font-size: 2.5rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 10px;
  color: #00ff41;
  text-shadow:
    0 0 10px #00ff41,
    0 0 20px #00ff41,
    0 0 30px #00ff41;
  letter-spacing: 3px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #888;
  margin-bottom: 30px;
  font-size: 0.9rem;
  letter-spacing: 1px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  color: #00ff41;
  font-size: 0.9rem;
  font-weight: bold;
  letter-spacing: 1px;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ff41;
  border-radius: 5px;
  padding: 12px;
  color: #00ff41;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }

  &::placeholder {
    color: #666;
  }
`;

const Button = styled.button`
  background: linear-gradient(45deg, #00ff41, #00cc33);
  border: none;
  border-radius: 5px;
  padding: 15px;
  color: #000;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;

  &:hover {
    background: linear-gradient(45deg, #00cc33, #00ff41);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  color: #ff0040;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 10px;
`;

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (isRegistering && !formData.email) {
      setError('Email is required for registration');
      return;
    }

    const userData = {
      id: Date.now(),
      username: formData.username,
      email: formData.email,
      level: 1,
      money: 10000,
      joinDate: new Date().toISOString()
    };

    onLogin(userData);
  };

  return (
    <LoginContainer>
      <LoginBox
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Title>HACKHILIS</Title>
        <Subtitle>Enter the cyber underworld</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your hacker alias"
              required
            />
          </InputGroup>

          {isRegistering && (
            <InputGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@domain.com"
              />
            </InputGroup>
          )}

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </InputGroup>

          <Button type="submit">
            {isRegistering ? 'Create Account' : 'Enter Game'}
          </Button>

          <Button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={{
              background: 'transparent',
              border: '1px solid #00ff41',
              color: '#00ff41'
            }}
          >
            {isRegistering ? 'Already have an account?' : 'Need an account?'}
          </Button>
        </Form>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </LoginBox>
    </LoginContainer>
  );
};

export default Login;

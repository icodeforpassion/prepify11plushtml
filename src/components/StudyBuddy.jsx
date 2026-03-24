import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { loadConversationLibrary } from '../utils/studyBuddyAI';

/**
 * Three.js Study Buddy Component
 * Features a low-poly, kid-friendly 3D character with conversational AI
 */

const StudyBuddy = ({ category = 'general' }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const characterRef = useRef(null);
  const animationIdRef = useRef(null);
  
  const [ai, setAi] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4ff);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 1, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create low-poly robot character
    const character = createRobotCharacter();
    characterRef.current = character;
    scene.add(character);

    // Ground plane
    const groundGeometry = new THREE.CircleGeometry(5, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x90ee90,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Idle animation - gentle bobbing
      if (characterRef.current) {
        characterRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.1 + 1;
        characterRef.current.rotation.y += 0.002;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Load conversation library
  useEffect(() => {
    loadConversationLibrary().then(aiInstance => {
      setAi(aiInstance);
      // Add initial greeting
      const greeting = aiInstance.getDefaultResponse();
      setConversation([{
        type: 'buddy',
        text: greeting.answer,
        animation: greeting.animation
      }]);
    });
  }, []);

  // Handle user question submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || !ai) return;

    // Add user message to conversation
    setConversation(prev => [...prev, {
      type: 'user',
      text: userInput
    }]);

    setIsThinking(true);

    // Simulate "thinking" delay for better UX
    setTimeout(() => {
      // Get AI response
      const response = ai.findResponse(userInput, category);
      
      // Trigger animation
      if (response.animation) {
        playAnimation(response.animation);
      }

      // Add AI response to conversation
      setConversation(prev => [...prev, {
        type: 'buddy',
        text: response.answer,
        animation: response.animation,
        confidence: response.confidence
      }]);

      setIsThinking(false);
      setUserInput('');
    }, 800);
  };

  // Play character animation
  const playAnimation = (animationType) => {
    if (!characterRef.current) return;

    const character = characterRef.current;

    switch (animationType) {
      case 'nod':
        // Nodding animation
        let nodCount = 0;
        const nodInterval = setInterval(() => {
          character.rotation.x = Math.sin(Date.now() * 0.02) * 0.2;
          nodCount++;
          if (nodCount > 20) {
            clearInterval(nodInterval);
            character.rotation.x = 0;
          }
        }, 50);
        break;

      case 'wave':
        // Find the arm and wave it
        const arm = character.children.find(child => child.userData.name === 'rightArm');
        if (arm) {
          let waveCount = 0;
          const waveInterval = setInterval(() => {
            arm.rotation.z = Math.sin(Date.now() * 0.02) * 0.5 - 0.5;
            waveCount++;
            if (waveCount > 20) {
              clearInterval(waveInterval);
              arm.rotation.z = -0.3;
            }
          }, 50);
        }
        break;

      case 'jump':
        // Jumping animation
        let jumpTime = 0;
        const jumpInterval = setInterval(() => {
          character.position.y = 1 + Math.abs(Math.sin(jumpTime * 0.1)) * 0.5;
          jumpTime++;
          if (jumpTime > 31) {
            clearInterval(jumpInterval);
            character.position.y = 1;
          }
        }, 30);
        break;

      default:
        break;
    }
  };

  return (
    <div className="study-buddy-container" style={styles.container}>
      <div 
        ref={mountRef} 
        style={styles.canvasContainer}
      />
      
      <div style={styles.chatInterface}>
        <div style={styles.chatMessages}>
          {conversation.map((message, idx) => (
            <div 
              key={idx} 
              style={{
                ...styles.message,
                ...(message.type === 'user' ? styles.userMessage : styles.buddyMessage)
              }}
            >
              <div style={styles.messageContent}>
                {message.type === 'buddy' && (
                  <span style={styles.buddyIcon}>🤖</span>
                )}
                <p style={styles.messageText}>{message.text}</p>
              </div>
            </div>
          ))}
          {isThinking && (
            <div style={{...styles.message, ...styles.buddyMessage}}>
              <div style={styles.messageContent}>
                <span style={styles.buddyIcon}>🤖</span>
                <p style={styles.messageText}>
                  <span style={styles.thinking}>Thinking...</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.inputForm}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask me anything about your studies..."
            style={styles.input}
          />
          <button type="submit" style={styles.submitButton}>
            Send
          </button>
        </form>

        {ai && (
          <div style={styles.suggestions}>
            <p style={styles.suggestionsTitle}>Try asking:</p>
            {ai.getSuggestedQuestions(category, 3).map((question, idx) => (
              <button
                key={idx}
                onClick={() => setUserInput(question)}
                style={styles.suggestionButton}
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Create a low-poly robot character
 */
function createRobotCharacter() {
  const robot = new THREE.Group();

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a90e2,
    roughness: 0.5,
    metalness: 0.3
  });
  const accentMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffd700,
    roughness: 0.3,
    metalness: 0.5
  });

  // Head
  const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.y = 1.9;
  head.castShadow = true;
  robot.add(head);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.2, 2, 0.4);
  robot.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.2, 2, 0.4);
  robot.add(rightEye);

  // Antenna
  const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
  const antenna = new THREE.Mesh(antennaGeometry, accentMaterial);
  antenna.position.y = 2.5;
  robot.add(antenna);

  const antennaBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    accentMaterial
  );
  antennaBall.position.y = 2.7;
  robot.add(antennaBall);

  // Body
  const bodyGeometry = new THREE.BoxGeometry(1, 1.2, 0.6);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 1;
  body.castShadow = true;
  robot.add(body);

  // Chest panel
  const panelGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.1);
  const panel = new THREE.Mesh(panelGeometry, accentMaterial);
  panel.position.set(0, 1, 0.35);
  robot.add(panel);

  // Arms
  const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8);
  
  const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
  leftArm.position.set(-0.6, 1, 0);
  leftArm.rotation.z = 0.3;
  leftArm.castShadow = true;
  robot.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
  rightArm.position.set(0.6, 1, 0);
  rightArm.rotation.z = -0.3;
  rightArm.castShadow = true;
  rightArm.userData.name = 'rightArm';
  robot.add(rightArm);

  // Hands
  const handGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  
  const leftHand = new THREE.Mesh(handGeometry, accentMaterial);
  leftHand.position.set(-0.75, 0.5, 0);
  robot.add(leftHand);

  const rightHand = new THREE.Mesh(handGeometry, accentMaterial);
  rightHand.position.set(0.75, 0.5, 0);
  robot.add(rightHand);

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8);
  
  const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
  leftLeg.position.set(-0.3, 0.2, 0);
  leftLeg.castShadow = true;
  robot.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
  rightLeg.position.set(0.3, 0.2, 0);
  rightLeg.castShadow = true;
  robot.add(rightLeg);

  // Feet
  const footGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.4);
  
  const leftFoot = new THREE.Mesh(footGeometry, accentMaterial);
  leftFoot.position.set(-0.3, -0.1, 0.1);
  robot.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeometry, accentMaterial);
  rightFoot.position.set(0.3, -0.1, 0.1);
  robot.add(rightFoot);

  robot.position.y = 1;
  return robot;
}

// Styles
const styles = {
  container: {
    display: 'flex',
    gap: '20px',
    height: '600px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  canvasContainer: {
    flex: 1,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  chatInterface: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  message: {
    display: 'flex',
    maxWidth: '80%'
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4a90e2',
    color: '#ffffff',
    borderRadius: '18px 18px 4px 18px',
    padding: '12px 16px'
  },
  buddyMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f4ff',
    color: '#333',
    borderRadius: '4px 18px 18px 18px'
  },
  messageContent: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    padding: '8px 12px'
  },
  buddyIcon: {
    fontSize: '24px',
    flexShrink: 0
  },
  messageText: {
    margin: 0,
    lineHeight: '1.4'
  },
  thinking: {
    opacity: 0.7,
    fontStyle: 'italic'
  },
  inputForm: {
    display: 'flex',
    padding: '16px',
    borderTop: '1px solid #e0e0e0',
    gap: '8px'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#4a90e2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  suggestions: {
    padding: '12px 16px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#f9f9f9'
  },
  suggestionsTitle: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#666',
    fontWeight: 'bold'
  },
  suggestionButton: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    marginBottom: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '12px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }
};

export default StudyBuddy;

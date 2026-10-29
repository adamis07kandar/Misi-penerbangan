import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Question, QuestionOptionKey } from '../types/game';
import { soundManager } from '../audio/synth';

interface FlightCanvasProps {
  currentQuestion: Question;
  gameState: string;
  lives: number;
  invertY: boolean;
  invertX: boolean;
  shotEffectTrigger: number;
  isTakingOff: boolean;
  isLanding: boolean;
  onTakeoffComplete: () => void;
  onLandingComplete: () => void;
  onGatePass: (letter: QuestionOptionKey) => void;
  onGateMiss: () => void;
  setPlaneTelemetry?: (info: { altitude: number; speed: number; heading: number }) => void;
}

export const FlightCanvas: React.FC<FlightCanvasProps> = ({
  currentQuestion,
  gameState,
  lives,
  invertY,
  invertX,
  shotEffectTrigger,
  isTakingOff,
  isLanding,
  onTakeoffComplete,
  onLandingComplete,
  onGatePass,
  onGateMiss,
  setPlaneTelemetry,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    gameState,
    lives,
    invertY,
    invertX,
    currentQuestion,
    isTakingOff,
    isLanding,
    onTakeoffComplete,
    onLandingComplete,
    onGatePass,
    onGateMiss,
  });

  useEffect(() => {
    stateRef.current.gameState = gameState;
    stateRef.current.lives = lives;
    stateRef.current.invertY = invertY;
    stateRef.current.invertX = invertX;
    stateRef.current.currentQuestion = currentQuestion;
    stateRef.current.isTakingOff = isTakingOff;
    stateRef.current.isLanding = isLanding;
    stateRef.current.onTakeoffComplete = onTakeoffComplete;
    stateRef.current.onLandingComplete = onLandingComplete;
    stateRef.current.onGatePass = onGatePass;
    stateRef.current.onGateMiss = onGateMiss;
  }, [
    gameState,
    lives,
    invertY,
    invertX,
    currentQuestion,
    isTakingOff,
    isLanding,
    onTakeoffComplete,
    onLandingComplete,
    onGatePass,
    onGateMiss,
  ]);

  const triggerShotEffectRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (shotEffectTrigger > 0 && triggerShotEffectRef.current) {
      triggerShotEffectRef.current();
    }
  }, [shotEffectTrigger]);

  const resetGatesRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (resetGatesRef.current) {
      resetGatesRef.current();
    }
  }, [currentQuestion.id]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8);
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.0032);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1200
    );
    camera.position.set(0, 6.2, -15);
    camera.lookAt(0, 3, 15);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.3);
    sunLight.position.set(60, 120, -40);
    sunLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x0369a1, 0.65);
    scene.add(hemiLight);

    // Ocean Surface
    const oceanGeo = new THREE.PlaneGeometry(1200, 1200, 72, 72);
    const oceanMat = new THREE.MeshPhongMaterial({
      color: 0x0284c7,
      emissive: 0x034c75,
      specular: 0x7dd3fc,
      shininess: 90,
      flatShading: true,
      transparent: true,
      opacity: 0.95,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.rotation.x = -Math.PI / 2;
    oceanMesh.position.y = 0;
    scene.add(oceanMesh);

    // Island Runway (Used for takeoff and landing)
    const runwayGroup = new THREE.Group();
    const runwayBase = new THREE.Mesh(
      new THREE.BoxGeometry(26, 1.8, 120),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    );
    runwayBase.position.set(0, 0.9, 0);
    runwayGroup.add(runwayBase);

    // Runway markings
    for (let r = 0; r < 9; r++) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 7),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 1.82, -50 + r * 13);
      runwayGroup.add(stripe);
    }
    runwayGroup.position.set(0, 0, -10);
    scene.add(runwayGroup);

    // Scenery: Mountains
    const sceneryGroup = new THREE.Group();
    const mountainMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a, flatShading: true });
    const jungleHillsMat = new THREE.MeshLambertMaterial({ color: 0x065f46, flatShading: true });

    for (let i = -14; i <= 14; i++) {
      const isPeak = i % 2 === 0;
      const height = isPeak ? 70 + Math.random() * 35 : 45 + Math.random() * 20;
      const radius = isPeak ? 40 + Math.random() * 15 : 28 + Math.random() * 12;
      const coneGeo = new THREE.ConeGeometry(radius, height, 5);
      const mtn = new THREE.Mesh(coneGeo, isPeak ? mountainMat : jungleHillsMat);
      mtn.position.set(
        i * 42 + (Math.random() * 16 - 8),
        height * 0.45,
        490 + Math.random() * 80
      );
      sceneryGroup.add(mtn);
    }
    scene.add(sceneryGroup);

    // Low-poly Moving Clouds
    const cloudLayerGroup = new THREE.Group();
    scene.add(cloudLayerGroup);

    interface CloudAsset {
      mesh: THREE.Group;
      speed: number;
    }
    const dynamicClouds: CloudAsset[] = [];

    function createLowPolyCloud(scale: number, opacity: number): THREE.Group {
      const group = new THREE.Group();
      const puffGeo = new THREE.DodecahedronGeometry(2.5, 1);
      const puffMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: opacity,
        flatShading: true,
      });

      for (let p = 0; p < 5; p++) {
        const puff = new THREE.Mesh(puffGeo, puffMat);
        puff.position.set(
          (p - 2) * 2.2 + (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.0,
          (Math.random() - 0.5) * 1.5
        );
        const pScale = 0.8 + Math.random() * 0.6;
        puff.scale.set(pScale, pScale * 0.7, pScale);
        group.add(puff);
      }
      group.scale.setScalar(scale);
      return group;
    }

    // High clouds
    for (let c = 0; c < 18; c++) {
      const cloud = createLowPolyCloud(1.8 + Math.random() * 1.4, 0.88);
      cloud.position.set((Math.random() - 0.5) * 350, 30 + Math.random() * 20, Math.random() * 450);
      cloudLayerGroup.add(cloud);
      dynamicClouds.push({ mesh: cloud, speed: 0.35 + Math.random() * 0.25 });
    }

    // Mid fly-by clouds
    for (let c = 0; c < 14; c++) {
      const cloud = createLowPolyCloud(1.2 + Math.random() * 0.8, 0.75);
      const side = c % 2 === 0 ? 1 : -1;
      cloud.position.set(side * (16 + Math.random() * 35), 5 + Math.random() * 12, Math.random() * 400);
      cloudLayerGroup.add(cloud);
      dynamicClouds.push({ mesh: cloud, speed: 0.75 + Math.random() * 0.45 });
    }

    // --- REFINED HIGH-QUALITY 3D AIRPLANE MODEL ---
    const airplaneGroup = new THREE.Group();

    // 1. Aerodynamic Main Fuselage
    const fuselageGroup = new THREE.Group();
    // Fuselage Central Body (Capsule/Cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.9, 0.6, 6.8, 14);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.22,
      metalness: 0.12,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    fuselageGroup.add(body);

    // Streamlined Nose Cone with Chrome Spinner
    const noseGeo = new THREE.ConeGeometry(0.9, 1.8, 14);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0, 4.3);
    fuselageGroup.add(nose);

    // Chrome Nose Tip
    const noseTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 })
    );
    noseTip.position.set(0, 0, 5.2);
    fuselageGroup.add(noseTip);

    // Red Trim Stripe along Fuselage
    const stripeGeo = new THREE.BoxGeometry(1.84, 0.14, 5.2);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 0, 0.8);
    fuselageGroup.add(stripe);

    airplaneGroup.add(fuselageGroup);

    // 2. Clear Cockpit Canopy & Windshield Frame
    const canopyGeo = new THREE.SphereGeometry(0.85, 16, 14);
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.55,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.52, 1.8);
    canopy.scale.set(0.88, 0.65, 1.85);
    airplaneGroup.add(canopy);

    // Windshield Frame Arch
    const canopyFrame = new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.05, 6, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
    );
    canopyFrame.rotation.x = -Math.PI / 2.2;
    canopyFrame.position.set(0, 0.55, 1.6);
    airplaneGroup.add(canopyFrame);

    // 3. SANG KANCIL 3D PILOT INSIDE COCKPIT
    const kancilPilotGroup = new THREE.Group();
    kancilPilotGroup.position.set(0, 0.38, 1.65);

    // Pilot Body in Bomber Jacket
    const pilotBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.3, 0.55, 8),
      new THREE.MeshLambertMaterial({ color: 0x78350f })
    );
    kancilPilotGroup.add(pilotBody);

    // Steering Yoke / Controls
    const yokeGroup = new THREE.Group();
    const yokeShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    yokeShaft.rotation.x = Math.PI / 4;
    yokeShaft.position.set(0, 0.08, 0.28);
    yokeGroup.add(yokeShaft);

    const yokeBar = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.025, 4, 12, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    yokeBar.position.set(0, 0.22, 0.42);
    yokeGroup.add(yokeBar);
    kancilPilotGroup.add(yokeGroup);

    // Kancil Head
    const kancilFurMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const kancilHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), kancilFurMat);
    kancilHead.position.set(0, 0.35, 0.04);
    kancilPilotGroup.add(kancilHead);

    // Cute Snout & Black Nose
    const snout = new THREE.Mesh(
      new THREE.ConeGeometry(0.13, 0.3, 8),
      new THREE.MeshLambertMaterial({ color: 0xfef3c7 })
    );
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.32, 0.28);
    kancilPilotGroup.add(snout);

    const pilotNose = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x020617 })
    );
    pilotNose.position.set(0, 0.34, 0.44);
    kancilPilotGroup.add(pilotNose);

    // Ears
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 6), kancilFurMat);
    earL.position.set(-0.22, 0.6, -0.02);
    earL.rotation.z = 0.4;
    earL.rotation.x = -0.15;
    kancilPilotGroup.add(earL);

    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 6), kancilFurMat);
    earR.position.set(0.22, 0.6, -0.02);
    earR.rotation.z = -0.4;
    earR.rotation.x = -0.15;
    kancilPilotGroup.add(earR);

    // Aviator Leather Helmet Cap & Goggles
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshLambertMaterial({ color: 0x451a03 })
    );
    helmet.position.set(0, 0.36, 0.03);
    kancilPilotGroup.add(helmet);

    const goggleBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.31, 0.035, 6, 16),
      new THREE.MeshBasicMaterial({ color: 0x0f172a })
    );
    goggleBand.rotation.x = Math.PI / 2;
    goggleBand.position.set(0, 0.41, 0.05);
    kancilPilotGroup.add(goggleBand);

    const goggleLensMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
    });
    const goggleL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 10), goggleLensMat);
    goggleL.rotation.x = Math.PI / 2;
    goggleL.position.set(-0.11, 0.43, 0.3);
    kancilPilotGroup.add(goggleL);

    const goggleR = goggleL.clone();
    goggleR.position.set(0.11, 0.43, 0.3);
    kancilPilotGroup.add(goggleR);

    // Fluttering Pilot Scarf
    const scarfMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const scarfNeck = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 6, 12), scarfMat);
    scarfNeck.rotation.x = Math.PI / 2;
    scarfNeck.position.set(0, 0.16, 0.05);
    kancilPilotGroup.add(scarfNeck);

    const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.7), scarfMat);
    scarfTail.position.set(-0.14, 0.2, -0.36);
    scarfTail.rotation.x = 0.2;
    kancilPilotGroup.add(scarfTail);

    airplaneGroup.add(kancilPilotGroup);

    // 4. Swept Aerodynamic Wings with Winglets
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 1.8), wingMat);
    wingL.position.set(-2.8, 0.15, 0.8);
    wingL.rotation.z = 0.04; // Slight dihedral
    airplaneGroup.add(wingL);

    const wingR = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 1.8), wingMat);
    wingR.position.set(2.8, 0.15, 0.8);
    wingR.rotation.z = -0.04;
    airplaneGroup.add(wingR);

    // Aerodynamic Winglets
    const wingletGeo = new THREE.BoxGeometry(0.12, 0.85, 0.8);
    const wingletL = new THREE.Mesh(wingletGeo, wingMat);
    wingletL.position.set(-5.4, 0.55, 0.8);
    airplaneGroup.add(wingletL);

    const wingletR = new THREE.Mesh(wingletGeo, wingMat);
    wingletR.position.set(5.4, 0.55, 0.8);
    airplaneGroup.add(wingletR);

    // Nav Lights
    const navLightPort = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    navLightPort.position.set(-5.45, 0.95, 0.8);
    airplaneGroup.add(navLightPort);

    const navLightStbd = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    navLightStbd.position.set(5.45, 0.95, 0.8);
    airplaneGroup.add(navLightStbd);

    // 5. Tail Fin & Elevators
    const tailFin = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 2.1, 1.5),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.28 })
    );
    tailFin.position.set(0, 1.35, -2.5);
    tailFin.rotation.x = -Math.PI / 6.5;
    airplaneGroup.add(tailFin);

    const elevator = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.12, 1.1),
      wingMat
    );
    elevator.position.set(0, 0.6, -3.1);
    airplaneGroup.add(elevator);

    // 6. Dual Turboprop Engines & Spinning Propellers
    const nacelleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.25,
    });
    const propMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.35,
      roughness: 0.2,
    });
    const spinnerMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
    });

    // Left Engine Nacelle
    const nacelleL = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 2.2, 12), nacelleMat);
    nacelleL.rotation.x = Math.PI / 2;
    nacelleL.position.set(-2.3, 0.05, 1.1);
    airplaneGroup.add(nacelleL);

    // Left Exhaust Pipe
    const exhaustL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    exhaustL.position.set(-2.3, 0.3, 0.1);
    airplaneGroup.add(exhaustL);

    // Left Propeller Group with Spinner Cone
    const propLeftGroup = new THREE.Group();
    propLeftGroup.position.set(-2.3, 0.05, 2.25);

    const spinnerConeL = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.5, 10), spinnerMat);
    spinnerConeL.rotation.x = Math.PI / 2;
    propLeftGroup.add(spinnerConeL);

    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.035), propMat);
      blade.rotation.z = (b * Math.PI * 2) / 3;
      propLeftGroup.add(blade);
    }
    airplaneGroup.add(propLeftGroup);

    // Right Engine Nacelle
    const nacelleR = nacelleL.clone();
    nacelleR.position.set(2.3, 0.05, 1.1);
    airplaneGroup.add(nacelleR);

    // Right Exhaust Pipe
    const exhaustR = exhaustL.clone();
    exhaustR.position.set(2.3, 0.3, 0.1);
    airplaneGroup.add(exhaustR);

    // Right Propeller Group
    const propRightGroup = new THREE.Group();
    propRightGroup.position.set(2.3, 0.05, 2.25);

    const spinnerConeR = spinnerConeL.clone();
    propRightGroup.add(spinnerConeR);

    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.035), propMat);
      blade.rotation.z = (b * Math.PI * 2) / 3;
      propRightGroup.add(blade);
    }
    airplaneGroup.add(propRightGroup);

    // Retractable Landing Gear (Tricycle gear)
    const gearGroup = new THREE.Group();
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.16, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });

    // Main Left Gear
    const strutL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), strutMat);
    strutL.position.set(-1.8, -0.35, 0.6);
    gearGroup.add(strutL);
    const wheelL = new THREE.Mesh(wheelGeo, wheelMat);
    wheelL.rotation.z = Math.PI / 2;
    wheelL.position.set(-1.8, -0.68, 0.6);
    gearGroup.add(wheelL);

    // Main Right Gear
    const strutR = strutL.clone();
    strutR.position.set(1.8, -0.35, 0.6);
    gearGroup.add(strutR);
    const wheelR = wheelL.clone();
    wheelR.position.set(1.8, -0.68, 0.6);
    gearGroup.add(wheelR);

    // Nose Gear
    const strutN = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), strutMat);
    strutN.position.set(0, -0.35, 3.2);
    gearGroup.add(strutN);
    const wheelN = wheelL.clone();
    wheelN.position.set(0, -0.68, 3.2);
    gearGroup.add(wheelN);

    airplaneGroup.add(gearGroup);

    // Contrails
    const contrailMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
    const contrailGeo = new THREE.CylinderGeometry(0.04, 0.14, 8, 6);
    const contrailL = new THREE.Mesh(contrailGeo, contrailMat);
    contrailL.rotation.x = Math.PI / 2;
    contrailL.position.set(-5.35, 0.15, -4.2);
    airplaneGroup.add(contrailL);

    const contrailR = contrailL.clone();
    contrailR.position.set(5.35, 0.15, -4.2);
    airplaneGroup.add(contrailR);

    airplaneGroup.scale.set(0.68, 0.68, 0.68);
    airplaneGroup.position.set(0, 2.45, 0);
    scene.add(airplaneGroup);

    // --- CONTINUOUS PROGRESSIVE DAMAGE SMOKE SYSTEM ---
    // Smoke trails that worsen as player loses lives (lives: 3 -> 2 -> 1 -> 0)
    const fxGroup = new THREE.Group();
    scene.add(fxGroup);

    interface DamageSmokeParticle {
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }
    const damageSmokeList: DamageSmokeParticle[] = [];

    const damageSmokeGeo = new THREE.DodecahedronGeometry(0.5, 1);
    const darkSmokeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.85 });
    const graySmokeMat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.7 });
    const fireEmberMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });

    // Gunfire Tracers and Explosions
    const tracerList: { mesh: THREE.Mesh; vx: number; vy: number; vz: number; life: number }[] = [];
    const tracerGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 6);
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });

    let cameraShake = 0;
    let planeWobble = 0;

    function shootAirplane() {
      soundManager.playPlaneShot();
      cameraShake = 1.35;
      planeWobble = 1.7;

      for (let i = 0; i < 6; i++) {
        const tracer = new THREE.Mesh(tracerGeo, tracerMat);
        const startX = airplaneGroup.position.x + (Math.random() * 20 - 10);
        const startY = 0.5 + Math.random() * 2;
        const startZ = airplaneGroup.position.z + 40 + Math.random() * 20;
        tracer.position.set(startX, startY, startZ);
        tracer.lookAt(airplaneGroup.position.x, airplaneGroup.position.y, airplaneGroup.position.z);
        tracer.rotateX(Math.PI / 2);

        fxGroup.add(tracer);
        tracerList.push({
          mesh: tracer,
          vx: (airplaneGroup.position.x - startX) * 0.12,
          vy: (airplaneGroup.position.y - startY) * 0.12,
          vz: (airplaneGroup.position.z - startZ) * 0.12,
          life: 1.0,
        });
      }
    }
    triggerShotEffectRef.current = shootAirplane;

    // --- 4 ANSWER GATES WITH UN-MIRRORED LABELS ---
    const gateGroup = new THREE.Group();
    scene.add(gateGroup);

    interface ActiveGate {
      mesh: THREE.Group;
      letter: QuestionOptionKey;
      x: number;
      y: number;
      z: number;
      passed: boolean;
      ringMesh: THREE.Mesh;
    }
    const gateList: ActiveGate[] = [];

    const GATE_COLORS: Record<QuestionOptionKey, { hex: number; str: string; glow: number }> = {
      A: { hex: 0xf59e0b, str: '#f59e0b', glow: 0xd97706 },
      B: { hex: 0x06b6d4, str: '#06b6d4', glow: 0x0891b2 },
      C: { hex: 0x10b981, str: '#10b981', glow: 0x059669 },
      D: { hex: 0xa855f7, str: '#a855f7', glow: 0x9333ea },
    };

    function createLetterTexture(letter: QuestionOptionKey): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      const colorData = GATE_COLORS[letter];
      ctx.fillStyle = colorData.str;
      ctx.beginPath();
      ctx.arc(128, 128, 115, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 14;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 135px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 12;
      ctx.fillText(letter, 128, 135);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    }

    function createRingGate(letter: QuestionOptionKey, x: number, y: number, z: number): ActiveGate {
      const group = new THREE.Group();
      const colorData = GATE_COLORS[letter];

      const ringGeo = new THREE.TorusGeometry(3.3, 0.28, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: colorData.hex,
        emissive: colorData.glow,
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      const portalGeo = new THREE.CircleGeometry(3.1, 28);
      const portalMat = new THREE.MeshBasicMaterial({
        color: colorData.hex,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
      });
      const portal = new THREE.Mesh(portalGeo, portalMat);
      group.add(portal);

      // Label faces -Z towards oncoming player: NEVER MIRRORED!
      const labelTexture = createLetterTexture(letter);
      const labelGeo = new THREE.PlaneGeometry(2.4, 2.4);
      const labelMat = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.set(0, 4.4, 0);
      labelMesh.rotation.y = Math.PI; // Face oncoming camera
      group.add(labelMesh);

      // Vertical sky beacon pillar so gate is visible from afar
      const beaconGeo = new THREE.CylinderGeometry(0.12, 0.12, 24, 6);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: colorData.hex,
        transparent: true,
        opacity: 0.35,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 12, 0);
      group.add(beacon);

      // Support Pylon anchoring to sea
      const pylon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.35, y, 8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 })
      );
      pylon.position.set(0, -y / 2, 0);
      group.add(pylon);

      group.position.set(x, y, z);
      gateGroup.add(group);

      return {
        mesh: group,
        letter,
        x,
        y,
        z,
        passed: false,
        ringMesh: ring,
      };
    }

    const SPAWN_Z = 160;
    const SPACING_X = 9.5;

    function spawnGates() {
      while (gateGroup.children.length > 0) {
        const obj = gateGroup.children[0];
        gateGroup.remove(obj);
      }
      gateList.length = 0;

      // Gate order on screen from left to right: A -> B -> C -> D
      const gateLayout: { letter: QuestionOptionKey; x: number }[] = [
        { letter: 'A', x: 1.5 * SPACING_X },   // Left on screen
        { letter: 'B', x: 0.5 * SPACING_X },   // Mid-Left
        { letter: 'C', x: -0.5 * SPACING_X },  // Mid-Right
        { letter: 'D', x: -1.5 * SPACING_X },  // Right on screen
      ];

      gateLayout.forEach((item) => {
        const gate = createRingGate(item.letter, item.x, 3.8, SPAWN_Z);
        gateList.push(gate);
      });
    }

    resetGatesRef.current = spawnGates;
    spawnGates();

    // Flight Physics State
    const planePos = { x: 0, y: 2.45, z: 0 };
    const planeTarget = { x: 0, y: 3.5 };
    const forwardSpeed = 0.42;

    // Takeoff & Landing Timers
    let takeoffTimer = 0;
    let landingTimer = 0;
    const TAKEOFF_DURATION = 3.2;
    const LANDING_DURATION = 3.6;
    let runwayOffsetZ = 0;
    let touchdownTriggered = false;

    const heldKeys: Record<string, boolean> = {};

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      heldKeys[e.key.toLowerCase()] = true;

      if (stateRef.current.gameState === 'PLAYING' && !stateRef.current.isTakingOff && !stateRef.current.isLanding) {
        const key = e.key.toUpperCase();
        if (key === '1' || key === 'A') {
          planeTarget.x = 1.5 * SPACING_X; // Gate A (Left)
        } else if (key === '2' || key === 'B') {
          planeTarget.x = 0.5 * SPACING_X;
        } else if (key === '3' || key === 'C') {
          planeTarget.x = -0.5 * SPACING_X;
        } else if (key === '4' || key === 'D') {
          planeTarget.x = -1.5 * SPACING_X; // Gate D (Right)
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeys[e.key.toLowerCase()] = false;
    };

    const onBlur = () => {
      for (const k in heldKeys) {
        heldKeys[k] = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // Mouse / Touch Drag Steering
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('input') || target.closest('.glass-card')) return;
      isDragging = true;
      prevPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || stateRef.current.gameState !== 'PLAYING' || stateRef.current.isTakingOff || stateRef.current.isLanding) return;
      const dx = e.clientX - prevPointer.x;
      const dy = e.clientY - prevPointer.y;

      const rawXDelta = -dx * 0.035;
      const xDelta = stateRef.current.invertX ? -rawXDelta : rawXDelta;
      planeTarget.x += xDelta;

      const yDelta = dy * 0.035;
      planeTarget.y += stateRef.current.invertY ? yDelta : -yDelta;

      planeTarget.x = Math.max(-16.5, Math.min(16.5, planeTarget.x));
      planeTarget.y = Math.max(1.2, Math.min(9.5, planeTarget.y));

      prevPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Animation Loop using modern THREE.Timer (eliminates clock warnings and tab delta spikes)
    let animId = 0;
    const timer = new THREE.Timer();
    let frameCount = 0;

    function tick() {
      timer.update();
      const rawDt = timer.getDelta();
      const dt = Math.min(rawDt, 0.05);
      frameCount++;

      // Ocean wave animation
      const oceanPositions = oceanMesh.geometry.attributes.position;
      const time = timer.getElapsed() * 1.8;
      for (let i = 0; i < oceanPositions.count; i++) {
        const u = oceanPositions.getX(i);
        const v = oceanPositions.getY(i);
        const wave =
          Math.sin(u * 0.08 + time) * 0.35 +
          Math.cos(v * 0.08 + time * 0.8) * 0.35;
        oceanPositions.setZ(i, wave);
      }
      oceanPositions.needsUpdate = true;

      // Cloud drift
      const effectiveSpeed = stateRef.current.isTakingOff
        ? forwardSpeed * Math.min(takeoffTimer / 1.5, 1.0)
        : stateRef.current.isLanding
        ? forwardSpeed * Math.max(0, 1 - landingTimer / LANDING_DURATION)
        : forwardSpeed;

      dynamicClouds.forEach((cloudAsset) => {
        cloudAsset.mesh.position.z -= (effectiveSpeed + cloudAsset.speed * 0.35);
        if (cloudAsset.mesh.position.z < -25) {
          cloudAsset.mesh.position.z = 460 + Math.random() * 40;
        }
      });

      // Pilot scarf flutter
      scarfTail.rotation.z = Math.sin(time * 8) * 0.15;
      scarfTail.scale.z = 1.0 + Math.sin(time * 12) * 0.1;

      // Update Tracers
      for (let i = tracerList.length - 1; i >= 0; i--) {
        const tr = tracerList[i];
        tr.mesh.position.x += tr.vx * dt * 25;
        tr.mesh.position.y += tr.vy * dt * 25;
        tr.mesh.position.z += tr.vz * dt * 25;
        tr.life -= dt * 2.5;
        if (tr.life <= 0) {
          fxGroup.remove(tr.mesh);
          tracerList.splice(i, 1);
        }
      }

      // --- SPAWN PROGRESSIVE DAMAGE SMOKE (BASED ON LIVES REMAINING) ---
      const curLives = stateRef.current.lives;
      // If lives == 2: light gray smoke trailing from right engine
      // If lives == 1: heavy black smoke + fire sparks trailing from both engines!
      if (curLives < 3 && stateRef.current.gameState === 'PLAYING') {
        const spawnRate = curLives === 2 ? 6 : 2; // spawn every 6 frames or 2 frames
        if (frameCount % spawnRate === 0) {
          const isCritical = curLives === 1;
          const engineX = isCritical ? (frameCount % 4 === 0 ? 1.56 : -1.56) : 1.56;
          const smokeMesh = new THREE.Mesh(
            damageSmokeGeo,
            isCritical && Math.random() > 0.6 ? fireEmberMat : (isCritical ? darkSmokeMat : graySmokeMat)
          );
          smokeMesh.position.set(
            airplaneGroup.position.x + engineX,
            airplaneGroup.position.y + 0.1,
            airplaneGroup.position.z - 0.6
          );
          const initialScale = isCritical ? 0.6 + Math.random() * 0.5 : 0.35 + Math.random() * 0.3;
          smokeMesh.scale.setScalar(initialScale);
          fxGroup.add(smokeMesh);

          damageSmokeList.push({
            mesh: smokeMesh,
            vx: (Math.random() - 0.5) * (isCritical ? 1.5 : 0.8),
            vy: Math.random() * 0.8 + 0.3,
            vz: -forwardSpeed * (isCritical ? 1.4 : 1.2),
            life: 1.0,
            maxLife: isCritical ? 1.4 : 1.0,
          });
        }
      }

      // Update Damage Smoke Particles
      for (let s = damageSmokeList.length - 1; s >= 0; s--) {
        const sm = damageSmokeList[s];
        sm.mesh.position.x += sm.vx * dt;
        sm.mesh.position.y += sm.vy * dt;
        sm.mesh.position.z += sm.vz;
        sm.mesh.scale.multiplyScalar(1.035);
        sm.life -= dt;
        if (sm.life <= 0) {
          fxGroup.remove(sm.mesh);
          damageSmokeList.splice(s, 1);
        }
      }

      cameraShake = Math.max(0, cameraShake - dt * 2.2);
      planeWobble = Math.max(0, planeWobble - dt * 2.5);

      // --- TAKEOFF SEQUENCE ---
      if (stateRef.current.isTakingOff) {
        takeoffTimer += dt;
        const progress = Math.min(takeoffTimer / TAKEOFF_DURATION, 1.0);

        propLeftGroup.rotation.z += 0.2 + progress * 0.6;
        propRightGroup.rotation.z += 0.2 + progress * 0.6;

        runwayOffsetZ -= 25 * dt * (0.2 + progress * 1.2);
        runwayGroup.position.z = runwayOffsetZ;

        let runwayVibe = 0;
        if (progress < 0.6) {
          runwayVibe = Math.sin(time * 35) * 0.04 * (1 - progress);
        }

        if (progress < 0.55) {
          planePos.x = 0;
          planePos.y = 2.45 + runwayVibe;
          airplaneGroup.rotation.x = 0;
          airplaneGroup.rotation.z = 0;
          soundManager.updateEnginePitch(0.3 + progress * 0.5);
        } else {
          const climbPhase = (progress - 0.55) / 0.45;
          const pitchAngle = Math.sin(climbPhase * Math.PI) * 0.32;
          airplaneGroup.rotation.x = -pitchAngle;

          planePos.y = 2.45 + climbPhase * 1.35;
          planePos.x = 0;
          soundManager.updateEnginePitch(0.8 + climbPhase * 0.2);

          gearGroup.position.y = -climbPhase * 0.5;
          gearGroup.scale.setScalar(Math.max(0.1, 1 - climbPhase * 0.9));
        }

        airplaneGroup.position.set(planePos.x, planePos.y, 0);

        camera.position.x = 0;
        camera.position.y = 4.8 + progress * 1.4;
        camera.lookAt(0, planePos.y + 1.0, 20);

        if (progress >= 1.0) {
          stateRef.current.onTakeoffComplete();
        }
      }
      // --- LANDING SEQUENCE (UPON COMPLETING ALL QUESTIONS) ---
      else if (stateRef.current.isLanding) {
        landingTimer += dt;
        const progress = Math.min(landingTimer / LANDING_DURATION, 1.0);

        // Bring the landing runway into view ahead
        runwayGroup.position.set(0, 0, 40 - progress * 40);

        // Center the aircraft for landing
        planeTarget.x = 0;
        planePos.x = THREE.MathUtils.damp(planePos.x, 0, 4, dt);

        // Deploy landing gear smoothly
        gearGroup.position.y = THREE.MathUtils.damp(gearGroup.position.y, 0, 5, dt);
        gearGroup.scale.setScalar(THREE.MathUtils.damp(gearGroup.scale.x, 1.0, 5, dt));

        if (progress < 0.6) {
          // Approach & Glide descent (from ~3.8m down to runway height 2.45m)
          const descentRatio = progress / 0.6;
          planePos.y = THREE.MathUtils.lerp(3.8, 2.45, descentRatio);
          airplaneGroup.rotation.x = -0.08; // Slight nose-up flare
          soundManager.updateEnginePitch(0.5 * (1 - descentRatio * 0.5));
        } else {
          // Touchdown & Roll out (0.6 to 1.0)
          planePos.y = 2.45;
          airplaneGroup.rotation.x = 0;

          if (!touchdownTriggered) {
            touchdownTriggered = true;
            soundManager.playTouchdown();
            // Spawn tire puff
            for (let t = 0; t < 6; t++) {
              const tirePuff = new THREE.Mesh(damageSmokeGeo, graySmokeMat);
              tirePuff.position.set(
                airplaneGroup.position.x + (t % 2 === 0 ? 1.2 : -1.2),
                2.2,
                0.4
              );
              tirePuff.scale.setScalar(0.4);
              fxGroup.add(tirePuff);
              damageSmokeList.push({
                mesh: tirePuff,
                vx: (Math.random() - 0.5) * 1.2,
                vy: 0.2 + Math.random() * 0.4,
                vz: -0.8,
                life: 0.6,
                maxLife: 0.6,
              });
            }
          }

          // Decelerate propellers to idle
          const rollOutProgress = (progress - 0.6) / 0.4;
          const propSpeed = 0.55 * (1 - rollOutProgress * 0.8);
          propLeftGroup.rotation.z += propSpeed;
          propRightGroup.rotation.z += propSpeed;
          soundManager.updateEnginePitch(0.15 * (1 - rollOutProgress * 0.5));
        }

        airplaneGroup.position.set(planePos.x, planePos.y, 0);
        airplaneGroup.rotation.z = 0;

        camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 4, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 4.5, 4, dt);
        camera.lookAt(0, planePos.y + 0.6, 20);

        if (progress >= 1.0) {
          stateRef.current.onLandingComplete();
        }
      }
      // --- NORMAL CRUISE / IN-FLIGHT ---
      else if (stateRef.current.gameState === 'PLAYING') {
        propLeftGroup.rotation.z += 0.55;
        propRightGroup.rotation.z += 0.55;

        runwayGroup.position.z -= forwardSpeed * 2.0;

        const moveStep = 9.5 * dt;

        if (heldKeys['w'] || heldKeys['arrowup']) {
          planeTarget.y += stateRef.current.invertY ? -moveStep : moveStep;
        }
        if (heldKeys['s'] || heldKeys['arrowdown']) {
          planeTarget.y += stateRef.current.invertY ? moveStep : -moveStep;
        }

        // Steer left moves to screen left (+X), steer right moves to screen right (-X)
        const steerLeft = stateRef.current.invertX ? -moveStep : moveStep;
        const steerRight = stateRef.current.invertX ? moveStep : -moveStep;

        if (heldKeys['a'] || heldKeys['arrowleft']) {
          planeTarget.x += steerLeft;
        }
        if (heldKeys['d'] || heldKeys['arrowright']) {
          planeTarget.x += steerRight;
        }

        planeTarget.x = Math.max(-16.5, Math.min(16.5, planeTarget.x));
        planeTarget.y = Math.max(1.2, Math.min(9.5, planeTarget.y));

        planePos.x = THREE.MathUtils.damp(planePos.x, planeTarget.x, 6, dt);
        planePos.y = THREE.MathUtils.damp(planePos.y, planeTarget.y, 6, dt);

        const rollDelta = (planeTarget.x - planePos.x);
        const bankRoll = -rollDelta * 0.08;
        const climbPitch = (planePos.y - planeTarget.y) * 0.06;

        kancilHead.rotation.y = THREE.MathUtils.damp(kancilHead.rotation.y, rollDelta * 0.05, 5, dt);

        const wobbleX = (Math.random() - 0.5) * planeWobble * 0.4;
        const wobbleY = (Math.random() - 0.5) * planeWobble * 0.4;
        const wobbleZ = (Math.random() - 0.5) * planeWobble * 0.6;

        airplaneGroup.position.set(
          planePos.x + wobbleX,
          planePos.y + wobbleY,
          planePos.z
        );
        airplaneGroup.rotation.z = bankRoll + wobbleZ;
        airplaneGroup.rotation.x = climbPitch;
        airplaneGroup.rotation.y = -bankRoll * 0.25;

        soundManager.updateEnginePitch(
          (planePos.y / 9.5) * 0.5 + Math.abs(bankRoll) * 0.5
        );

        let allGatesBehind = true;
        gateList.forEach((gate) => {
          gate.mesh.position.z -= forwardSpeed;
          gate.ringMesh.rotation.z += 0.015;

          const gateZ = gate.mesh.position.z;
          if (
            !gate.passed &&
            gateZ <= planePos.z + 1.2 &&
            gateZ >= planePos.z - 1.2
          ) {
            const distX = planePos.x - gate.x;
            const distY = planePos.y - gate.y;
            const dist = Math.hypot(distX, distY);

            if (dist <= 3.4) {
              gate.passed = true;
              stateRef.current.onGatePass(gate.letter);
            }
          }

          if (gate.mesh.position.z >= -10) {
            allGatesBehind = false;
          }
        });

        if (allGatesBehind && gateList.length > 0) {
          stateRef.current.onGateMiss();
          spawnGates();
        }

        const shakeOffsetX = (Math.random() - 0.5) * cameraShake * 0.8;
        const shakeOffsetY = (Math.random() - 0.5) * cameraShake * 0.8;

        camera.position.x =
          THREE.MathUtils.damp(camera.position.x, planePos.x * 0.35, 4, dt) +
          shakeOffsetX;
        camera.position.y =
          THREE.MathUtils.damp(camera.position.y, 4.8 + planePos.y * 0.35, 4, dt) +
          shakeOffsetY;
        camera.lookAt(planePos.x * 0.2, planePos.y * 0.2 + 2.8, 22);

        if (setPlaneTelemetry) {
          setPlaneTelemetry({
            altitude: Math.round(planePos.y * 120),
            speed: Math.round(forwardSpeed * 400),
            heading: Math.round(90 + bankRoll * 15),
          });
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);

      timer.dispose();
      scene.clear();
      renderer.dispose();
      oceanGeo.dispose();
      oceanMat.dispose();
      bodyGeo.dispose();
      canopyGeo.dispose();
      canopyMat.dispose();
      wingMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full z-0 overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    />
  );
};

/* character.js — Three.js procedural 3D character (Gabriel) */

class GabrielCharacter {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.state = 'idle';   // idle | happy1 | happy2 | happy3 | beg
    this.tipCount = 0;
    this.clock = new THREE.Clock();

    // animation state
    this._anim = { t: 0, wave: 0, jump: 0, lean: 0 };

    this._build();
    this._buildParticles();
  }

  // ─── Materials ──────────────────────────────────────────────
  _mat(color, opts = {}) {
    return new THREE.MeshToonMaterial({ color, ...opts });
  }

  // ─── Build character geometry ────────────────────────────────
  _build() {
    const root = this.root;

    /* ── Skin ── */
    const skin   = this._mat(0xC68642);
    const dark   = this._mat(0x1a1a1a);
    const dkGray = this._mat(0x2a2a2a);
    const white  = this._mat(0xffffff);
    const pants  = this._mat(0x1e2235);
    const shoe   = this._mat(0x4a4a5a);
    const sole   = this._mat(0xd4d4d4);
    const lanyardGreen = this._mat(0x16a34a);
    const lanyardText  = this._mat(0x15803d);
    const idCard = this._mat(0xf8f8f8);

    // ── Torso group (for bob animation) ──
    this.bodyGroup = new THREE.Group();
    root.add(this.bodyGroup);
    this.bodyGroup.position.y = 0;

    // ── Body / Torso ──
    const torsoMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.33, 1.0, 16),
      this._mat(0x1a1a1a) // dark shirt under jacket
    );
    torsoMesh.position.y = 0.5;
    this.bodyGroup.add(torsoMesh);

    // ── Jacket (green batik) — two side panels ──
    const jacketMat = this._mat(0x1a5c1a);
    const jL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.95, 0.32), jacketMat);
    jL.position.set(-0.2, 0.52, 0);
    this.bodyGroup.add(jL);
    const jR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.95, 0.32), jacketMat);
    jR.position.set(0.2, 0.52, 0);
    this.bodyGroup.add(jR);

    // Batik pattern dots on jacket (golden accents)
    const batikMat = this._mat(0xca8a04);
    const batikDots = [
      [-0.2, 0.8, 0.17], [-0.2, 0.6, 0.17], [-0.2, 0.4, 0.17],
      [ 0.2, 0.75, 0.17],[ 0.2, 0.55, 0.17],[ 0.2, 0.35, 0.17],
    ];
    batikDots.forEach(([x, y, z]) => {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), batikMat);
      d.position.set(x, y, z);
      this.bodyGroup.add(d);
    });

    // ── Collar ──
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.05, 8, 16), jacketMat);
    collar.position.set(0, 0.98, 0.1);
    collar.rotation.x = Math.PI / 4;
    this.bodyGroup.add(collar);

    // ── Lanyard ──
    const lanyardStrap = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.55, 0.008),
      lanyardGreen
    );
    lanyardStrap.position.set(0, 0.72, 0.36);
    this.bodyGroup.add(lanyardStrap);

    const idCardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.01), idCard);
    idCardMesh.position.set(0, 0.38, 0.37);
    this.bodyGroup.add(idCardMesh);
    const idPhoto = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.012), skin);
    idPhoto.position.set(0, 0.42, 0.375);
    this.bodyGroup.add(idPhoto);

    // ── Pelvis ──
    const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.3, 0.25, 12), this._mat(0x1a2030));
    pelvis.position.y = -0.0;
    this.bodyGroup.add(pelvis);

    // ── Legs ──
    this.legL = new THREE.Group();
    this.legR = new THREE.Group();
    this.bodyGroup.add(this.legL);
    this.bodyGroup.add(this.legR);

    const thighGeo = new THREE.CylinderGeometry(0.14, 0.13, 0.55, 12);
    const shinGeo  = new THREE.CylinderGeometry(0.11, 0.1,  0.5,  12);

    const thighL = new THREE.Mesh(thighGeo, pants);
    thighL.position.set(-0.17, -0.42, 0);
    this.legL.add(thighL);
    const shinL = new THREE.Mesh(shinGeo, pants);
    shinL.position.set(-0.17, -0.87, 0);
    this.legL.add(shinL);

    const thighR = new THREE.Mesh(thighGeo, pants);
    thighR.position.set(0.17, -0.42, 0);
    this.legR.add(thighR);
    const shinR = new THREE.Mesh(shinGeo, pants);
    shinR.position.set(0.17, -0.87, 0);
    this.legR.add(shinR);

    // ── Feet ──
    const footGeo = new THREE.BoxGeometry(0.15, 0.1, 0.28);
    const soleGeo = new THREE.BoxGeometry(0.155, 0.04, 0.29);

    const footL = new THREE.Mesh(footGeo, shoe);
    footL.position.set(-0.17, -1.14, 0.06);
    this.bodyGroup.add(footL);
    const soleL = new THREE.Mesh(soleGeo, sole);
    soleL.position.set(-0.17, -1.19, 0.06);
    this.bodyGroup.add(soleL);

    const footR = new THREE.Mesh(footGeo, shoe);
    footR.position.set(0.17, -1.14, 0.06);
    this.bodyGroup.add(footR);
    const soleR = new THREE.Mesh(soleGeo, sole);
    soleR.position.set(0.17, -1.19, 0.06);
    this.bodyGroup.add(soleR);

    // ── Arms ──
    this.armL = new THREE.Group();
    this.armR = new THREE.Group();
    this.bodyGroup.add(this.armL);
    this.bodyGroup.add(this.armR);

    const upperArmGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.45, 10);
    const foreArmGeo  = new THREE.CylinderGeometry(0.09, 0.08, 0.42, 10);

    // Left arm
    const ulA = new THREE.Mesh(upperArmGeo, jacketMat);
    ulA.position.set(-0.5, 0.65, 0);
    ulA.rotation.z = 0.2;
    this.armL.add(ulA);
    const flA = new THREE.Mesh(foreArmGeo, jacketMat);
    flA.position.set(-0.62, 0.22, 0);
    flA.rotation.z = 0.1;
    this.armL.add(flA);
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), skin);
    handL.position.set(-0.68, -0.04, 0);
    this.armL.add(handL);

    // Right arm (will be animated for wave)
    this.rUpperArm = new THREE.Mesh(upperArmGeo, jacketMat);
    this.rUpperArm.position.set(0.5, 0.65, 0);
    this.rUpperArm.rotation.z = -0.2;
    this.armR.add(this.rUpperArm);
    this.rForeArm = new THREE.Mesh(foreArmGeo, jacketMat);
    this.rForeArm.position.set(0.62, 0.22, 0);
    this.armR.add(this.rForeArm);
    this.handR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), skin);
    this.handR.position.set(0.68, -0.04, 0);
    this.armR.add(this.handR);

    // ── Head group ──
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 1.1;
    this.bodyGroup.add(this.headGroup);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.18, 10), skin);
    neck.position.y = -0.08;
    this.headGroup.add(neck);

    // Skull
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), skin);
    this.headGroup.add(skull);

    // Cheeks (wider face)
    const cheekGeo = new THREE.SphereGeometry(0.08, 10, 10);
    const chL = new THREE.Mesh(cheekGeo, this._mat(0xbe7b4a));
    chL.position.set(-0.3, -0.06, 0.34);
    this.headGroup.add(chL);
    const chR = new THREE.Mesh(cheekGeo, this._mat(0xbe7b4a));
    chR.position.set(0.3, -0.06, 0.34);
    this.headGroup.add(chR);

    // ── Hair (dark, curly top) ──
    const hairMat = this._mat(0x111111);
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 16), hairMat);
    hairTop.position.y = 0.18;
    hairTop.scale.set(1.0, 0.65, 0.98);
    this.headGroup.add(hairTop);

    // Hair curls (small spheres on top)
    const curlPositions = [
      [-0.1, 0.44, 0.1], [0.1, 0.45, 0.05], [0, 0.46, -0.05],
      [-0.22, 0.38, 0], [0.22, 0.38, 0], [-0.3, 0.28, -0.1],
    ];
    curlPositions.forEach(([x, y, z]) => {
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), hairMat);
      c.position.set(x, y, z);
      this.headGroup.add(c);
    });

    // Hair sides
    const hairSideGeo = new THREE.SphereGeometry(0.22, 10, 10);
    const hsL = new THREE.Mesh(hairSideGeo, hairMat);
    hsL.position.set(-0.39, 0.05, -0.05);
    hsL.scale.set(0.7, 0.9, 0.7);
    this.headGroup.add(hsL);
    const hsR = new THREE.Mesh(hairSideGeo, hairMat);
    hsR.position.set(0.39, 0.05, -0.05);
    hsR.scale.set(0.7, 0.9, 0.7);
    this.headGroup.add(hsR);

    // ── Eyes ──
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 10), white);
    eyeWhite.position.set(-0.14, 0.06, 0.38);
    this.headGroup.add(eyeWhite);
    const eyeWhiteR = eyeWhite.clone();
    eyeWhiteR.position.set(0.14, 0.06, 0.38);
    this.headGroup.add(eyeWhiteR);

    const pupilMat = this._mat(0x111111);
    const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), pupilMat);
    pupilL.position.set(-0.14, 0.06, 0.42);
    this.headGroup.add(pupilL);
    const pupilR = pupilL.clone();
    pupilR.position.set(0.14, 0.06, 0.42);
    this.headGroup.add(pupilR);

    // Eyelids (for expressions)
    this.eyelidL = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      this._mat(0xC68642)
    );
    this.eyelidL.position.set(-0.14, 0.07, 0.38);
    this.eyelidL.scale.y = 0.4;
    this.headGroup.add(this.eyelidL);
    this.eyelidR = this.eyelidL.clone();
    this.eyelidR.position.set(0.14, 0.07, 0.38);
    this.headGroup.add(this.eyelidR);

    // ── Glasses ──
    const glassMat = new THREE.MeshToonMaterial({ color: 0x3d2b1a, transparent: true, opacity: 0.3 });
    const frameMat = this._mat(0x4a3728);

    const glassGeo = new THREE.TorusGeometry(0.11, 0.016, 8, 24);
    const glL = new THREE.Mesh(glassGeo, frameMat);
    glL.position.set(-0.15, 0.06, 0.42);
    this.headGroup.add(glL);
    const glR = new THREE.Mesh(glassGeo, frameMat);
    glR.position.set(0.15, 0.06, 0.42);
    this.headGroup.add(glR);

    // Glass bridge
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.09, 6), frameMat);
    bridge.position.set(0, 0.06, 0.43);
    bridge.rotation.z = Math.PI / 2;
    this.headGroup.add(bridge);

    // Glass lens tint
    const lensGeo = new THREE.CircleGeometry(0.1, 16);
    const lensL = new THREE.Mesh(lensGeo, glassMat);
    lensL.position.set(-0.15, 0.06, 0.418);
    this.headGroup.add(lensL);
    const lensR = lensL.clone();
    lensR.position.set(0.15, 0.06, 0.418);
    this.headGroup.add(lensR);

    // ── Mustache ──
    const mustache = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.02, 6, 16, Math.PI),
      this._mat(0x111111)
    );
    mustache.position.set(0, -0.06, 0.41);
    mustache.rotation.x = Math.PI / 8;
    this.headGroup.add(mustache);

    // Mouth (smile) — will be updated per expression
    this.mouthGroup = new THREE.Group();
    this.mouthGroup.position.set(0, -0.14, 0.4);
    this.headGroup.add(this.mouthGroup);

    this.smileMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.07, 0.018, 6, 16, Math.PI),
      this._mat(0x1a1a1a)
    );
    this.smileMesh.rotation.z = Math.PI;
    this.mouthGroup.add(this.smileMesh);

    // ── Headphones ──
    const hpMat = this._mat(0x1a1a1a);
    const hpAccent = this._mat(0x222222);

    // Band over head
    const hpBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.44, 0.035, 10, 24, Math.PI),
      hpMat
    );
    hpBand.position.y = 0.28;
    hpBand.rotation.z = Math.PI / 2;
    this.headGroup.add(hpBand);

    // Left cup
    const hpCupGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 14);
    const hpCL = new THREE.Mesh(hpCupGeo, hpAccent);
    hpCL.rotation.z = Math.PI / 2;
    hpCL.position.set(-0.47, 0.06, 0);
    this.headGroup.add(hpCL);
    const hpCR = hpCL.clone();
    hpCR.position.set(0.47, 0.06, 0);
    this.headGroup.add(hpCR);

    // Padding discs
    const padGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 14);
    const padMat = this._mat(0x2d2d2d);
    const padL = new THREE.Mesh(padGeo, padMat);
    padL.rotation.z = Math.PI / 2;
    padL.position.set(-0.51, 0.06, 0);
    this.headGroup.add(padL);
    const padR = padL.clone();
    padR.position.set(0.51, 0.06, 0);
    this.headGroup.add(padR);

    // HP cable
    const hpCable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.45, 6),
      this._mat(0x0a0a0a)
    );
    hpCable.position.set(-0.49, -0.18, 0.05);
    hpCable.rotation.x = 0.3;
    this.headGroup.add(hpCable);

    // ── Ground shadow ──
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.6, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.22;
    root.add(shadow);

    // Position whole character
    root.position.y = -0.3;
    root.scale.setScalar(1.1);
  }

  // ─── Particles (hearts / stars / coins) ─────────────────────
  _buildParticles() {
    this.particles = [];
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);
  }

  spawnParticles(type = 'heart') {
    const colors = type === 'heart' ? [0xff4d6d, 0xff8fa3] : [0xfbbf24, 0xfde68a];
    for (let i = 0; i < 8; i++) {
      const geo = type === 'heart'
        ? new THREE.SphereGeometry(0.05, 6, 6)
        : new THREE.OctahedronGeometry(0.06);
      const mat = new THREE.MeshToonMaterial({ color: colors[i % 2] });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(
        this.root.position.x + (Math.random() - 0.5) * 1.2,
        this.root.position.y + 0.5 + Math.random() * 0.5,
        0
      );
      p._vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.04,
        0.04 + Math.random() * 0.04,
        0
      );
      p._life = 1.0;
      this.particleGroup.add(p);
      this.particles.push(p);
    }
  }

  // ─── State machine ───────────────────────────────────────────
  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this._anim.t = 0;
  }

  receiveTip() {
    this.tipCount++;
    if (this.tipCount <= 3) {
      this.setState('happy1');
      this.spawnParticles('heart');
    } else if (this.tipCount <= 7) {
      this.setState('happy2');
      this.spawnParticles('star');
    } else {
      this.setState('happy3');
      this.spawnParticles('heart');
      this.spawnParticles('star');
    }
  }

  startBeg() {
    this.setState('beg');
  }

  // ─── Animate ─────────────────────────────────────────────────
  update() {
    const t = this.clock.getElapsedTime();
    const dt = this.clock.getDelta();
    this._anim.t += 0.016;

    // Idle breathing
    const breathe = Math.sin(t * 1.2) * 0.012;
    this.bodyGroup.position.y = breathe;

    // Head subtle bob
    this.headGroup.rotation.y = Math.sin(t * 0.4) * 0.06;

    switch (this.state) {
      case 'idle':
        this._animIdle(t);
        break;
      case 'happy1':
        this._animHappy1(t);
        break;
      case 'happy2':
        this._animHappy2(t);
        break;
      case 'happy3':
        this._animHappy3(t);
        break;
      case 'beg':
        this._animBeg(t);
        break;
    }

    // Particles
    this.particles = this.particles.filter(p => {
      p._life -= 0.018;
      p.position.add(p._vel);
      p._vel.y -= 0.001;
      p.scale.setScalar(p._life);
      p.material.opacity = p._life;
      if (p._life <= 0) {
        this.particleGroup.remove(p);
        return false;
      }
      return true;
    });
  }

  _animIdle(t) {
    // Gentle arm swing
    this.armR.rotation.x = Math.sin(t * 0.8) * 0.04;
    this.armL.rotation.x = -Math.sin(t * 0.8) * 0.04;
    // Reset arm positions
    this.rUpperArm.rotation.z = 0;
    this.rUpperArm.position.set(0.5, 0.65, 0);
    this.rForeArm.position.set(0.62, 0.22, 0);
    this.handR.position.set(0.68, -0.04, 0);
    // Normal eyes
    this.eyelidL.scale.y = 0.3;
    this.eyelidR.scale.y = 0.3;
    // Blink
    if (Math.sin(t * 3.7) > 0.97) {
      this.eyelidL.scale.y = 1.2;
      this.eyelidR.scale.y = 1.2;
    }
    // Neutral smile
    this.smileMesh.rotation.z = Math.PI; // arc points down = smile
    this.smileMesh.scale.x = 0.7;
    this.smileMesh.position.y = 0;
  }

  _animHappy1(t) {
    // Light wave + smile
    const wave = Math.sin(t * 4) * 0.4;
    this.armR.rotation.z = -0.6 + wave * 0.3;
    this.armR.rotation.x = -0.5;
    this.rUpperArm.position.set(0.45, 0.8, 0.1);
    this.rForeArm.position.set(0.52, 0.42, 0.1);
    this.handR.position.set(0.55, 0.12, 0.1);
    // Wider smile
    this.smileMesh.rotation.z = Math.PI;
    this.smileMesh.scale.x = 1.2;
    this.smileMesh.position.y = -0.02;
    this.eyelidL.scale.y = 0.2;
    this.eyelidR.scale.y = 0.2;
  }

  _animHappy2(t) {
    // Enthusiastic wave + head tilt
    const wave = Math.sin(t * 6) * 0.6;
    this.armR.rotation.z = -0.8 + wave * 0.4;
    this.armR.rotation.x = -0.7;
    this.rUpperArm.position.set(0.42, 0.9, 0.15);
    this.rForeArm.position.set(0.48, 0.52, 0.15);
    this.handR.position.set(0.5, 0.22, 0.15);
    this.headGroup.rotation.z = Math.sin(t * 2) * 0.08;
    // Big smile
    this.smileMesh.rotation.z = Math.PI;
    this.smileMesh.scale.x = 1.5;
    this.smileMesh.position.y = -0.03;
    this.eyelidL.scale.y = 0.15;
    this.eyelidR.scale.y = 0.15;
  }

  _animHappy3(t) {
    // Jump + both arms up
    const jump = Math.abs(Math.sin(t * 3)) * 0.2;
    this.bodyGroup.position.y = jump;

    this.armR.rotation.z = -1.2 + Math.sin(t * 5) * 0.2;
    this.armR.rotation.x = -0.9;
    this.armL.rotation.z = 1.2 - Math.sin(t * 5) * 0.2;
    this.armL.rotation.x = -0.9;

    this.headGroup.rotation.z = Math.sin(t * 4) * 0.12;
    // Max smile
    this.smileMesh.rotation.z = Math.PI;
    this.smileMesh.scale.x = 1.8;
    this.smileMesh.position.y = -0.04;
    this.eyelidL.scale.y = 0.1;
    this.eyelidR.scale.y = 0.1;
  }

  _animBeg(t) {
    // Bow / lean forward + hands clasped
    this.bodyGroup.rotation.x = Math.sin(t * 1.5) * 0.15 + 0.2;
    this.headGroup.rotation.x = 0.3;

    // Both arms forward and down (begging gesture)
    this.armL.rotation.x = -1.0;
    this.armL.rotation.z = 0.5;
    this.armR.rotation.x = -1.0;
    this.armR.rotation.z = -0.5;

    // Sad eyes (half closed)
    this.eyelidL.scale.y = 0.8;
    this.eyelidR.scale.y = 0.8;
    // Small mouth
    this.smileMesh.scale.x = 0.5;
    this.smileMesh.rotation.z = 0; // flat mouth
  }
}

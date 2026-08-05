import * as THREE from 'three';

/**
 * Personagem placeholder do jogo.
 *
 * Dono: **Rendering Agent**.
 *
 * Obedece ao contrato de rig da `docs/decisions/0008` osso por osso: mesma
 * hierarquia, mesmos nomes, T-pose, +Y para cima, +Z para a frente, origem
 * entre os pes. Quando um `.glb` de verdade chegar, ele entra no lugar sem
 * tocar em nenhuma linha de logica de jogo.
 *
 * **Nao existe carregador de `.glb` ainda**, porque nao existe nenhum arquivo
 * para carregar. Ele chega junto com o primeiro modelo, pela regra 5.
 *
 * ## Por que isto e uma copia do rig de `src/bench/`
 *
 * Escolha registrada, nao descuido. O rig do benchmark e **congelado pelo
 * protocolo de medicao**: mexer nele invalida a comparacao com medicoes
 * anteriores, que e a razao da ferramenta existir. Este aqui vai mudar toda vez
 * que a arte evoluir. Ciclos de vida opostos -- compartilhar acoplaria o
 * historico de performance a decisoes de aparencia.
 */

const RADIAL = 8;
const RINGS = 5;

/**
 * Nome de osso **ja sanitizado**, como ele chega ao Three.js.
 *
 * O contrato manda exportar com o prefixo `mixamorig:`, e o arquivo sai assim,
 * mas os dois pontos nunca chegam ao runtime: o `PropertyBinding` trata `:`
 * como separador de caminho. O `GLTFLoader` sanitiza os nomes ao carregar, dos
 * dois lados, osso e trilha. Ver a correcao registrada na `0008`.
 */
function boneName(joint: string): string {
  return THREE.PropertyBinding.sanitizeNodeName(`mixamorig:${joint}`);
}

interface Joint {
  name: string;
  parent: string | null;
  x: number;
  y: number;
  z: number;
}

/** Os 22 ossos da hierarquia obrigatoria da `0008`. Dedos sao ignorados. */
const SKELETON: Joint[] = [
  { name: 'Hips', parent: null, x: 0, y: 0.98, z: 0 },

  { name: 'Spine', parent: 'Hips', x: 0, y: 0.12, z: 0 },
  { name: 'Spine1', parent: 'Spine', x: 0, y: 0.14, z: 0 },
  { name: 'Spine2', parent: 'Spine1', x: 0, y: 0.14, z: 0 },
  { name: 'Neck', parent: 'Spine2', x: 0, y: 0.16, z: 0 },
  { name: 'Head', parent: 'Neck', x: 0, y: 0.11, z: 0 },

  { name: 'LeftShoulder', parent: 'Spine2', x: 0.06, y: 0.11, z: 0 },
  { name: 'LeftArm', parent: 'LeftShoulder', x: 0.13, y: 0, z: 0 },
  { name: 'LeftForeArm', parent: 'LeftArm', x: 0.27, y: 0, z: 0 },
  { name: 'LeftHand', parent: 'LeftForeArm', x: 0.25, y: 0, z: 0 },

  { name: 'RightShoulder', parent: 'Spine2', x: -0.06, y: 0.11, z: 0 },
  { name: 'RightArm', parent: 'RightShoulder', x: -0.13, y: 0, z: 0 },
  { name: 'RightForeArm', parent: 'RightArm', x: -0.27, y: 0, z: 0 },
  { name: 'RightHand', parent: 'RightForeArm', x: -0.25, y: 0, z: 0 },

  { name: 'LeftUpLeg', parent: 'Hips', x: 0.09, y: -0.06, z: 0 },
  { name: 'LeftLeg', parent: 'LeftUpLeg', x: 0, y: -0.44, z: 0 },
  { name: 'LeftFoot', parent: 'LeftLeg', x: 0, y: -0.42, z: 0 },
  { name: 'LeftToeBase', parent: 'LeftFoot', x: 0, y: -0.06, z: 0.09 },

  { name: 'RightUpLeg', parent: 'Hips', x: -0.09, y: -0.06, z: 0 },
  { name: 'RightLeg', parent: 'RightUpLeg', x: 0, y: -0.44, z: 0 },
  { name: 'RightFoot', parent: 'RightLeg', x: 0, y: -0.42, z: 0 },
  { name: 'RightToeBase', parent: 'RightFoot', x: 0, y: -0.06, z: 0.09 },
];

interface Limb {
  from: string;
  to: string;
  base: number;
  top: number;
}

const LIMBS: Limb[] = [
  { from: 'Hips', to: 'Spine1', base: 0.15, top: 0.16 },
  { from: 'Spine1', to: 'Neck', base: 0.16, top: 0.1 },
  { from: 'Neck', to: 'Head', base: 0.06, top: 0.09 },

  { from: 'LeftArm', to: 'LeftForeArm', base: 0.07, top: 0.055 },
  { from: 'LeftForeArm', to: 'LeftHand', base: 0.055, top: 0.045 },
  { from: 'RightArm', to: 'RightForeArm', base: 0.07, top: 0.055 },
  { from: 'RightForeArm', to: 'RightHand', base: 0.055, top: 0.045 },

  { from: 'LeftUpLeg', to: 'LeftLeg', base: 0.1, top: 0.075 },
  { from: 'LeftLeg', to: 'LeftFoot', base: 0.075, top: 0.055 },
  { from: 'RightUpLeg', to: 'RightLeg', base: 0.1, top: 0.075 },
  { from: 'RightLeg', to: 'RightFoot', base: 0.075, top: 0.055 },
];

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function restPositions(): Map<string, THREE.Vector3> {
  const out = new Map<string, THREE.Vector3>();
  for (const joint of SKELETON) {
    const local = new THREE.Vector3(joint.x, joint.y, joint.z);
    if (joint.parent) local.add(out.get(joint.parent)!);
    out.set(joint.name, local);
  }
  return out;
}

/**
 * Geometria skinada compartilhada por **todos** os personagens.
 *
 * Criada uma vez. Cada personagem clona so o esqueleto -- e o que a
 * `decisions/0011` mediu e aprovou.
 */
export function buildHumanoidGeometry(): THREE.BufferGeometry {
  const rest = restPositions();
  const index = new Map<string, number>();
  SKELETON.forEach((joint, i) => index.set(joint.name, i));

  const positions: number[] = [];
  const normals: number[] = [];
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];
  const indices: number[] = [];

  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const sideA = new THREE.Vector3();
  const sideB = new THREE.Vector3();
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (const limb of LIMBS) {
    from.copy(rest.get(limb.from)!);
    to.copy(rest.get(limb.to)!);
    axis.subVectors(to, from);
    const length = axis.length();
    if (length < 1e-5) continue;
    axis.divideScalar(length);

    sideA.set(0, 1, 0);
    if (Math.abs(axis.dot(sideA)) > 0.95) sideA.set(1, 0, 0);
    sideB.crossVectors(axis, sideA).normalize();
    sideA.crossVectors(sideB, axis).normalize();

    const boneFrom = index.get(limb.from)!;
    const boneTo = index.get(limb.to)!;
    const first = positions.length / 3;

    for (let ring = 0; ring <= RINGS; ring++) {
      const t = ring / RINGS;
      point.copy(from).lerp(to, t);
      const radius = limb.base + (limb.top - limb.base) * t;
      // O membro pertence quase todo ao osso de cima e so troca de dono perto
      // da junta. Interpolar linear ao longo do osso inteiro faria o meio do
      // braco seguir o antebraco, que nao e como pele funciona.
      const handover = smoothstep(0.55, 1, t);

      for (let i = 0; i < RADIAL; i++) {
        const angle = (i / RADIAL) * Math.PI * 2;
        normal
          .copy(sideA)
          .multiplyScalar(Math.cos(angle))
          .addScaledVector(sideB, Math.sin(angle));

        positions.push(
          point.x + normal.x * radius,
          point.y + normal.y * radius,
          point.z + normal.z * radius
        );
        normals.push(normal.x, normal.y, normal.z);
        skinIndices.push(boneFrom, boneTo, 0, 0);
        skinWeights.push(1 - handover, handover, 0, 0);
      }
    }

    for (let ring = 0; ring < RINGS; ring++) {
      const lower = first + ring * RADIAL;
      const upper = lower + RADIAL;
      for (let i = 0; i < RADIAL; i++) {
        const next = (i + 1) % RADIAL;
        indices.push(lower + i, upper + i, lower + next);
        indices.push(lower + next, upper + i, upper + next);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();

  // O descarte por frustum usa a esfera da POSE DE REPOUSO, e a animacao
  // desloca vertices para fora dela. Sem a folga, um personagem some da tela
  // um instante antes de sair de vista -- e o pior lugar para isso acontecer e
  // na borda, que e justamente onde se olha.
  if (geometry.boundingSphere) geometry.boundingSphere.radius *= 1.35;

  return geometry;
}

/** Constroi um esqueleto novo em T-pose. Um por personagem. */
function buildBones(): THREE.Bone[] {
  const index = new Map<string, number>();
  SKELETON.forEach((joint, i) => index.set(joint.name, i));

  const bones = SKELETON.map((joint) => {
    const bone = new THREE.Bone();
    bone.name = boneName(joint.name);
    bone.position.set(joint.x, joint.y, joint.z);
    return bone;
  });
  SKELETON.forEach((joint, i) => {
    if (joint.parent) bones[index.get(joint.parent)!]!.add(bones[i]!);
  });
  return bones;
}

/**
 * Uma instancia de personagem: malha ligada ao proprio esqueleto.
 *
 * Geometria e material vem de fora e sao compartilhados. So o esqueleto e
 * proprio -- e a razao de `SkinnedMesh` nao instanciar, medida e aceita em
 * `decisions/0011`.
 */
export function buildCharacter(
  geometry: THREE.BufferGeometry,
  material: THREE.Material
): THREE.SkinnedMesh {
  const bones = buildBones();
  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.add(bones[0]!);
  // Sem o `updateMatrixWorld`, o `Skeleton` calcula as inversas de bind a
  // partir de matrizes zeradas e o personagem nasce deformado, sem erro nenhum.
  mesh.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones));
  return mesh;
}

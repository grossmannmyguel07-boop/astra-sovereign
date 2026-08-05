import * as THREE from 'three';

/**
 * Humanoide procedural para medicao.
 *
 * Dono: **Debug Agent**.
 *
 * Existe porque nao ha nenhum `.glb` no projeto e a decisao de tecnica de
 * animacao precisa ser tomada **antes** da arte, nao depois. Um rig gerado em
 * codigo tem tres vantagens sobre esperar o modelo: e deterministico, nao tem
 * custo de download poluindo a medicao, e o orcamento e declarado em vez de
 * descoberto.
 *
 * O preco e que os numeros so valem para **este** orcamento. Se o personagem
 * real chegar com o dobro de triangulos, a medicao nao transfere. Por isso o
 * orcamento e constante nomeada aqui e aparece no relatorio.
 *
 * O esqueleto segue `docs/decisions/0008-contrato-rig-humanoid.md` osso por
 * osso: mesmos nomes, mesma hierarquia, mesma origem, mesma escala. E o mesmo
 * esqueleto que o modelo de verdade vai trazer, entao o custo medido aqui e o
 * custo que vamos pagar la.
 */

/**
 * Orcamento congelado provisoriamente. Ver `docs/06-benchmark.md`.
 *
 * Mudar qualquer um destes numeros invalida a comparacao com medicoes
 * anteriores -- por isso o `PROTOCOL` do harness precisa subir junto.
 */
export const TRIANGLE_BUDGET = 900;
export const TARGET_HEIGHT = 1.9;

/**
 * Resolucao da malha, calibrada para cair perto do orcamento.
 *
 * `RADIAL` engrossa a silhueta; `RINGS` subdivide **ao longo** do membro. Os
 * dois juntos dao `LIMBS * RINGS * RADIAL * 2` triangulos.
 *
 * Subdividir ao longo nao e enchimento para bater o numero: e o que um
 * personagem skinado de verdade tem. Com um anel so, a malha rasga na dobra do
 * cotovelo e do joelho, e o custo de deformacao por vertice -- justamente o que
 * este benchmark mede -- ficaria subestimado.
 */
const RADIAL = 8;
const RINGS = 5;

/**
 * Nome de osso como ele chega ao Three.js.
 *
 * A decisao 0008 manda exportar com o prefixo `mixamorig:`, e o arquivo
 * realmente sai assim. Mas **os dois pontos nunca chegam ao runtime**: o
 * `PropertyBinding` trata `:` como separador de caminho, entao
 * `mixamorig:LeftArm` seria lido como diretorio `mixamorig:` mais um no
 * chamado `LeftArm` -- que nao existe, e a trilha simplesmente nao amarra.
 * O erro sai como um aviso no console e a animacao fica parada, sem quebrar
 * nada, que e a pior forma de falhar.
 *
 * O `GLTFLoader` sabe disso e sanitiza os nomes ao carregar, dos dois lados:
 * osso e trilha. Usar o nome sanitizado aqui nao contorna o contrato -- e
 * reproduzir exatamente o que um `.glb` de verdade produz depois de carregado.
 */
function boneName(joint: string): string {
  return THREE.PropertyBinding.sanitizeNodeName(`mixamorig:${joint}`);
}

/**
 * Um osso do contrato: nome, pai e a posicao da junta em T-pose, em metros,
 * relativa ao pai. Origem entre os pes, +Y para cima, +Z para a frente.
 */
interface Joint {
  name: string;
  parent: string | null;
  x: number;
  y: number;
  z: number;
}

/**
 * Os 22 ossos da hierarquia obrigatoria da decisao 0008.
 *
 * Dedos sao explicitamente ignorados pelo contrato -- na escala em que o
 * personagem aparece na tela eles nao existem visualmente, e cada dedo custaria
 * uma matriz por frame por personagem.
 */
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

export const BONE_COUNT = SKELETON.length;

/**
 * Membros visiveis: cada um e um tronco de cone entre duas juntas.
 * `radius` e a espessura na base e no topo, em metros.
 */
interface Limb {
  from: string;
  to: string;
  base: number;
  top: number;
}

const LIMBS: Limb[] = [
  { from: 'Hips', to: 'Spine1', base: 0.15, top: 0.16 },
  { from: 'Spine1', to: 'Neck', base: 0.16, top: 0.1 },
  { from: 'Neck', to: 'Head', base: 0.06, top: 0.08 },

  { from: 'LeftArm', to: 'LeftForeArm', base: 0.07, top: 0.055 },
  { from: 'LeftForeArm', to: 'LeftHand', base: 0.055, top: 0.045 },
  { from: 'RightArm', to: 'RightForeArm', base: 0.07, top: 0.055 },
  { from: 'RightForeArm', to: 'RightHand', base: 0.055, top: 0.045 },

  { from: 'LeftUpLeg', to: 'LeftLeg', base: 0.1, top: 0.075 },
  { from: 'LeftLeg', to: 'LeftFoot', base: 0.075, top: 0.055 },
  { from: 'RightUpLeg', to: 'RightLeg', base: 0.1, top: 0.075 },
  { from: 'RightLeg', to: 'RightFoot', base: 0.075, top: 0.055 },
];

export interface HumanoidAsset {
  geometry: THREE.BufferGeometry;
  /**
   * Malha de referencia, ja ligada ao esqueleto em T-pose na origem.
   *
   * Cada personagem sai de `SkeletonUtils.clone` desta -- que e exatamente o
   * que o jogo vai fazer ao spawnar mobs de um `.glb`. Montar esqueleto na mao
   * mediria um caminho de codigo que o jogo nunca percorre, e ainda arrisca
   * errar a matriz de bind sem que nada acuse.
   */
  reference: THREE.SkinnedMesh;
  triangles: number;
  vertices: number;
  /** Bytes dos atributos de vertice. Compartilhados entre personagens. */
  geometryBytes: number;
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Posicao absoluta de cada junta em T-pose, para gerar a malha. */
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
 * Constroi a malha skinada e o esqueleto.
 *
 * A geometria e criada **uma vez** e compartilhada por todos os personagens:
 * e assim que se faz de verdade, e medir com uma copia por personagem inflaria
 * a memoria com um custo que o jogo nunca pagaria.
 */
export function buildHumanoid(material: THREE.Material): HumanoidAsset {
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

    // Base ortonormal em torno do eixo do membro. O vetor auxiliar troca
    // quando o membro ja e vertical, senao o produto vetorial degenera.
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

  const bones = SKELETON.map((joint) => {
    const bone = new THREE.Bone();
    bone.name = boneName(joint.name);
    bone.position.set(joint.x, joint.y, joint.z);
    return bone;
  });
  SKELETON.forEach((joint, i) => {
    if (joint.parent) bones[index.get(joint.parent)!]!.add(bones[i]!);
  });

  let geometryBytes = 0;
  for (const name of Object.keys(geometry.attributes)) {
    const attribute = geometry.attributes[name] as THREE.BufferAttribute;
    geometryBytes += attribute.array.byteLength;
  }
  if (geometry.index) geometryBytes += geometry.index.array.byteLength;

  // Ligar na origem, com as matrizes de mundo ja resolvidas. Sem o
  // `updateMatrixWorld`, o `Skeleton` calcula as inversas de bind a partir de
  // matrizes zeradas e a malha nasce deformada -- sem erro nenhum no console.
  const reference = new THREE.SkinnedMesh(geometry, material);
  reference.add(bones[0]!);
  reference.updateMatrixWorld(true);
  reference.bind(new THREE.Skeleton(bones));

  return {
    geometry,
    reference,
    triangles: indices.length / 3,
    vertices: positions.length / 3,
    geometryBytes,
  };
}

/**
 * Clipes procedurais.
 *
 * A decisao 0008 exige `idle`, `walk`, `run`, `attack`, `hit` e `die`. O que
 * custa em runtime nao e quantos clipes existem, e quantas **trilhas ativas** o
 * mixer avalia por frame -- entao os tres clipes de locomocao bastam para medir,
 * desde que o benchmark faca transicao entre eles.
 *
 * A transicao importa: e o momento caro, porque o mixer avalia dois clipes ao
 * mesmo tempo. Um benchmark que nunca cruza clipe mede um caso otimista.
 */
export function buildClips(): THREE.AnimationClip[] {
  return [
    locomotion('idle', 0.1, 2.4),
    locomotion('walk', 0.55, 1.1),
    locomotion('run', 1.0, 0.7),
  ];
}

/**
 * Confere que **toda** trilha de animacao encontra o osso que pretende mover.
 *
 * Existe por causa de um modo de falha que ja aconteceu aqui: um nome de osso
 * incompativel faz o Three.js imprimir um aviso e seguir em frente com a
 * animacao parada. O benchmark rodaria inteiro, sem erro nenhum, medindo
 * personagens congelados e reportando o custo de animacao como se fosse real.
 *
 * Numero errado com aparencia de certo e pior que erro. Entao aqui isso
 * **quebra**, alto, antes de qualquer medicao comecar.
 */
export function assertClipsBind(asset: HumanoidAsset, clips: THREE.AnimationClip[]): void {
  const known = new Set(asset.reference.skeleton.bones.map((bone) => bone.name));
  const missing: string[] = [];

  for (const clip of clips) {
    for (const track of clip.tracks) {
      const node = track.name.slice(0, track.name.lastIndexOf('.'));
      if (!known.has(node)) missing.push(`${clip.name}: ${track.name}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Trilhas sem osso correspondente (${missing.length}): ${missing.join(', ')}. ` +
        `Ossos disponiveis: ${[...known].join(', ')}`
    );
  }
}

/**
 * Um ciclo de locomocao: pernas e bracos alternados, tronco acompanhando.
 *
 * @param amplitude Quanto o membro gira. Zero seria parado.
 * @param duration Duracao do ciclo em segundos.
 */
function locomotion(name: string, amplitude: number, duration: number): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = [];
  const STEPS = 8;
  const times = new Float32Array(STEPS + 1);
  for (let i = 0; i <= STEPS; i++) times[i] = (i / STEPS) * duration;

  const AXIS_X = new THREE.Vector3(1, 0, 0);
  const AXIS_Y = new THREE.Vector3(0, 1, 0);
  const AXIS_Z = new THREE.Vector3(0, 0, 1);

  /**
   * @param rest Orientacao fixa aplicada antes do balanco.
   *
   * Os bracos precisam dela. Em T-pose eles apontam ao longo de X, entao girar
   * em torno de X so os torce no proprio eixo -- o esqueleto trabalha igual,
   * mas ninguem olhando acredita que a cena esta animando, e um benchmark em
   * que nao se confia nao serve de ferramenta permanente.
   *
   * Membro oposto anda meio ciclo adiantado: e o que faz ler como passo.
   */
  const swing = (
    bone: string,
    sign: number,
    scale: number,
    axis: THREE.Vector3,
    rest?: THREE.Quaternion
  ) => {
    const values = new Float32Array((STEPS + 1) * 4);
    const quaternion = new THREE.Quaternion();
    const spin = new THREE.Quaternion();
    for (let i = 0; i <= STEPS; i++) {
      const phase = (i / STEPS) * Math.PI * 2;
      spin.setFromAxisAngle(axis, Math.sin(phase) * amplitude * scale * sign);
      // `spin * rest` aplica o repouso primeiro e depois balanca em torno do
      // eixo do frame do pai, que e o que se quer. A ordem inversa balancaria
      // em torno de um eixo ja girado.
      if (rest) quaternion.multiplyQuaternions(spin, rest);
      else quaternion.copy(spin);
      values[i * 4] = quaternion.x;
      values[i * 4 + 1] = quaternion.y;
      values[i * 4 + 2] = quaternion.z;
      values[i * 4 + 3] = quaternion.w;
    }
    tracks.push(
      new THREE.QuaternionKeyframeTrack(`${boneName(bone)}.quaternion`, times, values)
    );
  };

  // Traz o braco da T-pose para o lado do corpo. Sem isto o personagem anda de
  // bracos abertos, o que denuncia que o clipe e improvisado.
  const armDown = (side: 1 | -1) => new THREE.Quaternion().setFromAxisAngle(AXIS_Z, side * 1.4);

  swing('LeftUpLeg', 1, 1, AXIS_X);
  swing('RightUpLeg', -1, 1, AXIS_X);
  swing('LeftLeg', 1, 0.5, AXIS_X);
  swing('RightLeg', -1, 0.5, AXIS_X);
  swing('LeftArm', -1, 0.8, AXIS_X, armDown(-1));
  swing('RightArm', 1, 0.8, AXIS_X, armDown(1));
  swing('LeftForeArm', -1, 0.3, AXIS_Y);
  swing('RightForeArm', 1, 0.3, AXIS_Y);
  swing('Spine1', 1, 0.15, AXIS_Y);
  swing('Neck', -1, 0.1, AXIS_Y);

  return new THREE.AnimationClip(name, duration, tracks);
}

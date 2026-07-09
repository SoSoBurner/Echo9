/**
 * POLYLOGUE SCENE REGISTRY (Sprint P2 — Q16 Option 3).
 *
 * Separate registry, optional linkage: a TaskNode points here via its plain
 * `polylogueSceneId?` string; the activation seam (P7, outside resolveChoice)
 * resolves the id against this array. Follows the aggregator pattern of
 * `@content/index.ts` / `@content/moduleAbilities/index.ts`.
 */
import type { PolylogueScene } from '@schemas/polylogueScene.schema'
import { W01_MERCY_MARGIN_POLYLOGUE } from './w01-mercy-margin.polylogue'

export const ALL_POLYLOGUE_SCENES: readonly PolylogueScene[] = [
  W01_MERCY_MARGIN_POLYLOGUE,
] as const

/** Registry lookup — returns undefined for unknown ids (loose linkage). */
export function findPolylogueScene(
  sceneId: string,
): PolylogueScene | undefined {
  return ALL_POLYLOGUE_SCENES.find((scene) => scene.id === sceneId)
}

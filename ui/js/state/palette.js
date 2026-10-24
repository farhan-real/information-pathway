/**
 * Dynamic Palette Generator: Computes deterministic, distinct colors
 * for any group IDs across any scenario without hardcoded names.
 */

const PALETTE = [
  '#0ea5e9', '#f97316', '#a855f7', '#10b981', '#ec4899',
  '#f59e0b', '#06b6d4', '#84cc16', '#e11d48', '#8b5cf6'
];

export function getGroupColor(groupId) {
  if (!groupId) return '#64748b';
  let hash = 0;
  for (let i = 0; i < groupId.length; i++) {
    hash = groupId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

export function buildGroupGradientLegend(groups) {
  const groupIds = Object.keys(groups || {});
  if (groupIds.length === 0) {
    return {
      title: "Affiliation Cliques",
      bar: "linear-gradient(90deg, #64748b 0%, #334155 100%)",
      min: "None",
      max: "None"
    };
  }

  const colors = groupIds.map(gid => getGroupColor(gid));
  const stops = colors.map((col, idx) => {
    const pct = Math.round((idx / (colors.length - 1 || 1)) * 100);
    return `${col} ${pct}%`;
  }).join(", ");

  const firstName = groups[groupIds[0]]?.name || groupIds[0];
  const lastName = groups[groupIds[groupIds.length - 1]]?.name || groupIds[groupIds.length - 1];

  return {
    title: "Affiliation Cliques",
    bar: `linear-gradient(90deg, ${stops})`,
    min: firstName.split(' ')[0],
    max: lastName.split(' ')[0]
  };
}
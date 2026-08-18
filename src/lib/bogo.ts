/**
 * Buy X get Y pricing for guest carts.
 *
 * This is a deliberate 1:1 mirror of the server engine in
 * `backend/apps/discounts/services/bogo_service.py`. Guests have no server-side
 * cart, so their totals have to be priced in the browser — but the moment they
 * sign in or check out, the server recomputes from the same rules and its answer
 * wins. Keep the two in step: any change to the algorithm here needs the same
 * change there, and the Python test suite (`apps/discounts/tests_bogo.py`) is the
 * specification for both.
 *
 * Money is handled in integer cents throughout to avoid float drift; the Python
 * side uses Decimal for the same reason.
 */

export interface BogoLine {
  key: string;
  /** Unit price in major units (e.g. 12.99). */
  unitPrice: number;
  quantity: number;
  productId?: number;
  bundleId?: number;
  categoryIds?: number[];
}

export interface BogoScope {
  productIds?: number[];
  bundleIds?: number[];
  categoryIds?: number[];
}

export interface BogoOffer {
  id: number;
  name: string;
  buyQuantity: number;
  getQuantity: number;
  /** 100 = reward units are free, 50 = half price. */
  rewardPercentage: number;
  maxApplications?: number | null;
  minimumOrderAmount?: number;
  eligibleScope?: BogoScope;
  rewardScope?: BogoScope;
}

export interface BogoOutcome {
  offer: BogoOffer;
  discountAmount: number;
  freeUnits: number;
  applications: number;
  lineAllocations: Record<string, number>;
}

const toCents = (value: number) => Math.round(value * 100);
const fromCents = (cents: number) => cents / 100;

function isEmptyScope(scope?: BogoScope): boolean {
  if (!scope) return true;
  return (
    !scope.productIds?.length && !scope.bundleIds?.length && !scope.categoryIds?.length
  );
}

function scopeMatches(scope: BogoScope | undefined, line: BogoLine): boolean {
  if (isEmptyScope(scope)) return true;
  if (line.productId != null && scope?.productIds?.includes(line.productId)) return true;
  if (line.bundleId != null && scope?.bundleIds?.includes(line.bundleId)) return true;
  return Boolean(
    scope?.categoryIds?.length &&
      line.categoryIds?.some((categoryId) => scope.categoryIds?.includes(categoryId))
  );
}

/** One entry per physical unit, as [unitPriceInCents, lineKey]. */
function expandUnits(lines: BogoLine[]): Array<[number, string]> {
  const units: Array<[number, string]> = [];

  for (const line of lines) {
    const cents = toCents(line.unitPrice);
    // A zero-priced or empty row can neither fund nor receive a reward.
    if (line.quantity <= 0 || cents <= 0) continue;
    for (let i = 0; i < line.quantity; i += 1) units.push([cents, line.key]);
  }

  return units;
}

export function computeBogoDiscount(lines: BogoLine[], offer: BogoOffer): BogoOutcome | null {
  if (offer.buyQuantity < 1 || offer.getQuantity < 1) return null;
  if (offer.rewardPercentage <= 0) return null;

  const eligibleUnits = expandUnits(lines.filter((line) => scopeMatches(offer.eligibleScope, line)));
  if (!eligibleUnits.length) return null;

  const separateRewardPool = !isEmptyScope(offer.rewardScope);

  let rewardUnits: Array<[number, string]>;
  let applications: number;

  if (separateRewardPool) {
    rewardUnits = expandUnits(lines.filter((line) => scopeMatches(offer.rewardScope, line)));
    // Independent pools: every full group of buyQuantity earns an application.
    applications = Math.floor(eligibleUnits.length / offer.buyQuantity);
  } else {
    // Shared pool: "buy 2 get 1" consumes 3 units, so 3 must be in the cart.
    rewardUnits = eligibleUnits;
    applications = Math.floor(eligibleUnits.length / (offer.buyQuantity + offer.getQuantity));
  }

  if (applications < 1) return null;

  if (offer.maxApplications != null) {
    applications = Math.min(applications, offer.maxApplications);
  }

  const freeUnits = Math.min(applications * offer.getQuantity, rewardUnits.length);
  if (freeUnits < 1) return null;

  // Cheapest first, so the offer never gives away the most expensive item while
  // a cheaper qualifying one is in the cart.
  const cheapest = [...rewardUnits].sort((a, b) => a[0] - b[0]).slice(0, freeUnits);

  const rate = offer.rewardPercentage / 100;
  const lineAllocations: Record<string, number> = {};
  let totalCents = 0;

  for (const [unitCents, key] of cheapest) {
    const amount = Math.round(unitCents * rate);
    totalCents += amount;
    lineAllocations[key] = (lineAllocations[key] ?? 0) + fromCents(amount);
  }

  return {
    offer,
    discountAmount: fromCents(totalCents),
    freeUnits,
    applications,
    lineAllocations,
  };
}

/**
 * The most valuable applicable offer, matching the server's policy.
 *
 * Offers are never summed — two overlapping promotions would otherwise both
 * claim the same physical units and discount them twice.
 */
export function bestBogoOutcome(
  lines: BogoLine[],
  offers: BogoOffer[],
  subtotal: number
): BogoOutcome | null {
  let best: BogoOutcome | null = null;

  for (const offer of offers) {
    if (offer.minimumOrderAmount != null && subtotal < offer.minimumOrderAmount) continue;

    const outcome = computeBogoDiscount(lines, offer);
    if (!outcome) continue;
    if (!best || outcome.discountAmount > best.discountAmount) best = outcome;
  }

  return best;
}

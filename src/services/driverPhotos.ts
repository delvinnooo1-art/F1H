/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getImage } from "./imageSourceSystem";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getDriverPortrait(driverNumber: number | string, fallback?: string): string {
  return getImage('standing', driverNumber);
}

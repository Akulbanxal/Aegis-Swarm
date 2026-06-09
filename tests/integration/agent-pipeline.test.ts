/**
 * Integration Test: Full Agent Pipeline
 * Tests the complete Sentinel → Analyst → Responder chain
 * using simulated agent results (no live Somnia network required).
 *
 * TODO: Add live network tests in Phase 3.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { simulateSentinelResult } from '../../agents/src/sentinel/SentinelAgent.js'
import { simulateAnalystResult } from '../../agents/src/analyst/AnalystAgent.js'
import { simulateResponderResult } from '../../agents/src/responder/ResponderAgent.js'

describe('Agent Pipeline — Threat Routing', () => {
  describe('Low severity path', () => {
    it('should route to NO_ACTION when severity < 10', () => {
      const sentinel = simulateSentinelResult('low')
      expect(sentinel.knownAttacker).toBe(false)
      expect(sentinel.attackerRepScore).toBeLessThan(40)

      const analyst = simulateAnalystResult('UNKNOWN', 5)
      expect(analyst.severity).toBeLessThan(10)
      expect(analyst.recommendedAction).toBe('NO_ACTION')

      const responder = simulateResponderResult(5)
      expect(responder.finalAction).toBe('NO_ACTION')
      expect(responder.humanResponseRequired).toBe(false)
    })
  })

  describe('Medium severity path', () => {
    it('should route to RATE_LIMIT when severity is 40-79', () => {
      const analyst = simulateAnalystResult('FLASH_LOAN', 60)
      expect(analyst.severity).toBeGreaterThanOrEqual(40)
      expect(analyst.severity).toBeLessThan(80)
      expect(analyst.recommendedAction).toBe('RATE_LIMIT')

      const responder = simulateResponderResult(60)
      expect(responder.alertLevel).toBe('WARNING')
      expect(responder.escalateToGovernance).toBe(false)
    })
  })

  describe('Critical severity path', () => {
    it('should route to HARD_PAUSE when severity >= 80', () => {
      const sentinel = simulateSentinelResult('high')
      expect(sentinel.knownAttacker).toBe(true)
      expect(sentinel.attackerRepScore).toBeGreaterThanOrEqual(80)

      const analyst = simulateAnalystResult('REENTRANCY', 91)
      expect(analyst.severity).toBeGreaterThanOrEqual(80)
      expect(analyst.immediateRisk).toBe(true)
      expect(analyst.recommendedAction).toBe('HARD_PAUSE')

      const responder = simulateResponderResult(91)
      expect(responder.finalAction).toBe('HARD_PAUSE')
      expect(responder.alertLevel).toBe('CRITICAL')
      expect(responder.humanResponseRequired).toBe(true)
    })

    it('should escalate to governance when severity >= 90', () => {
      const responder = simulateResponderResult(92)
      expect(responder.escalateToGovernance).toBe(true)
    })
  })
})

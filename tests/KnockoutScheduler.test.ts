import { expect, test } from "vitest"

import { KnockoutScheduler } from "@/data/KnockoutScheduler"

test("computes groups of fixtures correctly for fixed draw", () => {
    const scheduler = new KnockoutScheduler(false)

    let x = scheduler.computeFixturesPerRound(2)
    expect(x).toHaveLength(1)
    expect(x[0]).toEqual(1)

    x = scheduler.computeFixturesPerRound(3)
    expect(x).toHaveLength(1)
    expect(x[0]).toEqual(2)

    x = scheduler.computeFixturesPerRound(4)
    expect(x).toHaveLength(1)
    expect(x[0]).toEqual(3)

    x = scheduler.computeFixturesPerRound(5)
    expect(x).toHaveLength(1)
    expect(x[0]).toEqual(4)

    x = scheduler.computeFixturesPerRound(8)
    expect(x).toHaveLength(1)
    expect(x[0]).toEqual(7)

    x = scheduler.computeFixturesPerRound(9)
    expect(x).toHaveLength(1)
    expect(x[0]).toEqual(8)
})

test("computes groups of fixtures correctly for random draw", () => {
    const scheduler = new KnockoutScheduler(true)

    let x = scheduler.computeFixturesPerRound(2)
    expect(x).toHaveLength(1)
    expect(x[0]).toEqual(1)

    x = scheduler.computeFixturesPerRound(3)
    expect(x).toHaveLength(2)
    expect(x[0]).toEqual(1)
    expect(x[1]).toEqual(1)

    x = scheduler.computeFixturesPerRound(4)
    expect(x).toHaveLength(2)
    expect(x[0]).toEqual(2)
    expect(x[1]).toEqual(1)

    x = scheduler.computeFixturesPerRound(5)
    expect(x).toHaveLength(3)
    expect(x[0]).toEqual(1)
    expect(x[1]).toEqual(2)
    expect(x[2]).toEqual(1)

    x = scheduler.computeFixturesPerRound(8)
    expect(x).toHaveLength(3)
    expect(x[0]).toEqual(4)
    expect(x[1]).toEqual(2)
    expect(x[2]).toEqual(1)

    x = scheduler.computeFixturesPerRound(9)
    expect(x).toHaveLength(4)
    expect(x[0]).toEqual(1)
    expect(x[1]).toEqual(4)
    expect(x[2]).toEqual(2)
    expect(x[3]).toEqual(1)

    x = scheduler.computeFixturesPerRound(16)
    expect(x).toHaveLength(4)
    expect(x[0]).toEqual(8)
    expect(x[1]).toEqual(4)
    expect(x[2]).toEqual(2)
    expect(x[3]).toEqual(1)

    x = scheduler.computeFixturesPerRound(17)
    expect(x).toHaveLength(5)
    expect(x[0]).toEqual(1)
    expect(x[1]).toEqual(8)
    expect(x[2]).toEqual(4)
    expect(x[3]).toEqual(2)
    expect(x[4]).toEqual(1)
})

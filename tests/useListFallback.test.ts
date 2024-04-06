import { expect, test } from "vitest"

import { useListFallback } from "@/composables/useListFallback"

const { getFallback } = useListFallback()

test("falls back to the default element if no options are available", () => {
    const fallback = getFallback([], 1, 0)

    expect(fallback).toBe(0)
})

test("falls back to the default element if all options are disabled", () => {
    const options = [
        {
            value: 0,
            disabled: true,
        },
        {
            value: 1,
            disabled: true,
        },
    ]

    const fallback = getFallback(options, 1, 0)

    expect(fallback).toBe(0)
})

test("falls back to the previous element of the list if the expected option is disabled", () => {
    const options = [
        {
            value: 0,
            disabled: false,
        },
        {
            value: 1,
            disabled: false,
        },
        {
            value: 2,
            disabled: true,
        },
    ]

    const fallback = getFallback(options, 2, 0)

    expect(fallback).toBe(1)
})

test("retains the index of the selected option if the expected option is disabled", () => {
    const options = [
        {
            value: 0,
            disabled: false,
        },
        {
            value: 1,
            disabled: true,
        },
        {
            value: 2,
            disabled: false,
        },
        {
            value: 3,
            disabled: false,
        },
    ]

    const fallback = getFallback(options, 1, 0)

    expect(fallback).toBe(2)
})

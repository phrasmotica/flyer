import { computed, ref } from "vue"

import type { Phase } from "@/data/Phase"

export const usePlayers = (p: Phase | null) => {
    const phase = ref(p)

    const players = computed(() => phase.value?.players || [])

    const getPlayer = (id: string) => players.value.find(p => p.id === id)

    const getPlayerName = (id: string) => getPlayer(id)?.name

    return {
        players,

        getPlayer,
        getPlayerName,
    }
}

import {ref, computed, watch} from "vue";
import axios from "axios";
import type { ApiCharacter } from "../../../types.ts";
import { useCharactersStore } from "../store/characterStore.ts";

export function useCharacters() {
    const store = useCharactersStore();

    const loading = ref(false);
    const error = ref<string | null>(null);

    const nameSearch = ref<string>('')
    const sortBy = ref<'name' | 'episodes' | null>(null)
    const sortDir = ref<'asc' | 'desc'>('asc')
    const status = ref<'All' | 'Alive' | 'Dead' | 'unknown'>('All')
    const locationFilter = ref<string>('')

    async function fetchPage(page = 1, append = false) {
        loading.value = true
        error.value = null
        try {
            const params: any = { page }
            if (nameSearch.value) params.name = nameSearch.value
            if (status.value !== 'All') params.status = status.value
            const res = await axios.get('https://rickandmortyapi.com/api/character', { params })
            const data = res.data
            const items: ApiCharacter[] = data.results ?? []
            if (append) {
                store.appendCharacter(items, page, data.info.pages)
            } else {
                store.setCharacters(items, page, data.info.pages)
            }
        } catch (e: any) {
            if (e.response?.status === 404) {
                if (!append) store.setCharacters([], 1, 0)
            } else {
                error.value = e.message || 'Fetch error'
            }
        } finally {
            loading.value = false
        }
    }

    function applyLocalFilters(items: ApiCharacter[]) {
        let out = items.slice()
        if (locationFilter.value) {
            out = out.filter(c => c.location?.name?.toLowerCase().includes(locationFilter.value!.toLowerCase()))
        }
        if (sortBy.value === 'name' ) {
            out.sort((a, b) => {
                const r = a.name.localeCompare(b.name)
                return sortDir.value === 'asc' ? r : -r
            })
        } else if (sortBy.value === 'episodes' ) {
            out.sort((a, b) => {
                const r = a.episode.length - b.episode.length
                return sortDir.value === 'asc' ? r : r
            })
        }
        return out
    }

    const filtered = computed(() => applyLocalFilters(store.characters))
    watch([sortBy, sortDir], () => {

    })

    return {
        store,
        loading,
        error,
        nameSearch,
        sortBy,
        sortDir,
        status,
        locationFilter,
        fetchPage,
        filtered
    }
}

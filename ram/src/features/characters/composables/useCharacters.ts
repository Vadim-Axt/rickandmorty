import {ref, computed} from "vue";
import axios from "axios";
import type { ApiCharacter, ApiLocation } from "../../../types.ts";
import { useCharactersStore } from "../store/characterStore.ts";

// общее состояние фильтров/сортировки и загрузки для всех использований useCharacters
const loading = ref(false);
const error = ref<string | null>(null);

const nameSearch = ref<string>('');
const status = ref<'All' | 'Alive' | 'Dead' | 'unknown'>('All');
const sortBy = ref<'name' | 'episodes'>('episodes');
const sortDir = ref<'asc' | 'desc'>('desc');
const locationFilter = ref<string>('');

function applyFiltersAndSort(items: ApiCharacter[]) {
    let out = items.slice();

    if (nameSearch.value.trim()) {
        const q = nameSearch.value.trim().toLocaleLowerCase();
        out = out.filter(c => c.name.toLocaleLowerCase().includes(q));
    }
    
    if (status.value !== 'All') {
        out = out.filter(c => c.status === status.value);
    }

    out.sort((a, b) => {
        let r: number;

        if (sortBy.value === 'episodes') {
            r = a.episode.length - b.episode.length;
        } else {
            r = a.name.localeCompare(b.name);
        }

        return sortDir.value === 'asc' ? r : -r;
    });

    return out;
}

export function useCharacters() {
    const store = useCharactersStore();

    async function fetchByLocation() {
        try {
            const locRes = await axios.get('https://rickandmortyapi.com/api/location', {
                params: { name: locationFilter.value }
            });
            const locData = locRes.data;
            const locations: ApiLocation[] = locData.results ?? [];

            const locationQuery = locationFilter.value.trim().toLocaleLowerCase();

            const matchedLocations = locations.filter(l =>
                l.name.toLocaleLowerCase().includes(locationQuery)
            );

            const ids = Array.from(
                new Set(
                    matchedLocations
                        .flatMap(l => l.residents.map(url => Number(url.split('/').pop())))
                        .filter(Boolean)
                )
            ) as number[];

            if (!ids.length) {
                store.setCharacters([], 1, 0);
                return;
            }

            const chunks: number[][] = [];
            for (let i = 0; i < ids.length; i += 20) {
                chunks.push(ids.slice(i, i + 20));
            }

            const allCharacters: ApiCharacter[] = [];
            for (const chunk of chunks) {
                const charRes = await axios.get(`https://rickandmortyapi.com/api/character/${chunk.join(',')}`);
                const data = charRes.data;
                const part: ApiCharacter[] = Array.isArray(data) ? data : [data];
                allCharacters.push(...part);
            }

            const totalPages = Math.max(1, Math.ceil(allCharacters.length / 24));
            store.setCharacters(allCharacters, 1, totalPages);
        } catch (e: any) {
            if (e.response?.status === 404) {
                store.setCharacters([], 1, 0);
            } else {
                error.value = e.message || 'Fetch error';
            }
        }
    }

    async function fetchPage(page = 1) {
        loading.value = true;
        error.value = null;
        try {
            if (locationFilter.value.trim()) {
                await fetchByLocation();
                store.currentPage = page;
                return;
            }

            const allCharacters: ApiCharacter[] = [];

            let url: string | null = 'https://rickandmortyapi.com/api/character';
            let firstRequest = true;

            while (url) {
                let res;
                if (firstRequest) {
                    const params: any = {};
                    if (nameSearch.value.trim()) params.name = nameSearch.value.trim();
                    if (status.value !== 'All') params.status = status.value;

                    res = await axios.get(url, { params });
                    firstRequest = false;
                } else {
                    res = await axios.get(url);
                }

                const data: { info?: { next?: string | null }, results?: ApiCharacter[] } = res.data;
                const items: ApiCharacter[] = data.results ?? [];
                allCharacters.push(...items);

                url = data.info?.next || null;
            }

            const totalPages = Math.max(1, Math.ceil(allCharacters.length / 24));
            store.setCharacters(allCharacters, page, totalPages);
        } catch (e: any) {
            if (e.response?.status === 404) {
                store.setCharacters([], 1, 0);
            } else {
                error.value = e.message || 'Fetch error';
            }
        } finally {
            loading.value = false;
        }
    }

    const filtered = computed(() => applyFiltersAndSort(store.characters));

    return {
        store,
        loading,
        error,
        nameSearch,
        status,
        sortBy,
        sortDir,
        locationFilter,
        fetchPage,
        filtered,
    };
}

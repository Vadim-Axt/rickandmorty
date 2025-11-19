import { defineStore } from "pinia";
import { ref } from "vue";
import type { ApiCharacter } from "../../../types.ts";

export const useCharactersStore = defineStore('Characters', () => {
    const characters = ref<ApiCharacter[]>([])
    const totalPages = ref<number>(0);
    const currentPage = ref<number> (1);

    function setCharacters(items: ApiCharacter[], page = 1, pages = 0): void {
        characters.value = items
        currentPage.value = page
        totalPages.value = pages
    }
    function appendCharacter(items: ApiCharacter[], page = 1, pages = 0): void {
        const ids = new Set(characters.value.map(c => c.id))
        characters.value.push(...items.filter(i => !ids.has(i.id)))
        currentPage.value = page
        totalPages.value = pages

    }
    function clear() {  1
        characters.value = []
        currentPage.value = 1
        totalPages.value = 0
    }


    return {
        characters,
        totalPages,
        currentPage,
        setCharacters,
        appendCharacter,
        clear

    }
}
)
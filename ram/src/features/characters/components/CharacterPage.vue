<script lang="ts" setup>
import { computed } from 'vue'
import CharacterCard from '../components/CharacterCard.vue'
import CharactersControls from '../components/CharacterControls.vue'
import { useCharacters } from "../composables/useCharacters.ts";
import { onMounted } from 'vue'

const {
  store,
  loading,
  error,
  fetchPage,
  filtered
} = useCharacters()

onMounted(() => {
  fetchPage(1)
})


function gotoPage(p: number) {
  if (p < 1 || p > store.totalPages) return
  store.currentPage = p
}

function loadMore() {
  const next = store.currentPage + 1
  if (next <= store.totalPages) {
    store.currentPage = next
  }
}

const pagedToShow = computed(() => {
  const pageSize = 24
  const end = store.currentPage * pageSize
  return filtered.value.slice(0, end)
})

const pagesToShow = computed(() => {
  const pages: number[] = []
  const total = store.totalPages || 1
  const current = store.currentPage || 1
  const maxVisible = 5

  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = start + maxVisible - 1

  if (end > total) {
    end = total
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>

<template>
  <div class="container py-4">
    <h2 class="mb-4">Rick and Morty — Персонажи</h2>

    <CharactersControls />

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-if="!loading && filtered.length === 0" class="text-muted">Ничего не найдено.</div>

    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
      <div class="col" v-for="c in pagedToShow" :key="c.id">
        <CharacterCard :character="c" />
      </div>
    </div>

    <!-- pagination controls -->
    <nav v-if="store.totalPages > 1" class="mt-4 variable-area ">
      <ul class="pagination">
        <li class="page-item" :class="{disabled: store.currentPage === 1}">
          <button class="page-link" @click="gotoPage(store.currentPage - 1)" :disabled="store.currentPage === 1">Prev</button>
        </li>
        <li class="page-item" v-for="p in pagesToShow" :key="p" :class="{active: p === store.currentPage}">
          <button class="page-link" @click="gotoPage(p)">{{ p }}</button>
        </li>
        <li class="page-item" :class="{disabled: store.currentPage === store.totalPages}">
          <button class="page-link" @click="gotoPage(store.currentPage + 1)" :disabled="store.currentPage === store.totalPages">Next</button>
        </li>
      </ul>
    </nav>

    <div class="text-center mt-3">
      <button v-if="store.currentPage < store.totalPages && !loading" class="btn btn-outline-primary" @click="loadMore">Загрузить ещё</button>
    </div>
  </div>
</template>

<style scoped>
  .variable-area {
    width:  100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }
</style>


<script setup lang="ts">
  import { defineProps } from "vue";
  import type {ApiCharacter} from "../../../types.ts";
  defineProps<{ character: ApiCharacter }>()
</script>

<template>
  <div class="card h-100">
    <img :src="character.image" class="card-img-top" :alt="character.name" />
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ character.name }}</h5>
      <p class="mb-1"><strong>Вид:</strong> {{ character.species }}</p>
      <p class="mb-1"><strong>Статус:</strong> {{ character.status }}</p>
      <p class="mb-1"><strong>Откуда:</strong> {{ character.origin?.name || '—' }}</p>
      <p class="mb-0 mt-auto"><strong>Эпизодов:</strong> {{ character.episode.length }}</p>
    </div>
  </div>
</template>

<style scoped>

</style>
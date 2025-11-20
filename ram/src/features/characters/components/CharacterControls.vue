<script lang="ts" setup>
import { useCharacters } from '../composables/useCharacters.ts'

const {
  nameSearch,
  status,
  sortBy,
  sortDir,
  locationFilter,
  fetchPage,
} = useCharacters()

function onSearch() {
  fetchPage(1)
}

function onFilter() {
  fetchPage(1)
}

function onSort() {
  // сортировка применяется реактивно через computed filtered,
  // поэтому повторный запрос к API не требуется
}

function onLocationInput() {
  fetchPage(1)
}
</script>



<template>
  <div class="row g-2 align-items-center mb-3">
    <div class="col-md-4">
      <input
          v-model="nameSearch"
          @input="onSearch"
          type="search"
          class="form-control"
          placeholder="Поиск по имени"
      />
    </div>

    <div class="col-md-2">
      <select v-model="status" @change="onFilter" class="form-select">
        <option value="All">Все статусы</option>
        <option value="Alive">Жив</option>
        <option value="Dead">Мертв</option>
        <option value="unknown">Неизвестно</option>
      </select>
    </div>

    <div class="col-md-2">
      <select v-model="sortBy" @change="onSort" class="form-select">
        <option value="name">Сортировать: по имени</option>
        <option value="episodes">Сортировать: по кол-ву эпизодов</option>
      </select>
    </div>

    <div class="col-md-2">
      <select v-model="sortDir" @change="onSort" class="form-select">
        <option value="asc">По возрастанию</option>
        <option value="desc">По убыванию</option>
      </select>
    </div>

    <div class="col-md-2">
      <!-- ключевое исправление: привязка напрямую к locationFilter -->
      <input
          v-model="locationFilter"
          @input="onLocationInput"
          class="form-control"
          placeholder="Фильтр по локации"
      />
    </div>
  </div>
</template>


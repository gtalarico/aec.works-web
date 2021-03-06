<template>
  <div class="wrapper">
    <div class="content relative">
      <div v-if="isLoading" class="loader-overlay">
        <Loader />
      </div>

      <CompanyCard
        v-for="company in items"
        :key="company.id"
        v-bind="{ company }"
        @hashtagClick="handleHashtagClick"
      />
      <div v-if="items.length">
        <Pagination :num-pages="numPages" @click="handlePageClick"></Pagination>
        <p class="mt-1 sans small muted">
          Showing Page {{ $route.query.page || 1 }} of {{ numPages }} ({{ count }}
          {{ count === 1 ? 'company' : 'companies' }})
        </p>
      </div>
      <div v-if="!items.length && !isLoading">
        <p class="mt-1 sans small muted">No Results</p>
      </div>
    </div>
    <div class="sidebar">
      <TextInput
        v-model="searchQuery"
        icon="search"
        placeholder="search"
        @input="handleSearchInput"
      />
      <label for="input-hashtags" class="mt-1">Hashtags</label>
      <HashtagInput :initial-tags="initialQueryHashtags" @changed="handleHashtagFilterChanged" />

      <!-- Sorting -->
      <div class="mt-1 mb-2">
        <Sorting :sorting-options="sortingOptions" @sort="refetch" />
      </div>

      <p class="mt-3 small">
        <strong>aec.works</strong>
        is a curated list of innovative AEC companies and startups.
        <br />
        <a href="/about">read more</a>
      </p>
      <!-- TODO see all hashtags -->
      <div v-if="false" class="mt-1">
        <Button :kind="'text'">See All Hashtags</Button>
      </div>

      <div class="mt-2 mb-2">
        <Button class="mr-0" @click="handleAdd">
          {{ userIsEditor ? 'Add' : 'Suggest' }} Company
        </Button>
      </div>

      <div v-if="userIsEditor" class="mt-1 mb-2">
        <StatusFilters :options="statusFilterOptions" @filtered="refetch" />
      </div>
    </div>
  </div>
</template>

<script>
import StatusFilters from '../components/StatusFilters.vue'
import { USERS } from '@/store/users'
import Button from '../components/forms/Button.vue'
import Pagination from '../components/Pagination.vue'
import HashtagInput from '../components/forms/HashtagInput.vue'
import Loader from '../components/Loader.vue'
import Sorting from '../components/Sorting.vue'
import TextInput from '../components/forms/TextInput.vue'
import api from '@/api'
import CompanyCard from '@/components/CompanyCard'
import { popQuery, debounce } from '@/utils'
import { bus, EVENTS } from '@/events'
import { waitForLogin } from '@/mixins'
import { ModerationStatus } from '@/models.ts'

export default {
  name: 'CompanyList',
  metaInfo: {
    title: 'Companies',
  },
  components: {
    CompanyCard,
    TextInput,
    Sorting,
    Loader,
    HashtagInput,
    Button,
    Pagination,
    StatusFilters,
  },
  props: {
    search: {
      type: String,
      default: '',
    },
    hashtags: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: ModerationStatus.APPROVED,
    },
  },
  data() {
    return {
      PAGE_SIZE: 10,
      numPages: 1,
      hasMore: false,
      count: 0,
      items: [],
      isLoading: true,
      searchQuery: '',
      initialQueryHashtags: [],
      sortingOptions: ['claps', 'name', 'updated'],
      statusFilterOptions: Object.values(ModerationStatus),
    }
  },
  computed: {
    userIsEditor() {
      return this.$store.getters[USERS.IS_EDITOR]
    },
  },
  created() {
    if (this.hashtags) {
      this.initialQueryHashtags = this.hashtags.split(',').filter((i) => i.length)
    }
    if (this.search) {
      this.searchQuery = this.search
    }
    if (!this.$route.query.sort) {
      this.$router
        .replace({ query: { ...this.$route.query, sort: this.sortingOptions[2] } })
        .catch(() => {})
    }
    const pageNumber = this.$route.query.page || 1
    this.fetchItems(pageNumber)
  },
  methods: {
    refetch() {
      this.$router.replace({ query: { ...this.$route.query, page: 1 } }).catch(() => {})
      this.fetchItems(0)
    },

    async fetchItems(pageNumber) {
      this.isLoading = true
      let query = {
        page: pageNumber,
        hashtags: this.hashtags,
        search: this.searchQuery,
        sort: this.$route.query.sort,
        reverse: this.$route.query.reverse,
        status: this.status,
      }
      // Remove null/undefined
      query = Object.entries(query).reduce((a, [k, v]) => (v ? ((a[k] = v), a) : a), {})

      const { results, count, next } = await api.getCompanies(query)
      this.numPages = Math.ceil(count / this.PAGE_SIZE)
      this.items = results
      this.count = count
      this.hasMore = next !== null
      this.isLoading = false
    },

    handleSearchInput: debounce(function (query) {
      if (query) {
        this.$router.replace({ query: { ...this.$route.query, search: query } }).catch(() => {})
      } else {
        popQuery(this.$router, this.$route.query, 'search')
      }
      this.refetch()
    }, 200),

    handleHashtagFilterChanged(tags) {
      if (tags.length) {
        const hashtagStr = tags.join(',')
        this.$router
          .replace({ query: { ...this.$route.query, hashtags: hashtagStr } })
          .catch(() => {})
      } else {
        popQuery(this.$router, this.$route.query, 'hashtags')
      }
      this.$nextTick(() => this.refetch())
    },

    handleHashtagClick(slug) {
      bus.$emit(EVENTS.HASHTAG_CLICKED, slug)
    },

    async handleAdd() {
      await waitForLogin()
      this.$router.push({ name: 'CompanyNew' })
    },

    handlePageClick(pageNumber) {
      this.$router.replace({ query: { ...this.$route.query, page: pageNumber } })
      this.items = []
      this.fetchItems(pageNumber)
    },
  },
}
</script>

<style lang="scss" scoped>
.sidebar {
  @include for-large-up {
    text-align: right;
  }
}

.loader-overlay {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  padding-top: 4rem;
}
</style>

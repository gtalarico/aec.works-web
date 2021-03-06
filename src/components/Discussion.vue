<template>
  <div class="discussion">
    <h3 class="mb-2">{{ count || 0 }} {{ count == 1 ? 'comment' : 'comments' }}</h3>

    <Comment
      v-for="(comment, index) in comments"
      :key="comment.id"
      v-bind="{ threadId, comment, index }"
    />
    <Loader v-if="isLoading" />
    <Button
      v-if="hasMore"
      kind="text"
      class="mb-3"
      aria-label="load more comments"
      @click="fetchItems(offset)"
    >
      Load More Comments
    </Button>
    <CommentReply class="root-comment" v-bind="{ threadId }" @replied="handleReplied" />
  </div>
</template>

<script>
import Button from './forms/Button.vue'
import api from '@/api'
import Comment from '@/components/Comment'
import CommentReply from '@/components/CommentReply'
import Loader from '@/components/Loader'

export default {
  name: 'Discussion',
  components: {
    Comment,
    CommentReply,
    Loader,
    Button,
  },
  props: {
    threadId: { required: true, type: Number },
  },
  data() {
    return {
      comments: [],
      offset: 0,
      count: 0,
      isLoading: false,
    }
  },
  computed: {
    hasMore() {
      return this.count > this.comments.length
    },
  },
  async created() {
    if (this.threadId) {
      this.fetchItems(0)
    }
  },
  methods: {
    async fetchItems(offset, limit = 5) {
      this.isLoading = true
      const { results, count } = await api.getCommentsByThreadId(this.threadId, {
        offset,
        limit,
      })
      this.comments = [...this.comments, ...results]
      this.offset = this.offset + results.length
      this.count = count
      this.isLoading = false
    },
    async handleReplied() {
      this.isLoading = true
      setTimeout(() => {
        this.fetchItems(this.offset, 1).then(() => {
          this.isLoading = false
        })
      }, 1000)
    },
    onVisible({ going }) {
      // TODO: Make paginated loading util
      if (going === 'in' && this.hasMore) {
        this.fetchItems(this.offset)
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.discussion {
  margin-top: 2rem;
  margin-bottom: 6rem;
  .root-comment {
    margin-top: 1rem;
  }
}
</style>

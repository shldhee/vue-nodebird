<template>
  <div>
    <div v-if="images.length === 0"></div>
    <div v-else-if="images.length === 1">
      <v-img
        :src="images[0].src.replace(/original\//, 'thumb/')"
        contain
        aspect-ratio="2"
        @click="zommImages"
      />
      <image-zoom v-if="imageZoomed" :close-modal="closeModal" :images="images" />
    </div>
    <div v-else-if="images.length === 2" style="display: flex">
      <v-img
        :src="images[0].src.replace(/original\//, 'thumb/')"
        contain
        aspect-ratio="2"
        style="flex: 1"
        @click="zommImages"
      />
      <v-img
        :src="images[1].src.replace(/original\//, 'thumb/')"
        contain
        aspect-ratio="2"
        style="flex: 1"
        @click="zommImages"
      />
      <image-zoom v-if="imageZoomed" :close-modal="closeModal" :images="images" />
    </div>
    <div v-else-if="images.length > 2" style="display: flex">
      <v-img
        :src="images[0].src.replace(/original\//, 'thumb/')"
        contain
        aspect-ratio="2"
        style="flex: 1"
        @click="zommImages"
      />
      <div
        @click="zommImages"
        style="flex: 1; align-items: center; justify-content: center; display: flex"
      >
        <div style="text-align: center">
          <v-icon>mdi-dots-horizontal</v-icon>
          <div>더보기</div>
        </div>
      </div>
    </div>
    <image-zoom v-if="imageZoomed" :close-modal="closeModal" :images="images" />
  </div>
</template>

<script>
import ImageZoom from '@/components/ImageZoom.vue'
export default {
  components: {
    ImageZoom
  },
  props: {
    images: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      imageZoomed: false
    }
  },
  methods: {
    closeModal() {
      this.imageZoomed = false
    },
    zommImages() {
      this.imageZoomed = true
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
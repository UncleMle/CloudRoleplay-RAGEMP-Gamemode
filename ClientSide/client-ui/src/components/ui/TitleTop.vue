<template>
    <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-400/40 pl-4"><i :class="icon" class="text-gray-400"></i> {{ title }}</h1>
</template>

<script>
export default {
    props: ['icon', 'title']
}
</script>
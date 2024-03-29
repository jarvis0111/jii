<script setup lang="ts">
const route = useRoute()
const app = useAppConfig()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const fullTitle = computed(() => {
  const titleChunk = route.meta?.title ?? ''
  return titleChunk
    ? `${titleChunk} - ${settings.value?.site_name || ''}`
    : `${settings.value?.site_name || ''}`
})

const logoURL = computed(
  () =>
    settings.value?.logo ||
    settings.value?.card_logo ||
    '/img/placeholder-logo.png',
)

useHead({
  title: fullTitle,
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk}` : ``
  },
  htmlAttrs: {
    lang: 'en',
    dir: 'ltr',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: logoURL.value,
    },
  ],
  meta: [
    {
      name: 'description',
      content:
        route.meta?.description ??
        `${
          settings.value?.site_name || app.mash.title
        } is a cryptocurrency exchange platform, where you can trade Bitcoin, Ethereum, Litecoin, and other cryptocurrencies.`,
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'og:image:type',
      content: 'image/png',
    },
    {
      name: 'og:image:width',
      content: '1200',
    },
    {
      name: 'og:image:height',
      content: '630',
    },
    {
      name: 'og:image',
      content: logoURL.value,
    },
  ],
})

const { primaryPresets, mutedPresets } = useColors()
useLayoutSwitcher(settings.value?.default_layout)
const checkAndSwitchColorShades = (colorName, presets, presetName) => {
  const preset = presets.find((p) => p.name === presetName)
  if (preset) {
    Object.keys(preset.shades).forEach((shade) => {
      if (!localStorage.getItem(`color-${colorName}-${shade}`)) {
        switchColor(colorName, shade, preset.shades[shade])
      }
    })
  }
}

if (settings.value?.default_color) {
  checkAndSwitchColorShades(
    'primary',
    primaryPresets,
    settings.value.default_color,
  )
}

if (settings.value?.default_background_shader) {
  checkAndSwitchColorShades(
    'muted',
    mutedPresets,
    settings.value.default_background_shader,
  )
}

const darkModeStore = useDarkModeStore()
if (settings.value?.default_mode) {
  darkModeStore.setDarkMode(settings.value.default_mode === 'Dark')
}
</script>

<template>
  <div>
    <AppLayoutSwitcher />
    <NuxtLayout
      :transition="{
        name: 'slide',
        mode: 'out-in',
      }"
    >
      <NuxtLoadingIndicator color="rgb(var(--color-primary-500))" />
      <NuxtPage
        :transition="{
          name: 'slide-left',
          mode: 'out-in',
        }"
      />
    </NuxtLayout>
  </div>
</template>

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translate(50px, 0);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translate(-50px, 0);
}
.slide-right-enter-from {
  opacity: 0;
  transform: translate(-50px, 0);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translate(50px, 0);
}
</style>

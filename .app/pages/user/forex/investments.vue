<script setup lang="ts">
import { useForexInvestmentStore } from '~~/store/extensions/forex/investment'
definePageMeta({
  title: 'Forex Investments',
})

const forexInvestmentStore = useForexInvestmentStore()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  forexInvestmentStore.investments.filter((item) =>
    item.uuid.includes(filter.value),
  ),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (forexInvestmentStore.investments.length === 0) {
    forexInvestmentStore.loading = true
    await forexInvestmentStore.fetchInvestments()
    forexInvestmentStore.loading = false
  }
})

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'ACTIVE':
      return 'success'
    case 'COMPLETED':
      return 'info'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
  }
}
</script>

<template>
  <div class="relative">
    <MashContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter investments UUID..."
        />
      </template>
      <template #right>
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <div>
        <template v-if="paginatedItems?.length === 0">
          <BasePlaceholderPage
            :title="
              filter && filter !== '' ? 'No matching results' : 'No results'
            "
            :subtitle="
              filter && filter !== ''
                ? 'Looks like we couldn\'t find any matching results for your search terms. Try other search terms.'
                : 'Looks like we don\'t have any data here yet.'
            "
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </template>
        <div v-else class="w-full">
          <MashFlexTable class="pt-5">
            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Investment"
                  :hide-label="index > 0"
                  :picture="item.plan?.image"
                  :title="`${item.plan?.name}`"
                  :subtitle="item.uuid"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Amount"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  >{{ item.amount }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="statusClass(item.status)"
                    flavor="pastel"
                    condensed
                    >{{ item.status }}</BaseTag
                  >
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="End Date"
                  :hide-label="index > 0"
                  class="xs:w-full text-xs"
                  >{{ formatDate(item.end_date) }}
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </MashFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length"
            :current-page="page"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </MashContentWrapper>
  </div>
</template>

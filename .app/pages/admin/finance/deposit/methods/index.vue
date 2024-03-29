<script setup lang="ts">
import { useDepositMethodStore } from '~~/store/admin/deposit/methods'
import type { DepositMethod } from '~~/types'
definePageMeta({
  permissions: ['Access Deposit Methods'],
  title: 'Deposit Methods',
})

const depositMethodStore = useDepositMethodStore()
const { deleteDepositMethod } = useWallet()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const selected = ref<number[]>([])
const isAllVisibleSelected = computed(
  () => selected.value.length === depositMethodStore.methods.length,
)

const items = computed(() =>
  depositMethodStore.methods.filter((item) =>
    item.title.includes(filter.value),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = items.value.map((item) => item.id) ?? []
  }
}

onMounted(async () => {
  if (depositMethodStore.methods.length === 0) {
    depositMethodStore.loading = true
    await depositMethodStore.fetchDepositMethods()
    depositMethodStore.loading = false
  }
})
const { toast } = useUtils()

function updateSelectedDepositMethodStatus(status: boolean) {
  depositMethodStore
    .updateDepositMethodsStatus(selected.value, status)
    .then((response) => {
      if (response.status) {
        toast.success(response as any)
      } else {
        toast.danger(response as any)
      }
      selected.value = []
    })
}

const router = useRouter()

function selectMethod(method: DepositMethod) {
  depositMethodStore.selectMethod(method)
  router.push(`/admin/finance/deposit/methods/edit/${method.id}`)
}

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedMethod = ref<DepositMethod | null>(null)

function openDeleteModal(item: any) {
  selectedMethod.value = item
  isDeleteOpen.value = true
}

async function deleteMethod() {
  isDeleting.value = true
  try {
    const response = await deleteDepositMethod(selectedMethod.value?.id)
    toast.response(response)
    if (response.status) {
      depositMethodStore.methods = depositMethodStore.methods.filter(
        (method) => method.id !== selectedMethod.value?.id,
      )
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedMethod.value = null
}
</script>

<template>
  <div>
    <MashContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter methods..."
        />
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
      <template #right>
        <BaseButton
          color="primary"
          :to="`/admin/finance/deposit/methods/create`"
        >
          <Icon name="lucide:plus" size="16" class="mr-2" />
          {{ $t('Create') }}</BaseButton
        >
      </template>
      <div>
        <template
          v-if="!depositMethodStore.loading && paginatedItems?.length === 0"
        >
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
          <div
            class="bg-info-100 text-info-700 dark:bg-info-900 dark:text-info-100 rounded-lg p-4 flex justify-between items-center w-full mb-2"
            v-if="!depositMethodStore.loading && selected.length > 0"
          >
            <span class="text-sm">
              {{ $t('You have selected') }} {{ selected.length }}
              {{ $t('items of the total') }} {{ items.length }}
              {{ $t('items') }}.
            </span>
            <div class="flex gap-2">
              <MashButtonIcon
                color="danger"
                size="xs"
                data-nui-tooltip="Disable currencies"
                @click="() => updateSelectedDepositMethodStatus(false)"
              >
                <Icon name="line-md:close-small" class="h-5 w-5" />
              </MashButtonIcon>
              <MashButtonIcon
                color="success"
                size="xs"
                data-nui-tooltip="Enable currencies"
                @click="() => updateSelectedDepositMethodStatus(true)"
              >
                <Icon name="line-md:confirm" class="h-5 w-5" />
              </MashButtonIcon>
            </div>
          </div>
          <MashFlexTable>
            <template #header>
              <div class="relative">
                <span class="pl-4">
                  <BaseCheckbox
                    :model-value="isAllVisibleSelected"
                    :indeterminate="
                      selected.length > 0 && !isAllVisibleSelected
                    "
                    @click="toggleAllVisibleSelection"
                  />
                </span>
              </div>
            </template>

            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableCell
                  data-content="Selection"
                  class="xs:absolute right-2 ml-2"
                >
                  <BaseCheckbox
                    v-model="selected"
                    :value="item.id"
                    :name="`item-checkbox-${item.id}`"
                    shape="rounded"
                    class="text-primary-500"
                  />
                </TableFlexTableCell>
                <TableFlexTableStart
                  label="Method"
                  :hide-label="index > 0"
                  :picture="item.image"
                  :title="item.title"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Fixed Fee"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  >{{ item.fixed_fee }}</TableFlexTableCell
                >
                <TableFlexTableCell
                  label="% Fee"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  >{{ item.percentage_fee }}%</TableFlexTableCell
                >
                <TableFlexTableCell
                  label="Min / Max"
                  :hide-label="index > 0"
                  class="w-40 xs:w-full"
                  >{{ item.min_amount }} /
                  {{ item.max_amount }}</TableFlexTableCell
                >
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="item.status ? 'success' : 'danger'"
                    flavor="pastel"
                    condensed
                    >{{ item.status ? 'Active' : 'Disabled' }}</BaseTag
                  >
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      @click="selectMethod(item)"
                      title="Edit Method"
                    >
                      <template #start>
                        <Icon
                          name="line-md:edit-twotone"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>

                    <BaseDropdownItem
                      @click="openDeleteModal(item)"
                      title="Delete Method"
                    >
                      <template #start>
                        <Icon name="line-md:close" class="me-2 block h-5 w-5" />
                      </template>
                    </BaseDropdownItem>
                  </BaseDropdown>
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
    <MashModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ $t('Deposit Method') }}
          </h3>
          <BaseButtonClose @click="isDeleteOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure?') }}
          </h3>
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Do you really want to delete this') }}
            {{ $t('deposit method') }}
            {{ $t('This process cannot be undone') }}.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isDeleteOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="deleteMethod()"
              :disabled="isDeleting"
              :loading="isDeleting"
            >
              {{ $t('Delete') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </MashModal>
  </div>
</template>

<script setup lang="ts">
import { useAdminEcommerceCategoriesStore } from '~~/store/extensions/ecommerce/admin/categories'
import type { EcommerceCategory } from '~~/types'

definePageMeta({
  permissions: ['View Ecommerce Categories'],
  title: 'Ecommerce Categories',
})

const adminCategoriesStore = useAdminEcommerceCategoriesStore()
const { deleteAdminCategory } = useEcommerce()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1', 10))

const items = computed(() => {
  return adminCategoriesStore.categories.filter((item) =>
    item.name.toLowerCase().includes(filter.value.toLowerCase()),
  )
})

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (adminCategoriesStore.categories.length === 0) {
    adminCategoriesStore.loading = true
    await adminCategoriesStore.fetchCategories()
    adminCategoriesStore.loading = false
  }
})

const { toast } = useUtils()
const router = useRouter()

function selectCategory(item: EcommerceCategory) {
  adminCategoriesStore.selectCategory(item)
  router.push(`/admin/extensions/ecommerce/categories/edit/${item.id}`)
}

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref<EcommerceCategory | null>(null)

function openDeleteModal(item: EcommerceCategory) {
  selectedItem.value = item
  isDeleteOpen.value = true
}

async function deleteCategoryById() {
  if (!selectedItem.value) return
  isDeleting.value = true
  try {
    const response = await deleteAdminCategory(selectedItem.value.id)
    toast.response(response)
    if (response.status) {
      adminCategoriesStore.removeCategory(selectedItem.value.id)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedItem.value = null
}

const statusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'INACTIVE':
      return 'danger'
    default:
      return 'neutral'
  }
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
          placeholder="Filter categories..."
        />
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </BaseSelect>
      </template>
      <template #right>
        <BaseButton
          color="primary"
          :to="`/admin/extensions/ecommerce/categories/create`"
        >
          <Icon name="lucide:plus" size="16" class="mr-2" />
          Create Category
        </BaseButton>
      </template>
      <div v-if="!adminCategoriesStore.loading && paginatedItems.length === 0">
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
      </div>
      <div v-else class="w-full">
        <MashFlexTable class="pt-5">
          <TableFlexTableRow
            v-for="(item, index) in paginatedItems"
            :key="item.id"
            spaced
          >
            <template #start>
              <TableFlexTableStart
                label="Category"
                :hide-label="index > 0"
                :title="item.name"
                :subtitle="item.description"
              />
            </template>
            <template #end>
              <TableFlexTableCell
                label="Status"
                :hide-label="index > 0"
                class="w-20 xs:w-full"
              >
                <BaseTag
                  :color="statusClass(item.status)"
                  flavor="pastel"
                  condensed
                >
                  {{ item.status }}
                </BaseTag>
              </TableFlexTableCell>
              <TableFlexTableCell label="Actions" :hide-label="index > 0">
                <BaseDropdown
                  flavor="context"
                  label="Dropdown"
                  orientation="end"
                >
                  <BaseDropdownItem
                    @click="selectCategory(item)"
                    title="Edit Category"
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
                    title="Delete Category"
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
        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length"
            :current-page="page"
            :items-per-page="perPage"
          />
        </div>
      </div>
    </MashContentWrapper>
    <MashModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="text-lg font-medium leading-6">Delete Category</h3>
          <BaseButtonClose @click="isDeleteOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3 class="text-lg font-medium leading-6">Are you sure?</h3>
          <p class="text-sm leading-5 mb-3">
            Do you really want to delete this category? This process cannot be
            undone.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isDeleteOpen = false"> Cancel </BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="deleteCategoryById"
              :disabled="isDeleting"
              :loading="isDeleting"
            >
              Delete
            </BaseButton>
          </div>
        </div>
      </template>
    </MashModal>
  </div>
</template>

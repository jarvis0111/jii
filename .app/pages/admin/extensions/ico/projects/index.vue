<script setup lang="ts">
import { useIcoProjectStore } from '~~/store/extensions/ico/admin/projects'
import type { IcoProject } from '~~/types'
definePageMeta({
  permissions: ['View ICO Projects'],
  title: 'ICO Projects',
})

const icoProjectStore = useIcoProjectStore()
const { deleteIcoProject } = useIco()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(
  () =>
    icoProjectStore.projects.filter((item) =>
      item.name.includes(filter.value),
    ) ?? [],
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (icoProjectStore.projects.length === 0) {
    icoProjectStore.loading = true
    await icoProjectStore.fetchIcoProjects()
    icoProjectStore.loading = false
  }
})
const { toast } = useUtils()

const router = useRouter()

function selectProject(item: IcoProject) {
  icoProjectStore.selectProject(item)
  router.push(`/admin/extensions/ico/projects/edit/${item.id}`)
}

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref(null)

function openDeleteModal(item: any) {
  selectedItem.value = item
  isDeleteOpen.value = true
}

async function deleteProject() {
  isDeleting.value = true
  try {
    const response = await deleteIcoProject(selectedItem.value?.id)
    toast.response(response)
    if (response.status) {
      icoProjectStore.removeProject(selectedItem.value?.id)
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
  <div>
    <MashContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter projects..."
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
          :to="`/admin/extensions/ico/projects/create`"
        >
          <Icon name="lucide:plus" size="16" class="mr-2" />
          {{ $t('Create') }}</BaseButton
        >
      </template>
      <div>
        <template
          v-if="!icoProjectStore?.loading && paginatedItems?.length === 0"
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
          <MashFlexTable class="pt-5">
            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Item"
                  :hide-label="index > 0"
                  :picture="item.image"
                  :title="item.name"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Tokens"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  >{{ item.tokens?.length ?? 0 }}
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
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      @click="selectProject(item)"
                      title="Edit Project"
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
                      title="Delete Project"
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
            {{ $t('Delete') }} {{ $t('ICO Project') }}
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
            {{ $t('project') }}
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
              @click="deleteProject()"
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

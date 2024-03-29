<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useEcosystemAdminTokenStore } from '~~/store/extensions/ecosystem/tokens/admin'
import { useIcoTokenStore } from '~~/store/extensions/ico/admin/tokens'
import { toTypedSchema } from '@vee-validate/zod'
import type { IcoTokenStatus } from '~~/types'

definePageMeta({
  title: 'Edit ICO Token',
  permissions: ['Edit ICO Tokens'],
})
const { toast } = useUtils()
const router = useRouter()
const { id } = useRoute().params

const icoTokenStore = useIcoTokenStore()
const { updateIcoToken } = useIco()

const existingToken = computed(
  () => icoTokenStore.selectedToken || icoTokenStore.getTokenById(id),
)

const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensions)
const ecosystemExtension = computed(
  () => extensions.value?.find((extension) => extension.name === 'ecosystem'),
)
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const currencyStore = useCurrencyStore()
const currencies = computed(() => currencyStore.currencies)

const ecosystemAdminTokenStore = useEcosystemAdminTokenStore()
const ecoCurrencies = computed(() => ecosystemAdminTokenStore.tokens)

const validWalletTypes: string[] = []

onMounted(async () => {
  const methodId = Number(id)
  if (icoTokenStore.tokens.length === 0) {
    await icoTokenStore.fetchIcoTokens()
  }
  await icoTokenStore.selectTokenById(methodId)
  imagePreviewUrl.value = existingToken.value?.image || null

  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensions()
  }
  if (settings.value?.spot_exchange) {
    validWalletTypes.push('SPOT')
    if (currencyStore.currencies.length === 0) {
      await currencyStore.fetchCurrencies()
    }
  }
  if (ecosystemExtension.value?.status) {
    validWalletTypes.push('ECO')
    if (ecosystemAdminTokenStore.tokens.length === 0) {
      await ecosystemAdminTokenStore.fetchTokensAll()
    }
  }
  resetForm()
})

const availablePurchaseCurrencies = computed(() => {
  let allCurrencies: string[] = []
  if (values.purchase_wallet_type === 'SPOT') {
    allCurrencies = currencies.value.map((item) => item.currency)
  } else if (values.purchase_wallet_type === 'ECO') {
    allCurrencies = ecoCurrencies.value.map((item) => item.currency)
  }

  // Use a Set to remove duplicates and then spread it into an array
  const uniqueCurrencies = [...new Set(allCurrencies)]
  return uniqueCurrencies
})

// Validation
const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  chain: z.string().nonempty('Chain is required'),
  currency: z.string().nonempty('Currency is required'),
  purchase_currency: z.string().nonempty('Purchase currency is required'),
  address: z.string().nonempty('Address is required'),
  total_supply: z.number().min(0, 'Total supply must be greater than 0'),
  description: z.string().nonempty('Description is required'),
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
  project_id: z.object({
    label: z.string(),
    value: z.number(),
  }),
  purchase_wallet_type: z.enum(validWalletTypes),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => {
  return {
    ...existingToken.value,
    project_id: {
      label: existingToken.value?.project.name,
      value: existingToken.value?.project.id,
    },
  }
})

const { handleSubmit, isSubmitting, resetForm, setFieldValue, values } =
  useForm({
    validationSchema: toTypedSchema(zodSchema),
    initialValues,
  })

// Watch for changes in wallet type to reset purchase currency
watch(
  () => values.purchase_wallet_type,
  (newWalletType) => {
    if (newWalletType) {
      setFieldValue('purchase_currency', '')
    }
  },
)

// Image File Handling
const imageFile = ref<FileList | null>(null)
const imagePreviewUrl = ref<string | null>(existingToken.value?.image || null)

watch(imageFile, (value) => {
  const file = value?.item(0) || null
  if (imageFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
})

// Edit Method
const { uploadFile } = useAuth()
const update = handleSubmit(async (values: FormInput) => {
  try {
    let data = {
      ...values,
      image: imagePreviewUrl.value ?? '',
    }

    if (imageFile.value) {
      const uploadResponse = await uploadFile(
        'ico-tokens',
        [imageFile.value[0]],
        existingToken.value?.image ? existingToken.value?.image : undefined,
      )

      // Check if the upload was successful and get the URL
      if (uploadResponse.status) {
        // Set the new image URL in the form values
        data.image = uploadResponse.data[0]
      }
    }

    const response = await updateIcoToken(
      Number(id),
      Number(data.project_id.value),
      data.name,
      data.chain,
      data.currency,
      data.purchase_currency,
      data.purchase_wallet_type,
      data.address,
      data.total_supply,
      data.description,
      data.image,
      data.status as IcoTokenStatus,
    )
    toast.response(response)
    if (response.status) {
      await icoTokenStore.fetchIcoTokens()
      router.push('/admin/extensions/ico/tokens')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <MashContentWrapper>
    <template #left>
      <BaseHeading size="lg" :key="existingToken?.name">{{
        $t(`
        Editing ${existingToken?.name ?? 'ICO Token'} Token
      `)
      }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        to="/admin/extensions/ico/tokens"
      >
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
      <BaseButton
        type="submit"
        color="primary"
        :disabled="isSubmitting"
        class="w-full"
        @click="update"
      >
        {{ $t('Update Token') }}
      </BaseButton>
    </template>
    <form @submit="update" class="space-y-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <BaseCard class="p-5 space-y-5">
          <!-- Name -->
          <Field
            name="name"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Name"
              placeholder="Enter name"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Currency -->
          <Field
            name="currency"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Currency"
              placeholder="Enter currency"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </BaseCard>

        <BaseCard class="p-5">
          <!-- Image Upload Section -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <BaseInputFileHeadless
              v-model="imageFile"
              v-slot="{ open, remove, preview, drop, files }"
            >
              <div
                class=""
                @dragenter.stop.prevent
                @dragover.stop.prevent
                @drop="drop"
              >
                <div
                  v-if="!files?.length"
                  class="nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed transition-colors duration-300"
                  tabindex="0"
                  role="button"
                  @click="open"
                  @keydown.enter.prevent="open"
                >
                  <div class="p-5 text-center">
                    <Icon
                      name="mdi-light:cloud-upload"
                      class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"
                    />

                    <h4 class="text-muted-400 font-sans text-sm">
                      {{ $t('Drop file to upload') }}
                    </h4>

                    <div>
                      <span
                        class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"
                      >
                        {{ $t('Or') }}
                      </span>
                    </div>

                    <label
                      for="file"
                      class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                    >
                      {{ $t('Select Image') }}
                    </label>
                  </div>
                </div>

                <ul v-else class="mt-6 space-y-2">
                  <li v-for="file in files" :key="file.name">
                    <div
                      class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"
                    >
                      <div class="flex items-center gap-2">
                        <div class="shrink-0">
                          <img
                            class="h-14 w-14 rounded-xl object-cover object-center"
                            v-if="file.type.startsWith('image')"
                            :src="preview(file).value"
                            alt="Image preview"
                          />

                          <img
                            v-else
                            class="h-14 w-14 rounded-xl object-cover object-center"
                            src="/img/avatars/placeholder-file.png"
                            alt="Image preview"
                          />
                        </div>

                        <div class="font-sans">
                          <span
                            class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                          >
                            {{ file.name }}
                          </span>

                          <span class="text-muted-400 block text-xs">
                            {{ formatFileSize(file.size) }}
                          </span>
                        </div>
                      </div>

                      <div
                        class="ms-auto w-32 px-4 transition-opacity duration-300"
                        :class="'opacity-100'"
                      >
                        <BaseProgress :value="0" size="xs" :color="'success'" />
                      </div>

                      <div class="flex gap-2">
                        <button
                          class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled
                          type="button"
                          tooltip="Cancel"
                        >
                          <Icon name="lucide:slash" class="h-4 w-4" />

                          <span class="sr-only">Cancel</span>
                        </button>

                        <button
                          class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                          type="button"
                          tooltip="Upload"
                        >
                          <Icon name="lucide:arrow-up" class="h-4 w-4" />

                          <span class="sr-only">Upload</span>
                        </button>

                        <button
                          class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                          type="button"
                          tooltip="Remove"
                          @click.prevent="remove(file)"
                        >
                          <Icon name="lucide:x" class="h-4 w-4" />

                          <span class="sr-only">Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </BaseInputFileHeadless>
            <div
              v-if="imagePreviewUrl"
              class="mb-4 h-36 w-full flex items-center justify-center overflow-hidden rounded-xl"
            >
              <img
                :src="imagePreviewUrl"
                alt="Image Preview"
                class="max-h-full max-w-full object-cover object-center"
              />
            </div>
          </div>
        </BaseCard>
      </div>

      <BaseCard class="p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Project -->
          <Field
            name="project_id"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="
                projects?.map((project) => ({
                  label: project.name,
                  value: project.id,
                }))
              "
              :properties="{ label: 'label', value: 'value' }"
              placeholder="Select a project"
              label="Project"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <!-- Chain -->
          <Field
            name="chain"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Chain"
              placeholder="Enter chain"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Address -->
          <Field
            name="address"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Address"
              placeholder="Enter address"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Total Supply -->
          <Field
            name="total_supply"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Total Supply"
              placeholder="Enter total supply"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            name="purchase_wallet_type"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="validWalletTypes"
              label="Purchase Wallet Type"
              placeholder="Select wallet type"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- purchase currency -->
          <Field
            name="purchase_currency"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="availablePurchaseCurrencies"
              label="Purchase Currency"
              placeholder="Select purchase currency"
              :disabled="
                !values?.purchase_wallet_type ||
                values?.purchase_wallet_type === ''
              "
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            name="status"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']"
              placeholder="Select a status"
              label="Status"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </BaseCard>

      <BaseCard class="p-5">
        <!-- Description -->
        <Field
          name="description"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseTextarea
            v-model="field.value"
            :error="errorMessage"
            label="Description"
            shape="rounded"
            placeholder="Write a description"
            class="w-full"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
      </BaseCard>

      <MashFormSave>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ $t('Update Token') }}
        </BaseButton>
      </MashFormSave>
    </form>
  </MashContentWrapper>
</template>

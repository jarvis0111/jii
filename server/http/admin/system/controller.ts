import fs from 'fs'
import * as diskInfo from 'node-disk-info'
import os from 'os'
import pidusage from 'pidusage'
import { handleController } from '~~/utils'
import {
  activateLicense,
  checkLatestVersion,
  checkUpdate,
  downloadUpdate,
  getProduct,
  verifyLicense,
} from '~~/utils/api'
import { getExtensionsQuery, updateExtensionStatusQuery } from './queries'

const rootPath = `${process.cwd()}/.app`

export const controllers = {
  getServerDetails: handleController(async () => {
    const processStats = await pidusage(process.pid)
    const totalMemory = os.totalmem()
    const cpus = os.cpus()
    const disks = await diskInfo.getDiskInfoSync()
    const hostname = os.hostname()
    const osType = os.type()
    const osRelease = os.release()

    // Assuming you want to get the info about the first disk
    const disk = disks.length > 0 ? disks[0] : null

    const storageDetails = disk
      ? {
          totalSize: disk.blocks,
          usedSize: disk.used,
          availableSize: disk.available,
          usagePercent: parseFloat(
            ((disk.used / disk.blocks) * 100).toFixed(2),
          ),
        }
      : null

    return {
      ...processStats,
      totalMemory,
      cpuDetails: {
        count: cpus.length,
        model: cpus[0].model,
        speed: cpus[0].speed,
      },
      hostname,
      os: `${osType} ${osRelease}`,
      storageDetails,
    }
  }),
  index: handleController(async () => {
    return getExtensionsQuery()
  }),
  updateStatus: handleController(async (_, __, ___, ____, body) => {
    return updateExtensionStatusQuery(body.productId, body.status)
  }),
  checkLatestVersion: handleController(async (_, __, ___, ____, body) => {
    return checkLatestVersion(body.productId)
  }),
  checkUpdate: handleController(async (_, __, ___, ____, body) => {
    return checkUpdate(body.productId, body.currentVersion)
  }),
  verifyLicense: handleController(async (_, __, ___, ____, body) => {
    return verifyLicense(body.productId, body.purchaseCode, body.envatoUsername)
  }),
  activateLicense: handleController(async (_, __, ___, ____, body) => {
    return activateLicense(
      body.productId,
      body.purchaseCode,
      body.envatoUsername,
    )
  }),
  downloadUpdate: handleController(async (_, __, ___, ____, body) => {
    return downloadUpdate(
      body.productId,
      body.updateId,
      body.version,
      body.product,
      body.type,
    )
  }),
  getProduct: handleController(async (_, __, params) => {
    return getProduct(params.name)
  }),
  updateNavigation: handleController(async (_, __, ___, ____, body) => {
    return updateNavigation(body.data)
  }),
}

export async function updateNavigation(menu) {
  if (!menu) {
    throw new Error('Navigation menu is undefined')
  }

  // Read the current navigation data
  const filePath = `${rootPath}/data/navigation.json`
  const currentNavigation = readJSONFile(filePath)

  if (!currentNavigation) {
    throw new Error('Could not read navigation file')
  }

  // Write the updated navigation data back to the file
  const success = writeJSONFile(filePath, menu)

  if (!success) {
    throw new Error('Could not write navigation file')
  }

  return 'Navigation updated successfully'
}

function readJSONFile(filePath: string): any {
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error reading file: ${error.message}`)
    return null
  }
}

function writeJSONFile(filePath: string, data: any): boolean {
  if (!data) {
    console.error('Data is undefined or null')
    return false
  }

  try {
    const jsonData = JSON.stringify(data, null, 2)
    fs.writeFileSync(filePath, jsonData, 'utf-8')
    return true
  } catch (error) {
    console.error(`Error writing file: ${error.message}`)
    return false
  }
}

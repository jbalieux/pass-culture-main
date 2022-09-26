/* tslint:disable */
/* eslint-disable */
/**
 * pass Culture backoffice API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime'
import {
  Permission,
  PermissionFromJSON,
  PermissionFromJSONTyped,
  PermissionToJSON,
} from './index'

/**
 *
 * @export
 * @interface ListPermissionResponseModel
 */
export interface ListPermissionResponseModel {
  /**
   *
   * @type {Array<Permission>}
   * @memberof ListPermissionResponseModel
   */
  permissions: Array<Permission>
}

export function ListPermissionResponseModelFromJSON(
  json: any
): ListPermissionResponseModel {
  return ListPermissionResponseModelFromJSONTyped(json, false)
}

export function ListPermissionResponseModelFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ListPermissionResponseModel {
  if (json === undefined || json === null) {
    return json
  }
  return {
    permissions: (json['permissions'] as Array<any>).map(PermissionFromJSON),
  }
}

export function ListPermissionResponseModelToJSON(
  value?: ListPermissionResponseModel | null
): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    permissions: (value.permissions as Array<any>).map(PermissionToJSON),
  }
}